/**
 * Error Handler Utility
 * Provides centralized error handling and logging functionality
 */

import { AppError, ErrorCode } from '@/lib/types/api';

interface ErrorLogData {
  message: string;
  code?: string;
  stack?: string;
  componentName?: string;
  context?: Record<string, any>;
  userId?: string;
}

/**
 * Log error to console and optionally to an error tracking service
 */
export function logError(error: Error | AppError | unknown, context?: Record<string, any>, componentName?: string): void {
  // Extract error details
  const errorData: ErrorLogData = {
    message: 'Unknown error',
    context,
    componentName,
  };
  
  // Handle different error types
  if (error instanceof AppError) {
    errorData.message = error.message;
    errorData.code = error.code;
    errorData.stack = error.stack;
  } else if (error instanceof Error) {
    errorData.message = error.message;
    errorData.stack = error.stack;
  } else if (typeof error === 'string') {
    errorData.message = error;
  } else if (error && typeof error === 'object') {
    errorData.message = JSON.stringify(error);
  }
  
  // Log to console
  console.error('Error:', errorData.message);
  if (errorData.code) console.error('Error code:', errorData.code);
  if (errorData.componentName) console.error('Component:', errorData.componentName);
  if (errorData.stack) console.error('Stack trace:', errorData.stack);
  if (errorData.context) console.error('Context:', errorData.context);
  
  // In production, we would send this to an error tracking service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: errorData });
  }
}

/**
 * Create an AppError from any error type
 */
export function createAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Try to determine error type from message
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new AppError(
        ErrorCode.NETWORK_ERROR,
        'Network error occurred. Please check your connection.',
        503
      );
    }
    
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return new AppError(
        ErrorCode.SERVICE_UNAVAILABLE,
        'Request timed out. Please try again later.',
        503
      );
    }
    
    if (error.message.includes('not found') || error.message.includes('404')) {
      return new AppError(
        ErrorCode.NOT_FOUND,
        'Resource not found.',
        404
      );
    }
    
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return new AppError(
        ErrorCode.UNAUTHORIZED,
        'Authentication required.',
        401
      );
    }
    
    if (error.message.includes('forbidden') || error.message.includes('403')) {
      return new AppError(
        ErrorCode.FORBIDDEN,
        'Access denied.',
        403
      );
    }
    
    return new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      error.message || 'An unexpected error occurred',
      500
    );
  }
  
  // Handle unknown error types
  return new AppError(
    ErrorCode.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    500
  );
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Handle API response errors
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If we can't parse the error response, create a generic error
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `API error: ${response.statusText}`,
        response.status
      );
    }
    
    // If the API returned an error object with a code and message, use that
    if (errorData && errorData.error) {
      throw new AppError(
        errorData.error.code as ErrorCode || ErrorCode.INTERNAL_SERVER_ERROR,
        errorData.error.message || 'API error',
        response.status,
        errorData.error.details
      );
    }
    
    // Otherwise, create a generic error based on the status code
    throw new AppError(
      getErrorCodeFromStatus(response.status),
      response.statusText || 'API error',
      response.status
    );
  }
  
  return response.json();
}

/**
 * Get ErrorCode from HTTP status code
 */
function getErrorCodeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 405:
      return ErrorCode.METHOD_NOT_ALLOWED;
    case 429:
      return ErrorCode.RATE_LIMITED;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return ErrorCode.INTERNAL_SERVER_ERROR;
  }
}