/**
 * API Performance Monitoring Endpoint
 * Provides metrics on API response times and cache hit rates
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ErrorCode } from '@/lib/types/api';
import { getRecentMetrics, getAverageResponseTime } from '@/lib/utils/api-performance';
import { hasPermission } from '@/lib/auth/permission-middleware';

/**
 * GET /api/admin/performance
 * Get API performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.UNAUTHORIZED,
            message: 'Not authenticated',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }
    
    // Check if user has admin permission
    const hasAdminPermission = await hasPermission(session.user.id, 'admin:view_performance');
    
    if (!hasAdminPermission) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.FORBIDDEN,
            message: 'You do not have permission to view performance metrics',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    
    // Get metrics
    const metrics = getRecentMetrics();
    
    // Calculate statistics
    const averageResponseTime = getAverageResponseTime(path || undefined);
    
    // Calculate cache hit rate
    const cacheHits = metrics.filter(m => m.cached).length;
    const cacheHitRate = metrics.length > 0 ? cacheHits / metrics.length : 0;
    
    // Group metrics by path
    const metricsByPath = metrics.reduce((acc, metric) => {
      if (!acc[metric.path]) {
        acc[metric.path] = [];
      }
      acc[metric.path].push(metric);
      return acc;
    }, {} as Record<string, typeof metrics>);
    
    // Calculate average response time by path
    const averageResponseTimeByPath = Object.entries(metricsByPath).reduce((acc, [path, pathMetrics]) => {
      const sum = pathMetrics.reduce((sum, m) => sum + m.responseTime, 0);
      acc[path] = sum / pathMetrics.length;
      return acc;
    }, {} as Record<string, number>);
    
    // Return metrics
    return NextResponse.json(
      {
        success: true,
        data: {
          metrics: path ? metrics.filter(m => m.path === path) : metrics,
          statistics: {
            averageResponseTime,
            averageResponseTimeByPath,
            cacheHitRate,
            totalRequests: metrics.length,
            requestsByStatusCode: metrics.reduce((acc, m) => {
              const statusCode = m.statusCode.toString();
              acc[statusCode] = (acc[statusCode] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in API performance metrics route:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}