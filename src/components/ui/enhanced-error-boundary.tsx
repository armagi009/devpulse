import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorHelp, errorHelpMap } from '../help/ErrorHelp';

// Map of error types to error codes
const errorTypeToCodeMap: Record<string, string> = {
  'TypeError': 'DATA_001',
  'SyntaxError': 'API_001',
  'ReferenceError': 'API_001',
  'RangeError': 'DATA_001',
  'URIError': 'API_001',
  'EvalError': 'API_001',
  'AuthenticationError': 'AUTH_001',
  'PermissionError': 'PERM_001',
  'SyncError': 'SYNC_001',
  'NetworkError': 'API_001',
  'DataError': 'DATA_001'
};

// Function to get error code from error
const getErrorCode = (error: Error): string => {
  // Check if error has a code property
  const anyError = error as any;
  if (anyError.code && typeof anyError.code === 'string') {
    // If the code matches our error codes format, use it
    if (Object.keys(errorHelpMap).includes(anyError.code)) {
      return anyError.code;
    }
  }
  
  // Try to match by error name
  const errorName = error.name || error.constructor.name;
  if (errorTypeToCodeMap[errorName]) {
    return errorTypeToCodeMap[errorName];
  }
  
  // Default to API error
  return 'API_001';
};

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showHelp?: boolean;
}

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error to console
    console.error('Error caught by EnhancedErrorBoundary:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showHelp = true } = this.props;

    if (hasError && error) {
      // If custom fallback is provided as a function, call it with error details
      if (typeof fallback === 'function') {
        return fallback(error, errorInfo!, this.resetErrorBoundary);
      }
      
      // If custom fallback is provided as a component, render it
      if (fallback) {
        return fallback;
      }
      
      // Default fallback UI
      const errorCode = getErrorCode(error);
      
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
            <p className="mt-1 text-red-700">
              We encountered an error while rendering this component.
            </p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-red-800">Error Details</h3>
            <p className="mt-1 text-red-700">
              {error.toString()}
            </p>
            {process.env.NODE_ENV === 'development' && errorInfo && (
              <details className="mt-2">
                <summary className="text-sm text-red-600 cursor-pointer">
                  Component Stack
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto p-2 bg-red-100 rounded">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          
          {showHelp && (
            <div className="mb-4">
              <h3 className="font-medium text-red-800 mb-2">Help & Troubleshooting</h3>
              <ErrorHelp errorCode={errorCode} />
            </div>
          )}
          
          <div className="mt-4">
            <button
              onClick={this.resetErrorBoundary}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

// Higher-order component to wrap components with EnhancedErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<EnhancedErrorBoundaryProps, 'children'> = {}
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary: React.FC<P> = (props) => {
    return (
      <EnhancedErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </EnhancedErrorBoundary>
    );
  };
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}

// Hook to create error-throwing functions for testing
export const useErrorThrower = () => {
  const throwError = (errorType: string, message: string = 'Test error') => {
    switch (errorType) {
      case 'TypeError':
        throw new TypeError(message);
      case 'SyntaxError':
        throw new SyntaxError(message);
      case 'ReferenceError':
        throw new ReferenceError(message);
      case 'RangeError':
        throw new RangeError(message);
      case 'URIError':
        throw new URIError(message);
      case 'EvalError':
        throw new EvalError(message);
      case 'AuthenticationError':
        const authError = new Error(message);
        authError.name = 'AuthenticationError';
        throw authError;
      case 'PermissionError':
        const permError = new Error(message);
        permError.name = 'PermissionError';
        throw permError;
      case 'SyncError':
        const syncError = new Error(message);
        syncError.name = 'SyncError';
        throw syncError;
      case 'NetworkError':
        const networkError = new Error(message);
        networkError.name = 'NetworkError';
        throw networkError;
      case 'DataError':
        const dataError = new Error(message);
        dataError.name = 'DataError';
        throw dataError;
      case 'CustomError':
        const customError = new Error(message);
        (customError as any).code = 'API_001';
        throw customError;
      default:
        throw new Error(message);
    }
  };
  
  return { throwError };
};