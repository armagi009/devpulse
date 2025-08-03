/**
 * Mock Session Middleware
 * Provides mock authentication for development purposes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDevModeConfig } from '@/lib/config/dev-mode';
import { getMockUserById, mockUsers } from '@/lib/mock/mock-users';

/**
 * Mock session middleware
 * Adds mock session data to the request for development purposes
 */
export async function withMockSession(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const { useMockAuth } = getDevModeConfig();
  
  // Only apply mock session in development with mock auth enabled
  if (process.env.NODE_ENV === 'development' && useMockAuth) {
    // Extract user ID from URL if it exists
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userIdIndex = pathParts.findIndex(part => part === 'users') + 1;
    
    // Check if this is an API route that needs a mock session
    const isApiRoute = url.pathname.startsWith('/api/');
    const isSettingsRoute = url.pathname.includes('/settings');
    const isAdminRoute = url.pathname.includes('/admin/');
    const isHealthRoute = url.pathname.includes('/health');
    const isTeamsRoute = url.pathname.includes('/teams');
    const isDashboardRoute = url.pathname.includes('/dashboard/');
    const isGithubRoute = url.pathname.includes('/github/');
    const isAnalyticsRoute = url.pathname.includes('/analytics/');
    const isInsightsRoute = url.pathname.includes('/insights/');
    const isRetrospectiveRoute = url.pathname.includes('/retrospective');
    
    // In mock mode, add session to all API routes and important app routes
    const needsMockSession = isApiRoute || isSettingsRoute || isAdminRoute || 
                            isHealthRoute || isTeamsRoute || isDashboardRoute || 
                            isGithubRoute || isAnalyticsRoute || isInsightsRoute ||
                            isRetrospectiveRoute;
    
    // Get mock user ID from cookie or use default
    const mockUserId = request.cookies.get('mock-user-id')?.value || mockUsers[0].id.toString();
    
    if (needsMockSession) {
      // Try to find a matching mock user, or use the first mock user as fallback
      const mockUser = getMockUserById(mockUserId) || mockUsers[0];
      
      // Create a mock session with the mock user data
      // Map role to proper format
      let role = mockUser.role.toUpperCase();
      if (role === 'MANAGER' || role === 'ADMIN') {
        role = 'ADMINISTRATOR';
      } else if (role === 'TEAM_LEAD' || role === 'LEAD') {
        role = 'TEAM_LEAD';
      } else {
        role = 'DEVELOPER';
      }
      
      const mockSession = {
        user: {
          id: mockUser.id.toString(),
          name: mockUser.name,
          email: mockUser.email,
          role: role,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      
      // Store the mock session in the request headers
      const requestWithSession = new NextRequest(request, {
        headers: new Headers(request.headers),
      });
      
      // Add mock session to request headers
      requestWithSession.headers.set('x-mock-session', JSON.stringify(mockSession));
      
      // Log the mock session for debugging
      console.log(`Added mock session for user ${mockUser.name} (${role}) to ${url.pathname}`);
      
      // Call the handler with the modified request
      return handler(requestWithSession);
    }
  }
  
  // If not in development or no user ID found, proceed normally
  return handler(request);
}

/**
 * Get mock session from request
 */
export function getMockSession(request: NextRequest) {
  const mockSessionHeader = request.headers.get('x-mock-session');
  
  if (mockSessionHeader) {
    try {
      return JSON.parse(mockSessionHeader);
    } catch (error) {
      console.error('Error parsing mock session:', error);
    }
  }
  
  return null;
}