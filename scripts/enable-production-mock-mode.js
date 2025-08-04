#!/usr/bin/env node
/**
 * Enable Production Mock Mode & Fix Tailwind CSS
 * 
 * This script enables mock mode for production deployment and applies
 * comprehensive Tailwind CSS fixes for production environment.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`💡 ${message}`, 'cyan');
}

function header(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

async function enableProductionMockMode() {
  header('ENABLING PRODUCTION MOCK MODE & FIXING TAILWIND');

  // 1. Update dev-mode.ts to enable production mock mode
  const devModeConfigPath = path.join(process.cwd(), 'src/lib/config/dev-mode.ts');
  
  const updatedDevModeConfig = `/**
 * Development Mode Configuration
 * 
 * This module provides configuration for development mode features like
 * mock authentication and mock API responses, including production mock mode.
 */

export interface DevModeConfig {
  useMockAuth: boolean;
  useMockApi: boolean;
  mockApiDelay: number;
  mockApiErrorRate: number;
  debugMode: boolean;
}

// Default configuration
const defaultConfig: DevModeConfig = {
  useMockAuth: false,
  useMockApi: false,
  mockApiDelay: 300,
  mockApiErrorRate: 0,
  debugMode: false,
};

/**
 * Get the development mode configuration
 * 
 * This function checks for configuration in localStorage (client-side)
 * and environment variables (server-side), with production mock mode support.
 * 
 * @returns The current development mode configuration
 */
export function getDevModeConfig(): DevModeConfig {
  // Start with default config
  const config = { ...defaultConfig };
  
  // Check for production mock mode first
  const isProductionMockMode = isProductionMockModeEnabled();
  
  if (isProductionMockMode) {
    config.useMockAuth = true;
    config.useMockApi = true;
    config.debugMode = false; // Keep debug off in production
  } else if (process.env.NODE_ENV === 'development') {
    // Always enable mock mode in development environment
    config.useMockAuth = true;
    config.useMockApi = true;
    config.debugMode = true;
  }
  
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Client-side: Check localStorage (only in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        const storedConfig = localStorage.getItem('devModeConfig');
        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          Object.assign(config, parsedConfig);
        }
        
        // Also check for individual flags that might be set
        if (localStorage.getItem('mockMode') === 'true') {
          config.useMockAuth = true;
          config.useMockApi = true;
        }
        
        if (localStorage.getItem('mockAuth') === 'true') {
          config.useMockAuth = true;
        }
        
        if (localStorage.getItem('mockApi') === 'true') {
          config.useMockApi = true;
        }
        
        if (localStorage.getItem('debugMode') === 'true') {
          config.debugMode = true;
        }
        
        // Force enable for localhost
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
          config.useMockAuth = true;
          config.useMockApi = true;
        }
      } catch (error) {
        console.error('Error reading dev mode config from localStorage:', error);
      }
    }
  } else {
    // Server-side: Check environment variables
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      config.useMockAuth = true;
      config.useMockApi = true;
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      config.useMockAuth = true;
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
      config.useMockApi = true;
    }
    
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      config.debugMode = true;
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_API_DELAY || process.env.MOCK_API_DELAY) {
      config.mockApiDelay = parseInt(process.env.NEXT_PUBLIC_MOCK_API_DELAY || process.env.MOCK_API_DELAY, 10);
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_API_ERROR_RATE || process.env.MOCK_API_ERROR_RATE) {
      config.mockApiErrorRate = parseFloat(process.env.NEXT_PUBLIC_MOCK_API_ERROR_RATE || process.env.MOCK_API_ERROR_RATE);
    }
  }
  
  return config;
}

/**
 * Check if production mock mode is enabled
 * 
 * @returns True if production mock mode should be enabled
 */
export function isProductionMockModeEnabled(): boolean {
  return process.env.NODE_ENV === 'production' && 
         (process.env.ENABLE_PRODUCTION_MOCK === 'true' || 
          process.env.NEXT_PUBLIC_ENABLE_PRODUCTION_MOCK === 'true' ||
          process.env.VERCEL === '1' || 
          !process.env.DATABASE_URL?.includes('localhost'));
}

