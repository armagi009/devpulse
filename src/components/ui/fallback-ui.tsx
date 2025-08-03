'use client';

/**
 * FallbackUI Component
 * Provides a graceful fallback UI when components fail
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { AppError } from '@/lib/types/api';

interface FallbackUIProps {
  error?: Error | AppError | unknown;
  onRetry?: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
  componentName?: string;
  minimal?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function FallbackUI({
  error,
  onRetry,
  title = 'Component Failed to Load',
  message = 'There was a problem loading this component.',
  loading = false,
  componentName,
  minimal = false,
  className = '',
  children
}: FallbackUIProps) {
  // If we're in loading state, show a loading indicator
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }
  
  // If we have a specific error, use the ErrorMessage component
  if (error) {
    return (
      <ErrorMessage 
        error={error} 
        onRetry={onRetry} 
        className={className}
        compact={minimal}
      />
    );
  }
  
  // If we're in minimal mode, show a simplified fallback
  if (minimal) {
    return (
      <div className={`rounded-md bg-gray-100 p-3 dark:bg-gray-800 ${className}`}>
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {componentName ? `${componentName} unavailable` : 'Component unavailable'}
          </span>
          {onRetry && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRetry}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // Default fallback UI
  return (
    <div className={`rounded-md bg-gray-100 p-4 dark:bg-gray-800 ${className}`}>
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-3 mb-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {message}
        </p>
        {children}
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}