'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { JSX } from 'react/jsx-runtime';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

interface EnhancedSidebarProps {
  items: SidebarItem[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function EnhancedSidebar({ 
  items, 
  isOpen = true, 
  onClose 
}: EnhancedSidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  // Check for mobile view after component mounts
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <div
        id="sidebar"
        ref={sidebarRef}
        className={cn(
          "fixed md:sticky top-0 inset-y-0 left-0 z-50 flex flex-col w-64 h-screen transform transition-all duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "border-r border-border bg-card shadow-lg"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-foreground">
              DevPulse
            </span>
          </div>
          
          <button
            type="button"
            className="ml-auto rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-primary text-white shadow-md" 
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                  onClick={() => {
                    if (onClose && isMobile) {
                      onClose();
                    }
                  }}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Sidebar footer */}
        <div className="mt-auto border-t border-border p-4">
          <div className="px-2 py-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Settings
            </h4>
            <Link
              href="/settings"
              className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <svg
                className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Settings</span>
            </Link>
            <Link
              href="/help"
              className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <svg
                className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Help</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
