'use client';

/**
 * Repositories Dashboard Page
 * Displays and manages connected repositories
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UnifiedNavigation from '@/components/layout/UnifiedNavigation';
import DashboardCard from '@/components/ui/DashboardCard';
import { Button } from '@/components/ui/button';
import RepositorySelector from '@/components/github/RepositorySelector';

export default function RepositoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRepositories();
    }
  }, [status]);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/github/repositories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepositories(data.repositories || []);
    } catch (err) {
      console.error('Error fetching repositories:', err);
      setError('Failed to load repositories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/github/repositories/sync', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync repositories');
      }

      await fetchRepositories();
    } catch (err) {
      console.error('Error syncing repositories:', err);
      setError('Failed to sync repositories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <UnifiedNavigation user={session?.user}>
        <div className="flex h-full items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading repositories...</p>
          </div>
        </div>
      </UnifiedNavigation>
    );
  }

  return (
    <UnifiedNavigation user={session?.user}>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Repositories</h1>
          <div className="mt-4 md:mt-0 space-x-2">
            <Button onClick={handleSync} disabled={loading}>
              {loading ? 'Syncing...' : 'Sync Repositories'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/onboarding/repositories')}
            >
              Connect New Repository
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/30">
            <h2 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h2>
            <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={fetchRepositories}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        )}

        <DashboardCard title="Repository Management">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage your connected GitHub repositories and sync data for analytics.
            </p>
            
            <RepositorySelector 
              onRepositorySelect={(repo) => {
                console.log('Selected repository:', repo);
              }}
            />

            {repositories.length === 0 && !loading && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No repositories connected</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Connect your GitHub repositories to start analyzing your development metrics.
                </p>
                <Button onClick={() => router.push('/onboarding/repositories')}>
                  Connect Repositories
                </Button>
              </div>
            )}

            {repositories.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {repositories.map((repo: any) => (
                  <div key={repo.id} className="border rounded-lg p-4 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white">{repo.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {repo.description || 'No description'}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span className="mr-4">⭐ {repo.stargazers_count || 0}</span>
                      <span className="mr-4">🍴 {repo.forks_count || 0}</span>
                      <span>{repo.language || 'Unknown'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DashboardCard>
      </div>
    </UnifiedNavigation>
  );
}