'use client';

/**
 * DashboardCard Component
 * 
 * A flexible card component for dashboard layouts with various display options.
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { isTouchDevice, isTabletViewport, useTouchHandlers } from '@/lib/utils/touch-interactions';
import { ModernCard } from './modern-card';

export interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  noPadding?: boolean;
  children: React.ReactNode;
}

export default function DashboardCard({
  title,
  subtitle,
  icon,
  actions,
  footer,
  loading = false,
  error = null,
  collapsible = false,
  defaultCollapsed = false,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  noPadding = false,
  children,
  ...props
}: DashboardCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isTablet, setIsTablet] = useState(false);
  
  // Check if we're on a tablet device
  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(isTabletViewport());
    };
    
    checkTablet();
    window.addEventListener('resize', checkTablet);
    
    return () => {
      window.removeEventListener('resize', checkTablet);
    };
  }, []);
  
  // Toggle collapsed state
  const toggleCollapsed = () => {
    if (collapsible) {
      setCollapsed(!collapsed);
    }
  };
  
  // Handle touch gestures
  const touchHandlers = useTouchHandlers({
    onSwipe: (event) => {
      if (collapsible) {
        if (event.direction === 'down' && !collapsed) {
          setCollapsed(true);
        } else if (event.direction === 'up' && collapsed) {
          setCollapsed(false);
        }
      }
    },
  });
  
  return (
    <ModernCard
      className={cn(
        'overflow-hidden',
        isTablet && collapsible && 'swipeable-card',
        className
      )}
      hover={!collapsible}
      {...props}
      {...(isTablet && collapsible ? touchHandlers : {})}
    >
      {/* Card Header */}
      {(title || subtitle || icon || actions) && (
        <div
          className={cn(
            'flex items-center justify-between px-6 py-4 border-b border-white/20 dark:border-white/10',
            collapsible && 'cursor-pointer',
            isTablet && collapsible && 'touch-feedback py-4',
            headerClassName
          )}
          onClick={collapsible ? toggleCollapsed : undefined}
        >
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={cn(
                "flex-shrink-0 text-gray-500 dark:text-gray-400 dashboard-card-icon",
                isTablet && "text-lg"
              )}>
                {icon}
              </div>
            )}
            
            <div>
              {title && (
                <h3 className={cn(
                  "text-lg font-semibold gradient-text",
                  isTablet && "text-xl"
                )}>
                  {title}
                </h3>
              )}
              
              {subtitle && (
                <p className={cn(
                  "text-xs text-gray-500 dark:text-gray-400",
                  isTablet && "text-sm"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {actions}
            
            {collapsible && (
              <button
                type="button"
                className={cn(
                  "p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none",
                  isTablet && "p-2 touch-target"
                )}
                aria-label={collapsed ? 'Expand' : 'Collapse'}
              >
                <svg
                  className={cn('h-4 w-4 transition-transform', 
                    collapsed ? 'rotate-180' : 'rotate-0',
                    isTablet && 'h-5 w-5'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Swipe indicators for tablet */}
      {isTablet && collapsible && (
        <>
          <div className="swipe-indicator swipe-indicator-up absolute left-1/2 top-2 -translate-x-1/2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
          <div className="swipe-indicator swipe-indicator-down absolute left-1/2 bottom-2 -translate-x-1/2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </>
      )}
      
      {/* Card Body */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          !noPadding && 'p-6',
          isTablet && !noPadding && 'p-6',
          collapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[2000px] opacity-100',
          bodyClassName
        )}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className={cn(
              "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100",
              isTablet && "h-10 w-10 border-b-3"
            )}></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-red-500 dark:text-red-400">
            <svg className={cn(
              "h-10 w-10 mb-2",
              isTablet && "h-12 w-12 mb-3"
            )} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={isTablet ? "text-base" : ""}>{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
      
      {/* Card Footer */}
      {footer && !collapsed && (
        <div
          className={cn(
            'px-6 py-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-t border-white/20 dark:border-white/10',
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </ModernCard>
  );
}