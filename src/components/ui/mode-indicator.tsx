/**
 * Mode Indicator Component
 * 
 * This component displays a persistent visual indicator when the application
 * is running in mock or demo mode.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useMode } from '@/lib/context/ModeContext';
import { AppMode } from '@/lib/types/roles';

interface ModeIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  showLabel?: boolean;
}

export default function ModeIndicator({
  position = 'top-right',
  showLabel = true,
}: ModeIndicatorProps) {
  const { mode, isMockOrDemo } = useMode();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Don't render anything if not in mock or demo mode
  if (!isMockOrDemo()) {
    return null;
  }
  
  // Determine position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  }[position];
  
  // Determine color based on mode
  const modeColor = mode === AppMode.MOCK
    ? 'bg-amber-500 border-amber-600'
    : 'bg-purple-500 border-purple-600';
  
  // Determine icon based on mode
  const modeIcon = mode === AppMode.MOCK
    ? (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    )
    : (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
      </svg>
    );
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={`fixed ${positionClasses} z-50 flex items-center`}>
      <div className={`rounded-md ${modeColor} text-white shadow-lg flex items-center`}>
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 flex items-center justify-center"
            title={`${mode} Mode - Click to expand`}
          >
            {modeIcon}
          </button>
        ) : (
          <div className="flex items-center">
            <div className="flex items-center px-3 py-2">
              {modeIcon}
              {showLabel && (
                <span className="ml-2 text-sm font-medium">
                  {mode} Mode
                </span>
              )}
            </div>
            <div className="border-l border-white/20 flex">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-white/10"
                title="Minimize"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path>
                </svg>
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-white/10"
                title="Hide"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}