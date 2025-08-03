'use client';

/**
 * Settings Layout Component
 * Provides a consistent layout for settings pages
 */

import React from 'react';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content area */}
        <div className="flex-1">
          {children}
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        <p>
          Settings are automatically saved when you make changes. Some settings may require a page refresh to take effect.
        </p>
      </div>
    </div>
  );
}