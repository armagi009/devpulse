'use client';

/**
 * FilterStateProvider Component
 * A wrapper component that manages filter state for a specific page
 */

import React, { useState, useEffect } from 'react';
import { useFilter } from '@/components/layout/FilterContext';
import FilterBar from './FilterBar';

interface FilterStateProviderProps {
  pageId: string;
  children: (filterState: any, loading: boolean) => React.ReactNode;
  filterOptions?: Array<{
    id: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    multiple?: boolean;
  }>;
  sortOptions?: Array<{ value: string; label: string }>;
  showTimeRange?: boolean;
  fetchData: (filterState: any) => Promise<any>;
  className?: string;
}

export default function FilterStateProvider({
  pageId,
  children,
  filterOptions = [],
  sortOptions = [],
  showTimeRange = true,
  fetchData,
  className = '',
}: FilterStateProviderProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [currentFilterState, setCurrentFilterState] = useState<any>(null);

  // Handle filter changes
  const handleFilterChange = async (filterState: any) => {
    setLoading(true);
    setCurrentFilterState(filterState);
    
    try {
      const result = await fetchData(filterState);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <FilterBar
        pageId={pageId}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        showTimeRange={showTimeRange}
      />
      
      {children(data, loading)}
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400 dark:text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading data
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}