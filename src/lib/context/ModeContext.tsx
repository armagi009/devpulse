/**
 * Mode Context Provider
 * 
 * This module provides a React context for managing application mode (live, mock, demo)
 * and making it available throughout the application.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppMode } from '@/lib/types/roles';

// Define the shape of the mode context
export interface ModeContextType {
  // Current application mode
  mode: AppMode;
  // Whether the mode is currently changing
  isChangingMode: boolean;
  // Mock data set ID if in mock mode
  mockDataSetId: string | null;
  // Error simulation configuration
  errorSimulation: {
    enabled: boolean;
    rate: number;
  } | null;
  // Enabled features in the current mode
  enabledFeatures: string[];
  // Switch to a different mode
  switchMode: (newMode: AppMode, options?: SwitchModeOptions) => Promise<boolean>;
  // Check if a feature is enabled
  isFeatureEnabled: (featureId: string) => boolean;
  // Check if the current mode is mock or demo
  isMockOrDemo: () => boolean;
}

// Options for switching modes
export interface SwitchModeOptions {
  mockDataSetId?: string;
  errorSimulation?: {
    enabled: boolean;
    rate: number;
  };
  enabledFeatures?: string[];
}

// Default context value
const defaultModeContext: ModeContextType = {
  mode: AppMode.LIVE,
  isChangingMode: false,
  mockDataSetId: null,
  errorSimulation: null,
  enabledFeatures: [],
  switchMode: async () => false,
  isFeatureEnabled: () => true,
  isMockOrDemo: () => false,
};

// Create the context
const ModeContext = createContext<ModeContextType>(defaultModeContext);

// Props for the ModeProvider component
interface ModeProviderProps {
  children: ReactNode;
  initialMode?: AppMode;
  initialMockDataSetId?: string | null;
  initialErrorSimulation?: {
    enabled: boolean;
    rate: number;
  } | null;
  initialEnabledFeatures?: string[];
}

/**
 * Mode Provider Component
 * 
 * Provides the application mode context to all child components
 */
export function ModeProvider({
  children,
  initialMode = AppMode.LIVE,
  initialMockDataSetId = null,
  initialErrorSimulation = null,
  initialEnabledFeatures = [],
}: ModeProviderProps) {
  // State for the current mode
  const [mode, setMode] = useState<AppMode>(initialMode);
  // State for whether the mode is changing
  const [isChangingMode, setIsChangingMode] = useState<boolean>(false);
  // State for the mock data set ID
  const [mockDataSetId, setMockDataSetId] = useState<string | null>(initialMockDataSetId);
  // State for error simulation configuration
  const [errorSimulation, setErrorSimulation] = useState<{
    enabled: boolean;
    rate: number;
  } | null>(initialErrorSimulation);
  // State for enabled features
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>(initialEnabledFeatures);

  // Load the initial mode from the server on mount
  useEffect(() => {
    const loadInitialMode = async () => {
      try {
        // Check environment variables first
        const envMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';
        const envMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
        
        // If environment variables are set, use them
        if (envMockAuth || envMockApi) {
          setMode(AppMode.MOCK);
          setMockDataSetId(process.env.NEXT_PUBLIC_MOCK_DATA_SET || 'default');
          setErrorSimulation(process.env.NEXT_PUBLIC_MOCK_ERROR_SIMULATION === 'true' ? {
            enabled: true,
            rate: parseFloat(process.env.NEXT_PUBLIC_MOCK_ERROR_PROBABILITY || '0.1')
          } : null);
          return;
        }
        
        // Otherwise, try to fetch from the server
        // Only attempt to fetch if we're in a browser environment
        if (typeof window !== 'undefined') {
          try {
            const response = await fetch('/api/admin/app-mode');
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.appMode) {
                setMode(data.appMode.mode as AppMode);
                setMockDataSetId(data.appMode.mockDataSetId);
                setErrorSimulation(data.appMode.errorSimulation);
                setEnabledFeatures(data.appMode.enabledFeatures || []);
              }
            }
          } catch (error) {
            console.error('Failed to fetch app mode from API:', error);
            // Fallback to environment variables
            if (envMockAuth || envMockApi) {
              setMode(AppMode.MOCK);
              setMockDataSetId(process.env.NEXT_PUBLIC_MOCK_DATA_SET || 'default');
              setErrorSimulation(process.env.NEXT_PUBLIC_MOCK_ERROR_SIMULATION === 'true' ? {
                enabled: true,
                rate: parseFloat(process.env.NEXT_PUBLIC_MOCK_ERROR_PROBABILITY || '0.1')
              } : null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load initial mode:', error);
      }
    };

    loadInitialMode();
  }, []);

  /**
   * Switch to a different application mode
   * 
   * @param newMode The mode to switch to
   * @param options Additional options for the mode switch
   * @returns Promise that resolves to true if the switch was successful
   */
  const switchMode = async (
    newMode: AppMode,
    options?: SwitchModeOptions
  ): Promise<boolean> => {
    try {
      setIsChangingMode(true);

      // Prepare the request body
      const requestBody = {
        mode: newMode,
        mockDataSetId: options?.mockDataSetId || (newMode !== AppMode.LIVE ? mockDataSetId : null),
        errorSimulation: options?.errorSimulation || (newMode !== AppMode.LIVE ? errorSimulation : null),
        enabledFeatures: options?.enabledFeatures || enabledFeatures,
      };

      // Send the request to update the mode
      const response = await fetch('/api/admin/app-mode', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to switch mode');
      }

      const data = await response.json();

      // Update the local state
      setMode(newMode);
      setMockDataSetId(options?.mockDataSetId || null);
      setErrorSimulation(options?.errorSimulation || null);
      setEnabledFeatures(options?.enabledFeatures || enabledFeatures);

      // Show a notification that the mode has changed
      if (typeof window !== 'undefined') {
        // Dispatch a custom event that can be listened to by other components
        window.dispatchEvent(new CustomEvent('appModeChanged', {
          detail: {
            mode: newMode,
            mockDataSetId: options?.mockDataSetId || null,
            errorSimulation: options?.errorSimulation || null,
            enabledFeatures: options?.enabledFeatures || enabledFeatures,
          }
        }));
      }

      return true;
    } catch (error) {
      console.error('Failed to switch mode:', error);
      return false;
    } finally {
      setIsChangingMode(false);
    }
  };

  /**
   * Check if a feature is enabled in the current mode
   * 
   * @param featureId The ID of the feature to check
   * @returns True if the feature is enabled
   */
  const isFeatureEnabled = (featureId: string): boolean => {
    return enabledFeatures.includes(featureId);
  };

  /**
   * Check if the current mode is mock or demo
   * 
   * @returns True if the current mode is mock or demo
   */
  const isMockOrDemo = (): boolean => {
    return mode === AppMode.MOCK || mode === AppMode.DEMO;
  };

  // Create the context value
  const contextValue: ModeContextType = {
    mode,
    isChangingMode,
    mockDataSetId,
    errorSimulation,
    enabledFeatures,
    switchMode,
    isFeatureEnabled,
    isMockOrDemo,
  };

  return (
    <ModeContext.Provider value={contextValue}>
      {children}
    </ModeContext.Provider>
  );
}

/**
 * Hook to use the mode context
 * 
 * @returns The mode context
 */
export function useMode(): ModeContextType {
  const context = useContext(ModeContext);
  
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  
  return context;
}