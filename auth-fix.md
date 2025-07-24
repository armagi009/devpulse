# Authentication Issue Fix

## Problem
Users are being redirected to the unauthorized page despite successful login. This indicates an issue with the role-based access control system.

## Root Causes Identified

1. **Role Assignment in JWT**: The role might not be properly assigned to the JWT token during authentication.

2. **Case Sensitivity**: There's inconsistency in how roles are stored and compared (uppercase vs. lowercase).

3. **Mock Auth Configuration**: The mock auth configuration might be causing issues with role assignment.

4. **Token Validation**: The token validation in middleware might be failing.

## Fixes

### 1. Fix the JWT Callback in NextAuth

The issue is likely in the JWT callback in `devpulse/src/app/api/auth/[...nextauth]/route.ts`. Let's modify it to ensure the role is properly assigned:

```typescript
async jwt({ token, user, account }) {
  // Add user ID to token
  if (user) {
    token.userId = user.id;
    
    // For mock authentication, set the role directly based on the mock user
    if (account && account.provider === 'mock-github') {
      // Import the mock user functions
      const { getMockUserById } = await import('@/lib/mock/mock-users');
      const { UserRole } = await import('@/lib/types/roles');
      
      // Get the mock user and map their role to a UserRole enum value
      const mockUser = getMockUserById(user.id);
      if (mockUser) {
        // Map the mock user role to the UserRole enum - ensure uppercase
        const roleUpperCase = mockUser.role.toUpperCase();
        switch(roleUpperCase) {
          case 'ADMINISTRATOR':
          case 'ADMIN':
          case 'MANAGER':
            token.role = UserRole.ADMINISTRATOR;
            break;
          case 'TEAM-LEAD':
          case 'TEAM_LEAD':
          case 'LEAD':
            token.role = UserRole.TEAM_LEAD;
            break;
          case 'DEVELOPER':
          case 'CONTRIBUTOR':
          default:
            token.role = UserRole.DEVELOPER;
        }
        console.log(`Mock user ${user.id} assigned role: ${token.role}`);
      } else {
        // Default to DEVELOPER if mock user not found
        token.role = UserRole.DEVELOPER;
      }
    } else {
      // For real authentication, fetch user role from database
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        
        if (dbUser) {
          token.role = dbUser.role;
        } else {
          // Default to DEVELOPER if no role found
          token.role = UserRole.DEVELOPER;
        }
      } catch (error) {
        console.error('Error fetching user role for JWT:', error);
        // Default to DEVELOPER on error
        token.role = UserRole.DEVELOPER;
      }
    }
    
    // Add debug logging
    console.log(`JWT token created with role: ${token.role} for user: ${user.id}`);
  }

  // Add access token to token (for both GitHub and mock provider)
  if (account && (account.provider === 'github' || account.provider === 'mock-github')) {
    token.accessToken = account.access_token;
    token.refreshToken = account.refresh_token;
  }

  return token;
}
```

### 2. Fix the Role Service

Modify the `hasRole` function in `devpulse/src/lib/auth/role-service.ts` to handle case sensitivity:

```typescript
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    // In mock mode, assume the user has the requested role
    const { getDevModeConfig } = require('@/lib/config/dev-mode');
    if (getDevModeConfig().useMockAuth) {
      console.log('Mock auth enabled, bypassing role check');
      return true;
    }

    // Normalize roles for comparison (convert both to uppercase)
    const userRoleUpper = user.role?.toUpperCase();
    const requestedRoleUpper = role.toString().toUpperCase();
    
    console.log(`Comparing user role: ${userRoleUpper} with requested role: ${requestedRoleUpper}`);
    
    return userRoleUpper === requestedRoleUpper;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}
```

### 3. Fix the Middleware

Update the middleware in `devpulse/src/middleware.ts` to add more debugging and ensure mock mode is properly handled:

```typescript
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
    if (adminOnlyPaths.some(adminPath => path.startsWith(adminPath)) && 
        token.role.toString().toUpperCase() !== UserRole.ADMINISTRATOR) {
      console.log(`Access denied to admin path: ${path} for role: ${token.role}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Team lead paths
    const teamLeadPaths = ['/dashboard/team-lead'];
    if (teamLeadPaths.some(leadPath => path.startsWith(leadPath)) && 
        token.role.toString().toUpperCase() !== UserRole.TEAM_LEAD && 
        token.role.toString().toUpperCase() !== UserRole.ADMINISTRATOR) {
      console.log(`Access denied to team lead path: ${path} for role: ${token.role}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
}
```

### 4. Ensure Mock Auth is Properly Configured

Check the `.env` file to ensure mock auth is enabled:

```
NEXT_PUBLIC_USE_MOCK_AUTH=true
```

### 5. Add Debug Route

Create a debug route to check the current session and token:

```typescript
// File: devpulse/src/app/api/debug/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Get the token
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    // Return session and token info
    return NextResponse.json({
      authenticated: !!session,
      session: {
        user: session?.user || null,
      },
      token: {
        userId: token?.userId || null,
        role: token?.role || null,
      },
      mockMode: process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true',
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Implementation Steps

1. Update the JWT callback in the NextAuth configuration
2. Fix the role service to handle case sensitivity
3. Update the middleware to add more debugging
4. Check the environment variables
5. Add the debug route to help diagnose issues

## Testing

After implementing these changes:

1. Clear browser cookies and session storage
2. Sign in again with a mock user
3. Check the console logs for role assignment
4. Visit the debug route at `/api/debug/session` to verify the token and session
5. Try accessing different pages based on roles

These changes should resolve the unauthorized redirect issue by ensuring proper role assignment and validation throughout the authentication flow.