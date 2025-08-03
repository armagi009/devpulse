export const dynamic = 'force-dynamic';

/**
 * Mock Burnout Risk API Route
 * Used during dry run testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { ErrorCode } from '@/lib/types/api';

// Mock burnout data
const mockBurnoutData = {
  riskScore: 65,
  confidence: 0.85,
  keyFactors: [
    {
      name: 'Work Hours Pattern',
      impact: 0.75,
      description: 'Frequent work outside normal hours'
    },
    {
      name: 'Weekend Work Frequency',
      impact: 0.68,
      description: 'Regular weekend work'
    },
    {
      name: 'Workload Distribution',
      impact: 0.62,
      description: 'Uneven workload distribution'
    }
  ],
  recommendations: [
    'Consider taking time off to recharge and prevent burnout.',
    'Try to limit work during late night hours and establish more regular working hours.',
    'Reduce weekend work to ensure proper rest and recovery time.',
    'Work on distributing your workload more evenly throughout the week.',
    'Take short breaks during the day to maintain focus and productivity.'
  ],
  historicalTrend: [
    { date: new Date('2025-06-21'), value: 60 },
    { date: new Date('2025-06-28'), value: 62 },
    { date: new Date('2025-07-05'), value: 65 },
    { date: new Date('2025-07-12'), value: 68 },
    { date: new Date('2025-07-19'), value: 65 }
  ]
};

/**
 * GET /api/analytics/burnout
 * Get burnout risk assessment for a user
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const repositoryId = searchParams.get('repositoryId');
    const days = searchParams.get('days') || '30';
    
    // Validate repository ID
    if (!repositoryId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Repository ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // For dry run, return mock data
    return NextResponse.json(
      {
        success: true,
        data: mockBurnoutData,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in burnout risk API route:', error);
    
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