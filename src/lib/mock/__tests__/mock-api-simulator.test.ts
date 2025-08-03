/**
 * Tests for the mock-api-simulator module
 */

import {
  simulateLatency,
  shouldSimulateError,
  getRandomErrorStatusCode,
  generateErrorResponse,
  simulateApiCall,
  simulateProgressiveLoading,
  createPaginatedResponse,
  ApiSimulationConfig,
} from '../mock-api-simulator';

describe('mock-api-simulator', () => {
  // Mock the setTimeout function
  jest.useFakeTimers();
  
  describe('simulateLatency', () => {
    it('should resolve after the simulated latency', async () => {
      const config: ApiSimulationConfig = {
        simulateLatency: true,
        latency: {
          min: 100,
          max: 100, // Set min and max to the same value for predictable testing
        },
        simulateErrors: false,
        errorRate: 0,
        errorStatusCodes: [500],
        progressiveLoading: false,
        chunkSize: 10,
        logCalls: false,
      };
      
      const promise = simulateLatency(config);
      
      // Fast-forward time
      jest.advanceTimersByTime(100);
      
      await expect(promise).resolves.toBeUndefined();
    });
    
    it('should resolve immediately if simulateLatency is false', async () => {
      const config: ApiSimulationConfig = {
        simulateLatency: false,
        latency: {
          min: 100,
          max: 500,
        },
        simulateErrors: false,
        errorRate: 0,
        errorStatusCodes: [500],
        progressiveLoading: false,
        chunkSize: 10,
        logCalls: false,
      };
      
      await expect(simulateLatency(config)).resolves.toBeUndefined();
      
      // Ensure setTimeout was not called
      expect(setTimeout).not.toHaveBeenCalled();
    });
  });
  
  describe('shouldSimulateError', () => {
    it('should return false if simulateErrors is false', () => {
      const config: ApiSimulationConfig = {
        simulateLatency: true,
        latency: {
          min: 100,
          max: 500,
        },
        simulateErrors: false,
        errorRate: 1, // 100% error rate, but simulateErrors is false
        errorStatusCodes: [500],
        progressiveLoading: false,
        chunkSize: 10,
        logCalls: false,
      };
      
      expect(shouldSimulateError(config)).toBe(false);
    });
    
    it('should return true or false based on the error rate', () => {
      const config: ApiSimulationConfig = {
        simulateLatency: true,
        latency: {
          min: 100,
          max: 500,
        },
        simulateErrors: true,
        errorRate: 1, // 100% error rate
        errorStatusCodes: [500],
        progressiveLoading: false,
        chunkSize: 10,
        logCalls: false,
      };
      
      // Mock Math.random to always return 0.5
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5);
      
      expect(shouldSimulateError(config)).toBe(true);
      
      // Change error rate to 0.4 (40%)
      config.errorRate = 0.4;
      expect(shouldSimulateError(config)).toBe(false);
      
      // Restore Math.random
      Math.random = originalRandom;
    });
  });
  
  describe('getRandomErrorStatusCode', () => {
    it('should return a random error status code from the provided list', () => {
      const config: ApiSimulationConfig = {
        simulateLatency: true,
        latency: {
          min: 100,
          max: 500,
        },
        simulateErrors: true,
        errorRate: 0.1,
        errorStatusCodes: [400, 401, 403, 404, 500],
        progressiveLoading: false,
        chunkSize: 10,
        logCalls: false,
      };
      
      // Mock Math.random and Math.floor
      const originalRandom = Math.random;
      const originalFloor = Math.floor;
      
      Math.random = jest.fn().mockReturnValue(0.5);
      Math.floor = jest.fn().mockReturnValue(2); // Index 2 is 403
      
      expect(getRandomErrorStatusCode(config)).toBe(403);
      
      // Restore original functions
      Math.random = originalRandom;
      Math.floor = originalFloor;
    });
  });
  
  describe('generateErrorResponse', () => {
    it('should generate an error response with the correct structure', () => {
      const config: ApiSimulationConfig = {
        simulateLatency: true,
        latency: {
          min: 100,
          max: 500,
        },
        simulateErrors: true,
        errorRate: 0.1,
        errorStatusCodes: [404],
        progressiveLoading: false,
        chunkSize: 10,
        logCalls: false,
      };
      
      const response = generateErrorResponse('/api/test', config);
      
      expect(response).toEqual({
        status: 404,
        statusText: 'Not Found',
        error: 'Not Found',
        message: 'The requested resource could not be found.',
        path: '/api/test',
        timestamp: expect.any(String),
      });
    });
  });
  
  describe('simulateApiCall', () => {
    it('should resolve with the response data if no error is simulated', async () => {
      const config: ApiSimulationConfig = {
        simulateLatency: false, // Disable latency for testing
        latency: {
          min: 0,
          max: 0,
        },
        simulateErrors: false,
        errorRate: 0,
        errorStatusCodes: [500],
        progressiveLoading: false,
        chunkSize: 10,
        logCalls: false,
      };
      
      const responseData = { id: 1, name: 'Test' };
      
      await expect(simulateApiCall('/api/test', responseData, config)).resolves.toEqual(responseData);
    });
    
    it('should reject with an error if an error is simulated', async () => {
      const config: ApiSimulationConfig = {
        simulateLatency: false, // Disable latency for testing
        latency: {
          min: 0,
          max: 0,
        },
        simulateErrors: true,
        errorRate: 1, // 100% error rate
        errorStatusCodes: [500],
        progressiveLoading: false,
        chunkSize: 10,
        logCalls: false,
      };
      
      const responseData = { id: 1, name: 'Test' };
      
      await expect(simulateApiCall('/api/test', responseData, config)).rejects.toThrow();
    });
  });
  
  describe('simulateProgressiveLoading', () => {
    it('should return all data at once if progressiveLoading is false', async () => {
      const config: ApiSimulationConfig = {
        simulateLatency: false,
        latency: {
          min: 0,
          max: 0,
        },
        simulateErrors: false,
        errorRate: 0,
        errorStatusCodes: [500],
        progressiveLoading: false,
        chunkSize: 10,
        logCalls: false,
      };
      
      const data = [1, 2, 3, 4, 5];
      
      const loader = await simulateProgressiveLoading(data, config);
      const result = await loader.getNextChunk();
      
      expect(result.data).toEqual(data);
      expect(result.done).toBe(true);
      expect(loader.getTotalCount()).toBe(5);
    });
    
    it('should return data in chunks if progressiveLoading is true', async () => {
      const config: ApiSimulationConfig = {
        simulateLatency: false,
        latency: {
          min: 0,
          max: 0,
        },
        simulateErrors: false,
        errorRate: 0,
        errorStatusCodes: [500],
        progressiveLoading: true,
        chunkSize: 2,
        logCalls: false,
      };
      
      const data = [1, 2, 3, 4, 5];
      
      const loader = await simulateProgressiveLoading(data, config);
      
      // First chunk
      const chunk1 = await loader.getNextChunk();
      expect(chunk1.data).toEqual([1, 2]);
      expect(chunk1.done).toBe(false);
      
      // Second chunk
      const chunk2 = await loader.getNextChunk();
      expect(chunk2.data).toEqual([3, 4]);
      expect(chunk2.done).toBe(false);
      
      // Third chunk
      const chunk3 = await loader.getNextChunk();
      expect(chunk3.data).toEqual([5]);
      expect(chunk3.done).toBe(true);
      
      expect(loader.getTotalCount()).toBe(5);
    });
  });
  
  describe('createPaginatedResponse', () => {
    it('should create a paginated response with the correct structure', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      
      const response = createPaginatedResponse(data, 2, 5);
      
      expect(response).toEqual({
        data: [6, 7, 8, 9, 10],
        pagination: {
          page: 2,
          pageSize: 5,
          totalPages: 3,
          totalItems: 12,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      });
    });
    
    it('should handle the last page correctly', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      
      const response = createPaginatedResponse(data, 3, 5);
      
      expect(response).toEqual({
        data: [11, 12],
        pagination: {
          page: 3,
          pageSize: 5,
          totalPages: 3,
          totalItems: 12,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });
    });
    
    it('should handle empty data correctly', () => {
      const data: number[] = [];
      
      const response = createPaginatedResponse(data, 1, 5);
      
      expect(response).toEqual({
        data: [],
        pagination: {
          page: 1,
          pageSize: 5,
          totalPages: 0,
          totalItems: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });
});