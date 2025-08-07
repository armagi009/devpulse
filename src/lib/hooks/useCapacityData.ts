/**
 * Capacity Data Hook
 * React hook for managing capacity dashboard data with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardDataService, CapacityDashboardData, ServiceResponse } from '@/lib/services/dashboard-data-service';

export interface UseCapacityDataOptions {
  teamId?: string;
  enableCache?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseCapacityDataReturn {
  data: CapacityDashboardData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing capacity dashboard data
 */
export function useCapacityData(options: UseCapacityDataOptions = {}): UseCapacityDataReturn {
  const { data: session, status } = useSession();
  const {
    teamId = 'default',
    enableCache = true,
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000 // 5 minutes
  } = options;

  const [state, setState] = useState<ServiceResponse<CapacityDashboardData>>({
    data: null,
    isLoading: true,
    error: null
  });

  /**
   * Fetch capacity data
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
        ? await DashboardDataService.fetchCapacityDataCached(session, teamId)
        : await DashboardDataService.fetchCapacityDashboardData(session, teamId);

      setState(result);
    } catch (error) {
      console.error('Error fetching capacity data:', error);
      setState({
        data: null,
        isLoading: false,
        error: DashboardDataService.handleApiError(error)
      });
    }
  }, [session, status, teamId, enableCache]);

  /**
   * Refresh data manually
   */
  const refresh = useCallback(async () => {
    if (enableCache) {
      await DashboardDataService.refreshDashboardData('capacity', session);
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
 * Hook for capacity data with retry mechanism
 */
export function useCapacityDataWithRetry(
  options: UseCapacityDataOptions & { maxRetries?: number; retryDelay?: number } = {}
): UseCapacityDataReturn {
  const { maxRetries = 3, retryDelay = 1000, ...capacityOptions } = options;
  const { data: session, status } = useSession();
  
  const [state, setState] = useState<ServiceResponse<CapacityDashboardData>>({
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
        () => capacityOptions.enableCache
          ? DashboardDataService.fetchCapacityDataCached(session, capacityOptions.teamId)
          : DashboardDataService.fetchCapacityDashboardData(session, capacityOptions.teamId),
        maxRetries,
        retryDelay
      );

      setState(result);
    } catch (error) {
      console.error('Error fetching capacity data with retry:', error);
      setState({
        data: null,
        isLoading: false,
        error: DashboardDataService.handleApiError(error)
      });
    }
  }, [session, status, capacityOptions, maxRetries, retryDelay]);

  const refresh = useCallback(async () => {
    if (capacityOptions.enableCache) {
      await DashboardDataService.refreshDashboardData('capacity', session);
    }
    await fetchDataWithRetry();
  }, [fetchDataWithRetry, capacityOptions.enableCache, session]);

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
 * Hook for real-time capacity updates
 */
export function useRealtimeCapacityData(options: UseCapacityDataOptions = {}): UseCapacityDataReturn {
  const baseHook = useCapacityData({
    ...options,
    autoRefresh: true,
    refreshInterval: 60 * 1000 // 1 minute for capacity updates
  });

  return baseHook;
}

/**
 * Hook for team member filtering and sorting
 */
export function useTeamMemberFilters(data: CapacityDashboardData | null) {
  const [filters, setFilters] = useState({
    riskLevel: 'all' as 'all' | 'low' | 'moderate' | 'high',
    sortBy: 'capacity' as 'capacity' | 'velocity' | 'wellness' | 'name',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const filteredAndSortedMembers = useCallback(() => {
    if (!data?.teamMembers) return [];

    let filtered = data.teamMembers;

    // Apply risk level filter
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(member => member.burnoutRisk === filters.riskLevel);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (filters.sortBy) {
        case 'capacity':
          aValue = a.capacity;
          bValue = b.capacity;
          break;
        case 'velocity':
          aValue = a.velocity;
          bValue = b.velocity;
          break;
        case 'wellness':
          aValue = a.wellnessFactor;
          bValue = b.wellnessFactor;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          aValue = a.capacity;
          bValue = b.capacity;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return filters.sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [data?.teamMembers, filters]);

  const updateFilter = useCallback((key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      riskLevel: 'all',
      sortBy: 'capacity',
      sortOrder: 'desc'
    });
  }, []);

  return {
    filters,
    filteredMembers: filteredAndSortedMembers(),
    updateFilter,
    resetFilters
  };
}

/**
 * Hook for capacity data health monitoring
 */
export function useCapacityDataHealth() {
  const [health, setHealth] = useState({
    isHealthy: true,
    lastCheck: new Date(),
    error: null as string | null
  });

  const checkHealth = useCallback(async () => {
    try {
      const healthStatus = await DashboardDataService.healthCheck();
      setHealth({
        isHealthy: healthStatus.capacity,
        lastCheck: new Date(),
        error: healthStatus.capacity ? null : 'Capacity service is unavailable'
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

/**
 * Hook for capacity alerts and notifications
 */
export function useCapacityAlerts(data: CapacityDashboardData | null) {
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  const activeAlerts = useCallback(() => {
    if (!data?.teamMembers) return [];

    const alerts: Array<{
      id: string;
      memberId: string;
      memberName: string;
      type: 'critical' | 'warning' | 'info';
      message: string;
      time: string;
      acknowledged: boolean;
    }> = [];

    data.teamMembers.forEach(member => {
      member.alerts.forEach((alert, index) => {
        const alertId = `${member.id}-${index}`;
        alerts.push({
          id: alertId,
          memberId: member.id,
          memberName: member.name,
          type: alert.type,
          message: alert.message,
          time: alert.time,
          acknowledged: acknowledgedAlerts.has(alertId)
        });
      });
    });

    return alerts.sort((a, b) => {
      // Sort by type priority (critical > warning > info) then by time
      const typePriority = { critical: 3, warning: 2, info: 1 };
      const aPriority = typePriority[a.type];
      const bPriority = typePriority[b.type];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return a.time.localeCompare(b.time);
    });
  }, [data?.teamMembers, acknowledgedAlerts]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
  }, []);

  const acknowledgeAllAlerts = useCallback(() => {
    const allAlertIds = activeAlerts().map(alert => alert.id);
    setAcknowledgedAlerts(new Set(allAlertIds));
  }, [activeAlerts]);

  const unacknowledgedCount = useCallback(() => {
    return activeAlerts().filter(alert => !alert.acknowledged).length;
  }, [activeAlerts]);

  return {
    alerts: activeAlerts(),
    acknowledgeAlert,
    acknowledgeAllAlerts,
    unacknowledgedCount: unacknowledgedCount()
  };
}