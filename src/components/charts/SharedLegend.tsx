/**
 * SharedLegend Component
 * 
 * A component that implements a shared legend for multiple charts.
 * This improves performance by rendering the legend once instead of for each chart.
 */

import React, { useState, useEffect } from 'react';
import { useChartTheme } from './ChartThemeProvider';

export interface LegendItem {
  label: string;
  color: string;
  hidden?: boolean;
}

interface SharedLegendProps {
  items: LegendItem[];
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  onItemClick?: (index: number, hidden: boolean) => void;
  interactive?: boolean;
}

/**
 * SharedLegend component for efficient rendering of chart legends
 */
export const SharedLegend: React.FC<SharedLegendProps> = ({
  items,
  position = 'top',
  className = '',
  onItemClick,
  interactive = true,
}) => {
  const [legendItems, setLegendItems] = useState<LegendItem[]>(items);
  const theme = useChartTheme();
  
  // Update legend items when props change
  useEffect(() => {
    setLegendItems(items);
  }, [items]);
  
  // Handle legend item click
  const handleItemClick = (index: number) => {
    if (!interactive) return;
    
    const newItems = [...legendItems];
    newItems[index] = {
      ...newItems[index],
      hidden: !newItems[index].hidden,
    };
    
    setLegendItems(newItems);
    
    if (onItemClick) {
      onItemClick(index, !!newItems[index].hidden);
    }
  };
  
  // Determine layout classes based on position
  const layoutClasses = {
    top: 'flex-row flex-wrap justify-center',
    right: 'flex-col items-start',
    bottom: 'flex-row flex-wrap justify-center',
    left: 'flex-col items-start',
  };
  
  return (
    <div 
      className={`shared-legend flex ${layoutClasses[position]} ${className}`}
      role="region"
      aria-label="Chart legend"
    >
      {legendItems.map((item, index) => (
        <div
          key={`legend-item-${index}`}
          className={`
            flex items-center px-2 py-1 m-1 rounded-md transition-opacity
            ${interactive ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
            ${item.hidden ? 'opacity-50' : 'opacity-100'}
          `}
          onClick={() => handleItemClick(index)}
          role={interactive ? 'button' : 'presentation'}
          aria-pressed={item.hidden ? 'true' : 'false'}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={(e) => {
            if (interactive && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleItemClick(index);
            }
          }}
        >
          <div
            className="w-3 h-3 rounded-sm mr-2"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span 
            className="text-sm font-medium"
            style={{ 
              color: theme.colors.text,
              fontFamily: theme.fonts.base,
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SharedLegend;