/**
 * Mock Authentication Provider
 * 
 * This module provides a custom NextAuth.js provider for mock authentication
 * during development. It uses a credentials provider to simulate GitHub authentication
 * without requiring real GitHub credentials.
 */

import CredentialsProvider from 'next-auth/providers/credentials';
import { getDevModeConfig } from '../config/dev-mode';
import { getMockUserById } from '../mock/mock-users';

/**
 * Create a mock GitHub authentication provider for NextAuth.js
 * 
 * @returns A NextAuth.js provider configuration for mock authentication
 */
export function MockProvider() {
  console.log('Creating MockProvider...');

  return CredentialsProvider({
    id: 'mock-github',
    name: 'Mock GitHub',
    credentials: {
      userId: { label: "User ID", type: "text" }
    },
    async authorize(credentials, req) {
      console.log('MockProvider authorize called with credentials:', credentials);

      if (!credentials?.userId) {
        console.log('No userId provided in credentials');
        return null;
      }

      // Get the mock user by ID
      const user = getMockUserById(credentials.userId);
      console.log('Found mock user:', user);

      if (!user) {
        console.log('Mock user not found for ID:', credentials.userId);
        return null;
      }

      // Return the user in the format expected by NextAuth
      const authUser = {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        image: user.avatar_url,
        // Add required fields for NextAuth User type
        githubId: user.id,
        accessToken: 'mock_access_token',
        // Add GitHub-specific fields that might be needed
        username: user.login,
        // Include the role directly to ensure it's available
        role: user.role.toUpperCase()
      };

      console.log('Returning auth user:', authUser);
      return authUser;
    }
  });
}

/**
 * Check if mock authentication should be used
 * 
 * @returns True if mock authentication is enabled
 */
export function shouldUseMockAuth(): boolean {
  const config = getDevModeConfig();
  const shouldUse = config.useMockAuth;
  console.log('shouldUseMockAuth:', shouldUse, 'config:', config);
  return shouldUse;
}