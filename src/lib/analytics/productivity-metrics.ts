/**
 * Productivity Metrics
 * Calculates personal productivity metrics based on GitHub activity
 */

import { prisma } from '@/lib/db/prisma';
import { 
  startOfDay, 
  endOfDay, 
  parseISO, 
  format, 
  subDays,
  getHours,
  getDay,
  differenceInDays,
  differenceInHours,
  isWeekend,
  eachDayOfInterval
} from 'date-fns';
import type { 
  Commit, 
  PullRequest, 
  Issue
} from '@prisma/client';

// Time range interface
export interface TimeRange {
  start: Date;
  end: Date;
}

// Trend point interface
export interface TrendPoint {
  date: Date;
  value: number;
}

// Work hours distribution interface
export interface WorkHoursDistribution {
  hour: number;
  count: number;
}

// Weekday distribution interface
export interface WeekdayDistribution {
  day: number; // 0-6, 0 is Sunday
  count: number;
}

// Language distribution interface
export interface LanguageDistribution {
  language: string;
  percentage: number;
}

// Productivity metrics interface
export interface ProductivityMetrics {
  userId: string;
  timeRange: TimeRange;
  commitCount: number;
  linesAdded: number;
  linesDeleted: number;
  prCount: number;
  issueCount: number;
  commitFrequency: TrendPoint[];
  workHoursDistribution: WorkHoursDistribution[];
  weekdayDistribution: WeekdayDistribution[];
  topLanguages: LanguageDistribution[];
  avgCommitSize: number;
  avgPrSize: number;
  avgTimeToMergePr: number | null;
  avgTimeToResolveIssue: number | null;
  codeQualityScore: number;
}

/**
 * Calculate productivity metrics
 */
export async function calculateProductivityMetrics(
  userId: string,
  timeRange: TimeRange,
  repositoryId?: string
): Promise<ProductivityMetrics> {
  try {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    // Build base query
    const baseQuery = {
      authorId: userId,
      ...(repositoryId ? { repositoryId } : {}),
    };
    
    // Get commits
    const commits = await prisma.commit.findMany({
      where: {
        ...baseQuery,
        authorDate: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      include: {
        repository: true,
      },
    });
    
    // Get pull requests
    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        ...baseQuery,
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      include: {
        repository: true,
      },
    });
    
    // Get issues
    const issues = await prisma.issue.findMany({
      where: {
        ...baseQuery,
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      include: {
        repository: true,
      },
    });
    
    // Calculate basic metrics
    const commitCount = commits.length;
    const linesAdded = commits.reduce((sum, commit) => sum + commit.additions, 0);
    const linesDeleted = commits.reduce((sum, commit) => sum + commit.deletions, 0);
    const prCount = pullRequests.length;
    const issueCount = issues.length;
    
    // Calculate commit frequency
    const commitFrequency = calculateCommitFrequency(commits, timeRange);
    
    // Calculate work hours distribution
    const workHoursDistribution = calculateWorkHoursDistribution(commits);
    
    // Calculate weekday distribution
    const weekdayDistribution = calculateWeekdayDistribution(commits);
    
    // Calculate top languages
    const topLanguages = calculateTopLanguages(commits);
    
    // Calculate average commit size
    const avgCommitSize = commitCount > 0
      ? Math.round((linesAdded + linesDeleted) / commitCount)
      : 0;
    
    // Calculate average PR size
    const avgPrSize = prCount > 0
      ? Math.round(pullRequests.reduce((sum, pr) => sum + pr.additions + pr.deletions, 0) / prCount)
      : 0;
    
    // Calculate average time to merge PR
    const prMergeTimes = pullRequests
      .filter(pr => pr.mergedAt)
      .map(pr => differenceInHours(pr.mergedAt!, pr.createdAt));
    
    const avgTimeToMergePr = prMergeTimes.length > 0
      ? Math.round(prMergeTimes.reduce((sum, time) => sum + time, 0) / prMergeTimes.length)
      : null;
    
    // Calculate average time to resolve issue
    const issueResolutionTimes = issues
      .filter(issue => issue.closedAt)
      .map(issue => differenceInHours(issue.closedAt!, issue.createdAt));
    
    const avgTimeToResolveIssue = issueResolutionTimes.length > 0
      ? Math.round(issueResolutionTimes.reduce((sum, time) => sum + time, 0) / issueResolutionTimes.length)
      : null;
    
    // Calculate code quality score
    const codeQualityScore = calculateCodeQualityScore(commits, pullRequests);
    
    // Return productivity metrics
    return {
      userId,
      timeRange,
      commitCount,
      linesAdded,
      linesDeleted,
      prCount,
      issueCount,
      commitFrequency,
      workHoursDistribution,
      weekdayDistribution,
      topLanguages,
      avgCommitSize,
      avgPrSize,
      avgTimeToMergePr,
      avgTimeToResolveIssue,
      codeQualityScore,
    };
  } catch (error) {
    console.error('Error calculating productivity metrics:', error);
    throw error;
  }
}

