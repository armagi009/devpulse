export const dynamic = 'force-dynamic';

/**
 * Personal Analytics API Route
 * Provides comprehensive personal analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { calculateProductivityMetrics, getWorkPatternAnalysis } from '@/lib/analytics/productivity-metrics';
import { calculateBurnoutRisk } from '@/lib/analytics/burnout-calculator';
import { AppError, ErrorCode } from '@/lib/types/api';

// Personal analytics query schema
const personalAnalyticsQuerySchema = z.object({
  repositoryId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeProductivity: z.string().optional().transform(val => val !== 'false'),
  includeWorkPatterns: z.string().optional().transform(val => val !== 'false'),
  includeBurnout: z.string().optional().transform(val => val !== 'false'),
});

/**
 * GET /api/analytics/personal
 * Get comprehensive personal analytics data
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
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();
    const includeProductivity = searchParams.get('includeProductivity');
    const includeWorkPatterns = searchParams.get('includeWorkPatterns');
    const includeBurnout = searchParams.get('includeBurnout');
    
    // Validate query parameters
    const result = personalAnalyticsQuerySchema.safeParse({
      repositoryId,
      startDate,
      endDate,
      includeProductivity,
      includeWorkPatterns,
      includeBurnout,
    });
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Invalid personal analytics query parameters',
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
      startDate: validatedStartDate, 
      endDate: validatedEndDate,
      includeProductivity: validatedIncludeProductivity,
      includeWorkPatterns: validatedIncludeWorkPatterns,
      includeBurnout: validatedIncludeBurnout
    } = result.data;
    
    // Create time range
    const timeRange = {
      start: new Date(validatedStartDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      end: new Date(validatedEndDate || new Date()),
    };
    
    // Initialize response data
    const responseData: any = {
      userId: session.user.id,
      timeRange,
    };
    
    // Get productivity metrics if requested
    if (validatedIncludeProductivity) {
      responseData.productivity = await calculateProductivityMetrics(
        session.user.id,
        timeRange,
        validatedRepoId
      );
    }
    
    // Get work pattern analysis if requested
    if (validatedIncludeWorkPatterns) {
      responseData.workPatterns = await getWorkPatternAnalysis(
        session.user.id,
        timeRange,
        validatedRepoId
      );
    }
    
    // Get burnout risk if requested
    if (validatedIncludeBurnout) {
      // Calculate days between start and end dates
      const days = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
      
      responseData.burnout = await calculateBurnoutRisk(
        session.user.id,
        validatedRepoId,
        days
      );
    }
    
    // Return personal analytics data
    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in personal analytics API route:', error);
    
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