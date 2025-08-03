'use client';

/**
 * RoleBasedNavigation Component
 * Provides navigation links based on user role
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { UserRole, PERMISSIONS } from '@/lib/types/roles';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  roles: UserRole[];
}

interface RoleBasedNavigationProps {
  className?: string;
}

export default function RoleBasedNavigation({ className = '' }: RoleBasedNavigationProps) {
  const pathname = usePathname();
  const { hasRole } = usePermissions();
  
  // Define navigation items with role requirements
  const navigationItems: NavigationItem[] = [
    {
      name: 'Developer Dashboard',
      href: '/dashboard/developer',
      roles: [UserRole.DEVELOPER, UserRole.TEAM_LEAD, UserRole.ADMINISTRATOR],
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
      name: 'Team Lead Dashboard',
      href: '/dashboard/team-lead',
      roles: [UserRole.TEAM_LEAD, UserRole.ADMINISTRATOR],
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
    },
    {
      name: 'Admin Dashboard',
      href: '/dashboard/admin',
      roles: [UserRole.ADMINISTRATOR],
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
  ];
  
  // Filter items based on user role
  const filteredItems = navigationItems.filter((item) => {
    return item.roles.some(role => hasRole(role));
  });
  
  // Check if an item is active
  const isActive = (href: string) => {
    return pathname === href;
  };
  
  return (
    <nav className={cn("flex space-x-4", className)}>
      {filteredItems.map((item) => {
        const active = isActive(item.href);
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium",
              active
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            )}
          >
            <item.icon
              className={cn(
                "mr-2 h-5 w-5",
                active
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
              )}
              aria-hidden="true"
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}