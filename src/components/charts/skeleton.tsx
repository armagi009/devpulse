import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
  height?: number | string;
  width?: number | string;
}

/**
 * Basic skeleton loader component
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  height,
  width,
}) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-gray-200 dark:bg-gray-700",
        className
      )}
      style={{
        height,
        width,
      }}
      data-testid="skeleton-loader"
    />
  );
};

export interface ChartSkeletonProps {
  type?: 'bar' | 'line' | 'pie' | 'default';
  height?: number | string;
  width?: number | string;
  className?: string;
  showLegend?: boolean;
  showTitle?: boolean;
}

/**
 * Chart-specific skeleton loader
 */
export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  type = 'default',
  height = '300px',
  width = '100%',
  className = '',
  showLegend = true,
  showTitle = true,
}) => {
  return (
    <div
      className={cn("chart-skeleton-container", className)}
      style={{ height, width }}
      data-testid="chart-skeleton"
    >
      {showTitle && (
        <div className="mb-4">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}
      
      {type === 'bar' && (
        <div className="flex items-end justify-between h-48 mt-8 mb-4">
          <Skeleton className="w-[8%] h-[30%] mx-1" />
          <Skeleton className="w-[8%] h-[70%] mx-1" />
          <Skeleton className="w-[8%] h-[45%] mx-1" />
          <Skeleton className="w-[8%] h-[90%] mx-1" />
          <Skeleton className="w-[8%] h-[60%] mx-1" />
          <Skeleton className="w-[8%] h-[40%] mx-1" />
          <Skeleton className="w-[8%] h-[75%] mx-1" />
          <Skeleton className="w-[8%] h-[55%] mx-1" />
        </div>
      )}
      
      {type === 'line' && (
        <div className="relative h-48 mt-8 mb-4">
          <Skeleton className="absolute top-0 left-0 right-0 h-full opacity-30" />
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M0,50 C20,40 40,60 60,30 C80,10 90,50 100,40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-300 dark:text-gray-600"
            />
          </svg>
          <div className="absolute top-0 left-0 w-full h-full flex justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="relative" style={{ left: `${i * 25}%` }}>
                <Skeleton className="w-2 h-2 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {type === 'pie' && (
        <div className="flex justify-center items-center h-48 mt-8 mb-4">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="20"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="20"
                strokeDasharray="251.2"
                strokeDashoffset="188.4"
                className="text-gray-300 dark:text-gray-600"
              />
            </svg>
          </div>
        </div>
      )}
      
      {type === 'default' && (
        <div className="h-48 mt-8 mb-4">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      {showLegend && (
        <div className="flex flex-wrap gap-2 mt-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-24" />
        </div>
      )}
    </div>
  );
};

/**
 * Empty state component for charts
 */
export interface EmptyChartStateProps {
  message?: string;
  icon?: React.ReactNode;
  height?: number | string;
  width?: number | string;
  className?: string;
  action?: React.ReactNode;
}

export const EmptyChartState: React.FC<EmptyChartStateProps> = ({
  message = 'No data available',
  icon,
  height = '300px',
  width = '100%',
  className = '',
  action,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-gray-500 dark:text-gray-400",
        className
      )}
      style={{ height, width }}
      data-testid="empty-chart-state"
    >
      {icon || (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      )}
      <p className="text-center mb-4">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

/**
 * Error state component for charts
 */
export interface ErrorChartStateProps {
  message?: string;
  error?: Error | string;
  height?: number | string;
  width?: number | string;
  className?: string;
  onRetry?: () => void;
}

export const ErrorChartState: React.FC<ErrorChartStateProps> = ({
  message = 'Failed to load chart data',
  error,
  height = '300px',
  width = '100%',
  className = '',
  onRetry,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-red-500 dark:text-red-400",
        className
      )}
      style={{ height, width }}
      data-testid="error-chart-state"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 mb-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="text-center mb-2">{message}</p>
      {error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
      {onRetry && (
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default {
  Skeleton,
  ChartSkeleton,
  EmptyChartState,
  ErrorChartState,
};