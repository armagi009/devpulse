'use client';

/**
 * FilterBar Component
 * A reusable component for filtering data across the application
 */

import React, { useState, useEffect } from 'react';
import { useFilter } from '@/components/layout/FilterContext';
import TimeRangeSelector from './TimeRangeSelector';
import { isTouchDevice, isTabletViewport } from '@/lib/utils/touch-interactions';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  multiple?: boolean;
}

interface SortOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  pageId: string;
  onFilterChange: (filters: Record<string, any>) => void;
  filterOptions?: FilterOption[];
  sortOptions?: SortOption[];
  showTimeRange?: boolean;
  className?: string;
}

export default function FilterBar({
  pageId,
  onFilterChange,
  filterOptions = [],
  sortOptions = [],
  showTimeRange = true,
  className = '',
}: FilterBarProps) {
  const { getFilterState, setFilterState } = useFilter();
  
  // Get saved filter state or use default
  const savedFilters = getFilterState(pageId);
  
  // State for filters
  const [filters, setFilters] = useState<Record<string, any>>(
    savedFilters?.filters || {}
  );
  
  // State for sort
  const [sortBy, setSortBy] = useState<string>(
    savedFilters?.sortBy || (sortOptions.length > 0 ? sortOptions[0].value : '')
  );
  
  // State for time range
  const [timeRange, setTimeRange] = useState<{ start: Date; end: Date }>(
    savedFilters?.timeRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    }
  );
  
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
  
  // Handle filter change
  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = {
      ...filters,
      [filterId]: value,
    };
    
    setFilters(newFilters);
    
    // Save to filter context
    setFilterState(pageId, {
      ...getFilterState(pageId),
      filters: newFilters,
    });
    
    // Notify parent
    onFilterChange({
      filters: newFilters,
      sortBy,
      timeRange,
    });
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    
    // Save to filter context
    setFilterState(pageId, {
      ...getFilterState(pageId),
      sortBy: value,
    });
    
    // Notify parent
    onFilterChange({
      filters,
      sortBy: value,
      timeRange,
    });
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range: { start: Date; end: Date }) => {
    setTimeRange(range);
    
    // Save to filter context
    setFilterState(pageId, {
      ...getFilterState(pageId),
      timeRange: range,
    });
    
    // Notify parent
    onFilterChange({
      filters,
      sortBy,
      timeRange: range,
    });
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    const defaultTimeRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    };
    
    const defaultSortBy = sortOptions.length > 0 ? sortOptions[0].value : '';
    
    setFilters({});
    setSortBy(defaultSortBy);
    setTimeRange(defaultTimeRange);
    
    // Save to filter context
    setFilterState(pageId, {
      filters: {},
      sortBy: defaultSortBy,
      timeRange: defaultTimeRange,
    });
    
    // Notify parent
    onFilterChange({
      filters: {},
      sortBy: defaultSortBy,
      timeRange: defaultTimeRange,
    });
  };
  
  // Notify parent on mount
  useEffect(() => {
    onFilterChange({
      filters,
      sortBy,
      timeRange,
    });
  }, []);
  
  return (
    <div className={cn('space-y-4', isTablet && 'tablet-spacing', className)}>
      {/* Time Range Selector */}
      {showTimeRange && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Time Range
          </label>
          <TimeRangeSelector
            onChange={handleTimeRangeChange}
            defaultRange={timeRange}
            pageId={pageId}
          />
        </div>
      )}
      
      <div className={cn(
        "flex flex-wrap gap-4",
        isTablet && "tablet-grid grid grid-cols-2 gap-4"
      )}>
        {/* Filter Options */}
        {filterOptions.map((filter) => (
          <div key={filter.id} className={cn(
            "w-full sm:w-auto",
            isTablet && "col-span-1"
          )}>
            <label
              htmlFor={filter.id}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {filter.label}
            </label>
            <select
              id={filter.id}
              value={filters[filter.id] || ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              className={cn(
                "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white",
                isTablet && "touch-target py-3 px-4 text-base"
              )}
            >
              <option value="">All</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        
        {/* Sort Options */}
        {sortOptions.length > 0 && (
          <div className={cn(
            "w-full sm:w-auto",
            isTablet && "col-span-1"
          )}>
            <label
              htmlFor="sort-by"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className={cn(
                "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white",
                isTablet && "touch-target py-3 px-4 text-base"
              )}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Reset Button */}
        <div className={cn(
          "w-full sm:w-auto self-end",
          isTablet && "col-span-2 mt-4"
        )}>
          <button
            type="button"
            onClick={handleResetFilters}
            className={cn(
              "inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 touch-feedback",
              isTablet && "touch-target py-3 px-5 text-base w-full justify-center"
            )}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}