'use client';

/**
 * Team Dashboard Page
 * Displays team collaboration analytics
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UnifiedNavigation from '@/components/layout/UnifiedNavigation';
import TeamCollaborationMetrics from '@/components/analytics/TeamCollaborationMetrics';
import { getMockData } from '@/lib/mock/mock-data-store';
import { isUsingMockData } from '@/lib/mock/mock-data-utils';
import DashboardCard from '@/components/ui/DashboardCard';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Team Dashboard Page
 */
export default function TeamDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadRepositories();
    }
  }, [status, router]);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isUsingMockData()) {
        // Use mock data
        const mockData = await getMockData();
        const mockRepos = mockData.repositories.map(repo => ({
          id: repo.id.toString(),
          name: repo.name,
          full_name: repo.full_name,
          updated_at: repo.updated_at
        }));
        
        setRepositories(mockRepos);
        if (mockRepos.length > 0) {
          setSelectedRepositoryId(mockRepos[0].id);
        }
      } else {
        // Use real API
        const response = await fetch('/api/github/repositories');
        if (response.ok) {
          const data = await response.json();
          setRepositories(data.repositories || []);
          if (data.repositories?.length > 0) {
            setSelectedRepositoryId(data.repositories[0].id);
          }
        } else {
          throw new Error('Failed to fetch repositories');
        }
      }
    } catch (err) {
      console.error('Error loading repositories:', err);
      setError('Failed to load repositories. Using demo data.');
      
      // Fallback to demo data
      const demoRepos = [
        { id: 'demo-1', name: 'frontend-app', full_name: 'team/frontend-app', updated_at: new Date().toISOString() },
        { id: 'demo-2', name: 'backend-api', full_name: 'team/backend-api', updated_at: new Date().toISOString() },
        { id: 'demo-3', name: 'mobile-app', full_name: 'team/mobile-app', updated_at: new Date().toISOString() }
      ];
      setRepositories(demoRepos);
      setSelectedRepositoryId(demoRepos[0].id);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while session is loading
  if (status === 'loading' || loading) {
    return (
      <UnifiedNavigation user={session?.user}>
        <div className="space-y-6 p-4 md:p-6">
          <LoadingSkeleton />
        </div>
      </UnifiedNavigation>
    );
  }

  return (
    <UnifiedNavigation user={session?.user}>
      <div className="space-y-6 p-4 md:p-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Collaboration</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Analyze team collaboration patterns and identify improvement opportunities
            </p>
          </div>
          
          {repositories.length > 1 && (
            <div className="mt-4 md:mt-0">
              <select 
                className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                value={selectedRepositoryId}
                onChange={(e) => setSelectedRepositoryId(e.target.value)}
              >
                {repositories.map(repo => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/30">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mock Data Indicator */}
        {isUsingMockData() && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  🔧 Demo Mode: Showing sample team collaboration data for demonstration purposes.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        {selectedRepositoryId ? (
          <TeamCollaborationMetrics repositoryId={selectedRepositoryId} />
        ) : (
          <DashboardCard title="No Repositories Available">
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No repositories found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Connect your GitHub repositories to view team collaboration analytics.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </DashboardCard>
        )}
        
        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Team collaboration analytics help you understand how your team works together, 
            identify potential bottlenecks, and improve overall team productivity.
          </p>
        </div>
      </div>
    </UnifiedNavigation>
  );
}

/**
 * Loading Skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}