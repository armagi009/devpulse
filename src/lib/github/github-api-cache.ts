/**
 * GitHub API Cache
 * Multi-level caching system for GitHub API responses
 */

import { getRedisClient } from '@/lib/db/redis';

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  expires: number;
  lastAccessed: number;
  staleAt: number;
}

// Cache options interface
export interface CacheOptions {
  ttl: number;        // Time to live in milliseconds
  staleTime: number;  // Time after which data is considered stale but still usable
  maxSize?: number;   // Maximum number of items in memory cache
}

// Default cache options
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  ttl: 5 * 60 * 1000,        // 5 minutes
  staleTime: 2 * 60 * 1000,  // 2 minutes
  maxSize: 1000,             // 1000 items
};

/**
 * In-memory cache implementation
 */
export class MemoryCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private options: CacheOptions;

  /**
   * Constructor
   */
  constructor(options: Partial<CacheOptions> = {}) {
    this.cache = new Map<string, CacheEntry<T>>();
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options };
  }

  /**
   * Get item from cache
   */
  public get(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();

    // Update last accessed time
    entry.lastAccessed = now;

    // Check if entry is expired
    if (now > entry.expires) {
      this.delete(key);
      return null;
    }

    // Check if entry is stale
    const isStale = now > entry.staleAt;

    return { data: entry.data, isStale };
  }

  /**
   * Set item in cache
   */
  public set(key: string, data: T): void {
    const now = Date.now();

    // Create cache entry
    const entry: CacheEntry<T> = {
      data,
      expires: now + this.options.ttl,
      lastAccessed: now,
      staleAt: now + this.options.staleTime,
    };

    // Add to cache
    this.cache.set(key, entry);

    // Enforce max size
    this.enforceMaxSize();
  }

  /**
   * Delete item from cache
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys in cache
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Delete items by prefix
   */
  public deleteByPrefix(prefix: string): number {
    let count = 0;
    
    for (const key of this.keys()) {
      if (key.startsWith(prefix)) {
        this.delete(key);
        count++;
      }
    }
    
    return count;
  }

  /**
   * Enforce max size
   */
  private enforceMaxSize(): void {
    if (!this.options.maxSize || this.cache.size <= this.options.maxSize) {
      return;
    }

    // Sort entries by last accessed time (oldest first)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.lastAccessed - b.lastAccessed
    );

    // Remove oldest entries until we're under max size
    const entriesToRemove = this.cache.size - this.options.maxSize;
    for (let i = 0; i < entriesToRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }
}

/**
 * Redis cache implementation
 */
export class RedisCache<T> {
  private options: CacheOptions;

  /**
   * Constructor
   */
  constructor(options: Partial<CacheOptions> = {}) {
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options };
  }

  /**
   * Get item from cache
   */
  public async get(key: string): Promise<{ data: T; isStale: boolean } | null> {
    const redis = getRedisClient();
    const entry = await redis.get(key);

    if (!entry) {
      return null;
    }

    try {
      const { data, expires, staleAt } = JSON.parse(entry);
      const now = Date.now();

      // Check if entry is expired
      if (now > expires) {
        await this.delete(key);
        return null;
      }

      // Check if entry is stale
      const isStale = now > staleAt;

      return { data, isStale };
    } catch (error) {
      console.error('Error parsing Redis cache entry:', error);
      await this.delete(key);
      return null;
    }
  }

  /**
   * Set item in cache
   */
  public async set(key: string, data: T): Promise<void> {
    const redis = getRedisClient();
    const now = Date.now();

    // Create cache entry
    const entry = JSON.stringify({
      data,
      expires: now + this.options.ttl,
      staleAt: now + this.options.staleTime,
    });

    // Add to cache with TTL
    await redis.set(key, entry, 'EX', Math.ceil(this.options.ttl / 1000));
  }

  /**
   * Delete item from cache
   */
  public async delete(key: string): Promise<boolean> {
    const redis = getRedisClient();
    const result = await redis.del(key);
    return result > 0;
  }

  /**
   * Clear cache
   */
  public async clear(): Promise<void> {
    // This is dangerous, so we don't implement it
    // Instead, use deleteByPrefix with a specific prefix
  }

  /**
   * Get all keys in cache
   */
  public async keys(pattern?: string): Promise<string[]> {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern || '*');
    return keys;
  }

  /**
   * Delete items by prefix
   */
  public async deleteByPrefix(prefix: string): Promise<number> {
    const keys = await this.keys(`${prefix}*`);
    let count = 0;
    
    for (const key of keys) {
      if (await this.delete(key)) {
        count++;
      }
    }
    
    return count;
  }
}

