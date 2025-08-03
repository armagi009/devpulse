'use client';

/**
 * Global Error Handler
 * Catches and displays errors at the application level
 */

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logError } from '@/lib/utils/error-handler';
import { ErrorMessage } from '@/components/ui/error-message';
import { createAppError } from '@/lib/utils/error-handler';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  // Log error when component mounts
  useEffect(() => {
    // Log error to our error tracking system
    logError(error, { digest: error.digest }, 'GlobalErrorHandler');
  }, [error]);

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-full mb-6">
                <ErrorMessage 
                  error={createAppError(error)}
                  onRetry={reset}
                  showHomeLink={true}
                />
              </div>
              
              <div className="space-y-3 w-full">
                <Button
                  onClick={reset}
                  className="w-full"
                >
                  Try again
                </Button>
                <Button
                  variant="outline"
                  onClick={goHome}
                  className="w-full"
                >
                  Go to homepage
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded text-left w-full overflow-auto">
                  <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    {error.message}
                  </p>
                  {error.stack && (
                    <pre className="mt-2 text-xs font-mono text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  )}
                  {error.digest && (
                    <p className="mt-2 text-xs font-mono text-gray-600 dark:text-gray-400">
                      Digest: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}