/**
 * Authentication Integration Tests
 * 
 * Tests the integration between the authentication system and the application.
 */

import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { getGitHubAccessToken } from '../auth-service';
import { hasPermission } from '../permission-middleware';
import { getUserRole } from '../role-service';
import { prisma } from '@/lib/db/prisma';
import { getGitHubClient } from '@/lib/github/github-api-factory';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/db/prisma');
jest.mock('@/lib/github/github-api-factory');

describe('Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GitHub Access Token', () => {
    it('should get GitHub access token from session', async () => {
      // Mock session with access token
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: 'github_access_token_123',
        user: { id: 'user-123' }
      });
      
      // Call the function
      const token = await getGitHubAccessToken();
      
      // Verify the token was returned
      expect(token).toBe('github_access_token_123');
    });

    it('should throw error when session is not available', async () => {
      // Mock session to return null
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      // Call the function and expect it to throw
      await expect(getGitHubAccessToken())
        .rejects
        .toThrow('GitHub access token not available');
    });

    it('should throw error when access token is not in session', async () => {
      // Mock session without access token
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' }
      });
      
      // Call the function and expect it to throw
      await expect(getGitHubAccessToken())
        .rejects
        .toThrow('GitHub access token not available');
    });
  });

  describe('Permission Middleware', () => {
    it('should allow access when user has permission', async () => {
      // Mock user with role
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        role: 'ADMIN'
      });
      
      // Mock role permissions
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: 'role-admin',
        name: 'ADMIN',
        permissions: {
          some: {
            name: 'view:analytics'
          }
        }
      });
      
      // Check permission
      const hasAccess = await hasPermission('user-123', 'view:analytics');
      
      // Verify access is granted
      expect(hasAccess).toBe(true);
    });

    it('should deny access when user does not have permission', async () => {
      // Mock user with role
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        role: 'USER'
      });
      
      // Mock role permissions
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: 'role-user',
        name: 'USER',
        permissions: {
          some: {
            name: 'view:dashboard'
          }
        }
      });
      
      // Check permission
      const hasAccess = await hasPermission('user-123', 'admin:settings');
      
      // Verify access is denied
      expect(hasAccess).toBe(false);
    });

    it('should deny access when user is not found', async () => {
      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Check permission
      const hasAccess = await hasPermission('non-existent-user', 'view:dashboard');
      
      // Verify access is denied
      expect(hasAccess).toBe(false);
    });
  });

  describe('Role Service', () => {
    it('should get user role', async () => {
      // Mock user with role
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        role: 'TEAM_LEAD'
      });
      
      // Get user role
      const role = await getUserRole('user-123');
      
      // Verify role is returned
      expect(role).toBe('TEAM_LEAD');
    });

    it('should return default role when user has no role', async () => {
      // Mock user without role
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        role: null
      });
      
      // Get user role
      const role = await getUserRole('user-123');
      
      // Verify default role is returned
      expect(role).toBe('USER');
    });

    it('should return default role when user is not found', async () => {
      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Get user role
      const role = await getUserRole('non-existent-user');
      
      // Verify default role is returned
      expect(role).toBe('USER');
    });
  });

  describe('GitHub Client Authentication', () => {
    it('should set access token in GitHub client', async () => {
      // Mock session with access token
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: 'github_access_token_123',
        user: { id: 'user-123' }
      });
      
      // Mock GitHub client
      const mockSetAccessToken = jest.fn();
      (getGitHubClient as jest.Mock).mockReturnValue({
        setAccessToken: mockSetAccessToken
      });
      
      // Get access token and set it in client
      const token = await getGitHubAccessToken();
      const client = getGitHubClient();
      client.setAccessToken(token);
      
      // Verify token was set in client
      expect(mockSetAccessToken).toHaveBeenCalledWith('github_access_token_123');
    });
  });
});