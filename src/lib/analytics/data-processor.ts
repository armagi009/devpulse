/**
 * Data Processor
 * Processes raw GitHub data into analytics metrics
 */

import { prisma } from '@/lib/db/prisma';
import { 
  Commit, 
  PullRequest, 
  Issue, 
  Repository, 
  User, 
  BurnoutMetric 
} from '@prisma/client';
import { 
  startOfDay, 
  endOfDay, 
  parseISO, 
  isWeekend, 
  getHours,
  differenceInDays,
  differenceInHours,
  format,
  subDays
} from 'date-fns';

// Raw data for processing
interface RawData {
  commits: Commit[];
  pullRequests: PullRequest[];
  issues: Issue[];
  repository: Repository;
  user: User;
}

// Processed metrics
interface ProcessedMetrics {
  date: Date;
  commitsCount: number;
  linesAdded: number;
  linesDeleted: number;
  prsOpened: number;
  prsReviewed: number;
  issuesCreated: number;
  issuesResolved: number;
  avgCommitTimeHour: number | null;
  weekendCommits: number;
  lateNightCommits: number;
  avgPrReviewTimeHours: number | null;
  avgCommitMessageLength: number | null;
  codeReviewComments: number;
}

/**
 * Process raw data into daily metrics
 */
export async function processRawData(
  userId: string,
  repositoryId: string,
  startDate: Date,
  endDate: Date
): Promise<ProcessedMetrics[]> {
  try {
    // Fetch raw data
    const rawData = await fetchRawData(userId, repositoryId, startDate, endDate);
    
    // Process data by day
    const dailyMetrics: ProcessedMetrics[] = [];
    
    // Get all days in the date range
    const days = getDaysInRange(startDate, endDate);
    
    // Process each day
    for (const day of days) {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      // Process metrics for this day
      const metrics = processDailyMetrics(rawData, dayStart, dayEnd);
      
      // Add to daily metrics
      dailyMetrics.push({
        date: dayStart,
        ...metrics,
      });
    }
    
    return dailyMetrics;
  } catch (error) {
    console.error('Error processing raw data:', error);
    throw error;
  }
}

/**
 * Fetch raw data for processing
 */
