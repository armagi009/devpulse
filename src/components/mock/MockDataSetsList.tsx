'use client';

/**
 * Mock Data Sets List Component
 * 
 * This component displays a list of available mock data sets and allows
 * selecting a data set to view or manage.
 */

import React, { useState, useEffect } from 'react';
import { listMockDataSets } from '@/lib/mock/mock-data-store';

interface MockDataSetsListProps {
  onSelectDataSet: (dataSet: string) => void;
  selectedDataSet: string;
}

export default function MockDataSetsList({ 
  onSelectDataSet, 
  selectedDataSet 
}: MockDataSetsListProps) {
  const [dataSets, setDataSets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load available data sets
  useEffect(() => {
    async function loadDataSets() {
      try {
        setIsLoading(true);
        setError(null);
        const sets = await listMockDataSets();
        setDataSets(sets);
        
        // If no data set is selected and we have data sets, select the first one
        if (!selectedDataSet && sets.length > 0) {
          onSelectDataSet(sets[0]);
        }
      } catch (err) {
        console.error('Error loading mock data sets:', err);
        setError('Failed to load mock data sets');
      } finally {
        setIsLoading(false);
      }
    }

    loadDataSets();
  }, [onSelectDataSet, selectedDataSet]);

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading data sets...</span>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-400">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-800 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no data sets, show empty state
  if (dataSets.length === 0) {
    return (
      <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No mock data sets available. Generate a new data set to get started.
        </p>
      </div>
    );
  }

  // Render data sets list
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {dataSets.map((dataSet) => (
          <li key={dataSet}>
            <button
              onClick={() => onSelectDataSet(dataSet)}
              className={`flex w-full items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedDataSet === dataSet
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : ''
              }`}
            >
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  selectedDataSet === dataSet
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {dataSet}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedDataSet === dataSet ? 'Currently selected' : 'Click to select'}
                </p>
              </div>
              {selectedDataSet === dataSet && (
                <div className="ml-2">
                  <svg
                    className="h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}