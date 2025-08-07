/**
 * Dashboard Data Service
 * Unified service for fetching and managing dashboard data with proper error handling
 */

import { WellnessDataAdapter, WellnessData, DeveloperProfile, WellnessMetrics, AIInsights } from '@/lib/adapters/wellness-data-adapter';
import { CapacityDataAdapter, TeamMember, TeamOverview, TeamAnalytics } from '@/lib/adapters/capacity-data-adapter';
import { ApiResult, ErrorCode } from '@/lib/types/api';

// Service response types
export interface ServiceResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface WellnessDashboardData {
  wellnessData: WellnessData | null;
  developerProfile: DeveloperProfile;
  wellnessMetrics: WellnessMetrics;
  aiInsights: AIInsights;
  realtimeActivity: Array<{
    time: string;
    action: string;
    type: 'success' | 'warning' | 'positive' | 'neutral';
    impact: 'high' | 'medium' | 'low';
  }>;
}

export interface CapacityDashboardData {
  teamMembers: TeamMember[];
  teamOverview: TeamOverview;
  teamAnalytics: TeamAnalytics;
  capacityDistribution: Array<{
    range: string;
    count: number;
    color: string;
    label: string;
  }>;
}

/**
 * Dashboard Data Service Class
 */
export class DashboardDataService {
  private static readonly DEFAULT_REPOSITORY_ID = 'default';
  private static readonly DEFAULT_TEAM_ID = 'default';
  private static readonly DEFAULT_DAYS = 30;

