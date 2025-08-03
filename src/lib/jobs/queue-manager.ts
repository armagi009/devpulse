/**
 * Queue Manager
 * Manages job queues for background processing
 */

import { Queue, Worker, QueueScheduler, Job, QueueEvents } from 'bullmq';
import { getRedisClient } from '@/lib/db/redis';
import { env } from '@/lib/utils/env';

// Job types
export enum JobType {
  REPOSITORY_SYNC = 'repository-sync',
  INITIAL_SYNC = 'initial-sync',
  INCREMENTAL_SYNC = 'incremental-sync',
  METRICS_CALCULATION = 'metrics-calculation',
  BURNOUT_ANALYSIS = 'burnout-analysis',
  TEAM_METRICS = 'team-metrics',
}

// Job priority levels
export enum JobPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

// Job status
export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused',
}

// Job data interface
export interface JobData {
  userId: string;
  [key: string]: any;
}

// Job result interface
export interface JobResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: any;
}

// Job progress interface
export interface JobProgress {
  progress: number;
  message?: string;
  details?: any;
}

// Queue configuration
const queueConfig = {
  connection: {
    // Use Redis client connection
    client: getRedisClient(),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 60 * 60, // Keep completed jobs for 24 hours
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 60 * 60, // Keep failed jobs for 7 days
      count: 500, // Keep last 500 failed jobs
    },
  },
};

// Queue instances
const queues: Record<string, Queue> = {};
const workers: Record<string, Worker> = {};
const schedulers: Record<string, QueueScheduler> = {};
const queueEvents: Record<string, QueueEvents> = {};

/**
 * Initialize queue
 */
export function initializeQueue(queueName: string): Queue {
  if (!queues[queueName]) {
    // Create queue
    queues[queueName] = new Queue(queueName, queueConfig);
    
    // Create queue events
    queueEvents[queueName] = new QueueEvents(queueName, {
      connection: queueConfig.connection,
    });
    
    // Create queue scheduler
    schedulers[queueName] = new QueueScheduler(queueName, {
      connection: queueConfig.connection,
    });
    
    // Set up event listeners
    queueEvents[queueName].on('completed', ({ jobId, returnvalue }) => {
      console.log(`Job ${jobId} completed with result:`, returnvalue);
    });
    
    queueEvents[queueName].on('failed', ({ jobId, failedReason }) => {
      console.error(`Job ${jobId} failed with reason:`, failedReason);
    });
    
    queueEvents[queueName].on('progress', ({ jobId, data }) => {
      console.log(`Job ${jobId} progress:`, data);
    });
  }
  
  return queues[queueName];
}

/**
 * Get queue
 */
export function getQueue(queueName: string): Queue {
  if (!queues[queueName]) {
    return initializeQueue(queueName);
  }
  
  return queues[queueName];
}

/**
 * Register worker
 */
export function registerWorker(
  queueName: string,
  processor: (job: Job) => Promise<JobResult>
): Worker {
  if (!workers[queueName]) {
    workers[queueName] = new Worker(
      queueName,
      async (job) => {
        try {
          // Process job
          return await processor(job);
        } catch (error) {
          console.error(`Error processing job ${job.id}:`, error);
          throw error;
        }
      },
      { connection: queueConfig.connection }
    );
    
    // Set up event listeners
    workers[queueName].on('completed', (job) => {
      console.log(`Worker completed job ${job.id}`);
    });
    
    workers[queueName].on('failed', (job, error) => {
      console.error(`Worker failed job ${job.id}:`, error);
    });
    
    workers[queueName].on('error', (error) => {
      console.error(`Worker error:`, error);
    });
  }
  
  return workers[queueName];
}

/**
 * Add job to queue
 */
export async function addJob(
  queueName: string,
  jobName: string,
  data: JobData,
  options: {
    priority?: JobPriority;
    delay?: number;
    attempts?: number;
    jobId?: string;
  } = {}
): Promise<Job> {
  const queue = getQueue(queueName);
  
  // Add job to queue
  return queue.add(jobName, data, {
    priority: options.priority || JobPriority.MEDIUM,
    delay: options.delay || 0,
    attempts: options.attempts || queueConfig.defaultJobOptions.attempts,
    jobId: options.jobId,
  });
}

/**
 * Get job by ID
 */
export async function getJob(queueName: string, jobId: string): Promise<Job | null> {
  const queue = getQueue(queueName);
  return queue.getJob(jobId);
}

/**
 * Get jobs by status
 */
export async function getJobsByStatus(
  queueName: string,
  status: JobStatus | JobStatus[],
  start = 0,
  end = 100
): Promise<Job[]> {
  const queue = getQueue(queueName);
  
  if (Array.isArray(status)) {
    // Get jobs for multiple statuses
    const jobsPromises = status.map(s => queue.getJobs([s], start, end));
    const jobsArrays = await Promise.all(jobsPromises);
    return jobsArrays.flat();
  }
  
  // Get jobs for single status
  return queue.getJobs([status], start, end);
}

/**
 * Close all queues and workers
 */
export async function closeQueues(): Promise<void> {
  // Close all workers
  await Promise.all(
    Object.values(workers).map(worker => worker.close())
  );
  
  // Close all schedulers
  await Promise.all(
    Object.values(schedulers).map(scheduler => scheduler.close())
  );
  
  // Close all queue events
  await Promise.all(
    Object.values(queueEvents).map(events => events.close())
  );
  
  // Close all queues
  await Promise.all(
    Object.values(queues).map(queue => queue.close())
  );
  
  // Clear instances
  Object.keys(workers).forEach(key => delete workers[key]);
  Object.keys(schedulers).forEach(key => delete schedulers[key]);
  Object.keys(queueEvents).forEach(key => delete queueEvents[key]);
  Object.keys(queues).forEach(key => delete queues[key]);
}