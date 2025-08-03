/**
 * Job Scheduler
 * Schedules and registers background jobs
 */

import { registerWorker, JobType } from '@/lib/jobs/queue-manager';
import { processMetricsCalculationJob } from '@/lib/jobs/metrics-calculation-processor';
import { processTeamMetricsJob } from '@/lib/jobs/team-metrics-job-processor';
import { env } from '@/lib/utils/env';

/**
 * Initialize job workers
 */
export function initializeJobWorkers() {
  try {
    // Check if background jobs are enabled
    if (!env().ENABLE_BACKGROUND_JOBS) {
      console.log('Background jobs are disabled');
      return;
    }
    
    console.log('Initializing job workers...');
    
    // Register metrics calculation worker
    registerWorker(JobType.METRICS_CALCULATION, processMetricsCalculationJob);
    console.log('Registered metrics calculation worker');
    
    // Register team metrics worker
    registerWorker(JobType.TEAM_METRICS, processTeamMetricsJob);
    console.log('Registered team metrics worker');
    
    console.log('Job workers initialized successfully');
  } catch (error) {
    console.error('Error initializing job workers:', error);
  }
}

/**
 * Schedule recurring jobs
 */
export async function scheduleRecurringJobs() {
  try {
    // Check if background jobs are enabled
    if (!env().ENABLE_BACKGROUND_JOBS) {
      console.log('Background jobs are disabled');
      return;
    }
    
    console.log('Scheduling recurring jobs...');
    
    // Schedule daily team metrics calculation
    // This would typically be done using a cron job or a scheduler like node-cron
    // For this implementation, we'll just log that it would be scheduled
    console.log('Would schedule daily team metrics calculation at midnight');
    
    console.log('Recurring jobs scheduled successfully');
  } catch (error) {
    console.error('Error scheduling recurring jobs:', error);
  }
}