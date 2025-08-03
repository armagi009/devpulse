'use client';

/**
 * Settings Context
 * Provides settings state and management functions to the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserSettings } from '@prisma/client';
import { DataPrivacySettings } from '@/lib/types/roles';

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings when session is available
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      refreshSettings();
    } else if (status === 'unauthenticated') {
      setSettings(null);
      setLoading(false);
    }
  }, [status, session]);

  // Function to refresh settings from the API
  const refreshSettings = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${session.user.id}/settings`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Function to update settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!session?.user?.id) return;

    try {
      setError(null);

      const response = await fetch(`/api/users/${session.user.id}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      setSettings(data.data);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
      throw err;
    }
  };

  // Create default settings if none exist
  const defaultSettings: Partial<UserSettings> = {
    theme: 'system',
    emailNotifications: true,
    weeklyReports: true,
    burnoutAlerts: true,
    selectedRepositories: [],
    dataPrivacy: DataPrivacySettings.STANDARD,
  };

  // Context value
  const value = {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook to use settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}