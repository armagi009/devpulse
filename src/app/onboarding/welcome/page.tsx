'use client';

/**
 * Welcome Onboarding Page
 * First step in the onboarding process for new users
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function WelcomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle continue button click
  const handleContinue = () => {
    setIsLoading(true);
    router.push('/onboarding/role');
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
          {/* Welcome card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            {/* Progress bar */}
            <div className="h-1 w-1/4 bg-blue-600 dark:bg-blue-500"></div>
            
            <div className="px-6 py-8 sm:px-10 sm:py-12">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                  Welcome to DevPulse!
                </h1>
                <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
                  {session?.user?.name ? `Hi ${session.user.name.split(' ')[0]},` : 'Hi there,'} we're excited to have you on board.
                </p>
              </div>
              
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  What is DevPulse?
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  DevPulse is an AI-native development analytics platform that transforms your GitHub data into actionable insights.
                  Our flagship feature, Burnout Radar, helps predict and prevent developer burnout through behavioral pattern analysis.
                </p>
                
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                      Personal Analytics
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Understand your productivity patterns and coding habits to optimize your performance.
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                      Team Collaboration
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Analyze team collaboration patterns and identify opportunities for improvement.
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                      Burnout Prevention
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Detect early signs of burnout and get personalized recommendations to maintain well-being.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleContinue}
                  disabled={isLoading}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Setting up...
                    </>
                  ) : (
                    <>
                      Let's Get Started
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