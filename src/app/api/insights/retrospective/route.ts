/**
 * Retrospective API Route
 * Generates AI-powered team retrospectives
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { calculateTeamVelocity, calculateTeamCollaboration, calculateKnowledgeDistribution } from '@/lib/analytics/team-collaboration';
import { generateRetrospective } from '@/lib/ai/insights-service';
import { AppError, ErrorCode } from '@/lib/types/api';
import { env } from '@/lib/utils/env';

// Retrospective request schema
const retrospectiveRequestSchema = z.object({
  repositoryId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

/**
 * POST /api/insights/retrospective
 * Generate a team retrospective
 */
export async function POST(request: NextRequest) {
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
    
    // Parse request body
    const body = await request.json();
    
    // Validate request
    const result = retrospectiveRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Invalid retrospective request',
            details: result.error.format(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Get validated data
    const { repositoryId, startDate, endDate } = result.data;
    
    // Check if user has access to repository
    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId,
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
      start: new Date(startDate),
      end: new Date(endDate),
    };
    
    // Calculate team metrics
    const velocity = await calculateTeamVelocity(repositoryId, timeRange);
    const collaboration = await calculateTeamCollaboration(repositoryId, timeRange);
    const knowledgeDistribution = await calculateKnowledgeDistribution(repositoryId, timeRange);
    
    // Get member count
    const members = await prisma.commit.groupBy({
      by: ['authorId'],
      where: {
        repositoryId,
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
        repositoryId,
        authorDate: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });
    
    // Get PR count
    const prCount = await prisma.pullRequest.count({
      where: {
        repositoryId,
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });
    
    // Get issue count
    const issueCount = await prisma.issue.count({
      where: {
        repositoryId,
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });
    
    // Create team metrics object
    const teamMetrics = {
      repositoryId,
      timeRange,
      memberCount: members.length,
      totalCommits: commitCount,
      totalPRs: prCount,
      totalIssues: issueCount,
      velocity,
      collaboration,
      knowledgeDistribution,
    };
    
    // Generate retrospective
    const retrospective = await generateRetrospective(teamMetrics);
    
    // Save retrospective to database
    const savedRetrospective = await prisma.retrospective.create({
      data: {
        repositoryId,
        startDate: timeRange.start,
        endDate: timeRange.end,
        positives: retrospective.positives,
        improvements: retrospective.improvements,
        actionItems: retrospective.actionItems,
        teamHealthScore: retrospective.teamHealth.score,
        observations: retrospective.teamHealth.observations,
        recommendations: retrospective.recommendations,
      },
    });
    
    // Return retrospective
    return NextResponse.json(
      {
        success: true,
        data: {
          id: savedRetrospective.id,
          retrospective,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in retrospective API route:', error);
    
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
 * GET /api/insights/retrospective
 * Get saved retrospectives
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
    const retrospectiveId = searchParams.get('id');
    
    // If retrospective ID is provided, get specific retrospective
    if (retrospectiveId) {
      const retrospective = await prisma.retrospective.findUnique({
        where: {
          id: retrospectiveId,
        },
      });
      
      if (!retrospective) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ErrorCode.RECORD_NOT_FOUND,
              message: 'Retrospective not found',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }
      
      // Check if user has access to repository
      const repository = await prisma.repository.findUnique({
        where: {
          id: retrospective.repositoryId,
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
      
      // Return retrospective
      return NextResponse.json(
        {
          success: true,
          data: {
            retrospective: {
              id: retrospective.id,
              period: {
                start: retrospective.startDate,
                end: retrospective.endDate,
              },
              positives: retrospective.positives,
              improvements: retrospective.improvements,
              actionItems: retrospective.actionItems,
              teamHealth: {
                score: Number(retrospective.teamHealthScore),
                observations: retrospective.observations,
              },
              recommendations: retrospective.recommendations,
              createdAt: retrospective.createdAt,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }
    
    // Otherwise, get retrospectives for repository
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
    
    // Check if user has access to repository
    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId,
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
    
    // Get retrospectives for repository
    const retrospectives = await prisma.retrospective.findMany({
      where: {
        repositoryId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Return retrospectives
    return NextResponse.json(
      {
        success: true,
        data: {
          retrospectives: retrospectives.map(retro => ({
            id: retro.id,
            period: {
              start: retro.startDate,
              end: retro.endDate,
            },
            teamHealth: {
              score: Number(retro.teamHealthScore),
            },
            createdAt: retro.createdAt,
          })),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in retrospective API route:', error);
    
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