/**
 * Team Insights API Route
 * Provides AI-powered team insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { calculateTeamVelocity, calculateTeamCollaboration, calculateKnowledgeDistribution } from '@/lib/analytics/team-collaboration';
import { generateTeamInsights } from '@/lib/ai/insights-service';
import { AppError, ErrorCode } from '@/lib/types/api';
import { env } from '@/lib/utils/env';

// Team insights query schema
const teamInsightsQuerySchema = z.object({
  repositoryId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * GET /api/insights/team
 * Get AI-powered team insights
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
    const result = teamInsightsQuerySchema.safeParse({
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
            message: 'Invalid team insights query parameters',
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
    
    // Check if user has access to repository
    const repository = await prisma.repository.findUnique({
      where: {
        id: validatedRepoId,
      },
    });
    
    if (!repository) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.RECORD_NOT_FOUND,
            message: 'Repository not found',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
    
    // Create time range
    const timeRange = {
      start: new Date(validatedStartDate),
      end: new Date(validatedEndDate),
    };
    
    // Calculate team metrics
    const velocity = await calculateTeamVelocity(validatedRepoId, timeRange);
    const collaboration = await calculateTeamCollaboration(validatedRepoId, timeRange);
    const knowledgeDistribution = await calculateKnowledgeDistribution(validatedRepoId, timeRange);
    
    // Get member count
    const members = await prisma.commit.groupBy({
      by: ['authorId'],
      where: {
        repositoryId: validatedRepoId,
        authorDate: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
        authorId: {
          not: null,
        },
      },
    });
    
    // Get commit count
    const commitCount = await prisma.commit.count({
      where: {
        repositoryId: validatedRepoId,
        authorDate: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });
    
    // Get PR count
    const prCount = await prisma.pullRequest.count({
      where: {
        repositoryId: validatedRepoId,
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });
    
    // Get issue count
    const issueCount = await prisma.issue.count({
      where: {
        repositoryId: validatedRepoId,
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });
    
    // Create team metrics object
    const teamMetrics = {
      repositoryId: validatedRepoId,
      timeRange,
      memberCount: members.length,
      totalCommits: commitCount,
      totalPRs: prCount,
      totalIssues: issueCount,
      velocity,
      collaboration,
      knowledgeDistribution,
    };
    
    // Generate insights
    const insights = await generateTeamInsights(teamMetrics);
    
    // Return team insights
    return NextResponse.json(
      {
        success: true,
        data: {
          teamMetrics,
          insights,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in team insights API route:', error);
    
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