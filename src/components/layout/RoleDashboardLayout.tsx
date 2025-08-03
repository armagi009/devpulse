'use client';

/**
 * RoleDashboardLayout Component
 * Common layout for role-specific dashboards
 */

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from './DashboardLayout';
import RoleBasedNavigation from './RoleBasedNavigation';

interface RoleDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function RoleDashboardLayout({
  children,
  title,
  description,
}: RoleDashboardLayoutProps) {
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

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <DashboardLayout user={session?.user}>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
          <div className="mt-4">
            <RoleBasedNavigation />
          </div>
        </div>
        
        {children}
      </div>
    </DashboardLayout>
  );
}