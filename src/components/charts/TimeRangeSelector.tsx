'use client';

/**
 * TimeRangeSelector Component
 * A standardized component for selecting time ranges across the application
 * Uses TimeRangeContext for synchronized time range selection
 */

import React, { useState, useEffect } from 'react';
import { Popover } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { isTouchDevice, isTabletViewport } from '@/lib/utils/touch-interactions';
import { cn } from '@/lib/utils';
import { useTimeRange, TimeRangePreset } from './TimeRangeContext';

interface TimeRangeSelectorProps {
  onChange?: (range: { start: Date; end: Date }) => void;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  onChange,
  className = '',
  showLabel = false,
  compact = false,
}) => {
  // Use the time range context
  const { timeRange, setTimeRange, setPreset, presets } = useTimeRange();
  
  // State for calendar date selection
  const [calendarDates, setCalendarDates] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({
    start: timeRange.startDate,
    end: timeRange.endDate,
  });
  
  // State to track if we're on a tablet
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

  // Update the time range when a preset is selected
  const handlePresetChange = (preset: TimeRangePreset) => {
    if (preset === 'custom') {
      // Just switch to custom mode without changing dates yet
      setPreset('custom');
      return;
    }

    // Set the preset which will update the context
    setPreset(preset);
    
    // Call the onChange callback if provided
    if (onChange) {
      const newRange = presets[preset].getRange();
      onChange({ 
        start: newRange.startDate, 
        end: newRange.endDate 
      });
    }
  };

  // Handle custom date range selection
  const handleCustomRangeSelect = (dates: { start?: Date; end?: Date }) => {
    if (dates.start && dates.end) {
      // Update the context with the custom range
      setTimeRange({
        startDate: dates.start,
        endDate: dates.end,
        preset: 'custom',
      });
      
      // Call the onChange callback if provided
      if (onChange) {
        onChange({ 
          start: dates.start, 
          end: dates.end 
        });
      }
    } else {
      // Just update the calendar state
      setCalendarDates(dates);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  // Update calendar dates when timeRange changes
  useEffect(() => {
    setCalendarDates({
      start: timeRange.startDate,
      end: timeRange.endDate,
    });
  }, [timeRange]);

  // Call onChange on initial render
  useEffect(() => {
    if (onChange) {
      onChange({ 
        start: timeRange.startDate, 
        end: timeRange.endDate 
      });
    }
  }, []);

  // Create an array of preset options
  const timeRangeOptions = Object.entries(presets).map(([key, value]) => ({
    label: value.label,
    value: key as TimeRangePreset,
  }));

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center gap-2",
      isTablet && "tablet-spacing",
      className
    )}>
      {showLabel && (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
          Time Range:
        </div>
      )}
      
      <div className={cn(
        "flex space-x-2",
        isTablet && "flex-wrap gap-2 space-x-0 tablet-nav",
        compact && "flex-wrap gap-1"
      )}>
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handlePresetChange(option.value)}
            className={cn(
              "px-3 py-1 text-sm rounded-md touch-feedback transition-colors",
              timeRange.preset === option.value
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              isTablet && "py-2.5 px-4 text-base min-h-[44px] min-w-[100px]",
              compact && "py-0.5 px-2 text-xs"
            )}
            data-testid={`time-range-preset-${option.value}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {timeRange.preset === 'custom' && (
        <Popover>
          <Popover.Trigger asChild>
            <button 
              className={cn(
                "inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 touch-feedback",
                isTablet && "py-3 px-5 text-base min-h-[48px] w-full mt-2 sm:w-auto",
                compact && "py-1 px-3 text-xs"
              )}
              data-testid="time-range-custom-button"
            >
              {formatDate(timeRange.startDate)} - {formatDate(timeRange.endDate)}
              <svg
                className={cn("ml-2 h-4 w-4", compact && "h-3 w-3")}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </Popover.Trigger>
          <Popover.Content 
            className={cn(
              "w-auto p-0",
              isTablet && "w-[calc(100vw-40px)] max-w-[600px]"
            )} 
            align="start"
            data-testid="time-range-calendar"
          >
            <Calendar
              mode="range"
              selected={{
                from: calendarDates.start,
                to: calendarDates.end,
              }}
              onSelect={(range) => {
                handleCustomRangeSelect({
                  start: range?.from,
                  end: range?.to,
                });
              }}
              initialFocus
              numberOfMonths={isTablet ? 1 : 2}
              className={isTablet ? "touch-target" : ""}
            />
          </Popover.Content>
        </Popover>
      )}
    </div>
  );
};

export default TimeRangeSelector;