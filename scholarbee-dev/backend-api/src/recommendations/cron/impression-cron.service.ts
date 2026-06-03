import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ImpressionService } from '../services/impression.service';

@Injectable()
export class ImpressionCronService {
  private readonly logger = new Logger(ImpressionCronService.name);

  constructor(private readonly impressionService: ImpressionService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleExpiredSessions() {
    this.logger.log('Running expired impression sessions cleanup...');
    await this.impressionService.closeExpiredSessions();
  }
}
