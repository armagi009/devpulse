/**
 * Metrics API Route
 * Handles metrics calculation and retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { addJob, JobType, JobPriority } from '@/lib/jobs/queue-manager';
import { AppError, ErrorCode } from '@/lib/types/api';
import { prisma } from '@/lib/db/prisma';
import { env } from '@/lib/utils/env';

// Metrics calculation request schema
const metricsCalculationSchema = z.object({
  repositoryId: z.string().uuid().optional(),
  days: z.number().int().positive().default(30),
});

// Metrics query schema
const metricsQuerySchema = z.object({
  repositoryId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * POST /api/analytics/metrics
 * Trigger metrics calculation
 */
export async function POST(request: NextRequest) {
  try {
    // Check if background jobs are enabled
    if (!env().ENABLE_BACKGROUND_JOBS) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.FORBIDDEN,
            message: 'Background jobs are disabled',
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
    const result = metricsCalculationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Invalid metrics calculation request',
            details: result.error.format(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Get validated data
    const { repositoryId, days } = result.data;
    
    // Create metrics calculation job
    const job = await addJob(
      JobType.METRICS_CALCULATION,
      JobType.METRICS_CALCULATION,
      {
        userId: session.user.id,
        repositoryId,
        days,
      },
      {
        priority: JobPriority.MEDIUM,
        jobId: `metrics-calculation-${session.user.id}-${repositoryId || 'all'}-${Date.now()}`,
      }
    );
    
    // Return job details
    return NextResponse.json(
      {
        success: true,
        data: {
          jobId: job.id,
          type: job.name,
          status: await job.getState(),
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in metrics calculation API route:', error);
    
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
 * GET /api/analytics/metrics
 * Get metrics for a user
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Validate query parameters
    const result = metricsQuerySchema.safeParse({
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
            message: 'Invalid metrics query parameters',
            details: result.error.format(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Get validated data
    const { repositoryId: validatedRepoId, startDate: validatedStartDate, endDate: validatedEndDate } = result.data;
    
    // Build query
    const query: any = {
      userId: session.user.id,
    };
    
    if (validatedRepoId) {
      query.repositoryId = validatedRepoId;
    }
    
    if (validatedStartDate || validatedEndDate) {
      query.date = {};
      
      if (validatedStartDate) {
        query.date.gte = new Date(validatedStartDate);
      }
      
      if (validatedEndDate) {
        query.date.lte = new Date(validatedEndDate);
      }
    }
    
    // Get metrics from database
    const metrics = await prisma.burnoutMetric.findMany({
      where: query,
      orderBy: {
        date: 'asc',
      },
      include: {
        repository: {
          select: {
            id: true,
            name: true,
            fullName: true,
          },
        },
      },
    });
    
    // Return metrics
    return NextResponse.json(
      {
        success: true,
        data: {
          metrics,
          count: metrics.length,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in metrics API route:', error);
    
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