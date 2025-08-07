/**
 * Dashboard Loading State
 * Loading components for dashboard pages with skeleton screens
 */

import React from 'react';
import { ModernCard } from '@/components/ui/modern-card';
import { cn } from '@/lib/utils';

interface DashboardLoadingStateProps {
  type?: 'wellness' | 'capacity' | 'general';
  className?: string;
}

/**
 * Skeleton component for loading states
 */
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
};

/**
 * Loading state for wellness dashboard
 */
const WellnessLoadingSkeleton = () => (
  <div className="space-y-8">
    {/* Profile Card Skeleton */}
    <ModernCard className="p-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </ModernCard>

    {/* Navigation Tabs Skeleton */}
    <ModernCard className="p-2">
      <div className="flex space-x-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
    </ModernCard>

    {/* Content Area Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <ModernCard key={i} className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </ModernCard>
      ))}
    </div>

    {/* Main Content Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <ModernCard className="lg:col-span-2 p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-20 w-20 rounded-full mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </ModernCard>
      
      <ModernCard className="p-6">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  </div>
);

/**
 * Loading state for capacity dashboard
 */
const CapacityLoadingSkeleton = () => (
  <div className="space-y-8">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>

    {/* Metrics Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <ModernCard key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </ModernCard>
      ))}
    </div>

    {/* Capacity Distribution Skeleton */}
    <ModernCard className="p-6">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center space-y-3">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-4 w-16 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
        ))}
      </div>
    </ModernCard>

    {/* Team Members Skeleton */}
    <div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ModernCard key={i} className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-4" />
            </div>
          </ModernCard>
        ))}
      </div>
    </div>
  </div>
);

/**
 * General loading skeleton
 */
const GeneralLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <ModernCard key={i} className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-6 w-6" />
            </div>
          </div>
        </ModernCard>
      ))}
    </div>
  </div>
);

/**
 * Main Dashboard Loading State Component
 */
export function DashboardLoadingState({ type = 'general', className }: DashboardLoadingStateProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'wellness':
        return <WellnessLoadingSkeleton />;
      case 'capacity':
        return <CapacityLoadingSkeleton />;
      default:
        return <GeneralLoadingSkeleton />;
    }
  };

  return (
    <div className={cn("animate-in fade-in-50 duration-500", className)}>
      {renderSkeleton()}
    </div>
  );
}

/**
 * Inline loading spinner for smaller components
 */
export function InlineLoadingSpinner({ size = 'md', className }: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size]
      )} />
    </div>
  );
}

/**
 * Loading overlay for existing content
 */
export function LoadingOverlay({ isLoading, children, className }: {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-2">
            <InlineLoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLoadingState;