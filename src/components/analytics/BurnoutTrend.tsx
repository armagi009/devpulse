/**
 * BurnoutTrend Component
 * Displays historical trend of burnout risk scores
 */

import React, { useEffect, useRef } from 'react';
import { TrendPoint } from '@/lib/analytics/burnout-calculator';
import { format } from 'date-fns';
import { hasValidContrast } from '@/components/ui/accessibility-utils';

interface BurnoutTrendProps {
  trendData: TrendPoint[];
}

export default function BurnoutTrend({ trendData }: BurnoutTrendProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw trend chart
  useEffect(() => {
    if (!canvasRef.current || trendData.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Chart dimensions
    const padding = 20;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    // Find min and max dates
    const dates = trendData.map(point => {
      // Ensure we're working with Date objects
      let dateObj;
      if (point.date instanceof Date) {
        dateObj = point.date;
      } else if (typeof point.date === 'string') {
        dateObj = new Date(point.date);
      } else if (typeof point.date === 'object' && point.date !== null) {
        // Handle potential serialized date objects
        dateObj = new Date(point.date.toString());
      } else {
        // Fallback to current date if date is invalid
        console.warn('Invalid date format in trend data:', point.date);
        dateObj = new Date();
      }
      return dateObj.getTime();
    });
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate;
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#718096'; // gray-500 for better contrast
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.moveTo(padding, rect.height - padding);
    ctx.lineTo(rect.width - padding, rect.height - padding);
    
    // Y-axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, rect.height - padding);
    ctx.stroke();
    
    // Draw grid lines
    ctx.beginPath();
    ctx.strokeStyle = '#A0AEC0'; // gray-400 for better contrast
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines (0, 25, 50, 75, 100)
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight * (4 - i)) / 4;
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      
      // Add labels
      ctx.fillStyle = '#4A5568'; // gray-600 for better contrast
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${i * 25}`, padding - 5, y + 3);
    }
    ctx.stroke();
    
    // Draw trend line
    if (trendData.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#2563EB'; // blue-600 for better contrast
      ctx.lineWidth = 2;
      
      // Move to first point
      const firstPoint = trendData[0];
      let firstDate;
      if (firstPoint.date instanceof Date) {
        firstDate = firstPoint.date;
      } else if (typeof firstPoint.date === 'string') {
        firstDate = new Date(firstPoint.date);
      } else if (typeof firstPoint.date === 'object' && firstPoint.date !== null) {
        // Handle potential serialized date objects
        firstDate = new Date(firstPoint.date.toString());
      } else {
        console.warn('Invalid date format in first trend point:', firstPoint.date);
        firstDate = new Date();
      }
      const firstX = padding + (chartWidth * (firstDate.getTime() - minDate)) / dateRange;
      const firstY = padding + chartHeight - (chartHeight * firstPoint.value) / 100;
      ctx.moveTo(firstX, firstY);
      
      // Draw line to each point
      for (let i = 1; i < trendData.length; i++) {
        const point = trendData[i];
        let pointDate;
        if (point.date instanceof Date) {
          pointDate = point.date;
        } else if (typeof point.date === 'string') {
          pointDate = new Date(point.date);
        } else if (typeof point.date === 'object' && point.date !== null) {
          // Handle potential serialized date objects
          pointDate = new Date(point.date.toString());
        } else {
          console.warn('Invalid date format in trend point:', point.date);
          pointDate = new Date();
        }
        const x = padding + (chartWidth * (pointDate.getTime() - minDate)) / dateRange;
        const y = padding + chartHeight - (chartHeight * point.value) / 100;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Draw points
      ctx.fillStyle = '#2563EB'; // blue-600 for better contrast
      for (const point of trendData) {
        let pointDate;
        if (point.date instanceof Date) {
          pointDate = point.date;
        } else if (typeof point.date === 'string') {
          pointDate = new Date(point.date);
        } else if (typeof point.date === 'object' && point.date !== null) {
          // Handle potential serialized date objects
          pointDate = new Date(point.date.toString());
        } else {
          console.warn('Invalid date format in trend point:', point.date);
          pointDate = new Date();
        }
        const x = padding + (chartWidth * (pointDate.getTime() - minDate)) / dateRange;
        const y = padding + chartHeight - (chartHeight * point.value) / 100;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw date labels (first and last)
    if (trendData.length > 1) {
      ctx.fillStyle = '#718096'; // gray-500
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      
      // First date
      const firstPointDate = trendData[0].date instanceof Date 
        ? trendData[0].date 
        : new Date(trendData[0].date);
      const firstDate = format(firstPointDate, 'MMM d');
      ctx.fillText(firstDate, padding, rect.height - padding + 15);
      
      // Last date
      const lastPointDate = trendData[trendData.length - 1].date instanceof Date 
        ? trendData[trendData.length - 1].date 
        : new Date(trendData[trendData.length - 1].date);
      const lastDate = format(lastPointDate, 'MMM d');
      ctx.fillText(lastDate, rect.width - padding, rect.height - padding + 15);
    }
  }, [trendData]);

  // If no trend data, show message
  if (trendData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md dark:bg-gray-700/30">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No historical data available yet. Check back later as more data is collected.
        </p>
      </div>
    );
  }

  return (
    <div className="h-40">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      ></canvas>
    </div>
  );
}