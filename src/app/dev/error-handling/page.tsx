'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ui/error-message';
import { ErrorBoundary, withErrorBoundary } from '@/components/ui/error-boundary';
import { FallbackUI } from '@/components/ui/fallback-ui';
import { ErrorBoundaryWrapper, ComponentErrorBoundary } from '@/components/ui/error-boundary-wrapper';
import { AppError, ErrorCode } from '@/lib/types/api';
import { useToast } from '@/components/ui/toast';
import { useNotifications } from '@/lib/hooks/useNotifications';

// Component that throws an error for testing
const ErrorComponent = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div className="p-4 bg-green-100 rounded-md">Component rendered successfully!</div>;
};

// Component wrapped with error boundary
const WrappedComponent = withErrorBoundary(
  ({ shouldThrow = false, errorMessage = 'Test error in wrapped component' }) => {
    if (shouldThrow) {
      throw new Error(errorMessage);
    }
    return <div className="p-4 bg-blue-100 rounded-md">Wrapped component rendered successfully!</div>;
  },
  'TestComponent'
);

export default function ErrorHandlingDemo() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [errorType, setErrorType] = useState<ErrorCode>(ErrorCode.INTERNAL_SERVER_ERROR);
  const [errorMessage, setErrorMessage] = useState('An unexpected error occurred');
  const { addToast } = useToast();
  const notifications = useNotifications();
  
  const errorTypes = [
    { code: ErrorCode.INTERNAL_SERVER_ERROR, label: 'Internal Server Error' },
    { code: ErrorCode.UNAUTHORIZED, label: 'Unauthorized' },
    { code: ErrorCode.FORBIDDEN, label: 'Forbidden' },
    { code: ErrorCode.NOT_FOUND, label: 'Not Found' },
    { code: ErrorCode.NETWORK_ERROR, label: 'Network Error' },
    { code: ErrorCode.VALIDATION_ERROR, label: 'Validation Error' },
    { code: ErrorCode.RATE_LIMITED, label: 'Rate Limited' },
    { code: ErrorCode.SERVICE_UNAVAILABLE, label: 'Service Unavailable' },
    { code: ErrorCode.GITHUB_API_ERROR, label: 'GitHub API Error' },
  ];

  const handleRetry = () => {
    setShouldThrow(false);
  };

  const showErrorToast = () => {
    addToast({
      type: 'error',
      title: 'Error',
      message: errorMessage,
      duration: 5000,
    });
  };

  const showErrorNotification = () => {
    notifications.error(errorMessage, {
      title: errorTypes.find(e => e.code === errorType)?.label,
      action: {
        label: 'Retry',
        onClick: () => notifications.info('Retry action triggered'),
      },
    });
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Error Handling System</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Error Message Component</h2>
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Error Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Error Type</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={errorType}
                  onChange={(e) => setErrorType(e.target.value as ErrorCode)}
                >
                  {errorTypes.map((type) => (
                    <option key={type.code} value={type.code}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Error Message</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button onClick={showErrorToast}>
                  Show as Toast
                </Button>
                <Button onClick={showErrorNotification}>
                  Show as Notification
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Error Message Examples</h3>
            <div className="space-y-6">
              <ErrorMessage
                error={new AppError(errorType, errorMessage)}
                onRetry={handleRetry}
              />
              
              <div className="border-t pt-4">
                <h4 className="text-md font-medium mb-2">Compact Version</h4>
                <ErrorMessage
                  error={new AppError(errorType, errorMessage)}
                  onRetry={handleRetry}
                  compact
                />
              </div>
            </div>
          </Card>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Error Boundaries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Basic Error Boundary</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Button 
                  onClick={() => setShouldThrow(!shouldThrow)}
                  variant={shouldThrow ? "destructive" : "outline"}
                >
                  {shouldThrow ? "Fix Component" : "Break Component"}
                </Button>
              </div>
              
              <ErrorBoundary>
                <ErrorComponent shouldThrow={shouldThrow} errorMessage="This is a test error" />
              </ErrorBoundary>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Error Boundary with Custom Fallback</h3>
            <div className="space-y-4">
              <ErrorBoundary
                fallback={
                  <div className="p-4 bg-amber-100 rounded-md">
                    <p className="font-medium">Custom Fallback UI</p>
                    <p className="text-sm text-amber-800">Something went wrong with this component.</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={handleRetry}>
                      Reset
                    </Button>
                  </div>
                }
              >
                <ErrorComponent shouldThrow={shouldThrow} errorMessage="Error with custom fallback" />
              </ErrorBoundary>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Component Error Boundary</h3>
            <div className="space-y-4">
              <ComponentErrorBoundary componentName="Demo Component">
                <ErrorComponent shouldThrow={shouldThrow} errorMessage="Error in component with name" />
              </ComponentErrorBoundary>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">HOC Pattern</h3>
            <div className="space-y-4">
              <WrappedComponent shouldThrow={shouldThrow} />
            </div>
          </Card>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Fallback UI</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Standard Fallback</h3>
            <FallbackUI
              title="Component Failed"
              message="This component couldn't be loaded."
              onRetry={handleRetry}
            />
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Minimal Fallback</h3>
            <FallbackUI
              componentName="Chart Widget"
              minimal
              onRetry={handleRetry}
            />
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Loading State</h3>
            <FallbackUI
              loading
            />
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">With Specific Error</h3>
            <FallbackUI
              error={new AppError(ErrorCode.NETWORK_ERROR, "Failed to connect to server")}
              onRetry={handleRetry}
            />
          </Card>
        </div>
      </section>
    </div>
  );
}