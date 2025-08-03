/**
 * Productivity Insights API Route
 * Provides AI-powered productivity insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { calculateProductivityMetrics } from '@/lib/analytics/productivity-metrics';
import { generateProductivityInsights } from '@/lib/ai/insights-service';
import { AppError, ErrorCode } from '@/lib/types/api';
import { env } from '@/lib/utils/env';

// Productivity insights query schema
const productivityInsightsQuerySchema = z.object({
  repositoryId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * GET /api/insights/productivity
 * Get AI-powered productivity insights
 */
export async function GET(request: NextRequest) {
  try {
    // Check if AI features are enabled
    if (!env().ENABLE_AI_FEATURES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.FORBIDDEN,
            message: 'AI features are disabled',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }
    
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
    
    // Validate query parameters
    const result = productivityInsightsQuerySchema.safeParse({
      repositoryId,
      startDate,
      endDate,
    });
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Invalid productivity insights query parameters',
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
      endDate: validatedEndDate 
    } = result.data;
    
    // Create time range
    const timeRange = {
      start: new Date(validatedStartDate),
      end: new Date(validatedEndDate),
    };
    
    // Calculate productivity metrics
    const metrics = await calculateProductivityMetrics(
      session.user.id,
      timeRange,
      validatedRepoId
    );
    
    // Generate insights
    const insights = await generateProductivityInsights(metrics);
    
    // Return productivity insights
    return NextResponse.json(
      {
        success: true,
        data: {
          metrics,
          insights,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in productivity insights API route:', error);
    
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