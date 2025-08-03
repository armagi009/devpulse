import React, { useRef, useEffect } from 'react';
import { announceToScreenReader, generateAccessibilityId } from '../ui/accessibility-utils';

export interface ChartDataPoint {
  label: string;
  value: number | string;
  category?: string;
}

export interface ChartAccessibilityProps {
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'radar';
  title: string;
  description?: string;
  data: ChartDataPoint[];
  summaryText?: string;
  trendDescription?: string;
  highlightPoints?: ChartDataPoint[];
  onDataPointFocus?: (point: ChartDataPoint, index: number) => void;
  children?: React.ReactNode;
}

/**
 * ChartAccessibility component that provides screen reader support for charts
 * This component renders a visually hidden table with the chart data
 * and provides keyboard navigation for chart data points
 */
export const ChartAccessibility: React.FC<ChartAccessibilityProps> = ({
  chartType,
  title,
  description,
  data,
  summaryText,
  trendDescription,
  highlightPoints = [],
  onDataPointFocus,
  children,
}) => {
  const tableId = useRef(generateAccessibilityId('chart-table'));
  const tableRef = useRef<HTMLTableElement>(null);
  
  // Announce chart data when it changes
  useEffect(() => {
    if (data.length > 0) {
      const announcement = `${title} chart with ${data.length} data points. ${summaryText || ''} ${trendDescription || ''}`;
      announceToScreenReader(announcement);
    }
  }, [data, title, summaryText, trendDescription]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!tableRef.current) return;
    
    const rows = tableRef.current.querySelectorAll('tbody tr');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (index < rows.length - 1) {
          (rows[index + 1].querySelector('td') as HTMLElement)?.focus();
          if (onDataPointFocus && data[index + 1]) {
            onDataPointFocus(data[index + 1], index + 1);
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          (rows[index - 1].querySelector('td') as HTMLElement)?.focus();
          if (onDataPointFocus && data[index - 1]) {
            onDataPointFocus(data[index - 1], index - 1);
          }
        }
        break;
      case 'Home':
        e.preventDefault();
        (rows[0].querySelector('td') as HTMLElement)?.focus();
        if (onDataPointFocus && data[0]) {
          onDataPointFocus(data[0], 0);
        }
        break;
      case 'End':
        e.preventDefault();
        (rows[rows.length - 1].querySelector('td') as HTMLElement)?.focus();
        if (onDataPointFocus && data[data.length - 1]) {
          onDataPointFocus(data[data.length - 1], data.length - 1);
        }
        break;
    }
  };
  
  // Determine if we need to show categories column
  const hasCategories = data.some(point => point.category !== undefined);
  
  return (
    <div className="chart-accessibility">
      {/* Visually hidden but accessible table representation of chart data */}
      <table
        ref={tableRef}
        id={tableId.current}
        className="sr-only"
        aria-label={`${title} data table`}
      >
        <caption>
          {description || `Data table for ${title}`}
          {trendDescription && ` ${trendDescription}`}
        </caption>
        <thead>
          <tr>
            <th scope="col">Label</th>
            {hasCategories && <th scope="col">Category</th>}
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point, index) => {
            const isHighlighted = highlightPoints.some(
              hp => hp.label === point.label && hp.value === point.value
            );
            
            return (
              <tr key={index}>
                <td
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-label={`${point.label}: ${point.value}${point.category ? `, Category: ${point.category}` : ''}${isHighlighted ? ', Highlighted point' : ''}`}
                >
                  {point.label}
                </td>
                {hasCategories && <td>{point.category || '-'}</td>}
                <td>{point.value}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Chart content */}
      <div 
        aria-describedby={tableId.current}
        role="img" 
        aria-label={`${chartType} chart: ${title}${description ? `. ${description}` : ''}`}
      >
        {children}
      </div>
    </div>
  );
};

export default ChartAccessibility;