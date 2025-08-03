'use client';

/**
 * MobileNavigation Component
 * 
 * A mobile-first bottom navigation bar that provides easy access to primary navigation items
 * on small screens. Designed with touch interactions in mind.
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTouchHandlers } from '@/lib/utils/touch-interactions';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface MobileNavigationProps {
  items: NavigationItem[];
  className?: string;
}

export function MobileNavigation({ items, className }: MobileNavigationProps) {
  const pathname = usePathname();
  
  // Handle swipe gestures for navigation
  const touchHandlers = useTouchHandlers({
    onSwipe: (event) => {
      // Find current index in navigation
      const currentIndex = items.findIndex(item => 
        pathname === item.href || pathname?.startsWith(`${item.href}/`)
      );
      
      if (currentIndex === -1) return;
      
      // Navigate left or right based on swipe direction
      if (event.direction === 'left' && currentIndex < items.length - 1) {
        window.location.href = items[currentIndex + 1].href;
      } else if (event.direction === 'right' && currentIndex > 0) {
        window.location.href = items[currentIndex - 1].href;
      }
    }
  });
  
  return (
    <nav 
      className={cn(
        'mobile-nav-container md:hidden',
        className
      )}
      {...touchHandlers}
    >
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'mobile-nav-link',
                isActive && 'mobile-nav-link-active'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="h-6 w-6">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNavigation;