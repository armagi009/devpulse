import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDevModeConfig, isDevMode, validateDevModeConfig } from '../dev-mode';

describe('Development Mode Configuration', () => {
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    // Reset environment variables before each test
    vi.resetModules();
    process.env = { ...originalEnv };
    
    // Clear environment variables related to dev mode
    delete process.env.NEXT_PUBLIC_USE_MOCK_AUTH;
    delete process.env.NEXT_PUBLIC_USE_MOCK_API;
    delete process.env.NEXT_PUBLIC_MOCK_DATA_SET;
    delete process.env.NEXT_PUBLIC_SHOW_DEV_MODE_INDICATOR;
    delete process.env.NEXT_PUBLIC_LOG_MOCK_CALLS;
    delete process.env.NODE_ENV;
  });
  
  afterEach(() => {
    // Restore original environment after tests
    process.env = originalEnv;
  });
  
  describe('getDevModeConfig', () => {
    it('should return default values when no environment variables are set', () => {
      const config = getDevModeConfig();
      
      expect(config.useMockAuth).toBe(false);
      expect(config.useMockApi).toBe(false);
      expect(config.mockDataSet).toBe('default');
      expect(config.showDevModeIndicator).toBe(true);
      expect(config.logMockCalls).toBe(true);
    });
    
    it('should use environment variables when set', () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
      process.env.NEXT_PUBLIC_USE_MOCK_API = 'true';
      process.env.NEXT_PUBLIC_MOCK_DATA_SET = 'test-data';
      process.env.NEXT_PUBLIC_SHOW_DEV_MODE_INDICATOR = 'false';
      process.env.NEXT_PUBLIC_LOG_MOCK_CALLS = 'false';
      
      const config = getDevModeConfig();
      
      expect(config.useMockAuth).toBe(true);
      expect(config.useMockApi).toBe(true);
      expect(config.mockDataSet).toBe('test-data');
      expect(config.showDevModeIndicator).toBe(false);
      expect(config.logMockCalls).toBe(false);
    });
  });
  
  describe('isDevMode', () => {
    it('should return false when mock auth and mock API are disabled', () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'false';
      process.env.NEXT_PUBLIC_USE_MOCK_API = 'false';
      
      expect(isDevMode()).toBe(false);
    });
    
    it('should return true when mock auth is enabled', () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
      process.env.NEXT_PUBLIC_USE_MOCK_API = 'false';
      
      expect(isDevMode()).toBe(true);
    });
    
    it('should return true when mock API is enabled', () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'false';
      process.env.NEXT_PUBLIC_USE_MOCK_API = 'true';
      
      expect(isDevMode()).toBe(true);
    });
    
    it('should return true when both mock auth and mock API are enabled', () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
      process.env.NEXT_PUBLIC_USE_MOCK_API = 'true';
      
      expect(isDevMode()).toBe(true);
    });
  });
  
  describe('validateDevModeConfig', () => {
    it('should return no errors for consistent configuration', () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
      process.env.NEXT_PUBLIC_USE_MOCK_API = 'true';
      
      const errors = validateDevModeConfig();
      
      expect(errors).toHaveLength(0);
    });
    
    it('should warn when mock auth is enabled but mock API is disabled', () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
      process.env.NEXT_PUBLIC_USE_MOCK_API = 'false';
      
      const errors = validateDevModeConfig();
      
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Mock authentication is enabled but mock API is disabled');
    });
    
    it('should warn when mock API is enabled but mock auth is disabled', () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'false';
      process.env.NEXT_PUBLIC_USE_MOCK_API = 'true';
      
      const errors = validateDevModeConfig();
      
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Mock API is enabled but mock authentication is disabled');
    });
    
    it('should warn when mock mode is enabled in production', () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
      process.env.NEXT_PUBLIC_USE_MOCK_API = 'true';
      process.env.NODE_ENV = 'production';
      
      const errors = validateDevModeConfig();
      
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('WARNING: Mock mode is enabled in a production environment');
    });
  });
});