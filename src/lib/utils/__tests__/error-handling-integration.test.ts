/**
 * Error Handling Integration Tests
 * 
 * Tests the integration between the error handling system and the application.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError, ErrorCode } from '@/lib/types/api';
import { logError, createAppError, handleApiResponse } from '../error-handler';
import { getCircuitBreaker } from '../circuit-breaker';

// Mock fetch for API response testing
global.fetch = jest.fn();

describe('Error Handling Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Spy on console.error to verify logging
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Error Logging', () => {
    it('should log AppError correctly', () => {
      // Create an AppError
      const error = new AppError(
        ErrorCode.GITHUB_API_ERROR,
        'GitHub API rate limit exceeded',
        429
      );
      
      // Log the error
      logError(error, { repositoryId: 'repo-123' }, 'GitHubClient');
      
      // Verify console.error was called with the correct arguments
      expect(console.error).toHaveBeenCalledWith('Error:', 'GitHub API rate limit exceeded');
      expect(console.error).toHaveBeenCalledWith('Error code:', 'GITHUB_API_ERROR');
      expect(console.error).toHaveBeenCalledWith('Component:', 'GitHubClient');
      expect(console.error).toHaveBeenCalledWith('Context:', { repositoryId: 'repo-123' });
    });

    it('should log standard Error correctly', () => {
      // Create a standard Error
      const error = new Error('Network connection failed');
      
      // Log the error
      logError(error);
      
      // Verify console.error was called with the correct arguments
      expect(console.error).toHaveBeenCalledWith('Error:', 'Network connection failed');
      expect(console.error).toHaveBeenCalledWith('Stack trace:', expect.any(String));
    });

    it('should log string error correctly', () => {
      // Log a string error
      logError('Something went wrong');
      
      // Verify console.error was called with the correct arguments
      expect(console.error).toHaveBeenCalledWith('Error:', 'Something went wrong');
    });
  });

  describe('Error Creation', () => {
    it('should create AppError from standard Error with network message', () => {
      // Create a standard Error with network-related message
      const error = new Error('Failed to fetch data: network error');
      
      // Create AppError from it
      const appError = createAppError(error);
      
      // Verify the AppError has the correct properties
      expect(appError).toBeInstanceOf(AppError);
      expect(appError.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(appError.status).toBe(503);
    });

    it('should create AppError from standard Error with timeout message', () => {
      // Create a standard Error with timeout-related message
      const error = new Error('Request timed out after 30 seconds');
      
      // Create AppError from it
      const appError = createAppError(error);
      
      // Verify the AppError has the correct properties
      expect(appError).toBeInstanceOf(AppError);
      expect(appError.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
      expect(appError.status).toBe(503);
    });

    it('should create AppError from standard Error with not found message', () => {
      // Create a standard Error with not found message
      const error = new Error('Resource not found: 404');
      
      // Create AppError from it
      const appError = createAppError(error);
      
      // Verify the AppError has the correct properties
      expect(appError).toBeInstanceOf(AppError);
      expect(appError.code).toBe(ErrorCode.NOT_FOUND);
      expect(appError.status).toBe(404);
    });

    it('should create generic AppError from unknown error type', () => {
      // Create AppError from unknown error type
      const appError = createAppError(null);
      
      // Verify the AppError has the correct properties
      expect(appError).toBeInstanceOf(AppError);
      expect(appError.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(appError.status).toBe(500);
    });
  });

  describe('API Response Handling', () => {
    it('should handle successful API response', async () => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test data' })
      };
      
      // Handle the response
      const result = await handleApiResponse(mockResponse as unknown as Response);
      
      // Verify the result
      expect(result).toEqual({ data: 'test data' });
    });

    it('should handle API error with error object', async () => {
      // Mock error response with error object
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid parameters',
            details: { param: 'id' }
          }
        })
      };
      
      // Handle the response and expect it to throw
      await expect(handleApiResponse(mockResponse as unknown as Response))
        .rejects
        .toThrow(AppError);
      
      // Try/catch to verify the error properties
      try {
        await handleApiResponse(mockResponse as unknown as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCode.BAD_REQUEST);
        expect((error as AppError).message).toBe('Invalid parameters');
        expect((error as AppError).status).toBe(400);
        expect((error as AppError).details).toEqual({ param: 'id' });
      }
    });

    it('should handle API error without error object', async () => {
      // Mock error response without error object
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };
      
      // Handle the response and expect it to throw
      await expect(handleApiResponse(mockResponse as unknown as Response))
        .rejects
        .toThrow(AppError);
      
      // Try/catch to verify the error properties
      try {
        await handleApiResponse(mockResponse as unknown as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
        expect((error as AppError).status).toBe(404);
      }
    });
  });

  describe('Circuit Breaker', () => {
    it('should execute function when circuit is closed', async () => {
      // Get circuit breaker
      const circuitBreaker = getCircuitBreaker('test-service');
      
      // Define test function
      const testFunction = jest.fn().mockResolvedValue('success');
      
      // Execute function through circuit breaker
      const result = await circuitBreaker.execute(testFunction);
      
      // Verify function was called and result is correct
      expect(testFunction).toHaveBeenCalled();
      expect(result).toBe('success');
    });

    it('should track failures and open circuit after threshold', async () => {
      // Get circuit breaker with low threshold for testing
      const circuitBreaker = getCircuitBreaker('failure-service', {
        failureThreshold: 2,
        resetTimeout: 1000
      });
      
      // Define failing function
      const failingFunction = jest.fn().mockRejectedValue(new Error('Service failed'));
      
      // Execute failing function multiple times
      try { await circuitBreaker.execute(failingFunction); } catch (e) {}
      try { await circuitBreaker.execute(failingFunction); } catch (e) {}
      
      // Third call should throw circuit open error without calling the function
      failingFunction.mockClear();
      await expect(circuitBreaker.execute(failingFunction))
        .rejects
        .toThrow('Circuit breaker is open for service: failure-service');
      
      // Verify function was not called on third attempt
      expect(failingFunction).not.toHaveBeenCalled();
    });

    it('should reset circuit after timeout', async () => {
      // Get circuit breaker with short reset timeout for testing
      const circuitBreaker = getCircuitBreaker('reset-service', {
        failureThreshold: 1,
        resetTimeout: 100 // Very short for testing
      });
      
      // Define failing function
      const failingFunction = jest.fn().mockRejectedValue(new Error('Service failed'));
      
      // Execute failing function to open circuit
      try { await circuitBreaker.execute(failingFunction); } catch (e) {}
      
      // Verify circuit is open
      await expect(circuitBreaker.execute(failingFunction))
        .rejects
        .toThrow('Circuit breaker is open for service: reset-service');
      
      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Define successful function
      const successFunction = jest.fn().mockResolvedValue('success');
      
      // Execute successful function after reset
      const result = await circuitBreaker.execute(successFunction);
      
      // Verify function was called and result is correct
      expect(successFunction).toHaveBeenCalled();
      expect(result).toBe('success');
    });
  });
});