'use client';

/**
 * MobileLayout Component
 * 
 * A mobile-first layout component that optimizes content display for small screens.
 * Features compact spacing, single column layout, and prioritized content.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  fullHeight?: boolean;
  withPadding?: boolean;
}

export function MobileLayout({
  children,
  header,
  footer,
  className,
  contentClassName,
  fullHeight = false,
  withPadding = true,
}: MobileLayoutProps) {
  return (
    <div 
      className={cn(
        'flex flex-col',
        fullHeight && 'min-h-[calc(100vh-4rem)]', // Account for bottom navigation
        className
      )}
    >
      {header && (
        <header className="sticky top-0 z-10 bg-background border-b">
          {header}
        </header>
      )}
      
      <main 
        className={cn(
          'flex-1',
          withPadding && 'px-4 py-3',
          contentClassName
        )}
      >
        {children}
      </main>
      
      {footer && (
        <footer className="mt-auto border-t">
          {footer}
        </footer>
      )}
    </div>
  );
}

interface MobileCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  compact?: boolean;
}

export function MobileCard({
  children,
  title,
  icon,
  actions,
  className,
  contentClassName,
  compact = false,
}: MobileCardProps) {
  return (
    <div 
      className={cn(
        'rounded-lg border bg-card shadow-sm mb-4',
        compact ? 'p-3' : 'p-4',
        className
      )}
    >
      {(title || icon || actions) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {icon && (
              <div className="mr-2 h-5 w-5 text-muted-foreground">
                {icon}
              </div>
            )}
            {title && (
              <h3 className={cn(
                'font-medium',
                compact ? 'text-base' : 'text-lg'
              )}>
                {title}
              </h3>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className={contentClassName}>
        {children}
      </div>
    </div>
  );
}

interface MobileListProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export function MobileList({
  children,
  className,
  divider = true,
}: MobileListProps) {
  return (
    <ul 
      className={cn(
        'space-y-1',
        divider && 'divide-y divide-border',
        className
      )}
    >
      {children}
    </ul>
  );
}

interface MobileListItemProps {
  children: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export function MobileListItem({
  children,
  leading,
  trailing,
  onClick,
  className,
  active = false,
}: MobileListItemProps) {
  return (
    <li 
      className={cn(
        'py-2',
        onClick && 'cursor-pointer touch-feedback',
        active && 'bg-accent/50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        {leading && (
          <div className="mr-3 flex-shrink-0">
            {leading}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        {trailing && (
          <div className="ml-3 flex-shrink-0">
            {trailing}
          </div>
        )}
      </div>
    </li>
  );
}

export default {
  Layout: MobileLayout,
  Card: MobileCard,
  List: MobileList,
  ListItem: MobileListItem,
};