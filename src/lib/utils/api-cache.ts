/**
 * API Response Caching Utility
 * Provides caching for API responses to improve performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMultiLevelCache, CacheOptions } from '@/lib/github/github-api-cache';

// Cache key generator type
export type CacheKeyGenerator = (req: NextRequest) => string;

// Cache options for different API endpoints
const API_CACHE_OPTIONS: Record<string, CacheOptions> = {
  // Analytics endpoints - shorter TTL as data changes frequently
  analytics: {
    ttl: 2 * 60 * 1000,        // 2 minutes
    staleTime: 1 * 60 * 1000,  // 1 minute
  },
  // GitHub data - longer TTL as external data changes less frequently
  github: {
    ttl: 10 * 60 * 1000,       // 10 minutes
    staleTime: 5 * 60 * 1000,  // 5 minutes
  },
  // User data - medium TTL
  users: {
    ttl: 5 * 60 * 1000,        // 5 minutes
    staleTime: 2 * 60 * 1000,  // 2 minutes
  },
};

/**
 * Get cache options for a specific API category
 */
export function getCacheOptions(category: string): CacheOptions {
  return API_CACHE_OPTIONS[category] || {
    ttl: 5 * 60 * 1000,        // Default: 5 minutes
    staleTime: 2 * 60 * 1000,  // Default: 2 minutes
  };
}

/**
 * Create a cache key from a request
 */
export function createCacheKey(req: NextRequest, prefix: string): string {
  const url = new URL(req.url);
  const path = url.pathname;
  const searchParams = url.searchParams.toString();
  
  return `${prefix}:${path}${searchParams ? `?${searchParams}` : ''}`;
}

/**
 * Cache API response
 */
export async function cacheApiResponse<T>(
  req: NextRequest,
  category: string,
  keyGenerator: CacheKeyGenerator,
  dataFetcher: () => Promise<T>
): Promise<T> {
  const cacheKey = keyGenerator(req);
  const cache = getMultiLevelCache<T>(getCacheOptions(category), getCacheOptions(category));
  
  return await cache.get(cacheKey, dataFetcher) as T;
}

/**
 * Invalidate API cache by prefix
 */
export async function invalidateApiCache(prefix: string): Promise<number> {
  const cache = getMultiLevelCache<any>();
  return await cache.invalidateByPrefix(prefix);
}

/**
 * Wrap API handler with caching
 */
export function withApiCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  category: string,
  keyGenerator: CacheKeyGenerator
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return handler(req);
    }
    
    // Skip cache if cache-control header is set to no-cache
    const cacheControl = req.headers.get('cache-control');
    if (cacheControl && cacheControl.includes('no-cache')) {
      return handler(req);
    }
    
    try {
      // Get response from cache or generate it
      const response = await cacheApiResponse(
        req,
        category,
        keyGenerator,
        async () => {
          const res = await handler(req);
          
          // Clone the response to get the body
          const clonedRes = res.clone();
          
          try {
            // Parse the response body
            const body = await clonedRes.json();
            
            // Return the response data
            return {
              body,
              status: res.status,
              headers: Object.fromEntries(res.headers.entries()),
            };
          } catch (error) {
            // If we can't parse the body, return the original response
            return handler(req);
          }
        }
      );
      
      // If we got a NextResponse directly, return it
      if (response instanceof NextResponse) {
        return response;
      }
      
      // Otherwise, create a new response from the cached data
      return NextResponse.json(response.body, {
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      // If caching fails, fall back to the original handler
      console.error('API cache error:', error);
      return handler(req);
    }
  };
}