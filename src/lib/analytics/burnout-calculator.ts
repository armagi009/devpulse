/**
 * Burnout Risk Calculator
 * Calculates burnout risk score based on various factors
 */

import { prisma } from '@/lib/db/prisma';
import { BurnoutMetric } from '@prisma/client';
import { 
  subDays, 
  differenceInDays, 
  isWeekend, 
  format, 
  parseISO,
  startOfDay,
  endOfDay
} from 'date-fns';

// Burnout factor weights
const FACTOR_WEIGHTS = {
  workHoursPattern: 0.25,     // Weight for work hours pattern
  codeQualityTrend: 0.15,     // Weight for code quality trend
  collaborationLevel: 0.15,   // Weight for collaboration level
  workloadDistribution: 0.20, // Weight for workload distribution
  timeToResolution: 0.10,     // Weight for time to resolution
  weekendWorkFrequency: 0.15, // Weight for weekend work frequency
};

// Burnout risk assessment
export interface BurnoutRiskAssessment {
  riskScore: number;           // 0-100 scale
  confidence: number;          // 0-1 scale
  keyFactors: BurnoutFactor[]; // Contributing factors
  recommendations: string[];   // Intervention suggestions
  historicalTrend: TrendPoint[]; // Historical risk scores
}

// Burnout factor
export interface BurnoutFactor {
  name: string;
  impact: number; // 0-1 scale
  description: string;
}

// Trend point
export interface TrendPoint {
  date: Date;
  value: number;
}

// Burnout factors
export interface BurnoutFactors {
  workHoursPattern: number;      // 0-1 (normal to excessive)
  codeQualityTrend: number;      // 0-1 (improving to declining)
  collaborationLevel: number;    // 0-1 (high to low)
  workloadDistribution: number;  // 0-1 (balanced to overloaded)
  timeToResolution: number;      // 0-1 (fast to slow)
  weekendWorkFrequency: number;  // 0-1 (never to always)
}

/**
 * Calculate burnout risk score
 */
export async function calculateBurnoutRisk(
  userId: string,
  repositoryId?: string,
  days: number = 30
): Promise<BurnoutRiskAssessment> {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    // Get burnout metrics
    const metrics = await getBurnoutMetrics(userId, repositoryId, startDate, endDate);
    
    // Calculate burnout factors
    const factors = calculateBurnoutFactors(metrics);
    
    // Calculate risk score
    const riskScore = calculateRiskScore(factors);
    
    // Calculate confidence score
    const confidence = calculateConfidenceScore(metrics);
    
    // Get key factors
    const keyFactors = getKeyFactors(factors);
    
    // Get recommendations
    const recommendations = generateRecommendations(factors, riskScore);
    
    // Get historical trend
    const historicalTrend = await getHistoricalTrend(userId, repositoryId, days);
    
    return {
      riskScore,
      confidence,
      keyFactors,
      recommendations,
      historicalTrend,
    };
  } catch (error) {
    console.error('Error calculating burnout risk:', error);
    throw error;
  }
}

/**
 * Get burnout metrics from database
 */
async function getBurnoutMetrics(
  userId: string,
  repositoryId: string | undefined,
  startDate: Date,
  endDate: Date
): Promise<BurnoutMetric[]> {
  // Build query
  const query: any = {
    userId,
    date: {
      gte: startDate,
      lte: endDate,
    },
  };
  
  if (repositoryId) {
    query.repositoryId = repositoryId;
  }
  
  // Get metrics from database
  const metrics = await prisma.burnoutMetric.findMany({
    where: query,
    orderBy: {
      date: 'asc',
    },
  });
  
  return metrics;
}

/**
 * Calculate burnout factors
 */
function calculateBurnoutFactors(metrics: BurnoutMetric[]): BurnoutFactors {
  // Initialize factors
  const factors: BurnoutFactors = {
    workHoursPattern: 0,
    codeQualityTrend: 0,
    collaborationLevel: 0,
    workloadDistribution: 0,
    timeToResolution: 0,
    weekendWorkFrequency: 0,
  };
  
  // Return default factors if no metrics
  if (metrics.length === 0) {
    return factors;
  }
  
  // Calculate work hours pattern
  factors.workHoursPattern = calculateWorkHoursPattern(metrics);
  
  // Calculate code quality trend
  factors.codeQualityTrend = calculateCodeQualityTrend(metrics);
  
  // Calculate collaboration level
  factors.collaborationLevel = calculateCollaborationLevel(metrics);
  
  // Calculate workload distribution
  factors.workloadDistribution = calculateWorkloadDistribution(metrics);
  
  // Calculate time to resolution
  factors.timeToResolution = calculateTimeToResolution(metrics);
  
  // Calculate weekend work frequency
  factors.weekendWorkFrequency = calculateWeekendWorkFrequency(metrics);
  
  return factors;
}

/**
 * Calculate work hours pattern factor
 */
function calculateWorkHoursPattern(metrics: BurnoutMetric[]): number {
  // Count late night commits
  const totalLateNightCommits = metrics.reduce((sum, metric) => sum + metric.lateNightCommits, 0);
  
  // Count total commits
  const totalCommits = metrics.reduce((sum, metric) => sum + metric.commitsCount, 0);
  
  // Calculate late night commit ratio
  const lateNightRatio = totalCommits > 0 ? totalLateNightCommits / totalCommits : 0;
  
  // Calculate average commit time hour
  const commitTimeHours = metrics
    .filter(metric => metric.avgCommitTimeHour !== null)
    .map(metric => metric.avgCommitTimeHour!);
  
  const avgCommitTimeHour = commitTimeHours.length > 0
    ? commitTimeHours.reduce((sum, hour) => sum + hour, 0) / commitTimeHours.length
    : 12; // Default to noon
  
  // Calculate work hours pattern factor
  // Higher factor if commits are late at night or early morning
  // Lower factor if commits are during normal working hours (9 AM - 5 PM)
  let workHoursPattern = 0;
  
  // Factor based on late night commit ratio
  workHoursPattern += lateNightRatio * 0.7;
  
  // Factor based on average commit time hour
  // Higher if outside normal working hours (9-17)
  if (avgCommitTimeHour < 9) {
    // Early morning (before 9 AM)
    workHoursPattern += 0.3 * (1 - avgCommitTimeHour / 9);
  } else if (avgCommitTimeHour > 17) {
    // Late evening (after 5 PM)
    workHoursPattern += 0.3 * ((avgCommitTimeHour - 17) / 7); // Max is midnight (24 - 17 = 7)
  }
  
  // Ensure factor is between 0 and 1
  return Math.min(1, Math.max(0, workHoursPattern));
}

/**
 * Calculate code quality trend factor
 */
function calculateCodeQualityTrend(metrics: BurnoutMetric[]): number {
  // Calculate average commit message length
  const commitMessageLengths = metrics
    .filter(metric => metric.avgCommitMessageLength !== null)
    .map(metric => metric.avgCommitMessageLength!);
  
  const avgCommitMessageLength = commitMessageLengths.length > 0
    ? commitMessageLengths.reduce((sum, length) => sum + length, 0) / commitMessageLengths.length
    : 0;
  
  // Calculate code quality trend factor
  // Higher factor if commit messages are short (indicating potential rushed work)
  // Lower factor if commit messages are detailed
  let codeQualityTrend = 0;
  
  // Factor based on average commit message length
  // Shorter messages may indicate lower quality
  if (avgCommitMessageLength < 10) {
    codeQualityTrend += 0.8; // Very short messages
  } else if (avgCommitMessageLength < 20) {
    codeQualityTrend += 0.6; // Short messages
  } else if (avgCommitMessageLength < 50) {
    codeQualityTrend += 0.4; // Medium messages
  } else if (avgCommitMessageLength < 100) {
    codeQualityTrend += 0.2; // Detailed messages
  } else {
    codeQualityTrend += 0.1; // Very detailed messages
  }
  
  // Ensure factor is between 0 and 1
  return Math.min(1, Math.max(0, codeQualityTrend));
}

/**
 * Calculate collaboration level factor
 */
