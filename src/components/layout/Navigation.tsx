'use client';

/**
 * Navigation Component
 * Unified navigation component for consistent navigation across the application
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/types/roles';
import { isTouchDevice, isTabletViewport } from '@/lib/utils/touch-interactions';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  permission?: string;
  children?: NavigationItem[];
}

interface NavigationProps {
  variant?: 'sidebar' | 'header' | 'mobile';
  className?: string;
}

export default function Navigation({ variant = 'sidebar', className = '' }: NavigationProps) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isTablet, setIsTablet] = useState(false);
  
  // Check if we're on a tablet device
  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(isTabletViewport());
    };
    
    checkTablet();
    window.addEventListener('resize', checkTablet);
    
    return () => {
      window.removeEventListener('resize', checkTablet);
    };
  }, []);
  
  // Define navigation items with permissions
  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (props) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="20"
          height="20"
          className="h-5 w-5"
          {...props}
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      name: 'Productivity',
      href: '/dashboard/productivity',
      icon: (props) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="20"
          height="20"
          className="h-5 w-5"
          {...props}
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      permission: PERMISSIONS.VIEW_PERSONAL_METRICS,
    },
    {
      name: 'Burnout Radar',
      href: '/dashboard/burnout',
      icon: (props) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="20"
          height="20"
          className="h-5 w-5"
          {...props}
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      permission: PERMISSIONS.VIEW_BURNOUT_PERSONAL,
    },
    {
      name: 'Team',
      href: '/dashboard/team',
      icon: (props) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="20"
          height="20"
          className="h-5 w-5"
          {...props}
        >
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      permission: PERMISSIONS.VIEW_TEAM_METRICS,
      children: [
        {
          name: 'Overview',
          href: '/dashboard/team',
          icon: (props) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="20"
              height="20"
              className="h-5 w-5"
              {...props}
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          ),
        },
        {
          name: 'Members',
          href: '/dashboard/team/members',
          icon: (props) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="20"
              height="20"
              className="h-5 w-5"
              {...props}
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          ),
          permission: PERMISSIONS.MANAGE_TEAMS,
        },
      ],
    },
    {
      name: 'Repositories',
      href: '/dashboard/repositories',
      icon: (props) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="20"
          height="20"
          className="h-5 w-5"
          {...props}
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      ),
      permission: PERMISSIONS.MANAGE_REPOSITORIES,
    },
    {
      name: 'Retrospectives',
      href: '/dashboard/retrospective',
      icon: (props) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="20"
          height="20"
          className="h-5 w-5"
          {...props}
        >
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path
            fillRule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clipRule="evenodd"
          />
        </svg>
      ),
      permission: PERMISSIONS.CREATE_RETROSPECTIVES,
    },
    {
      name: 'Admin',
      href: '/admin',
      icon: (props) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="20"
          height="20"
          className="h-5 w-5"
          {...props}
        >
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      permission: PERMISSIONS.ADMIN_SYSTEM,
      children: [
        {
          name: 'Dashboard',
          href: '/admin',
          icon: (props) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="20"
              height="20"
              className="h-5 w-5"
              {...props}
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          ),
        },
        {
          name: 'Users',
          href: '/admin/users',
          icon: (props) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="20"
              height="20"
              className="h-5 w-5"
              {...props}
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          ),
        },
        {
          name: 'Settings',
          href: '/admin/settings',
          icon: (props) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="20"
              height="20"
              className="h-5 w-5"
              {...props}
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          ),
        },
        {
          name: 'Mock Mode',
          href: '/admin/mock-mode',
          icon: (props) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="20"
              height="20"
              className="h-5 w-5"
              {...props}
            >
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          ),
          permission: PERMISSIONS.ADMIN_MOCK_MODE,
        },
      ],
    },
  ];
  
  // Toggle expanded state for items with children
  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name);
      } else {
        return [...prev, name];
      }
    });
  };
  
  // Auto-expand items based on current path
  useEffect(() => {
    const parentItems = navigationItems.filter((item) => item.children);
    
    const expandedParents = parentItems.filter((parent) => {
      return parent.children?.some((child) => pathname?.startsWith(child.href));
    }).map((parent) => parent.name);
    
    setExpandedItems(expandedParents);
  }, [pathname]);
  
  // Filter items based on permissions
  const filteredItems = navigationItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });
  
  // Check if an item is active
  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    return pathname?.startsWith(href) && href !== '/dashboard';
  };
  
  // Render sidebar navigation
  if (variant === 'sidebar') {
    return (
      <nav className={cn("space-y-1", isTablet && "tablet-nav", className)}>
        {filteredItems.map((item) => {
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.name);
          
          // Filter children based on permissions
          const filteredChildren = item.children?.filter((child) => {
            if (!child.permission) return true;
            return hasPermission(child.permission);
          });
          
          return (
            <div key={item.name}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={cn(
                    "group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium",
                    active
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                    isTablet && "py-3 px-3 text-base touch-feedback"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      active
                        ? "text-gray-500 dark:text-gray-300"
                        : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300",
                      isTablet && "h-6 w-6"
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-left">{item.name}</span>
                  <svg
                    className={cn(
                      "ml-3 h-4 w-4 transform text-gray-400 transition-transform",
                      isExpanded ? "rotate-90" : "",
                      isTablet && "h-5 w-5"
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                    active
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                    isTablet && "py-3 px-3 text-base touch-feedback"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      active
                        ? "text-gray-500 dark:text-gray-300"
                        : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300",
                      isTablet && "h-6 w-6"
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </Link>
              )}
              
              {/* Render children if expanded */}
              {hasChildren && isExpanded && filteredChildren && filteredChildren.length > 0 && (
                <div className={cn(
                  "mt-1 space-y-1 pl-7",
                  isTablet && "pl-8 mt-2 space-y-2"
                )}>
                  {filteredChildren.map((child) => {
                    const childActive = isActive(child.href);
                    
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                          childActive
                            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                          isTablet && "py-3 px-3 text-base touch-feedback"
                        )}
                      >
                        <child.icon
                          className={cn(
                            "mr-3 h-4 w-4 flex-shrink-0",
                            childActive
                              ? "text-gray-500 dark:text-gray-300"
                              : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300",
                            isTablet && "h-5 w-5"
                          )}
                          aria-hidden="true"
                        />
                        <span>{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    );
  }
  
  // Render header navigation
  if (variant === 'header') {
    return (
      <nav className={`hidden space-x-8 md:flex ${className}`}>
        {filteredItems.map((item) => {
          const active = isActive(item.href);
          
          if (item.children) {
            return null; // Skip items with children in header navigation
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                active
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    );
  }
  
  // Render mobile navigation
  if (variant === 'mobile') {
    return (
      <nav className={cn(
        "md:hidden",
        isTablet && "tablet-nav",
        className
      )}>
        <div className={cn(
          "grid grid-cols-4 gap-1",
          isTablet && "gap-2"
        )}>
          {filteredItems.slice(0, 4).map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center px-3 py-2 text-xs touch-feedback",
                  isTablet && "py-3 px-4 text-sm"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    active
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                    isTablet && "h-12 w-12"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5",
                    isTablet && "h-6 w-6"
                  )} aria-hidden="true" />
                </div>
                <span
                  className={cn(
                    "mt-1",
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400",
                    isTablet && "mt-2"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }
  
  return null;
}