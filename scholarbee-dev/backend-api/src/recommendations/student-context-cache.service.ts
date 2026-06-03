import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { OnboardingPreferences } from 'src/users/schemas/user.schema';
import { WeightPriors } from './types/bayesian-weights.types';

export interface StudentContext {
  _id: string;
  onboarding_preferences?: OnboardingPreferences;
  bayesian_weights?: WeightPriors;
  user_type: string;
}

@Injectable()
export class StudentContextCacheService {
  private readonly logger = new Logger(StudentContextCacheService.name);
  private readonly ttl = 3600; // 1 hour

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  buildKey(studentId: string): string {
    return `student:ctx:${studentId}`;
  }

  async get(studentId: string): Promise<StudentContext | null> {
    const key = this.buildKey(studentId);
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      this.logger.error(`Failed to get student context cache for ${studentId}: ${error.message}`);
      return null;
    }
  }

  async set(studentId: string, context: StudentContext): Promise<void> {
    const key = this.buildKey(studentId);
    try {
      await this.redis.set(key, JSON.stringify(context), 'EX', this.ttl);
    } catch (error) {
      this.logger.error(`Failed to set student context cache for ${studentId}: ${error.message}`);
    }
  }

  async invalidate(studentId: string): Promise<void> {
    const key = this.buildKey(studentId);
    try {
      await this.redis.del(key);
      this.logger.log(`Invalidated student context cache for ${studentId}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate student context cache for ${studentId}: ${error.message}`);
    }
  }
}
