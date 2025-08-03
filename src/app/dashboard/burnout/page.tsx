'use client';

/**
 * Burnout Radar Page
 * Shows burnout risk assessment and recommendations
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BurnoutRadar from '@/components/analytics/BurnoutRadar';
import { BurnoutRiskAssessment } from '@/lib/analytics/burnout-calculator';

export default function BurnoutPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [burnoutData, setBurnoutData] = useState<BurnoutRiskAssessment | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);

  // Fetch burnout data
  useEffect(() => {
    const fetchBurnoutData = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        setError('You must be signed in to view this page');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Use a default repository ID for testing purposes
        // In production, this should come from user's selected repository
        const defaultRepoId = "00000000-0000-0000-0000-000000000001";
        const response = await fetch(`/api/analytics/burnout?days=${selectedDays}&repositoryId=${defaultRepoId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching burnout data: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch burnout data');
        }
        
        setBurnoutData(result.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching burnout data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBurnoutData();
  }, [session, status, selectedDays]);

  // Handle time range change
  const handleTimeRangeChange = (days: number) => {
    setSelectedDays(days);
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <DashboardLayout user={session?.user}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading burnout data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout user={session?.user}>
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading burnout data</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={session?.user}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Burnout Radar</h1>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={() => handleTimeRangeChange(30)}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedDays === 30
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => handleTimeRangeChange(60)}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedDays === 60
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              60 Days
            </button>
            <button
              onClick={() => handleTimeRangeChange(90)}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedDays === 90
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>

        {burnoutData ? (
          <BurnoutRadar burnoutData={burnoutData} />
        ) : (
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-300">No burnout data available. Make sure you have connected your GitHub account and have some activity in the selected time period.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}