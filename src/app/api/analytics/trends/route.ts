export const dynamic = 'force-dynamic';

/**
 * Historical Trends API Route
 * Provides historical trend data for various metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { AppError, ErrorCode } from '@/lib/types/api';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

// Trends query schema
const trendsQuerySchema = z.object({
  repositoryId: z.string().uuid().optional(),
  metric: z.enum(['commits', 'prs', 'issues', 'burnout', 'velocity']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  interval: z.enum(['day', 'week', 'month']).default('day'),
});

/**
 * GET /api/analytics/trends
 * Get historical trend data for various metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession();
    
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const repositoryId = searchParams.get('repositoryId');
    const metric = searchParams.get('metric') || 'commits';
    const startDate = searchParams.get('startDate') || subDays(new Date(), 30).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();
    const interval = searchParams.get('interval') || 'day';
    
    // Validate query parameters
    const result = trendsQuerySchema.safeParse({
      repositoryId,
      metric,
      startDate,
      endDate,
      interval,
    });
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Invalid trends query parameters',
            details: result.error.format(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Get validated data
    const { 
      repositoryId: validatedRepoId, 
      metric: validatedMetric,
      startDate: validatedStartDate,
      endDate: validatedEndDate,
      interval: validatedInterval
    } = result.data;
    
    // Parse dates
    const start = startOfDay(new Date(validatedStartDate));
    const end = endOfDay(new Date(validatedEndDate));
    
    // Get trend data based on metric type
    let trendData;
    
    switch (validatedMetric) {
      case 'commits':
        trendData = await getCommitTrend(session.user.id, validatedRepoId, start, end, validatedInterval);
        break;
      case 'prs':
        trendData = await getPullRequestTrend(session.user.id, validatedRepoId, start, end, validatedInterval);
        break;
      case 'issues':
        trendData = await getIssueTrend(session.user.id, validatedRepoId, start, end, validatedInterval);
        break;
      case 'burnout':
        trendData = await getBurnoutTrend(session.user.id, validatedRepoId, start, end, validatedInterval);
        break;
      case 'velocity':
        trendData = await getVelocityTrend(validatedRepoId, start, end, validatedInterval);
        break;
      default:
        trendData = [];
    }
    
    // Return trend data
    return NextResponse.json(
      {
        success: true,
        data: {
          metric: validatedMetric,
          interval: validatedInterval,
          timeRange: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
          trend: trendData,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in trends API route:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.toJSON(),
          timestamp: new Date().toISOString(),
        },
        { status: error.status }
      );
    }
    
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

/**
 * Get commit trend data
 */
async function getCommitTrend(
  userId: string,
  repositoryId: string | undefined,
  start: Date,
  end: Date,
  interval: string
): Promise<{ date: string; value: number }[]> {
  // Build query
  const query: any = {
    authorId: userId,
    authorDate: {
      gte: start,
      lte: end,
    },
  };
  
  if (repositoryId) {
    query.repositoryId = repositoryId;
  }
  
  // Get commits
  const commits = await prisma.commit.findMany({
    where: query,
    orderBy: {
      authorDate: 'asc',
    },
  });
  
  // Group commits by interval
  return groupByInterval(
    commits,
    commit => commit.authorDate,
    interval
  );
}

/**
 * Get pull request trend data
 */
async function getPullRequestTrend(
  userId: string,
  repositoryId: string | undefined,
  start: Date,
  end: Date,
  interval: string
): Promise<{ date: string; value: number }[]> {
  // Build query
  const query: any = {
    authorId: userId,
    createdAt: {
      gte: start,
      lte: end,
    },
  };
  
  if (repositoryId) {
    query.repositoryId = repositoryId;
  }
  
  // Get pull requests
  const pullRequests = await prisma.pullRequest.findMany({
    where: query,
    orderBy: {
      createdAt: 'asc',
    },
  });
  
  // Group pull requests by interval
  return groupByInterval(
    pullRequests,
    pr => pr.createdAt,
    interval
  );
}

/**
 * Get issue trend data
 */
async function getIssueTrend(
  userId: string,
  repositoryId: string | undefined,
  start: Date,
  end: Date,
  interval: string
): Promise<{ date: string; value: number }[]> {
  // Build query
  const query: any = {
    authorId: userId,
    createdAt: {
      gte: start,
      lte: end,
    },
  };
  
  if (repositoryId) {
    query.repositoryId = repositoryId;
  }
  
  // Get issues
  const issues = await prisma.issue.findMany({
    where: query,
    orderBy: {
      createdAt: 'asc',
    },
  });
  
  // Group issues by interval
  return groupByInterval(
    issues,
    issue => issue.createdAt,
    interval
  );
}

/**
 * Get burnout trend data
 */
async function getBurnoutTrend(
  userId: string,
  repositoryId: string | undefined,
  start: Date,
  end: Date,
  interval: string
): Promise<{ date: string; value: number }[]> {
  // Build query
  const query: any = {
    userId,
    date: {
      gte: start,
      lte: end,
    },
    burnoutRiskScore: {
      not: null,
    },
  };
  
  if (repositoryId) {
    query.repositoryId = repositoryId;
  }
  
  // Get burnout metrics
  const burnoutMetrics = await prisma.burnoutMetric.findMany({
    where: query,
    orderBy: {
      date: 'asc',
    },
    select: {
      date: true,
      burnoutRiskScore: true,
    },
  });
  
  // Group burnout metrics by interval
  return groupByInterval(
    burnoutMetrics,
    metric => metric.date,
    interval,
    metric => Number(metric.burnoutRiskScore)
  );
}

/**
 * Get velocity trend data
 */
async function getVelocityTrend(
  repositoryId: string | undefined,
  start: Date,
  end: Date,
  interval: string
): Promise<{ date: string; value: number }[]> {
  if (!repositoryId) {
    return [];
  }
  
  // Get team insights
  const teamInsights = await prisma.teamInsight.findMany({
    where: {
      repositoryId,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      date: 'asc',
    },
    select: {
      date: true,
      velocityScore: true,
    },
  });
  
  // Group team insights by interval
  return groupByInterval(
    teamInsights,
    insight => insight.date,
    interval,
    insight => Number(insight.velocityScore)
  );
}

/**
 * Group data by interval
 */
function groupByInterval<T>(
  data: T[],
  getDate: (item: T) => Date,
  interval: string,
  getValue: (item: T) => number = () => 1
): { date: string; value: number }[] {
  // Create a map to store grouped data
  const groupedData = new Map<string, number>();
  
  // Group data by interval
  for (const item of data) {
    const date = getDate(item);
    let key: string;
    
    switch (interval) {
      case 'week':
        // Format as YYYY-WW (year and week number)
        key = format(date, 'yyyy-ww');
        break;
      case 'month':
        // Format as YYYY-MM (year and month)
        key = format(date, 'yyyy-MM');
        break;
      case 'day':
      default:
        // Format as YYYY-MM-DD (year, month, and day)
        key = format(date, 'yyyy-MM-dd');
        break;
    }
    
    // Increment count for this key
    const value = getValue(item);
    groupedData.set(key, (groupedData.get(key) || 0) + value);
  }
  
  // Convert map to array and sort by date
  return Array.from(groupedData.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}