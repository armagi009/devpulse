/**
 * Tests for mock error simulation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  MockErrorType, 
  shouldSimulateError, 
  getRandomErrorType, 
  simulateError, 
  simulateRandomError,
  executeWithErrorSimulation,
  getErrorSimulationConfig
} from '../mock-errors';
import { AppError, ErrorCode } from '@/lib/types/api';

describe('Mock Error Simulation', () => {
  // Mock Math.random for deterministic tests
  const originalRandom = Math.random;
  
  beforeEach(() => {
    // Reset Math.random mock
    Math.random = originalRandom;
  });
  
  describe('shouldSimulateError', () => {
    it('should return false when error simulation is disabled', () => {
      const config = {
        enabled: false,
        probability: 1.0, // 100% chance, but disabled
        types: [MockErrorType.NETWORK_ERROR]
      };
      
      expect(shouldSimulateError(config)).toBe(false);
    });
    
    it('should return true when random value is less than probability', () => {
      Math.random = vi.fn().mockReturnValue(0.05);
      
      const config = {
        enabled: true,
        probability: 0.1, // 10% chance
        types: [MockErrorType.NETWORK_ERROR]
      };
      
      expect(shouldSimulateError(config)).toBe(true);
    });
    
    it('should return false when random value is greater than probability', () => {
      Math.random = vi.fn().mockReturnValue(0.2);
      
      const config = {
        enabled: true,
        probability: 0.1, // 10% chance
        types: [MockErrorType.NETWORK_ERROR]
      };
      
      expect(shouldSimulateError(config)).toBe(false);
    });
  });
  
  describe('getRandomErrorType', () => {
    it('should return a random error type from the configured types', () => {
      Math.random = vi.fn().mockReturnValue(0.1); // Will select first item
      
      const config = {
        enabled: true,
        probability: 0.5,
        types: [
          MockErrorType.NETWORK_ERROR,
          MockErrorType.RATE_LIMIT_EXCEEDED
        ]
      };
      
      expect(getRandomErrorType(config)).toBe(MockErrorType.NETWORK_ERROR);
    });
    
    it('should handle a different random value', () => {
      Math.random = vi.fn().mockReturnValue(0.9); // Will select second item
      
      const config = {
        enabled: true,
        probability: 0.5,
        types: [
          MockErrorType.NETWORK_ERROR,
          MockErrorType.RATE_LIMIT_EXCEEDED
        ]
      };
      
      expect(getRandomErrorType(config)).toBe(MockErrorType.RATE_LIMIT_EXCEEDED);
    });
  });
  
  describe('simulateError', () => {
    it('should throw an AppError with the correct code for RATE_LIMIT_EXCEEDED', () => {
      try {
        simulateError(MockErrorType.RATE_LIMIT_EXCEEDED);
        fail('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
        expect((error as AppError).status).toBe(429);
      }
    });
    
    it('should throw an AppError with the correct code for NETWORK_ERROR', () => {
      try {
        simulateError(MockErrorType.NETWORK_ERROR);
        fail('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCode.NETWORK_ERROR);
        expect((error as AppError).status).toBe(503);
      }
    });
    
    it('should throw an AppError with the correct code for AUTHENTICATION_ERROR', () => {
      try {
        simulateError(MockErrorType.AUTHENTICATION_ERROR);
        fail('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCode.UNAUTHORIZED);
        expect((error as AppError).status).toBe(401);
      }
    });
  });
  
  describe('simulateRandomError', () => {
    it('should not throw an error when simulation is disabled', () => {
      const config = {
        enabled: false,
        probability: 1.0, // 100% chance, but disabled
        types: [MockErrorType.NETWORK_ERROR]
      };
      
      expect(() => simulateRandomError(config)).not.toThrow();
    });
    
    it('should not throw an error when random value is greater than probability', () => {
      Math.random = vi.fn().mockReturnValue(0.2);
      
      const config = {
        enabled: true,
        probability: 0.1, // 10% chance
        types: [MockErrorType.NETWORK_ERROR]
      };
      
      expect(() => simulateRandomError(config)).not.toThrow();
    });
    
    it('should throw an error when conditions are met', () => {
      Math.random = vi.fn().mockReturnValue(0.05); // Less than probability
      
      const config = {
        enabled: true,
        probability: 0.1, // 10% chance
        types: [MockErrorType.NETWORK_ERROR]
      };
      
      expect(() => simulateRandomError(config)).toThrow();
    });
  });
  
  describe('executeWithErrorSimulation', () => {
    it('should execute the function when no error is simulated', async () => {
      Math.random = vi.fn().mockReturnValue(0.2); // Greater than probability
      
      const config = {
        enabled: true,
        probability: 0.1, // 10% chance
        types: [MockErrorType.NETWORK_ERROR]
      };
      
      const fn = vi.fn().mockResolvedValue('success');
      const result = await executeWithErrorSimulation(fn, config);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });
    
    it('should throw an error when error simulation is triggered', async () => {
      Math.random = vi.fn().mockReturnValue(0.05); // Less than probability
      
      const config = {
        enabled: true,
        probability: 0.1, // 10% chance
        types: [MockErrorType.NETWORK_ERROR],
        minDelay: 0,
        maxDelay: 1
      };
      
      const fn = vi.fn().mockResolvedValue('success');
      
      await expect(executeWithErrorSimulation(fn, config)).rejects.toThrow();
      expect(fn).not.toHaveBeenCalled();
    });
  });
  
  describe('getErrorSimulationConfig', () => {
    const originalEnv = process.env;
    
    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });
    
    afterEach(() => {
      process.env = originalEnv;
    });
    
    it('should return default config when no environment variables are set', () => {
      const config = getErrorSimulationConfig();
      
      expect(config.enabled).toBe(false);
      expect(config.probability).toBe(0.1);
      expect(config.types.length).toBeGreaterThan(0);
    });
    
    it('should use environment variables when provided', () => {
      process.env.NEXT_PUBLIC_MOCK_ERROR_SIMULATION = 'true';
      process.env.NEXT_PUBLIC_MOCK_ERROR_PROBABILITY = '0.5';
      process.env.NEXT_PUBLIC_MOCK_ERROR_TYPES = 'NETWORK_ERROR,TIMEOUT';
      process.env.NEXT_PUBLIC_MOCK_ERROR_MIN_DELAY = '100';
      process.env.NEXT_PUBLIC_MOCK_ERROR_MAX_DELAY = '2000';
      
      const config = getErrorSimulationConfig();
      
      expect(config.enabled).toBe(true);
      expect(config.probability).toBe(0.5);
      expect(config.types).toContain(MockErrorType.NETWORK_ERROR);
      expect(config.types).toContain(MockErrorType.TIMEOUT);
      expect(config.minDelay).toBe(100);
      expect(config.maxDelay).toBe(2000);
    });
  });
});