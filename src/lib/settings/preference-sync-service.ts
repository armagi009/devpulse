/**
 * Preference Synchronization Service
 * Handles synchronization of user preferences across devices
 */

import { UserSettings } from '@prisma/client';

// Interface for sync options
interface SyncOptions {
  cloudSync?: boolean;
  localStorage?: boolean;
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'manual';
}

// Interface for sync result
interface SyncResult {
  success: boolean;
  timestamp: string;
  message?: string;
  error?: Error;
}

/**
 * Synchronize preferences to cloud
 */
export async function syncToCloud(
  userId: string,
  settings: Partial<UserSettings>
): Promise<SyncResult> {
  try {
    // Make API call to sync settings
    const response = await fetch(`/api/users/${userId}/settings/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to sync settings to cloud');
    }

    const data = await response.json();

    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Settings synchronized to cloud successfully',
    };
  } catch (error) {
    console.error('Error syncing settings to cloud:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      message: 'Failed to sync settings to cloud',
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Save preferences to local storage
 */
export function saveToLocalStorage(
  userId: string,
  settings: Partial<UserSettings>
): SyncResult {
  try {
    // Save settings to local storage
    localStorage.setItem(`devpulse-settings-${userId}`, JSON.stringify(settings));

    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Settings saved to local storage successfully',
    };
  } catch (error) {
    console.error('Error saving settings to local storage:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      message: 'Failed to save settings to local storage',
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Load preferences from local storage
 */
export function loadFromLocalStorage(userId: string): {
  settings: Partial<UserSettings> | null;
  timestamp: string | null;
} {
  try {
    // Load settings from local storage
    const storedSettings = localStorage.getItem(`devpulse-settings-${userId}`);
    
    if (!storedSettings) {
      return { settings: null, timestamp: null };
    }
    
    const settings = JSON.parse(storedSettings);
    const timestamp = settings.syncTimestamp || new Date().toISOString();
    
    return { settings, timestamp };
  } catch (error) {
    console.error('Error loading settings from local storage:', error);
    return { settings: null, timestamp: null };
  }
}

/**
 * Synchronize preferences based on options
 */
export async function synchronizePreferences(
  userId: string,
  settings: Partial<UserSettings>,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const results: SyncResult[] = [];
  
  // Default options
  const syncOptions: Required<SyncOptions> = {
    cloudSync: options.cloudSync !== false,
    localStorage: options.localStorage !== false,
    syncFrequency: options.syncFrequency || 'realtime',
  };
  
  // Add timestamp
  const settingsWithTimestamp = {
    ...settings,
    syncTimestamp: new Date().toISOString(),
  };
  
  // Sync to cloud if enabled
  if (syncOptions.cloudSync) {
    const cloudResult = await syncToCloud(userId, settingsWithTimestamp);
    results.push(cloudResult);
  }
  
  // Save to local storage if enabled
  if (syncOptions.localStorage) {
    const localResult = saveToLocalStorage(userId, settingsWithTimestamp);
    results.push(localResult);
  }
  
  // Check if any sync failed
  const anyFailed = results.some(result => !result.success);
  
  if (anyFailed) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      message: 'One or more sync operations failed',
    };
  }
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
    message: 'All sync operations completed successfully',
  };
}

/**
 * Generate migration code for preferences
 */
export function generateMigrationCode(settings: Partial<UserSettings>): string {
  try {
    // Create a simplified version of settings for migration
    const migrationData = {
      settings,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
    
    // Convert to JSON and encode as base64
    const jsonData = JSON.stringify(migrationData);
    const encodedData = btoa(jsonData);
    
    // Generate a 6-character code from the hash
    const code = encodedData
      .split('')
      .reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0)
      .toString(36)
      .substring(0, 6)
      .toUpperCase();
    
    // Store the migration data with the code
    localStorage.setItem(`devpulse-migration-${code}`, encodedData);
    
    return code;
  } catch (error) {
    console.error('Error generating migration code:', error);
    throw error;
  }
}

/**
 * Apply migration code to import preferences
 */
export function applyMigrationCode(code: string): Partial<UserSettings> | null {
  try {
    // Get encoded data from local storage
    const encodedData = localStorage.getItem(`devpulse-migration-${code}`);
    
    if (!encodedData) {
      throw new Error('Invalid migration code');
    }
    
    // Decode and parse data
    const jsonData = atob(encodedData);
    const migrationData = JSON.parse(jsonData);
    
    // Check if code has expired
    const expiresAt = new Date(migrationData.expiresAt);
    if (expiresAt < new Date()) {
      throw new Error('Migration code has expired');
    }
    
    return migrationData.settings;
  } catch (error) {
    console.error('Error applying migration code:', error);
    return null;
  }
}

/**
 * Schedule automatic synchronization based on frequency
 */
export function scheduleSync(
  userId: string,
  settings: Partial<UserSettings>,
  frequency: 'realtime' | 'hourly' | 'daily' | 'manual'
): () => void {
  let intervalId: NodeJS.Timeout | null = null;
  
  // Clear any existing interval
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  
  // Don't schedule if manual
  if (frequency === 'manual') {
    return () => {};
  }
  
  // Set interval based on frequency
  const intervalMs = 
    frequency === 'realtime' ? 5 * 60 * 1000 : // 5 minutes
    frequency === 'hourly' ? 60 * 60 * 1000 : // 1 hour
    frequency === 'daily' ? 24 * 60 * 60 * 1000 : // 24 hours
    null;
  
  if (intervalMs) {
    intervalId = setInterval(() => {
      synchronizePreferences(userId, settings, { syncFrequency: frequency });
    }, intervalMs);
  }
  
  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}