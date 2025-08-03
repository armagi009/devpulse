'use client';

/**
 * MobileBottomNavigation Component
 * 
 * A mobile-first bottom navigation bar that provides easy access to primary actions
 * on small screens.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTouchHandlers } from '@/lib/utils/touch-interactions';

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | string;
}

interface MobileBottomNavigationProps {
  items: NavigationItem[];
  className?: string;
}

export function MobileBottomNavigation({
  items,
  className,
}: MobileBottomNavigationProps) {
  const pathname = usePathname();
  
  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex h-16 bg-background border-t shadow-lg',
        className
      )}
    >
      {items.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center text-xs font-medium transition-colors',
              isActive 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="relative">
              <div className={cn(
                'h-6 w-6',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item.icon}
              </div>
              
              {item.badge && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

interface MobileBottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

export function MobileBottomSheet({
  children,
  isOpen,
  onClose,
  title,
  className,
}: MobileBottomSheetProps) {
  const touchHandlers = useTouchHandlers({
    onSwipe: (event) => {
      if (event.direction === 'down') {
        onClose();
      }
    },
  });
  
  if (!isOpen) return null;
  
  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] rounded-t-xl bg-background p-4 shadow-lg transition-transform',
          className
        )}
        {...touchHandlers}
      >
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-muted" />
        
        {title && (
          <div className="mb-4 flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-medium">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-muted"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        
        <div className="overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}

interface MobileActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  className?: string;
}

export function MobileActionButton({
  icon,
  onClick,
  label,
  className,
}: MobileActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg',
        className
      )}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

export default {
  Navigation: MobileBottomNavigation,
  BottomSheet: MobileBottomSheet,
  ActionButton: MobileActionButton,
};