function calculateCollaborationLevel(metrics: BurnoutMetric[]): number {
  // Calculate total PRs reviewed
  const totalPRsReviewed = metrics.reduce((sum, metric) => sum + metric.prsReviewed, 0);
  
  // Calculate total PRs opened
  const totalPRsOpened = metrics.reduce((sum, metric) => sum + metric.prsOpened, 0);
  
  // Calculate total code review comments
  const totalCodeReviewComments = metrics.reduce((sum, metric) => sum + metric.codeReviewComments, 0);
  
  // Calculate collaboration level factor
  // Higher factor if low collaboration (few PRs reviewed, few code review comments)
  // Lower factor if high collaboration
  let collaborationLevel = 0;
  
  // Factor based on PR review ratio
  const prReviewRatio = totalPRsOpened > 0 ? totalPRsReviewed / totalPRsOpened : 0;
  collaborationLevel += (1 - Math.min(1, prReviewRatio)) * 0.6;
  
  // Factor based on code review comments
  const avgCodeReviewComments = totalPRsOpened > 0 ? totalCodeReviewComments / totalPRsOpened : 0;
  if (avgCodeReviewComments < 1) {
    collaborationLevel += 0.4; // Very few comments
  } else if (avgCodeReviewComments < 3) {
    collaborationLevel += 0.3; // Few comments
  } else if (avgCodeReviewComments < 5) {
    collaborationLevel += 0.2; // Some comments
  } else if (avgCodeReviewComments < 10) {
    collaborationLevel += 0.1; // Many comments
  }
  
  // Ensure factor is between 0 and 1
  return Math.min(1, Math.max(0, collaborationLevel));
}

/**
 * Calculate workload distribution factor
 */
function calculateWorkloadDistribution(metrics: BurnoutMetric[]): number {
  // Calculate daily commit counts
  const dailyCommitCounts = metrics.map(metric => metric.commitsCount);
  
  // Calculate standard deviation of daily commit counts
  const avgCommitCount = dailyCommitCounts.reduce((sum, count) => sum + count, 0) / dailyCommitCounts.length;
  const variance = dailyCommitCounts.reduce((sum, count) => sum + Math.pow(count - avgCommitCount, 2), 0) / dailyCommitCounts.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate coefficient of variation (CV)
  const cv = avgCommitCount > 0 ? stdDev / avgCommitCount : 0;
  
  // Calculate workload distribution factor
  // Higher factor if high variation in daily commit counts (indicating uneven workload)
  // Lower factor if consistent daily commit counts
  let workloadDistribution = 0;
  
  // Factor based on coefficient of variation
  if (cv > 2) {
    workloadDistribution += 1.0; // Very uneven workload
  } else if (cv > 1.5) {
    workloadDistribution += 0.8; // Uneven workload
  } else if (cv > 1.0) {
    workloadDistribution += 0.6; // Somewhat uneven workload
  } else if (cv > 0.5) {
    workloadDistribution += 0.4; // Somewhat even workload
  } else {
    workloadDistribution += 0.2; // Even workload
  }
  
  // Ensure factor is between 0 and 1
  return Math.min(1, Math.max(0, workloadDistribution));
}

/**
 * Calculate time to resolution factor
 */
function calculateTimeToResolution(metrics: BurnoutMetric[]): number {
  // Calculate average PR review time
  const prReviewTimes = metrics
    .filter(metric => metric.avgPrReviewTimeHours !== null)
    .map(metric => metric.avgPrReviewTimeHours!);
  
  const avgPrReviewTime = prReviewTimes.length > 0
    ? prReviewTimes.reduce((sum, time) => sum + time, 0) / prReviewTimes.length
    : 0;
  
  // Calculate time to resolution factor
  // Higher factor if long PR review times (indicating potential bottlenecks)
  // Lower factor if short PR review times
  let timeToResolution = 0;
  
  // Factor based on average PR review time
  if (avgPrReviewTime > 72) {
    timeToResolution += 1.0; // Very long review times (> 3 days)
  } else if (avgPrReviewTime > 48) {
    timeToResolution += 0.8; // Long review times (2-3 days)
  } else if (avgPrReviewTime > 24) {
    timeToResolution += 0.6; // Moderate review times (1-2 days)
  } else if (avgPrReviewTime > 12) {
    timeToResolution += 0.4; // Short review times (12-24 hours)
  } else if (avgPrReviewTime > 4) {
    timeToResolution += 0.2; // Very short review times (4-12 hours)
  } else {
    timeToResolution += 0.1; // Extremely short review times (< 4 hours)
  }
  
  // Ensure factor is between 0 and 1
  return Math.min(1, Math.max(0, timeToResolution));
}

