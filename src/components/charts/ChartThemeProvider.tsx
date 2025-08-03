import React, { createContext, useContext, useMemo } from 'react';
import { useTheme } from 'next-themes';

// Define the chart theme interface
export interface ChartTheme {
  colors: {
    primary: string[];
    semantic: {
      success: string;
      warning: string;
      danger: string;
      info: string;
      neutral: string;
    };
    gradients: {
      blue: string;
      green: string;
      amber: string;
      red: string;
    };
    background: string;
    text: string;
    grid: string;
    tooltip: {
      background: string;
      text: string;
      border: string;
    };
  };
  fonts: {
    base: string;
  };
  borderRadius: number;
  transition: string;
  axisFormat: {
    number: (value: number) => string;
    percent: (value: number) => string;
    currency: (value: number) => string;
    time: (value: number) => string;
    date: (value: Date) => string;
  };
}

// Create the context
const ChartThemeContext = createContext<ChartTheme | undefined>(undefined);

export interface ChartThemeProviderProps {
  children: React.ReactNode;
  customTheme?: Partial<ChartTheme>;
}

/**
 * Provider component that makes chart theme available to all chart components
 */
export const ChartThemeProvider: React.FC<ChartThemeProviderProps> = ({ 
  children,
  customTheme = {}
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Define the default theme based on the current app theme
  const defaultTheme = useMemo((): ChartTheme => ({
    colors: {
      // Color palette for data visualization - consistent across the application
      primary: isDark 
        ? [
            '#3b82f6', // blue
            '#10b981', // green
            '#f59e0b', // amber
            '#ef4444', // red
            '#8b5cf6', // purple
            '#ec4899', // pink
            '#06b6d4', // cyan
            '#84cc16', // lime
            '#6366f1', // indigo
            '#14b8a6', // teal
            '#f97316', // orange
            '#a855f7'  // violet
          ]
        : [
            '#2563eb', // blue
            '#059669', // green
            '#d97706', // amber
            '#dc2626', // red
            '#7c3aed', // purple
            '#db2777', // pink
            '#0891b2', // cyan
            '#65a30d', // lime
            '#4f46e5', // indigo
            '#0d9488', // teal
            '#ea580c', // orange
            '#9333ea'  // violet
          ],
      // Semantic colors for specific metrics
      semantic: {
        success: isDark ? '#10b981' : '#059669',
        warning: isDark ? '#f59e0b' : '#d97706',
        danger: isDark ? '#ef4444' : '#dc2626',
        info: isDark ? '#3b82f6' : '#2563eb',
        neutral: isDark ? '#6b7280' : '#9ca3af',
      },
      // Gradient presets
      gradients: {
        blue: isDark 
          ? 'linear-gradient(180deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.4) 100%)'
          : 'linear-gradient(180deg, rgba(37, 99, 235, 0.8) 0%, rgba(29, 78, 216, 0.4) 100%)',
        green: isDark
          ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.4) 100%)'
          : 'linear-gradient(180deg, rgba(5, 150, 105, 0.8) 0%, rgba(4, 120, 87, 0.4) 100%)',
        amber: isDark
          ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.8) 0%, rgba(217, 119, 6, 0.4) 100%)'
          : 'linear-gradient(180deg, rgba(217, 119, 6, 0.8) 0%, rgba(180, 83, 9, 0.4) 100%)',
        red: isDark
          ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.4) 100%)'
          : 'linear-gradient(180deg, rgba(220, 38, 38, 0.8) 0%, rgba(185, 28, 28, 0.4) 100%)',
      },
      background: isDark ? '#1f2937' : '#ffffff',
      text: isDark ? '#f3f4f6' : '#1f2937',
      grid: isDark ? '#374151' : '#e5e7eb',
      tooltip: {
        background: isDark ? '#374151' : '#ffffff',
        text: isDark ? '#f3f4f6' : '#1f2937',
        border: isDark ? '#4b5563' : '#e5e7eb',
      }
    },
    fonts: {
      base: 'system-ui, -apple-system, sans-serif'
    },
    borderRadius: 4,
    transition: 'all 0.2s ease',
    // Standard axis formatting
    axisFormat: {
      // Number formatting functions
      number: (value: number) => {
        if (Math.abs(value) >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`;
        } else if (Math.abs(value) >= 1000) {
          return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toString();
      },
      // Percentage formatting
      percent: (value: number) => `${value.toFixed(1)}%`,
      // Currency formatting
      currency: (value: number) => `$${value.toLocaleString()}`,
      // Time formatting (hours:minutes)
      time: (value: number) => {
        const hours = Math.floor(value / 60);
        const minutes = Math.floor(value % 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
      },
      // Date formatting
      date: (value: Date) => value.toLocaleDateString(),
    }
  }), [isDark]);
  
  // Merge the default theme with any custom theme props
  const mergedTheme = useMemo(() => {
    return {
      ...defaultTheme,
      ...customTheme,
      colors: {
        ...defaultTheme.colors,
        ...(customTheme.colors || {}),
        tooltip: {
          ...defaultTheme.colors.tooltip,
          ...(customTheme.colors?.tooltip || {})
        }
      }
    };
  }, [defaultTheme, customTheme]);
  
  return (
    <ChartThemeContext.Provider value={mergedTheme}>
      {children}
    </ChartThemeContext.Provider>
  );
};

/**
 * Hook to access the chart theme
 */
export const useChartTheme = (): ChartTheme => {
  const context = useContext(ChartThemeContext);
  if (context === undefined) {
    throw new Error('useChartTheme must be used within a ChartThemeProvider');
  }
  return context;
};

export default ChartThemeProvider;