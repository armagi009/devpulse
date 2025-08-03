import React, { useEffect, useState } from 'react';
import { announceToScreenReader } from '../ui/accessibility-utils';

export interface ChartAnnouncerProps {
  chartTitle: string;
  announcements: string[];
  dataChanges?: {
    previous?: any;
    current: any;
    description?: string;
  };
  interval?: number; // Time in ms between announcements
  children?: React.ReactNode;
}

/**
 * ChartAnnouncer component for announcing chart data changes to screen readers
 */
export const ChartAnnouncer: React.FC<ChartAnnouncerProps> = ({
  chartTitle,
  announcements = [],
  dataChanges,
  interval = 500,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Announce initial chart information
  useEffect(() => {
    if (chartTitle) {
      announceToScreenReader(`Chart: ${chartTitle}`);
    }
  }, [chartTitle]);
  
  // Announce data changes
  useEffect(() => {
    if (dataChanges && dataChanges.previous && dataChanges.current) {
      const message = dataChanges.description || 
        `Chart data updated for ${chartTitle}`;
      announceToScreenReader(message);
    }
  }, [dataChanges, chartTitle]);
  
  // Announce sequential announcements with interval
  useEffect(() => {
    if (announcements.length === 0 || currentIndex >= announcements.length - 1) {
      return;
    }
    
    const timer = setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < announcements.length) {
        announceToScreenReader(announcements[nextIndex]);
        setCurrentIndex(nextIndex);
      }
    }, interval);
    
    return () => clearTimeout(timer);
  }, [announcements, currentIndex, interval]);
  
  // Reset index when announcements change
  useEffect(() => {
    setCurrentIndex(-1);
    if (announcements.length > 0) {
      announceToScreenReader(announcements[0]);
      setCurrentIndex(0);
    }
  }, [announcements]);
  
  return <>{children}</>;
};

export default ChartAnnouncer;