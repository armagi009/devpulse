'use client';

/**
 * NavigationContext
 * Provides context for navigation state preservation between pages
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface NavigationContextType {
  // Previous path for back navigation
  previousPath: string | null;
  
  // Store filter states for different pages
  filterStates: Record<string, any>;
  
  // Methods to update context
  setFilterState: (page: string, state: any) => void;
  getFilterState: (page: string) => any;
  
  // Navigation history
  navigationHistory: string[];
}

const NavigationContext = createContext<NavigationContextType>({
  previousPath: null,
  filterStates: {},
  setFilterState: () => {},
  getFilterState: () => null,
  navigationHistory: [],
});

export const useNavigation = () => useContext(NavigationContext);

interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // State for previous path
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  
  // State for filter states by page
  const [filterStates, setFilterStates] = useState<Record<string, any>>({});
  
  // Navigation history
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  
  // Update navigation history when path changes
  useEffect(() => {
    if (!pathname) return;
    
    // Create full URL with search params
    const fullPath = searchParams?.toString() 
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    
    // Update previous path
    if (navigationHistory.length > 0) {
      setPreviousPath(navigationHistory[navigationHistory.length - 1]);
    }
    
    // Add current path to history if it's different from the last one
    setNavigationHistory((prev) => {
      if (prev.length === 0 || prev[prev.length - 1] !== fullPath) {
        // Limit history size to prevent memory issues
        const newHistory = [...prev, fullPath];
        if (newHistory.length > 10) {
          return newHistory.slice(newHistory.length - 10);
        }
        return newHistory;
      }
      return prev;
    });
  }, [pathname, searchParams]);
  
  // Method to set filter state for a specific page
  const setFilterState = (page: string, state: any) => {
    setFilterStates((prev) => ({
      ...prev,
      [page]: state,
    }));
  };
  
  // Method to get filter state for a specific page
  const getFilterState = (page: string) => {
    return filterStates[page] || null;
  };
  
  const value = {
    previousPath,
    filterStates,
    setFilterState,
    getFilterState,
    navigationHistory,
  };
  
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}