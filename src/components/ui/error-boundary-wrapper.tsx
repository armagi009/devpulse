'use client';

/**
 * ErrorBoundaryWrapper Component
 * Wraps components with error boundary and provides consistent error UI
 */

import React, { ReactNode, useState } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { FallbackUI } from '@/components/ui/fallback-ui';
import { ErrorMessage } from '@/components/ui/error-message';
import { logError } from '@/lib/utils/error-handler';
import { AppError, ErrorCode } from '@/lib/types/api';

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onRetry?: () => void;
  minimal?: boolean;
}

export function ErrorBoundaryWrapper({ 
  children, 
  fallback, 
  componentName,
  onRetry,
  minimal = false
}: ErrorBoundaryWrapperProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error with component context
    logError(error, { errorInfo }, componentName);
  };
  
  // If custom fallback is provided, use it
  if (fallback) {
    return (
      <ErrorBoundary 
        onError={handleError}
        fallback={fallback}
      >
        {children}
      </ErrorBoundary>
    );
  }
  
  // Otherwise use our enhanced fallback UI
  return (
    <ErrorBoundary 
      onError={handleError}
      fallback={
        <FallbackUI
          componentName={componentName}
          onRetry={onRetry}
          minimal={minimal}
          title={`${componentName || 'Component'} Error`}
          message={`There was a problem loading ${componentName ? 'the ' + componentName : 'this component'}.`}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * withErrorBoundary HOC with component name tracking
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  options?: {
    minimal?: boolean;
    onRetry?: (props: P) => void;
  }
): React.FC<P> {
  const displayName = componentName || Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props: P) => {
    const [key, setKey] = useState(0);
    
    const handleRetry = () => {
      // Reset the component by changing the key
      setKey(prev => prev + 1);
      
      // Call custom retry handler if provided
      if (options?.onRetry) {
        options.onRetry(props);
      }
    };
    
    return (
      <ErrorBoundaryWrapper 
        componentName={displayName}
        onRetry={handleRetry}
        minimal={options?.minimal}
        key={key}
      >
        <Component {...props} />
      </ErrorBoundaryWrapper>
    );
  };
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

/**
 * ApiErrorBoundary Component
 * Specialized error boundary for API-related components
 */
export function ApiErrorBoundary({ 
  children, 
  componentName,
  onRetry,
  minimal = false
}: {
  children: ReactNode;
  componentName?: string;
  onRetry?: () => void;
  minimal?: boolean;
}) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error with component context
    logError(error, { errorInfo }, componentName);
  };
  
  return (
    <ErrorBoundary 
      onError={handleError}
      fallback={
        <ErrorMessage 
          error={
            error instanceof AppError 
              ? error 
              : new AppError(
                  ErrorCode.INTERNAL_SERVER_ERROR,
                  `${componentName || 'Component'} failed to render`
                )
          } 
          onRetry={onRetry}
          compact={minimal}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * ComponentErrorBoundary
 * A component-specific error boundary with customizable recovery options
 */
export function ComponentErrorBoundary({
  children,
  componentName,
  onRetry,
  fallbackComponent,
  minimal = false,
  className = ''
}: {
  children: ReactNode;
  componentName?: string;
  onRetry?: () => void;
  fallbackComponent?: React.ComponentType<{ onRetry?: () => void }>;
  minimal?: boolean;
  className?: string;
}) {
  const [key, setKey] = useState(0);
  
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error with component context
    logError(error, { errorInfo }, componentName);
  };
  
  const handleRetry = () => {
    // Reset the component by changing the key
    setKey(prev => prev + 1);
    
    // Call custom retry handler if provided
    if (onRetry) {
      onRetry();
    }
  };
  
  // Custom fallback component if provided
  const CustomFallback = fallbackComponent 
    ? React.createElement(fallbackComponent, { onRetry: handleRetry })
    : null;
  
  return (
    <ErrorBoundary 
      key={key}
      onError={handleError}
      fallback={
        CustomFallback || (
          <FallbackUI
            componentName={componentName}
            onRetry={handleRetry}
            minimal={minimal}
            className={className}
          />
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}