'use client';

/**
 * Settings Page
 * Central hub for user settings and preferences
 */

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SettingsLayout from '@/components/settings/SettingsLayout';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import DataViewSettings from '@/components/settings/DataViewSettings';
import PreferenceSyncSettings from '@/components/settings/PreferenceSyncSettings';
import DataManagementSettings from '@/components/settings/DataManagementSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { UserSettings } from '@prisma/client';
import { DataPrivacySettings } from '@/lib/types/roles';
import './settings.css';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Fetch user settings if authenticated
    if (status === 'authenticated') {
      if (session?.user?.id) {
        console.log('User ID from session:', session.user.id);
        fetchUserSettings(session.user.id);
      } else {
        console.error('No user ID in session:', session);
        setError('User ID is missing from session. Please try signing in again.');
        setLoading(false);
      }
    }
  }, [status, session, router]);

  const fetchUserSettings = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Log the userId to debug
      console.log('Fetching settings for user ID:', userId);
      
      // Make sure we have a valid userId
      if (!userId) {
        throw new Error('User ID is missing');
      }

      const response = await fetch(`/api/users/${userId}/settings`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user settings: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setUserSettings(data.data);
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError('Failed to load settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout user={session?.user}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout user={session?.user}>
        <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/30">
          <h2 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h2>
          <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => session?.user?.id && fetchUserSettings(session.user.id)}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={session?.user}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <SettingsLayout>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="data">Data & Views</TabsTrigger>
              <TabsTrigger value="management">Data Management</TabsTrigger>
              <TabsTrigger value="sync">Sync</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">General Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Configure your basic account settings and preferences.
                </p>
                
                {/* General settings content will be added by the GeneralSettings component */}
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  General settings component will be implemented in the next task.
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">Appearance Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Customize the look and feel of the application.
                </p>
                
                {/* Appearance settings component */}
                <AppearanceSettings />
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">Notification Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Control how and when you receive notifications.
                </p>
                
                {/* Notification settings component */}
                <NotificationSettings />
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy">
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">Privacy Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Control how your data is shared with team members and administrators.
                </p>
                
                {session?.user?.id && (
                  <div className="mt-4">
                    {/* Using the existing DataPrivacySettings component */}
                    {/* This will be replaced with a more comprehensive component in the future */}
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      Privacy settings component will be implemented in a future task.
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="sync">
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">Preference Synchronization</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Configure how your preferences are synchronized across devices.
                </p>
                
                <PreferenceSyncSettings />
              </Card>
            </TabsContent>
            
            <TabsContent value="data">
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">Data & View Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Customize how data is displayed and which metrics are shown.
                </p>
                
                {/* Data view settings component */}
                <DataViewSettings />
              </Card>
            </TabsContent>
            
            <TabsContent value="management">
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">Data Management</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Export or delete your data from the system.
                </p>
                
                {/* Data management settings component */}
                <DataManagementSettings />
              </Card>
            </TabsContent>
          </Tabs>
        </SettingsLayout>
      </div>
    </DashboardLayout>
  );
}