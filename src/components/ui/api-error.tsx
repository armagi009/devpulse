'use client';

/**
 * ApiError Component
 * Displays API errors with appropriate messages and retry functionality
 */

import React from 'react';
import { ErrorMessage } from '@/components/ui/error-message';

interface ApiErrorProps {
  error: Error | unknown;
  onRetry?: () => void;
  onBack?: () => void;
  className?: string;
  showHomeLink?: boolean;
  compact?: boolean;
}

export function ApiError({ 
  error, 
  onRetry, 
  onBack,
  className = '',
  showHomeLink = false,
  compact = false
}: ApiErrorProps) {
  return (
    <ErrorMessage
      error={error}
      onRetry={onRetry}
      onBack={onBack}
      className={className}
      showHomeLink={showHomeLink}
      compact={compact}
    />
  );
}