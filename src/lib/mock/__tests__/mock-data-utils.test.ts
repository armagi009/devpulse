/**
 * Tests for mock data utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isUsingMockData, getCurrentMockDataSet, logMockDataUsage } from '../mock-data-utils';
import { getDevModeConfig } from '../../config/dev-mode';

// Mock dependencies
vi.mock('../../config/dev-mode');

describe('Mock Data Utilities', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock console.info
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isUsingMockData', () => {
    it('should return true when mock API is enabled', () => {
      vi.mocked(getDevModeConfig).mockReturnValue({
        useMockAuth: true,
        useMockApi: true,
        mockDataSet: 'default',
        showDevModeIndicator: true,
        logMockCalls: true,
        simulateErrors: false,
        errorProbability: 0.1
      });
      
      expect(isUsingMockData()).toBe(true);
    });
    
    it('should return false when mock API is disabled', () => {
      vi.mocked(getDevModeConfig).mockReturnValue({
        useMockAuth: false,
        useMockApi: false,
        mockDataSet: 'default',
        showDevModeIndicator: true,
        logMockCalls: true,
        simulateErrors: false,
        errorProbability: 0.1
      });
      
      expect(isUsingMockData()).toBe(false);
    });
  });

  describe('getCurrentMockDataSet', () => {
    it('should return the current mock data set name', () => {
      vi.mocked(getDevModeConfig).mockReturnValue({
        useMockAuth: true,
        useMockApi: true,
        mockDataSet: 'test-dataset',
        showDevModeIndicator: true,
        logMockCalls: true,
        simulateErrors: false,
        errorProbability: 0.1
      });
      
      expect(getCurrentMockDataSet()).toBe('test-dataset');
    });
  });

  describe('logMockDataUsage', () => {
    it('should log when mock API is enabled and logging is enabled', () => {
      // Mock process.env.NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      vi.mocked(getDevModeConfig).mockReturnValue({
        useMockAuth: true,
        useMockApi: true,
        mockDataSet: 'test-dataset',
        showDevModeIndicator: true,
        logMockCalls: true,
        simulateErrors: false,
        errorProbability: 0.1
      });
      
      logMockDataUsage('TestComponent');
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('TestComponent')
      );
      
      // Restore process.env.NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
    
    it('should not log when mock API is disabled', () => {
      vi.mocked(getDevModeConfig).mockReturnValue({
        useMockAuth: false,
        useMockApi: false,
        mockDataSet: 'test-dataset',
        showDevModeIndicator: true,
        logMockCalls: true,
        simulateErrors: false,
        errorProbability: 0.1
      });
      
      logMockDataUsage('TestComponent');
      
      expect(console.info).not.toHaveBeenCalled();
    });
    
    it('should not log when logging is disabled', () => {
      // Mock process.env.NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      vi.mocked(getDevModeConfig).mockReturnValue({
        useMockAuth: true,
        useMockApi: true,
        mockDataSet: 'test-dataset',
        showDevModeIndicator: true,
        logMockCalls: false,
        simulateErrors: false,
        errorProbability: 0.1
      });
      
      logMockDataUsage('TestComponent');
      
      expect(console.info).not.toHaveBeenCalled();
      
      // Restore process.env.NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
    
    it('should not log in production environment', () => {
      // Mock process.env.NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      vi.mocked(getDevModeConfig).mockReturnValue({
        useMockAuth: true,
        useMockApi: true,
        mockDataSet: 'test-dataset',
        showDevModeIndicator: true,
        logMockCalls: true,
        simulateErrors: false,
        errorProbability: 0.1
      });
      
      logMockDataUsage('TestComponent');
      
      expect(console.info).not.toHaveBeenCalled();
      
      // Restore process.env.NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});