/**
 * Update the development mode configuration
 * 
 * This function updates the configuration in localStorage (client-side only).
 * 
 * @param updates Partial configuration updates to apply
 * @returns The updated configuration
 */
export function updateDevModeConfig(updates: Partial<DevModeConfig>): DevModeConfig {
  // Only works client-side and in development
  if (typeof window === 'undefined') {
    throw new Error('updateDevModeConfig can only be called client-side');
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.warn('Cannot update dev mode config in production');
    return getDevModeConfig();
  }
  
  // Get current config
  const currentConfig = getDevModeConfig();
  
  // Apply updates
  const updatedConfig = {
    ...currentConfig,
    ...updates,
  };
  
  // Save to localStorage
  try {
    localStorage.setItem('devModeConfig', JSON.stringify(updatedConfig));
    
    // Also update individual flags for backward compatibility
    localStorage.setItem('mockMode', (updatedConfig.useMockAuth && updatedConfig.useMockApi).toString());
    localStorage.setItem('mockAuth', updatedConfig.useMockAuth.toString());
    localStorage.setItem('mockApi', updatedConfig.useMockApi.toString());
    localStorage.setItem('debugMode', updatedConfig.debugMode.toString());
  } catch (error) {
    console.error('Error saving dev mode config to localStorage:', error);
  }
  
  return updatedConfig;
}

/**
 * Helper functions for mock mode detection
 */
export function shouldUseMockAuth(): boolean {
  const config = getDevModeConfig();
  return config.useMockAuth;
}

export function shouldUseMockApi(): boolean {
  const config = getDevModeConfig();
  return config.useMockApi;
}

export function isDebugMode(): boolean {
  const config = getDevModeConfig();
  return config.debugMode;
}

/**
 * Get mock mode message for UI display
 */
export function getMockModeMessage(): string {
  if (isProductionMockModeEnabled()) {
    return 'Demo Mode - Using Simulated Data for Demonstration';
  }
  
  const config = getDevModeConfig();
  if (config.useMockAuth || config.useMockApi) {
    return 'Development Mock Mode Active';
  }
  
  return '';
}

/**
 * Log the current development mode status
 */
