'use client';

/**
 * Mock Data Generation Options Component
 * 
 * This component provides a form for configuring mock data generation options
 * and generating new mock data with those options.
 */

import React, { useState } from 'react';
import { resetMockData } from '@/lib/mock/mock-data-store';
import { MockDataOptions } from '@/lib/types/mock';

interface MockDataGenerationOptionsProps {
  dataSet: string;
  onDataSetUpdated: () => void;
}

export default function MockDataGenerationOptions({ 
  dataSet, 
  onDataSetUpdated 
}: MockDataGenerationOptionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Default options
  const [options, setOptions] = useState<MockDataOptions>({
    repositories: 5,
    usersPerRepo: 3,
    timeRangeInDays: 90,
    activityLevel: 'medium',
    burnoutPatterns: true,
    collaborationPatterns: true,
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setOptions(prev => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setOptions(prev => ({
        ...prev,
        [name]: parseInt(value, 10),
      }));
      return;
    }
    
    // Handle other inputs
    setOptions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate mock data with options
  const handleGenerateMockData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataSet) {
      setError('No data set selected');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setSuccess(null);
      
      await resetMockData(dataSet, options);
      
      setSuccess(`Successfully generated mock data for "${dataSet}"`);
      onDataSetUpdated();
    } catch (err) {
      console.error('Error generating mock data:', err);
      setError(`Failed to generate mock data: ${(err as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
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
        <div className="mb-4 rounded-md bg-green-50 p-4 dark:bg-green-900/30">
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

      <form onSubmit={handleGenerateMockData}>
        <div className="space-y-4">
          <div>
            <label htmlFor="repositories" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Repositories
            </label>
            <input
              type="number"
              name="repositories"
              id="repositories"
              min="1"
              max="20"
              value={options.repositories}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Number of repositories to generate (1-20)
            </p>
          </div>

          <div>
            <label htmlFor="usersPerRepo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Users Per Repository
            </label>
            <input
              type="number"
              name="usersPerRepo"
              id="usersPerRepo"
              min="1"
              max="10"
              value={options.usersPerRepo}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Number of users contributing to each repository (1-10)
            </p>
          </div>

          <div>
            <label htmlFor="timeRangeInDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Range (Days)
            </label>
            <input
              type="number"
              name="timeRangeInDays"
              id="timeRangeInDays"
              min="30"
              max="365"
              value={options.timeRangeInDays}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Time range for generated data in days (30-365)
            </p>
          </div>

          <div>
            <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Activity Level
            </label>
            <select
              name="activityLevel"
              id="activityLevel"
              value={options.activityLevel}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Overall activity level for generated data
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                name="burnoutPatterns"
                id="burnoutPatterns"
                checked={options.burnoutPatterns}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="burnoutPatterns" className="font-medium text-gray-700 dark:text-gray-300">
                Include Burnout Patterns
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generate data that can trigger different burnout risk levels
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                name="collaborationPatterns"
                id="collaborationPatterns"
                checked={options.collaborationPatterns}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="collaborationPatterns" className="font-medium text-gray-700 dark:text-gray-300">
                Include Collaboration Patterns
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generate data that demonstrates different team collaboration patterns
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isGenerating || !dataSet}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400 dark:disabled:bg-blue-800"
            >
              {isGenerating ? (
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
                  Generating...
                </>
              ) : (
                <>Generate Mock Data</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}