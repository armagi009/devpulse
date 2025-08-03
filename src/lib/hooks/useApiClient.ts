/**
 * Hook for using the mode-aware API client
 */

'use client';

import { useMode } from '@/lib/context/ModeContext';
import { getApiClient, ApiClient, ErrorSimulationOptions } from '@/lib/api/api-client-factory';
import { useMemo } from 'react';

/**
 * Hook to get the appropriate API client based on the current application mode
 * 
 * @param baseUrl Optional base URL for the API
 * @returns API client instance
 */
export function useApiClient(baseUrl: string = '/api'): ApiClient {
  const { mode, mockDataSetId, errorSimulation } = useMode();
  
  // Convert the error simulation from the mode context to the format expected by the API client
  const errorSimOptions: ErrorSimulationOptions | undefined = useMemo(() => {
    if (!errorSimulation) {
      return { enabled: false, rate: 0 };
    }
    
    return {
      enabled: errorSimulation.enabled,
      rate: errorSimulation.rate,
    };
  }, [errorSimulation]);
  
  // Create or get the appropriate API client based on the current mode
  const apiClient = useMemo(() => {
    return getApiClient(mode, {
      baseUrl,
      mockDataSetId,
      errorSimulation: errorSimOptions,
    });
  }, [mode, baseUrl, mockDataSetId, errorSimOptions]);
  
  return apiClient;
}