/**
 * RootLayout Component
 * The main layout wrapper for the application
 */

import React from 'react';
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div
      className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-gray-50 font-sans text-gray-900 dark:bg-gray-900 dark:text-gray-50`}
    >
      {children}
    </div>
  );
}