/**
 * Multi-level cache implementation
 */
export class MultiLevelCache<T> {
  private memoryCache: MemoryCache<T>;
  private redisCache: RedisCache<T>;
  private revalidationCallbacks = new Map<string, () => Promise<T>>();

  /**
   * Constructor
   */
  constructor(
    memoryCacheOptions: Partial<CacheOptions> = {},
    redisCacheOptions: Partial<CacheOptions> = {}
  ) {
    this.memoryCache = new MemoryCache<T>(memoryCacheOptions);
    this.redisCache = new RedisCache<T>(redisCacheOptions);
  }

  /**
   * Get item from cache
   */
  public async get<U extends T>(
    key: string,
    callback?: () => Promise<U>
  ): Promise<U | null> {
    // Try memory cache first
    const memoryResult = this.memoryCache.get(key);

    if (memoryResult) {
      // If data is stale, trigger background revalidation
      if (memoryResult.isStale && callback) {
        this.revalidateInBackground<U>(key, callback);
      }
      
      return memoryResult.data as U;
    }

    // Try Redis cache
    const redisResult = await this.redisCache.get(key);

    if (redisResult) {
      // Update memory cache
      this.memoryCache.set(key, redisResult.data);
      
      // If data is stale, trigger background revalidation
      if (redisResult.isStale && callback) {
        this.revalidateInBackground<U>(key, callback);
      }
      
      return redisResult.data as U;
    }

    // Get fresh data
    if (callback) {
      try {
        const freshData = await callback();
        
        // Update caches
        await this.set(key, freshData);
        
        return freshData;
      } catch (error) {
        console.error('Error fetching fresh data:', error);
        return null;
      }
    }

    return null;
  }
  
  /**
   * Get raw item from cache without callback
   */
  public async getRaw<U extends T>(key: string): Promise<U | null> {
    // Try memory cache first
    const memoryResult = this.memoryCache.get(key);
    
    if (memoryResult) {
      return memoryResult.data as U;
    }
    
    // Try Redis cache
    const redisResult = await this.redisCache.get(key);
    
    if (redisResult) {
      // Update memory cache
      this.memoryCache.set(key, redisResult.data);
      
      return redisResult.data as U;
    }
    
    return null;
  }

  /**
   * Set item in cache
   */
  public async set(key: string, data: T): Promise<void> {
    // Update memory cache
    this.memoryCache.set(key, data);
    
    // Update Redis cache
    await this.redisCache.set(key, data);
  }

  /**
   * Delete item from cache
   */
  public async delete(key: string): Promise<boolean> {
    // Delete from memory cache
    this.memoryCache.delete(key);
    
    // Delete from Redis cache
    return await this.redisCache.delete(key);
  }

  /**
   * Clear cache
   */
  public async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    
    // We don't clear Redis cache for safety
  }

  /**
   * Delete items by prefix
   */
  public async invalidateByPrefix(prefix: string): Promise<number> {
    // Delete from memory cache
    const memoryCount = this.memoryCache.deleteByPrefix(prefix);
    
    // Delete from Redis cache
    const redisCount = await this.redisCache.deleteByPrefix(prefix);
    
    return memoryCount + redisCount;
  }

  /**
   * Revalidate data in background
   */
  private revalidateInBackground<U extends T>(
    key: string,
    callback: () => Promise<U>
  ): void {
    // Store revalidation callback
    this.revalidationCallbacks.set(key, callback as () => Promise<T>);
    
    // Revalidate in background
    setTimeout(async () => {
      try {
        // Get callback
        const callback = this.revalidationCallbacks.get(key);
        
        // Remove callback
        this.revalidationCallbacks.delete(key);
        
        // Check if callback still exists
        if (callback) {
          // Get fresh data
          const freshData = await callback();
          
          // Update caches
          await this.set(key, freshData);
        }
      } catch (error) {
        console.error('Error revalidating data:', error);
      }
    }, 0);
  }
}

// Cache instance
let multiLevelCache: MultiLevelCache<any> | null = null;

/**
 * Get multi-level cache instance
 */
export function getMultiLevelCache<T>(
  memoryCacheOptions: Partial<CacheOptions> = {},
  redisCacheOptions: Partial<CacheOptions> = {}
): MultiLevelCache<T> {
  if (!multiLevelCache) {
    multiLevelCache = new MultiLevelCache<any>(memoryCacheOptions, redisCacheOptions);
  }
  return multiLevelCache as MultiLevelCache<T>;
}