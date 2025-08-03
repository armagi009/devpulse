'use client';

/**
 * Admin Audit Logs Page
 * 
 * Displays comprehensive audit logs for administrators
 */

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuditLogViewer from '@/components/admin/AuditLogViewer';

export default function AdminAuditLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect if not authenticated or not an admin
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.role !== 'ADMINISTRATOR') {
      router.push('/unauthorized');
      return;
    }
  }, [status, session, router]);
  
  // Show loading state while checking authentication
  if (status === 'loading' || status === 'unauthenticated' || session?.user?.role !== 'ADMINISTRATOR') {
    return (
      <DashboardLayout user={session?.user}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout user={session?.user}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and filter system audit logs
          </p>
        </div>
        
        <AuditLogViewer />
      </div>
    </DashboardLayout>
  );
}