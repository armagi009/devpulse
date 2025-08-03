'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * CSS Diagnostic Page
 * 
 * This page is designed to test if Tailwind CSS is loading properly.
 * It contains various UI elements with Tailwind classes to verify styling.
 */
export default function CssDiagnosticPage() {
    const [activeTab, setActiveTab] = useState('basic');

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-blue-600 mb-6">CSS Diagnostic Tool</h1>
                <p className="text-gray-700 mb-8">
                    This page tests if Tailwind CSS is loading properly. If elements look styled, Tailwind is working.
                    If they look like plain HTML, there's an issue with CSS loading.
                </p>

                {/* Status indicator */}
                <div className="flex items-center mb-8">
                    <div className="mr-3 h-4 w-4 rounded-full bg-green-500"></div>
                    <span className="font-medium">Tailwind should make this circle green and text bold</span>
                </div>

                {/* Tab navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('basic')}
                            className={`py-2 px-4 ${activeTab === 'basic'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Basic Elements
                        </button>
                        <button
                            onClick={() => setActiveTab('components')}
                            className={`py-2 px-4 ${activeTab === 'components'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Components
                        </button>
                        <button
                            onClick={() => setActiveTab('layout')}
                            className={`py-2 px-4 ${activeTab === 'layout'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Layout
                        </button>
                    </nav>
                </div>

                {/* Tab content */}
                <div className="bg-white shadow rounded-lg p-6">
                    {activeTab === 'basic' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Basic Elements</h2>

                            <div className="space-y-6">
                                {/* Text styles */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Typography</h3>
                                    <p className="text-sm text-gray-500">Small text</p>
                                    <p className="text-base text-gray-700">Base text</p>
                                    <p className="text-lg text-gray-900">Large text</p>
                                    <p className="text-xl font-bold text-gray-900">Extra large bold</p>
                                </div>

                                {/* Buttons */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Buttons</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                                            Primary
                                        </button>
                                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
                                            Secondary
                                        </button>
                                        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                                            Danger
                                        </button>
                                        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                                            Success
                                        </button>
                                    </div>
                                </div>

                                {/* Form elements */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Form Elements</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Text Input
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter text"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Select
                                            </label>
                                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                                <option>Option 1</option>
                                                <option>Option 2</option>
                                                <option>Option 3</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="checkbox"
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="checkbox" className="ml-2 text-sm text-gray-700">
                                                Checkbox
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'components' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Components</h2>

                            <div className="space-y-6">
                                {/* Card */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Card Header</h3>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-gray-700">This is a card component with header and footer.</p>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end">
                                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                            Action
                                        </button>
                                    </div>
                                </div>

                                {/* Alert */}
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                This is an alert component. If styled correctly, it should have a yellow background.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Badge */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Badges</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Badge
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Success
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Error
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Neutral
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'layout' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Layout</h2>

                            <div className="space-y-6">
                                {/* Grid */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Grid Layout</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-blue-100 p-4 rounded">Column 1</div>
                                        <div className="bg-blue-100 p-4 rounded">Column 2</div>
                                        <div className="bg-blue-100 p-4 rounded">Column 3</div>
                                        <div className="bg-blue-100 p-4 rounded">Column 4</div>
                                        <div className="bg-blue-100 p-4 rounded">Column 5</div>
                                        <div className="bg-blue-100 p-4 rounded">Column 6</div>
                                    </div>
                                </div>

                                {/* Flexbox */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Flexbox Layout</h3>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1 bg-purple-100 p-4 rounded">Flex Item 1</div>
                                        <div className="flex-1 bg-purple-100 p-4 rounded">Flex Item 2</div>
                                        <div className="flex-1 bg-purple-100 p-4 rounded">Flex Item 3</div>
                                    </div>
                                </div>

                                {/* Spacing */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Spacing</h3>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-300 w-full"></div>
                                        <div className="h-4 bg-gray-400 w-3/4"></div>
                                        <div className="h-4 bg-gray-500 w-1/2"></div>
                                        <div className="h-4 bg-gray-600 w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Diagnostic information */}
                <div className="mt-8 bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Diagnostic Information</h2>
                    <div className="space-y-2">
                        <p><strong>Browser:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server rendering'}</p>
                        <p><strong>Viewport:</strong> <span id="viewport-size">{typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown'}</span></p>
                        <p><strong>CSS loaded:</strong> <span id="css-loaded">Checking...</span></p>
                    </div>
                </div>

                {/* Navigation back */}
                <div className="mt-8">
                    <Link href="/" className="text-blue-500 hover:text-blue-700">
                        ← Back to Home
                    </Link>
                </div>

                {/* Script to check if CSS is loaded */}
                <script dangerouslySetInnerHTML={{
                    __html: `
            document.addEventListener('DOMContentLoaded', function() {
              // Check if Tailwind styles are applied
              const circle = document.querySelector('.h-4.w-4.rounded-full.bg-green-500');
              const cssLoaded = document.getElementById('css-loaded');
              
              if (circle) {
                const styles = window.getComputedStyle(circle);
                if (styles.backgroundColor === 'rgb(34, 197, 94)' || // green-500 in RGB
                    styles.backgroundColor.includes('green')) {
                  cssLoaded.textContent = 'Yes - Tailwind CSS is working!';
                  cssLoaded.className = 'text-green-600 font-bold';
                } else {
                  cssLoaded.textContent = 'No - Tailwind styles not applied correctly';
                  cssLoaded.className = 'text-red-600 font-bold';
                }
              }
              
              // Update viewport size on resize
              const viewportSize = document.getElementById('viewport-size');
              function updateViewportSize() {
                viewportSize.textContent = \`\${window.innerWidth}x\${window.innerHeight}\`;
              }
              
              window.addEventListener('resize', updateViewportSize);
            });
          `
                }} />
            </div>
        </div>
    );
}