/**
 * Team Analytics API Route
 * Optimized for performance with caching, pagination, and monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { ErrorCode } from '@/lib/types/api';
import { withApiCache, createCacheKey } from '@/lib/utils/api-cache';
import { withPerformanceMonitoring } from '@/lib/utils/api-performance';
import { getPaginationParams, addPaginationHeaders } from '@/lib/utils/pagination';
import { subDays } from 'date-fns';
import { prisma } from '@/lib/db/prisma';

// Generate mock team analytics data with pagination support
const generateMockTeamData = (teamId: string, startDate: Date, endDate: Date, page: number, pageSize: number) => {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate all days in the range for velocity data
  const allDays = Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString(),
      value: Math.floor(Math.random() * 15) + 5
    };
  });
  
  // Apply pagination to velocity data
  const totalItems = allDays.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const velocityData = allDays.slice(startIndex, endIndex);
  
  // Generate mock team members
  const teamMembers = [
    { id: '1', name: 'Alice Johnson', role: 'Team Lead', commits: 45, prs: 8 },
    { id: '2', name: 'Bob Smith', role: 'Developer', commits: 78, prs: 12 },
    { id: '3', name: 'Charlie Davis', role: 'Developer', commits: 56, prs: 9 },
    { id: '4', name: 'Diana Wilson', role: 'Developer', commits: 62, prs: 7 },
    { id: '5', name: 'Edward Brown', role: 'Developer', commits: 34, prs: 5 }
  ];
  
  // Generate mock collaboration network
  const collaborationNetwork = {
    nodes: teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      commits: member.commits
    })),
    links: [
      { source: '1', target: '2', strength: 0.8 },
      { source: '1', target: '3', strength: 0.6 },
      { source: '1', target: '4', strength: 0.7 },
      { source: '1', target: '5', strength: 0.5 },
      { source: '2', target: '3', strength: 0.9 },
      { source: '2', target: '4', strength: 0.4 },
      { source: '3', target: '5', strength: 0.7 },
      { source: '4', target: '5', strength: 0.6 }
    ]
  };
  
  // Generate mock knowledge distribution
  const knowledgeDistribution = [
    { path: 'src/components', members: ['1', '2', '3', '4', '5'], distribution: [0.3, 0.2, 0.2, 0.2, 0.1] },
    { path: 'src/lib', members: ['1', '2', '3'], distribution: [0.5, 0.3, 0.2] },
    { path: 'src/app', members: ['2', '3', '4'], distribution: [0.4, 0.4, 0.2] },
    { path: 'src/styles', members: ['1', '5'], distribution: [0.7, 0.3] },
    { path: 'src/utils', members: ['2', '4'], distribution: [0.6, 0.4] }
  ];
  
  return {
    teamId,
    timeRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    metrics: {
      velocity: {
        data: velocityData,
        average: 8.5,
        trend: 'increasing',
        percentageChange: 12.3
      },
      collaboration: {
        network: collaborationNetwork,
        score: 0.75,
        bottlenecks: [
          { memberId: '5', reason: 'Limited collaboration with team members' }
        ]
      },
      knowledgeDistribution: {
        data: knowledgeDistribution,
        silos: [
          { path: 'src/styles', primaryMember: '1', concentration: 0.7 },
          { path: 'src/utils', primaryMember: '2', concentration: 0.6 }
        ]
      },
      pullRequestFlow: {
        averageTimeToMerge: 36,
        reviewDistribution: [
          { memberId: '1', count: 15 },
          { memberId: '2', count: 8 },
          { memberId: '3', count: 12 },
          { memberId: '4', count: 6 },
          { memberId: '5', count: 4 }
        ],
        bottlenecks: [
          { type: 'review', averageDelay: 24, affectedPRs: 5 }
        ]
      },
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize)
      }
    }
  };
};

/**
 * Get team analytics
 * Optimized with caching, pagination, and performance monitoring
 */
async function getTeamAnalyticsHandler(request: NextRequest) {
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
    const teamId = searchParams.get('teamId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    // Validate team ID
    if (!teamId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Team ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Parse dates
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam ? new Date(startDateParam) : subDays(endDate, 30);
    
    // Get pagination parameters
    const { page, pageSize } = getPaginationParams(request);
    
    // In a real implementation, we would fetch data from the database
    // Here's how we would optimize the database query:
    /*
    // Check if user has access to the team
    const teamMembership = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
      },
    });
    
    if (!teamMembership) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.FORBIDDEN,
            message: 'You do not have access to this team',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }
    
    // Fetch team metrics with pagination and optimized query
    // Note: Using proper indexing on teamId and date fields
    const [teamMetrics, totalDays] = await Promise.all([
      prisma.teamMetric.findMany({
        where: {
          teamId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
        // Select only the fields we need
        select: {
          date: true,
          velocityScore: true,
          collaborationScore: true,
          prMergeRate: true,
          cycleTimeAverage: true,
        },
        // Apply pagination
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.teamMetric.count({
        where: {
          teamId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);
    
    // Fetch team members in a separate query to avoid large joins
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
    
    // Process the data and calculate team analytics
    const teamData = calculateTeamAnalytics(teamMetrics, teamMembers, totalDays, page, pageSize);
    */
    
    // Generate mock data with pagination
    const mockData = generateMockTeamData(teamId, startDate, endDate, page, pageSize);
    
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: mockData,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
    
    // Add pagination headers
    addPaginationHeaders(
      response.headers,
      request.url,
      mockData.metrics.pagination
    );
    
    // Add cache header
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=120');
    
    return response;
  } catch (error) {
    console.error('Error in team analytics API route:', error);
    
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

// Export the GET handler with caching and performance monitoring
export const GET = withPerformanceMonitoring(
  withApiCache(
    getTeamAnalyticsHandler,
    'analytics',
    (req) => createCacheKey(req, 'team')
  )
);