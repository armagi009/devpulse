'use client';

/**
 * New Repository Page
 * Allows users to connect a new repository
 */

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UnifiedNavigation from '@/components/layout/UnifiedNavigation';
import DashboardCard from '@/components/ui/DashboardCard';
import { Button } from '@/components/ui/button';

export default function NewRepositoryPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <UnifiedNavigation user={session?.user}>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connect New Repository</h1>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/repositories')}
          >
            Back to Repositories
          </Button>
        </div>

        <DashboardCard title="Connect GitHub Repository">
          <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Connect a new GitHub repository to start tracking development metrics and analytics.
            </p>
            
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Connect Repository</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose from your GitHub repositories to add to DevPulse analytics.
              </p>
              
              <div className="space-y-3">
                <Button 
                  size="lg"
                  onClick={() => router.push('/onboarding/repositories')}
                  className="w-full max-w-sm"
                >
                  Browse GitHub Repositories
                </Button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You'll be redirected to select repositories from your GitHub account
                </p>
              </div>
            </div>

            <div className="border-t pt-6 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">What happens next?</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Select repositories from your GitHub account</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>DevPulse will sync repository data and commit history</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Analytics and insights will be available within minutes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>Set up team members and start tracking collaboration metrics</span>
                </li>
              </ul>
            </div>
          </div>
        </DashboardCard>
      </div>
    </UnifiedNavigation>
  );
}