/**
 * CodeContributionHeatmap Component
 * Displays a heatmap of code contributions over time
 * Optimized for performance with large datasets
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { TrendPoint } from '@/lib/analytics/burnout-calculator';
import { format, startOfWeek, addDays, addWeeks } from 'date-fns';
import { batchChartUpdates } from '@/lib/utils/chart-optimization';

interface CodeContributionHeatmapProps {
  contributionData: TrendPoint[];
  startDate: Date;
  endDate: Date;
}

export default function CodeContributionHeatmap({ 
  contributionData, 
  startDate, 
  endDate 
}: CodeContributionHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get max value for color scaling
  const maxValue = Math.max(...contributionData.map(point => point.value), 1);
  
  // Pre-process data for efficient rendering
  const processedData = useMemo(() => {
    // Create a map of date strings to contribution values for quick lookup
    const contributionMap = new Map();
    contributionData.forEach(point => {
      const dateStr = new Date(point.date).toISOString().split('T')[0];
      contributionMap.set(dateStr, point.value);
    });
    
    return contributionMap;
  }, [contributionData]);
  
  // Create a batched update function for better performance
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const batchedDraw = useMemo(() => 
    batchChartUpdates((size: { width: number, height: number }) => {
      setCanvasSize(size);
    }, 100)
  , []);
  
  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        batchedDraw({ width: rect.width, height: rect.height });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [batchedDraw]);
  
  // Draw heatmap with optimized rendering
  useEffect(() => {
    if (!canvasRef.current || canvasSize.width === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas with background color for better performance
    ctx.fillStyle = isDarkMode() ? '#1a1a1a' : '#ffffff';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Calculate cell size and padding
    const cellSize = 14;
    const cellPadding = 2;
    const headerHeight = 20;
    const headerWidth = 30;
    
    // Calculate number of weeks to display
    const firstDay = startOfWeek(startDate, { weekStartsOn: 0 });
    const lastDay = endDate;
    const totalDays = Math.ceil((lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.ceil(totalDays / 7);
    
    // Draw month labels
    ctx.fillStyle = '#718096'; // gray-500
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    
    let currentMonth = '';
    for (let week = 0; week < totalWeeks; week++) {
      const date = addWeeks(firstDay, week);
      const month = format(date, 'MMM');
      
      if (month !== currentMonth) {
        currentMonth = month;
        ctx.fillText(
          month, 
          headerWidth + week * (cellSize + cellPadding), 
          headerHeight / 2
        );
      }
    }
    
    // Draw day labels
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let day = 0; day < 7; day++) {
      ctx.fillText(
        days[day], 
        headerWidth / 4, 
        headerHeight + day * (cellSize + cellPadding) + cellSize / 2 + 3
      );
    }
    
    // Draw cells
    for (let week = 0; week < totalWeeks; week++) {
      for (let day = 0; day < 7; day++) {
        const date = addDays(addWeeks(firstDay, week), day);
        
        // Skip if date is outside range
        if (date < startDate || date > endDate) continue;
        
        // Find contribution for this date using the map for O(1) lookup
        const dateStr = date.toISOString().split('T')[0];
        const value = processedData.get(dateStr) || 0;
        
        // Calculate color based on value
        let color;
        if (value === 0) {
          color = '#ebedf0'; // Light gray for no contributions
        } else {
          // Calculate intensity (0-1)
          const intensity = Math.min(value / maxValue, 1);
          
          // Use green scale with varying intensity
          const green = Math.floor(140 - intensity * 100); // 140 to 40
          color = `rgb(40, ${green}, 40)`;
        }
        
        // Draw cell
        ctx.fillStyle = color;
        ctx.fillRect(
          headerWidth + week * (cellSize + cellPadding),
          headerHeight + day * (cellSize + cellPadding),
          cellSize,
          cellSize
        );
      }
    }
    
    // Draw legend
    const legendX = headerWidth;
    const legendY = headerHeight + 7 * (cellSize + cellPadding) + 20;
    const legendWidth = cellSize * 5;
    const legendHeight = cellSize;
    
    ctx.fillStyle = '#718096'; // gray-500
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Less', legendX - 25, legendY + legendHeight / 2 + 3);
    
    // Draw legend gradient
    const gradient = [
      '#ebedf0', // No contributions
      'rgb(40, 140, 40)', // Few contributions
      'rgb(40, 110, 40)', // Some contributions
      'rgb(40, 80, 40)',  // More contributions
      'rgb(40, 40, 40)'   // Many contributions
    ];
    
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = gradient[i];
      ctx.fillRect(
        legendX + i * (legendWidth / 5),
        legendY,
        legendWidth / 5,
        legendHeight
      );
    }
    
    ctx.fillStyle = '#718096'; // gray-500
    ctx.textAlign = 'left';
    ctx.fillText('More', legendX + legendWidth + 5, legendY + legendHeight / 2 + 3);
    
  }, [contributionData, startDate, endDate, maxValue]);
  
  return (
    <div className="overflow-x-auto">
      <canvas 
        ref={canvasRef} 
        className="w-full min-w-[700px]"
        height={180}
      ></canvas>
    </div>
  );
}

// Helper function to detect dark mode
function isDarkMode() {
  if (typeof window === 'undefined') return false;
  
  // Check for system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return true;
  }
  
  // Check for dark mode class on document
  if (document.documentElement.classList.contains('dark')) {
    return true;
  }
  
  return false;
}