'use client';

/**
 * System Health Indicator Component
 * Displays the current health status of the system
 */

import React, { useState, useEffect } from 'react';

export default function SystemHealthIndicator() {
  const [status, setStatus] = useState<'healthy' | 'degraded' | 'unhealthy' | 'loading'>('loading');
  const [services, setServices] = useState<{ name: string; status: 'up' | 'down' | 'degraded' }[]>([]);
  
  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const response = await fetch('/api/health');
        
        if (!response.ok) {
          setStatus('unhealthy');
          return;
        }
        
        const data = await response.json();
        
        setStatus(data.status);
        setServices(data.services || []);
      } catch (error) {
        console.error('Error fetching health status:', error);
        setStatus('unhealthy');
      }
    };
    
    fetchHealthStatus();
    
    // Poll health status every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get status badge style
  const getStatusBadgeStyle = () => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'loading':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };
  
  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'healthy':
        return 'All Systems Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'unhealthy':
        return 'System Issues Detected';
      case 'loading':
      default:
        return 'Checking Status...';
    }
  };
  
  return (
    <div>
      <div className="flex items-center">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeStyle()}`}>
          {status === 'loading' && (
            <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {status !== 'loading' && (
            <span className={`flex-shrink-0 h-2 w-2 rounded-full mr-1.5 ${
              status === 'healthy' ? 'bg-green-500' : 
              status === 'degraded' ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}></span>
          )}
          {getStatusText()}
        </span>
      </div>
      
      {services.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {services.map((service) => (
            <div key={service.name} className="flex items-center mt-1">
              <span className={`flex-shrink-0 h-1.5 w-1.5 rounded-full mr-1 ${
                service.status === 'up' ? 'bg-green-500' : 
                service.status === 'degraded' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}></span>
              <span>{service.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}