/**
 * User Settings API Route
 * Handles user settings operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUserWithSettings, updateUserSettings } from '@/lib/auth/user-service';
import { AppError, ErrorCode } from '@/lib/types/api';
import { withMockSession, getMockSession } from '@/lib/auth/mock-session-middleware';
import { getDevModeConfig } from '@/lib/config/dev-mode';

/**
 * GET /api/users/[userId]/settings
 * Get user settings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Use mock session middleware in development
  return withMockSession(request, async (req) => {
    try {
      // Check for mock session first (for development)
      const mockSession = getMockSession(req);
      const { useMockAuth } = getDevModeConfig();
      
      // Get real session if not using mock
      const session = mockSession && useMockAuth && process.env.NODE_ENV === 'development' 
        ? mockSession 
        : await getServerSession();
      
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
      
      // In development mode with mock auth, bypass permission check
      const bypassPermissionCheck = process.env.NODE_ENV === 'development' && useMockAuth;
      
      // Check if user is accessing their own settings or has admin permission
      if (!bypassPermissionCheck && session.user.id !== params.userId && session.user.role !== 'ADMINISTRATOR' && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ErrorCode.FORBIDDEN,
              message: 'You can only access your own settings',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }
    
      // Get user settings
      const user = await getUserWithSettings(params.userId);
      
      // Return settings
      return NextResponse.json(
        {
          success: true,
          data: user.userSettings,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error in user settings API route:', error);
      
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
  });
}

/**
 * PATCH /api/users/[userId]/settings
 * Update user settings
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Use mock session middleware in development
  return withMockSession(request, async (req) => {
    try {
      // Check for mock session first (for development)
      const mockSession = getMockSession(req);
      const { useMockAuth } = getDevModeConfig();
      
      // Get real session if not using mock
      const session = mockSession && useMockAuth && process.env.NODE_ENV === 'development' 
        ? mockSession 
        : await getServerSession();
      
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
      
      // In development mode with mock auth, bypass permission check
      const bypassPermissionCheck = process.env.NODE_ENV === 'development' && useMockAuth;
      
      // Check if user is updating their own settings or has admin permission
      if (!bypassPermissionCheck && session.user.id !== params.userId && session.user.role !== 'ADMINISTRATOR' && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ErrorCode.FORBIDDEN,
              message: 'You can only update your own settings',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }
    
      // Parse request body
      const body = await request.json();
      
      // Validate settings
      const validSettings: Record<string, any> = {};
      
      // Theme
      if (body.theme && ['light', 'dark', 'system'].includes(body.theme)) {
        validSettings.theme = body.theme;
      }
      
      // Boolean settings
      for (const key of ['emailNotifications', 'weeklyReports', 'burnoutAlerts']) {
        if (typeof body[key] === 'boolean') {
          validSettings[key] = body[key];
        }
      }
      
      // Data privacy
      if (body.dataPrivacy && ['MINIMAL', 'STANDARD', 'DETAILED'].includes(body.dataPrivacy)) {
        validSettings.dataPrivacy = body.dataPrivacy;
      }
      
      // Dashboard layout
      if (body.dashboardLayout && typeof body.dashboardLayout === 'object') {
        validSettings.dashboardLayout = body.dashboardLayout;
      }
      
      // Selected repositories
      if (Array.isArray(body.selectedRepositories)) {
        validSettings.selectedRepositories = body.selectedRepositories;
      }
      
      // Update settings
      const updatedSettings = await updateUserSettings(params.userId, validSettings);
      
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
      console.error('Error in user settings API route:', error);
      
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
  });
}