/**
 * Calculate commit frequency
 */
function calculateCommitFrequency(commits: Commit[], timeRange: TimeRange): TrendPoint[] {
  // Create a map of dates to commit counts
  const commitsByDate = new Map<string, number>();
  
  // Initialize all dates in the range with 0 commits
  const days = differenceInDays(timeRange.end, timeRange.start) + 1;
  for (let i = 0; i < days; i++) {
    const date = new Date(timeRange.start);
    date.setDate(date.getDate() + i);
    const dateString = format(date, 'yyyy-MM-dd');
    commitsByDate.set(dateString, 0);
  }
  
  // Count commits by date
  for (const commit of commits) {
    const dateString = format(commit.authorDate, 'yyyy-MM-dd');
    const count = commitsByDate.get(dateString) || 0;
    commitsByDate.set(dateString, count + 1);
  }
  
  // Convert to trend points
  const trendPoints: TrendPoint[] = Array.from(commitsByDate.entries())
    .map(([dateString, count]) => ({
      date: parseISO(dateString),
      value: count,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return trendPoints;
}

/**
 * Calculate work hours distribution
 */
function calculateWorkHoursDistribution(commits: Commit[]): WorkHoursDistribution[] {
  // Initialize hours with 0 commits
  const hourCounts = new Array(24).fill(0).map((_, hour) => ({
    hour,
    count: 0,
  }));
  
  // Count commits by hour
  for (const commit of commits) {
    const hour = getHours(commit.authorDate);
    hourCounts[hour].count++;
  }
  
  return hourCounts;
}

/**
 * Calculate weekday distribution
 */
function calculateWeekdayDistribution(commits: Commit[]): WeekdayDistribution[] {
  // Initialize days with 0 commits
  const dayCounts = new Array(7).fill(0).map((_, day) => ({
    day,
    count: 0,
  }));
  
  // Count commits by day
  for (const commit of commits) {
    const day = getDay(commit.authorDate);
    dayCounts[day].count++;
  }
  
  return dayCounts;
}

/**
 * Calculate top languages
 */
function calculateTopLanguages(commits: Commit[]): LanguageDistribution[] {
  // Count commits by language
  const languageCounts = new Map<string, number>();
  
  for (const commit of commits) {
    if (commit.repository?.language) {
      const count = languageCounts.get(commit.repository.language) || 0;
      languageCounts.set(commit.repository.language, count + 1);
    }
  }
  
  // Calculate percentages
  const totalCommits = commits.length;
  const languages: LanguageDistribution[] = Array.from(languageCounts.entries())
    .map(([language, count]) => ({
      language,
      percentage: totalCommits > 0 ? Math.round((count / totalCommits) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5); // Top 5 languages
  
  return languages;
}

/**
 * Calculate code quality score
 */
function calculateCodeQualityScore(commits: Commit[], pullRequests: PullRequest[]): number {
  let score = 50; // Start with a neutral score
  
  // Factor 1: Average commit message length
  const avgCommitMessageLength = commits.length > 0
    ? commits.reduce((sum, commit) => sum + commit.message.length, 0) / commits.length
    : 0;
  
  if (avgCommitMessageLength > 100) score += 15;
  else if (avgCommitMessageLength > 50) score += 10;
  else if (avgCommitMessageLength > 20) score += 5;
  else if (avgCommitMessageLength < 10) score -= 10;
  
  // Factor 2: Commit size
  const avgCommitSize = commits.length > 0
    ? commits.reduce((sum, commit) => sum + commit.additions + commit.deletions, 0) / commits.length
    : 0;
  
  if (avgCommitSize < 50) score += 10; // Small commits are good
  else if (avgCommitSize > 300) score -= 10; // Large commits may indicate poor practices
  
  // Factor 3: PR review comments
  const avgReviewComments = pullRequests.length > 0
    ? pullRequests.reduce((sum, pr) => sum + pr.reviewComments, 0) / pullRequests.length
    : 0;
  
  if (avgReviewComments > 5) score += 10; // More review comments indicate thorough review
  else if (avgReviewComments < 1) score -= 5; // Few review comments may indicate poor review
  
  // Factor 4: Weekend commits
  const weekendCommits = commits.filter(commit => isWeekend(commit.authorDate)).length;
  const weekendCommitRatio = commits.length > 0 ? weekendCommits / commits.length : 0;
  
  if (weekendCommitRatio > 0.3) score -= 10; // High weekend work may indicate poor work-life balance
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, score));
}

/**
 * Get work pattern analysis
 */
export async function getWorkPatternAnalysis(
  userId: string,
  timeRange: TimeRange,
  repositoryId?: string
): Promise<{
  averageStartTime: string;
  averageEndTime: string;
  weekendWorkPercentage: number;
  afterHoursPercentage: number;
  consistencyScore: number;
  workPatternCalendar: {
    date: string;
    startTime: string | null;
    endTime: string | null;
    commitCount: number;
  }[];
}> {
  try {
    // Get commits
    const commits = await prisma.commit.findMany({
      where: {
        authorId: userId,
        ...(repositoryId ? { repositoryId } : {}),
        authorDate: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      orderBy: {
        authorDate: 'asc',
      },
    });
    
    // Group commits by date
    const commitsByDate = new Map<string, Date[]>();
    
    for (const commit of commits) {
      const dateString = format(commit.authorDate, 'yyyy-MM-dd');
      const times = commitsByDate.get(dateString) || [];
      times.push(commit.authorDate);
      commitsByDate.set(dateString, times);
    }
    
    // Calculate work pattern calendar
    const workPatternCalendar = Array.from(commitsByDate.entries())
      .map(([dateString, times]) => {
        // Sort times
        times.sort((a, b) => a.getTime() - b.getTime());
        
        // Get start and end times
        const startTime = times.length > 0 ? format(times[0], 'HH:mm') : null;
        const endTime = times.length > 0 ? format(times[times.length - 1], 'HH:mm') : null;
        
        return {
          date: dateString,
          startTime,
          endTime,
          commitCount: times.length,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate average start time
    const startTimes = workPatternCalendar
      .filter(day => day.startTime !== null)
      .map(day => {
        const [hours, minutes] = day.startTime!.split(':').map(Number);
        return hours * 60 + minutes; // Convert to minutes
      });
    
    const averageStartMinutes = startTimes.length > 0
      ? startTimes.reduce((sum, minutes) => sum + minutes, 0) / startTimes.length
      : 9 * 60; // Default to 9:00 AM
    
    const averageStartHours = Math.floor(averageStartMinutes / 60);
    const averageStartMinutesRemainder = Math.round(averageStartMinutes % 60);
    const averageStartTime = `${averageStartHours.toString().padStart(2, '0')}:${averageStartMinutesRemainder.toString().padStart(2, '0')}`;
    
    // Calculate average end time
    const endTimes = workPatternCalendar
      .filter(day => day.endTime !== null)
      .map(day => {
        const [hours, minutes] = day.endTime!.split(':').map(Number);
        return hours * 60 + minutes; // Convert to minutes
      });
    
    const averageEndMinutes = endTimes.length > 0
      ? endTimes.reduce((sum, minutes) => sum + minutes, 0) / endTimes.length
      : 17 * 60; // Default to 5:00 PM
    
    const averageEndHours = Math.floor(averageEndMinutes / 60);
    const averageEndMinutesRemainder = Math.round(averageEndMinutes % 60);
    const averageEndTime = `${averageEndHours.toString().padStart(2, '0')}:${averageEndMinutesRemainder.toString().padStart(2, '0')}`;
    
    // Calculate weekend work percentage
    const weekendCommits = commits.filter(commit => isWeekend(commit.authorDate)).length;
    const weekendWorkPercentage = commits.length > 0
      ? Math.round((weekendCommits / commits.length) * 100)
      : 0;
    
    // Calculate after hours percentage (before 9 AM or after 5 PM)
    const afterHoursCommits = commits.filter(commit => {
      const hour = getHours(commit.authorDate);
      return hour < 9 || hour >= 17;
    }).length;
    
    const afterHoursPercentage = commits.length > 0
      ? Math.round((afterHoursCommits / commits.length) * 100)
      : 0;
    
    // Calculate consistency score
    const consistencyScore = calculateConsistencyScore(workPatternCalendar);
    
    return {
      averageStartTime,
      averageEndTime,
      weekendWorkPercentage,
      afterHoursPercentage,
      consistencyScore,
      workPatternCalendar,
    };
  } catch (error) {
    console.error('Error getting work pattern analysis:', error);
    throw error;
  }
}

/**
 * Calculate consistency score
 */
function calculateConsistencyScore(
  workPatternCalendar: {
    date: string;
    startTime: string | null;
    endTime: string | null;
    commitCount: number;
  }[]
): number {
  // If no data, return 0
  if (workPatternCalendar.length === 0) {
    return 0;
  }
  
  // Calculate standard deviation of commit counts
  const commitCounts = workPatternCalendar.map(day => day.commitCount);
  const avgCommitCount = commitCounts.reduce((sum, count) => sum + count, 0) / commitCounts.length;
  const variance = commitCounts.reduce((sum, count) => sum + Math.pow(count - avgCommitCount, 2), 0) / commitCounts.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate coefficient of variation (CV)
  const cv = avgCommitCount > 0 ? stdDev / avgCommitCount : 0;
  
  // Calculate start time consistency
  const startTimes = workPatternCalendar
    .filter(day => day.startTime !== null)
    .map(day => {
      const [hours, minutes] = day.startTime!.split(':').map(Number);
      return hours * 60 + minutes; // Convert to minutes
    });
  
  const avgStartTime = startTimes.length > 0
    ? startTimes.reduce((sum, time) => sum + time, 0) / startTimes.length
    : 0;
  
  const startTimeVariance = startTimes.length > 0
    ? startTimes.reduce((sum, time) => sum + Math.pow(time - avgStartTime, 2), 0) / startTimes.length
    : 0;
  
  const startTimeStdDev = Math.sqrt(startTimeVariance);
  
  // Calculate consistency score
  // Lower CV and standard deviation means higher consistency
  const cvFactor = Math.max(0, 1 - cv);
  const startTimeFactor = Math.max(0, 1 - (startTimeStdDev / 120)); // Normalize by 2 hours
  
  // Combine factors
  const consistencyScore = Math.round((cvFactor * 0.6 + startTimeFactor * 0.4) * 100);
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, consistencyScore));
}

/**
 * Productivity trend analysis
 */
export interface ProductivityTrend {
  trend: 'improving' | 'stable' | 'declining';
  percentageChange: number;
  comparisonPeriod: {
    previous: TimeRange;
    current: TimeRange;
  };
  metrics: {
    previous: {
      commitCount: number;
      prCount: number;
      issueCount: number;
      codeQualityScore: number;
    };
    current: {
      commitCount: number;
      prCount: number;
      issueCount: number;
      codeQualityScore: number;
    };
  };
}

/**
 * Detect productivity trends by comparing two time periods
 */
export async function detectProductivityTrends(
  userId: string,
  timeRange: TimeRange,
  repositoryId?: string
): Promise<ProductivityTrend> {
  try {
    // Calculate the previous time period of equal length
    const periodLength = timeRange.end.getTime() - timeRange.start.getTime();
    const previousStart = new Date(timeRange.start.getTime() - periodLength);
    const previousEnd = new Date(timeRange.start.getTime() - 1); // 1ms before current start
    
    const previousTimeRange: TimeRange = {
      start: previousStart,
      end: previousEnd
    };
    
    // Get metrics for previous period
    const previousMetrics = await getBasicProductivityMetrics(
      userId,
      previousTimeRange,
      repositoryId
    );
    
    // Get metrics for current period
    const currentMetrics = await getBasicProductivityMetrics(
      userId,
      timeRange,
      repositoryId
    );
    
    // Calculate productivity score for each period
    const previousScore = calculateProductivityScore(previousMetrics);
    const currentScore = calculateProductivityScore(currentMetrics);
    
    // Calculate percentage change
    let percentageChange = 0;
    if (previousScore > 0) {
      percentageChange = ((currentScore - previousScore) / previousScore) * 100;
    }
    
    // Determine trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (percentageChange > 10) {
      trend = 'improving';
    } else if (percentageChange < -10) {
      trend = 'declining';
    }
    
    return {
      trend,
      percentageChange: Math.round(percentageChange * 10) / 10, // Round to 1 decimal place
      comparisonPeriod: {
        previous: previousTimeRange,
        current: timeRange
      },
      metrics: {
        previous: {
          commitCount: previousMetrics.commitCount,
          prCount: previousMetrics.prCount,
          issueCount: previousMetrics.issueCount,
          codeQualityScore: previousMetrics.codeQualityScore
        },
        current: {
          commitCount: currentMetrics.commitCount,
          prCount: currentMetrics.prCount,
          issueCount: currentMetrics.issueCount,
          codeQualityScore: currentMetrics.codeQualityScore
        }
      }
    };
  } catch (error) {
    console.error('Error detecting productivity trends:', error);
    // Return a default stable trend if there's an error
    return {
      trend: 'stable',
      percentageChange: 0,
      comparisonPeriod: {
        previous: {
          start: new Date(0),
          end: new Date(0)
        },
        current: timeRange
      },
      metrics: {
        previous: {
          commitCount: 0,
          prCount: 0,
          issueCount: 0,
          codeQualityScore: 0
        },
        current: {
          commitCount: 0,
          prCount: 0,
          issueCount: 0,
          codeQualityScore: 0
        }
      }
    };
  }
}

/**
 * Get basic productivity metrics (simplified version for trend analysis)
 */
async function getBasicProductivityMetrics(
  userId: string,
  timeRange: TimeRange,
  repositoryId?: string
): Promise<{
  commitCount: number;
  prCount: number;
  issueCount: number;
  codeQualityScore: number;
}> {
  try {
    // Build base query
    const baseQuery = {
      authorId: userId,
      ...(repositoryId ? { repositoryId } : {}),
    };
    
    // Get commits
    const commits = await prisma.commit.findMany({
      where: {
        ...baseQuery,
        authorDate: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });
    
    // Get pull requests
    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        ...baseQuery,
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });
    
    // Get issues
    const issues = await prisma.issue.findMany({
      where: {
        ...baseQuery,
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });
    
    // Calculate code quality score
    const codeQualityScore = calculateCodeQualityScore(commits, pullRequests);
    
    return {
      commitCount: commits.length,
      prCount: pullRequests.length,
      issueCount: issues.length,
      codeQualityScore,
    };
  } catch (error) {
    console.error('Error getting basic productivity metrics:', error);
    return {
      commitCount: 0,
      prCount: 0,
      issueCount: 0,
      codeQualityScore: 0,
    };
  }
}

/**
 * Calculate productivity score based on metrics
 */
function calculateProductivityScore(metrics: {
  commitCount: number;
  prCount: number;
  issueCount: number;
  codeQualityScore: number;
}): number {
  // Calculate weighted score
  const score = 
    (metrics.commitCount * 1) +
    (metrics.prCount * 5) +
    (metrics.issueCount * 3) +
    (metrics.codeQualityScore * 0.5);
  
  return score;
}