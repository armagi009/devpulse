'use client';

/**
 * TouchFriendlyControls Component
 * 
 * Provides optimized UI controls for touch interfaces (mobile and tablet)
 * Implements larger touch targets, appropriate spacing, and touch-specific interactions
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  useTouchHandlers, 
  isTouchDevice, 
  isTabletViewport, 
  isMobileViewport,
  provideHapticFeedback,
  useViewportType
} from '@/lib/utils/touch-interactions';
import { cn } from '@/lib/utils';

interface TouchFriendlyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function TouchFriendlyButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  ...props
}: TouchFriendlyButtonProps) {
  // Determine if we're on a touch device
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);
  
  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500';
      case 'secondary':
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600';
      case 'outline':
        return 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800';
      case 'ghost':
        return 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800';
      default:
        return 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500';
    }
  };
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return isTouch ? 'text-sm py-2 px-3 min-h-[40px]' : 'text-sm py-1 px-2';
      case 'md':
        return isTouch ? 'text-base py-3 px-4 min-h-[48px]' : 'text-base py-2 px-3';
      case 'lg':
        return isTouch ? 'text-lg py-4 px-6 min-h-[56px]' : 'text-lg py-3 px-5';
      default:
        return isTouch ? 'text-base py-3 px-4 min-h-[48px]' : 'text-base py-2 px-3';
    }
  };
  
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        getVariantClasses(),
        getSizeClasses(),
        fullWidth ? 'w-full' : '',
        isTouch ? 'touch-target' : '',
        className
      )}
      {...props}
    >
      <span className="flex items-center justify-center">
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </span>
    </button>
  );
}

interface TouchFriendlySelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: { value: string; label: string }[];
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  fullWidth?: boolean;
}

export function TouchFriendlySelect({
  options,
  label,
  size = 'md',
  error,
  fullWidth = false,
  className,
  ...props
}: TouchFriendlySelectProps) {
  // Determine if we're on a touch device
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return isTouch ? 'text-sm py-2 px-3 min-h-[40px]' : 'text-sm py-1 px-2';
      case 'md':
        return isTouch ? 'text-base py-3 px-4 min-h-[48px]' : 'text-base py-2 px-3';
      case 'lg':
        return isTouch ? 'text-lg py-4 px-6 min-h-[56px]' : 'text-lg py-3 px-5';
      default:
        return isTouch ? 'text-base py-3 px-4 min-h-[48px]' : 'text-base py-2 px-3';
    }
  };
  
  return (
    <div className={cn('flex flex-col', fullWidth ? 'w-full' : '')}>
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            'block w-full appearance-none rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
            getSizeClasses(),
            error ? 'border-red-500' : '',
            isTouch ? 'touch-target pr-10' : 'pr-8',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface TouchFriendlyTabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function TouchFriendlyTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: TouchFriendlyTabsProps) {
  // Handle swipe gestures for tab navigation
  const touchHandlers = useTouchHandlers({
    onSwipe: (event) => {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      if (currentIndex === -1) return;
      
      if (event.direction === 'left' && currentIndex < tabs.length - 1) {
        onChange(tabs[currentIndex + 1].id);
      } else if (event.direction === 'right' && currentIndex > 0) {
        onChange(tabs[currentIndex - 1].id);
      }
    },
  });
  
  return (
    <div
      className={cn('overflow-x-auto', className)}
      {...touchHandlers}
    >
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex min-w-[80px] items-center justify-center whitespace-nowrap px-4 py-3 text-sm font-medium',
              activeTab === tab.id
                ? 'border-b-2 border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
              isTouchDevice() ? 'min-h-[48px]' : ''
            )}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SwipeableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className,
  ...props
}: SwipeableCardProps) {
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  
  const touchHandlers = useTouchHandlers({
    onSwipe: (event) => {
      if (event.direction === 'left' && onSwipeLeft) {
        setSwipeDirection('left');
        setTimeout(() => {
          onSwipeLeft();
          setSwipeDirection(null);
        }, 300);
      } else if (event.direction === 'right' && onSwipeRight) {
        setSwipeDirection('right');
        setTimeout(() => {
          onSwipeRight();
          setSwipeDirection(null);
        }, 300);
      }
    },
  });
  
  return (
    <div
      className={cn(
        'relative transition-transform duration-300',
        swipeDirection === 'left' ? 'translate-x-[-100px]' : '',
        swipeDirection === 'right' ? 'translate-x-[100px]' : '',
        className
      )}
      {...touchHandlers}
      {...props}
    >
      {children}
    </div>
  );
}

interface TouchFriendlyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function TouchFriendlyInput({
  label,
  error,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className,
  ...props
}: TouchFriendlyInputProps) {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);
  
  return (
    <div className={cn('flex flex-col', fullWidth ? 'w-full' : '')}>
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'block rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
            isTouch ? 'touch-form-control' : 'py-2 px-3',
            icon && iconPosition === 'left' ? 'pl-10' : '',
            icon && iconPosition === 'right' ? 'pr-10' : '',
            error ? 'border-red-500' : '',
            className
          )}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface TouchFriendlyCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TouchFriendlyCheckbox({
  label,
  error,
  className,
  ...props
}: TouchFriendlyCheckboxProps) {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);
  
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          className={cn(
            'focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded',
            isTouch ? 'touch-checkbox' : '',
            className
          )}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label className="font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}

interface TouchFriendlyRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TouchFriendlyRadio({
  label,
  error,
  className,
  ...props
}: TouchFriendlyRadioProps) {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);
  
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          type="radio"
          className={cn(
            'focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300',
            isTouch ? 'touch-radio' : '',
            className
          )}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label className="font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}

interface TouchFriendlySliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  min: number;
  max: number;
  showValue?: boolean;
  error?: string;
}

export function TouchFriendlySlider({
  label,
  min,
  max,
  showValue = false,
  error,
  className,
  value,
  ...props
}: TouchFriendlySliderProps) {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);
  
  return (
    <div className="flex flex-col">
      {label && (
        <div className="flex justify-between">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          {showValue && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{value}</span>
          )}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        className={cn(
          'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700',
          isTouch ? 'touch-target' : '',
          className
        )}
        value={value}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface TouchFriendlyToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function TouchFriendlyToggle({
  label,
  error,
  className,
  checked,
  ...props
}: TouchFriendlyToggleProps) {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);
  
  return (
    <div className="flex items-center">
      <div className="relative inline-block">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          {...props}
        />
        <div
          className={cn(
            'block w-14 h-8 rounded-full',
            checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700',
            isTouch ? 'touch-target' : ''
          )}
        />
        <div
          className={cn(
            'absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out',
            checked ? 'transform translate-x-6' : ''
          )}
        />
      </div>
      {label && (
        <label className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface SwipeToActionProps {
  children: React.ReactNode;
  leftAction?: {
    label: string;
    icon?: React.ReactNode;
    color: string;
    onAction: () => void;
  };
  rightAction?: {
    label: string;
    icon?: React.ReactNode;
    color: string;
    onAction: () => void;
  };
  className?: string;
}

export function SwipeToAction({
  children,
  leftAction,
  rightAction,
  className,
}: SwipeToActionProps) {
  const [swipeState, setSwipeState] = useState<'idle' | 'left' | 'right'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const touchHandlers = useTouchHandlers({
    onSwipe: (event) => {
      if (event.isLongSwipe) {
        if (event.direction === 'left' && rightAction) {
          setSwipeState('left');
          provideHapticFeedback('medium');
          setTimeout(() => {
            rightAction.onAction();
            setSwipeState('idle');
          }, 300);
        } else if (event.direction === 'right' && leftAction) {
          setSwipeState('right');
          provideHapticFeedback('medium');
          setTimeout(() => {
            leftAction.onAction();
            setSwipeState('idle');
          }, 300);
        }
      }
    },
  });
  
  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      <div
        className={cn(
          'relative z-10 bg-white dark:bg-gray-800 transition-transform duration-300',
          swipeState === 'left' ? 'transform -translate-x-20' : '',
          swipeState === 'right' ? 'transform translate-x-20' : '',
          className
        )}
        {...touchHandlers}
      >
        {children}
      </div>
      
      {leftAction && (
        <div 
          className="absolute inset-y-0 left-0 flex items-center justify-center px-4"
          style={{ backgroundColor: leftAction.color }}
        >
          {leftAction.icon}
          <span className="text-white font-medium ml-1">{leftAction.label}</span>
        </div>
      )}
      
      {rightAction && (
        <div 
          className="absolute inset-y-0 right-0 flex items-center justify-center px-4"
          style={{ backgroundColor: rightAction.color }}
        >
          {rightAction.icon}
          <span className="text-white font-medium ml-1">{rightAction.label}</span>
        </div>
      )}
    </div>
  );
}

export default {
  Button: TouchFriendlyButton,
  Select: TouchFriendlySelect,
  Tabs: TouchFriendlyTabs,
  SwipeableCard,
  Input: TouchFriendlyInput,
  Checkbox: TouchFriendlyCheckbox,
  Radio: TouchFriendlyRadio,
  Slider: TouchFriendlySlider,
  Toggle: TouchFriendlyToggle,
  SwipeToAction
};