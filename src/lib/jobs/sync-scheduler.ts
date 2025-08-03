/**
 * Sync Scheduler
 * Schedules daily incremental sync jobs
 */

import { Queue, QueueScheduler } from 'bullmq';
import { getRedisClient } from '@/lib/db/redis';
import { JobType, JobPriority } from './queue-manager';
import { prisma } from '@/lib/db/prisma';
import { format } from 'date-fns';

// Queue configuration
const queueConfig = {
  connection: {
    // Use Redis client connection
    client: getRedisClient(),
  },
};

// Queue name
const QUEUE_NAME = 'sync-scheduler';

// Queue and scheduler instances
let queue: Queue | null = null;
let scheduler: QueueScheduler | null = null;

/**
 * Initialize sync scheduler
 */
export async function initializeSyncScheduler(): Promise<void> {
  try {
    // Create queue scheduler
    scheduler = new QueueScheduler(QUEUE_NAME, {
      connection: queueConfig.connection,
    });
    
    // Create queue
    queue = new Queue(QUEUE_NAME, {
      ...queueConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: {
          age: 7 * 24 * 60 * 60, // Keep completed jobs for 7 days
          count: 100, // Keep last 100 completed jobs
        },
        removeOnFail: {
          age: 30 * 24 * 60 * 60, // Keep failed jobs for 30 days
          count: 100, // Keep last 100 failed jobs
        },
      },
    });
    
    console.log('Sync scheduler initialized');
    
    // Schedule daily sync job
    await scheduleDailySync();
  } catch (error) {
    console.error('Error initializing sync scheduler:', error);
    throw error;
  }
}

/**
 * Schedule daily sync job
 */
async function scheduleDailySync(): Promise<void> {
  try {
    if (!queue) {
      throw new Error('Sync scheduler not initialized');
    }
    
    // Schedule job to run at 2:00 AM every day
    const jobId = `daily-sync-${format(new Date(), 'yyyy-MM-dd')}`;
    
    // Check if job already exists
    const existingJob = await queue.getJob(jobId);
    
    if (existingJob) {
      console.log(`Daily sync job ${jobId} already scheduled`);
      return;
    }
    
    // Add job to queue
    await queue.add(
      'daily-sync',
      { scheduledAt: new Date().toISOString() },
      {
        jobId,
        repeat: {
          pattern: '0 2 * * *', // Run at 2:00 AM every day (cron format)
        },
      }
    );
    
    console.log(`Daily sync job ${jobId} scheduled`);
  } catch (error) {
    console.error('Error scheduling daily sync job:', error);
    throw error;
  }
}

/**
 * Process daily sync job
 */
export async function processDailySyncJob(): Promise<void> {
  try {
    console.log('Processing daily sync job');
    
    // Get all users with selected repositories
    const users = await prisma.user.findMany({
      where: {
        userSettings: {
          selectedRepositories: {
            isEmpty: false,
          },
        },
      },
      select: {
        id: true,
      },
    });
    
    console.log(`Found ${users.length} users with selected repositories`);
    
    // Create incremental sync job for each user
    for (const user of users) {
      try {
        // Create job in incremental sync queue
        const jobId = `incremental-sync-${user.id}-${format(new Date(), 'yyyy-MM-dd')}`;
        
        // Import dynamically to avoid circular dependencies
        const { addJob } = await import('./queue-manager');
        
        // Add job to queue
        await addJob(
          JobType.INCREMENTAL_SYNC,
          JobType.INCREMENTAL_SYNC,
          {
            userId: user.id,
          },
          {
            priority: JobPriority.LOW,
            jobId,
          }
        );
        
        console.log(`Created incremental sync job ${jobId} for user ${user.id}`);
      } catch (error) {
        console.error(`Error creating incremental sync job for user ${user.id}:`, error);
      }
    }
    
    console.log('Daily sync job completed');
  } catch (error) {
    console.error('Error processing daily sync job:', error);
    throw error;
  }
}

/**
 * Close sync scheduler
 */
export async function closeSyncScheduler(): Promise<void> {
  try {
    if (scheduler) {
      await scheduler.close();
      scheduler = null;
    }
    
    if (queue) {
      await queue.close();
      queue = null;
    }
    
    console.log('Sync scheduler closed');
  } catch (error) {
    console.error('Error closing sync scheduler:', error);
    throw error;
  }
}