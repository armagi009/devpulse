import React, { useState, useRef, useEffect } from 'react';
import { useChartTheme } from './ChartThemeProvider';
import { cn } from '@/lib/utils';

export interface ChartTooltipProps {
  title?: string;
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  showIcon?: boolean;
  interactive?: boolean;
  maxWidth?: number | string;
}

/**
 * ChartTooltip component for displaying additional information on hover
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  title,
  content,
  children,
  position = 'top',
  className = '',
  showIcon = true,
  interactive = false,
  maxWidth = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const theme = useChartTheme();
  
  // Position the tooltip
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipEl = tooltipRef.current;
      const triggerEl = triggerRef.current;
      const triggerRect = triggerEl.getBoundingClientRect();
      
      // Calculate position based on the specified direction
      let top = 0;
      let left = 0;
      
      switch (position) {
        case 'top':
          top = -tooltipEl.offsetHeight - 8;
          left = (triggerEl.offsetWidth - tooltipEl.offsetWidth) / 2;
          break;
        case 'right':
          top = (triggerEl.offsetHeight - tooltipEl.offsetHeight) / 2;
          left = triggerEl.offsetWidth + 8;
          break;
        case 'bottom':
          top = triggerEl.offsetHeight + 8;
          left = (triggerEl.offsetWidth - tooltipEl.offsetWidth) / 2;
          break;
        case 'left':
          top = (triggerEl.offsetHeight - tooltipEl.offsetHeight) / 2;
          left = -tooltipEl.offsetWidth - 8;
          break;
      }
      
      // Apply position
      tooltipEl.style.top = `${top}px`;
      tooltipEl.style.left = `${left}px`;
      
      // Adjust if tooltip would go off screen
      const tooltipRect = tooltipEl.getBoundingClientRect();
      
      if (tooltipRect.left < 0) {
        tooltipEl.style.left = '0px';
      } else if (tooltipRect.right > window.innerWidth) {
        tooltipEl.style.left = `${triggerEl.offsetWidth - tooltipRect.width}px`;
      }
      
      if (tooltipRect.top < 0) {
        tooltipEl.style.top = '0px';
      } else if (tooltipRect.bottom > window.innerHeight) {
        tooltipEl.style.top = `${triggerEl.offsetHeight - tooltipRect.height}px`;
      }
    }
  }, [isVisible, position]);
  
  // Handle mouse events
  const handleMouseEnter = () => {
    setIsVisible(true);
  };
  
  const handleMouseLeave = () => {
    if (!interactive) {
      setIsVisible(false);
    }
  };
  
  // Handle click for interactive tooltips
  const handleClick = () => {
    if (interactive) {
      setIsVisible(!isVisible);
    }
  };
  
  // Handle click outside for interactive tooltips
  useEffect(() => {
    if (interactive && isVisible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          tooltipRef.current && 
          !tooltipRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setIsVisible(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [interactive, isVisible]);
  
  return (
    <div 
      className={cn(
        "chart-tooltip-container relative inline-block",
        className
      )}
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-testid="chart-tooltip-trigger"
    >
      {children}
      
      {showIcon && (
        <span className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-4 h-4 inline-block"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" 
              clipRule="evenodd" 
            />
          </svg>
        </span>
      )}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-50 p-3 rounded-md shadow-lg",
            "bg-white dark:bg-gray-800",
            "border border-gray-200 dark:border-gray-700",
            "text-sm text-gray-700 dark:text-gray-300",
            interactive ? "min-w-[200px]" : ""
          )}
          style={{
            maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          }}
          data-testid="chart-tooltip-content"
        >
          {title && (
            <div className="font-medium mb-1 text-gray-900 dark:text-gray-100">
              {title}
            </div>
          )}
          <div>{content}</div>
          
          {/* Arrow based on position */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-white dark:bg-gray-800 rotate-45",
              "border border-gray-200 dark:border-gray-700",
              position === 'top' && "bottom-[-5px] left-1/2 transform -translate-x-1/2 border-t-0 border-l-0",
              position === 'right' && "left-[-5px] top-1/2 transform -translate-y-1/2 border-t-0 border-r-0",
              position === 'bottom' && "top-[-5px] left-1/2 transform -translate-x-1/2 border-b-0 border-r-0",
              position === 'left' && "right-[-5px] top-1/2 transform -translate-y-1/2 border-b-0 border-l-0"
            )}
          />
        </div>
      )}
    </div>
  );
};

export default ChartTooltip;