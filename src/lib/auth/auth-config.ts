/**
 * NextAuth.js configuration
 * Shared configuration that can be imported by other modules
 */

import GithubProvider from 'next-auth/providers/github';
import { env } from '@/lib/utils/env';
import { MockProvider, shouldUseMockAuth } from '@/lib/auth/mock-auth-provider';
import { UserRole } from '@/lib/types/roles';

/**
 * NextAuth.js configuration
 */
export const authOptions = {
  // Don't use database adapter for mock authentication
  providers: [
    // Conditionally include the mock provider in development mode
    ...(shouldUseMockAuth() ? [MockProvider()] : []),
    // Always include the GitHub provider (will be used if mock auth is disabled)
    GithubProvider({
      clientId: env().GITHUB_ID,
      clientSecret: env().GITHUB_SECRET,
      authorization: {
        params: {
          // Request additional scopes for GitHub API access
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    /**
     * JWT callback - Add custom claims to the JWT token
     */
    async jwt({ token, user, account }: any) {
      // Add user ID to token
      if (user) {
        token.userId = user.id;
        
        // For mock authentication, set the role directly based on the mock user
        if (account && account.provider === 'mock-github') {
          // Get the role from the user object
          if (user.role) {
            // Map the mock user role to the UserRole enum
            const role = user.role.toString().toUpperCase();
            if (role === 'ADMINISTRATOR' || role === 'ADMIN' || role === 'MANAGER') {
              token.role = UserRole.ADMINISTRATOR;
            } else if (role === 'TEAM_LEAD' || role === 'TEAM-LEAD' || role === 'LEAD') {
              token.role = UserRole.TEAM_LEAD;
            } else {
              token.role = UserRole.DEVELOPER;
            }
          } else {
            // Default to DEVELOPER if no role is provided
            token.role = UserRole.DEVELOPER;
          }
        } else if (account && account.provider === 'github') {
          // For real GitHub authentication, default to DEVELOPER role
          token.role = UserRole.DEVELOPER;
        }
      }

      // Add access token to token (for both GitHub and mock provider)
      if (account && (account.provider === 'github' || account.provider === 'mock-github')) {
        token.accessToken = account.access_token || 'mock_access_token';
        token.refreshToken = account.refresh_token;
      }

      return token;
    },

    /**
     * Session callback - Add custom session properties
     */
    async session({ session, token }: any) {
      // Add user ID to session
      if (token.userId) {
        session.user.id = token.userId as string;
      }

      // Add user role to session
      if (token.role) {
        session.user.role = token.role as string;
      }

      // Add GitHub access token to session
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }

      return session;
    },

    /**
     * Sign-in callback - Create or update user in database
     */
    async signIn({ user, account, profile }: any) {
      try {
        // Handle mock authentication
        if (account && account.provider === 'mock-github') {
          return true;
        }
        
        // Handle GitHub authentication
        if (account && account.provider === 'github') {
          return true;
        }

        return false;
      } catch (error) {
        console.error('Error during sign-in:', error);
        // For mock authentication, still allow sign-in even if there's an error
        if (account && account.provider === 'mock-github') {
          return true;
        }
        return false;
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: env().NEXTAUTH_SECRET,
  debug: true, // Enable debug logging
};