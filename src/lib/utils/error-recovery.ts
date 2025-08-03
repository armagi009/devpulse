/**
 * Error Recovery Utilities
 * Provides helper functions for common error recovery patterns
 */

import { AppError, ErrorCode } from '@/lib/types/api';

interface RecoveryStrategy {
  canRecover: (error: Error | AppError | unknown) => boolean;
  recover: () => Promise<void>;
  message: string;
}

/**
 * Get recovery suggestions based on error type
 */
export function getRecoverySuggestion(error: Error | AppError | unknown): string {
  // Handle AppError type
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const appError = error as AppError;
    
    switch (appError.code) {
      case ErrorCode.UNAUTHORIZED:
        return 'Try signing in again or contact support if the problem persists.';
      case ErrorCode.FORBIDDEN:
        return 'Contact your administrator to request access to this feature.';
      case ErrorCode.RECORD_NOT_FOUND:
      case ErrorCode.NOT_FOUND:
        return 'Check that the resource exists or try navigating back.';
      case ErrorCode.RATE_LIMITED:
      case ErrorCode.RATE_LIMIT_EXCEEDED:
      case ErrorCode.TOO_MANY_REQUESTS:
        return 'Wait a moment before trying again.';
      case ErrorCode.SERVICE_UNAVAILABLE:
      case ErrorCode.AI_SERVICE_UNAVAILABLE:
        return 'This is likely a temporary issue. Please try again in a few minutes.';
      case ErrorCode.NETWORK_ERROR:
        return 'Check your internet connection and try again.';
      case ErrorCode.GITHUB_API_ERROR:
        return 'This could be due to GitHub service issues or authentication problems.';
      case ErrorCode.DATABASE_ERROR:
        return 'This is likely a temporary issue. Please try again in a few minutes.';
      case ErrorCode.VALIDATION_ERROR:
        return 'Please check your input and try again.';
      default:
        return 'Please try again or contact support if the problem persists.';
    }
  }
  
  // Handle standard Error type
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Check your internet connection and try again.';
    }
    
    // Check for timeout errors
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return 'This could be due to slow internet or high server load. Try again later.';
    }
    
    return 'Please try again or contact support if the problem persists.';
  }
  
  // Handle unknown error types
  return 'Please try again or contact support if the problem persists.';
}

/**
 * Check if an error is likely recoverable with a retry
 */
export function isRetryableError(error: Error | AppError | unknown): boolean {
  // Handle AppError type
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const appError = error as AppError;
    
    // These error types are typically recoverable with a retry
    const retryableCodes = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorCode.AI_SERVICE_UNAVAILABLE,
      ErrorCode.RATE_LIMITED,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCode.TOO_MANY_REQUESTS,
      ErrorCode.GITHUB_API_ERROR
    ];
    
    return retryableCodes.includes(appError.code);
  }
  
  // Handle standard Error type
  if (error instanceof Error) {
    // Network errors are typically recoverable
    if (error.message.includes('fetch') || 
        error.message.includes('network') ||
        error.message.includes('timeout') || 
        error.message.includes('timed out')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if an error requires authentication to recover
 */
export function isAuthenticationError(error: Error | AppError | unknown): boolean {
  // Handle AppError type
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const appError = error as AppError;
    
    return appError.code === ErrorCode.UNAUTHORIZED || 
           appError.code === ErrorCode.INVALID_TOKEN;
  }
  
  // Handle standard Error type
  if (error instanceof Error) {
    return error.message.includes('unauthorized') || 
           error.message.includes('unauthenticated') ||
           error.message.includes('auth') ||
           error.message.includes('401');
  }
  
  return false;
}

/**
 * Check if an error is related to permissions
 */
export function isPermissionError(error: Error | AppError | unknown): boolean {
  // Handle AppError type
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const appError = error as AppError;
    
    return appError.code === ErrorCode.FORBIDDEN;
  }
  
  // Handle standard Error type
  if (error instanceof Error) {
    return error.message.includes('forbidden') || 
           error.message.includes('permission') ||
           error.message.includes('access denied') ||
           error.message.includes('403');
  }
  
  return false;
}

/**
 * Get appropriate recovery action for an error
 */
export function getRecoveryAction(error: Error | AppError | unknown): (() => void) | null {
  if (isAuthenticationError(error)) {
    return () => window.location.href = '/auth/signin';
  }
  
  if (isPermissionError(error)) {
    return () => window.history.back();
  }
  
  if (isRetryableError(error)) {
    return () => window.location.reload();
  }
  
  return null;
}

/**
 * Create a recovery strategy for common error patterns
 */
export function createRecoveryStrategy(strategies: RecoveryStrategy[]): (error: Error | AppError | unknown) => Promise<boolean> {
  return async (error: Error | AppError | unknown) => {
    for (const strategy of strategies) {
      if (strategy.canRecover(error)) {
        try {
          await strategy.recover();
          return true;
        } catch (recoveryError) {
          console.error('Recovery strategy failed:', recoveryError);
        }
      }
    }
    
    return false;
  };
}