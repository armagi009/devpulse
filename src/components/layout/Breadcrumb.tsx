'use client';

/**
 * Breadcrumb Component
 * Displays the current navigation path and allows users to navigate back to parent pages
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbProps {
  className?: string;
  homeIcon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  separator?: React.ReactNode;
  customPaths?: Record<string, string>;
}

export default function Breadcrumb({
  className = '',
  homeIcon,
  separator,
  customPaths = {},
}: BreadcrumbProps) {
  const pathname = usePathname();
  
  if (!pathname) return null;
  
  // Skip rendering breadcrumbs on the home page
  if (pathname === '/') return null;
  
  // Define the default home icon if not provided
  const DefaultHomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
      {...props}
    >
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );
  
  // Define the default separator if not provided
  const DefaultSeparator = () => (
    <svg
      className="h-5 w-5 flex-shrink-0 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
  
  // Use the provided icons or fall back to defaults
  const HomeIcon = homeIcon || DefaultHomeIcon;
  const SeparatorIcon = separator || <DefaultSeparator />;
  
  // Split the pathname into segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Generate breadcrumb items
  const breadcrumbItems = segments.map((segment, index) => {
    // Build the path for this segment
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    
    // Format the segment for display
    let displayName = segment
      .replace(/-/g, ' ')
      .replace(/\[|\]/g, '')
      .replace(/^\w/, (c) => c.toUpperCase());
    
    // Use custom path name if provided
    if (customPaths[path]) {
      displayName = customPaths[path];
    }
    
    // Check if this is the last segment (current page)
    const isLastSegment = index === segments.length - 1;
    
    return {
      path,
      displayName,
      isLastSegment,
    };
  });
  
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <span className="sr-only">Home</span>
            <HomeIcon aria-hidden="true" />
          </Link>
        </li>
        
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            <span className="mx-1 text-gray-400" aria-hidden="true">
              {SeparatorIcon}
            </span>
            {item.isLastSegment ? (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300" aria-current="page">
                {item.displayName}
              </span>
            ) : (
              <Link
                href={item.path}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {item.displayName}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}