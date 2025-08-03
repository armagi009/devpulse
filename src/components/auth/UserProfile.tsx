'use client';

/**
 * UserProfile Component
 * Displays user profile information and settings
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { User, UserSettings } from '@prisma/client';

interface UserProfileProps {
  user: User & { userSettings?: UserSettings | null };
  onUpdateSettings?: (settings: Partial<UserSettings>) => Promise<void>;
}

export default function UserProfile({ user, onUpdateSettings }: UserProfileProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    theme: user.userSettings?.theme || 'system',
    emailNotifications: user.userSettings?.emailNotifications ?? true,
    weeklyReports: user.userSettings?.weeklyReports ?? true,
    burnoutAlerts: user.userSettings?.burnoutAlerts ?? true,
  });

  const handleSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onUpdateSettings) {
      try {
        await onUpdateSettings(settings);
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update settings:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name || 'User avatar'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
              <span className="text-2xl font-medium">
                {user.name?.charAt(0) || user.username.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user.name || user.username}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.email || 'No email provided'}
          </p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Profile Information
        </h3>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">
                {user.username}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">
                {user.name || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">
                {user.email || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                GitHub ID
              </label>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">
                {user.githubId}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Settings */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            User Settings
          </h3>
          {onUpdateSettings && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="theme"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Theme
            </label>
            <select
              id="theme"
              name="theme"
              value={settings.theme}
              onChange={handleSettingsChange}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-400 sm:text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="emailNotifications"
                name="emailNotifications"
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={handleSettingsChange}
                disabled={!isEditing}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700"
              />
              <label
                htmlFor="emailNotifications"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Email Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="weeklyReports"
                name="weeklyReports"
                type="checkbox"
                checked={settings.weeklyReports}
                onChange={handleSettingsChange}
                disabled={!isEditing}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700"
              />
              <label
                htmlFor="weeklyReports"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Weekly Reports
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="burnoutAlerts"
                name="burnoutAlerts"
                type="checkbox"
                checked={settings.burnoutAlerts}
                onChange={handleSettingsChange}
                disabled={!isEditing}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700"
              />
              <label
                htmlFor="burnoutAlerts"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Burnout Alerts
              </label>
            </div>
          </div>

          {isEditing && onUpdateSettings && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}