/**
 * Burnout Insights API Route
 * Provides AI-powered burnout recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { calculateBurnoutRisk } from '@/lib/analytics/burnout-calculator';
import { generateBurnoutRecommendations } from '@/lib/ai/insights-service';
import { AppError, ErrorCode } from '@/lib/types/api';
import { env } from '@/lib/utils/env';

// Burnout insights query schema
const burnoutInsightsQuerySchema = z.object({
  repositoryId: z.string().uuid().optional(),
  days: z.string().transform(val => parseInt(val, 10)).optional(),
});

/**
 * GET /api/insights/burnout
 * Get AI-powered burnout recommendations
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
    const days = searchParams.get('days') || '30';
    
    // Validate query parameters
    const result = burnoutInsightsQuerySchema.safeParse({
      repositoryId,
      days,
    });
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Invalid burnout insights query parameters',
            details: result.error.format(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Get validated data
    const { repositoryId: validatedRepoId, days: validatedDays = 30 } = result.data;
    
    // Calculate burnout risk
    const burnoutRisk = await calculateBurnoutRisk(
      session.user.id,
      validatedRepoId,
      validatedDays
    );
    
    // Generate recommendations
    const recommendations = await generateBurnoutRecommendations(burnoutRisk);
    
    // Return burnout insights
    return NextResponse.json(
      {
        success: true,
        data: {
          burnoutRisk,
          recommendations,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in burnout insights API route:', error);
    
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