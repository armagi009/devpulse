/**
 * Incremental Sync Processor
 * Processes incremental sync jobs for repositories
 */

import { Job } from 'bullmq';
import { prisma } from '@/lib/db/prisma';
import { getGitHubApiClient } from '@/lib/github/github-api-client';
import { JobType, JobResult, JobProgress, addJob, JobPriority } from './queue-manager';
import { subDays, format, parseISO } from 'date-fns';

// Incremental sync job data
interface IncrementalSyncJobData {
  userId: string;
  repositoryIds?: string[]; // If not provided, sync all selected repositories
  forceFull?: boolean; // Force full sync even if repository was synced recently
}

// Repository sync status
interface RepositorySyncStatus {
  repositoryId: string;
  repositoryFullName: string;
  lastSyncedAt: Date | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
  details?: any;
}

/**
 * Process incremental sync job
 * This job syncs all selected repositories for a user with incremental updates
 */
export async function processIncrementalSyncJob(job: Job<IncrementalSyncJobData>): Promise<JobResult> {
  try {
    const { userId, repositoryIds, forceFull } = job.data;
    
    // Update job progress
    await job.updateProgress({ progress: 0, message: 'Starting incremental sync' });
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userSettings: true },
    });
    
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    // Get GitHub API client
    const githubClient = getGitHubApiClient();
    
    // Set GitHub access token
    githubClient.setAccessToken(user.accessToken);
    
    // Update job progress
    await job.updateProgress({ progress: 10, message: 'Fetching repositories' });
    
    // Get repositories to sync
    let reposToSync: { id: string; fullName: string; lastSyncedAt: Date | null }[] = [];
    
    if (repositoryIds && repositoryIds.length > 0) {
      // Use provided repository IDs
      const repositories = await prisma.repository.findMany({
        where: {
          id: { in: repositoryIds },
          ownerId: userId,
        },
        select: {
          id: true,
          fullName: true,
          lastSyncedAt: true,
        },
      });
      
      reposToSync = repositories;
    } else {
      // Use selected repositories from user settings
      const selectedRepos = user.userSettings?.selectedRepositories || [];
      
      if (selectedRepos.length > 0) {
        // Get repositories from database
        const repositories = await prisma.repository.findMany({
          where: {
            fullName: { in: selectedRepos },
            ownerId: userId,
          },
          select: {
            id: true,
            fullName: true,
            lastSyncedAt: true,
          },
        });
        
        reposToSync = repositories;
        
        // Check if any selected repositories are not in the database
        const dbRepoNames = repositories.map(repo => repo.fullName);
        const missingRepos = selectedRepos.filter(repoName => !dbRepoNames.includes(repoName));
        
        // If there are missing repositories, we need to fetch them from GitHub
        if (missingRepos.length > 0) {
          // Update job progress
          await job.updateProgress({ 
            progress: 15, 
            message: `Fetching ${missingRepos.length} new repositories`,
            details: { newRepositoryCount: missingRepos.length } 
          });
          
          // Fetch repositories from GitHub
          const githubRepos = await githubClient.getUserRepositories();
          
          // Filter to only include missing repositories
          const newRepos = githubRepos.filter(repo => 
            missingRepos.includes(repo.full_name)
          );
          
          // Create new repositories in database
          for (const repo of newRepos) {
            const newRepo = await prisma.repository.create({
              data: {
                githubId: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                ownerId: userId,
                isPrivate: repo.private,
                description: repo.description,
                defaultBranch: repo.default_branch || 'main',
                language: repo.language,
              },
            });
            
            // Add to repos to sync
            reposToSync.push({
              id: newRepo.id,
              fullName: newRepo.fullName,
              lastSyncedAt: null,
            });
          }
        }
      } else {
        // If no repositories are selected, use all repositories
        const repositories = await prisma.repository.findMany({
          where: {
            ownerId: userId,
          },
          select: {
            id: true,
            fullName: true,
            lastSyncedAt: true,
          },
        });
        
        reposToSync = repositories;
      }
    }
    
    // Update job progress
    await job.updateProgress({ 
      progress: 20, 
      message: `Found ${reposToSync.length} repositories to sync`,
      details: { repositoryCount: reposToSync.length } 
    });
    
    // Track sync status for each repository
    const syncStatus: RepositorySyncStatus[] = reposToSync.map(repo => ({
      repositoryId: repo.id,
      repositoryFullName: repo.fullName,
      lastSyncedAt: repo.lastSyncedAt,
      status: 'pending',
    }));
    
    // Process repositories one by one
    for (let i = 0; i < reposToSync.length; i++) {
      const repo = reposToSync[i];
      const statusIndex = i;
      
      try {
        // Update sync status
        syncStatus[statusIndex].status = 'in_progress';
        
        // Update job progress
        await job.updateProgress({ 
          progress: 20 + Math.floor(((i) / reposToSync.length) * 70),
          message: `Processing repository ${i + 1}/${reposToSync.length}: ${repo.fullName}`,
          details: { 
            repositoryCount: reposToSync.length,
            currentRepository: repo.fullName,
            syncStatus,
          } 
        });
        
        // Determine sync type based on last sync time
        let syncType: 'full' | 'incremental' = 'incremental';
        let sinceDate: string | undefined;
        
        if (forceFull || !repo.lastSyncedAt) {
          // If force full sync or repository has never been synced, do a full sync
          syncType = 'full';
          // Get data from the last 30 days
          sinceDate = subDays(new Date(), 30).toISOString();
        } else {
          // Otherwise, do an incremental sync from the last sync time
          syncType = 'incremental';
          sinceDate = repo.lastSyncedAt.toISOString();
        }
        
        // Create sync job for this repository
        const syncJob = await addJob(
          JobType.REPOSITORY_SYNC,
          JobType.REPOSITORY_SYNC,
          {
            userId,
            repositoryFullName: repo.fullName,
            syncType,
            since: sinceDate,
          },
          {
            priority: JobPriority.MEDIUM,
            jobId: `repo-sync-${userId}-${repo.fullName.replace('/', '-')}-${format(new Date(), 'yyyyMMddHHmmss')}`,
          }
        );
        
        // Wait for job to complete
        const result = await syncJob.waitUntilFinished();
        
        // Update sync status
        if (result && result.success) {
          syncStatus[statusIndex].status = 'completed';
          syncStatus[statusIndex].details = result.data;
        } else {
          syncStatus[statusIndex].status = 'failed';
          syncStatus[statusIndex].message = result?.message || 'Sync failed';
          syncStatus[statusIndex].details = result?.error;
        }
      } catch (error) {
        // Update sync status on error
        syncStatus[statusIndex].status = 'failed';
        syncStatus[statusIndex].message = error instanceof Error ? error.message : String(error);
        
        console.error(`Error syncing repository ${repo.fullName}:`, error);
      }
      
      // Update job progress
      await job.updateProgress({ 
        progress: 20 + Math.floor(((i + 1) / reposToSync.length) * 70),
        message: `Processed repository ${i + 1}/${reposToSync.length}: ${repo.fullName}`,
        details: { 
          repositoryCount: reposToSync.length,
          processedCount: i + 1,
          syncStatus,
        } 
      });
    }
    
    // Calculate sync statistics
    const completedCount = syncStatus.filter(s => s.status === 'completed').length;
    const failedCount = syncStatus.filter(s => s.status === 'failed').length;
    
    // Update job progress
    await job.updateProgress({ 
      progress: 100, 
      message: `Incremental sync completed: ${completedCount} succeeded, ${failedCount} failed`,
      details: { 
        repositoryCount: reposToSync.length,
        completedCount,
        failedCount,
        syncStatus,
      } 
    });
    
    // Return success result
    return {
      success: true,
      message: 'Incremental sync completed',
      data: {
        repositoryCount: reposToSync.length,
        completedCount,
        failedCount,
        syncStatus,
      },
    };
  } catch (error) {
    console.error('Error processing incremental sync job:', error);
    
    // Return error result
    return {
      success: false,
      message: 'Incremental sync failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}