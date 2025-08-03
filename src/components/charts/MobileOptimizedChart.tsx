'use client';

/**
 * MobileOptimizedChart Component
 * 
 * A chart component that automatically optimizes for mobile devices.
 * It simplifies data visualization on small screens and provides touch-friendly interactions.
 */

import React, { useState, useEffect } from 'react';
import { useViewportType, useTouchHandlers } from '@/lib/utils/touch-interactions';
import { ResponsiveChartWrapper } from './ResponsiveChartWrapper';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface MobileOptimizedChartProps {
  data: DataPoint[];
  title: string;
  type?: 'bar' | 'line' | 'pie' | 'donut';
  height?: number;
  className?: string;
  showLegend?: boolean;
  showTooltips?: boolean;
  enableTouch?: boolean;
  loading?: boolean;
}

export function MobileOptimizedChart({
  data,
  title,
  type = 'bar',
  height = 300,
  className,
  showLegend = true,
  showTooltips = true,
  enableTouch = true,
  loading = false,
}: MobileOptimizedChartProps) {
  const viewportType = useViewportType();
  const isMobile = viewportType === 'mobile';
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Simplify data for mobile view by limiting the number of data points
  const simplifiedData = isMobile ? data.slice(0, 5) : data;
  
  // Default colors if not provided
  const defaultColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#14b8a6', // teal
  ];
  
  // Assign colors to data points if not provided
  const coloredData = simplifiedData.map((point, index) => ({
    ...point,
    color: point.color || defaultColors[index % defaultColors.length],
  }));
  
  // Touch handlers for interacting with the chart
  const touchHandlers = useTouchHandlers({
    onTap: enableTouch ? (event) => {
      // Calculate which bar/segment was tapped
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const touch = event.nativeEvent.touches?.[0] || event.nativeEvent.changedTouches?.[0];
        
        if (touch) {
          const x = touch.clientX - rect.left;
          const barWidth = rect.width / coloredData.length;
          const index = Math.floor(x / barWidth);
          
          if (index >= 0 && index < coloredData.length) {
            setActiveIndex(index);
            
            // Reset after a delay
            setTimeout(() => {
              setActiveIndex(null);
            }, 2000);
          }
        }
      }
    } : undefined,
  });
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Render different chart types
  const renderChart = () => {
    if (loading) {
      return <ChartSkeleton type={type} />;
    }
    
    switch (type) {
      case 'bar':
        return <BarChart data={coloredData} activeIndex={activeIndex} />;
      case 'line':
        return <LineChart data={coloredData} activeIndex={activeIndex} />;
      case 'pie':
        return <PieChart data={coloredData} activeIndex={activeIndex} />;
      case 'donut':
        return <DonutChart data={coloredData} activeIndex={activeIndex} />;
      default:
        return <BarChart data={coloredData} activeIndex={activeIndex} />;
    }
  };
  
  // Simplified mobile version of the chart
  const renderMobileChart = () => {
    if (loading) {
      return <ChartSkeleton type={type} />;
    }
    
    // For mobile, we use simpler visualizations
    switch (type) {
      case 'bar':
      case 'line':
        return <SimplifiedBarChart data={coloredData} activeIndex={activeIndex} />;
      case 'pie':
      case 'donut':
        return <SimplifiedPieChart data={coloredData} activeIndex={activeIndex} />;
      default:
        return <SimplifiedBarChart data={coloredData} activeIndex={activeIndex} />;
    }
  };
  
  return (
    <div 
      className={cn('mobile-optimized-chart', className)}
      ref={containerRef}
      role="region"
      aria-label={`${title} chart`}
    >
      <h3 className="text-base font-medium mb-2" id={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</h3>
      
      <ResponsiveChartWrapper
        height={height}
        mobileVersion={renderMobileChart()}
        enableTouch={enableTouch}
        simplifyOnMobile={true}
        showMobileLegend={showLegend}
      >
        <div 
          className="w-full h-full"
          {...(enableTouch ? touchHandlers : {})}
          aria-labelledby={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          role="img"
          aria-roledescription={`${type} chart`}
        >
          {renderChart()}
        </div>
      </ResponsiveChartWrapper>
      
      {showTooltips && activeIndex !== null && (
        <div 
          className="mt-2 p-2 bg-muted rounded text-sm"
          role="status"
          aria-live="polite"
        >
          <strong>{coloredData[activeIndex].label}:</strong> {coloredData[activeIndex].value}
        </div>
      )}
      
      {!isMobile && showLegend && (
        <div 
          className="mt-2 flex flex-wrap gap-4 justify-center"
          role="list"
          aria-label="Chart legend"
        >
          {coloredData.map((point, index) => (
            <div key={index} className="flex items-center" role="listitem">
              <div 
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: point.color }}
                aria-hidden="true"
              ></div>
              <span className="text-sm">{point.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Bar Chart Component
function BarChart({ data, activeIndex }: { data: DataPoint[]; activeIndex: number | null }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="flex items-end h-full w-full pt-6 pb-6">
      {data.map((point, index) => (
        <div 
          key={index}
          className="flex-1 flex flex-col items-center justify-end h-full"
        >
          <div 
            className={cn(
              "w-4/5 rounded-t transition-all",
              activeIndex === index ? 'opacity-100' : 'opacity-80'
            )}
            style={{ 
              height: `${(point.value / maxValue) * 100}%`,
              backgroundColor: point.color,
              transform: activeIndex === index ? 'scaleY(1.05)' : 'scaleY(1)'
            }}
          ></div>
          <div className="mt-2 text-xs text-center truncate w-full">
            {point.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// Line Chart Component
function LineChart({ data, activeIndex }: { data: DataPoint[]; activeIndex: number | null }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value / maxValue) * 100);
    return { x, y, ...point };
  });
  
  // Create SVG path from points
  const pathData = points.map((point, index) => {
    return index === 0 
      ? `M ${point.x} ${point.y}` 
      : `L ${point.x} ${point.y}`;
  }).join(' ');
  
  return (
    <div className="h-full w-full pt-6 pb-6 relative">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        role="img"
        aria-label="Line chart showing data trends"
      >
        <title>Line chart visualization</title>
        <desc>Line chart showing trends for {data.map(d => d.label).join(', ')}</desc>
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={data[0].color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          aria-hidden="true"
        />
        
        {/* Area under the line */}
        <path
          d={`${pathData} L 100 100 L 0 100 Z`}
          fill={data[0].color}
          opacity="0.1"
          aria-hidden="true"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={activeIndex === index ? 4 : 3}
            fill={point.color}
            stroke="white"
            strokeWidth="1"
            className="chart-interactive-element"
            role="graphics-symbol"
            aria-label={`${point.label}: ${point.value}`}
            tabIndex={0}
          />
        ))}
      </svg>
      
      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        {data.map((point, index) => (
          <div key={index} className="text-xs text-center truncate" style={{ width: `${100 / data.length}%` }}>
            {point.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Pie Chart Component
function PieChart({ data, activeIndex }: { data: DataPoint[]; activeIndex: number | null }) {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  let currentAngle = 0;
  
  const segments = data.map((point, index) => {
    const startAngle = currentAngle;
    const angle = (point.value / total) * 360;
    currentAngle += angle;
    const endAngle = currentAngle;
    
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Calculate position for label
    const midAngle = startAngle + (angle / 2);
    const midRad = (midAngle - 90) * Math.PI / 180;
    const labelX = 50 + (activeIndex === index ? 20 : 15) * Math.cos(midRad);
    const labelY = 50 + (activeIndex === index ? 20 : 15) * Math.sin(midRad);
    
    return {
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      color: point.color,
      label: point.label,
      value: point.value,
      percentage: Math.round((point.value / total) * 100),
      labelX,
      labelY,
      active: activeIndex === index,
    };
  });
  
  return (
    <div className="h-full w-full relative">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100"
        role="img"
        aria-label="Pie chart showing data distribution"
      >
        <title>Pie chart visualization</title>
        <desc>Pie chart showing distribution for {data.map(d => d.label).join(', ')}</desc>
        
        {segments.map((segment, index) => (
          <g key={index}>
            <path
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth="1"
              opacity={segment.active ? 1 : 0.8}
              transform={segment.active ? 'scale(1.05) translate(-2.5, -2.5)' : ''}
              style={{ transformOrigin: 'center', transition: 'transform 0.2s ease-out' }}
              role="graphics-symbol"
              aria-label={`${segment.label}: ${segment.value} (${segment.percentage}%)`}
              tabIndex={0}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// Donut Chart Component
function DonutChart({ data, activeIndex }: { data: DataPoint[]; activeIndex: number | null }) {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  let currentAngle = 0;
  
  const segments = data.map((point, index) => {
    const startAngle = currentAngle;
    const angle = (point.value / total) * 360;
    currentAngle += angle;
    const endAngle = currentAngle;
    
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const innerRadius = 20;
    const outerRadius = 40;
    
    const x1 = 50 + outerRadius * Math.cos(startRad);
    const y1 = 50 + outerRadius * Math.sin(startRad);
    const x2 = 50 + outerRadius * Math.cos(endRad);
    const y2 = 50 + outerRadius * Math.sin(endRad);
    
    const x3 = 50 + innerRadius * Math.cos(endRad);
    const y3 = 50 + innerRadius * Math.sin(endRad);
    const x4 = 50 + innerRadius * Math.cos(startRad);
    const y4 = 50 + innerRadius * Math.sin(startRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return {
      path: `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`,
      color: point.color,
      label: point.label,
      value: point.value,
      percentage: Math.round((point.value / total) * 100),
      active: activeIndex === index,
    };
  });
  
  return (
    <div className="h-full w-full relative">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100"
        role="img"
        aria-label="Donut chart showing data distribution"
      >
        <title>Donut chart visualization</title>
        <desc>Donut chart showing distribution for {data.map(d => d.label).join(', ')}</desc>
        
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            stroke="white"
            strokeWidth="1"
            opacity={segment.active ? 1 : 0.8}
            transform={segment.active ? 'scale(1.05) translate(-2.5, -2.5)' : ''}
            style={{ transformOrigin: 'center', transition: 'transform 0.2s ease-out' }}
            role="graphics-symbol"
            aria-label={`${segment.label}: ${segment.value} (${segment.percentage}%)`}
            tabIndex={0}
          />
        ))}
        
        {/* Center text */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium"
          fill="currentColor"
          role="status"
          aria-live="polite"
        >
          {activeIndex !== null ? `${segments[activeIndex].percentage}%` : 'Total'}
        </text>
      </svg>
    </div>
  );
}

// Simplified Bar Chart for Mobile
function SimplifiedBarChart({ data, activeIndex }: { data: DataPoint[]; activeIndex: number | null }) {
  return (
    <div className="space-y-2 p-2">
      {data.map((point, index) => (
        <div key={index} className="flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs truncate max-w-[150px]">{point.label}</span>
            <span className="text-xs font-medium">{point.value}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${(point.value / Math.max(...data.map(d => d.value))) * 100}%`,
                backgroundColor: point.color,
                transform: activeIndex === index ? 'scaleX(1.02)' : 'scaleX(1)'
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Simplified Pie Chart for Mobile
function SimplifiedPieChart({ data, activeIndex }: { data: DataPoint[]; activeIndex: number | null }) {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  
  return (
    <div className="space-y-2 p-2">
      {data.map((point, index) => {
        const percentage = Math.round((point.value / total) * 100);
        
        return (
          <div 
            key={index} 
            className={cn(
              "flex items-center p-2 rounded transition-all",
              activeIndex === index ? 'bg-muted' : ''
            )}
          >
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: point.color }}
            ></div>
            <span className="text-xs flex-1 truncate">{point.label}</span>
            <div className="flex items-center">
              <span className="text-xs mr-1">{point.value}</span>
              <span className="text-xs text-muted-foreground">({percentage}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Loading skeleton for charts
function ChartSkeleton({ type }: { type: 'bar' | 'line' | 'pie' | 'donut' }) {
  if (type === 'pie' || type === 'donut') {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-32 h-32 rounded-full skeleton"></div>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full flex items-end justify-between px-4 pb-8">
      {[1, 2, 3, 4, 5].map((_, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className="w-8 skeleton rounded-t"
            style={{ height: `${20 + Math.random() * 60}%` }}
          ></div>
          <div className="mt-2 w-12 h-3 skeleton rounded"></div>
        </div>
      ))}
    </div>
  );
}

export default MobileOptimizedChart;