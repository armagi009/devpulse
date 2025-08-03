/**
 * Middleware
 * Handles authentication and route protection
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDevModeConfig } from '@/lib/config/dev-mode';
import { UserRole } from '@/lib/types/roles';

/**
 * Middleware function to protect routes
 */
export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/auth/signin', '/auth/error', '/auth/mock/select', '/unauthorized'];
  
  // Add dev paths if in mock mode
  const config = getDevModeConfig();
  if (config.useMockAuth || config.useMockApi) {
    publicPaths.push('/dev/mock-data');
    publicPaths.push('/dev');
  }
  
  // In mock mode, consider all API routes as public
  const isApiRoute = path.startsWith('/api/');
  const isMockModeApiRoute = config.useMockAuth && isApiRoute;
  
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith('/api/auth/') || 
    path.startsWith('/api/mock/') ||
    path.startsWith('/dev/')
  ) || isMockModeApiRoute;

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if the user is authenticated
  const isAuthenticated = !!token;

  // If the path is not public and the user is not authenticated,
  // redirect to the sign-in page
  if (!isPublicPath && !isAuthenticated) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(signInUrl);
  }

  // If the path is the sign-in page and the user is authenticated,
  // redirect to the appropriate dashboard based on role
  if (path === '/auth/signin' && isAuthenticated) {
    if (token.role === UserRole.ADMINISTRATOR) {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    } else if (token.role === UserRole.TEAM_LEAD) {
      return NextResponse.redirect(new URL('/dashboard/team-lead', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard/developer', request.url));
    }
  }

  // Role-based access control for specific paths
  if (isAuthenticated && token.role) {
    // Log the token role and path for debugging
    console.log(`User authenticated with role: ${token.role}, accessing path: ${path}`);
    
    // Check if we're in mock mode
    const config = getDevModeConfig();
    if (config.useMockAuth) {
      // In mock mode, allow access to all paths
      console.log('Mock mode enabled, bypassing role-based access control');
      // Force return next to ensure we don't hit any other middleware
      return NextResponse.next();
    } else {
      // Admin-only paths
      const adminOnlyPaths = ['/admin', '/dashboard/admin'];
      if (adminOnlyPaths.some(adminPath => path.startsWith(adminPath)) && token.role !== UserRole.ADMINISTRATOR) {
        console.log(`Access denied to admin path: ${path} for role: ${token.role}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Team lead paths
      const teamLeadPaths = ['/dashboard/team-lead'];
      if (teamLeadPaths.some(leadPath => path.startsWith(leadPath)) && 
          token.role !== UserRole.TEAM_LEAD && token.role !== UserRole.ADMINISTRATOR) {
        console.log(`Access denied to team lead path: ${path} for role: ${token.role}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  // Continue with the request
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes that don't require authentication
     * 2. /_next (static files)
     * 3. /favicon.ico, /manifest.json, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt).*)',
  ],
};