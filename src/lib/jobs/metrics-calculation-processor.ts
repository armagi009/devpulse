/**
 * Metrics Calculation Processor
 * Processes metrics calculation jobs
 */

import { Job } from 'bullmq';
import { prisma } from '@/lib/db/prisma';
import { processAndSaveMetrics } from '@/lib/analytics/data-processor';
import { processTeamMetrics } from '@/lib/jobs/team-metrics-processor';
import { JobResult } from './queue-manager';

// Metrics calculation job data
interface MetricsCalculationJobData {
  userId: string;
  repositoryId?: string; // If not provided, calculate for all repositories
  days?: number; // Number of days to calculate metrics for
}

/**
 * Process metrics calculation job
 */
export async function processMetricsCalculationJob(
  job: Job<MetricsCalculationJobData>
): Promise<JobResult> {
  try {
    const { userId, repositoryId, days = 30 } = job.data;
    
    // Update job progress
    await job.updateProgress({ progress: 0, message: 'Starting metrics calculation' });
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    // Get repositories to process
    let repositories: { id: string; name: string }[] = [];
    
    if (repositoryId) {
      // Process specific repository
      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        select: { id: true, name: true },
      });
      
      if (!repository) {
        throw new Error(`Repository ${repositoryId} not found`);
      }
      
      repositories = [repository];
    } else {
      // Process all repositories for user
      repositories = await prisma.repository.findMany({
        where: { ownerId: userId },
        select: { id: true, name: true },
      });
    }
    
    // Update job progress
    await job.updateProgress({ 
      progress: 10, 
      message: `Found ${repositories.length} repositories to process`,
      details: { repositoryCount: repositories.length } 
    });
    
    // Process each repository
    for (let i = 0; i < repositories.length; i++) {
      const repository = repositories[i];
      
      try {
        // Update job progress
        await job.updateProgress({ 
          progress: 10 + Math.floor(((i) / repositories.length) * 80),
          message: `Processing repository ${i + 1}/${repositories.length}: ${repository.name}`,
          details: { 
            repositoryCount: repositories.length,
            currentRepository: repository.name,
          } 
        });
        
        // Process and save individual metrics
        await processAndSaveMetrics(userId, repository.id, days);
        
        // Process and save team metrics
        await processTeamMetrics(repository.id);
        
        // Update job progress
        await job.updateProgress({ 
          progress: 10 + Math.floor(((i + 1) / repositories.length) * 80),
          message: `Processed repository ${i + 1}/${repositories.length}: ${repository.name}`,
          details: { 
            repositoryCount: repositories.length,
            processedCount: i + 1,
            currentRepository: repository.name,
          } 
        });
      } catch (error) {
        console.error(`Error processing metrics for repository ${repository.name}:`, error);
        
        // Continue with next repository
        continue;
      }
    }
    
    // Update job progress
    await job.updateProgress({ 
      progress: 100, 
      message: 'Metrics calculation completed',
      details: { 
        repositoryCount: repositories.length,
        processedCount: repositories.length,
      } 
    });
    
    // Return success result
    return {
      success: true,
      message: 'Metrics calculation completed successfully',
      data: {
        repositoryCount: repositories.length,
      },
    };
  } catch (error) {
    console.error('Error processing metrics calculation job:', error);
    
    // Return error result
    return {
      success: false,
      message: 'Metrics calculation failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}