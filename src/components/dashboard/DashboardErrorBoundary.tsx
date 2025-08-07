/**
 * Dashboard Error Boundary
 * Error boundary component specifically for dashboard pages with retry functionality
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ModernCard, ModernButton } from '@/components/ui/modern-card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <ModernCard className="max-w-md w-full p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-error/10 rounded-full">
                <AlertTriangle size={32} className="text-error" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-foreground mb-2">
              Dashboard Error
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Something went wrong while loading the dashboard. This might be a temporary issue.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-muted rounded-lg text-left">
                <p className="text-sm font-medium text-foreground mb-2">Error Details:</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.state.retryCount < this.maxRetries && (
                <ModernButton
                  onClick={this.handleRetry}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Try Again ({this.maxRetries - this.state.retryCount} left)
                </ModernButton>
              )}
              
              <ModernButton
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home size={16} />
                Go to Dashboard
              </ModernButton>
            </div>

            {this.state.retryCount >= this.maxRetries && (
              <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                <p className="text-sm text-warning-foreground">
                  Maximum retry attempts reached. Please refresh the page or contact support if the issue persists.
                </p>
              </div>
            )}
          </ModernCard>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of the error boundary for functional components
 */
export function useDashboardErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      // Log error
      console.error('Dashboard error:', error);
    }
  }, [error]);

  return {
    error,
    resetError,
    handleError,
    hasError: error !== null
  };
}

export default DashboardErrorBoundary;