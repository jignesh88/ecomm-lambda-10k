import Redis from 'ioredis';
import { logger } from '@ecommerce/shared';

export class CacheService {
  private redis: Redis;

  constructor() {
    const redisEndpoint = process.env.REDIS_ENDPOINT!;
    this.redis = new Redis({
      host: redisEndpoint,
      port: 6379,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('error', (error) => {
      logger.error('Redis connection error', { error });
    });

    this.redis.on('connect', () => {
      logger.info('Connected to Redis');
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.redis.get(key);
      logger.debug('Cache get', { key, hit: !!value });
      return value;
    } catch (error) {
      logger.warn('Cache get error', { error, key });
      return null; // Fail gracefully
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, value);
      } else {
        await this.redis.set(key, value);
      }
      logger.debug('Cache set', { key, ttl: ttlSeconds });
    } catch (error) {
      logger.warn('Cache set error', { error, key });
      // Fail gracefully, don't throw
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug('Cache delete', { key });
    } catch (error) {
      logger.warn('Cache delete error', { error, key });
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info('Cache pattern invalidated', { pattern, keysDeleted: keys.length });
      }
    } catch (error) {
      logger.warn('Cache pattern invalidation error', { error, pattern });
    }
  }
}
