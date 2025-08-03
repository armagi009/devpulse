'use client';

/**
 * Dashboard Page
 * Main dashboard view that routes users to their role-specific dashboard
 */

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcuts } from '@/lib/utils/keyboard-shortcuts';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { UserRole } from '@/lib/types/roles';
import UnifiedNavigation from '@/components/layout/UnifiedNavigation';
import MultiColumnLayout from '@/components/layout/MultiColumnLayout';
import ResponsiveGrid, { ResponsiveGridItem } from '@/components/ui/ResponsiveGrid';
import DashboardCard from '@/components/ui/DashboardCard';
import { ModernButton, ModernMetricCard } from '@/components/ui/modern-card';
import ProductivityMetrics from '@/components/analytics/ProductivityMetrics';
import TeamCollaborationMetrics from '@/components/analytics/TeamCollaborationMetrics';

// Recent Activity Component for the sidebar
function RecentActivity() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
      
      <div className="space-y-3">
        {[
          { type: 'commit', repo: 'main-app', time: '2 hours ago' },
          { type: 'pr', repo: 'api-service', time: '1 day ago' },
          { type: 'issue', repo: 'ui-components', time: '2 days ago' },
          { type: 'review', repo: 'documentation', time: '3 days ago' },
        ].map((activity, index) => (
          <div 
            key={index}
            className="flex items-start p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <div className="mr-3 mt-0.5">
              {activity.type === 'commit' && (
                <svg className="h-5 w-5 text-green-500" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {activity.type === 'pr' && (
                <svg className="h-5 w-5 text-purple-500" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              )}
              {activity.type === 'issue' && (
                <svg className="h-5 w-5 text-red-500" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {activity.type === 'review' && (
                <svg className="h-5 w-5 text-blue-500" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.type === 'commit' && 'New commit to '}
                {activity.type === 'pr' && 'Pull request in '}
                {activity.type === 'issue' && 'Issue opened in '}
                {activity.type === 'review' && 'Code review in '}
                <span className="font-semibold">{activity.repo}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
        View all activity
      </button>
    </div>
  );
}

// Notifications Component for the right panel
function Notifications() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
      
      <div className="space-y-3">
        {[
          { type: 'alert', title: 'High burnout risk detected', time: '1 hour ago', priority: 'high' },
          { type: 'info', title: 'Weekly report available', time: '1 day ago', priority: 'medium' },
          { type: 'success', title: 'All tests passing', time: '2 days ago', priority: 'low' },
        ].map((notification, index) => (
          <div 
            key={index}
            className={`flex items-start p-3 rounded-md border ${
              notification.priority === 'high' 
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                : notification.priority === 'medium'
                ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            }`}
          >
            <div className="mr-3 mt-0.5">
              {notification.priority === 'high' && (
                <svg className="h-5 w-5 text-red-500" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {notification.priority === 'medium' && (
                <svg className="h-5 w-5 text-yellow-500" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.priority === 'low' && (
                <svg className="h-5 w-5 text-green-500" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
        View all notifications
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasRole } = usePermissions();
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Optional: Redirect to role-specific dashboard (disabled for now)
  // Users can manually navigate to role-specific dashboards via navigation
  // useEffect(() => {
  //   if (status === 'authenticated') {
  //     if (hasRole(UserRole.ADMINISTRATOR)) {
  //       router.push('/dashboard/admin');
  //     } else if (hasRole(UserRole.TEAM_LEAD)) {
  //       router.push('/dashboard/team-lead');
  //     } else {
  //       router.push('/dashboard/developer');
  //     }
  //   }
  // }, [status, hasRole, router]);

  // Register keyboard shortcuts for this page
  useKeyboardShortcuts([
    {
      key: 'b',
      ctrlKey: true,
      description: 'Go to burnout radar',
      action: () => router.push('/dashboard/burnout'),
      preventDefault: true
    },
    {
      key: 'p',
      ctrlKey: true,
      description: 'Go to productivity',
      action: () => router.push('/dashboard/productivity'),
      preventDefault: true
    },
    {
      key: 't',
      ctrlKey: true,
      description: 'Go to team',
      action: () => router.push('/dashboard/team'),
      preventDefault: true
    }
  ]);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UnifiedNavigation user={session?.user}>
      <MultiColumnLayout
        sidebar={<RecentActivity />}
        rightPanel={<Notifications />}
        sidebarWidth="280px"
        rightPanelWidth="300px"
        collapsible={true}
      >
        <div className="space-y-6 p-4 md:p-6">
          {/* Welcome Card */}
          {showWelcome && (
            <DashboardCard
              title="Welcome to DevPulse"
              subtitle="Your development analytics dashboard"
              collapsible={true}
              actions={
                <button
                  onClick={() => setShowWelcome(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  aria-label="Dismiss"
                >
                  <svg className="h-4 w-4" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              }
            >
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Hello, {session?.user?.name || 'Developer'}! Your development analytics dashboard is ready.
                {/* Use keyboard shortcut <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono text-xs">?</kbd> to view all available shortcuts. */}
              </p>
            </DashboardCard>
          )}

          {/* Modern Metrics Cards */}
          <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap={6}>
            <ModernMetricCard
              title="Burnout Risk Score"
              value="85"
              change="↑ 12%"
              trend="down"
              icon={<span>⚡</span>}
              gradient="from-red-500 to-orange-500"
            />
            <ModernMetricCard
              title="Team Velocity"
              value="94%"
              change="↑ 8%"
              trend="up"
              icon={<span>🚀</span>}
              gradient="from-green-500 to-blue-500"
            />
            <ModernMetricCard
              title="Code Quality"
              value="4.8"
              change="↑ 0.3"
              trend="up"
              icon={<span>⭐</span>}
              gradient="from-yellow-500 to-orange-500"
            />
            <ModernMetricCard
              title="Active Issues"
              value="23"
              change="↓ 5"
              trend="up"
              icon={<span>🎯</span>}
              gradient="from-purple-500 to-pink-500"
            />



          </ResponsiveGrid>

          {/* Admin Card - Only show for administrators - Full width for better alignment */}
          {hasRole(UserRole.ADMINISTRATOR) && (
            <ResponsiveGrid columns={{ xs: 1, sm: 1, lg: 2 }} gap={6}>
              <ResponsiveGridItem colSpan={{ xs: 1, sm: 1, lg: 2 }}>
                <DashboardCard
                  title="Administration"
                  subtitle="System management and settings"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  }
                  footer={
                    <button
                      className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => router.push('/dashboard/admin')}
                    >
                      Admin Dashboard
                    </button>
                  }
                >
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Users</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Active Today</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">System Health</span>
                      <span className="text-sm font-medium text-green-600">Good</span>
                    </div>
                  </div>
                </DashboardCard>
              </ResponsiveGridItem>
            </ResponsiveGrid>
          )}



          {/* Charts Row */}
          <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap={6}>
            <DashboardCard title="Productivity Trends">
              <div className="h-64">
                {session?.user?.id ? (
                  <ProductivityMetrics 
                    userId={session.user.id} 
                    days={7}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                    <span className="text-gray-500">Please sign in to view productivity metrics</span>
                  </div>
                )}
              </div>
            </DashboardCard>
            
            <DashboardCard title="Team Collaboration">
              <div className="h-64">
                <TeamCollaborationMetrics 
                  repositoryId="default"
                  timeRange={{
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    end: new Date()
                  }}
                />
              </div>
            </DashboardCard>
          </ResponsiveGrid>

          {/* Quick Actions Section */}
          <DashboardCard title="Quick Actions">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ModernButton
                variant="secondary"
                className="flex flex-col items-center justify-center p-4 h-20"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/github/repositories/sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ syncType: 'incremental' })
                    });
                    if (response.ok) {
                      alert('Repository sync started successfully!');
                    } else {
                      alert('Failed to start repository sync. Please try again.');
                    }
                  } catch (error) {
                    alert('Error starting sync. Please try again.');
                  }
                }}
              >
                <div className="text-2xl mb-1">🔄</div>
                <span className="text-sm">Sync Repos</span>
              </ModernButton>
              <ModernButton
                variant="secondary"
                className="flex flex-col items-center justify-center p-4 h-20"
                onClick={() => router.push('/dashboard/repositories/new')}
              >
                <div className="text-2xl mb-1">📝</div>
                <span className="text-sm">New Repo</span>
              </ModernButton>
              <ModernButton
                variant="secondary"
                className="flex flex-col items-center justify-center p-4 h-20"
                onClick={() => router.push('/dashboard/repositories')}
              >
                <div className="text-2xl mb-1">📁</div>
                <span className="text-sm">Repositories</span>
              </ModernButton>
              <ModernButton
                variant="secondary"
                className="flex flex-col items-center justify-center p-4 h-20"
                onClick={() => router.push('/profile')}
              >
                <div className="text-2xl mb-1">👤</div>
                <span className="text-sm">Profile</span>
              </ModernButton>
            </div>
          </DashboardCard>

          {/* Account Information */}
          <DashboardCard 
            title="Account Information"
            footer={
              <button
                onClick={handleSignOut}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Sign Out
              </button>
            }
          >
            <div className="mt-4 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="w-full md:w-24 text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                <span className="text-sm text-gray-900 dark:text-white">{session?.user?.name || 'Not provided'}</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="w-full md:w-24 text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                <span className="text-sm text-gray-900 dark:text-white">{session?.user?.email || 'Not provided'}</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="w-full md:w-24 text-sm font-medium text-gray-500 dark:text-gray-400">GitHub:</span>
                <span className="text-sm text-gray-900 dark:text-white">Connected</span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </MultiColumnLayout>
    </UnifiedNavigation>
  );
}