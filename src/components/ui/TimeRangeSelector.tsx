'use client';

/**
 * TimeRangeSelector Component
 * A reusable component for selecting time ranges across the application
 */

import React, { useState, useEffect } from 'react';
import { useNavigation } from '../layout/NavigationContext';
import { Popover } from './popover';
import { Calendar } from './calendar';
import { format } from 'date-fns';
import { isTouchDevice, isTabletViewport } from '@/lib/utils/touch-interactions';
import { cn } from '@/lib/utils';

interface TimeRangeOption {
  label: string;
  value: string;
  days: number;
}

interface TimeRangeSelectorProps {
  onChange: (range: { start: Date; end: Date }) => void;
  defaultRange?: { start: Date; end: Date };
  pageId?: string; // Used to persist state between page navigations
  className?: string;
}

export default function TimeRangeSelector({
  onChange,
  defaultRange,
  pageId,
  className = '',
}: TimeRangeSelectorProps) {
  // Predefined time range options
  const timeRangeOptions: TimeRangeOption[] = [
    { label: 'Last 7 days', value: '7d', days: 7 },
    { label: 'Last 14 days', value: '14d', days: 14 },
    { label: 'Last 30 days', value: '30d', days: 30 },
    { label: 'Last 90 days', value: '90d', days: 90 },
    { label: 'Custom', value: 'custom', days: 0 },
  ];

  // Get navigation context for state persistence
  const { setFilterState, getFilterState } = useNavigation();

  // Initialize state from context if available
  const initialState = pageId ? getFilterState(pageId)?.timeRange : null;

  // State for selected range
  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
    preset?: string;
  }>(
    initialState || {
      start: defaultRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: defaultRange?.end || new Date(),
      preset: '30d',
    }
  );

  // State for calendar date selection
  const [calendarDates, setCalendarDates] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({
    start: selectedRange.start,
    end: selectedRange.end,
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
  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') {
      // Open calendar for custom selection
      setSelectedRange({
        ...selectedRange,
        preset,
      });
      return;
    }

    const option = timeRangeOptions.find((opt) => opt.value === preset);
    if (!option) return;

    const end = new Date();
    const start = new Date(end.getTime() - option.days * 24 * 60 * 60 * 1000);

    const newRange = {
      start,
      end,
      preset,
    };

    setSelectedRange(newRange);
    setCalendarDates({ start, end });
    onChange({ start, end });

    // Persist state if pageId is provided
    if (pageId) {
      setFilterState(pageId, {
        ...getFilterState(pageId),
        timeRange: newRange,
      });
    }
  };

  // Handle custom date range selection
  const handleCustomRangeSelect = (dates: { start?: Date; end?: Date }) => {
    if (dates.start && dates.end) {
      const newRange = {
        start: dates.start,
        end: dates.end,
        preset: 'custom',
      };

      setSelectedRange(newRange);
      onChange({ start: dates.start, end: dates.end });

      // Persist state if pageId is provided
      if (pageId) {
        setFilterState(pageId, {
          ...getFilterState(pageId),
          timeRange: newRange,
        });
      }
    } else {
      setCalendarDates(dates);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  // Apply initial range on mount
  useEffect(() => {
    onChange({ start: selectedRange.start, end: selectedRange.end });
  }, []);

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center gap-2",
      isTablet && "tablet-spacing",
      className
    )}>
      <div className={cn(
        "flex space-x-2",
        isTablet && "flex-wrap gap-2 space-x-0 tablet-nav"
      )}>
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handlePresetChange(option.value)}
            className={cn(
              "px-3 py-1 text-sm rounded-md touch-feedback",
              selectedRange.preset === option.value
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              isTablet && "py-2.5 px-4 text-base min-h-[44px] min-w-[100px]"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {selectedRange.preset === 'custom' && (
        <Popover>
          <Popover.Trigger asChild>
            <button className={cn(
              "inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 touch-feedback",
              isTablet && "py-3 px-5 text-base min-h-[48px] w-full mt-2 sm:w-auto"
            )}>
              {formatDate(selectedRange.start)} - {formatDate(selectedRange.end)}
              <svg
                className="ml-2 h-4 w-4"
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
          <Popover.Content className={cn(
            "w-auto p-0",
            isTablet && "w-[calc(100vw-40px)] max-w-[600px]"
          )} align="start">
            <Calendar
              mode="range"
              selected={calendarDates}
              onSelect={handleCustomRangeSelect}
              initialFocus
              numberOfMonths={isTablet ? 1 : 2}
              className={isTablet ? "touch-target" : ""}
            />
          </Popover.Content>
        </Popover>
      )}
    </div>
  );
}