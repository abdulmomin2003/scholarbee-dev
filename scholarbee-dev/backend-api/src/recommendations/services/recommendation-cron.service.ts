import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecommendationService } from './recommendation.service';

@Injectable()
export class RecommendationCronService {
  private readonly logger = new Logger(RecommendationCronService.name);
  /** Prevents overlapping cron executions. */
  private isRunning = false;

  constructor(
    private readonly recommendationService: RecommendationService,
  ) {}

  /**
   * Runs every 1 minute to refresh the GLOBAL trending cache only.
   *
   * Personalized recommendations for individual students are NOT precomputed
   * here — they are computed on-demand when a student makes a request and
   * their cache is expired (handled by the cache-miss path in getRecommendations).
   *
   * Separating these concerns keeps the cron fast (~3 seconds) regardless of
   * how many students are registered.
   */
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'recompute-trending-recommendations',
    timeZone: 'UTC',
  })
  async recomputeTrendingRecommendations(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Skipping trending cron — previous run is still in progress.');
      return;
    }

    this.isRunning = true;
    this.logger.log('Refreshing global trending recommendations cache...');

    try {
      await this.recommendationService.precomputeTrendingRecommendations();
      this.logger.log('Global trending cache refreshed successfully.');
    } catch (error) {
      this.logger.error(
        'Trending cron encountered a fatal error:',
        error.stack,
      );
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manual trigger method for testing and admin dashboard support.
   */
  async manuallyTriggerPrecomputation(): Promise<void> {
    this.logger.log('Manually triggering trending recommendation refresh...');
    await this.recomputeTrendingRecommendations();
  }
}
