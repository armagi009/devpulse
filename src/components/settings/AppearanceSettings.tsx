'use client';

/**
 * AppearanceSettings Component
 * Allows users to customize the appearance of the application
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useSettings } from './SettingsContext';
import { fontWeights, lineHeights } from '@/lib/styles/responsive-typography';

// Interface for density options
interface DensityOption {
  value: string;
  label: string;
  description: string;
}

// Interface for font size options
interface FontSizeOption {
  value: string;
  label: string;
  scale: number;
}

// Density options
const densityOptions: DensityOption[] = [
  {
    value: 'compact',
    label: 'Compact',
    description: 'Reduced spacing, more content visible at once',
  },
  {
    value: 'comfortable',
    label: 'Comfortable',
    description: 'Default spacing for most users',
  },
  {
    value: 'spacious',
    label: 'Spacious',
    description: 'More space between elements for easier reading',
  },
];

// Font size options
const fontSizeOptions: FontSizeOption[] = [
  { value: 'xs', label: 'Extra Small', scale: 0.8 },
  { value: 'sm', label: 'Small', scale: 0.9 },
  { value: 'md', label: 'Medium', scale: 1 },
  { value: 'lg', label: 'Large', scale: 1.1 },
  { value: 'xl', label: 'Extra Large', scale: 1.2 },
];

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, loading, error } = useSettings();
  
  // Local state for settings
  const [density, setDensity] = useState<string>('comfortable');
  const [fontSize, setFontSize] = useState<string>('md');
  const [fontWeight, setFontWeight] = useState<string>('normal');
  const [lineHeight, setLineHeight] = useState<string>('normal');
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);
  
  // Initialize local state from settings
  useEffect(() => {
    if (settings) {
      // Parse dashboard layout settings if they exist
      const layout = settings.dashboardLayout as any || {};
      
      setDensity(layout.density || 'comfortable');
      setFontSize(layout.fontSize || 'md');
      setFontWeight(layout.fontWeight || 'normal');
      setLineHeight(layout.lineHeight || 'normal');
      setAnimationsEnabled(layout.animationsEnabled !== false);
      setHighContrastMode(layout.highContrastMode || false);
    }
  }, [settings]);
  
  // Update settings when local state changes
  const handleSettingChange = async (
    setting: string,
    value: string | boolean
  ) => {
    try {
      // Get current dashboard layout or initialize empty object
      const currentLayout = (settings?.dashboardLayout as any) || {};
      
      // Update local state
      switch (setting) {
        case 'theme':
          setTheme(value as 'light' | 'dark' | 'system');
          break;
        case 'density':
          setDensity(value as string);
          break;
        case 'fontSize':
          setFontSize(value as string);
          break;
        case 'fontWeight':
          setFontWeight(value as string);
          break;
        case 'lineHeight':
          setLineHeight(value as string);
          break;
        case 'animationsEnabled':
          setAnimationsEnabled(value as boolean);
          break;
        case 'highContrastMode':
          setHighContrastMode(value as boolean);
          break;
      }
      
      // Update settings in database
      await updateSettings({
        theme: setting === 'theme' ? (value as string) : settings?.theme,
        dashboardLayout: {
          ...currentLayout,
          [setting]: value,
        },
      });
      
      // Apply settings to document if needed
      if (setting === 'fontSize') {
        applyFontSize(value as string);
      }
      
      if (setting === 'highContrastMode') {
        applyContrastMode(value as boolean);
      }
      
    } catch (err) {
      console.error('Error updating appearance settings:', err);
    }
  };
  
  // Apply font size to document
  const applyFontSize = (size: string) => {
    const option = fontSizeOptions.find(opt => opt.value === size);
    if (option) {
      document.documentElement.style.setProperty('--font-scale', option.scale.toString());
    }
  };
  
  // Apply contrast mode to document
  const applyContrastMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
      
      // Add meta tag for Windows High Contrast Mode compatibility
      let metaTag = document.querySelector('meta[name="color-scheme"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'color-scheme');
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', 'light dark');
      
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.style.position = 'absolute';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.padding = '0';
      announcement.style.margin = '-1px';
      announcement.style.overflow = 'hidden';
      announcement.style.clip = 'rect(0, 0, 0, 0)';
      announcement.style.whiteSpace = 'nowrap';
      announcement.style.border = '0';
      announcement.textContent = 'High contrast mode enabled';
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 3000);
    } else {
      document.documentElement.classList.remove('high-contrast');
      
      // Update meta tag
      const metaTag = document.querySelector('meta[name="color-scheme"]');
      if (metaTag) {
        metaTag.setAttribute('content', theme === 'dark' ? 'dark' : 'light');
      }
      
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.style.position = 'absolute';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.padding = '0';
      announcement.style.margin = '-1px';
      announcement.style.overflow = 'hidden';
      announcement.style.clip = 'rect(0, 0, 0, 0)';
      announcement.style.whiteSpace = 'nowrap';
      announcement.style.border = '0';
      announcement.textContent = 'High contrast mode disabled';
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 3000);
    }
  };
  
  // Apply initial settings
  useEffect(() => {
    applyFontSize(fontSize);
    applyContrastMode(highContrastMode);
    
    // Add CSS variables for font scale
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --font-scale: 1;
      }
      
      .font-scaled {
        font-size: calc(var(--font-size) * var(--font-scale));
      }
      
      .high-contrast {
        --contrast-factor: 1.2;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Theme</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 transition-all hover:border-primary ${
              theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onClick={() => handleSettingChange('theme', 'light')}
          >
            <div className="mb-3 h-24 w-full rounded-md bg-white shadow-sm"></div>
            <span className="font-medium">Light</span>
          </div>
          
          <div
            className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 transition-all hover:border-primary ${
              theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onClick={() => handleSettingChange('theme', 'dark')}
          >
            <div className="mb-3 h-24 w-full rounded-md bg-gray-900 shadow-sm"></div>
            <span className="font-medium">Dark</span>
          </div>
          
          <div
            className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 transition-all hover:border-primary ${
              theme === 'system' ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onClick={() => handleSettingChange('theme', 'system')}
          >
            <div className="mb-3 grid h-24 w-full grid-cols-2 overflow-hidden rounded-md shadow-sm">
              <div className="bg-white"></div>
              <div className="bg-gray-900"></div>
            </div>
            <span className="font-medium">System</span>
          </div>
        </div>
      </div>
      
      {/* Density Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Density</h3>
        <div className="space-y-2">
          {densityOptions.map((option) => (
            <div
              key={option.value}
              className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all hover:border-primary ${
                density === option.value ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => handleSettingChange('density', option.value)}
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`density-${option.value}`}
                    name="density"
                    className="h-4 w-4 text-primary"
                    checked={density === option.value}
                    onChange={() => handleSettingChange('density', option.value)}
                  />
                  <label htmlFor={`density-${option.value}`} className="ml-2 font-medium">
                    {option.label}
                  </label>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Font Size Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Font Size</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="mr-2 text-sm">A</span>
            <input
              type="range"
              min="0"
              max="4"
              value={fontSizeOptions.findIndex(opt => opt.value === fontSize)}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                handleSettingChange('fontSize', fontSizeOptions[index].value);
              }}
              className="w-full"
            />
            <span className="ml-2 text-lg">A</span>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                className={`rounded-md px-3 py-1 text-center text-sm transition-all ${
                  fontSize === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
                onClick={() => handleSettingChange('fontSize', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="rounded-lg border border-border p-4">
            <p className="font-scaled mb-2 text-lg font-medium">Preview</p>
            <p className="font-scaled text-muted-foreground">
              This is how your text will appear throughout the application.
              Adjust the font size to make content easier to read.
            </p>
          </div>
        </div>
      </div>
      
      {/* Font Weight */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Font Weight</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(fontWeights)
            .filter(([key]) => ['light', 'normal', 'medium', 'semibold'].includes(key))
            .map(([key, value]) => (
              <button
                key={key}
                className={`rounded-md px-3 py-2 text-center transition-all ${
                  fontWeight === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
                style={{ fontWeight: value }}
                onClick={() => handleSettingChange('fontWeight', key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
        </div>
      </div>
      
      {/* Line Height */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Line Spacing</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(lineHeights)
            .filter(([key]) => ['tight', 'normal', 'relaxed', 'loose'].includes(key))
            .map(([key, value]) => (
              <button
                key={key}
                className={`rounded-md px-3 py-2 text-center transition-all ${
                  lineHeight === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
                onClick={() => handleSettingChange('lineHeight', key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
        </div>
        
        <div className="rounded-lg border border-border p-4">
          <p className="mb-2 text-lg font-medium" style={{ lineHeight: lineHeights[lineHeight as keyof typeof lineHeights] }}>
            Line Spacing Preview
          </p>
          <p className="text-muted-foreground" style={{ lineHeight: lineHeights[lineHeight as keyof typeof lineHeights] }}>
            This paragraph demonstrates how text will appear with the selected line spacing.
            Proper line spacing improves readability and makes text more comfortable to read,
            especially for longer content sections.
          </p>
        </div>
      </div>
      
      {/* Accessibility Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Accessibility</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="animations-toggle" className="font-medium">
                Animations
              </label>
              <p className="text-sm text-muted-foreground">
                Enable or disable UI animations and transitions
              </p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
              <input
                type="checkbox"
                id="animations-toggle"
                className="peer sr-only"
                checked={animationsEnabled}
                onChange={(e) => handleSettingChange('animationsEnabled', e.target.checked)}
              />
              <span
                className={`${
                  animationsEnabled ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
                } inline-block h-4 w-4 transform rounded-full transition`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="contrast-toggle" className="font-medium">
                High Contrast Mode
              </label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700" role="switch" aria-checked={highContrastMode}>
              <input
                type="checkbox"
                id="contrast-toggle"
                className="peer sr-only"
                checked={highContrastMode}
                onChange={(e) => handleSettingChange('highContrastMode', e.target.checked)}
                aria-label="Toggle high contrast mode"
              />
              <span
                className={`${
                  highContrastMode ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
                } inline-block h-4 w-4 transform rounded-full transition`}
              />
            </div>
          </div>
          
          {/* High Contrast Mode Preview */}
          {highContrastMode && (
            <div className="mt-4 p-4 rounded-lg border border-primary bg-primary/5">
              <h4 className="text-sm font-medium mb-2">High Contrast Mode Preview</h4>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary">Primary Button</button>
                <button className="btn btn-secondary">Secondary Button</button>
                <span className="badge badge-primary">Primary Badge</span>
                <span className="badge badge-secondary">Secondary Badge</span>
              </div>
              <p className="mt-2 text-sm">
                High contrast mode increases color contrast ratios to improve readability and meet WCAG AA standards.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}