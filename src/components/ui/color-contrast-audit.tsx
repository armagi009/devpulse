'use client';

/**
 * ColorContrastAudit Component
 * 
 * A utility component for auditing and visualizing color contrast issues in the UI.
 * This component can be used in development mode to identify and fix contrast problems.
 */

import React, { useState, useEffect } from 'react';
import { 
  checkContrast, 
  ContrastStandard, 
  adjustColorForContrast 
} from './accessibility-utils';
import { colors, lightTheme, darkTheme } from '@/lib/styles/design-system';

interface ColorPair {
  name: string;
  foreground: string;
  background: string;
  usage: string;
}

interface ContrastAuditProps {
  showFixedColors?: boolean;
  showOnlyFailures?: boolean;
}

export default function ColorContrastAudit({ 
  showFixedColors = false,
  showOnlyFailures = false 
}: ContrastAuditProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [colorPairs, setColorPairs] = useState<ColorPair[]>([]);
  const [auditResults, setAuditResults] = useState<Record<string, any>>({});
  
  // Generate color pairs based on the design system
  useEffect(() => {
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;
    const pairs: ColorPair[] = [
      {
        name: 'Text on Background',
        foreground: `hsl(${currentTheme.foreground})`,
        background: `hsl(${currentTheme.background})`,
        usage: 'Body text on page background'
      },
      {
        name: 'Text on Card',
        foreground: `hsl(${currentTheme.cardForeground})`,
        background: `hsl(${currentTheme.card})`,
        usage: 'Text on card components'
      },
      {
        name: 'Primary Button',
        foreground: `hsl(${currentTheme.primaryForeground})`,
        background: `hsl(${currentTheme.primary})`,
        usage: 'Text on primary buttons'
      },
      {
        name: 'Secondary Button',
        foreground: `hsl(${currentTheme.secondaryForeground})`,
        background: `hsl(${currentTheme.secondary})`,
        usage: 'Text on secondary buttons'
      },
      {
        name: 'Muted Text',
        foreground: `hsl(${currentTheme.mutedForeground})`,
        background: `hsl(${currentTheme.background})`,
        usage: 'Muted text on page background'
      },
      {
        name: 'Accent',
        foreground: `hsl(${currentTheme.accentForeground})`,
        background: `hsl(${currentTheme.accent})`,
        usage: 'Text on accent elements'
      },
      {
        name: 'Destructive',
        foreground: `hsl(${currentTheme.destructiveForeground})`,
        background: `hsl(${currentTheme.destructive})`,
        usage: 'Text on destructive elements'
      },
      {
        name: 'Link on Background',
        foreground: `hsl(${currentTheme.primary})`,
        background: `hsl(${currentTheme.background})`,
        usage: 'Links on page background'
      },
      {
        name: 'Border on Background',
        foreground: `hsl(${currentTheme.border})`,
        background: `hsl(${currentTheme.background})`,
        usage: 'Borders on page background'
      },
    ];
    
    // Add data visualization colors
    Object.entries(colors.dataViz).forEach(([key, value]) => {
      pairs.push({
        name: `DataViz: ${key}`,
        foreground: value,
        background: `hsl(${currentTheme.background})`,
        usage: `${key} data visualization on background`
      });
    });
    
    setColorPairs(pairs);
  }, [theme]);
  
  // Run the audit
  useEffect(() => {
    const results: Record<string, any> = {};
    
    colorPairs.forEach(pair => {
      const contrastResult = checkContrast(pair.foreground, pair.background);
      const fixedColor = adjustColorForContrast(
        pair.foreground, 
        pair.background, 
        ContrastStandard.AA_NORMAL
      );
      
      results[pair.name] = {
        ...contrastResult,
        originalColor: pair.foreground,
        fixedColor,
        background: pair.background
      };
    });
    
    setAuditResults(results);
  }, [colorPairs]);
  
  // Filter results based on props
  const filteredResults = Object.entries(auditResults).filter(([_, result]) => {
    if (showOnlyFailures && result.passesAA) {
      return false;
    }
    return true;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Color Contrast Audit</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showOnlyFailures}
              onChange={() => {}}
              className="h-4 w-4"
            />
            <span>Show only failures</span>
          </label>
          
          <div className="flex items-center space-x-2 border rounded-md p-2">
            <button
              className={`px-3 py-1 rounded-md ${theme === 'light' ? 'bg-primary text-white' : ''}`}
              onClick={() => setTheme('light')}
            >
              Light
            </button>
            <button
              className={`px-3 py-1 rounded-md ${theme === 'dark' ? 'bg-primary text-white' : ''}`}
              onClick={() => setTheme('dark')}
            >
              Dark
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResults.map(([name, result]) => (
          <div 
            key={name}
            className={`border rounded-lg p-4 ${!result.passesAA ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-green-500 bg-green-50 dark:bg-green-950'}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{name}</h3>
              <span className={`text-sm px-2 py-0.5 rounded-full ${
                result.passesAA ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}>
                {result.passesAA ? 'Passes' : 'Fails'} WCAG AA
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {colorPairs.find(pair => pair.name === name)?.usage}
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <div className="w-24 text-sm">Contrast ratio:</div>
                <div className="font-mono">{result.ratio.toFixed(2)}:1</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-24 text-sm">AA Normal:</div>
                <div className={result.passesAA ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {result.passesAA ? '✓ Pass' : '✗ Fail'}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-24 text-sm">AA Large:</div>
                <div className={result.passesAALarge ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {result.passesAALarge ? '✓ Pass' : '✗ Fail'}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-24 text-sm">AAA Normal:</div>
                <div className={result.passesAAA ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {result.passesAAA ? '✓ Pass' : '✗ Fail'}
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex flex-col space-y-1">
                <div className="text-sm font-medium">Original</div>
                <div 
                  className="h-10 rounded flex items-center justify-center"
                  style={{ 
                    color: result.originalColor, 
                    backgroundColor: result.background 
                  }}
                >
                  Sample Text
                </div>
              </div>
              
              {showFixedColors && !result.passesAA && (
                <div className="flex flex-col space-y-1">
                  <div className="text-sm font-medium">Fixed</div>
                  <div 
                    className="h-10 rounded flex items-center justify-center"
                    style={{ 
                      color: result.fixedColor, 
                      backgroundColor: result.background 
                    }}
                  >
                    Sample Text
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}