/**
 * Calculate weekend work frequency factor
 */
function calculateWeekendWorkFrequency(metrics: BurnoutMetric[]): number {
  // Calculate total weekend commits
  const totalWeekendCommits = metrics.reduce((sum, metric) => sum + metric.weekendCommits, 0);
  
  // Calculate total commits
  const totalCommits = metrics.reduce((sum, metric) => sum + metric.commitsCount, 0);
  
  // Calculate weekend commit ratio
  const weekendRatio = totalCommits > 0 ? totalWeekendCommits / totalCommits : 0;
  
  // Calculate weekend work frequency factor
  // Higher factor if high weekend commit ratio
  // Lower factor if low weekend commit ratio
  let weekendWorkFrequency = 0;
  
  // Factor based on weekend commit ratio
  if (weekendRatio > 0.5) {
    weekendWorkFrequency += 1.0; // Very high weekend work
  } else if (weekendRatio > 0.3) {
    weekendWorkFrequency += 0.8; // High weekend work
  } else if (weekendRatio > 0.2) {
    weekendWorkFrequency += 0.6; // Moderate weekend work
  } else if (weekendRatio > 0.1) {
    weekendWorkFrequency += 0.4; // Low weekend work
  } else if (weekendRatio > 0) {
    weekendWorkFrequency += 0.2; // Very low weekend work
  }
  
  // Ensure factor is between 0 and 1
  return Math.min(1, Math.max(0, weekendWorkFrequency));
}

/**
 * Calculate risk score
 */
function calculateRiskScore(factors: BurnoutFactors): number {
  // Calculate weighted sum of factors
  const weightedSum = 
    factors.workHoursPattern * FACTOR_WEIGHTS.workHoursPattern +
    factors.codeQualityTrend * FACTOR_WEIGHTS.codeQualityTrend +
    factors.collaborationLevel * FACTOR_WEIGHTS.collaborationLevel +
    factors.workloadDistribution * FACTOR_WEIGHTS.workloadDistribution +
    factors.timeToResolution * FACTOR_WEIGHTS.timeToResolution +
    factors.weekendWorkFrequency * FACTOR_WEIGHTS.weekendWorkFrequency;
  
  // Convert to 0-100 scale
  const riskScore = Math.round(weightedSum * 100);
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, riskScore));
}

/**
 * Calculate confidence score
 */
function calculateConfidenceScore(metrics: BurnoutMetric[]): number {
  // Calculate confidence based on data availability
  if (metrics.length === 0) {
    return 0; // No data
  }
  
  // Calculate data completeness
  let completeness = 0;
  
  // Check if metrics have commit data
  const hasCommitData = metrics.some(metric => metric.commitsCount > 0);
  if (hasCommitData) completeness += 0.3;
  
  // Check if metrics have PR data
  const hasPRData = metrics.some(metric => metric.prsOpened > 0 || metric.prsReviewed > 0);
  if (hasPRData) completeness += 0.3;
  
  // Check if metrics have issue data
  const hasIssueData = metrics.some(metric => metric.issuesCreated > 0 || metric.issuesResolved > 0);
  if (hasIssueData) completeness += 0.2;
  
  // Check if metrics have time data
  const hasTimeData = metrics.some(metric => 
    metric.avgCommitTimeHour !== null || 
    metric.avgPrReviewTimeHours !== null
  );
  if (hasTimeData) completeness += 0.2;
  
  // Calculate data volume factor
  const volumeFactor = Math.min(1, metrics.length / 14); // At least 2 weeks of data for full confidence
  
  // Calculate final confidence score
  const confidence = completeness * volumeFactor;
  
  // Ensure confidence is between 0 and 1
  return Math.min(1, Math.max(0, confidence));
}

