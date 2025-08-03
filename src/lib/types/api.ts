/**
 * API Types
 * Types for API responses and error handling
 */

export interface ApiResponse<T> {
  data: T;
  success: true;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // GitHub API errors
  GITHUB_API_ERROR = 'GITHUB_API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  RATE_LIMITED = 'RATE_LIMITED',
  REPOSITORY_NOT_FOUND = 'REPOSITORY_NOT_FOUND',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // AI service errors
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_PROCESSING_ERROR = 'AI_PROCESSING_ERROR',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // General errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
}

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  details?: unknown;
  
  constructor(code: ErrorCode, message: string, status = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
  
  toJSON(): ApiError['error'] {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}