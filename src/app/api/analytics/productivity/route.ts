export const dynamic = 'force-dynamic';

/**
 * Mock Productivity Metrics API Route
 * Used during dry run testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { ErrorCode } from '@/lib/types/api';
import { subDays, format } from 'date-fns';

// Mock productivity data
const generateMockProductivityData = (startDate: Date, endDate: Date) => {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate mock commit frequency data
  const commitFrequency = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    commitFrequency.push({
      date: date.toISOString(),
      value: Math.floor(Math.random() * 10) + 1
    });
  }
  
  // Generate mock work hours distribution
  const workHoursDistribution = [];
  for (let hour = 8; hour <= 20; hour++) {
    workHoursDistribution.push({
      hour,
      count: Math.floor(Math.random() * 20) + 5
    });
  }
  
  // Generate mock weekday distribution
  const weekdayDistribution = [];
  for (let day = 0; day < 7; day++) {
    weekdayDistribution.push({
      day,
      count: Math.floor(Math.random() * 30) + 10
    });
  }
  
  // Generate mock top languages
  const topLanguages = [
    { language: 'TypeScript', percentage: 0.45 },
    { language: 'JavaScript', percentage: 0.25 },
    { language: 'CSS', percentage: 0.15 },
    { language: 'HTML', percentage: 0.10 },
    { language: 'Python', percentage: 0.05 }
  ];
  
  return {
    metrics: {
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      commitCount: 87,
      linesAdded: 3245,
      linesDeleted: 1876,
      prCount: 12,
      issueCount: 8,
      codeQualityScore: 78,
      avgPrSize: 142,
      avgTimeToMergePr: 24,
      avgTimeToResolveIssue: 48,
      commitFrequency,
      workHoursDistribution,
      weekdayDistribution,
      topLanguages
    },
    workPatterns: {
      averageStartTime: '9:30 AM',
      averageEndTime: '6:15 PM',
      weekendWorkPercentage: 15,
      consistencyScore: 82
    },
    trends: {
      trend: 'improving',
      percentageChange: 8.5,
      metrics: {
        previous: {
          commitCount: 76,
          prCount: 10,
          issueCount: 12,
          codeQualityScore: 72
        },
        current: {
          commitCount: 87,
          prCount: 12,
          issueCount: 8,
          codeQualityScore: 78
        }
      }
    }
  };
};

/**
 * GET /api/analytics/productivity
 * Get productivity metrics for a user
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
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    // Parse dates
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam ? new Date(startDateParam) : subDays(endDate, 30);
    
    // Generate mock data
    const mockData = generateMockProductivityData(startDate, endDate);
    
    // Return mock data
    return NextResponse.json(
      {
        success: true,
        data: mockData,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in productivity metrics API route:', error);
    
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