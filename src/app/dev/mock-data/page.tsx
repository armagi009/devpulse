'use client';

/**
 * Mock Data Management UI
 * 
 * This page provides a UI for viewing, configuring, and managing mock data.
 * It allows developers to reset mock data, configure generation options,
 * and import/export mock data sets.
 * 
 * Implementation for Requirements 5.3, 5.4, 5.5:
 * - Provide options to reset mock data
 * - Support regenerating mock data from scratch
 * - Allow exporting and importing mock data sets
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDevModeConfig } from '@/lib/config/dev-mode';
import Link from 'next/link';
import MockDataSetsList from '@/components/mock/MockDataSetsList';
import MockDataPreview from '@/components/mock/MockDataPreview';
import MockDataActions from '@/components/mock/MockDataActions';
import MockDataConfiguration from '@/components/mock/MockDataConfiguration';
import MockDataImportExport from '@/components/mock/MockDataImportExport';

export default function MockDataManagementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const [selectedDataSet, setSelectedDataSet] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Load dev mode config
  useEffect(() => {
    try {
      const config = getDevModeConfig();
      setDevModeEnabled(config.useMockAuth || config.useMockApi);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dev mode config:', error);
      setError('Failed to load development mode configuration');
      setIsLoading(false);
    }
  }, []);

  // Handle data set selection
  const handleSelectDataSet = (dataSet: string) => {
    setSelectedDataSet(dataSet);
  };

  // Handle data set updates
  const handleDataSetUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
          <p className="mt-4 text-center text-gray-500 dark:text-gray-400">Loading mock data management...</p>
        </div>
      </div>
    );
  }

  // If dev mode is disabled, show error
  if (!devModeEnabled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/30">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Development Mode Disabled
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                  <p>
                    Mock data management is only available when development mode is enabled.
                    Please enable mock authentication or mock API in your environment configuration.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <Link
                      href="/"
                      className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-900"
                    >
                      Return to Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's an error, show error message
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
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
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      onClick={() => window.location.reload()}
                      className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mock Data Management</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View, configure, and manage mock data for development and testing
            </p>
          </div>
          <div className="flex items-center">
            <div className="rounded-md bg-yellow-50 px-2 py-1 dark:bg-yellow-900/30">
              <span className="text-xs font-medium text-yellow-800 dark:text-yellow-300">
                Development Mode
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-1 lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Mock Data Sets</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  View and manage available mock data sets
                </p>
                <div className="mt-4">
                  <MockDataSetsList 
                    onSelectDataSet={handleSelectDataSet} 
                    selectedDataSet={selectedDataSet} 
                    key={`data-sets-${refreshTrigger}`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Data Preview</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Preview the structure and content of the selected mock data set
                </p>
                <div className="mt-4">
                  <MockDataPreview 
                    dataSet={selectedDataSet} 
                    key={`data-preview-${refreshTrigger}-${selectedDataSet}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Actions</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage and configure mock data
                </p>
                <div className="mt-4 space-y-4">
                  <MockDataActions 
                    dataSet={selectedDataSet} 
                    onDataSetUpdated={handleDataSetUpdated} 
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Mock Data Configuration</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Configure scenarios, options, and settings for mock data
                </p>
                <div className="mt-4">
                  <MockDataConfiguration 
                    dataSet={selectedDataSet} 
                    onDataSetUpdated={handleDataSetUpdated} 
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Import / Export</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Import and export mock data sets
                </p>
                <div className="mt-4">
                  <MockDataImportExport 
                    dataSet={selectedDataSet} 
                    onDataSetUpdated={handleDataSetUpdated} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}