import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { IRecommendedProgramResponse, ProgramFeatures } from '../types/recommendation.types';
import { MlShadowComparisonDocument, MlShadowComparison } from '../schemas/ml-shadow-comparison.schema';

export interface MLHealthStatus {
  status: string;
  model_loaded?: boolean;
  model_version?: string | null;
  bootstrap_mode?: boolean | null;
  auc_roc?: number | null;
  n_training_samples?: number | null;
  is_training?: boolean;
  last_training_error?: string | null;
}

export interface MLScoreResult {
  program_id: string;
  ml_score: number;
}

@Injectable()
export class MLScorerService {
  private readonly logger = new Logger(MLScorerService.name);
  
  private readonly mlServiceUrl: string;
  private readonly mlEnabled: boolean;
  private readonly shadowMode: boolean;
  private readonly timeoutMs: number;
  private readonly rolloutPct: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(MlShadowComparison.name)
    private readonly shadowModel: Model<MlShadowComparisonDocument>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    this.mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL', 'http://localhost:8002');
    this.mlEnabled = this.configService.get<boolean>('ML_ENABLED', false);
    this.shadowMode = this.configService.get<boolean>('ML_SHADOW_MODE', true);
    this.timeoutMs = this.configService.get<number>('ML_TIMEOUT_MS', 500);
    this.rolloutPct = this.configService.get<number>('ML_ROLLOUT_PCT', 0);
  }

  getServiceUrl(): string {
    return this.mlServiceUrl;
  }

  isMlEnabled(): boolean {
    return this.mlEnabled;
  }

  isShadowMode(): boolean {
    return this.shadowMode;
  }

  getRolloutPct(): number {
    return this.rolloutPct;
  }

  private async getDynamicConfig() {
    const mlEnabledRaw = await this.redis.get('ml:config:ml_enabled');
    const shadowModeRaw = await this.redis.get('ml:config:shadow_mode');
    const rolloutPctRaw = await this.redis.get('ml:config:rollout_pct');
    
    return {
      mlEnabled: mlEnabledRaw ? mlEnabledRaw === 'true' : this.mlEnabled,
      shadowMode: shadowModeRaw ? shadowModeRaw === 'true' : this.shadowMode,
      rolloutPct: rolloutPctRaw ? parseInt(rolloutPctRaw, 10) : this.rolloutPct,
    };
  }

  async getHealth(): Promise<MLHealthStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
      
      const response = await fetch(`${this.mlServiceUrl}/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return { status: 'unreachable' };
      }
      return await response.json() as MLHealthStatus;
    } catch (e) {
      return { status: 'unreachable' };
    }
  }

  async isReady(): Promise<boolean> {
    const health = await this.getHealth();
    return !!health.model_loaded;
  }

  async score(
    studentId: string,
    candidates: IRecommendedProgramResponse[],
    featureSnapshots: Record<string, ProgramFeatures>
  ): Promise<MLScoreResult[] | null> {
    try {
      const payload = {
        student_id: studentId,
        candidates: candidates.map(c => ({
          program_id: c._id.toString(),
          features: featureSnapshots[c._id.toString()] || {}
        }))
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
      
      const response = await fetch(`${this.mlServiceUrl}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.status === 503) {
        this.logger.debug('ML Service returned 503: Model not ready.');
        return null;
      }

      if (!response.ok) {
        this.logger.warn(`ML Service score failed: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data.scored_candidates as MLScoreResult[];
    } catch (e) {
      this.logger.warn(`Failed to score candidates via ML Service: ${e.message}`);
      return null;
    }
  }

  private computeSpearmanRankCorrelation(rankA: string[], rankB: string[]): number {
    const n = rankA.length;
    if (n === 0) return 0;
    
    // Ensure both arrays have same items (they should, just different order)
    const posB = new Map(rankB.map((id, index) => [id, index]));
    
    let dSquaredSum = 0;
    for (let i = 0; i < n; i++) {
      const id = rankA[i];
      const j = posB.has(id) ? posB.get(id) : n; // fallback to worst rank if not found
      const d = i - j;
      dSquaredSum += d * d;
    }
    
    // Spearman's rank correlation coefficient formula
    // rho = 1 - (6 * sum(d^2)) / (n * (n^2 - 1))
    // Special case n=1 to avoid division by zero
    if (n === 1) return 1.0;
    
    return 1 - (6 * dSquaredSum) / (n * (n * n - 1));
  }

  async scoreInShadow(
    studentId: string,
    rulesRanked: IRecommendedProgramResponse[],
    featureSnapshots: Record<string, ProgramFeatures>
  ): Promise<void> {
    const mlScores = await this.score(studentId, rulesRanked, featureSnapshots);
    if (!mlScores) {
      this.logger.debug("ML unavailable, shadow skipped");
      return;
    }

    const rulesOrder = rulesRanked.map(r => r._id.toString());
    
    // mlScores is already sorted by ml_score descending by the python service
    const mlOrder = mlScores.map(s => s.program_id);

    const correlation = this.computeSpearmanRankCorrelation(rulesOrder, mlOrder);
    
    const rulesTop5 = rulesOrder.slice(0, 5);
    const mlTop5 = mlOrder.slice(0, 5);

    // Save comparison
    try {
      await this.shadowModel.create({
        student_id: studentId,
        rules_top5: rulesTop5,
        ml_top5: mlTop5,
        rank_correlation: correlation,
        rules_scores: rulesRanked.map(r => r.relevance_score || 0),
        ml_scores: mlScores.map(s => s.ml_score)
      });
      this.logger.debug(`Shadow log saved for user ${studentId} with correlation ${correlation.toFixed(2)}`);
    } catch (e) {
      this.logger.error(`Failed to save ML shadow comparison: ${e.message}`);
    }
  }

  async isEligibleForML(studentId: string): Promise<boolean> {
    if (!studentId) return false;
    const { rolloutPct } = await this.getDynamicConfig();
    const hash = crypto.createHash('sha256').update(studentId).digest('hex');
    const bucket = parseInt(hash.slice(0, 8), 16) % 100;
    return bucket < rolloutPct;
  }

  async getRanked(
    studentId: string,
    rulesRanked: IRecommendedProgramResponse[],
    featureSnapshots: Record<string, ProgramFeatures>
  ): Promise<{ ranked: IRecommendedProgramResponse[], engine: 'rules' | 'ml' }> {
    const { mlEnabled, shadowMode } = await this.getDynamicConfig();

    // Check if ML is completely disabled or in shadow mode
    if (!mlEnabled || shadowMode) {
      // Fire shadow scoring without blocking
      if (mlEnabled && shadowMode) {
        this.scoreInShadow(studentId, rulesRanked, featureSnapshots).catch(e => 
          this.logger.error(`Shadow score error: ${e.message}`)
        );
      }
      return { ranked: rulesRanked, engine: 'rules' };
    }

    // ML is Enabled and Live. Check if user falls in rollout bucket
    const eligible = await this.isEligibleForML(studentId);
    if (!eligible) {
      return { ranked: rulesRanked, engine: 'rules' };
    }

    // Fetch scores from ML Service
    const mlScores = await this.score(studentId, rulesRanked, featureSnapshots);
    
    // Fallback to rules if ML service fails or model not ready
    if (!mlScores) {
      return { ranked: rulesRanked, engine: 'rules' };
    }

    // Build map for quick access
    const scoreMap = new Map<string, number>();
    for (const s of mlScores) {
      scoreMap.set(s.program_id, s.ml_score);
    }

    // Sort the original candidates by ML score and attach the score
    const mlRanked = [...rulesRanked].map(item => {
      const mlScore = scoreMap.get(item._id.toString()) ?? 0;
      return { ...item, ml_score: mlScore };
    }).sort((a, b) => {
      const scoreA = a.ml_score;
      const scoreB = b.ml_score;
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      
      // Tiebreakers
      const featuresA = featureSnapshots[a._id.toString()] || {} as ProgramFeatures;
      const featuresB = featureSnapshots[b._id.toString()] || {} as ProgramFeatures;
      
      if (featuresA.is_partner && !featuresB.is_partner) return -1;
      if (!featuresA.is_partner && featuresB.is_partner) return 1;
      
      return 0;
    });

    return { ranked: mlRanked, engine: 'ml' };
  }
}
