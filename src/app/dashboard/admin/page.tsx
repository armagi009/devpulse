'use client';

/**
 * Admin Dashboard Page
 * Displays system administration features for administrators
 */

import { Suspense, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/types/roles';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout';
import SystemHealthIndicator from '@/components/admin/SystemHealthIndicator';
import UserStatistics from '@/components/admin/UserStatistics';
import RecentAuditLogs from '@/components/admin/RecentAuditLogs';

/**
 * Admin Dashboard Page
 */
export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [systemStats, setSystemStats] = useState({
    userCount: 0,
    repositoryCount: 0,
    teamCount: 0
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check permissions and fetch data
  useEffect(() => {
    async function checkPermissionsAndFetchData() {
      // Check if user has permission to access admin features
      if (!hasPermission(PERMISSIONS.ADMIN_SYSTEM)) {
        router.push('/unauthorized');
        return;
      }
      
      try {
        // Fetch system statistics
        const statsResponse = await fetch('/api/admin/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setSystemStats(statsData);
        }
        
        // Fetch recent audit logs
        const logsResponse = await fetch('/api/admin/audit-logs?limit=10');
        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          setRecentLogs(logsData);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
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
      <RoleDashboardLayout title="Admin Dashboard">
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </RoleDashboardLayout>
    );
  }
  
  return (
    <RoleDashboardLayout 
      title="Admin Dashboard"
      description="Manage system settings and monitor platform health"
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mt-4 md:mt-0 flex space-x-2">
            <a
              href="/admin/users"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Users
            </a>
            <a
              href="/admin/settings"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              System Settings
            </a>
          </div>
        </div>
        
        {/* System Overview */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-medium mb-4">System Overview</h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-4">
            <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{systemStats.userCount}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Repositories</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{systemStats.repositoryCount}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Teams</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{systemStats.teamCount}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</h3>
              <div className="mt-2">
                <Suspense fallback={<Skeleton className="h-8 w-24" />}>
                  <SystemHealthIndicator />
                </Suspense>
              </div>
            </div>
          </div>
        </Card>
        
        {/* User Statistics */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-medium mb-4">User Statistics</h2>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <UserStatistics />
          </Suspense>
        </Card>
        
        {/* Recent Activity */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <RecentAuditLogs logs={recentLogs} />
          </Suspense>
        </Card>
        
        {/* Quick Actions */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-medium mb-4">Administration</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href="/admin/users"
              className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">User Management</span>
            </a>
            <a
              href="/admin/teams"
              className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Team Management</span>
            </a>
            <a
              href="/admin/settings"
              className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">System Settings</span>
            </a>
            <a
              href="/admin/mock-mode"
              className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Mock Mode</span>
            </a>
          </div>
        </Card>
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            As an administrator, you have full access to system settings and user management.
            Please use these privileges responsibly and ensure data privacy and security.
          </p>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}