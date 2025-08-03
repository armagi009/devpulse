'use client';

/**
 * Profile Page
 * Displays user profile and settings
 */

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UnifiedNavigation from '@/components/layout/UnifiedNavigation';
import UserProfile from '@/components/auth/UserProfile';
import { User, UserSettings } from '@prisma/client';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<(User & { userSettings: UserSettings | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Fetch user data if authenticated
    if (status === 'authenticated' && session?.user?.id) {
      fetchUserData(session.user.id);
    }
  }, [status, session, router]);

  const fetchUserData = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (settings: Partial<UserSettings>) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/users/${session.user.id}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      
      // Update local user state with new settings
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          userSettings: {
            ...prev.userSettings,
            ...data.data,
          },
        };
      });
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <UnifiedNavigation user={session?.user}>
        <div className="flex h-full items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading profile...</p>
          </div>
        </div>
      </UnifiedNavigation>
    );
  }

  // Show error state
  if (error) {
    return (
      <UnifiedNavigation user={session?.user}>
        <div className="p-4 md:p-6">
          <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/30">
            <h2 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h2>
            <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => session?.user?.id && fetchUserData(session.user.id)}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </UnifiedNavigation>
    );
  }

  // Show user profile
  return (
    <UnifiedNavigation user={session?.user}>
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
        
        {user ? (
          <UserProfile user={user} onUpdateSettings={handleUpdateSettings} />
        ) : (
          <div className="rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900/30">
            <p className="text-yellow-700 dark:text-yellow-300">
              User profile not found. Please try signing out and signing in again.
            </p>
          </div>
        )}
      </div>
    </UnifiedNavigation>
  );
}