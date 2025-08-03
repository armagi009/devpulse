/**
 * Tests for mock authentication provider
 */

import { MockProvider, shouldUseMockAuth } from '../mock-auth-provider';
import { getDevModeConfig } from '../../config/dev-mode';

// Mock dependencies
jest.mock('../../config/dev-mode');

describe('Mock Authentication Provider', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('MockProvider', () => {
    it('should create a valid NextAuth provider configuration', () => {
      const provider = MockProvider();
      
      expect(provider).toBeDefined();
      expect(provider.id).toBe('mock-github');
      expect(provider.name).toBe('Mock GitHub');
      expect(provider.type).toBe('oauth');
      
      // Check that required OAuth endpoints are defined
      expect(provider.wellKnown).toBeDefined();
      expect(provider.authorization).toBeDefined();
      expect(provider.token).toBeDefined();
      expect(provider.userinfo).toBeDefined();
      
      // Check that profile function exists and works correctly
      expect(provider.profile).toBeDefined();
      expect(typeof provider.profile).toBe('function');
      
      // Test profile function
      const mockProfile = {
        id: 1001,
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://example.com/avatar.png'
      };
      
      const profileResult = provider.profile(mockProfile);
      expect(profileResult).toEqual({
        id: '1001',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.png'
      });
    });
  });

  describe('shouldUseMockAuth', () => {
    it('should return true when mock auth is enabled in config', () => {
      (getDevModeConfig as jest.Mock).mockReturnValue({
        useMockAuth: true,
        useMockApi: true,
        mockDataSet: 'default',
        showDevModeIndicator: true,
        logMockCalls: true,
        simulateErrors: false,
        errorProbability: 0.1
      });
      
      expect(shouldUseMockAuth()).toBe(true);
    });
    
    it('should return false when mock auth is disabled in config', () => {
      (getDevModeConfig as jest.Mock).mockReturnValue({
        useMockAuth: false,
        useMockApi: false,
        mockDataSet: 'default',
        showDevModeIndicator: true,
        logMockCalls: true,
        simulateErrors: false,
        errorProbability: 0.1
      });
      
      expect(shouldUseMockAuth()).toBe(false);
    });
  });
});