'use client';

/**
 * ErrorMessage Component
 * Displays user-friendly error messages with recovery suggestions
 */

import React from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Server, 
  Lock, 
  Search, 
  Clock, 
  HelpCircle,
  ArrowLeft,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppError, ErrorCode } from '@/lib/types/api';
import Link from 'next/link';

interface ErrorMessageProps {
  error: Error | AppError | unknown;
  onRetry?: () => void;
  onBack?: () => void;
  className?: string;
  showHomeLink?: boolean;
  compact?: boolean;
}

interface ErrorDetails {
  title: string;
  message: string;
  icon: React.ReactNode;
  suggestion?: string;
  actions?: {
    primary?: {
      label: string;
      action: () => void;
      icon?: React.ReactNode;
    };
    secondary?: {
      label: string;
      action: () => void;
      icon?: React.ReactNode;
    };
  };
}

export function ErrorMessage({ 
  error, 
  onRetry, 
  onBack,
  className = '',
  showHomeLink = false,
  compact = false
}: ErrorMessageProps) {
  // Determine error type and message
  const getErrorDetails = (): ErrorDetails => {
    // Handle AppError type
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const appError = error as AppError;
      
      switch (appError.code) {
        case ErrorCode.UNAUTHORIZED:
          return {
            title: 'Authentication Required',
            message: 'You need to be logged in to access this resource.',
            icon: <Lock className="h-5 w-5 text-amber-400" />,
            suggestion: 'Try signing in again or contact support if the problem persists.',
            actions: {
              primary: {
                label: 'Sign In',
                action: () => window.location.href = '/auth/signin',
                icon: <Lock className="mr-2 h-4 w-4" />
              }
            }
          };
        case ErrorCode.FORBIDDEN:
          return {
            title: 'Access Denied',
            message: 'You don\'t have permission to access this resource.',
            icon: <Lock className="h-5 w-5 text-amber-400" />,
            suggestion: 'Contact your administrator to request access to this feature.',
          };
        case ErrorCode.RECORD_NOT_FOUND:
        case ErrorCode.NOT_FOUND:
          return {
            title: 'Resource Not Found',
            message: appError.message || 'The requested resource could not be found.',
            icon: <Search className="h-5 w-5 text-amber-400" />,
            suggestion: 'Check that the resource exists or try navigating back.',
            actions: onBack ? {
              primary: {
                label: 'Go Back',
                action: onBack,
                icon: <ArrowLeft className="mr-2 h-4 w-4" />
              }
            } : undefined
          };
        case ErrorCode.RATE_LIMITED:
        case ErrorCode.RATE_LIMIT_EXCEEDED:
        case ErrorCode.TOO_MANY_REQUESTS:
          return {
            title: 'Rate Limited',
            message: 'Too many requests. Please try again later.',
            icon: <Clock className="h-5 w-5 text-amber-400" />,
            suggestion: 'Wait a moment before trying again.',
            actions: onRetry ? {
              primary: {
                label: 'Try Again Later',
                action: onRetry,
                icon: <RefreshCw className="mr-2 h-4 w-4" />
              }
            } : undefined
          };
        case ErrorCode.SERVICE_UNAVAILABLE:
        case ErrorCode.AI_SERVICE_UNAVAILABLE:
          return {
            title: 'Service Unavailable',
            message: 'The service is currently unavailable. Please try again later.',
            icon: <Server className="h-5 w-5 text-red-400" />,
            suggestion: 'This is likely a temporary issue. Please try again in a few minutes.',
            actions: onRetry ? {
              primary: {
                label: 'Try Again',
                action: onRetry,
                icon: <RefreshCw className="mr-2 h-4 w-4" />
              }
            } : undefined
          };
        case ErrorCode.NETWORK_ERROR:
          return {
            title: 'Network Error',
            message: 'Unable to connect to the server. Please check your internet connection.',
            icon: <WifiOff className="h-5 w-5 text-red-400" />,
            suggestion: 'Check your internet connection and try again.',
            actions: onRetry ? {
              primary: {
                label: 'Reconnect',
                action: onRetry,
                icon: <Wifi className="mr-2 h-4 w-4" />
              }
            } : undefined
          };
        case ErrorCode.GITHUB_API_ERROR:
          return {
            title: 'GitHub API Error',
            message: appError.message || 'There was an error connecting to GitHub.',
            icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
            suggestion: 'This could be due to GitHub service issues or authentication problems.',
            actions: onRetry ? {
              primary: {
                label: 'Try Again',
                action: onRetry,
                icon: <RefreshCw className="mr-2 h-4 w-4" />
              }
            } : undefined
          };
        case ErrorCode.DATABASE_ERROR:
          return {
            title: 'Data Access Error',
            message: 'There was a problem accessing your data.',
            icon: <Server className="h-5 w-5 text-red-400" />,
            suggestion: 'This is likely a temporary issue. Please try again in a few minutes.',
            actions: onRetry ? {
              primary: {
                label: 'Try Again',
                action: onRetry,
                icon: <RefreshCw className="mr-2 h-4 w-4" />
              }
            } : undefined
          };
        case ErrorCode.VALIDATION_ERROR:
          return {
            title: 'Validation Error',
            message: appError.message || 'The provided data is invalid.',
            icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
            suggestion: 'Please check your input and try again.',
          };
        default:
          return {
            title: 'Error',
            message: appError.message || 'An unexpected error occurred.',
            icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
            suggestion: 'Please try again or contact support if the problem persists.',
            actions: onRetry ? {
              primary: {
                label: 'Try Again',
                action: onRetry,
                icon: <RefreshCw className="mr-2 h-4 w-4" />
              }
            } : undefined
          };
      }
    }
    
    // Handle standard Error type
    if (error instanceof Error) {
      // Check for network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          title: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          icon: <WifiOff className="h-5 w-5 text-red-400" />,
          suggestion: 'Check your internet connection and try again.',
          actions: onRetry ? {
            primary: {
              label: 'Reconnect',
              action: onRetry,
              icon: <Wifi className="mr-2 h-4 w-4" />
            }
          } : undefined
        };
      }
      
      // Check for timeout errors
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        return {
          title: 'Request Timeout',
          message: 'The request took too long to complete.',
          icon: <Clock className="h-5 w-5 text-amber-400" />,
          suggestion: 'This could be due to slow internet or high server load. Try again later.',
          actions: onRetry ? {
            primary: {
              label: 'Try Again',
              action: onRetry,
              icon: <RefreshCw className="mr-2 h-4 w-4" />
            }
          } : undefined
        };
      }
      
      return {
        title: 'Error',
        message: error.message || 'An unexpected error occurred.',
        icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
        suggestion: 'Please try again or contact support if the problem persists.',
        actions: onRetry ? {
          primary: {
            label: 'Try Again',
            action: onRetry,
            icon: <RefreshCw className="mr-2 h-4 w-4" />
          }
        } : undefined
      };
    }
    
    // Handle unknown error types
    return {
      title: 'Error',
      message: 'An unexpected error occurred.',
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      suggestion: 'Please try again or contact support if the problem persists.',
      actions: onRetry ? {
        primary: {
          label: 'Try Again',
          action: onRetry,
          icon: <RefreshCw className="mr-2 h-4 w-4" />
        }
      } : undefined
    };
  };
  
  const { title, message, icon, suggestion, actions } = getErrorDetails();
  
  // Compact version for inline errors
  if (compact) {
    return (
      <div className={`rounded-md bg-red-50 p-3 dark:bg-red-900/20 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              {title}
            </h3>
            <div className="mt-1 text-sm text-red-700 dark:text-red-300">
              <p>{message}</p>
            </div>
            {actions?.primary && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={actions.primary.action}
                >
                  {actions.primary.icon}
                  {actions.primary.label}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Full version with suggestions and multiple actions
  return (
    <div className={`rounded-md bg-red-50 p-4 dark:bg-red-900/20 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {title}
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{message}</p>
          </div>
          {suggestion && (
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p className="flex items-center">
                <HelpCircle className="mr-1 h-4 w-4" />
                {suggestion}
              </p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {actions?.primary && (
              <Button
                size="sm"
                variant="outline"
                onClick={actions.primary.action}
              >
                {actions.primary.icon}
                {actions.primary.label}
              </Button>
            )}
            
            {actions?.secondary && (
              <Button
                size="sm"
                variant="ghost"
                onClick={actions.secondary.action}
              >
                {actions.secondary.icon}
                {actions.secondary.label}
              </Button>
            )}
            
            {onBack && !actions?.primary?.action?.toString().includes('onBack') && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            )}
            
            {showHomeLink && (
              <Button
                size="sm"
                variant="ghost"
                asChild
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}