/**
 * Mock Error Simulation
 * 
 * This module provides functionality for simulating various error scenarios
 * in the mock API client. It allows configuring error types, probabilities,
 * and simulation behavior.
 * 
 * Implementation for Requirement 2.6:
 * - Simulate API rate limits and errors to test error handling
 */

import { AppError, ErrorCode } from '@/lib/types/api';

/**
 * Types of errors that can be simulated
 */
export enum MockErrorType {
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
}

/**
 * Configuration for error simulation
 */
export interface MockErrorConfig {
  /** Whether error simulation is enabled */
  enabled: boolean;
  
  /** Probability of an error occurring (0-1) */
  probability: number;
  
  /** Types of errors to simulate */
  types: MockErrorType[];
  
  /** Minimum delay in ms for simulated timeouts */
  minDelay?: number;
  
  /** Maximum delay in ms for simulated timeouts */
  maxDelay?: number;
}

/**
 * Default error simulation configuration
 */
const DEFAULT_ERROR_CONFIG: MockErrorConfig = {
  enabled: false,
  probability: 0.1, // 10% chance of error
  types: [
    MockErrorType.RATE_LIMIT_EXCEEDED,
    MockErrorType.NETWORK_ERROR,
    MockErrorType.SERVER_ERROR,
    MockErrorType.TIMEOUT,
  ],
  minDelay: 500,
  maxDelay: 3000,
};

/**
 * Get error simulation configuration from environment variables
 */
export function getErrorSimulationConfig(): MockErrorConfig {
  return {
    enabled: process.env.NEXT_PUBLIC_MOCK_ERROR_SIMULATION === 'true',
    probability: parseFloat(process.env.NEXT_PUBLIC_MOCK_ERROR_PROBABILITY || '0.1'),
    types: parseErrorTypes(process.env.NEXT_PUBLIC_MOCK_ERROR_TYPES),
    minDelay: parseInt(process.env.NEXT_PUBLIC_MOCK_ERROR_MIN_DELAY || '500', 10),
    maxDelay: parseInt(process.env.NEXT_PUBLIC_MOCK_ERROR_MAX_DELAY || '3000', 10),
  };
}

/**
 * Parse error types from environment variable
 */
function parseErrorTypes(typesString?: string): MockErrorType[] {
  if (!typesString) {
    return DEFAULT_ERROR_CONFIG.types;
  }
  
  try {
    const types = typesString.split(',').map(type => type.trim().toUpperCase());
    return types
      .filter(type => Object.values(MockErrorType).includes(type as MockErrorType))
      .map(type => type as MockErrorType);
  } catch (error) {
    console.error('Error parsing mock error types:', error);
    return DEFAULT_ERROR_CONFIG.types;
  }
}

/**
 * Check if an error should be simulated based on configuration
 */
export function shouldSimulateError(config: MockErrorConfig = getErrorSimulationConfig()): boolean {
  if (!config.enabled) return false;
  return Math.random() < config.probability;
}

/**
 * Get a random error type from the configured types
 */
export function getRandomErrorType(config: MockErrorConfig = getErrorSimulationConfig()): MockErrorType {
  const types = config.types.length > 0 ? config.types : DEFAULT_ERROR_CONFIG.types;
  const index = Math.floor(Math.random() * types.length);
  return types[index];
}

/**
 * Simulate a random delay within the configured range
 */
export async function simulateRandomDelay(config: MockErrorConfig = getErrorSimulationConfig()): Promise<void> {
  const minDelay = config.minDelay || DEFAULT_ERROR_CONFIG.minDelay || 0;
  const maxDelay = config.maxDelay || DEFAULT_ERROR_CONFIG.maxDelay || 1000;
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Simulate an error of the specified type
 */
export function simulateError(type: MockErrorType): never {
  switch (type) {
    case MockErrorType.RATE_LIMIT_EXCEEDED:
      throw new AppError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'API rate limit exceeded. Please try again later.',
        429
      );
      
    case MockErrorType.NETWORK_ERROR:
      throw new AppError(
        ErrorCode.NETWORK_ERROR,
        'Network error occurred. Please check your connection.',
        503
      );
      
    case MockErrorType.AUTHENTICATION_ERROR:
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'Authentication failed. Please sign in again.',
        401
      );
      
    case MockErrorType.NOT_FOUND:
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'Resource not found.',
        404
      );
      
    case MockErrorType.SERVER_ERROR:
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Server error occurred. Please try again later.',
        500
      );
      
    case MockErrorType.TIMEOUT:
      throw new AppError(
        ErrorCode.SERVICE_UNAVAILABLE,
        'Request timed out. Please try again later.',
        503
      );
  }
}

/**
 * Simulate a random error based on configuration
 */
export function simulateRandomError(config: MockErrorConfig = getErrorSimulationConfig()): void {
  if (shouldSimulateError(config)) {
    const errorType = getRandomErrorType(config);
    simulateError(errorType);
  }
}

/**
 * Wrapper function to execute a function with error simulation
 */
export async function executeWithErrorSimulation<T>(
  fn: () => Promise<T>,
  config: MockErrorConfig = getErrorSimulationConfig()
): Promise<T> {
  // Simulate random delay if enabled
  if (config.enabled) {
    await simulateRandomDelay(config);
  }
  
  // Simulate random error if probability check passes
  simulateRandomError(config);
  
  // If no error was simulated, execute the function
  return fn();
}