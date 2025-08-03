/**
 * Demo Mode Page
 * 
 * This page provides access to guided demo scenarios and presentation mode
 * for showcasing the application's features.
 */

'use client';

import './presentation-mode.css';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMode } from '@/lib/context/ModeContext';
import { AppMode } from '@/lib/types/roles';
import Link from 'next/link';
import DemoScenarios from '@/components/demo/DemoScenarios';

export default function DemoModePage() {
  const router = useRouter();
  const { mode, switchMode } = useMode();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);
  
  // Check if we're in demo mode
  const isInDemoMode = mode === AppMode.DEMO;
  
  // Load initial state
  useEffect(() => {
    try {
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing demo page:', error);
      setError('Failed to initialize demo page');
      setIsLoading(false);
    }
  }, []);
  
  // Toggle presentation mode
  const togglePresentationMode = () => {
    setPresentationMode(!presentationMode);
    
    // If entering presentation mode, add a class to the body
    if (!presentationMode) {
      document.body.classList.add('presentation-mode');
    } else {
      document.body.classList.remove('presentation-mode');
    }
  };
  
  // Enter demo mode
  const enterDemoMode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Switch to demo mode
      const success = await switchMode(AppMode.DEMO);
      
      if (!success) {
        throw new Error('Failed to enter demo mode');
      }
    } catch (err) {
      console.error('Error entering demo mode:', err);
      setError(`Failed to enter demo mode: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Exit demo mode
  const exitDemoMode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Switch back to live mode
      const success = await switchMode(AppMode.LIVE);
      
      if (!success) {
        throw new Error('Failed to exit demo mode');
      }
      
      // Turn off presentation mode if it's on
      if (presentationMode) {
        setPresentationMode(false);
        document.body.classList.remove('presentation-mode');
      }
    } catch (err) {
      console.error('Error exiting demo mode:', err);
      setError(`Failed to exit demo mode: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
          <p className="mt-4 text-center text-gray-500 dark:text-gray-400">Loading demo mode...</p>
        </div>
      </div>
    );
  }
  
  // If there's an error, show error message
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      onClick={() => window.location.reload()}
                      className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gray-50 py-12 dark:bg-gray-900 sm:px-6 lg:px-8 ${presentationMode ? 'presentation-mode' : ''}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Demo Mode</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Guided demos and presentation mode for showcasing the application
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {isInDemoMode ? (
              <button
                onClick={exitDemoMode}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Exit Demo Mode
              </button>
            ) : (
              <button
                onClick={enterDemoMode}
                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Enter Demo Mode
              </button>
            )}
            <button
              onClick={togglePresentationMode}
              className={`rounded-md px-4 py-2 text-sm font-medium shadow-sm ${
                presentationMode
                  ? 'border border-purple-300 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:border-purple-600 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {presentationMode ? 'Exit Presentation Mode' : 'Enter Presentation Mode'}
            </button>
          </div>
        </div>
        
        {isInDemoMode ? (
          <div className="mt-8">
            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6">
                <DemoScenarios />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="overflow-hidden rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Demo Mode Not Active
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                    <p>
                      You need to enter demo mode to access guided demos and presentation features.
                      Click the "Enter Demo Mode" button above to switch to demo mode.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Guided Demo Scenarios</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Walk through predefined scenarios that showcase the application's features
                  </p>
                  <div className="mt-4">
                    <ul className="list-disc space-y-2 pl-5 text-sm text-gray-500 dark:text-gray-400">
                      <li>Step-by-step guided tours</li>
                      <li>Feature highlights and explanations</li>
                      <li>Tailored for different user roles</li>
                      <li>Preconfigured mock data</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Presentation Mode</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Optimize the interface for presentations and demonstrations
                  </p>
                  <div className="mt-4">
                    <ul className="list-disc space-y-2 pl-5 text-sm text-gray-500 dark:text-gray-400">
                      <li>Larger text and UI elements</li>
                      <li>Simplified navigation</li>
                      <li>Focused content display</li>
                      <li>Reduced distractions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}