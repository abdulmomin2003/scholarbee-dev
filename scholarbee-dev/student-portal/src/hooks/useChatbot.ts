import { useCallback, useState } from 'react';
import Cookies from 'js-cookie';
import { API_URL_DEV } from '@/constants/config';

interface ChatbotSource {
  text: string;
  score: number;
  metadata?: unknown;
}

export interface ChatbotResponse {
  answer: string;
  sources: ChatbotSource[];
  message: string;
  sessionId?: string;
}

export interface ChatbotGreeting {
  firstName: string;
  greeting: string;
  intro: string;
}

interface UseChatbotReturn {
  sendQuery: (query: string) => Promise<ChatbotResponse>;
  fetchGreeting: () => Promise<ChatbotGreeting | null>;
  clearSession: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function getAuthHeaders(): HeadersInit {
  const token = Cookies.get('access_token');
  if (!token) {
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function getApiBase(): string {
  const chatbotOverride = process.env.NEXT_PUBLIC_CHATBOT_API_URL?.trim();
  const raw =
    chatbotOverride ||
    process.env.NEXT_PUBLIC_API_URL ||
    API_URL_DEV ||
    'http://localhost:3010/api';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    const msg = body?.message;
    const text = Array.isArray(msg)
      ? msg.join(', ')
      : typeof msg === 'string'
        ? msg
        : '';
    if (text.trim()) {
      if (
        response.status === 404 &&
        text.includes('Cannot POST') &&
        text.includes('/api/chatbot')
      ) {
        return (
          'BeeBot is not available on this API yet. For local dev, run backend-api ' +
          '(npm run start:dev on port 3010) and set NEXT_PUBLIC_CHATBOT_API_URL=http://localhost:3010/api ' +
          'in student-portal/.env.local, then restart the portal.'
        );
      }
      return text;
    }
  } catch {
    // ignore JSON parse errors
  }
  return response.statusText || `Request failed (${response.status})`;
}

function chatbotPath(suffix: string): string {
  const base = getApiBase();
  if (base.endsWith('/api')) {
    return `${base}/chatbot${suffix}`;
  }
  return `${base}/api/chatbot${suffix}`;
}

/**
 * BeeBot API client — authenticated requests to backend-api /api/chatbot.
 */
export const useChatbot = (sessionId: string): UseChatbotReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendQuery = useCallback(
    async (query: string): Promise<ChatbotResponse> => {
      if (!query?.trim()) {
        throw new Error('Query cannot be empty');
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(chatbotPath('/query'), {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            query: query.trim(),
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error(await parseErrorMessage(response));
        }

        return (await response.json()) as ChatbotResponse;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId],
  );

  const fetchGreeting = useCallback(async (): Promise<ChatbotGreeting | null> => {
    try {
      const response = await fetch(chatbotPath('/greeting'), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as ChatbotGreeting;
    } catch {
      return null;
    }
  }, []);

  const clearSession = useCallback(async (): Promise<void> => {
    if (!sessionId) {
      return;
    }

    try {
      await fetch(chatbotPath(`/session/${encodeURIComponent(sessionId)}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    }
  }, [sessionId]);

  return { sendQuery, fetchGreeting, clearSession, isLoading, error };
};
