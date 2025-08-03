/**
 * Repository Sync API Route
 * Handles repository synchronization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { addJob, JobType, JobPriority } from '@/lib/jobs/queue-manager';
import { AppError, ErrorCode } from '@/lib/types/api';
import { env } from '@/lib/utils/env';

// Sync request schema
const syncRequestSchema = z.object({
  repositoryIds: z.array(z.string()).optional(),
  syncType: z.enum(['initial', 'incremental']).default('initial'),
});

/**
 * POST /api/github/repositories/sync
 * Trigger repository synchronization
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
    const result = syncRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Invalid sync request',
            details: result.error.format(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Get validated data
    const { repositoryIds, syncType } = result.data;
    
    // Create job based on sync type
    let job;
    
    if (syncType === 'initial') {
      // Create initial sync job
      job = await addJob(
        JobType.INITIAL_SYNC,
        JobType.INITIAL_SYNC,
        {
          userId: session.user.id,
          repositoryIds,
        },
        {
          priority: JobPriority.HIGH,
          jobId: `initial-sync-${session.user.id}-${Date.now()}`,
        }
      );
    } else {
      // Create incremental sync job
      job = await addJob(
        JobType.INCREMENTAL_SYNC,
        JobType.INCREMENTAL_SYNC,
        {
          userId: session.user.id,
          repositoryIds,
        },
        {
          priority: JobPriority.MEDIUM,
          jobId: `incremental-sync-${session.user.id}-${Date.now()}`,
        }
      );
    }
    
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
    console.error('Error in repository sync API route:', error);
    
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