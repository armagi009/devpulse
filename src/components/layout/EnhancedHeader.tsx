'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface EnhancedHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function EnhancedHeader({ 
  user, 
  sidebarOpen, 
  setSidebarOpen 
}: EnhancedHeaderProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen, searchOpen]);

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
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mr-2 hidden md:flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-primary">
              DevPulse
            </span>
          </Link>
        </div>

        {/* Search bar */}
        <div 
          ref={searchRef}
          className="hidden md:flex relative max-w-md flex-1 mx-4"
        >
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search" 
              className="block w-full p-2 pl-10 text-sm rounded-lg bg-accent/50 border-accent focus:ring-primary focus:border-primary" 
              placeholder="Search..." 
              onClick={() => setSearchOpen(true)}
            />
          </div>
          
          {searchOpen && (
            <div className="absolute top-full mt-1 w-full bg-card rounded-lg shadow-lg border border-border p-2 z-50">
              <div className="p-2 text-sm text-muted-foreground">
                Recent searches
              </div>
              <div className="border-t border-border my-1"></div>
              <div className="p-2 text-sm hover:bg-accent rounded-md cursor-pointer">
                Burnout analysis
              </div>
              <div className="p-2 text-sm hover:bg-accent rounded-md cursor-pointer">
                Team productivity
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button className="p-2 rounded-full hover:bg-accent relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
          </button>
          
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
