'use client';

/**
 * Developer Dashboard Page
 * Displays developer-specific metrics and insights
 */

import { Suspense, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/types/roles';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout';
import ProductivityMetrics from '@/components/analytics/ProductivityMetrics';
import BurnoutRiskScore from '@/components/analytics/BurnoutRiskScore';
import CodeContributionHeatmap from '@/components/analytics/CodeContributionHeatmap';

/**
 * Developer Dashboard Page
 */
export default function DeveloperDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Check permissions and fetch data
  useEffect(() => {
    async function checkPermissionsAndFetchData() {
      // Check if user has permission to view personal metrics
      if (!hasPermission(PERMISSIONS.VIEW_PERSONAL_METRICS)) {
        router.push('/unauthorized');
        return;
      }
      
      try {
        // Fetch repositories
        const repoResponse = await fetch('/api/github/repositories');
        if (repoResponse.ok) {
          const repoData = await repoResponse.json();
          setRepositories(repoData);
          
          // Fetch user settings
          const settingsResponse = await fetch('/api/users/settings');
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            
            // Determine which repository to show
            if (settingsData?.selectedRepositories?.length) {
              setSelectedRepositoryId(settingsData.selectedRepositories[0]);
            } else if (repoData.length > 0) {
              setSelectedRepositoryId(repoData[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (status === 'authenticated') {
      checkPermissionsAndFetchData();
    }
  }, [status, hasPermission, router]);
  
  if (status === 'loading' || isLoading) {
    return (
      <RoleDashboardLayout title="Developer Dashboard">
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </RoleDashboardLayout>
    );
  }
  
  return (
    <RoleDashboardLayout 
      title="Developer Dashboard"
      description="View your personal productivity metrics and burnout risk indicators"
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
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
        
        {selectedRepositoryId ? (
          <div className="space-y-6">
            {/* Personal Metrics Overview */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
              <Card className="p-4 md:p-6">
                <h2 className="text-lg font-medium mb-4">Burnout Risk</h2>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                  <BurnoutRiskScore repositoryId={selectedRepositoryId} userId={session?.user?.id} />
                </Suspense>
              </Card>
              
              <Card className="p-4 md:p-6 md:col-span-2">
                <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                  <ProductivityMetrics repositoryId={selectedRepositoryId} userId={session?.user?.id} />
                </Suspense>
              </Card>
            </div>
            
            {/* Code Contribution Heatmap */}
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-medium mb-4">Code Contribution Pattern</h2>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <CodeContributionHeatmap repositoryId={selectedRepositoryId} userId={session?.user?.id} />
              </Suspense>
            </Card>
            
            {/* Quick Actions */}
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => {}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Sync Repos</span>
                </button>
                <button
                  className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => {}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">View PRs</span>
                </button>
                <button
                  className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => {}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Repositories</span>
                </button>
                <button
                  className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => {}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Profile</span>
                </button>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No Repositories Available</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your GitHub repositories to view your development analytics.
            </p>
            <div className="mt-4">
              <a 
                href="/dashboard/repositories" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Connect Repositories
              </a>
            </div>
          </Card>
        )}
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Your personal dashboard shows your productivity patterns, code contribution metrics,
            and burnout risk indicators. This data is private and only visible to you.
          </p>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}