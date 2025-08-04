'use client';

import React from 'react';
import { isProductionMockModeEnabled, getMockModeMessage } from '@/lib/config/dev-mode';

export default function ProductionMockIndicator() {
  // Only show in production mock mode
  if (!isProductionMockModeEnabled() && process.env.NODE_ENV !== 'production') {
    return null;
  }

  const message = getMockModeMessage();
  if (!message) {
    return null;
  }

  return (
    <>
      {/* Top banner for demo mode */}
      <div className="demo-mode-banner">
        🎭 {message} - All data is simulated for demonstration purposes
      </div>
      
      {/* Corner indicator */}
      <div className="mock-mode-indicator">
        DEMO
      </div>
    </>
  );
}

// Hook for components to check if they should show mock data indicators
export function useMockModeIndicator() {
  const isProductionMock = isProductionMockModeEnabled();
  const isDevelopmentMock = process.env.NODE_ENV === 'development' && 
                           (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true' || 
                            process.env.NEXT_PUBLIC_USE_MOCK_API === 'true');

  return {
    showIndicator: isProductionMock || isDevelopmentMock,
    message: getMockModeMessage(),
    isProduction: isProductionMock
  };
}

// Component for showing mock data badges on individual elements
export function MockDataBadge({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  const { showIndicator } = useMockModeIndicator();
  
  if (!showIndicator) {
    return null;
  }

  return (
    <span className={`mock-data-badge ${className}`}>
      {children || 'Mock Data'}
    </span>
  );
}
