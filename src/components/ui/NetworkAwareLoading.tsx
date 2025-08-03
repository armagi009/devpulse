'use client';

/**
 * NetworkAwareLoading Component
 * 
 * A component that optimizes loading strategies based on network conditions.
 * It detects network speed and connection type to adjust loading behavior.
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NetworkAwareLoadingProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  lowBandwidthFallback?: React.ReactNode;
  offlineFallback?: React.ReactNode;
  className?: string;
}

export function NetworkAwareLoading({
  children,
  fallback = <DefaultLoadingFallback />,
  lowBandwidthFallback,
  offlineFallback,
  className,
}: NetworkAwareLoadingProps) {
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'low-bandwidth'>('online');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check initial network status
    if (!navigator.onLine) {
      setNetworkStatus('offline');
    } else {
      // Try to detect connection type if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        
        if (connection) {
          // Check if it's a slow connection
          if (
            connection.effectiveType === 'slow-2g' || 
            connection.effectiveType === '2g' ||
            connection.saveData === true
          ) {
            setNetworkStatus('low-bandwidth');
          }
          
          // Listen for connection changes
          const updateConnectionStatus = () => {
            if (!navigator.onLine) {
              setNetworkStatus('offline');
            } else if (
              connection.effectiveType === 'slow-2g' || 
              connection.effectiveType === '2g' ||
              connection.saveData === true
            ) {
              setNetworkStatus('low-bandwidth');
            } else {
              setNetworkStatus('online');
            }
          };
          
          connection.addEventListener('change', updateConnectionStatus);
          return () => {
            connection.removeEventListener('change', updateConnectionStatus);
          };
        }
      }
    }
    
    // Basic online/offline detection fallback
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Simulate content loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, networkStatus === 'low-bandwidth' ? 100 : 500);
    
    return () => clearTimeout(timer);
  }, [networkStatus]);
  
  if (networkStatus === 'offline' && offlineFallback) {
    return <div className={className}>{offlineFallback}</div>;
  }
  
  if (networkStatus === 'low-bandwidth' && lowBandwidthFallback) {
    return <div className={className}>{lowBandwidthFallback}</div>;
  }
  
  if (isLoading) {
    return <div className={className}>{fallback}</div>;
  }
  
  return <div className={cn('network-aware-content', className)}>{children}</div>;
}

function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-4 h-full w-full min-h-[100px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

interface NetworkStatusIndicatorProps {
  className?: string;
}

export function NetworkStatusIndicator({ className }: NetworkStatusIndicatorProps) {
  const [status, setStatus] = useState<'online' | 'offline' | 'low-bandwidth'>('online');
  
  useEffect(() => {
    // Check initial network status
    if (!navigator.onLine) {
      setStatus('offline');
    } else {
      // Try to detect connection type if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        
        if (connection) {
          // Check if it's a slow connection
          if (
            connection.effectiveType === 'slow-2g' || 
            connection.effectiveType === '2g' ||
            connection.saveData === true
          ) {
            setStatus('low-bandwidth');
          }
          
          // Listen for connection changes
          const updateConnectionStatus = () => {
            if (!navigator.onLine) {
              setStatus('offline');
            } else if (
              connection.effectiveType === 'slow-2g' || 
              connection.effectiveType === '2g' ||
              connection.saveData === true
            ) {
              setStatus('low-bandwidth');
            } else {
              setStatus('online');
            }
          };
          
          connection.addEventListener('change', updateConnectionStatus);
          return () => {
            connection.removeEventListener('change', updateConnectionStatus);
          };
        }
      }
    }
    
    // Basic online/offline detection fallback
    const handleOnline = () => setStatus('online');
    const handleOffline = () => setStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (status === 'online') {
    return null; // Don't show indicator when online
  }
  
  return (
    <div 
      data-testid="network-status-indicator"
      className={cn(
        'fixed bottom-20 left-0 right-0 mx-auto w-fit px-4 py-2 rounded-full text-sm font-medium z-50 touch-target',
        status === 'offline' ? 'offline-indicator' : 'low-bandwidth-indicator',
        className
      )}
    >
      {status === 'offline' ? (
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a5 5 0 010-7.072m-3.183 1.757a3 3 0 010 3.558" />
          </svg>
          Offline Mode
        </div>
      ) : (
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Slow Connection
        </div>
      )}
    </div>
  );
}

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  mobileSrc?: string;
  lowBandwidthSrc?: string;
}

export function OptimizedImage({
  src,
  mobileSrc,
  lowBandwidthSrc,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'low-bandwidth'>('online');
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize
    window.addEventListener('resize', checkMobile);
    
    // Check network status
    if (!navigator.onLine) {
      setNetworkStatus('offline');
    } else if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        if (
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g' ||
          connection.saveData === true
        ) {
          setNetworkStatus('low-bandwidth');
        }
      }
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Determine which image source to use
  const imageSrc = (() => {
    if (networkStatus === 'low-bandwidth' && lowBandwidthSrc) {
      return lowBandwidthSrc;
    }
    
    if (isMobile && mobileSrc) {
      return mobileSrc;
    }
    
    return src;
  })();
  
  // Add lazy loading class for fade-in effect
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <img 
      src={imageSrc} 
      alt={alt || ''} 
      className={cn('lazy-load', isLoaded ? 'loaded' : '', className)}
      loading="lazy"
      data-mobile-optimized={isMobile ? "true" : "false"}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
}

export default {
  NetworkAwareLoading,
  NetworkStatusIndicator,
  OptimizedImage,
};