import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as path from 'path';
import * as readline from 'readline';
import { Types } from 'mongoose';
import { IConfiguration } from 'src/config/configuration';
import { ChatbotConversationService } from './chatbot-conversation.service';

export interface ChatbotResponse {
  answer: string;
  sources: Array<{
    text: string;
    score: number;
    metadata?: unknown;
  }>;
  message: string;
  intent?: string;
  sessionId?: string;
}

interface WorkerRequest {
  id: string;
  action: 'query' | 'clear_session' | 'health';
  query?: string;
  sessionId?: string;
  studentId?: string | null;
  userFirstName?: string | null;
  history?: Record<string, unknown>[];
}

interface WorkerResponse {
  id: string;
  ok: boolean;
  result?: unknown;
  error?: string;
}

@Injectable()
export class ChatbotService {
  private workerProcess: ChildProcessWithoutNullStreams | null = null;
  private workerReady: Promise<void> | null = null;
  private requestCounter = 0;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: WorkerResponse) => void;
      reject: (reason?: unknown) => void;
    }
  >();
  private readonly workerStartupTimeoutMs = 15000;

  constructor(
    private readonly configService: ConfigService<IConfiguration>,
    private readonly conversationService: ChatbotConversationService,
  ) {}

  /** Python worker lives beside src/ under backend-api/chatbot-python/ */
  private getWorkerScriptPath(): string {
    return path.resolve(process.cwd(), 'chatbot-python', 'chatbot_worker.py');
  }

  private getWorkerDirectoryPath(): string {
    return path.resolve(process.cwd(), 'chatbot-python');
  }

  private getPythonExecutable(): string {
    return (
      this.configService.get('chatbot.pythonExecutable', { infer: true }) ??
      'python'
    );
  }

  /** Extract database name from MongoDB URI path segment */
  private getPlatformDbName(): string {
    const explicit = this.configService.get('chatbot.platformDbName', {
      infer: true,
    });
    if (explicit) {
      return explicit;
    }

    const uri =
      this.configService.get('database.uri', { infer: true }) ??
      'mongodb://localhost:27017/test';
    try {
      const pathname = new URL(uri).pathname.replace(/^\//, '');
      const name = pathname.split('?')[0];
      return name || 'test';
    } catch {
      return 'test';
    }
  }

  private buildWorkerEnv(): NodeJS.ProcessEnv {
    const platformUri =
      this.configService.get('database.uri', { infer: true }) ??
      'mongodb://localhost:27017/test';
    const platformDb =
      this.configService.get('chatbot.platformDbName', { infer: true }) ??
      this.getPlatformDbName();
    const kbUri = this.configService.get('chatbot.kbMongoUri', { infer: true });
    const kbDb = this.configService.get('chatbot.kbMongoDb', { infer: true });
    const geminiKey = this.configService.get('chatbot.geminiApiKey', {
      infer: true,
    });

    // Only pass chatbot-related vars — do not leak unrelated process.env into Python
    const workerEnv: NodeJS.ProcessEnv = {
      PYTHONUNBUFFERED: '1',
      PATH: process.env.PATH,
      SYSTEMROOT: process.env.SYSTEMROOT,
      MONGODB_URI: platformUri,
      MONGODB_DB: platformDb,
    };

    if (kbUri) {
      workerEnv.CHATBOT_KB_MONGODB_URI = kbUri;
    }
    if (kbDb) {
      workerEnv.CHATBOT_KB_MONGODB_DB = kbDb;
    }

    if (geminiKey) {
      workerEnv.GEMINI_API_KEY = geminiKey;
    } else {
      console.warn(
        '[Chatbot] GEMINI_API_KEY is missing from backend-api/.env — BeeBot queries will fail.',
      );
    }

    const geminiModel = process.env.GEMINI_MODEL?.trim();
    const geminiModelFallbacks = process.env.GEMINI_MODEL_FALLBACKS?.trim();
    if (geminiModel) {
      workerEnv.GEMINI_MODEL = geminiModel;
    }
    if (geminiModelFallbacks) {
      workerEnv.GEMINI_MODEL_FALLBACKS = geminiModelFallbacks;
    }

    return workerEnv;
  }

  private async ensureWorker(): Promise<void> {
    if (this.workerProcess && !this.workerProcess.killed) {
      return;
    }

    if (this.workerReady) {
      return this.workerReady;
    }

    this.workerReady = new Promise((resolve, reject) => {
      const scriptPath = this.getWorkerScriptPath();
      this.workerProcess = spawn(
        this.getPythonExecutable(),
        ['-u', scriptPath],
        {
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: this.getWorkerDirectoryPath(),
          env: this.buildWorkerEnv(),
        },
      );

      const worker = this.workerProcess;
      const cleanup = () => {
        worker.stdout?.removeAllListeners();
        worker.stderr?.removeAllListeners();
        worker.removeAllListeners();
      };

      const timeout = setTimeout(() => {
        cleanup();
        worker.kill();
        this.workerReady = null;
        reject(new Error('Chatbot worker startup timed out'));
      }, this.workerStartupTimeoutMs);

      const handleExit = (code: number | null, signal: NodeJS.Signals | null) => {
        clearTimeout(timeout);
        cleanup();
        this.workerProcess = null;
        this.workerReady = null;
        const message = `Chatbot worker exited unexpectedly (${code ?? 'null'}, ${signal ?? 'null'})`;
        for (const [requestId, pending] of this.pendingRequests.entries()) {
          pending.reject(new Error(message));
          this.pendingRequests.delete(requestId);
        }
        console.error(message);
      };

      worker.once('exit', handleExit);
      worker.once('error', (error) => {
        clearTimeout(timeout);
        cleanup();
        this.workerProcess = null;
        this.workerReady = null;
        reject(error);
      });

      if (!worker.stdout || !worker.stdin || !worker.stderr) {
        clearTimeout(timeout);
        cleanup();
        reject(new Error('Chatbot worker streams were not available'));
        return;
      }

      const rl = readline.createInterface({ input: worker.stdout });
      rl.on('line', (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return;
        }

        let parsed: WorkerResponse | null = null;
        try {
          parsed = JSON.parse(trimmed) as WorkerResponse;
        } catch (error) {
          console.error('Failed to parse chatbot worker response:', trimmed, error);
          return;
        }

        if (!parsed.id) {
          return;
        }

        const pending = this.pendingRequests.get(parsed.id);
        if (!pending) {
          return;
        }

        this.pendingRequests.delete(parsed.id);
        pending.resolve(parsed);
      });

      worker.stderr.on('data', (chunk: Buffer) => {
        const text = chunk.toString('utf8').trim();
        if (text) {
          console.error('[ChatbotWorker]', text);
        }
      });

      clearTimeout(timeout);
      resolve();
    });

    return this.workerReady;
  }

  /** Map worker / Gemini failures to text students can act on (logs keep full detail). */
  private toUserFacingAnswer(error: unknown): string {
    const message =
      error instanceof Error ? error.message : String(error ?? 'Unknown error');

    if (
      message.includes('429') ||
      message.includes('RESOURCE_EXHAUSTED') ||
      /depleted|quota|billing/i.test(message)
    ) {
      return (
        'BeeBot cannot reach the AI service right now — the Google Gemini API quota ' +
        'for this project is exhausted. Add credits in Google AI Studio or set a valid ' +
        'GEMINI_API_KEY in backend-api/.env, then restart the backend.'
      );
    }

    if (/GEMINI_API_KEY/i.test(message)) {
      return (
        'BeeBot is not configured: set GEMINI_API_KEY in backend-api/.env and restart the backend.'
      );
    }

    if (/Chatbot worker|startup timed out|not running/i.test(message)) {
      return (
        'BeeBot could not start on the server. Ensure Python dependencies are installed ' +
        '(pip install -r chatbot-python/requirements.txt) and restart npm run start:dev.'
      );
    }

    return 'BeeBot is temporarily unavailable. Please try again in a moment.';
  }

  private async sendWorkerRequest<T = unknown>(
    request: Omit<WorkerRequest, 'id'>,
  ): Promise<T> {
    await this.ensureWorker();

    const worker = this.workerProcess;
    if (!worker?.stdin || !worker.stdout) {
      throw new Error('Chatbot worker is not running');
    }

    const id = `${Date.now()}-${++this.requestCounter}`;
    const payload: WorkerRequest = { id, ...request };

    const responsePromise = new Promise<WorkerResponse>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
    });

    worker.stdin.write(`${JSON.stringify(payload)}\n`);

    const response = await responsePromise;
    if (!response.ok) {
      throw new Error(response.error || 'Chatbot worker request failed');
    }

    return response.result as T;
  }

  async processQuery(
    userQuery: string,
    sessionId: string,
    userId: Types.ObjectId,
    userFirstName?: string,
  ): Promise<ChatbotResponse> {
    const normalizedSessionId = sessionId?.trim() || `bee-${userId.toString()}`;

    try {
      const history = await this.conversationService.getHistory(
        normalizedSessionId,
        userId,
      );

      const result = await this.sendWorkerRequest<{
        answer?: string;
        sources?: ChatbotResponse['sources'];
        message?: string;
        sessionId?: string;
        history?: Record<string, unknown>[];
      }>({
        action: 'query',
        query: userQuery,
        sessionId: normalizedSessionId,
        studentId: userId.toString(),
        userFirstName: userFirstName?.trim() || null,
        history,
      });

      if (Array.isArray(result.history)) {
        await this.conversationService.saveHistory(
          normalizedSessionId,
          userId,
          result.history,
        );
      }

      return {
        answer: result.answer || 'Sorry, I could not generate a response.',
        sources: Array.isArray(result.sources) ? result.sources : [],
        message: result.message || 'Answer generated successfully',
        sessionId: result.sessionId || normalizedSessionId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error processing chatbot query through worker:', error);
      return {
        answer: this.toUserFacingAnswer(error),
        sources: [],
        message: errorMessage,
        sessionId: normalizedSessionId,
      };
    }
  }

  async clearSession(sessionId: string, userId: Types.ObjectId): Promise<void> {
    const normalizedSessionId = sessionId?.trim();
    if (!normalizedSessionId) {
      return;
    }

    await this.conversationService.clearSession(normalizedSessionId, userId);

    try {
      await this.sendWorkerRequest({
        action: 'clear_session',
        sessionId: normalizedSessionId,
      });
    } catch (error) {
      console.error('Error clearing chatbot worker session:', error);
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.sendWorkerRequest({ action: 'health' });
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error checking chatbot worker health:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
