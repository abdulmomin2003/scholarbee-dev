import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import * as zlib from 'zlib';

@Injectable()
export class RecommendationCacheService {
  private readonly logger = new Logger(RecommendationCacheService.name);

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  buildKey(studentId: string, type: 'programs' | 'universities'): string {
    return `rec:${type}:${studentId}`;
  }

  async get(studentId: string, type: 'programs' | 'universities'): Promise<any[] | null> {
    const key = this.buildKey(studentId, type);
    try {
      const buffer = await this.redis.getBuffer(key);
      if (!buffer) {
        return null;
      }
      const decompressed = zlib.gunzipSync(buffer).toString('utf-8');
      return JSON.parse(decompressed);
    } catch (error) {
      this.logger.error(`Failed to get cache for student ${studentId} (${type}): ${error.message}`);
      return null;
    }
  }

  async set(studentId: string, type: 'programs' | 'universities', results: any[], ttl = 60): Promise<void> {
    const key = this.buildKey(studentId, type);
    try {
      const jsonString = JSON.stringify(results);
      const compressed = zlib.gzipSync(jsonString);
      await this.redis.set(key, compressed, 'EX', ttl);
    } catch (error) {
      this.logger.error(`Failed to set cache for student ${studentId} (${type}): ${error.message}`);
    }
  }

  async invalidate(studentId: string): Promise<void> {
    const programKey = this.buildKey(studentId, 'programs');
    const universityKey = this.buildKey(studentId, 'universities');
    try {
      await this.redis.del(programKey, universityKey);
      this.logger.log(`Invalidated recommendation cache for student ${studentId}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for student ${studentId}: ${error.message}`);
    }
  }

  async setTrending(type: 'programs' | 'universities', results: any[]): Promise<void> {
    const key = `rec:trending:${type}`;
    try {
      const jsonString = JSON.stringify(results);
      const compressed = zlib.gzipSync(jsonString);
      await this.redis.set(key, compressed, 'EX', 60); // 1 minute TTL
    } catch (error) {
      this.logger.error(`Failed to set trending cache (${type}): ${error.message}`);
    }
  }

  async getTrending(type: 'programs' | 'universities'): Promise<any[] | null> {
    const key = `rec:trending:${type}`;
    try {
      const buffer = await this.redis.getBuffer(key);
      if (!buffer) {
        return null;
      }
      const decompressed = zlib.gunzipSync(buffer).toString('utf-8');
      return JSON.parse(decompressed);
    } catch (error) {
      this.logger.error(`Failed to get trending cache (${type}): ${error.message}`);
      return null;
    }
  }
}
