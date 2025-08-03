/**
 * Analytics Types
 * Types for analytics services and data models
 */

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface TrendPoint {
  date: Date;
  value: number;
}

// Productivity Metrics
export interface ProductivityMetrics {
  userId: string;
  timeRange: TimeRange;
  commitCount: number;
  linesAdded: number;
  linesDeleted: number;
  prCount: number;
  issueCount: number;
  commitFrequency: TrendPoint[];
  workHoursDistribution: {
    hour: number;
    count: number;
  }[];
  weekdayDistribution: {
    day: number; // 0-6, 0 is Sunday
    count: number;
  }[];
  topLanguages: {
    language: string;
    percentage: number;
  }[];
}

// Burnout Risk Assessment
export interface BurnoutRiskAssessment {
  userId: string;
  riskScore: number;           // 0-100 scale
  confidence: number;          // 0-1 scale
  keyFactors: BurnoutFactor[]; // Contributing factors
  recommendations: string[];   // Intervention suggestions
  historicalTrend: TrendPoint[]; // Historical risk scores
}

export interface BurnoutFactor {
  name: string;
  impact: number; // 0-1 scale
  description: string;
}

// Burnout Factors
export interface BurnoutFactors {
  workHoursPattern: number;      // 0-1 (normal to excessive)
  codeQualityTrend: number;      // 0-1 (improving to declining)
  collaborationLevel: number;    // 0-1 (high to low)
  workloadDistribution: number;  // 0-1 (balanced to overloaded)
  timeToResolution: number;      // 0-1 (fast to slow)
  weekendWorkFrequency: number;  // 0-1 (never to always)
}

// Work Pattern Analysis
export interface WorkPatternAnalysis {
  userId: string;
  timeRange: TimeRange;
  averageStartTime: string; // HH:MM format
  averageEndTime: string;   // HH:MM format
  weekendWorkPercentage: number;
  afterHoursPercentage: number;
  consistencyScore: number; // 0-100
  workPatternCalendar: {
    date: string; // YYYY-MM-DD
    startTime: string | null; // HH:MM
    endTime: string | null;   // HH:MM
    commitCount: number;
  }[];
}

// Team Metrics
export interface TeamMetrics {
  repositoryId: string;
  timeRange: TimeRange;
  memberCount: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  velocity: TeamVelocity;
  collaboration: CollaborationMetrics;
  knowledgeDistribution: KnowledgeDistribution;
}

// Team Velocity
export interface TeamVelocity {
  velocityScore: number;
  commitFrequency: number;
  prMergeRate: number;
  issueResolutionRate: number;
  cycleTimeAverage: number;
  historicalTrend: TrendPoint[];
}

// Collaboration Metrics
export interface CollaborationMetrics {
  collaborationScore: number;
  prReviewDistribution: {
    userId: string;
    username: string;
    reviewCount: number;
  }[];
  codeOwnershipDistribution: {
    userId: string;
    username: string;
    filesOwned: number;
    percentage: number;
  }[];
  collaborationNetwork: {
    nodes: {
      id: string;
      name: string;
      group: number;
    }[];
    links: {
      source: string;
      target: string;
      value: number;
    }[];
  };
}

// Knowledge Distribution
export interface KnowledgeDistribution {
  knowledgeSharingScore: number;
  fileOwnership: {
    filename: string;
    owner: string;
    ownershipPercentage: number;
    contributors: {
      userId: string;
      username: string;
      contributionPercentage: number;
    }[];
  }[];
  riskAreas: {
    area: string;
    riskLevel: number; // 0-1 scale
    description: string;
  }[];
}

// Retrospective
export interface Retrospective {
  period: TimeRange;
  positives: string[];
  improvements: string[];
  actionItems: string[];
  teamHealth: {
    score: number;
    observations: string[];
  };
  recommendations: string[];
}

// Recommendation
export interface Recommendation {
  id: string;
  type: 'personal' | 'team';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionItems: string[];
}

// Insight
export interface Insight {
  id: string;
  type: 'productivity' | 'burnout' | 'collaboration';
  title: string;
  description: string;
  metrics: Record<string, number>;
  trend: 'improving' | 'stable' | 'declining';
  confidence: number; // 0-1 scale
}

// Analytics Service Interface
export interface AnalyticsService {
  // Personal analytics
  getUserProductivityMetrics(userId: string, timeRange: TimeRange): Promise<ProductivityMetrics>;
  getUserBurnoutRisk(userId: string): Promise<BurnoutRiskAssessment>;
  getUserWorkPatterns(userId: string, timeRange: TimeRange): Promise<WorkPatternAnalysis>;
  
  // Team analytics
  getTeamVelocity(repoId: string, timeRange: TimeRange): Promise<TeamVelocity>;
  getTeamCollaboration(repoId: string): Promise<CollaborationMetrics>;
  getKnowledgeDistribution(repoId: string): Promise<KnowledgeDistribution>;
  
  // Burnout analysis
  calculateBurnoutFactors(userId: string, repoId?: string): Promise<BurnoutFactors>;
  generateBurnoutRecommendations(riskScore: number, factors: BurnoutFactors): Promise<string[]>;
}