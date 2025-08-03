/**
 * Mock Data Badge Component
 * 
 * This component adds a visual indicator to elements that display mock data.
 */

'use client';

import React from 'react';
import { useMode } from '@/lib/context/ModeContext';
import { AppMode } from '@/lib/types/roles';

interface MockDataBadgeProps {
  children: React.ReactNode;
  showBadge?: boolean;
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  badgeSize?: 'small' | 'medium' | 'large';
  badgeText?: string;
}

export default function MockDataBadge({
  children,
  showBadge = true,
  badgePosition = 'top-right',
  badgeSize = 'small',
  badgeText,
}: MockDataBadgeProps) {
  const { mode, isMockOrDemo } = useMode();
  
  // If not in mock or demo mode, or badge is disabled, just render children
  if (!isMockOrDemo() || !showBadge) {
    return <>{children}</>;
  }
  
  // Determine position classes
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }[badgePosition];
  
  // Determine size classes
  const sizeClasses = {
    'small': 'text-xs px-1',
    'medium': 'text-sm px-2 py-0.5',
    'large': 'text-base px-3 py-1',
  }[badgeSize];
  
  // Determine color based on mode
  const modeColor = mode === AppMode.MOCK
    ? 'bg-amber-500 text-white'
    : 'bg-purple-500 text-white';
  
  // Determine badge text
  const text = badgeText || (mode === AppMode.MOCK ? 'MOCK' : 'DEMO');
  
  return (
    <div className="relative">
      {children}
      <div className={`absolute ${positionClasses} ${modeColor} ${sizeClasses} rounded-sm font-medium z-10`}>
        {text}
      </div>
    </div>
  );
}