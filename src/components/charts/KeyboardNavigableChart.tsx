import React, { useRef, useState, useEffect, useCallback } from 'react';
import { announceToScreenReader } from '../ui/accessibility-utils';

export interface DataPoint {
  index: number;
  label: string;
  value: number | string;
  [key: string]: any;
}

export interface KeyboardNavigableChartProps {
  data: DataPoint[];
  chartRef: React.RefObject<HTMLElement>;
  onFocus?: (point: DataPoint) => void;
  onBlur?: () => void;
  announceOnFocus?: boolean;
  children: React.ReactNode;
}

/**
 * KeyboardNavigableChart component that adds keyboard navigation to charts
 */
export const KeyboardNavigableChart: React.FC<KeyboardNavigableChartProps> = ({
  data,
  chartRef,
  onFocus,
  onBlur,
  announceOnFocus = true,
  children,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!data.length) return;
    
    let newIndex = focusedIndex;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = focusedIndex === null ? 0 : Math.min(focusedIndex + 1, data.length - 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = focusedIndex === null ? data.length - 1 : Math.max(focusedIndex - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = data.length - 1;
        break;
      case 'Escape':
        e.preventDefault();
        newIndex = null;
        if (onBlur) onBlur();
        break;
      default:
        return; // Don't process other keys
    }
    
    if (newIndex !== null && newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
      if (onFocus && newIndex < data.length) {
        onFocus(data[newIndex]);
      }
      
      if (announceOnFocus && newIndex < data.length) {
        const point = data[newIndex];
        announceToScreenReader(`${point.label}: ${point.value}`);
      }
    }
  }, [data, focusedIndex, onFocus, onBlur, announceOnFocus]);
  
  // Set up event listeners
  useEffect(() => {
    const element = chartRef.current || containerRef.current;
    if (!element) return;
    
    // Make the chart focusable if it isn't already
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
    
    // Add ARIA attributes
    element.setAttribute('role', 'application');
    element.setAttribute('aria-roledescription', 'interactive chart');
    
    // Add keyboard event listener
    element.addEventListener('keydown', handleKeyDown);
    
    // Add focus/blur handlers
    const handleFocus = () => {
      if (focusedIndex === null && data.length > 0) {
        setFocusedIndex(0);
        if (onFocus) onFocus(data[0]);
        
        // Announce instructions
        announceToScreenReader(
          'Chart is keyboard navigable. Use arrow keys to move between data points, ' +
          'Home and End to jump to the first or last point, and Escape to exit.'
        );
      }
    };
    
    const handleBlur = () => {
      setFocusedIndex(null);
      if (onBlur) onBlur();
    };
    
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [chartRef, data, focusedIndex, handleKeyDown, onFocus, onBlur]);
  
  return (
    <div ref={containerRef} className="keyboard-navigable-chart">
      {children}
    </div>
  );
};

export default KeyboardNavigableChart;