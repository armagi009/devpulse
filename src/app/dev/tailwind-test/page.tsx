'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MinimalTest from '../../../components/ui/MinimalTest';

/**
 * Tailwind Test Page
 * 
 * This page is designed to verify if Tailwind CSS is working properly
 * and to help diagnose common issues.
 */
export default function TailwindTestPage() {
  const [cssStatus, setCssStatus] = useState('Checking...');
  const [cssClass, setCssClass] = useState('text-gray-500');
  const [issues, setIssues] = useState<string[]>([]);
  
  useEffect(() => {
    // Check if Tailwind styles are applied
    const testElement = document.querySelector('.bg-red-500');
    if (testElement) {
      const styles = window.getComputedStyle(testElement);
      if (styles.backgroundColor === 'rgb(239, 68, 68)' || // red-500 in RGB
          styles.backgroundColor.includes('red')) {
        setCssStatus('Working! Tailwind CSS is loaded correctly.');
        setCssClass('text-green-600 font-bold');
      } else {
        setCssStatus('Not working! Tailwind styles are not applied.');
        setCssClass('text-red-600 font-bold');
        
        // Diagnose potential issues
        const potentialIssues = [];
        
        // Check if globals.css is imported
        if (!document.styleSheets.length) {
          potentialIssues.push('No stylesheets detected. Check if globals.css is imported in layout.tsx.');
        }
        
        // Check for CSS conflicts
        potentialIssues.push('Possible CSS conflicts. Check for other CSS files that might override Tailwind.');
        
        // Check for build issues
        potentialIssues.push('Possible build configuration issues. Try running the fix-tailwind.js script.');
        
        setIssues(potentialIssues);
      }
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Tailwind CSS Test</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Status Check</h2>
          <p className={`mb-4 ${cssClass}`}>{cssStatus}</p>
          
          {issues.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-red-600 mb-2">Potential Issues:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {issues.map((issue, index) => (
                  <li key={index} className="text-gray-700">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Component</h2>
          <MinimalTest />
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tailwind Classes Test</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Colors</h3>
              <div className="flex flex-wrap gap-2">
                <div className="h-10 w-10 bg-red-500 rounded"></div>
                <div className="h-10 w-10 bg-blue-500 rounded"></div>
                <div className="h-10 w-10 bg-green-500 rounded"></div>
                <div className="h-10 w-10 bg-yellow-500 rounded"></div>
                <div className="h-10 w-10 bg-purple-500 rounded"></div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Typography</h3>
              <p className="text-xs">Extra Small</p>
              <p className="text-sm">Small</p>
              <p className="text-base">Base</p>
              <p className="text-lg">Large</p>
              <p className="text-xl">Extra Large</p>
              <p className="font-bold">Bold</p>
              <p className="italic">Italic</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Spacing</h3>
              <div className="flex items-end gap-1">
                <div className="bg-blue-500 text-white text-center p-1 w-8 h-8">2</div>
                <div className="bg-blue-500 text-white text-center p-1 w-12 h-12">3</div>
                <div className="bg-blue-500 text-white text-center p-1 w-16 h-16">4</div>
                <div className="bg-blue-500 text-white text-center p-1 w-20 h-20">5</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li className="text-gray-700">
              Run the fix-tailwind.js script:
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                node scripts/fix-tailwind.js
              </pre>
            </li>
            <li className="text-gray-700">
              Check if globals.css imports Tailwind directives:
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                {`@tailwind base;
@tailwind components;
@tailwind utilities;`}
              </pre>
            </li>
            <li className="text-gray-700">
              Verify that globals.css is imported in layout.tsx:
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                import './globals.css';
              </pre>
            </li>
            <li className="text-gray-700">
              Check tailwind.config.js content paths:
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                {`content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
],`}
              </pre>
            </li>
            <li className="text-gray-700">
              Restart the development server:
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                npm run dev
              </pre>
            </li>
            <li className="text-gray-700">
              If all else fails, try rebuilding the project:
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                npm run build && npm run start
              </pre>
            </li>
          </ol>
        </div>
        
        <div className="mt-8">
          <Link href="/dev/css-diagnostic" className="text-blue-500 hover:text-blue-700 mr-4">
            Go to CSS Diagnostic Tool
          </Link>
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}