export function logDevModeStatus(): void {
  const config = getDevModeConfig();
  const isProductionMock = isProductionMockModeEnabled();
  
  console.log('Development Mode Status:');
  console.log(\`- Environment: \${process.env.NODE_ENV}\`);
  console.log(\`- Production Mock Mode: \${isProductionMock ? 'Enabled' : 'Disabled'}\`);
  console.log(\`- Mock Auth: \${config.useMockAuth ? 'Enabled' : 'Disabled'}\`);
  console.log(\`- Mock API: \${config.useMockApi ? 'Enabled' : 'Disabled'}\`);
  console.log(\`- Debug Mode: \${config.debugMode ? 'Enabled' : 'Disabled'}\`);
  console.log(\`- Mock API Delay: \${config.mockApiDelay}ms\`);
  console.log(\`- Mock API Error Rate: \${config.mockApiErrorRate * 100}%\`);
}

/**
 * Validate the development mode configuration
 * 
 * @returns Array of error messages, empty if no errors
 */
export function validateDevModeConfig(): string[] {
  const config = getDevModeConfig();
  const errors: string[] = [];
  
  // Check for invalid values
  if (config.mockApiDelay < 0) {
    errors.push('Mock API delay cannot be negative');
  }
  
  if (config.mockApiErrorRate < 0 || config.mockApiErrorRate > 1) {
    errors.push('Mock API error rate must be between 0 and 1');
  }
  
  return errors;
}

// Export the config object for convenience
export const config = getDevModeConfig();
`;

  fs.writeFileSync(devModeConfigPath, updatedDevModeConfig);
  success('Updated dev-mode.ts to enable production mock mode');

  // 2. Update Tailwind config for production with comprehensive fixes
  const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
  
  const updatedTailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    // Comprehensive content paths for production
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
    './src/styles/**/*.{css,scss}',
    
    // Ensure all component directories are included
    './src/components/ui/**/*.{js,ts,jsx,tsx}',
    './src/components/charts/**/*.{js,ts,jsx,tsx}',
    './src/components/layout/**/*.{js,ts,jsx,tsx}',
    './src/components/admin/**/*.{js,ts,jsx,tsx}',
    './src/components/auth/**/*.{js,ts,jsx,tsx}',
    './src/components/demo/**/*.{js,ts,jsx,tsx}',
    './src/components/github/**/*.{js,ts,jsx,tsx}',
    './src/components/help/**/*.{js,ts,jsx,tsx}',
    './src/components/mock/**/*.{js,ts,jsx,tsx}',
    './src/components/providers/**/*.{js,ts,jsx,tsx}',
    './src/components/retrospective/**/*.{js,ts,jsx,tsx}',
    './src/components/settings/**/*.{js,ts,jsx,tsx}',
    './src/components/team/**/*.{js,ts,jsx,tsx}',
    './src/components/analytics/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        md: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Brand colors
        primary: {
          50: 'hsl(221.2, 83.2%, 95.9%)',
          100: 'hsl(221.2, 83.2%, 91.2%)',
          200: 'hsl(221.2, 83.2%, 86.4%)',
          300: 'hsl(221.2, 83.2%, 77.8%)',
          400: 'hsl(221.2, 83.2%, 65.1%)',
          500: 'hsl(221.2, 83.2%, 53.3%)',
          600: 'hsl(221.2, 83.2%, 46.7%)',
          700: 'hsl(221.2, 83.2%, 40.0%)',
          800: 'hsl(221.2, 83.2%, 33.3%)',
          900: 'hsl(221.2, 83.2%, 26.7%)',
          950: 'hsl(221.2, 83.2%, 13.3%)',
          DEFAULT: 'hsl(221.2, 83.2%, 53.3%)',
        },

        // Semantic colors
        success: {
          50: 'hsl(142.1, 76.2%, 95.0%)',
          100: 'hsl(141.5, 84.5%, 88.5%)',
          500: 'hsl(142.1, 70.6%, 45.3%)',
          900: 'hsl(144.3, 80.4%, 10.0%)',
          DEFAULT: 'hsl(142.1, 70.6%, 45.3%)',
        },
        warning: {
          50: 'hsl(48.5, 96.6%, 95.0%)',
          100: 'hsl(48.8, 96.6%, 88.8%)',
          500: 'hsl(48.3, 96.0%, 50.0%)',
          900: 'hsl(32.1, 92.0%, 23.5%)',
          DEFAULT: 'hsl(48.3, 96.0%, 50.0%)',
        },
        error: {
          50: 'hsl(0, 85.7%, 97.3%)',
          100: 'hsl(0, 93.3%, 94.1%)',
          500: 'hsl(0, 84.2%, 60.2%)',
          900: 'hsl(0, 73.7%, 20.0%)',
          DEFAULT: 'hsl(0, 84.2%, 60.2%)',
        },
        info: {
          50: 'hsl(210, 100%, 97.5%)',
          100: 'hsl(210, 100%, 95.1%)',
          500: 'hsl(210, 100%, 50.0%)',
          900: 'hsl(210, 100%, 20.0%)',
          DEFAULT: 'hsl(210, 100%, 50.0%)',
        },

        // Theme-based colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Gradient colors for modern design
        'gradient-primary': 'from-blue-600 via-purple-600 to-pink-600',
        'gradient-secondary': 'from-green-500 to-blue-500',
        'gradient-warning': 'from-yellow-500 to-red-500',
        'gradient-success': 'from-green-500 to-emerald-500',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-success': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse": {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "slide-in": {
          from: { transform: 'translateY(10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-in",
        "slide-in": "slide-in 0.2s ease-out",
      },
      zIndex: {
        'dropdown': 1000,
        'sticky': 1020,
        'fixed': 1030,
        'modal-backdrop': 1040,
        'modal': 1050,
        'popover': 1060,
        'tooltip': 1070,
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '3px',
          },
        },
        // Container query utilities
        '.container-type-inline-size': {
          'container-type': 'inline-size',
        },
        '.container-type-size': {
          'container-type': 'size',
        },
        '.container-type-normal': {
          'container-type': 'normal',
        },
      }
      addUtilities(newUtilities)
    },
    // Add container queries plugin
    require('@tailwindcss/container-queries'),
  ],
  // Production optimizations
  corePlugins: {
    preflight: true,
  },
  // Safelist for production - ensure dynamic classes aren't purged
  safelist: [
    // Mock mode indicators
    'bg-yellow-100',
    'text-yellow-800',
    'border-yellow-300',
    'bg-blue-100',
    'text-blue-800',
    'border-blue-300',
    'bg-green-100',
    'text-green-800',
    'border-green-300',
    
    // Common utility classes that might be dynamically generated
    'text-sm',
    'text-xs',
    'text-lg',
    'text-xl',
    'font-medium',
    'font-semibold',
    'font-bold',
    'rounded-md',
    'rounded-lg',
    'rounded-full',
    'px-2',
    'px-3',
    'px-4',
    'px-6',
    'py-1',
    'py-2',
    'py-3',
    'py-4',
    'mb-2',
    'mb-4',
    'mb-6',
    'mt-2',
    'mt-4',
    'mt-6',
    'ml-2',
    'ml-4',
    'mr-2',
    'mr-4',
    
    // Layout classes
    'w-full',
    'h-full',
    'flex',
    'flex-col',
    'flex-row',
    'items-center',
    'items-start',
    'items-end',
    'justify-center',
    'justify-between',
    'justify-start',
    'justify-end',
    'space-x-2',
    'space-x-4',
    'space-y-2',
    'space-y-4',
    'grid',
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'grid-cols-6',
    'grid-cols-12',
    'gap-2',
    'gap-4',
    'gap-6',
    
    // Interactive states
    'hover:bg-gray-100',
    'hover:bg-blue-50',
    'hover:text-blue-600',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'active:bg-gray-200',
    
    // Status colors
    'text-red-600',
    'text-green-600',
    'text-yellow-600',
    'text-blue-600',
    'bg-red-50',
    'bg-green-50',
    'bg-yellow-50',
    'bg-blue-50',
    
    // Chart and data visualization classes
    'opacity-50',
    'opacity-75',
    'opacity-100',
    'transform',
    'transition-all',
    'duration-200',
    'duration-300',
    'ease-in-out',
  ],
};`;

  fs.writeFileSync(tailwindConfigPath, updatedTailwindConfig);
  success('Updated Tailwind config for production with comprehensive content paths and safelist');

  // 3. Create production-ready PostCSS configuration
  const postcssConfigPath = path.join(process.cwd(), 'postcss.config.js');
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Production optimizations
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
        }],
      },
    }),
  },
}`;

  fs.writeFileSync(postcssConfigPath, postcssConfig);
  success('Created production-ready PostCSS configuration');

  // 4. Update globals.css with production mock mode styles
  const globalsCssPath = path.join(process.cwd(), 'src/app/globals.css');
  let globalsCss = fs.readFileSync(globalsCssPath, 'utf8');

  // Add production mock mode styles if not present
  const productionStyles = `
/* Production Mock Mode Styles */
.mock-mode-indicator {
  @apply fixed top-0 right-0 z-50 bg-yellow-100 text-yellow-800 px-3 py-1 text-sm font-medium border-l border-b border-yellow-300 rounded-bl-md;
}

.demo-mode-banner {
  @apply bg-blue-100 text-blue-800 px-4 py-2 text-center text-sm font-medium border-b border-blue-300;
}

.production-mock-badge {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300;
}

/* Ensure all component styles are loaded in production */
.chart-container {
  @apply w-full h-full;
}

.dashboard-card {
  @apply bg-card text-card-foreground rounded-lg border p-6 shadow-sm;
}

.data-table {
  @apply w-full border-collapse;
}

.data-table th {
  @apply border-b px-4 py-2 text-left font-medium text-muted-foreground;
}

.data-table td {
  @apply border-b px-4 py-2;
}

/* Mock data specific styles */
.mock-data-badge {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800;
}

.mock-user-avatar {
  @apply w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium;
}

/* Production-specific optimizations */
.loading-skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}

.error-boundary {
  @apply p-4 border border-red-200 bg-red-50 rounded-lg;
}

.success-message {
  @apply p-4 border border-green-200 bg-green-50 rounded-lg text-green-800;
}

.warning-message {
  @apply p-4 border border-yellow-200 bg-yellow-50 rounded-lg text-yellow-800;
}

.info-message {
  @apply p-4 border border-blue-200 bg-blue-50 rounded-lg text-blue-800;
}
`;

  if (!globalsCss.includes('mock-mode-indicator')) {
    globalsCss += productionStyles;
    fs.writeFileSync(globalsCssPath, globalsCss);
    success('Added production mock mode styles to globals.css');
  }

  // 5. Create production mock mode indicator component
  const mockIndicatorPath = path.join(process.cwd(), 'src/components/ui/production-mock-indicator.tsx');
  const mockIndicatorComponent = `'use client';

import React from 'react';
import { isProductionMockModeEnabled, getMockModeMessage } from '@/lib/config/dev-mode';

export default function ProductionMockIndicator() {
  // Only show in production mock mode
  if (!isProductionMockModeEnabled() && process.env.NODE_ENV !== 'production') {
    return null;
  }

  const message = getMockModeMessage();
  if (!message) {
    return null;
  }

  return (
    <>
      {/* Top banner for demo mode */}
      <div className="demo-mode-banner">
        🎭 {message} - All data is simulated for demonstration purposes
      </div>
      
      {/* Corner indicator */}
      <div className="mock-mode-indicator">
        DEMO
      </div>
    </>
  );
}

// Hook for components to check if they should show mock data indicators
export function useMockModeIndicator() {
  const isProductionMock = isProductionMockModeEnabled();
  const isDevelopmentMock = process.env.NODE_ENV === 'development' && 
                           (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true' || 
                            process.env.NEXT_PUBLIC_USE_MOCK_API === 'true');

  return {
    showIndicator: isProductionMock || isDevelopmentMock,
    message: getMockModeMessage(),
    isProduction: isProductionMock
  };
}

// Component for showing mock data badges on individual elements
export function MockDataBadge({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  const { showIndicator } = useMockModeIndicator();
  
  if (!showIndicator) {
    return null;
  }

  return (
    <span className={\`mock-data-badge \${className}\`}>
      {children || 'Mock Data'}
    </span>
  );
}
`;

  fs.writeFileSync(mockIndicatorPath, mockIndicatorComponent);
  success('Created production mock mode indicator component');

  // 6. Update environment variables template
  const envProductionPath = path.join(process.cwd(), '.env.production.template');
  let envProduction = fs.existsSync(envProductionPath) ? fs.readFileSync(envProductionPath, 'utf8') : '';

  const mockModeEnvVars = `
# Production Mock Mode Configuration
ENABLE_PRODUCTION_MOCK=true
NEXT_PUBLIC_ENABLE_PRODUCTION_MOCK=true
NEXT_PUBLIC_USE_MOCK_AUTH=true
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_USE_MOCK_DATA=true
MOCK_API_DELAY=300
MOCK_API_ERROR_RATE=0

# Mock Mode Display Settings
NEXT_PUBLIC_SHOW_MOCK_INDICATOR=true
NEXT_PUBLIC_MOCK_MODE_MESSAGE="Demo Mode - Using Simulated Data"
`;

  if (!envProduction.includes('ENABLE_PRODUCTION_MOCK')) {
    envProduction += mockModeEnvVars;
    fs.writeFileSync(envProductionPath, envProduction);
    success('Added production mock mode environment variables to template');
  }

  // 7. Create/update vercel.json for production deployment
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  let vercelConfig = {};
  
  if (fs.existsSync(vercelConfigPath)) {
    try {
      vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    } catch (error) {
      console.warn('Could not parse existing vercel.json, creating new one');
    }
  }

  // Add production mock mode environment variables
  vercelConfig.build = {
    ...vercelConfig.build,
    env: {
      ...vercelConfig.build?.env,
      ENABLE_PRODUCTION_MOCK: "true",
      NEXT_PUBLIC_ENABLE_PRODUCTION_MOCK: "true",
      NEXT_PUBLIC_USE_MOCK_AUTH: "true",
      NEXT_PUBLIC_USE_MOCK_API: "true",
      NEXT_PUBLIC_USE_MOCK_DATA: "true",
      NEXT_PUBLIC_SHOW_MOCK_INDICATOR: "true",
      NEXT_PUBLIC_MOCK_MODE_MESSAGE: "Demo Mode - Using Simulated Data"
    }
  };

  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
  success('Updated vercel.json with production mock mode environment variables');

  // 8. Update main layout to include the mock mode indicator
  const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');

  // Add import for ProductionMockIndicator if not present
  if (!layoutContent.includes('ProductionMockIndicator')) {
    // Find the imports section and add our import
    const importMatch = layoutContent.match(/(import.*from.*['"]@\/components\/providers\/ThemeProvider['"])/);
    if (importMatch) {
      layoutContent = layoutContent.replace(
        importMatch[1],
        importMatch[1] + "\\nimport ProductionMockIndicator from '@/components/ui/production-mock-indicator'"
      );
    } else {
      // If ThemeProvider import not found, add at the top of imports
      const firstImportMatch = layoutContent.match(/(import.*from.*)/);
      if (firstImportMatch) {
        layoutContent = layoutContent.replace(
          firstImportMatch[1],
          "import ProductionMockIndicator from '@/components/ui/production-mock-indicator'\\n" + firstImportMatch[1]
        );
      }
    }

    // Add the indicator to the body
    const bodyMatch = layoutContent.match(/(<body[^>]*>)/);
    if (bodyMatch) {
      layoutContent = layoutContent.replace(
        bodyMatch[1],
        bodyMatch[1] + "\\n        <ProductionMockIndicator />"
      );
    }

    fs.writeFileSync(layoutPath, layoutContent);
    success('Added ProductionMockIndicator to main layout');
  }

  header('PRODUCTION MOCK MODE & TAILWIND FIXES SUMMARY');
  
  log('\\n🔧 Applied fixes:', 'blue');
  log('1. ✅ Enabled production mock mode in dev-mode.ts');
  log('2. ✅ Updated Tailwind config with comprehensive content paths');
  log('3. ✅ Added production-specific PostCSS configuration');
  log('4. ✅ Added production mock mode styles to globals.css');
  log('5. ✅ Created production mock mode indicator component');
  log('6. ✅ Updated environment variables template');
  log('7. ✅ Updated vercel.json with mock mode environment');
  log('8. ✅ Added mock mode indicator to main layout');

  log('\\n🚀 Production Mock Mode Features:', 'yellow');
  log('• Mock authentication for easy demo access');
  log('• Simulated API responses with realistic data');
  log('• Mock GitHub integration for portfolio demos');
  log('• Visual indicators showing demo mode status');
  log('• All features work without external dependencies');

  log('\\n🎨 Tailwind CSS Fixes:', 'cyan');
  log('• Comprehensive content path scanning');
  log('• Safelist for dynamically generated classes');
  log('• Production-optimized configuration');
  log('• Mock mode specific styling');
  log('• Responsive design utilities preserved');

  success('\\n🎯 Production mock mode and Tailwind fixes applied!');
  
  log('\\n📝 Next steps:', 'yellow');
  log('1. Test the build: npm run build');
  log('2. Commit and push changes');
  log('3. Your production deployment will now have:');
  log('   - Full mock mode functionality');
  log('   - Proper Tailwind CSS styling');
  log('   - Demo mode indicators');
  log('   - No external dependencies required');
}

// Run the fix
if (require.main === module) {
  enableProductionMockMode().catch(console.error);
}

module.exports = { enableProductionMockMode };