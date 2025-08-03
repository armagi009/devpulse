'use client';

/**
 * PreferenceSyncSettings Component
 * Allows users to configure preference synchronization options
 */

import React, { useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

export default function PreferenceSyncSettings() {
  const { settings, updateSettings, loading, error } = useSettings();
  
  // Local state for sync preferences
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState<boolean>(true);
  const [localStorageEnabled, setLocalStorageEnabled] = useState<boolean>(true);
  const [syncFrequency, setSyncFrequency] = useState<string>('realtime');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Initialize local state from settings
  useEffect(() => {
    if (settings) {
      // Parse sync settings if they exist
      const syncSettings = settings.dashboardLayout?.syncSettings as any || {};
      
      setCloudSyncEnabled(syncSettings.cloudSyncEnabled !== false);
      setLocalStorageEnabled(syncSettings.localStorageEnabled !== false);
      setSyncFrequency(syncSettings.syncFrequency || 'realtime');
      setLastSyncTime(syncSettings.lastSyncTime || null);
    }
  }, [settings]);
  
  // Handle cloud sync toggle
  const handleCloudSyncToggle = async () => {
    setCloudSyncEnabled(!cloudSyncEnabled);
    await saveSyncSettings();
  };
  
  // Handle local storage toggle
  const handleLocalStorageToggle = async () => {
    setLocalStorageEnabled(!localStorageEnabled);
    await saveSyncSettings();
  };
  
  // Handle sync frequency change
  const handleSyncFrequencyChange = async (frequency: string) => {
    setSyncFrequency(frequency);
    await saveSyncSettings();
  };
  
  // Save sync settings to the database
  const saveSyncSettings = async () => {
    try {
      setSaveStatus('saving');
      
      // Get current dashboard layout or initialize empty object
      const currentLayout = (settings?.dashboardLayout as any) || {};
      
      // Create sync settings object
      const syncSettings = {
        cloudSyncEnabled: cloudSyncEnabled,
        localStorageEnabled: localStorageEnabled,
        syncFrequency: syncFrequency,
        lastSyncTime: new Date().toISOString(),
      };
      
      // Update settings in database
      await updateSettings({
        dashboardLayout: {
          ...currentLayout,
          syncSettings,
        },
      });
      
      // Update last sync time
      setLastSyncTime(syncSettings.lastSyncTime);
      
      setSaveStatus('success');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Error updating sync settings:', err);
      setSaveStatus('error');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };
  
  // Handle manual sync
  const handleManualSync = async () => {
    try {
      setSyncStatus('syncing');
      
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update last sync time
      const newSyncTime = new Date().toISOString();
      setLastSyncTime(newSyncTime);
      
      // Save the new sync time to settings
      const currentLayout = (settings?.dashboardLayout as any) || {};
      const currentSyncSettings = currentLayout.syncSettings || {};
      
      await updateSettings({
        dashboardLayout: {
          ...currentLayout,
          syncSettings: {
            ...currentSyncSettings,
            lastSyncTime: newSyncTime,
          },
        },
      });
      
      setSyncStatus('success');
      
      // Reset status after a delay
      setTimeout(() => {
        setSyncStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Error during manual sync:', err);
      setSyncStatus('error');
      
      // Reset status after a delay
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  };
  
  // Handle export preferences
  const handleExportPreferences = () => {
    try {
      // Create a JSON string of all settings
      const preferencesJson = JSON.stringify(settings, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([preferencesJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devpulse-preferences-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting preferences:', err);
      alert('Failed to export preferences. Please try again.');
    }
  };
  
  // Handle import preferences
  const handleImportPreferences = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    // Handle file selection
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        // Read the file
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const importedSettings = JSON.parse(event.target?.result as string);
            
            // Validate imported settings
            if (!importedSettings || typeof importedSettings !== 'object') {
              throw new Error('Invalid settings format');
            }
            
            // Update settings
            await updateSettings(importedSettings);
            
            // Show success message
            alert('Preferences imported successfully');
            
            // Refresh the page to apply new settings
            window.location.reload();
          } catch (err) {
            console.error('Error parsing imported settings:', err);
            alert('Failed to import preferences. Invalid format.');
          }
        };
        reader.readAsText(file);
      } catch (err) {
        console.error('Error importing preferences:', err);
        alert('Failed to import preferences. Please try again.');
      }
    };
    
    // Trigger file selection
    input.click();
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      return 'Invalid date';
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
      {/* Cloud Sync */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Cloud Synchronization</h3>
            <p className="text-sm text-muted-foreground">
              Sync your preferences across devices using your account
            </p>
          </div>
          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
            <input
              type="checkbox"
              id="cloud-sync-toggle"
              className="peer sr-only"
              checked={cloudSyncEnabled}
              onChange={handleCloudSyncToggle}
            />
            <span
              className={`${
                cloudSyncEnabled ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
              } inline-block h-4 w-4 transform rounded-full transition`}
            />
          </div>
        </div>
        
        {cloudSyncEnabled && (
          <div className="rounded-lg border border-border p-4">
            <div className="mb-4">
              <h4 className="font-medium">Sync Frequency</h4>
              <p className="text-sm text-muted-foreground">
                Choose how often your preferences are synchronized
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="sync-realtime"
                  name="syncFrequency"
                  value="realtime"
                  checked={syncFrequency === 'realtime'}
                  onChange={() => handleSyncFrequencyChange('realtime')}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="sync-realtime" className="ml-2 text-sm font-medium">
                  Real-time (Immediate)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="sync-hourly"
                  name="syncFrequency"
                  value="hourly"
                  checked={syncFrequency === 'hourly'}
                  onChange={() => handleSyncFrequencyChange('hourly')}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="sync-hourly" className="ml-2 text-sm font-medium">
                  Hourly
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="sync-daily"
                  name="syncFrequency"
                  value="daily"
                  checked={syncFrequency === 'daily'}
                  onChange={() => handleSyncFrequencyChange('daily')}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="sync-daily" className="ml-2 text-sm font-medium">
                  Daily
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="sync-manual"
                  name="syncFrequency"
                  value="manual"
                  checked={syncFrequency === 'manual'}
                  onChange={() => handleSyncFrequencyChange('manual')}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="sync-manual" className="ml-2 text-sm font-medium">
                  Manual Only
                </label>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Last Synced</p>
                <p className="text-sm text-muted-foreground">{formatDate(lastSyncTime)}</p>
              </div>
              
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncStatus === 'syncing'}
                className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </>
                ) : (
                  'Sync Now'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Local Storage */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Local Storage Backup</h3>
            <p className="text-sm text-muted-foreground">
              Store a backup of your preferences in browser local storage
            </p>
          </div>
          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
            <input
              type="checkbox"
              id="local-storage-toggle"
              className="peer sr-only"
              checked={localStorageEnabled}
              onChange={handleLocalStorageToggle}
            />
            <span
              className={`${
                localStorageEnabled ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
              } inline-block h-4 w-4 transform rounded-full transition`}
            />
          </div>
        </div>
        
        {localStorageEnabled && (
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              Your preferences will be stored locally in this browser. This allows your settings to be
              restored even when offline or if cloud sync is unavailable.
            </p>
          </div>
        )}
      </div>
      
      {/* Import/Export */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Import/Export Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Backup or restore your preferences manually
        </p>
        
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <button
            type="button"
            onClick={handleExportPreferences}
            className="inline-flex items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export Preferences
          </button>
          
          <button
            type="button"
            onClick={handleImportPreferences}
            className="inline-flex items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Import Preferences
          </button>
        </div>
      </div>
      
      {/* Preference Migration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preference Migration</h3>
        <p className="text-sm text-muted-foreground">
          Migrate preferences from other devices or accounts
        </p>
        
        <div className="rounded-lg border border-border p-4">
          <div className="mb-4">
            <h4 className="font-medium">Device Migration</h4>
            <p className="text-sm text-muted-foreground">
              Transfer your preferences from another device
            </p>
          </div>
          
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
            Generate Migration Code
          </button>
          
          <div className="mt-4">
            <h4 className="font-medium">Enter Migration Code</h4>
            <div className="mt-2 flex">
              <input
                type="text"
                placeholder="Enter code from other device"
                className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
              <button
                type="button"
                className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
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
                <p>Your sync preferences are being saved...</p>
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
                <p>Your sync preferences have been saved.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {syncStatus === 'success' && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Sync Complete</h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>Your preferences have been synchronized successfully.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {(saveStatus === 'error' || syncStatus === 'error') && (
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
                <p>An error occurred. Please try again.</p>
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