'use client';

/**
 * Header Component
 * The main navigation header for the application
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NotificationCenterButton } from '@/components/ui/notification-center';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function Header({ user, sidebarOpen, setSidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Toggle user dropdown menu
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
            aria-controls="mobile-menu"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Open main menu</span>
            {sidebarOpen ? (
              <svg
                className="h-6 w-6"
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
            ) : (
              <svg
                className="h-6 w-6"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">
              DevPulse
            </span>
          </Link>
        </div>

        {/* Only show navigation if user is authenticated and not on landing page */}
        {user && pathname !== '/' && (
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/analytics"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname?.startsWith('/analytics')
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              Analytics
            </Link>
            <Link
              href="/retrospectives"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname?.startsWith('/retrospectives')
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              Retrospectives
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center">
              <NotificationCenterButton className="mr-2" />
            </div>
          )}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mr-1 hidden text-sm font-medium md:block">
                  {user.name}
                </span>
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border shadow-sm">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User avatar'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-white font-medium">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 origin-top-right rounded-lg bg-card p-1 shadow-lg ring-1 ring-border focus-visible:outline-none animate-in"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="relative flex items-center rounded-md px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <svg className="mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Your Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="relative flex items-center rounded-md px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <svg className="mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Settings
                    </Link>
                  </div>
                  
                  <div className="py-1 border-t border-border">
                    <Link
                      href="/api/auth/signout"
                      className="relative flex items-center rounded-md px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                    >
                      <svg className="mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm6.293 11.293a1 1 0 001.414 1.414l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 1.414L11.586 9H5a1 1 0 100 2h6.586l-2.293 2.293z" clipRule="evenodd" />
                      </svg>
                      Sign out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}