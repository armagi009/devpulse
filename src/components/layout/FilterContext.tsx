'use client';

/**
 * FilterContext
 * Provides context for filter state persistence across the application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface FilterState {
  timeRange?: {
    start: Date;
    end: Date;
    preset?: string;
  };
  filters?: Record<string, any>;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  view?: string;
  page?: number;
  perPage?: number;
}

interface FilterContextType {
  // Get filter state for a specific page
  getFilterState: (pageId: string) => FilterState | null;
  
  // Set filter state for a specific page
  setFilterState: (pageId: string, state: FilterState) => void;
  
  // Reset filter state for a specific page
  resetFilterState: (pageId: string) => void;
  
  // Reset all filter states
  resetAllFilterStates: () => void;
}

const FilterContext = createContext<FilterContextType>({
  getFilterState: () => null,
  setFilterState: () => {},
  resetFilterState: () => {},
  resetAllFilterStates: () => {},
});

export const useFilter = () => useContext(FilterContext);

interface FilterProviderProps {
  children: React.ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
  // State for filter states by page
  const [filterStates, setFilterStates] = useState<Record<string, FilterState>>({});
  const pathname = usePathname();
  
  // Load filter states from localStorage on mount
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem('devpulse_filter_states');
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        
        // Convert date strings back to Date objects
        Object.keys(parsed).forEach(pageId => {
          if (parsed[pageId].timeRange) {
            parsed[pageId].timeRange.start = new Date(parsed[pageId].timeRange.start);
            parsed[pageId].timeRange.end = new Date(parsed[pageId].timeRange.end);
          }
        });
        
        setFilterStates(parsed);
      }
    } catch (error) {
      console.error('Failed to load filter states:', error);
    }
  }, []);
  
  // Save filter states to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('devpulse_filter_states', JSON.stringify(filterStates));
    } catch (error) {
      console.error('Failed to save filter states:', error);
    }
  }, [filterStates]);
  
  // Method to get filter state for a specific page
  const getFilterState = (pageId: string): FilterState | null => {
    return filterStates[pageId] || null;
  };
  
  // Method to set filter state for a specific page
  const setFilterState = (pageId: string, state: FilterState) => {
    setFilterStates((prev) => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        ...state,
      },
    }));
  };
  
  // Method to reset filter state for a specific page
  const resetFilterState = (pageId: string) => {
    setFilterStates((prev) => {
      const newState = { ...prev };
      delete newState[pageId];
      return newState;
    });
  };
  
  // Method to reset all filter states
  const resetAllFilterStates = () => {
    setFilterStates({});
  };
  
  const value = {
    getFilterState,
    setFilterState,
    resetFilterState,
    resetAllFilterStates,
  };
  
  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}