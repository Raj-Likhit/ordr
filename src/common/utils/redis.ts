import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisClient {
  private static instance: Redis;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(redisUrl);
      
      RedisClient.instance.on('error', (err) => {
        logger.error({ err }, 'Redis connection error');
      });

      RedisClient.instance.on('connect', () => {
        logger.info('Connected to Redis');
      });
    }
    return RedisClient.instance;
  }
}

export const redis = RedisClient.getInstance();

export async function withCache<T>(key: string, ttl: number, fetchFn: () => Promise<T>): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    
    const data = await fetchFn();
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
    return data;
  } catch (err) {
    logger.warn({ err, key }, 'Redis cache failed, falling back to db');
    return fetchFn();
  }
}
