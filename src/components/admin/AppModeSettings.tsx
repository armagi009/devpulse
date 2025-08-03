'use client';

/**
 * App Mode Settings Component
 * Controls application mode (live, mock, demo)
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppMode } from '@/lib/types/roles';
import { useMode } from '@/lib/context/ModeContext';

interface MockDataSet {
  id: string;
  name: string;
}

interface AppModeSettingsProps {
  appMode?: {
    id: string;
    mode: string;
    mockDataSetId?: string | null;
    enabledFeatures: string[];
    errorSimulation?: Record<string, any> | null;
  } | null;
  mockDataSets: MockDataSet[];
}

export default function AppModeSettings({ appMode, mockDataSets }: AppModeSettingsProps) {
  const router = useRouter();
  const { mode: currentMode, mockDataSetId: currentMockDataSetId, errorSimulation: currentErrorSim, enabledFeatures: currentEnabledFeatures, switchMode } = useMode();
  
  const [mode, setMode] = useState<string>(currentMode || appMode?.mode || AppMode.LIVE);
  const [mockDataSetId, setMockDataSetId] = useState<string | undefined>(
    currentMockDataSetId || appMode?.mockDataSetId || undefined
  );
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>(
    currentEnabledFeatures || appMode?.enabledFeatures || []
  );
  const [errorRate, setErrorRate] = useState<number>(
    currentErrorSim?.rate || appMode?.errorSimulation?.rate || 0
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Update local state when mode context changes
  useEffect(() => {
    setMode(currentMode);
    setMockDataSetId(currentMockDataSetId || undefined);
    setEnabledFeatures(currentEnabledFeatures);
    setErrorRate(currentErrorSim?.rate || 0);
  }, [currentMode, currentMockDataSetId, currentEnabledFeatures, currentErrorSim]);
  
  // Available features
  const availableFeatures = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'productivity', name: 'Productivity Analytics' },
    { id: 'team', name: 'Team Analytics' },
    { id: 'burnout', name: 'Burnout Radar' },
    { id: 'retrospectives', name: 'Retrospectives' },
  ];
  
  // Handle feature toggle
  const handleFeatureToggle = (featureId: string) => {
    setEnabledFeatures((prev) => {
      if (prev.includes(featureId)) {
        return prev.filter((id) => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(null);
    
    try {
      setIsLoading(true);
      
      // Prepare error simulation config
      const errorSimulation = mode !== AppMode.LIVE ? {
        rate: errorRate,
        enabled: errorRate > 0,
      } : null;
      
      // Use the mode context to switch modes
      const result = await switchMode(mode as AppMode, {
        mockDataSetId: mode === AppMode.MOCK ? mockDataSetId : null,
        errorSimulation: errorSimulation as any,
        enabledFeatures,
      });
      
      if (!result) {
        throw new Error('Failed to update application mode');
      }
      
      // Show success message
      setSuccess('Application mode updated successfully');
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error updating application mode:', error);
      setError(error instanceof Error ? error.message : 'Failed to update application mode');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Application Mode
          </label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input
                id="mode-live"
                name="mode"
                type="radio"
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                value={AppMode.LIVE}
                checked={mode === AppMode.LIVE}
                onChange={() => setMode(AppMode.LIVE)}
                disabled={isLoading}
              />
              <label htmlFor="mode-live" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Live Mode (Production)
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="mode-mock"
                name="mode"
                type="radio"
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                value={AppMode.MOCK}
                checked={mode === AppMode.MOCK}
                onChange={() => setMode(AppMode.MOCK)}
                disabled={isLoading}
              />
              <label htmlFor="mode-mock" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Mock Mode (Development)
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="mode-demo"
                name="mode"
                type="radio"
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                value={AppMode.DEMO}
                checked={mode === AppMode.DEMO}
                onChange={() => setMode(AppMode.DEMO)}
                disabled={isLoading}
              />
              <label htmlFor="mode-demo" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Demo Mode (Presentation)
              </label>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Live mode uses real GitHub data. Mock mode uses generated data for development. Demo mode uses curated data for presentations.
          </p>
        </div>
        
        {mode !== AppMode.LIVE && (
          <div>
            <label htmlFor="mock-data-set" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mock Data Set
            </label>
            <select
              id="mock-data-set"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={mockDataSetId}
              onChange={(e) => setMockDataSetId(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select a mock data set</option>
              {mockDataSets.map((dataSet) => (
                <option key={dataSet.id} value={dataSet.id}>
                  {dataSet.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select a mock data set to use for development or demonstration.
            </p>
          </div>
        )}
        
        {mode !== AppMode.LIVE && (
          <div>
            <label htmlFor="error-rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Error Simulation Rate (%)
            </label>
            <input
              type="range"
              id="error-rate"
              min="0"
              max="100"
              step="5"
              className="mt-1 block w-full"
              value={errorRate}
              onChange={(e) => setErrorRate(Number(e.target.value))}
              disabled={isLoading}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0% (No Errors)</span>
              <span>{errorRate}%</span>
              <span>100% (Always Fail)</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Simulate API errors to test error handling and fallback mechanisms.
            </p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Enabled Features
          </label>
          <div className="mt-2 space-y-2">
            {availableFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center">
                <input
                  id={`feature-${feature.id}`}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                  checked={enabledFeatures.includes(feature.id)}
                  onChange={() => handleFeatureToggle(feature.id)}
                  disabled={isLoading}
                />
                <label htmlFor={`feature-${feature.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {feature.name}
                </label>
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enable or disable specific features in the application.
          </p>
        </div>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save App Mode Settings'}
        </button>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Success</h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {mode !== AppMode.LIVE && (
        <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warning</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  {mode === AppMode.MOCK
                    ? 'Mock mode is active. The application is using generated data instead of real GitHub data.'
                    : 'Demo mode is active. The application is using curated data for demonstration purposes.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}