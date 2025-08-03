'use client';

/**
 * Color Contrast Test Page
 * 
 * This page demonstrates the color contrast audit tool and high contrast mode.
 * It allows developers to test and verify color contrast improvements.
 */

import React, { useState } from 'react';
import ColorContrastAudit from '@/components/ui/color-contrast-audit';
import { useTheme } from '@/components/providers/ThemeProvider';
import { 
  checkContrast, 
  adjustColorForContrast,
  ContrastStandard
} from '@/components/ui/accessibility-utils';

export default function ColorContrastPage() {
  const { theme } = useTheme();
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [showFixedColors, setShowFixedColors] = useState(true);
  const [showOnlyFailures, setShowOnlyFailures] = useState(false);
  const [customForeground, setCustomForeground] = useState('#6B7280');
  const [customBackground, setCustomBackground] = useState('#F9FAFB');
  const [customText, setCustomText] = useState('Sample Text');
  
  // Toggle high contrast mode
  const toggleHighContrast = () => {
    const newState = !highContrastMode;
    setHighContrastMode(newState);
    
    if (newState) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };
  
  // Calculate contrast for custom colors
  const customContrast = checkContrast(customForeground, customBackground);
  const fixedCustomColor = adjustColorForContrast(
    customForeground, 
    customBackground, 
    ContrastStandard.AA_NORMAL
  );
  
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Color Contrast Testing</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleHighContrast}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            {highContrastMode ? 'Disable' : 'Enable'} High Contrast Mode
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">UI Components in {highContrastMode ? 'High Contrast' : 'Normal'} Mode</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-card text-card-foreground rounded-lg border shadow">
              <h3 className="font-medium mb-2">Card Component</h3>
              <p className="text-sm text-muted-foreground">
                This is a card component with muted text.
              </p>
              <div className="mt-4 flex space-x-2">
                <button className="btn btn-primary">Primary Button</button>
                <button className="btn btn-secondary">Secondary Button</button>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Form Controls</h3>
              <div className="space-y-3">
                <div>
                  <label className="form-label">Text Input</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter some text"
                  />
                </div>
                <div>
                  <label className="form-label">Disabled Input</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Disabled input"
                    disabled
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="check1" />
                  <label htmlFor="check1">Checkbox</label>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Text Styles</h3>
              <div className="space-y-2">
                <p>Regular paragraph text</p>
                <p className="text-sm text-muted-foreground">Muted text for less important content</p>
                <p><a href="#">Link text</a> within a paragraph</p>
                <p className="text-destructive">Error message text</p>
                <p className="text-success-500">Success message text</p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-primary">Primary</span>
                <span className="badge badge-secondary">Secondary</span>
                <span className="badge badge-outline">Outline</span>
                <span className="badge badge-destructive">Destructive</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Custom Color Tester</h2>
          
          <div className="p-4 rounded-lg border space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Foreground Color</label>
                <div className="flex space-x-2">
                  <input 
                    type="color" 
                    value={customForeground}
                    onChange={(e) => setCustomForeground(e.target.value)}
                    className="h-10 w-10"
                  />
                  <input 
                    type="text" 
                    value={customForeground}
                    onChange={(e) => setCustomForeground(e.target.value)}
                    className="form-input flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">Background Color</label>
                <div className="flex space-x-2">
                  <input 
                    type="color" 
                    value={customBackground}
                    onChange={(e) => setCustomBackground(e.target.value)}
                    className="h-10 w-10"
                  />
                  <input 
                    type="text" 
                    value={customBackground}
                    onChange={(e) => setCustomBackground(e.target.value)}
                    className="form-input flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="form-label">Sample Text</label>
              <input 
                type="text" 
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="form-input w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Original</div>
              <div 
                className="h-20 rounded flex items-center justify-center text-lg p-4"
                style={{ 
                  color: customForeground, 
                  backgroundColor: customBackground 
                }}
              >
                {customText || 'Sample Text'}
              </div>
              
              {!customContrast.passesAA && (
                <div>
                  <div className="text-sm font-medium mt-4">Fixed (WCAG AA Compliant)</div>
                  <div 
                    className="h-20 rounded flex items-center justify-center text-lg p-4"
                    style={{ 
                      color: fixedCustomColor, 
                      backgroundColor: customBackground 
                    }}
                  >
                    {customText || 'Sample Text'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium mb-2">Contrast Results</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Contrast Ratio:</span>
                  <span className="font-mono">{customContrast.ratio.toFixed(2)}:1</span>
                </div>
                <div className="flex justify-between">
                  <span>WCAG AA (Normal Text):</span>
                  <span className={customContrast.passesAA ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {customContrast.passesAA ? 'Pass' : 'Fail'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>WCAG AA (Large Text):</span>
                  <span className={customContrast.passesAALarge ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {customContrast.passesAALarge ? 'Pass' : 'Fail'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>WCAG AAA (Normal Text):</span>
                  <span className={customContrast.passesAAA ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {customContrast.passesAAA ? 'Pass' : 'Fail'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>WCAG AAA (Large Text):</span>
                  <span className={customContrast.passesAAALarge ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {customContrast.passesAAALarge ? 'Pass' : 'Fail'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">System Color Audit</h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showFixedColors}
                onChange={() => setShowFixedColors(!showFixedColors)}
                className="h-4 w-4"
              />
              <span>Show fixed colors</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showOnlyFailures}
                onChange={() => setShowOnlyFailures(!showOnlyFailures)}
                className="h-4 w-4"
              />
              <span>Show only failures</span>
            </label>
          </div>
        </div>
        
        <ColorContrastAudit 
          showFixedColors={showFixedColors}
          showOnlyFailures={showOnlyFailures}
        />
      </div>
    </div>
  );
}