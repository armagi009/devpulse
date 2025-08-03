'use client';

/**
 * ResponsiveChartWrapper Component
 * 
 * A wrapper component that makes charts responsive and optimized for mobile devices.
 * It handles touch interactions, simplifies charts on small screens, and optimizes performance.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useViewportType, useTouchHandlers } from '@/lib/utils/touch-interactions';
import { cn } from '@/lib/utils';

interface ResponsiveChartWrapperProps {
  children: React.ReactNode;
  mobileVersion?: React.ReactNode;
  height?: number | string;
  className?: string;
  onZoom?: (scale: number) => void;
  onPan?: (x: number, y: number) => void;
  enableTouch?: boolean;
  simplifyOnMobile?: boolean;
  showMobileLegend?: boolean;
}

export function ResponsiveChartWrapper({
  children,
  mobileVersion,
  height = 300,
  className,
  onZoom,
  onPan,
  enableTouch = true,
  simplifyOnMobile = true,
  showMobileLegend = true,
}: ResponsiveChartWrapperProps) {
  const viewportType = useViewportType();
  const isMobile = viewportType === 'mobile';
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; content: React.ReactNode }>({
    x: 0,
    y: 0,
    content: null,
  });
  
  // Reset transformations when viewport changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [viewportType]);
  
  // Touch handlers for pan and zoom
  const touchHandlers = useTouchHandlers({
    onPinch: enableTouch ? (newScale) => {
      // Limit scale between 0.5 and 3
      const limitedScale = Math.min(Math.max(scale * newScale, 0.5), 3);
      setScale(limitedScale);
      onZoom?.(limitedScale);
    } : undefined,
    
    onSwipe: enableTouch ? (event) => {
      if (scale > 1) {
        // Only allow panning when zoomed in
        setPosition({
          x: position.x + event.distance.x / 2,
          y: position.y + event.distance.y / 2,
        });
        onPan?.(position.x, position.y);
      }
    } : undefined,
    
    onTap: enableTouch ? (event) => {
      // Show tooltip on tap
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const touch = event.nativeEvent.touches?.[0] || event.nativeEvent.changedTouches?.[0];
        
        if (touch) {
          setTooltipData({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
            content: <div className="p-2">Tap to show details</div>,
          });
          
          setShowTooltip(true);
          
          // Hide tooltip after 2 seconds
          setTimeout(() => {
            setShowTooltip(false);
          }, 2000);
        }
      }
    } : undefined,
    
    onDoubleTap: enableTouch ? () => {
      // Reset zoom and position on double tap
      setScale(1);
      setPosition({ x: 0, y: 0 });
      onZoom?.(1);
      onPan?.(0, 0);
    } : undefined,
  });
  
  // Determine which version of the chart to render
  const chartContent = isMobile && mobileVersion && simplifyOnMobile
    ? mobileVersion
    : children;
  
  return (
    <div className={cn('responsive-chart-container', className)}>
      <div
        ref={containerRef}
        className="relative overflow-hidden touch-action-none"
        style={{ 
          height: typeof height === 'number' ? `${height}px` : height,
        }}
        {...(enableTouch ? touchHandlers : {})}
      >
        <div
          className="transform-gpu transition-transform duration-100"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          {chartContent}
        </div>
        
        {showTooltip && (
          <div
            className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-md z-10 pointer-events-none"
            style={{
              left: tooltipData.x,
              top: tooltipData.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {tooltipData.content}
          </div>
        )}
      </div>
      
      {isMobile && showMobileLegend && (
        <div 
          className="mt-2 pt-2 border-t flex flex-wrap justify-center gap-2"
          data-testid="mobile-legend"
        >
          <MobileLegend />
        </div>
      )}
      
      {isMobile && enableTouch && (
        <div className="mt-2 text-xs text-center text-muted-foreground">
          Pinch to zoom • Double tap to reset
        </div>
      )}
    </div>
  );
}

// Placeholder component for mobile legend
// In a real implementation, this would receive legend items as props
function MobileLegend() {
  return (
    <>
      <div className="flex items-center touch-target">
        <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
        <span className="text-xs">Series 1</span>
      </div>
      <div className="flex items-center touch-target">
        <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
        <span className="text-xs">Series 2</span>
      </div>
      <div className="flex items-center touch-target">
        <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
        <span className="text-xs">Series 3</span>
      </div>
    </>
  );
}

export default ResponsiveChartWrapper;