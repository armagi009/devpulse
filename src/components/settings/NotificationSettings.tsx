'use client';

/**
 * NotificationSettings Component
 * Allows users to customize their notification preferences
 */

import React, { useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

// Notification types
interface NotificationType {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
}

// Notification channels
interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
}

// Notification frequency
interface NotificationFrequency {
  id: string;
  name: string;
  description: string;
}

// Available notification types
const notificationTypes: NotificationType[] = [
  {
    id: 'burnoutAlerts',
    name: 'Burnout Alerts',
    description: 'Receive alerts when burnout risk is detected',
    defaultEnabled: true,
  },
  {
    id: 'weeklyReports',
    name: 'Weekly Reports',
    description: 'Receive weekly summary reports of your activity',
    defaultEnabled: true,
  },
  {
    id: 'teamUpdates',
    name: 'Team Updates',
    description: 'Receive updates about your team activity',
    defaultEnabled: true,
  },
  {
    id: 'repositoryChanges',
    name: 'Repository Changes',
    description: 'Receive notifications about repository changes',
    defaultEnabled: false,
  },
  {
    id: 'systemAnnouncements',
    name: 'System Announcements',
    description: 'Receive important system announcements',
    defaultEnabled: true,
  },
];

// Available notification channels
const notificationChannels: NotificationChannel[] = [
  {
    id: 'email',
    name: 'Email',
    description: 'Receive notifications via email',
    defaultEnabled: true,
  },
  {
    id: 'inApp',
    name: 'In-App',
    description: 'Receive notifications within the application',
    defaultEnabled: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receive notifications via Slack',
    defaultEnabled: false,
  },
  {
    id: 'browser',
    name: 'Browser',
    description: 'Receive browser push notifications',
    defaultEnabled: false,
  },
];

// Available notification frequencies
const notificationFrequencies: NotificationFrequency[] = [
  {
    id: 'immediate',
    name: 'Immediate',
    description: 'Receive notifications as soon as they occur',
  },
  {
    id: 'hourly',
    name: 'Hourly Digest',
    description: 'Receive a digest of notifications every hour',
  },
  {
    id: 'daily',
    name: 'Daily Digest',
    description: 'Receive a digest of notifications once a day',
  },
  {
    id: 'weekly',
    name: 'Weekly Digest',
    description: 'Receive a digest of notifications once a week',
  },
];

