/**
 * API Performance Monitoring Utility
 * Provides tools for monitoring and optimizing API performance
 */

import { NextRequest, NextResponse } from 'next/server';

// Performance metrics interface
export interface PerformanceMetrics {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  cached: boolean;
}

// In-memory store for recent performance metrics
const recentMetrics: PerformanceMetrics[] = [];
const MAX_METRICS = 100; // Keep only the most recent metrics

/**
 * Record performance metrics
 */
export function recordMetrics(metrics: PerformanceMetrics): void {
  // Add to recent metrics
  recentMetrics.unshift(metrics);
  
  // Trim to max size
  if (recentMetrics.length > MAX_METRICS) {
    recentMetrics.pop();
  }
  
  // Log slow responses (over 500ms)
  if (metrics.responseTime > 500) {
    console.warn(`Slow API response: ${metrics.path} (${metrics.responseTime}ms)`);
  }
}

/**
 * Get recent performance metrics
 */
export function getRecentMetrics(): PerformanceMetrics[] {
  return [...recentMetrics];
}

/**
 * Get average response time for a path
 */
export function getAverageResponseTime(path?: string): number {
  const filteredMetrics = path
    ? recentMetrics.filter(m => m.path === path)
    : recentMetrics;
  
  if (filteredMetrics.length === 0) {
    return 0;
  }
  
  const sum = filteredMetrics.reduce((acc, m) => acc + m.responseTime, 0);
  return sum / filteredMetrics.length;
}

/**
 * Wrap API handler with performance monitoring
 */
export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = performance.now();
    
    try {
      // Call the original handler
      const response = await handler(req);
      
      // Calculate response time
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // Record metrics
      recordMetrics({
        path: new URL(req.url).pathname,
        method: req.method,
        statusCode: response.status,
        responseTime,
        timestamp: new Date().toISOString(),
        cached: response.headers.get('x-cache') === 'HIT',
      });
      
      // Add response time header
      response.headers.set('x-response-time', `${responseTime}ms`);
      
      return response;
    } catch (error) {
      // Calculate response time even for errors
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // Record metrics for error
      recordMetrics({
        path: new URL(req.url).pathname,
        method: req.method,
        statusCode: 500,
        responseTime,
        timestamp: new Date().toISOString(),
        cached: false,
      });
      
      // Re-throw the error
      throw error;
    }
  };
}