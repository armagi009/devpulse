/**
 * Repository Sync Processor
 * Processes repository sync jobs
 */

import { Job } from 'bullmq';
import { prisma } from '@/lib/db/prisma';
import { getGitHubApiClient } from '@/lib/github/github-api-client';
import { JobType, JobResult, JobProgress, addJob, JobPriority } from './queue-manager';
import { subDays } from 'date-fns';

// Repository sync job data
interface RepositorySyncJobData {
  userId: string;
  repositoryFullName: string;
  syncType: 'full' | 'incremental';
  since?: string; // ISO date string
}

// Initial sync job data
interface InitialSyncJobData {
  userId: string;
  repositoryIds?: string[]; // If not provided, sync all repositories
}

/**
 * Process repository sync job
 */
export async function processRepositorySyncJob(job: Job<RepositorySyncJobData>): Promise<JobResult> {
  try {
    const { userId, repositoryFullName, syncType, since } = job.data;
    
    // Update job progress
    await job.updateProgress({ progress: 0, message: 'Starting repository sync' });
    
    // Get GitHub API client
    const githubClient = getGitHubApiClient();
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    // Set GitHub access token
    githubClient.setAccessToken(user.accessToken);
    
    // Update job progress
    await job.updateProgress({ progress: 10, message: 'Fetching repository details' });
    
    // Get repository details
    const repoDetails = await githubClient.getRepositoryDetails(repositoryFullName);
    
    // Find or create repository in database
    let repository = await prisma.repository.findFirst({
      where: {
        githubId: repoDetails.id,
        ownerId: userId,
      },
    });
    
    if (!repository) {
      repository = await prisma.repository.create({
        data: {
          githubId: repoDetails.id,
          name: repoDetails.name,
          fullName: repoDetails.full_name,
          ownerId: userId,
          isPrivate: repoDetails.private,
          description: repoDetails.description,
          defaultBranch: repoDetails.default_branch,
          language: repoDetails.language,
        },
      });
    } else {
      // Update repository details
      repository = await prisma.repository.update({
        where: { id: repository.id },
        data: {
          name: repoDetails.name,
          fullName: repoDetails.full_name,
          isPrivate: repoDetails.private,
          description: repoDetails.description,
          defaultBranch: repoDetails.default_branch,
          language: repoDetails.language,
        },
      });
    }
    
    // Update job progress
    await job.updateProgress({ 
      progress: 20, 
      message: 'Fetching commits',
      details: { repositoryId: repository.id } 
    });
    
    // Fetch commits
    const sinceDate = since ? new Date(since) : undefined;
    
    // Update job progress
    await job.updateProgress({ 
      progress: 30, 
      message: `Fetching commits since ${sinceDate?.toISOString() || 'beginning'}`,
      details: { since: sinceDate?.toISOString() } 
    });
    
    const commits = await githubClient.getCommits(repositoryFullName, sinceDate);
    
    // Update job progress
    await job.updateProgress({ 
      progress: 40, 
      message: `Processing ${commits.length} commits`,
      details: { commitCount: commits.length } 
    });
    
    // If this is an incremental sync, check for deleted commits
    if (syncType === 'incremental' && sinceDate) {
      await job.updateProgress({ 
        progress: 35, 
        message: 'Checking for deleted commits',
      });
      
      // Get all commit SHAs from the database for this repository
      const dbCommits = await prisma.commit.findMany({
        where: {
          repositoryId: repository.id,
          authorDate: { gte: sinceDate },
        },
        select: {
          sha: true,
        },
      });
      
      // Get all commit SHAs from GitHub
      const githubCommitShas = commits.map(commit => commit.sha);
      
      // Find commits that are in the database but not in GitHub (deleted)
      const deletedCommitShas = dbCommits
        .map(commit => commit.sha)
        .filter(sha => !githubCommitShas.includes(sha));
      
      // Delete removed commits from the database
      if (deletedCommitShas.length > 0) {
        await prisma.commit.deleteMany({
          where: {
            repositoryId: repository.id,
            sha: { in: deletedCommitShas },
          },
        });
        
        await job.updateProgress({ 
          progress: 38, 
          message: `Removed ${deletedCommitShas.length} deleted commits`,
          details: { deletedCommitCount: deletedCommitShas.length } 
        });
      }
    }
    
    // Process commits in batches
    const batchSize = 50;
    const totalCommits = commits.length;
    let processedCommits = 0;
    
    for (let i = 0; i < totalCommits; i += batchSize) {
      const batch = commits.slice(i, i + batchSize);
      
      // Process batch
      await Promise.all(
        batch.map(async (commit) => {
          try {
            // Check if commit already exists
            const existingCommit = await prisma.commit.findUnique({
              where: {
                repositoryId_sha: {
                  repositoryId: repository!.id,
                  sha: commit.sha,
                },
              },
            });
            
            if (!existingCommit) {
              // Get commit details
              const commitDetails = await githubClient.getCommitDetails(
                repositoryFullName,
                commit.sha
              );
              
              // Create commit in database
              await prisma.commit.create({
                data: {
                  sha: commit.sha,
                  message: commit.commit.message,
                  authorName: commit.commit.author.name,
                  authorEmail: commit.commit.author.email,
                  authorDate: new Date(commit.commit.author.date),
                  committerName: commit.commit.committer.name,
                  committerEmail: commit.commit.committer.email,
                  committerDate: new Date(commit.commit.committer.date),
                  additions: commitDetails.stats.additions,
                  deletions: commitDetails.stats.deletions,
                  repositoryId: repository!.id,
                  authorId: user.id, // Assuming the user is the author
                },
              });
            }
          } catch (error) {
            console.error(`Error processing commit ${commit.sha}:`, error);
          }
        })
      );
      
      // Update processed count
      processedCommits += batch.length;
      
      // Update job progress
      const progress = 40 + Math.floor((processedCommits / totalCommits) * 30);
      await job.updateProgress({ 
        progress, 
        message: `Processed ${processedCommits}/${totalCommits} commits`,
        details: { processedCommits, totalCommits } 
      });
    }
    
    // Update job progress
    await job.updateProgress({ 
      progress: 70, 
      message: 'Fetching pull requests',
    });
    
    // Fetch pull requests
    await job.updateProgress({ 
      progress: 70, 
      message: `Fetching pull requests since ${sinceDate?.toISOString() || 'beginning'}`,
      details: { since: sinceDate?.toISOString() } 
    });
    
    const pullRequests = await githubClient.getPullRequests(repositoryFullName);
    
    // Update job progress
    await job.updateProgress({ 
      progress: 75, 
      message: `Processing ${pullRequests.length} pull requests`,
      details: { prCount: pullRequests.length } 
    });
    
    // If this is an incremental sync, check for updated or deleted PRs
    if (syncType === 'incremental' && sinceDate) {
      await job.updateProgress({ 
        progress: 72, 
        message: 'Checking for updated pull requests',
      });
      
      // Get all PRs from the database for this repository that have been updated since the last sync
      const dbPRs = await prisma.pullRequest.findMany({
        where: {
          repositoryId: repository.id,
          updatedAt: { gte: sinceDate },
        },
        select: {
          number: true,
        },
      });
      
      // Get all PR numbers from GitHub
      const githubPRNumbers = pullRequests.map(pr => pr.number);
      
      // Find PRs that are in the database but not in GitHub (deleted or no longer accessible)
      const deletedPRNumbers = dbPRs
        .map(pr => pr.number)
        .filter(number => !githubPRNumbers.includes(number));
      
      // Delete removed PRs from the database
      if (deletedPRNumbers.length > 0) {
        await prisma.pullRequest.deleteMany({
          where: {
            repositoryId: repository.id,
            number: { in: deletedPRNumbers },
          },
        });
        
        await job.updateProgress({ 
          progress: 73, 
          message: `Removed ${deletedPRNumbers.length} deleted pull requests`,
          details: { deletedPRCount: deletedPRNumbers.length } 
        });
      }
    }
    
    // Process pull requests in batches
    const totalPRs = pullRequests.length;
    let processedPRs = 0;
    
    for (let i = 0; i < totalPRs; i += batchSize) {
      const batch = pullRequests.slice(i, i + batchSize);
      
      // Process batch
      await Promise.all(
        batch.map(async (pr) => {
          try {
            // Check if PR already exists
            const existingPR = await prisma.pullRequest.findUnique({
              where: {
                repositoryId_number: {
                  repositoryId: repository!.id,
                  number: pr.number,
                },
              },
            });
            
            if (!existingPR) {
              // Get PR details
              const prDetails = await githubClient.getPullRequestDetails(
                repositoryFullName,
                pr.number
              );
              
              // Create PR in database
              await prisma.pullRequest.create({
                data: {
                  githubId: pr.id,
                  number: pr.number,
                  title: pr.title,
                  state: pr.state,
                  createdAt: new Date(pr.created_at),
                  updatedAt: new Date(pr.updated_at),
                  closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
                  mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
                  repositoryId: repository!.id,
                  authorId: user.id, // Assuming the user is the author
                  additions: prDetails.additions,
                  deletions: prDetails.deletions,
                  changedFiles: prDetails.changed_files,
                  comments: prDetails.comments,
                  reviewComments: prDetails.review_comments,
                },
              });
            }
          } catch (error) {
            console.error(`Error processing PR #${pr.number}:`, error);
          }
        })
      );
      
      // Update processed count
      processedPRs += batch.length;
      
      // Update job progress
      const progress = 70 + Math.floor((processedPRs / totalPRs) * 10);
      await job.updateProgress({ 
        progress, 
        message: `Processed ${processedPRs}/${totalPRs} pull requests`,
        details: { processedPRs, totalPRs } 
      });
    }
    
    // Update job progress
    await job.updateProgress({ 
      progress: 80, 
      message: 'Fetching issues',
    });
    
    // Fetch issues
    await job.updateProgress({ 
      progress: 80, 
      message: `Fetching issues since ${sinceDate?.toISOString() || 'beginning'}`,
      details: { since: sinceDate?.toISOString() } 
    });
    
    const issues = await githubClient.getIssues(repositoryFullName);
    
    // Update job progress
    await job.updateProgress({ 
      progress: 85, 
      message: `Processing ${issues.length} issues`,
      details: { issueCount: issues.length } 
    });
    
    // If this is an incremental sync, check for updated or deleted issues
    if (syncType === 'incremental' && sinceDate) {
      await job.updateProgress({ 
        progress: 82, 
        message: 'Checking for updated issues',
      });
      
      // Get all issues from the database for this repository that have been updated since the last sync
      const dbIssues = await prisma.issue.findMany({
        where: {
          repositoryId: repository.id,
          updatedAt: { gte: sinceDate },
        },
        select: {
          number: true,
        },
      });
      
      // Get all issue numbers from GitHub
      const githubIssueNumbers = issues
        .filter(issue => !('pull_request' in issue)) // Filter out PRs
        .map(issue => issue.number);
      
      // Find issues that are in the database but not in GitHub (deleted or no longer accessible)
      const deletedIssueNumbers = dbIssues
        .map(issue => issue.number)
        .filter(number => !githubIssueNumbers.includes(number));
      
      // Delete removed issues from the database
      if (deletedIssueNumbers.length > 0) {
        await prisma.issue.deleteMany({
          where: {
            repositoryId: repository.id,
            number: { in: deletedIssueNumbers },
          },
        });
        
        await job.updateProgress({ 
          progress: 83, 
          message: `Removed ${deletedIssueNumbers.length} deleted issues`,
          details: { deletedIssueCount: deletedIssueNumbers.length } 
        });
      }
    }
    
    // Process issues in batches
    const totalIssues = issues.length;
    let processedIssues = 0;
    
    for (let i = 0; i < totalIssues; i += batchSize) {
      const batch = issues.slice(i, i + batchSize);
      
      // Process batch
      await Promise.all(
        batch.map(async (issue) => {
          try {
            // Skip pull requests (GitHub returns PRs as issues)
            if ('pull_request' in issue) {
              return;
            }
            
            // Check if issue already exists
            const existingIssue = await prisma.issue.findUnique({
              where: {
                repositoryId_number: {
                  repositoryId: repository!.id,
                  number: issue.number,
                },
              },
            });
            
            if (!existingIssue) {
              // Get issue details
              const issueDetails = await githubClient.getIssueDetails(
                repositoryFullName,
                issue.number
              );
              
              // Create issue in database
              await prisma.issue.create({
                data: {
                  githubId: issue.id,
                  number: issue.number,
                  title: issue.title,
                  state: issue.state,
                  createdAt: new Date(issue.created_at),
                  updatedAt: new Date(issue.updated_at),
                  closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
                  repositoryId: repository!.id,
                  authorId: user.id, // Assuming the user is the author
                  comments: issueDetails.comments,
                  labels: issueDetails.labels.map(label => label.name),
                },
              });
            }
          } catch (error) {
            console.error(`Error processing issue #${issue.number}:`, error);
          }
        })
      );
      
      // Update processed count
      processedIssues += batch.length;
      
      // Update job progress
      const progress = 85 + Math.floor((processedIssues / totalIssues) * 10);
      await job.updateProgress({ 
        progress, 
        message: `Processed ${processedIssues}/${totalIssues} issues`,
        details: { processedIssues, totalIssues } 
      });
    }
    
    // Update repository last synced timestamp
    await prisma.repository.update({
      where: { id: repository.id },
      data: {
        lastSyncedAt: new Date(),
      },
    });
    
    // Update job progress
    await job.updateProgress({ 
      progress: 100, 
      message: 'Repository sync completed',
      details: { 
        repositoryId: repository.id,
        commitCount: commits.length,
        prCount: pullRequests.length,
        issueCount: issues.length,
      } 
    });
    
    // Return success result
    return {
      success: true,
      message: 'Repository sync completed successfully',
      data: {
        repositoryId: repository.id,
        commitCount: commits.length,
        prCount: pullRequests.length,
        issueCount: issues.length,
      },
    };
  } catch (error) {
    console.error('Error processing repository sync job:', error);
    
    // Return error result
    return {
      success: false,
      message: 'Repository sync failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Process initial sync job
 * This job syncs all selected repositories for a user
 */
export async function processInitialSyncJob(job: Job<InitialSyncJobData>): Promise<JobResult> {
  try {
    const { userId, repositoryIds } = job.data;
    
    // Update job progress
    await job.updateProgress({ progress: 0, message: 'Starting initial sync' });
    
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
    let reposToSync: string[] = [];
    
    if (repositoryIds && repositoryIds.length > 0) {
      // Use provided repository IDs
      const repositories = await prisma.repository.findMany({
        where: {
          id: { in: repositoryIds },
          ownerId: userId,
        },
      });
      
      reposToSync = repositories.map(repo => repo.fullName);
    } else {
      // Use selected repositories from user settings
      const selectedRepos = user.userSettings?.selectedRepositories || [];
      
      if (selectedRepos.length > 0) {
        reposToSync = selectedRepos;
      } else {
        // If no repositories are selected, fetch all repositories from GitHub
        const githubRepos = await githubClient.getUserRepositories();
        reposToSync = githubRepos.map(repo => repo.full_name);
      }
    }
    
    // Update job progress
    await job.updateProgress({ 
      progress: 20, 
      message: `Found ${reposToSync.length} repositories to sync`,
      details: { repositoryCount: reposToSync.length } 
    });
    
    // Calculate since date (30 days ago)
    const sinceDate = subDays(new Date(), 30).toISOString();
    
    // Create sync jobs for each repository
    const syncJobs = [];
    
    for (let i = 0; i < reposToSync.length; i++) {
      const repoFullName = reposToSync[i];
      
      // Create sync job
      const syncJob = await addJob(
        JobType.REPOSITORY_SYNC,
        JobType.REPOSITORY_SYNC,
        {
          userId,
          repositoryFullName: repoFullName,
          syncType: 'full',
          since: sinceDate,
        },
        {
          priority: JobPriority.MEDIUM,
          jobId: `repo-sync-${userId}-${repoFullName.replace('/', '-')}`,
        }
      );
      
      syncJobs.push(syncJob);
      
      // Update job progress
      const progress = 20 + Math.floor(((i + 1) / reposToSync.length) * 80);
      await job.updateProgress({ 
        progress, 
        message: `Created sync job for repository ${i + 1}/${reposToSync.length}`,
        details: { 
          repositoryCount: reposToSync.length,
          processedCount: i + 1,
          currentRepository: repoFullName,
        } 
      });
    }
    
    // Update job progress
    await job.updateProgress({ 
      progress: 100, 
      message: 'Initial sync jobs created',
      details: { 
        repositoryCount: reposToSync.length,
        jobCount: syncJobs.length,
      } 
    });
    
    // Return success result
    return {
      success: true,
      message: 'Initial sync jobs created successfully',
      data: {
        repositoryCount: reposToSync.length,
        jobCount: syncJobs.length,
      },
    };
  } catch (error) {
    console.error('Error processing initial sync job:', error);
    
    // Return error result
    return {
      success: false,
      message: 'Initial sync failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}