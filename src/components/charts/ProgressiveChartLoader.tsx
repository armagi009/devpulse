/**
 * ProgressiveChartLoader Component
 * 
 * A component that implements progressive loading for charts.
 * This improves perceived performance by loading and rendering chart data in chunks,
 * showing a meaningful visualization quickly while loading more data in the background.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ChartSkeleton } from './skeleton';

interface ProgressiveChartLoaderProps<T> {
  data: T[];
  renderChart: (data: T[]) => React.ReactNode;
  initialChunkSize?: number;
  chunkSize?: number;
  loadInterval?: number;
  showSkeleton?: boolean;
  onLoadComplete?: () => void;
  priorityThreshold?: number;
}

/**
 * ProgressiveChartLoader component for loading and rendering chart data in chunks
 */
export function ProgressiveChartLoader<T>({
  data,
  renderChart,
  initialChunkSize = 50,
  chunkSize = 100,
  loadInterval = 50,
  showSkeleton = true,
  onLoadComplete,
  priorityThreshold = 0.3,
}: ProgressiveChartLoaderProps<T>) {
  const [visibleData, setVisibleData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  
  // Calculate priority data (e.g., most recent data points)
  const priorityDataCount = Math.max(
    initialChunkSize,
    Math.floor(data.length * priorityThreshold)
  );
  
  // Load data progressively
  const loadNextChunk = useCallback(() => {
    if (loadedCount >= data.length) {
      setIsLoading(false);
      if (onLoadComplete) {
        onLoadComplete();
      }
      return;
    }
    
    // Calculate next chunk size
    const nextChunkSize = loadedCount === 0 ? initialChunkSize : chunkSize;
    const endIndex = Math.min(loadedCount + nextChunkSize, data.length);
    
    // Update visible data
    setVisibleData(data.slice(0, endIndex));
    setLoadedCount(endIndex);
    
    // Schedule next chunk if needed
    if (endIndex < data.length) {
      setTimeout(loadNextChunk, loadInterval);
    } else {
      setIsLoading(false);
      if (onLoadComplete) {
        onLoadComplete();
      }
    }
  }, [data, loadedCount, initialChunkSize, chunkSize, loadInterval, onLoadComplete]);
  
  // Start loading data
  useEffect(() => {
    setIsLoading(true);
    setLoadedCount(0);
    setVisibleData([]);
    
    // Load priority data immediately
    if (data.length > 0) {
      const initialData = data.slice(0, Math.min(priorityDataCount, data.length));
      setVisibleData(initialData);
      setLoadedCount(initialData.length);
      
      // Schedule loading of remaining data
      if (initialData.length < data.length) {
        setTimeout(loadNextChunk, loadInterval);
      } else {
        setIsLoading(false);
        if (onLoadComplete) {
          onLoadComplete();
        }
      }
    } else {
      setIsLoading(false);
    }
  }, [data, priorityDataCount, loadInterval, loadNextChunk, onLoadComplete]);
  
  // Calculate loading progress
  const loadingProgress = data.length > 0 ? (loadedCount / data.length) * 100 : 0;
  
  return (
    <div className="progressive-chart-container">
      {visibleData.length > 0 ? (
        <>
          {renderChart(visibleData)}
          
          {isLoading && loadingProgress < 100 && (
            <div className="progressive-chart-progress">
              <div 
                className="h-1 bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${loadingProgress}%` }}
                role="progressbar"
                aria-valuenow={loadingProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          )}
        </>
      ) : showSkeleton ? (
        <ChartSkeleton />
      ) : null}
    </div>
  );
}

export default ProgressiveChartLoader;