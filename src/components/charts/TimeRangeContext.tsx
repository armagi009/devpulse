import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Define time range types
export type TimeRangePreset = '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';

export interface TimeRange {
  startDate: Date;
  endDate: Date;
  preset: TimeRangePreset;
}

export interface TimeRangeContextType {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  setPreset: (preset: TimeRangePreset) => void;
  presets: Record<TimeRangePreset, { label: string; getRange: () => TimeRange }>;
}

// Create the context
const TimeRangeContext = createContext<TimeRangeContextType | undefined>(undefined);

// Helper function to calculate date ranges
const calculateDateRange = (days: number): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return { startDate, endDate };
};

export interface TimeRangeProviderProps {
  children: React.ReactNode;
  defaultPreset?: TimeRangePreset;
}

/**
 * Provider component that makes time range selection available to all chart components
 */
export const TimeRangeProvider: React.FC<TimeRangeProviderProps> = ({ 
  children,
  defaultPreset = '30d'
}) => {
  // Define available presets
  const presets = useMemo(() => ({
    '7d': {
      label: 'Last 7 days',
      getRange: () => {
        const { startDate, endDate } = calculateDateRange(7);
        return { startDate, endDate, preset: '7d' };
      }
    },
    '30d': {
      label: 'Last 30 days',
      getRange: () => {
        const { startDate, endDate } = calculateDateRange(30);
        return { startDate, endDate, preset: '30d' };
      }
    },
    '90d': {
      label: 'Last 90 days',
      getRange: () => {
        const { startDate, endDate } = calculateDateRange(90);
        return { startDate, endDate, preset: '90d' };
      }
    },
    '6m': {
      label: 'Last 6 months',
      getRange: () => {
        const { startDate, endDate } = calculateDateRange(180);
        return { startDate, endDate, preset: '6m' };
      }
    },
    '1y': {
      label: 'Last year',
      getRange: () => {
        const { startDate, endDate } = calculateDateRange(365);
        return { startDate, endDate, preset: '1y' };
      }
    },
    'custom': {
      label: 'Custom range',
      getRange: () => {
        // Default to last 30 days for custom until user selects
        const { startDate, endDate } = calculateDateRange(30);
        return { startDate, endDate, preset: 'custom' };
      }
    }
  }), []);
  
  // Initialize with default preset
  const [timeRange, setTimeRangeState] = useState<TimeRange>(
    presets[defaultPreset].getRange()
  );
  
  // Set time range handler
  const setTimeRange = useCallback((range: TimeRange) => {
    setTimeRangeState(range);
  }, []);
  
  // Set preset handler
  const setPreset = useCallback((preset: TimeRangePreset) => {
    setTimeRangeState(presets[preset].getRange());
  }, [presets]);
  
  // Context value
  const value = useMemo(() => ({
    timeRange,
    setTimeRange,
    setPreset,
    presets
  }), [timeRange, setTimeRange, setPreset, presets]);
  
  return (
    <TimeRangeContext.Provider value={value}>
      {children}
    </TimeRangeContext.Provider>
  );
};

/**
 * Hook to access the time range context
 */
export const useTimeRange = (): TimeRangeContextType => {
  const context = useContext(TimeRangeContext);
  if (context === undefined) {
    throw new Error('useTimeRange must be used within a TimeRangeProvider');
  }
  return context;
};

export default TimeRangeProvider;