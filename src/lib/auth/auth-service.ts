/**
 * Authentication Service
 * Handles authentication-related operations
 */

import { signIn, signOut, getSession } from 'next-auth/react';
import { AppError, ErrorCode } from '@/lib/types/api';
import { getDevModeConfig } from '@/lib/config/dev-mode';
import { storeToken, getToken, deleteToken } from './secure-token-storage';

/**
 * Sign in with GitHub
 */
export async function signInWithGitHub(redirectUrl?: string): Promise<void> {
  try {
    await signIn('github', { callbackUrl: redirectUrl || '/dashboard' });
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    throw new AppError(
      ErrorCode.UNAUTHORIZED,
      'Failed to sign in with GitHub',
      401
    );
  }
}

/**
 * Sign in with mock user
 */
export async function signInWithMockUser(redirectUrl?: string): Promise<void> {
  try {
    // Check if mock auth is enabled
    const { useMockAuth } = getDevModeConfig();
    
    if (!useMockAuth) {
      console.error('Mock authentication is not enabled');
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'Mock authentication is not enabled',
        401
      );
    }
    
    await signIn('mock-github', { callbackUrl: redirectUrl || '/dashboard' });
  } catch (error) {
    console.error('Mock sign-in error:', error);
    throw new AppError(
      ErrorCode.UNAUTHORIZED,
      'Failed to sign in with mock user',
      401
    );
  }
}

/**
 * Sign out
 */
export async function signOutUser(redirectUrl?: string): Promise<void> {
  try {
    const session = await getSession();
    
    // If user is authenticated, delete their tokens
    if (session?.user?.id) {
      try {
        // Delete GitHub token
        await deleteToken(session.user.id, 'github');
        
        // Delete any other tokens
        await deleteToken(session.user.id, 'openai');
      } catch (tokenError) {
        console.error('Error deleting tokens during sign-out:', tokenError);
        // Continue with sign-out even if token deletion fails
      }
    }
    
    await signOut({ callbackUrl: redirectUrl || '/' });
  } catch (error) {
    console.error('Sign-out error:', error);
    throw new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Failed to sign out',
      500
    );
  }
}

/**
 * Get GitHub access token from secure storage
 */
export async function getGitHubAccessToken(): Promise<string> {
  // Check if we're in mock mode
  const { useMockAuth } = getDevModeConfig();
  if (useMockAuth) {
    // In mock mode, return a fake token
    console.log('Using mock GitHub access token');
    return 'mock_github_access_token_for_development';
  }
  
  const session = await getSession();
  
  if (!session?.user?.id) {
    throw new AppError(
      ErrorCode.UNAUTHORIZED,
      'User not authenticated',
      401
    );
  }
  
  // Try to get token from secure storage first
  const storedToken = await getToken(session.user.id, 'github');
  
  if (storedToken) {
    return storedToken;
  }
  
  // Fall back to session token if available
  if (session.accessToken) {
    // Store the token for future use
    await storeToken(session.user.id, 'github', session.accessToken);
    return session.accessToken;
  }
  
  throw new AppError(
    ErrorCode.UNAUTHORIZED,
    'No GitHub access token available',
    401
  );
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await getSession();
  
  if (!session?.user?.id) {
    throw new AppError(
      ErrorCode.UNAUTHORIZED,
      'User not authenticated',
      401
    );
  }
  
  return session.user.id;
}