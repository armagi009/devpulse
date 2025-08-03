'use client';

/**
 * MobileDataDisplay Component
 * 
 * A collection of mobile-first components for displaying data in compact layouts
 * with progressive disclosure patterns.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProgressiveDisclosure } from './ProgressiveDisclosure';
import { useTouchHandlers } from '@/lib/utils/touch-interactions';

interface MobileDataListProps {
  items: {
    id: string;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    value?: React.ReactNode;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    details?: React.ReactNode;
  }[];
  onItemClick?: (id: string) => void;
  className?: string;
  expandable?: boolean;
}

export function MobileDataList({
  items,
  onItemClick,
  className,
  expandable = false,
}: MobileDataListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const handleItemClick = (id: string) => {
    if (expandable) {
      setExpandedId(expandedId === id ? null : id);
    }
    onItemClick?.(id);
  };
  
  return (
    <ul 
      className={cn(
        'divide-y divide-border rounded-md border bg-card',
        className
      )}
    >
      {items.map((item) => {
        const isExpanded = expandedId === item.id;
        
        return (
          <li 
            key={item.id}
            className={cn(
              'relative',
              onItemClick && 'cursor-pointer hover:bg-muted/50'
            )}
          >
            <div 
              className="flex items-center justify-between p-4"
              onClick={() => handleItemClick(item.id)}
            >
              <div className="flex items-center min-w-0">
                {item.icon && (
                  <div className="mr-3 flex-shrink-0 text-muted-foreground">
                    {item.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-sm text-muted-foreground truncate">
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center ml-4">
                {item.value && (
                  <div className="text-sm font-medium">
                    {item.value}
                  </div>
                )}
                {item.badge && (
                  <div className="ml-2">
                    {item.badge}
                  </div>
                )}
                {expandable && item.details && (
                  <div className="ml-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isExpanded ? 'rotate-180' : ''
                      )}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            {expandable && item.details && isExpanded && (
              <div className="px-4 pb-4 pt-0">
                <div className="border-t pt-3">
                  {item.details}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

interface MobileMetricCardProps {
  title: string;
  value: React.ReactNode;
  change?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  details?: React.ReactNode;
  className?: string;
}

export function MobileMetricCard({
  title,
  value,
  change,
  icon,
  details,
  className,
}: MobileMetricCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div 
      className={cn(
        'rounded-lg border bg-card shadow-sm overflow-hidden',
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {icon && (
              <div className="mr-3 text-muted-foreground">
                {icon}
              </div>
            )}
            <h3 className="text-sm font-medium text-muted-foreground">
              {title}
            </h3>
          </div>
          {details && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded ? 'rotate-180' : ''
                )}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          )}
        </div>
        
        <div className="mt-2 flex items-baseline">
          <div className="text-2xl font-semibold">{value}</div>
          {change && (
            <div 
              className={cn(
                'ml-2 text-sm font-medium',
                change.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
              {change.label && <span className="ml-1 text-muted-foreground">{change.label}</span>}
            </div>
          )}
        </div>
      </div>
      
      {details && isExpanded && (
        <div className="border-t bg-muted/50 px-4 py-3">
          {details}
        </div>
      )}
    </div>
  );
}

interface MobileDataGridProps {
  items: {
    id: string;
    content: React.ReactNode;
  }[];
  columns?: 1 | 2;
  className?: string;
}

export function MobileDataGrid({
  items,
  columns = 2,
  className,
}: MobileDataGridProps) {
  return (
    <div 
      className={cn(
        'grid gap-4',
        columns === 1 ? 'grid-cols-1' : 'grid-cols-2',
        className
      )}
    >
      {items.map((item) => (
        <div 
          key={item.id}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

interface MobileSummaryExpanderProps {
  summary: React.ReactNode;
  details: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function MobileSummaryExpander({
  summary,
  details,
  className,
  defaultOpen = false,
}: MobileSummaryExpanderProps) {
  return (
    <ProgressiveDisclosure
      summary={summary}
      defaultOpen={defaultOpen}
      className={className}
    >
      {details}
    </ProgressiveDisclosure>
  );
}

interface MobileSwipeableListProps {
  items: {
    id: string;
    content: React.ReactNode;
    leftAction?: {
      icon: React.ReactNode;
      label: string;
      onClick: () => void;
      color?: string;
    };
    rightAction?: {
      icon: React.ReactNode;
      label: string;
      onClick: () => void;
      color?: string;
    };
  }[];
  className?: string;
}

export function MobileSwipeableList({
  items,
  className,
}: MobileSwipeableListProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  const handleSwipe = (id: string, direction: 'left' | 'right') => {
    setActiveItemId(id);
    setSwipeDirection(direction);
  };
  
  const resetSwipe = () => {
    setActiveItemId(null);
    setSwipeDirection(null);
  };
  
  const handleAction = (action: () => void) => {
    action();
    resetSwipe();
  };
  
  return (
    <ul 
      className={cn(
        'divide-y divide-border rounded-md border bg-card overflow-hidden',
        className
      )}
    >
      {items.map((item) => {
        const isActive = activeItemId === item.id;
        const touchHandlers = useTouchHandlers({
          onSwipe: (event) => {
            if (event.direction === 'left' && item.rightAction) {
              handleSwipe(item.id, 'left');
            } else if (event.direction === 'right' && item.leftAction) {
              handleSwipe(item.id, 'right');
            }
          },
          onTap: () => {
            if (isActive) {
              resetSwipe();
            }
          },
        });
        
        return (
          <li 
            key={item.id}
            className="relative overflow-hidden"
          >
            {/* Left action */}
            {item.leftAction && (
              <div 
                className={cn(
                  'absolute inset-y-0 left-0 flex items-center justify-center px-4 transition-transform',
                  item.leftAction.color || 'bg-blue-500 text-white',
                  isActive && swipeDirection === 'right' ? 'translate-x-0' : '-translate-x-full'
                )}
                onClick={() => handleAction(item.leftAction!.onClick)}
              >
                <div className="flex flex-col items-center">
                  <div className="h-6 w-6">{item.leftAction.icon}</div>
                  <span className="mt-1 text-xs">{item.leftAction.label}</span>
                </div>
              </div>
            )}
            
            {/* Right action */}
            {item.rightAction && (
              <div 
                className={cn(
                  'absolute inset-y-0 right-0 flex items-center justify-center px-4 transition-transform',
                  item.rightAction.color || 'bg-red-500 text-white',
                  isActive && swipeDirection === 'left' ? 'translate-x-0' : 'translate-x-full'
                )}
                onClick={() => handleAction(item.rightAction!.onClick)}
              >
                <div className="flex flex-col items-center">
                  <div className="h-6 w-6">{item.rightAction.icon}</div>
                  <span className="mt-1 text-xs">{item.rightAction.label}</span>
                </div>
              </div>
            )}
            
            {/* Content */}
            <div 
              className={cn(
                'bg-card p-4 transition-transform',
                isActive && swipeDirection === 'left' ? '-translate-x-20' : '',
                isActive && swipeDirection === 'right' ? 'translate-x-20' : ''
              )}
              {...touchHandlers}
            >
              {item.content}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default {
  DataList: MobileDataList,
  MetricCard: MobileMetricCard,
  DataGrid: MobileDataGrid,
  SummaryExpander: MobileSummaryExpander,
  SwipeableList: MobileSwipeableList,
};