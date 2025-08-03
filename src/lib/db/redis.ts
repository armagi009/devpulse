/**
 * Redis Connection Utility
 * Provides a Redis client for the application
 */

import Redis from 'ioredis';
import { env } from '@/lib/utils/env';

// Redis client options
const redisOptions = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    // Exponential backoff with max delay of 10 seconds
    const delay = Math.min(times * 100, 10000);
    return delay;
  },
};

// Redis client singleton
let redisClient: Redis | null = null;

/**
 * Get Redis client
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = env().REDIS_URL;
    
    if (!redisUrl) {
      throw new Error('Redis URL not configured');
    }
    
    redisClient = new Redis(redisUrl, redisOptions);
    
    // Handle connection errors
    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
    
    // Handle successful connection
    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });
  }
  
  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}