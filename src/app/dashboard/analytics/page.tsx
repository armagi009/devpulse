'use client';

/**
 * Analytics Dashboard Page
 * Displays analytics overview for the user
 */

import React from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductivityMetrics from '@/components/analytics/ProductivityMetrics';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading analytics data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={session?.user}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        
        <ProductivityMetrics />
      </div>
    </DashboardLayout>
  );
}