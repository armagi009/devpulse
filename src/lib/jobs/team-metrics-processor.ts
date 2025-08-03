/**
 * Team Metrics Processor
 * Background job to calculate and store team metrics
 */

import { prisma } from '@/lib/db/prisma';
import { 
  calculateTeamVelocity, 
  calculateTeamCollaboration, 
  calculateKnowledgeDistribution,
  saveTeamMetrics
} from '@/lib/analytics/team-collaboration';
import { subDays } from 'date-fns';

/**
 * Process team metrics for a repository
 */
export async function processTeamMetrics(repositoryId: string): Promise<void> {
  try {
    console.log(`Processing team metrics for repository ${repositoryId}`);
    
    // Get repository
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
    });
    
    if (!repository) {
      throw new Error(`Repository ${repositoryId} not found`);
    }
    
    // Define time range (last 30 days)
    const now = new Date();
    const timeRange = {
      start: subDays(now, 30),
      end: now,
    };
    
    // Calculate team velocity
    const velocity = await calculateTeamVelocity(repositoryId, timeRange);
    
    // Calculate team collaboration
    const collaboration = await calculateTeamCollaboration(repositoryId, timeRange);
    
    // Calculate knowledge distribution
    const knowledge = await calculateKnowledgeDistribution(repositoryId, timeRange);
    
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
    
    // Save metrics to database
    await saveTeamMetrics(repositoryId, now, {
      velocityScore: velocity.velocityScore,
      prMergeRate: velocity.prMergeRate,
      issueResolutionRate: velocity.issueResolutionRate,
      cycleTimeAverage: velocity.cycleTimeAverage,
      collaborationScore: collaboration.collaborationScore,
      knowledgeSharingScore: knowledge.knowledgeSharingScore,
      memberCount: members.length,
    });
    
    console.log(`Team metrics processed successfully for repository ${repositoryId}`);
  } catch (error) {
    console.error(`Error processing team metrics for repository ${repositoryId}:`, error);
    throw error;
  }
}

/**
 * Process team metrics for all repositories
 */
export async function processAllTeamMetrics(): Promise<void> {
  try {
    console.log('Processing team metrics for all repositories');
    
    // Get all repositories
    const repositories = await prisma.repository.findMany({
      select: {
        id: true,
      },
    });
    
    // Process metrics for each repository
    for (const repository of repositories) {
      try {
        await processTeamMetrics(repository.id);
      } catch (error) {
        console.error(`Error processing team metrics for repository ${repository.id}:`, error);
        // Continue with next repository
      }
    }
    
    console.log('Team metrics processed successfully for all repositories');
  } catch (error) {
    console.error('Error processing team metrics for all repositories:', error);
    throw error;
  }
}