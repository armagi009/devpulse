'use client';

/**
 * Onboarding Complete Page
 * Final step in the onboarding process
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function OnboardingCompletePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle dashboard button click
  const handleGoDashboard = () => {
    setIsLoading(true);
    router.push('/dashboard');
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">DevPulse</span>
          </div>
          <div className="flex items-center space-x-4">
            {session?.user?.image ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User avatar'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Completion card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            {/* Progress bar */}
            <div className="h-1 w-full bg-blue-600 dark:bg-blue-500"></div>
            
            <div className="px-6 py-8 sm:px-10 sm:py-12">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                  Setup Complete!
                </h1>
                <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
                  {session?.user?.name ? `Congratulations ${session.user.name.split(' ')[0]}!` : 'Congratulations!'} Your DevPulse account is ready to go.
                </p>
              </div>
              
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  What happens next?
                </h2>
                <ul className="mt-4 space-y-6">
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        1
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Synchronization</h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">
                        We're syncing your GitHub data in the background. This may take a few minutes depending on the size of your repositories.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        2
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Analytics Processing</h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">
                        Once your data is synced, we'll analyze it to generate insights about your development patterns and team collaboration.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        3
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Explore Your Dashboard</h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">
                        You can start exploring your dashboard right away. More insights will appear as your data is processed.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleGoDashboard}
                  disabled={isLoading}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      Go to Dashboard
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}