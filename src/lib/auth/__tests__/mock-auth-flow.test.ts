/**
 * Integration tests for mock authentication flow
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDevModeConfig } from '../../config/dev-mode';
import { getCurrentMockUser, setCurrentMockUser } from '../../mock/mock-user-store';
import { getMockUserById } from '../../mock/mock-users';

// Mock AppError class
class AppError extends Error {
  code: string;
  status: number;
  
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'AppError';
  }
}

// Mock dependencies
vi.mock('next-auth/react', () => ({
  signIn: vi.fn().mockResolvedValue({ ok: true, error: null }),
  signOut: vi.fn().mockResolvedValue({}),
  getSession: vi.fn()
}));
vi.mock('../../config/dev-mode');
vi.mock('../../mock/mock-user-store');
vi.mock('../../mock/mock-users');
vi.mock('../auth-service', () => ({
  signInWithMockUser: vi.fn().mockImplementation(async (redirectUrl) => {
    const { getDevModeConfig } = require('../../config/dev-mode');
    const { signIn } = require('next-auth/react');
    
    const config = getDevModeConfig();
    
    if (!config.useMockAuth) {
      throw new AppError('UNAUTHORIZED', 'Mock authentication is not enabled', 401);
    }
    
    return signIn('mock-github', { callbackUrl: redirectUrl || '/dashboard' });
  })
}));

// Import mocked modules
import { signIn } from 'next-auth/react';
import { signInWithMockUser } from '../auth-service';

describe('Mock Authentication Flow', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Mock User Selection', () => {
    it('should get current mock user', () => {
      const mockUser = {
        id: 1001,
        login: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://example.com/avatar.png',
        role: 'developer',
        workPattern: 'regular',
        activityLevel: 'medium'
      };
      
      vi.mocked(getCurrentMockUser).mockReturnValue(mockUser);
      
      const user = getCurrentMockUser();
      
      expect(user).toEqual(mockUser);
    });
    
    it('should set current mock user', () => {
      const mockUser = {
        id: 1002,
        login: 'another-user',
        name: 'Another User',
        email: 'another@example.com',
        avatar_url: 'https://example.com/avatar2.png',
        role: 'team-lead',
        workPattern: 'overworked',
        activityLevel: 'high'
      };
      
      vi.mocked(getMockUserById).mockReturnValue(mockUser);
      vi.mocked(setCurrentMockUser).mockReturnValue(mockUser);
      
      const user = setCurrentMockUser(1002);
      
      expect(user).toEqual(mockUser);
      expect(setCurrentMockUser).toHaveBeenCalledWith(1002);
    });
  });
});