export default function NotificationSettings() {
  const { settings, updateSettings, loading, error } = useSettings();
  
  // Local state for notification preferences
  const [enabledTypes, setEnabledTypes] = useState<Record<string, boolean>>({});
  const [enabledChannels, setEnabledChannels] = useState<Record<string, boolean>>({});
  const [frequency, setFrequency] = useState<string>('immediate');
  const [quietHours, setQuietHours] = useState<boolean>(false);
  const [quietHoursStart, setQuietHoursStart] = useState<string>('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState<string>('08:00');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Initialize local state from settings
  useEffect(() => {
    if (settings) {
      // Parse notification settings if they exist
      const notificationSettings = settings.dashboardLayout?.notificationSettings as any || {};
      
      // Initialize notification types
      const types: Record<string, boolean> = {};
      notificationTypes.forEach(type => {
        types[type.id] = notificationSettings.types?.[type.id] ?? type.defaultEnabled;
      });
      setEnabledTypes(types);
      
      // Initialize notification channels
      const channels: Record<string, boolean> = {};
      notificationChannels.forEach(channel => {
        channels[channel.id] = notificationSettings.channels?.[channel.id] ?? channel.defaultEnabled;
      });
      setEnabledChannels(channels);
      
      // Initialize frequency and quiet hours
      setFrequency(notificationSettings.frequency || 'immediate');
      setQuietHours(notificationSettings.quietHours?.enabled || false);
      setQuietHoursStart(notificationSettings.quietHours?.start || '22:00');
      setQuietHoursEnd(notificationSettings.quietHours?.end || '08:00');
      
      // Set specific settings from the UserSettings model
      if (settings.emailNotifications !== undefined) {
        setEnabledChannels(prev => ({ ...prev, email: settings.emailNotifications }));
      }
      if (settings.weeklyReports !== undefined) {
        setEnabledTypes(prev => ({ ...prev, weeklyReports: settings.weeklyReports }));
      }
      if (settings.burnoutAlerts !== undefined) {
        setEnabledTypes(prev => ({ ...prev, burnoutAlerts: settings.burnoutAlerts }));
      }
    }
  }, [settings]);
  
  // Handle notification type toggle
  const handleTypeToggle = async (typeId: string) => {
    const newValue = !enabledTypes[typeId];
    setEnabledTypes(prev => ({ ...prev, [typeId]: newValue }));
    
    // Special handling for specific settings that are directly in the UserSettings model
    if (typeId === 'burnoutAlerts' || typeId === 'weeklyReports') {
      await saveSettings({
        [typeId]: newValue,
      });
    } else {
      await saveNotificationSettings();
    }
  };
  
  // Handle notification channel toggle
  const handleChannelToggle = async (channelId: string) => {
    const newValue = !enabledChannels[channelId];
    setEnabledChannels(prev => ({ ...prev, [channelId]: newValue }));
    
    // Special handling for email notifications which is directly in the UserSettings model
    if (channelId === 'email') {
      await saveSettings({
        emailNotifications: newValue,
      });
    } else {
      await saveNotificationSettings();
    }
  };
  
  // Handle frequency change
  const handleFrequencyChange = async (newFrequency: string) => {
    setFrequency(newFrequency);
    await saveNotificationSettings();
  };
  
  // Handle quiet hours toggle
  const handleQuietHoursToggle = async () => {
    setQuietHours(!quietHours);
    await saveNotificationSettings();
  };
  
  // Handle quiet hours time change
  const handleQuietHoursTimeChange = async (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setQuietHoursStart(value);
    } else {
      setQuietHoursEnd(value);
    }
    await saveNotificationSettings();
  };
  
  // Save notification settings to the database
  const saveNotificationSettings = async () => {
    try {
      setSaveStatus('saving');
      
      // Get current dashboard layout or initialize empty object
      const currentLayout = (settings?.dashboardLayout as any) || {};
      
      // Create notification settings object
      const notificationSettings = {
        types: enabledTypes,
        channels: enabledChannels,
        frequency,
        quietHours: {
          enabled: quietHours,
          start: quietHoursStart,
          end: quietHoursEnd,
        },
      };
      
      // Update settings in database
      await updateSettings({
        dashboardLayout: {
          ...currentLayout,
          notificationSettings,
        },
      });
      
      setSaveStatus('success');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setSaveStatus('error');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };
  
  // Save specific settings directly to the UserSettings model
  const saveSettings = async (settingsToUpdate: Record<string, any>) => {
    try {
      setSaveStatus('saving');
      
      // Update settings in database
      await updateSettings(settingsToUpdate);
      
      setSaveStatus('success');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setSaveStatus('error');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Notification Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Types</h3>
        <p className="text-sm text-muted-foreground">
          Select which types of notifications you want to receive
        </p>
        
        <div className="space-y-3">
          {notificationTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <h4 className="font-medium">{type.name}</h4>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
                <input
                  type="checkbox"
                  id={`type-${type.id}`}
                  className="peer sr-only"
                  checked={enabledTypes[type.id] || false}
                  onChange={() => handleTypeToggle(type.id)}
                />
                <span
                  className={`${
                    enabledTypes[type.id] ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
                  } inline-block h-4 w-4 transform rounded-full transition`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Notification Channels */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Channels</h3>
        <p className="text-sm text-muted-foreground">
          Select how you want to receive notifications
        </p>
        
        <div className="space-y-3">
          {notificationChannels.map((channel) => (
            <div key={channel.id} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <h4 className="font-medium">{channel.name}</h4>
                <p className="text-sm text-muted-foreground">{channel.description}</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
                <input
                  type="checkbox"
                  id={`channel-${channel.id}`}
                  className="peer sr-only"
                  checked={enabledChannels[channel.id] || false}
                  onChange={() => handleChannelToggle(channel.id)}
                />
                <span
                  className={`${
                    enabledChannels[channel.id] ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
                  } inline-block h-4 w-4 transform rounded-full transition`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Notification Frequency */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Frequency</h3>
        <p className="text-sm text-muted-foreground">
          Choose how often you want to receive notifications
        </p>
        
        <div className="space-y-3">
          {notificationFrequencies.map((freq) => (
            <div
              key={freq.id}
              className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all hover:border-primary ${
                frequency === freq.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => handleFrequencyChange(freq.id)}
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`frequency-${freq.id}`}
                    name="frequency"
                    className="h-4 w-4 text-primary"
                    checked={frequency === freq.id}
                    onChange={() => handleFrequencyChange(freq.id)}
                  />
                  <label htmlFor={`frequency-${freq.id}`} className="ml-2 font-medium">
                    {freq.name}
                  </label>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{freq.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Quiet Hours */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Quiet Hours</h3>
            <p className="text-sm text-muted-foreground">
              Set a time period when you don't want to receive notifications
            </p>
          </div>
          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
            <input
              type="checkbox"
              id="quiet-hours-toggle"
              className="peer sr-only"
              checked={quietHours}
              onChange={handleQuietHoursToggle}
            />
            <span
              className={`${
                quietHours ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
              } inline-block h-4 w-4 transform rounded-full transition`}
            />
          </div>
        </div>
        
        {quietHours && (
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
            <div>
              <label htmlFor="quiet-hours-start" className="block text-sm font-medium">
                Start Time
              </label>
              <input
                type="time"
                id="quiet-hours-start"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                value={quietHoursStart}
                onChange={(e) => handleQuietHoursTimeChange('start', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="quiet-hours-end" className="block text-sm font-medium">
                End Time
              </label>
              <input
                type="time"
                id="quiet-hours-end"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                value={quietHoursEnd}
                onChange={(e) => handleQuietHoursTimeChange('end', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Save Status */}
      {saveStatus === 'saving' && (
        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 animate-spin text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Saving</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>Your notification preferences are being saved...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {saveStatus === 'success' && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Success</h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>Your notification preferences have been saved.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>Failed to save notification preferences. Please try again.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
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
    </div>
  );
}