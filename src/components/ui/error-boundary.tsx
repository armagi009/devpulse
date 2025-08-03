'use client';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRecoverySuggestion, isRetryableError } from '@/lib/utils/error-recovery';
import { createAppError } from '@/lib/utils/error-handler';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[];
  FallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Update state with error info for potential display
    this.setState({ errorInfo });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if resetKeys have changed
    if (this.state.hasError && this.props.resetKeys) {
      if (!prevProps.resetKeys || 
          JSON.stringify(prevProps.resetKeys) !== JSON.stringify(this.props.resetKeys)) {
        this.resetError();
      }
    }
  }
  
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };
  
  goBack = (): void => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Render custom fallback component if provided
      if (this.props.FallbackComponent) {
        return <this.props.FallbackComponent 
          error={this.state.error || new Error('Unknown error')} 
          resetError={this.resetError} 
        />;
      }
      
      // Get recovery suggestion based on error type
      const recoverySuggestion = this.state.error 
        ? getRecoverySuggestion(this.state.error)
        : 'Try refreshing the page or contact support if the problem persists.';
      
      // Check if error is likely recoverable with a retry
      const isRecoverable = this.state.error 
        ? isRetryableError(this.state.error)
        : true;
      
      // Render default fallback UI
      return (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Something went wrong
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{recoverySuggestion}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {isRecoverable && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={this.resetError}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try again
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={this.goBack}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go back
                </Button>
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
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-left overflow-auto max-h-40">
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {this.state.error.stack}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * withErrorBoundary HOC
 * Wraps a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}