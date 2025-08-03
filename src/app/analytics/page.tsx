'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UnifiedNavigation from '@/components/layout/UnifiedNavigation';
import DashboardCard from '@/components/ui/DashboardCard';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
      <div className="space-y-6 p-4 md:p-6">
        {/* Page Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Comprehensive analytics and insights for your development workflow
          </p>
        </div>

        {/* Analytics Categories */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Personal Analytics */}
          <DashboardCard
            title="Personal Analytics"
            subtitle="Your individual development metrics"
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
            footer={
              <button
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => router.push('/dashboard/productivity')}
              >
                View Productivity
              </button>
            }
          >
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Commits this week</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">PRs opened</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Code reviews</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">12</span>
              </div>
            </div>
          </DashboardCard>

          {/* Team Analytics */}
          <DashboardCard
            title="Team Analytics"
            subtitle="Team collaboration and performance"
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            footer={
              <button
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => router.push('/dashboard/team')}
              >
                View Team Metrics
              </button>
            }
          >
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Team velocity</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Collaboration score</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">92%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active members</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">8</span>
              </div>
            </div>
          </DashboardCard>

          {/* Burnout Analytics */}
          <DashboardCard
            title="Burnout Analytics"
            subtitle="Monitor team and personal wellbeing"
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            footer={
              <button
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => router.push('/dashboard/burnout')}
              >
                View Burnout Radar
              </button>
            }
          >
            <div className="mt-4 text-center">
              <div className="text-3xl font-bold text-yellow-500">65</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Moderate Risk</div>
              <div className="mt-2 text-xs text-gray-400">
                Based on recent activity patterns
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Quick Insights */}
        <DashboardCard title="Quick Insights">
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Productivity Trend
                  </h3>
                  <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Your productivity has increased by 15% this week compared to last week.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Team Collaboration
                  </h3>
                  <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                    Great team collaboration! Code review response time is under 2 hours.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Burnout Warning
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                    Consider taking breaks. You've been working late for 3 consecutive days.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </UnifiedNavigation>
  );
}