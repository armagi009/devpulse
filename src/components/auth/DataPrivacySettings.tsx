'use client';

/**
 * Data Privacy Settings Component
 * Allows users to configure their data privacy preferences
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataPrivacySettings as PrivacyLevel } from '@/lib/types/roles';

interface DataPrivacySettingsProps {
  userId: string;
  currentSetting: string;
}

export default function DataPrivacySettings({ userId, currentSetting }: DataPrivacySettingsProps) {
  const router = useRouter();
  const [privacySetting, setPrivacySetting] = useState<string>(currentSetting || PrivacyLevel.STANDARD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(null);
    
    try {
      setIsLoading(true);
      
      // Send update request
      const response = await fetch(`/api/users/${userId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataPrivacy: privacySetting,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update privacy settings');
      }
      
      // Show success message
      setSuccess('Privacy settings updated successfully');
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to update privacy settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Privacy Settings</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Control how your data is shared with team members and administrators.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="privacy-minimal"
              name="privacy"
              type="radio"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              value={PrivacyLevel.MINIMAL}
              checked={privacySetting === PrivacyLevel.MINIMAL}
              onChange={() => setPrivacySetting(PrivacyLevel.MINIMAL)}
              disabled={isLoading}
            />
            <label htmlFor="privacy-minimal" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimal Sharing</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                Only share basic metrics with your team. Detailed work patterns and personal metrics are kept private.
              </span>
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="privacy-standard"
              name="privacy"
              type="radio"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              value={PrivacyLevel.STANDARD}
              checked={privacySetting === PrivacyLevel.STANDARD}
              onChange={() => setPrivacySetting(PrivacyLevel.STANDARD)}
              disabled={isLoading}
            />
            <label htmlFor="privacy-standard" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Standard Sharing (Recommended)</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                Share standard metrics with your team. Some personal details are anonymized for team leads.
              </span>
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="privacy-detailed"
              name="privacy"
              type="radio"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              value={PrivacyLevel.DETAILED}
              checked={privacySetting === PrivacyLevel.DETAILED}
              onChange={() => setPrivacySetting(PrivacyLevel.DETAILED)}
              disabled={isLoading}
            />
            <label htmlFor="privacy-detailed" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Sharing</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                Share detailed metrics with your team. Team leads can see more detailed work patterns.
              </span>
            </label>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Privacy Settings'}
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
      </form>
      
      <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Privacy Information</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Your personal dashboard data is always private to you. These settings only control how your data appears in team views and reports.
                Team leads will always see anonymized data regardless of your privacy settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}