/**
 * User Settings Sync API Route
 * Handles synchronization of user settings across devices
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUserWithSettings, updateUserSettings } from '@/lib/auth/user-service';
import { AppError, ErrorCode } from '@/lib/types/api';

/**
 * POST /api/users/[userId]/settings/sync
 * Synchronize user settings
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get session
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.UNAUTHORIZED,
            message: 'Not authenticated',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }
    
    // Check if user is syncing their own settings or has admin permission
    if (session.user.id !== params.userId && session.user.role !== 'ADMINISTRATOR') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.FORBIDDEN,
            message: 'You can only sync your own settings',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Get current user settings
    const user = await getUserWithSettings(params.userId);
    const currentSettings = user.userSettings || {};
    
    // Merge settings with priority to newer settings
    // This is determined by comparing timestamps
    const mergedSettings = mergeSettings(currentSettings, body);
    
    // Update settings in database
    const updatedSettings = await updateUserSettings(params.userId, mergedSettings);
    
    // Return updated settings
    return NextResponse.json(
      {
        success: true,
        data: updatedSettings,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in user settings sync API route:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.toJSON(),
          timestamp: new Date().toISOString(),
        },
        { status: error.status }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Merge settings with priority to newer settings
 */
function mergeSettings(currentSettings: any, newSettings: any): any {
  // Get timestamps
  const currentTimestamp = currentSettings.syncTimestamp
    ? new Date(currentSettings.syncTimestamp).getTime()
    : 0;
  const newTimestamp = newSettings.syncTimestamp
    ? new Date(newSettings.syncTimestamp).getTime()
    : Date.now();
  
  // If new settings are older, keep current settings
  if (newTimestamp < currentTimestamp) {
    return currentSettings;
  }
  
  // Merge settings
  return {
    ...currentSettings,
    ...newSettings,
    syncTimestamp: new Date().toISOString(),
  };
}