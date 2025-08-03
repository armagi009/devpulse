'use client';

/**
 * Mock Data Actions Component
 * 
 * This component provides actions for managing mock data, such as
 * resetting mock data or generating new data.
 */

import React, { useState } from 'react';
import { resetMockData } from '@/lib/mock/mock-data-store';

interface MockDataActionsProps {
  dataSet: string;
  onDataSetUpdated: () => void;
}

export default function MockDataActions({ dataSet, onDataSetUpdated }: MockDataActionsProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset mock data
  const handleResetMockData = async () => {
    if (!dataSet) {
      setError('No data set selected');
      return;
    }

    try {
      setIsResetting(true);
      setError(null);
      setSuccess(null);
      
      await resetMockData(dataSet);
      
      setSuccess(`Successfully reset mock data for "${dataSet}"`);
      onDataSetUpdated();
    } catch (err) {
      console.error('Error resetting mock data:', err);
      setError(`Failed to reset mock data: ${(err as Error).message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
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
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/30">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          onClick={handleResetMockData}
          disabled={isResetting || !dataSet}
          className="flex w-full items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-red-400 dark:disabled:bg-red-800"
        >
          {isResetting ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Resetting...
            </>
          ) : (
            <>Reset Mock Data</>
          )}
        </button>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          This will regenerate all mock data for the selected data set using default options.
        </p>
      </div>

      <div>
        <button
          onClick={() => window.location.reload()}
          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}