import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { useMediaQuery } from 'react-responsive';
import { ChartSkeleton, EmptyChartState, ErrorChartState } from './skeleton';
import { generateAccessibilityId } from '../ui/accessibility-utils';
import { optimizeSvgRendering } from '@/lib/utils/chart-optimization';

export interface BaseChartProps {
  title?: string;
  description?: string;
  height?: number | string;
  width?: number | string;
  className?: string;
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  isEmpty?: boolean;
  children?: React.ReactNode;
  skeletonType?: 'bar' | 'line' | 'pie' | 'default';
  onRetry?: () => void;
  // Performance optimization props
  optimizeSvg?: boolean;
  deferRender?: boolean;
  renderPriority?: 'high' | 'medium' | 'low';
  // Accessibility props
  altText?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  textSummary?: string;
  accessibilityData?: Array<{
    label: string;
    value: number | string;
    category?: string;
  }>;
}

/**
 * BaseChart component that provides common functionality for all chart types
 * including responsive behavior, theming, loading states, and error handling.
 * Includes performance optimizations for improved rendering speed.
 */
export const BaseChart: React.FC<BaseChartProps> = ({
  title,
  description,
  height = '300px',
  width = '100%',
  className = '',
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  isEmpty = false,
  children,
  skeletonType = 'default',
  onRetry,
  // Performance optimization props
  optimizeSvg = true,
  deferRender = false,
  renderPriority = 'medium',
  // Accessibility props
  altText,
  ariaLabelledBy,
  ariaDescribedBy,
  textSummary,
  accessibilityData = [],
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const chartId = useRef(generateAccessibilityId('chart'));
  const tableId = useRef(generateAccessibilityId('chart-table'));
  const titleId = useRef(generateAccessibilityId('chart-title'));
  const descId = useRef(generateAccessibilityId('chart-desc'));
  const chartContentRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!deferRender);
  
  // Determine the current theme colors
  const isDarkTheme = theme === 'dark';
  
  // Calculate render delay based on priority
  const renderDelay = useMemo(() => {
    switch (renderPriority) {
      case 'high': return 0;
      case 'medium': return 100;
      case 'low': return 300;
      default: return 0;
    }
  }, [renderPriority]);
  
  // Set up intersection observer for deferred rendering
  useEffect(() => {
    if (!deferRender) return;
    
    let observer: IntersectionObserver;
    const currentRef = chartContentRef.current;
    
    // Create observer with a small delay to avoid blocking the main thread
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsVisible(true);
            if (observer && currentRef) {
              observer.unobserve(currentRef);
            }
          }
        },
        { threshold: 0.1 }
      );
      
      if (currentRef) {
        observer.observe(currentRef);
      }
    }, renderDelay);
    
    return () => {
      clearTimeout(timer);
      if (observer && currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [deferRender, renderDelay]);
  
  // Optimize SVG rendering
  useEffect(() => {
    if (!optimizeSvg || !chartContentRef.current || !isVisible) return;
    
    // Find SVG elements and optimize them
    const svgElements = chartContentRef.current.querySelectorAll('svg');
    svgElements.forEach(svg => {
      optimizeSvgRendering(svg);
    });
  }, [optimizeSvg, isVisible, children]);
  
  // Handle loading state
  if (loading) {
    return (
      <div 
        className={`chart-container ${className}`}
        style={{ height, width }}
        aria-busy="true"
        aria-live="polite"
      >
        <ChartSkeleton 
          type={skeletonType}
          height={height}
          width={width}
          showTitle={!!title || !!description}
        />
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div 
        className={`chart-container ${className}`}
        style={{ height, width }}
        role="alert"
      >
        <ErrorChartState
          height={height}
          width={width}
          error={error}
          onRetry={onRetry || (() => window.location.reload())}
        />
      </div>
    );
  }
  
  // Handle empty state
  if (isEmpty) {
    return (
      <div 
        className={`chart-container ${className}`}
        style={{ height, width }}
        role="region"
        aria-label={title ? `${title} - ${emptyMessage}` : emptyMessage}
      >
        <EmptyChartState
          height={height}
          width={width}
          message={emptyMessage}
        />
      </div>
    );
  }
  
  // Create accessible table for screen readers if accessibilityData is provided
  const renderAccessibleTable = () => {
    if (!accessibilityData || accessibilityData.length === 0) return null;
    
    // Determine if we need to show categories column
    const hasCategories = accessibilityData.some(point => point.category !== undefined);
    
    return (
      <div className="sr-only">
        <table
          id={tableId.current}
          aria-label={`Data table for ${title || 'chart'}`}
        >
          <caption>
            {textSummary || `Tabular data for ${title || 'chart'}`}
          </caption>
          <thead>
            <tr>
              <th scope="col">Label</th>
              {hasCategories && <th scope="col">Category</th>}
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {accessibilityData.map((point, index) => (
              <tr key={index}>
                <td>{point.label}</td>
                {hasCategories && <td>{point.category || '-'}</td>}
                <td>{point.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render the chart with title and description
  return (
    <div 
      className={`chart-container ${className}`}
      style={{ height, width }}
      data-testid="chart-container"
    >
      {title && (
        <h3 
          id={titleId.current}
          className="text-lg font-medium mb-1"
        >
          {title}
        </h3>
      )}
      
      {description && (
        <p 
          id={descId.current}
          className="text-sm text-gray-500 dark:text-gray-400 mb-3"
        >
          {description}
        </p>
      )}
      
      {/* Accessible table for screen readers */}
      {renderAccessibleTable()}
      
      <div 
        ref={chartContentRef}
        id={chartId.current}
        className="chart-content h-full"
        role="img"
        aria-labelledby={
          [
            title ? titleId.current : null,
            ariaLabelledBy
          ].filter(Boolean).join(' ') || undefined
        }
        aria-describedby={
          [
            description ? descId.current : null,
            accessibilityData.length > 0 ? tableId.current : null,
            ariaDescribedBy
          ].filter(Boolean).join(' ') || undefined
        }
        aria-label={!title && altText ? altText : undefined}
        tabIndex={0}
      >
        {/* Render children only if visible (for deferred rendering) */}
        {isVisible ? children : (
          <div className="w-full h-full flex items-center justify-center">
            <ChartSkeleton 
              type={skeletonType}
              height={typeof height === 'number' ? height : '100%'}
              width={typeof width === 'number' ? width : '100%'}
              showTitle={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseChart;