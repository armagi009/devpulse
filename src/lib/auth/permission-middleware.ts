/**
 * Permission Middleware
 * Handles permission checks for protected routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDevModeConfig } from '@/lib/config/dev-mode';

/**
 * Check if the user has the required role
 */
function hasRequiredRole(userRole: string, requiredRoles: string[]) {
  if (!userRole) return false;
  
  // Normalize roles for comparison
  const normalizedUserRole = userRole.toUpperCase();
  const normalizedRequiredRoles = requiredRoles.map(role => role.toUpperCase());
  
  // Handle role aliases
  if (normalizedUserRole === 'ADMIN') {
    normalizedRequiredRoles.push('ADMINISTRATOR');
  } else if (normalizedUserRole === 'ADMINISTRATOR') {
    normalizedRequiredRoles.push('ADMIN');
  }
  
  return normalizedRequiredRoles.includes(normalizedUserRole);
}

/**
 * Permission middleware factory
 */
export function createPermissionMiddleware(requiredRoles: string[]) {
  return async function permissionMiddleware(request: NextRequest) {
    // In mock mode, be more lenient with permissions
    const config = getDevModeConfig();
    if (config.useMockAuth) {
      // Get the mock session from the request headers
      const mockSessionHeader = request.headers.get('x-mock-session');
      if (mockSessionHeader) {
        try {
          const mockSession = JSON.parse(mockSessionHeader);
          const userRole = mockSession.user.role;
          
          // In mock mode, allow access if the user has any role
          if (userRole) {
            console.log(`Mock mode: Allowing access to ${request.url} for role ${userRole}`);
            return NextResponse.next();
          }
        } catch (error) {
          console.error('Error parsing mock session:', error);
        }
      } else {
        // In mock mode, if there's no session header, still allow access
        console.log(`Mock mode: Allowing access to ${request.url} without session`);
        return NextResponse.next();
      }
    }
    
    // Get the session
    const session = await getServerSession(authOptions);
    
    // If there's no session, redirect to signin
    if (!session) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Check if the user has the required role
    const userRole = session.user.role as string;
    if (!hasRequiredRole(userRole, requiredRoles)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Allow access to the requested resource
    return NextResponse.next();
  };
}