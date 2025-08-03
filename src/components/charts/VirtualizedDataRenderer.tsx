/**
 * VirtualizedDataRenderer Component
 * 
 * A component that implements virtualization for large datasets in charts.
 * This helps improve rendering performance by only rendering data points
 * that are currently visible in the viewport.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useResizeObserver } from '@/lib/hooks/useResizeObserver';

export interface DataPoint {
  x: number;
  y: number;
  [key: string]: any;
}

interface VirtualizedDataRendererProps<T extends DataPoint> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T, index: number) => string | number;
  itemWidth?: number;
  overscanCount?: number;
  direction?: 'horizontal' | 'vertical';
  className?: string;
  onVisibleItemsChange?: (items: T[]) => void;
  onRangeChange?: (range: { start: number; end: number }) => void;
}

/**
 * VirtualizedDataRenderer component for efficiently rendering large datasets
 * by only rendering items that are currently visible in the viewport.
 */
export function VirtualizedDataRenderer<T extends DataPoint>({
  data,
  renderItem,
  getItemKey,
  itemWidth = 5,
  overscanCount = 10,
  direction = 'horizontal',
  className = '',
  onVisibleItemsChange,
  onRangeChange,
}: VirtualizedDataRendererProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { width, height } = useResizeObserver(containerRef);
  
  // Calculate visible range based on container size and scroll position
  const visibleRange = useMemo(() => {
    if (!width || !height) return { start: 0, end: 50 };
    
    const viewportSize = direction === 'horizontal' ? width : height;
    const startIndex = Math.max(0, Math.floor(scrollPosition / itemWidth) - overscanCount);
    const endIndex = Math.min(
      data.length,
      Math.ceil((scrollPosition + viewportSize) / itemWidth) + overscanCount
    );
    
    return { start: startIndex, end: endIndex };
  }, [width, height, scrollPosition, itemWidth, overscanCount, direction, data.length]);
  
  // Get visible items
  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end);
  }, [data, visibleRange]);
  
  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPos = direction === 'horizontal' 
      ? e.currentTarget.scrollLeft 
      : e.currentTarget.scrollTop;
    setScrollPosition(scrollPos);
  };
  
  // Notify parent component about visible items change
  useEffect(() => {
    if (onVisibleItemsChange) {
      onVisibleItemsChange(visibleItems);
    }
    
    if (onRangeChange) {
      onRangeChange(visibleRange);
    }
  }, [visibleItems, visibleRange, onVisibleItemsChange, onRangeChange]);
  
  // Calculate total size to ensure proper scrolling
  const totalSize = data.length * itemWidth;
  
  return (
    <div
      ref={containerRef}
      className={`virtualized-container overflow-auto ${className}`}
      onScroll={handleScroll}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        className="virtualized-content"
        style={{
          position: 'relative',
          width: direction === 'horizontal' ? totalSize : '100%',
          height: direction === 'vertical' ? totalSize : '100%',
        }}
      >
        {visibleItems.map((item, index) => {
          const actualIndex = visibleRange.start + index;
          const key = getItemKey(item, actualIndex);
          const position = actualIndex * itemWidth;
          
          return (
            <div
              key={key}
              className="virtualized-item"
              style={{
                position: 'absolute',
                [direction === 'horizontal' ? 'left' : 'top']: position,
                [direction === 'horizontal' ? 'top' : 'left']: 0,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualizedDataRenderer;