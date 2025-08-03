'use client';

/**
 * Role Selection Onboarding Page
 * Allows users to select their role during onboarding
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/lib/types/roles';

export default function RoleSelectionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };
  
  // Handle continue button click
  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update user role
      const response = await fetch(`/api/users/${session?.user?.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update role');
      }
      
      // Navigate to the next step
      router.push('/onboarding/repositories');
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          {/* Role selection card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            {/* Progress bar */}
            <div className="h-1 w-2/4 bg-blue-600 dark:bg-blue-500"></div>
            
            <div className="px-6 py-8 sm:px-10 sm:py-12">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Select Your Role
                </h1>
                <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
                  Choose the role that best describes your position. This will help us customize your experience.
                </p>
              </div>
              
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Developer role */}
                <div 
                  className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                    selectedRole === UserRole.DEVELOPER
                      ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-900 dark:hover:bg-blue-900/10'
                  }`}
                  onClick={() => handleRoleSelect(UserRole.DEVELOPER)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    Developer
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Individual contributor focused on coding and development tasks.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Personal productivity metrics
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Personal burnout radar
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Team collaboration insights
                    </li>
                  </ul>
                </div>
                
                {/* Team Lead role */}
                <div 
                  className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                    selectedRole === UserRole.TEAM_LEAD
                      ? 'border-purple-600 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-900 dark:hover:bg-purple-900/10'
                  }`}
                  onClick={() => handleRoleSelect(UserRole.TEAM_LEAD)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    Team Lead
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Manages a team of developers and oversees projects.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      All Developer features
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Team burnout monitoring
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Team management tools
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Auto-retrospectives
                    </li>
                  </ul>
                </div>
                
                {/* Administrator role */}
                <div 
                  className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                    selectedRole === UserRole.ADMINISTRATOR
                      ? 'border-red-600 bg-red-50 dark:border-red-500 dark:bg-red-900/20'
                      : 'border-gray-200 hover:border-red-200 hover:bg-red-50 dark:border-gray-700 dark:hover:border-red-900 dark:hover:bg-red-900/10'
                  }`}
                  onClick={() => handleRoleSelect(UserRole.ADMINISTRATOR)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    Administrator
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    System administrator with full access to all features.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      All Team Lead features
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      User management
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      System settings
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Mock mode controls
                    </li>
                  </ul>
                </div>
              </div>
              
              {error && (
                <div className="mt-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-10 flex justify-between">
                <button
                  onClick={() => router.push('/onboarding/welcome')}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                
                <button
                  onClick={handleContinue}
                  disabled={isLoading || !selectedRole}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
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