/**
 * Get key factors contributing to burnout risk
 */
function getKeyFactors(factors: BurnoutFactors): BurnoutFactor[] {
  // Create array of factors with names and descriptions
  const factorArray: BurnoutFactor[] = [
    {
      name: 'Work Hours Pattern',
      impact: factors.workHoursPattern,
      description: getWorkHoursDescription(factors.workHoursPattern),
    },
    {
      name: 'Code Quality Trend',
      impact: factors.codeQualityTrend,
      description: getCodeQualityDescription(factors.codeQualityTrend),
    },
    {
      name: 'Collaboration Level',
      impact: factors.collaborationLevel,
      description: getCollaborationDescription(factors.collaborationLevel),
    },
    {
      name: 'Workload Distribution',
      impact: factors.workloadDistribution,
      description: getWorkloadDescription(factors.workloadDistribution),
    },
    {
      name: 'Time to Resolution',
      impact: factors.timeToResolution,
      description: getTimeToResolutionDescription(factors.timeToResolution),
    },
    {
      name: 'Weekend Work Frequency',
      impact: factors.weekendWorkFrequency,
      description: getWeekendWorkDescription(factors.weekendWorkFrequency),
    },
  ];
  
  // Sort factors by impact (descending)
  factorArray.sort((a, b) => b.impact - a.impact);
  
  // Return top 3 factors
  return factorArray.slice(0, 3);
}

/**
 * Get work hours description
 */
function getWorkHoursDescription(factor: number): string {
  if (factor > 0.8) {
    return 'Significant work during late night hours';
  } else if (factor > 0.6) {
    return 'Frequent work outside normal hours';
  } else if (factor > 0.4) {
    return 'Some work outside normal hours';
  } else if (factor > 0.2) {
    return 'Occasional work outside normal hours';
  } else {
    return 'Work mostly during normal hours';
  }
}

/**
 * Get code quality description
 */
function getCodeQualityDescription(factor: number): string {
  if (factor > 0.8) {
    return 'Very short commit messages, potential quality issues';
  } else if (factor > 0.6) {
    return 'Short commit messages, may indicate rushed work';
  } else if (factor > 0.4) {
    return 'Average commit message quality';
  } else if (factor > 0.2) {
    return 'Good commit message quality';
  } else {
    return 'Excellent commit message quality';
  }
}

/**
 * Get collaboration description
 */
function getCollaborationDescription(factor: number): string {
  if (factor > 0.8) {
    return 'Very low collaboration and code review activity';
  } else if (factor > 0.6) {
    return 'Limited collaboration with team members';
  } else if (factor > 0.4) {
    return 'Moderate collaboration and code review';
  } else if (factor > 0.2) {
    return 'Good collaboration with team members';
  } else {
    return 'Excellent collaboration and code review practices';
  }
}

/**
 * Get workload description
 */
function getWorkloadDescription(factor: number): string {
  if (factor > 0.8) {
    return 'Highly uneven workload with significant spikes';
  } else if (factor > 0.6) {
    return 'Uneven workload distribution';
  } else if (factor > 0.4) {
    return 'Somewhat uneven workload';
  } else if (factor > 0.2) {
    return 'Relatively even workload';
  } else {
    return 'Very consistent workload distribution';
  }
}

/**
 * Get time to resolution description
 */
function getTimeToResolutionDescription(factor: number): string {
  if (factor > 0.8) {
    return 'Very long PR review times (3+ days)';
  } else if (factor > 0.6) {
    return 'Long PR review times (2-3 days)';
  } else if (factor > 0.4) {
    return 'Moderate PR review times (1-2 days)';
  } else if (factor > 0.2) {
    return 'Quick PR review times (12-24 hours)';
  } else {
    return 'Very quick PR review times (< 12 hours)';
  }
}

/**
 * Get weekend work description
 */
function getWeekendWorkDescription(factor: number): string {
  if (factor > 0.8) {
    return 'Very frequent weekend work';
  } else if (factor > 0.6) {
    return 'Regular weekend work';
  } else if (factor > 0.4) {
    return 'Occasional weekend work';
  } else if (factor > 0.2) {
    return 'Rare weekend work';
  } else {
    return 'Almost no weekend work';
  }
}