async function fetchRawData(
  userId: string,
  repositoryId: string,
  startDate: Date,
  endDate: Date
): Promise<RawData> {
  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }
  
  // Fetch repository
  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
  });
  
  if (!repository) {
    throw new Error(`Repository ${repositoryId} not found`);
  }
  
  // Fetch commits
  const commits = await prisma.commit.findMany({
    where: {
      repositoryId,
      authorId: userId,
      authorDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  
  // Fetch pull requests
  const pullRequests = await prisma.pullRequest.findMany({
    where: {
      repositoryId,
      authorId: userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      reviews: true,
    },
  });
  
  // Fetch issues
  const issues = await prisma.issue.findMany({
    where: {
      repositoryId,
      authorId: userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  
  return {
    commits,
    pullRequests,
    issues,
    repository,
    user,
  };
}

/**
 * Process daily metrics
 */
function processDailyMetrics(
  rawData: RawData,
  dayStart: Date,
  dayEnd: Date
): Omit<ProcessedMetrics, 'date'> {
  // Filter data for this day
  const dayCommits = rawData.commits.filter(commit => 
    commit.authorDate >= dayStart && commit.authorDate <= dayEnd
  );
  
  const dayPRs = rawData.pullRequests.filter(pr => 
    pr.createdAt >= dayStart && pr.createdAt <= dayEnd
  );
  
  const dayIssues = rawData.issues.filter(issue => 
    issue.createdAt >= dayStart && issue.createdAt <= dayEnd
  );
  
  const dayResolvedIssues = rawData.issues.filter(issue => 
    issue.closedAt && issue.closedAt >= dayStart && issue.closedAt <= dayEnd
  );
  
  // Calculate metrics
  const commitsCount = dayCommits.length;
  
  const linesAdded = dayCommits.reduce((sum, commit) => sum + commit.additions, 0);
  
  const linesDeleted = dayCommits.reduce((sum, commit) => sum + commit.deletions, 0);
  
  const prsOpened = dayPRs.length;
  
  // Count PRs reviewed by this user
  const prsReviewed = rawData.pullRequests.reduce((count, pr) => {
    const reviewsByUser = pr.reviews.filter(review => 
      review.reviewerId === rawData.user.id &&
      review.submittedAt >= dayStart &&
      review.submittedAt <= dayEnd
    );
    return count + (reviewsByUser.length > 0 ? 1 : 0);
  }, 0);
  
  const issuesCreated = dayIssues.length;
  
  const issuesResolved = dayResolvedIssues.length;
  
  // Calculate average commit time (hour of day)
  const commitHours = dayCommits.map(commit => getHours(commit.authorDate));
  const avgCommitTimeHour = commitHours.length > 0
    ? commitHours.reduce((sum, hour) => sum + hour, 0) / commitHours.length
    : null;
  
  // Count weekend commits
  const weekendCommits = dayCommits.filter(commit => 
    isWeekend(commit.authorDate)
  ).length;
  
  // Count late night commits (between 10 PM and 6 AM)
  const lateNightCommits = dayCommits.filter(commit => {
    const hour = getHours(commit.authorDate);
    return hour >= 22 || hour < 6;
  }).length;
  
  // Calculate average PR review time
  const prReviewTimes = rawData.pullRequests
    .filter(pr => pr.mergedAt && pr.createdAt >= dayStart && pr.createdAt <= dayEnd)
    .map(pr => differenceInHours(pr.mergedAt!, pr.createdAt));
  
  const avgPrReviewTimeHours = prReviewTimes.length > 0
    ? prReviewTimes.reduce((sum, time) => sum + time, 0) / prReviewTimes.length
    : null;
  
  // Calculate average commit message length
  const commitMessageLengths = dayCommits.map(commit => commit.message.length);
  const avgCommitMessageLength = commitMessageLengths.length > 0
    ? Math.round(commitMessageLengths.reduce((sum, length) => sum + length, 0) / commitMessageLengths.length)
    : null;
  
  // Count code review comments
  const codeReviewComments = rawData.pullRequests.reduce((count, pr) => 
    count + pr.reviewComments
  , 0);
  
  return {
    commitsCount,
    linesAdded,
    linesDeleted,
    prsOpened,
    prsReviewed,
    issuesCreated,
    issuesResolved,
    avgCommitTimeHour,
    weekendCommits,
    lateNightCommits,
    avgPrReviewTimeHours,
    avgCommitMessageLength,
    codeReviewComments,
  };
}

/**
 * Get all days in a date range
 */
function getDaysInRange(startDate: Date, endDate: Date): Date[] {
  const days: Date[] = [];
  let currentDate = startOfDay(startDate);
  const lastDay = startOfDay(endDate);
  
  while (currentDate <= lastDay) {
    days.push(new Date(currentDate));
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

/**
 * Save processed metrics to database
 */
export async function saveProcessedMetrics(
  userId: string,
  repositoryId: string,
  metrics: ProcessedMetrics[]
): Promise<void> {
  try {
    // Process each day's metrics
    for (const metric of metrics) {
      // Check if metric already exists
      const existingMetric = await prisma.burnoutMetric.findUnique({
        where: {
          userId_repositoryId_date: {
            userId,
            repositoryId,
            date: metric.date,
          },
        },
      });
      
      if (existingMetric) {
        // Update existing metric
        await prisma.burnoutMetric.update({
          where: {
            id: existingMetric.id,
          },
          data: {
            commitsCount: metric.commitsCount,
            linesAdded: metric.linesAdded,
            linesDeleted: metric.linesDeleted,
            prsOpened: metric.prsOpened,
            prsReviewed: metric.prsReviewed,
            issuesCreated: metric.issuesCreated,
            issuesResolved: metric.issuesResolved,
            avgCommitTimeHour: metric.avgCommitTimeHour,
            weekendCommits: metric.weekendCommits,
            lateNightCommits: metric.lateNightCommits,
            avgPrReviewTimeHours: metric.avgPrReviewTimeHours,
            avgCommitMessageLength: metric.avgCommitMessageLength,
            codeReviewComments: metric.codeReviewComments,
          },
        });
      } else {
        // Create new metric
        await prisma.burnoutMetric.create({
          data: {
            userId,
            repositoryId,
            date: metric.date,
            commitsCount: metric.commitsCount,
            linesAdded: metric.linesAdded,
            linesDeleted: metric.linesDeleted,
            prsOpened: metric.prsOpened,
            prsReviewed: metric.prsReviewed,
            issuesCreated: metric.issuesCreated,
            issuesResolved: metric.issuesResolved,
            avgCommitTimeHour: metric.avgCommitTimeHour,
            weekendCommits: metric.weekendCommits,
            lateNightCommits: metric.lateNightCommits,
            avgPrReviewTimeHours: metric.avgPrReviewTimeHours,
            avgCommitMessageLength: metric.avgCommitMessageLength,
            codeReviewComments: metric.codeReviewComments,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error saving processed metrics:', error);
    throw error;
  }
}

/**
 * Process and save metrics for a user and repository
 */
export async function processAndSaveMetrics(
  userId: string,
  repositoryId: string,
  days: number = 30
): Promise<void> {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    // Process raw data
    const metrics = await processRawData(userId, repositoryId, startDate, endDate);
    
    // Save processed metrics
    await saveProcessedMetrics(userId, repositoryId, metrics);
  } catch (error) {
    console.error('Error processing and saving metrics:', error);
    throw error;
  }
}