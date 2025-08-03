'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorColor?: string;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    animate?: boolean;
    label?: string;
  }
>(({ 
  className, 
  value = 0, 
  max = 100, 
  indicatorColor, 
  size = 'md', 
  showValue = false,
  animate = true,
  label,
  ...props 
}, ref) => {
  const percentage = value != null ? Math.round((value / max) * 100) : 0;
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showValue && <span className="text-sm text-muted-foreground">{percentage}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-full bg-secondary',
          sizeClasses[size],
          className
        )}
        style={{
          // Fix overflow clipping in Safari
          transform: 'translateZ(0)',
        }}
        value={value}
        max={max}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 transition-all',
            animate && 'animate-progress',
            indicatorColor || 'bg-primary'
          )}
          style={{ 
            transform: `translateX(-${100 - percentage}%)`,
          }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

// Step indicator component for multi-step processes
interface StepIndicatorProps {
  steps: Array<{
    label: string;
    status: 'completed' | 'current' | 'upcoming';
    description?: string;
  }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  orientation = 'horizontal',
  className,
}) => {
  const isVertical = orientation === 'vertical';
  
  return (
    <div 
      className={cn(
        'w-full',
        isVertical ? 'flex flex-col space-y-4' : 'flex justify-between',
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';
        
        return (
          <div 
            key={index} 
            className={cn(
              'relative',
              isVertical ? 'pl-8' : 'flex flex-col items-center'
            )}
          >
            {/* Step connector */}
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  isVertical 
                    ? 'absolute left-[15px] top-[30px] h-full w-0.5' 
                    : 'absolute top-[15px] h-0.5 w-full',
                  'bg-secondary'
                )}
              >
                <div 
                  className={cn(
                    'bg-primary h-full',
                    isCompleted ? 'w-full' : 'w-0'
                  )}
                />
              </div>
            )}
            
            {/* Step indicator */}
            <div 
              className={cn(
                'flex items-center justify-center rounded-full w-8 h-8 z-10',
                isVertical ? 'absolute left-0 top-0' : 'mx-auto',
                isCompleted ? 'bg-primary text-primary-foreground' : 
                isCurrent ? 'bg-primary/20 border-2 border-primary text-primary' : 
                'bg-secondary text-secondary-foreground'
              )}
            >
              {isCompleted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            
            {/* Step content */}
            <div 
              className={cn(
                'mt-2',
                isVertical ? '' : 'text-center'
              )}
            >
              <p 
                className={cn(
                  'font-medium',
                  isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { Progress, StepIndicator };