/**
 * Generate recommendations based on burnout factors
 */
function generateRecommendations(factors: BurnoutFactors, riskScore: number): string[] {
  const recommendations: string[] = [];
  
  // Add general recommendations based on risk score
  if (riskScore > 70) {
    recommendations.push('Consider taking time off to recharge and prevent burnout.');
    recommendations.push('Discuss workload concerns with your manager or team lead.');
  } else if (riskScore > 50) {
    recommendations.push('Monitor your work patterns and try to maintain better work-life balance.');
    recommendations.push('Consider delegating some tasks or asking for help when needed.');
  }
  
  // Add specific recommendations based on factors
  if (factors.workHoursPattern > 0.6) {
    recommendations.push('Try to limit work during late night hours and establish more regular working hours.');
  }
  
  if (factors.codeQualityTrend > 0.6) {
    recommendations.push('Take more time to write detailed commit messages and focus on code quality.');
  }
  
  if (factors.collaborationLevel > 0.6) {
    recommendations.push('Increase collaboration with team members through more code reviews and discussions.');
  }
  
  if (factors.workloadDistribution > 0.6) {
    recommendations.push('Work on distributing your workload more evenly throughout the week.');
  }
  
  if (factors.timeToResolution > 0.6) {
    recommendations.push('Try to reduce PR review times by breaking down changes into smaller, more manageable pieces.');
  }
  
  if (factors.weekendWorkFrequency > 0.6) {
    recommendations.push('Reduce weekend work to ensure proper rest and recovery time.');
  }
  
  // Ensure we have at least 3 recommendations
  if (recommendations.length < 3) {
    recommendations.push('Regularly review your work patterns and make adjustments as needed.');
    recommendations.push('Take short breaks during the day to maintain focus and productivity.');
    recommendations.push('Maintain open communication with your team about workload and capacity.');
  }
  
  // Return up to 5 recommendations
  return recommendations.slice(0, 5);
}

/**
 * Get historical trend of burnout risk scores
 */
async function getHistoricalTrend(
  userId: string,
  repositoryId: string | undefined,
  days: number
): Promise<TrendPoint[]> {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    // Get burnout metrics with existing risk scores
    const metrics = await prisma.burnoutMetric.findMany({
      where: {
        userId,
        ...(repositoryId ? { repositoryId } : {}),
        date: {
          gte: startDate,
          lte: endDate,
        },
        burnoutRiskScore: {
          not: null,
        },
      },
      orderBy: {
        date: 'asc',
      },
      select: {
        date: true,
        burnoutRiskScore: true,
      },
    });
    
    // Convert to trend points
    const trendPoints: TrendPoint[] = metrics.map(metric => ({
      date: metric.date,
      value: Number(metric.burnoutRiskScore),
    }));
    
    return trendPoints;
  } catch (error) {
    console.error('Error getting historical trend:', error);
    return [];
  }
}

/**
 * Save burnout risk score to database
 */
export async function saveBurnoutRiskScore(
  userId: string,
  repositoryId: string,
  date: Date,
  riskScore: number
): Promise<void> {
  try {
    // Find existing metric for this date
    const existingMetric = await prisma.burnoutMetric.findUnique({
      where: {
        userId_repositoryId_date: {
          userId,
          repositoryId,
          date: startOfDay(date),
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
          burnoutRiskScore: riskScore,
        },
      });
    } else {
      // Create new metric with minimal data
      await prisma.burnoutMetric.create({
        data: {
          userId,
          repositoryId,
          date: startOfDay(date),
          burnoutRiskScore: riskScore,
          commitsCount: 0,
          linesAdded: 0,
          linesDeleted: 0,
          prsOpened: 0,
          prsReviewed: 0,
          issuesCreated: 0,
          issuesResolved: 0,
          weekendCommits: 0,
          lateNightCommits: 0,
          codeReviewComments: 0,
        },
      });
    }
  } catch (error) {
    console.error('Error saving burnout risk score:', error);
    throw error;
  }
}