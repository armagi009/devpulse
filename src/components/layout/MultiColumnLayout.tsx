'use client';

/**
 * MultiColumnLayout Component
 * 
 * A layout component that optimizes content for desktop displays by
 * arranging content in multiple columns.
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import ResponsiveGrid, { ResponsiveGridItem } from '@/components/ui/ResponsiveGrid';

interface MultiColumnLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  rightPanel?: React.ReactNode;
  sidebarWidth?: string;
  rightPanelWidth?: string;
  className?: string;
  contentClassName?: string;
  sidebarClassName?: string;
  rightPanelClassName?: string;
  collapsible?: boolean;
}

export default function MultiColumnLayout({
  children,
  sidebar,
  rightPanel,
  sidebarWidth = '280px',
  rightPanelWidth = '320px',
  className,
  contentClassName,
  sidebarClassName,
  rightPanelClassName,
  collapsible = true
}: MultiColumnLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle window resize to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Auto-collapse panels on smaller screens
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
        setRightPanelCollapsed(true);
      } else {
        setSidebarCollapsed(false);
        setRightPanelCollapsed(false);
      }
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    if (collapsible) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };
  
  // Toggle right panel
  const toggleRightPanel = () => {
    if (collapsible) {
      setRightPanelCollapsed(!rightPanelCollapsed);
    }
  };
  
  // On mobile, render a stacked layout
  if (isMobile) {
    return (
      <div className={cn('flex flex-col w-full', className)}>
        {sidebar && (
          <div className={cn('w-full', sidebarClassName)}>
            {sidebar}
          </div>
        )}
        
        <div className={cn('w-full', contentClassName)}>
          {children}
        </div>
        
        {rightPanel && (
          <div className={cn('w-full', rightPanelClassName)}>
            {rightPanel}
          </div>
        )}
      </div>
    );
  }
  
  // On desktop, render a multi-column layout
  return (
    <div className={cn('flex w-full h-full', className)}>
      {sidebar && (
        <div 
          className={cn(
            'transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800',
            sidebarCollapsed ? 'w-12' : '',
            sidebarClassName
          )}
          style={!sidebarCollapsed ? { width: sidebarWidth } : undefined}
        >
          {collapsible && (
            <button
              onClick={toggleSidebar}
              className="absolute top-4 right-0 transform translate-x-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-700"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className={cn('w-4 h-4 transition-transform', sidebarCollapsed ? 'rotate-0' : 'rotate-180')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div className={cn('overflow-hidden', sidebarCollapsed ? 'opacity-0' : 'opacity-100')}>
            {sidebar}
          </div>
        </div>
      )}
      
      <div className={cn('flex-1 overflow-auto', contentClassName)}>
        {children}
      </div>
      
      {rightPanel && (
        <div 
          className={cn(
            'transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800',
            rightPanelCollapsed ? 'w-12' : '',
            rightPanelClassName
          )}
          style={!rightPanelCollapsed ? { width: rightPanelWidth } : undefined}
        >
          {collapsible && (
            <button
              onClick={toggleRightPanel}
              className="absolute top-4 left-0 transform -translate-x-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-700"
              aria-label={rightPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
            >
              <svg
                className={cn('w-4 h-4 transition-transform', rightPanelCollapsed ? 'rotate-180' : 'rotate-0')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div className={cn('overflow-hidden', rightPanelCollapsed ? 'opacity-0' : 'opacity-100')}>
            {rightPanel}
          </div>
        </div>
      )}
    </div>
  );
}