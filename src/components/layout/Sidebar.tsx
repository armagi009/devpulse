'use client';

/**
 * Sidebar Component
 * Navigation sidebar for the dashboard
 */

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { JSX } from 'react/jsx-runtime';

interface SidebarItem {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

interface SidebarProps {
  items: SidebarItem[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ items, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  // Determine if the sidebar should be visible
  const sidebarClasses = isOpen
    ? 'translate-x-0'
    : '-translate-x-full';
    
  // State to track if we're on mobile
  const [isMobile, setIsMobile] = React.useState(false);
  
  // Check for mobile view after component mounts (client-side only)
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
      {/* Mobile sidebar overlay - only rendered client-side */}
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
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 flex flex-col w-72 h-screen transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarClasses}`}
      >
        <div className="glass-card h-full m-4 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-white/10">
          <div className="flex flex-1 flex-col overflow-y-auto scrollable">
            {/* Logo */}
            <div className="flex items-center mb-8 px-6 pt-6">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold">DP</span>
              </div>
              <div>
                <div className="text-xl font-bold gradient-text">DevPulse</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Dashboard</div>
              </div>
              <button
                type="button"
                className="ml-auto rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
                onClick={onClose}
              >
                <span className="sr-only">Close sidebar</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
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
            
            {/* Navigation */}
            <div className="px-6">
              <nav className="space-y-2">
                {items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        // Close sidebar on mobile when clicking a link
                        if (onClose && isMobile) {
                          onClose();
                        }
                      }}
                    >
                      <item.icon
                        className="text-xl mr-3 h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          
          {/* Settings Link */}
          <div className="absolute bottom-8 left-6 right-6">
            <Link
              href="/settings"
              className="sidebar-item w-full"
            >
              <svg
                className="text-xl mr-3 h-5 w-5 flex-shrink-0"
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
              <span className="font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}