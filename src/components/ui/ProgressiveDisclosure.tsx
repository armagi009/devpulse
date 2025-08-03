'use client';

/**
 * ProgressiveDisclosure Component
 * 
 * A mobile-first component that progressively reveals complex data
 * to improve usability on small screens.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveDisclosureProps {
  summary: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
  defaultOpen?: boolean;
  icon?: boolean;
  compact?: boolean;
}

export function ProgressiveDisclosure({
  summary,
  children,
  className,
  summaryClassName,
  contentClassName,
  defaultOpen = false,
  icon = true,
  compact = false,
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div 
      className={cn(
        'border rounded-lg overflow-hidden',
        className
      )}
    >
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          'flex w-full items-center justify-between bg-muted/50 px-4 text-left font-medium transition-all',
          compact ? 'py-2 text-sm' : 'py-3',
          summaryClassName
        )}
        aria-expanded={isOpen}
      >
        <span>{summary}</span>
        {icon && (
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
              'h-4 w-4 transition-transform duration-200',
              isOpen ? 'rotate-180 transform' : ''
            )}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        )}
      </button>
      
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div 
          className={cn(
            'p-4',
            compact && 'p-3',
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface ProgressiveTabsProps {
  tabs: {
    id: string;
    label: React.ReactNode;
    content: React.ReactNode;
  }[];
  defaultTabId?: string;
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
}

export function ProgressiveTabs({
  tabs,
  defaultTabId,
  className,
  tabsClassName,
  contentClassName,
}: ProgressiveTabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);
  
  return (
    <div className={className}>
      <div 
        className={cn(
          'flex overflow-x-auto scrollbar-hide space-x-1 border-b',
          tabsClassName
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium whitespace-nowrap',
              activeTabId === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className={cn('py-4', contentClassName)}>
        {tabs.find(tab => tab.id === activeTabId)?.content}
      </div>
    </div>
  );
}

interface ProgressiveStepsProps {
  steps: {
    id: string;
    label: React.ReactNode;
    content: React.ReactNode;
  }[];
  currentStepId: string;
  onStepChange?: (stepId: string) => void;
  className?: string;
  stepsClassName?: string;
  contentClassName?: string;
}

export function ProgressiveSteps({
  steps,
  currentStepId,
  onStepChange,
  className,
  stepsClassName,
  contentClassName,
}: ProgressiveStepsProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  
  return (
    <div className={className}>
      <div 
        className={cn(
          'mb-4 overflow-x-auto scrollbar-hide',
          stepsClassName
        )}
      >
        <div className="flex min-w-max">
          {steps.map((step, index) => {
            const isActive = step.id === currentStepId;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div 
                key={step.id}
                className="flex items-center"
              >
                {index > 0 && (
                  <div 
                    className={cn(
                      'h-0.5 w-8',
                      index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
                <button
                  onClick={() => onStepChange?.(step.id)}
                  disabled={!onStepChange}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                    isActive && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-primary/80 text-primary-foreground',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
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
                      className="h-4 w-4"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>
                <div className="ml-2 hidden sm:block">
                  <div className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {step.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className={contentClassName}>
        {steps.find(step => step.id === currentStepId)?.content}
      </div>
    </div>
  );
}

export default {
  Disclosure: ProgressiveDisclosure,
  Tabs: ProgressiveTabs,
  Steps: ProgressiveSteps,
};