  /**
   * Fetch wellness dashboard data
   */
  static async fetchWellnessDashboardData(
    userSession: any,
    repositoryId: string = this.DEFAULT_REPOSITORY_ID,
    days: number = this.DEFAULT_DAYS
  ): Promise<ServiceResponse<WellnessDashboardData>> {
    try {
      // Fetch raw data from adapters
      const { wellnessData, productivityData, workPatterns, error } = 
        await WellnessDataAdapter.fetchWellnessData(repositoryId, days);

      if (error) {
        return {
          data: null,
          isLoading: false,
          error
        };
      }

      // Create developer profile
      const developerProfile = WellnessDataAdapter.createDeveloperProfile(
        userSession,
        wellnessData || undefined,
        productivityData || undefined
      );

      // Calculate wellness metrics
      const wellnessMetrics = WellnessDataAdapter.calculateWellnessMetrics(
        wellnessData || undefined,
        productivityData || undefined,
        workPatterns || undefined
      );

      // Generate AI insights
      const aiInsights = WellnessDataAdapter.generateAIInsights(
        wellnessData || undefined,
        productivityData || undefined
      );

      // Generate realtime activity
      const realtimeActivity = WellnessDataAdapter.generateRealtimeActivity(
        productivityData || undefined
      );

      return {
        data: {
          wellnessData,
          developerProfile,
          wellnessMetrics,
          aiInsights,
          realtimeActivity
        },
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error('Error fetching wellness dashboard data:', error);
      return {
        data: null,
        isLoading: false,
        error: 'Failed to load wellness dashboard data'
      };
    }
  }

  /**
   * Fetch capacity dashboard data
   */
  static async fetchCapacityDashboardData(
    userSession: any,
    teamId: string = this.DEFAULT_TEAM_ID
  ): Promise<ServiceResponse<CapacityDashboardData>> {
    try {
      // Fetch raw data from adapters
      const { teamMembers, teamOverview, teamAnalytics, error } = 
        await CapacityDataAdapter.fetchCapacityData(teamId);

      if (error) {
        return {
          data: null,
          isLoading: false,
          error
        };
      }

      // Calculate capacity distribution
      const capacityDistribution = CapacityDataAdapter.calculateCapacityDistribution(teamMembers);

      return {
        data: {
          teamMembers,
          teamOverview,
          teamAnalytics,
          capacityDistribution
        },
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error('Error fetching capacity dashboard data:', error);
      return {
        data: null,
        isLoading: false,
        error: 'Failed to load capacity dashboard data'
      };
    }
  }

  /**
   * Create loading state for wellness dashboard
   */
  static createWellnessLoadingState(): ServiceResponse<WellnessDashboardData> {
    return {
      data: null,
      isLoading: true,
      error: null
    };
  }

  /**
   * Create loading state for capacity dashboard
   */
  static createCapacityLoadingState(): ServiceResponse<CapacityDashboardData> {
    return {
      data: null,
      isLoading: true,
      error: null
    };
  }

  /**
   * Handle API errors with user-friendly messages
   */
  static handleApiError(error: any): string {
    if (error?.code) {
      switch (error.code) {
        case ErrorCode.UNAUTHORIZED:
          return 'You are not authorized to view this data. Please sign in again.';
        case ErrorCode.FORBIDDEN:
          return 'You do not have permission to access this dashboard.';
        case ErrorCode.RATE_LIMITED:
          return 'Too many requests. Please wait a moment and try again.';
        case ErrorCode.SERVICE_UNAVAILABLE:
          return 'Dashboard service is temporarily unavailable. Please try again later.';
        case ErrorCode.NETWORK_ERROR:
          return 'Network connection error. Please check your internet connection.';
        default:
          return 'An unexpected error occurred. Please try again.';
      }
    }

    if (error?.message) {
      return error.message;
    }

    return 'An unknown error occurred while loading dashboard data.';
  }

  /**
   * Retry mechanism for failed requests
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError;
  }

  /**
   * Validate API response structure
   */
  static validateApiResponse(response: any): boolean {
    return (
      response &&
      typeof response === 'object' &&
      'success' in response &&
      'timestamp' in response &&
      (response.success === true ? 'data' in response : 'error' in response)
    );
  }

  /**
   * Cache management for dashboard data
   */
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  /**
   * Get cached data if available and not expired
   */
  static getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cached data with TTL
   */
  static setCachedData<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  /**
   * Clear cache for a specific key or all cache
   */
  static clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Fetch wellness data with caching
   */
  static async fetchWellnessDataCached(
    userSession: any,
    repositoryId: string = this.DEFAULT_REPOSITORY_ID,
    days: number = this.DEFAULT_DAYS
  ): Promise<ServiceResponse<WellnessDashboardData>> {
    const cacheKey = `wellness-${repositoryId}-${days}-${userSession?.user?.id}`;
    
    // Try to get from cache first
    const cached = this.getCachedData<WellnessDashboardData>(cacheKey);
    if (cached) {
      return {
        data: cached,
        isLoading: false,
        error: null
      };
    }

    // Fetch fresh data
    const result = await this.fetchWellnessDashboardData(userSession, repositoryId, days);
    
    // Cache successful results
    if (result.data && !result.error) {
      this.setCachedData(cacheKey, result.data);
    }

    return result;
  }

  /**
   * Fetch capacity data with caching
   */
  static async fetchCapacityDataCached(
    userSession: any,
    teamId: string = this.DEFAULT_TEAM_ID
  ): Promise<ServiceResponse<CapacityDashboardData>> {
    const cacheKey = `capacity-${teamId}-${userSession?.user?.id}`;
    
    // Try to get from cache first
    const cached = this.getCachedData<CapacityDashboardData>(cacheKey);
    if (cached) {
      return {
        data: cached,
        isLoading: false,
        error: null
      };
    }

    // Fetch fresh data
    const result = await this.fetchCapacityDashboardData(userSession, teamId);
    
    // Cache successful results
    if (result.data && !result.error) {
      this.setCachedData(cacheKey, result.data);
    }

    return result;
  }

  /**
   * Health check for dashboard services
   */
  static async healthCheck(): Promise<{
    wellness: boolean;
    capacity: boolean;
    overall: boolean;
  }> {
    try {
      const [wellnessCheck, capacityCheck] = await Promise.all([
        fetch('/api/analytics/burnout?repositoryId=health-check&days=1').then(r => r.ok),
        fetch('/api/analytics/team?teamId=health-check').then(r => r.ok)
      ]);

      return {
        wellness: wellnessCheck,
        capacity: capacityCheck,
        overall: wellnessCheck && capacityCheck
      };
    } catch (error) {
      return {
        wellness: false,
        capacity: false,
        overall: false
      };
    }
  }

  /**
   * Refresh dashboard data
   */
  static async refreshDashboardData(type: 'wellness' | 'capacity', userSession: any): Promise<void> {
    if (type === 'wellness') {
      this.clearCache(`wellness-${this.DEFAULT_REPOSITORY_ID}-${this.DEFAULT_DAYS}-${userSession?.user?.id}`);
    } else {
      this.clearCache(`capacity-${this.DEFAULT_TEAM_ID}-${userSession?.user?.id}`);
    }
  }
}