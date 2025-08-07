/**
 * Wellness Data Hook
 * React hook for managing wellness dashboard data with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardDataService, WellnessDashboardData, ServiceResponse } from '@/lib/services/dashboard-data-service';

export interface UseWellnessDataOptions {
  repositoryId?: string;
  days?: number;
  enableCache?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseWellnessDataReturn {
  data: WellnessDashboardData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing wellness dashboard data
 */
export function useWellnessData(options: UseWellnessDataOptions = {}): UseWellnessDataReturn {
  const { data: session, status } = useSession();
  const {
    repositoryId = 'default',
    days = 30,
    enableCache = true,
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000 // 5 minutes
  } = options;

  const [state, setState] = useState<ServiceResponse<WellnessDashboardData>>({
    data: null,
    isLoading: true,
    error: null
  });

  /**
   * Fetch wellness data
   */
  const fetchData = useCallback(async () => {
    if (status !== 'authenticated' || !session) {
      setState({
        data: null,
        isLoading: false,
        error: 'Authentication required'
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = enableCache
        ? await DashboardDataService.fetchWellnessDataCached(session, repositoryId, days)
        : await DashboardDataService.fetchWellnessDashboardData(session, repositoryId, days);

      setState(result);
    } catch (error) {
      console.error('Error fetching wellness data:', error);
      setState({
        data: null,
        isLoading: false,
        error: DashboardDataService.handleApiError(error)
      });
    }
  }, [session, status, repositoryId, days, enableCache]);

  /**
   * Refresh data manually
   */
  const refresh = useCallback(async () => {
    if (enableCache) {
      await DashboardDataService.refreshDashboardData('wellness', session);
    }
    await fetchData();
  }, [fetchData, enableCache, session]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (!state.isLoading) {
        fetchData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData, state.isLoading]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
    clearError
  };
}

/**
 * Hook for wellness data with retry mechanism
 */
export function useWellnessDataWithRetry(
  options: UseWellnessDataOptions & { maxRetries?: number; retryDelay?: number } = {}
): UseWellnessDataReturn {
  const { maxRetries = 3, retryDelay = 1000, ...wellnessOptions } = options;
  const { data: session, status } = useSession();
  
  const [state, setState] = useState<ServiceResponse<WellnessDashboardData>>({
    data: null,
    isLoading: true,
    error: null
  });

  const fetchDataWithRetry = useCallback(async () => {
    if (status !== 'authenticated' || !session) {
      setState({
        data: null,
        isLoading: false,
        error: 'Authentication required'
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await DashboardDataService.withRetry(
        () => wellnessOptions.enableCache
          ? DashboardDataService.fetchWellnessDataCached(session, wellnessOptions.repositoryId, wellnessOptions.days)
          : DashboardDataService.fetchWellnessDashboardData(session, wellnessOptions.repositoryId, wellnessOptions.days),
        maxRetries,
        retryDelay
      );

      setState(result);
    } catch (error) {
      console.error('Error fetching wellness data with retry:', error);
      setState({
        data: null,
        isLoading: false,
        error: DashboardDataService.handleApiError(error)
      });
    }
  }, [session, status, wellnessOptions, maxRetries, retryDelay]);

  const refresh = useCallback(async () => {
    if (wellnessOptions.enableCache) {
      await DashboardDataService.refreshDashboardData('wellness', session);
    }
    await fetchDataWithRetry();
  }, [fetchDataWithRetry, wellnessOptions.enableCache, session]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchDataWithRetry();
  }, [fetchDataWithRetry]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
    clearError
  };
}

/**
 * Hook for real-time wellness updates
 */
export function useRealtimeWellnessData(options: UseWellnessDataOptions = {}): UseWellnessDataReturn {
  const baseHook = useWellnessData({
    ...options,
    autoRefresh: true,
    refreshInterval: 30 * 1000 // 30 seconds for real-time updates
  });

  return baseHook;
}

/**
 * Hook for wellness data health monitoring
 */
export function useWellnessDataHealth() {
  const [health, setHealth] = useState({
    isHealthy: true,
    lastCheck: new Date(),
    error: null as string | null
  });

  const checkHealth = useCallback(async () => {
    try {
      const healthStatus = await DashboardDataService.healthCheck();
      setHealth({
        isHealthy: healthStatus.wellness,
        lastCheck: new Date(),
        error: healthStatus.wellness ? null : 'Wellness service is unavailable'
      });
    } catch (error) {
      setHealth({
        isHealthy: false,
        lastCheck: new Date(),
        error: 'Failed to check service health'
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Check health every 2 minutes
    const interval = setInterval(checkHealth, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    ...health,
    checkHealth
  };
}