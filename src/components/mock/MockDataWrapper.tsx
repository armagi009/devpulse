/**
 * MockDataWrapper Component
 * 
 * This component wraps analytics components with a mock data indicator
 * when the application is running in mock mode.
 */

import React, { ReactNode, useEffect } from 'react';
import { isUsingMockData, logMockDataUsage } from '@/lib/mock/mock-data-utils';

interface MockDataWrapperProps {
  children: ReactNode;
  componentName: string;
  showIndicator?: boolean;
}

export default function MockDataWrapper({
  children,
  componentName,
  showIndicator = true,
}: MockDataWrapperProps) {
  // Log mock data usage when component mounts
  useEffect(() => {
    logMockDataUsage(componentName);
  }, [componentName]);

  // If not using mock data, just render the children
  if (!isUsingMockData()) {
    return <>{children}</>;
  }

  // If using mock data but indicator is disabled, just render the children
  if (!showIndicator) {
    return <>{children}</>;
  }

  // Render with mock data indicator
  return (
    <div className="relative">
      {children}
      <div className="absolute right-2 top-2 z-10 rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
        Mock Data
      </div>
    </div>
  );
}

/**
 * Higher-order component to wrap a component with mock data indicator
 * 
 * @param Component The component to wrap
 * @param componentName The name of the component (for logging)
 * @param showIndicator Whether to show the mock data indicator
 * @returns The wrapped component
 */
export function withMockDataIndicator<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  showIndicator = true
): React.FC<P> {
  return (props: P) => (
    <MockDataWrapper componentName={componentName} showIndicator={showIndicator}>
      <Component {...props} />
    </MockDataWrapper>
  );
}