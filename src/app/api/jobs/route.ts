/**
 * Jobs API Route
 * Handles job management operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { 
  addJob, 
  getJob, 
  getJobsByStatus, 
  JobType, 
  JobPriority, 
  JobStatus 
} from '@/lib/jobs/queue-manager';
import { AppError, ErrorCode } from '@/lib/types/api';
import { env } from '@/lib/utils/env';

// Job request schema
const jobRequestSchema = z.object({
  type: z.enum([
    JobType.REPOSITORY_SYNC,
    JobType.INITIAL_SYNC,
    JobType.INCREMENTAL_SYNC,
    JobType.METRICS_CALCULATION,
    JobType.BURNOUT_ANALYSIS,
    JobType.TEAM_METRICS,
  ]),
  data: z.record(z.any()),
  options: z.object({
    priority: z.enum([
      JobPriority.LOW.toString(),
      JobPriority.MEDIUM.toString(),
      JobPriority.HIGH.toString(),
      JobPriority.CRITICAL.toString(),
    ]).transform(val => parseInt(val)).optional(),
    delay: z.number().optional(),
    attempts: z.number().optional(),
    jobId: z.string().optional(),
  }).optional(),
});

/**
 * POST /api/jobs
 * Create a new job
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
    const result = jobRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Invalid job request',
            details: result.error.format(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Get validated data
    const { type, data, options } = result.data;
    
    // Add user ID to job data
    const jobData = {
      ...data,
      userId: session.user.id,
    };
    
    // Add job to queue
    const job = await addJob(type, type, jobData, options);
    
    // Return job details
    return NextResponse.json(
      {
        success: true,
        data: {
          jobId: job.id,
          type,
          status: await job.getState(),
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in jobs API route:', error);
    
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
 * Get job by ID
 */
async function getJobById(request: NextRequest, jobId: string) {
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as JobType || JobType.REPOSITORY_SYNC;
    
    // Get job
    const job = await getJob(type, jobId);
    
    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.RECORD_NOT_FOUND,
            message: `Job ${jobId} not found`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
    
    // Check if job belongs to user
    const jobData = job.data as { userId: string };
    
    if (jobData.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.FORBIDDEN,
            message: 'You do not have permission to access this job',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }
    
    // Get job details
    const state = await job.getState();
    const progress = await job.progress;
    
    // Return job details
    return NextResponse.json(
      {
        success: true,
        data: {
          id: job.id,
          type: job.name,
          status: state,
          progress,
          data: job.data,
          timestamp: job.timestamp,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in jobs API route:', error);
    
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
 * GET /api/jobs
 * Get jobs by status or job ID
 */
export async function GET(request: NextRequest) {
  // Check if this is a request for a specific job
  const jobId = request.nextUrl.searchParams.get('jobId');
  
  if (jobId) {
    return getJobById(request, jobId);
  }
  
  // Otherwise, get jobs by status
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as JobType | null;
    const statusParam = searchParams.get('status');
    const start = parseInt(searchParams.get('start') || '0');
    const end = parseInt(searchParams.get('end') || '100');
    
    // Parse status parameter
    let status: JobStatus | JobStatus[];
    if (statusParam) {
      status = statusParam.split(',') as JobStatus[];
    } else {
      status = [JobStatus.WAITING, JobStatus.ACTIVE, JobStatus.DELAYED];
    }
    
    // Get jobs
    const jobs = await getJobsByStatus(type || JobType.REPOSITORY_SYNC, status, start, end);
    
    // Filter jobs by user ID
    const userJobs = jobs.filter(job => {
      const jobData = job.data as { userId: string };
      return jobData.userId === session.user.id;
    });
    
    // Get job details
    const jobDetails = await Promise.all(
      userJobs.map(async (job) => {
        const state = await job.getState();
        const progress = await job.progress;
        
        return {
          id: job.id,
          type: job.name,
          status: state,
          progress,
          data: job.data,
          timestamp: job.timestamp,
        };
      })
    );
    
    // Return job details
    return NextResponse.json(
      {
        success: true,
        data: {
          jobs: jobDetails,
          total: jobDetails.length,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in jobs API route:', error);
    
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