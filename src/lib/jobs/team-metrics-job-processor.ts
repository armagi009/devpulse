/**
 * Team Metrics Job Processor
 * Processes team metrics calculation jobs
 */

import { Job } from 'bullmq';
import { prisma } from '@/lib/db/prisma';
import { processTeamMetrics, processAllTeamMetrics } from '@/lib/jobs/team-metrics-processor';
import { JobResult } from './queue-manager';

// Team metrics job data
interface TeamMetricsJobData {
  repositoryId?: string; // If not provided, calculate for all repositories
}

/**
 * Process team metrics job
 */
export async function processTeamMetricsJob(
  job: Job<TeamMetricsJobData>
): Promise<JobResult> {
  try {
    const { repositoryId } = job.data;
    
    // Update job progress
    await job.updateProgress({ progress: 0, message: 'Starting team metrics calculation' });
    
    if (repositoryId) {
      // Process specific repository
      // Update job progress
      await job.updateProgress({ 
        progress: 10, 
        message: `Processing team metrics for repository ${repositoryId}`,
      });
      
      // Process team metrics
      await processTeamMetrics(repositoryId);
      
      // Update job progress
      await job.updateProgress({ 
        progress: 100, 
        message: `Team metrics processed for repository ${repositoryId}`,
      });
      
      // Return success result
      return {
        success: true,
        message: `Team metrics calculation completed for repository ${repositoryId}`,
      };
    } else {
      // Process all repositories
      // Update job progress
      await job.updateProgress({ 
        progress: 10, 
        message: 'Processing team metrics for all repositories',
      });
      
      // Process all team metrics
      await processAllTeamMetrics();
      
      // Update job progress
      await job.updateProgress({ 
        progress: 100, 
        message: 'Team metrics processed for all repositories',
      });
      
      // Return success result
      return {
        success: true,
        message: 'Team metrics calculation completed for all repositories',
      };
    }
  } catch (error) {
    console.error('Error processing team metrics job:', error);
    
    // Return error result
    return {
      success: false,
      message: 'Team metrics calculation failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}