'use client';

/**
 * Tablet UI Demo Page
 * 
 * This page demonstrates the tablet-optimized UI components
 */

import React, { useState } from 'react';
import DashboardCard from '@/components/ui/DashboardCard';
import TouchFriendlyControls from '@/components/ui/TouchFriendlyControls';
import { SwipeableCard } from '@/components/ui/TouchFriendlyControls';
import FilterBar from '@/components/ui/FilterBar';
import TimeRangeSelector from '@/components/ui/TimeRangeSelector';
import { isTouchDevice, isTabletViewport } from '@/lib/utils/touch-interactions';

export default function TabletUIDemoPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [swipeMessage, setSwipeMessage] = useState('');
  
  // Demo filter options
  const filterOptions = [
    {
      id: 'repository',
      label: 'Repository',
      options: [
        { value: 'repo1', label: 'Repository 1' },
        { value: 'repo2', label: 'Repository 2' },
        { value: 'repo3', label: 'Repository 3' },
      ],
    },
    {
      id: 'developer',
      label: 'Developer',
      options: [
        { value: 'dev1', label: 'Developer 1' },
        { value: 'dev2', label: 'Developer 2' },
        { value: 'dev3', label: 'Developer 3' },
      ],
    },
  ];
  
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name' },
  ];
  
  // Demo tabs
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' },
    { id: 'settings', label: 'Settings' },
  ];
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tablet UI Optimizations</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Device Detection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard title="Device Information">
            <div className="space-y-2">
              <p><strong>Is Touch Device:</strong> {isTouchDevice() ? 'Yes' : 'No'}</p>
              <p><strong>Is Tablet Viewport:</strong> {isTabletViewport() ? 'Yes' : 'No'}</p>
              <p><strong>Window Width:</strong> <span id="window-width">{typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</span>px</p>
              <p><strong>Window Height:</strong> <span id="window-height">{typeof window !== 'undefined' ? window.innerHeight : 'N/A'}</span>px</p>
            </div>
          </DashboardCard>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Touch-Friendly Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard title="Buttons">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Standard Buttons</h3>
                <div className="flex flex-wrap gap-2">
                  <TouchFriendlyControls.Button variant="primary">Primary</TouchFriendlyControls.Button>
                  <TouchFriendlyControls.Button variant="secondary">Secondary</TouchFriendlyControls.Button>
                  <TouchFriendlyControls.Button variant="outline">Outline</TouchFriendlyControls.Button>
                  <TouchFriendlyControls.Button variant="ghost">Ghost</TouchFriendlyControls.Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Button Sizes</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <TouchFriendlyControls.Button variant="primary" size="sm">Small</TouchFriendlyControls.Button>
                  <TouchFriendlyControls.Button variant="primary" size="md">Medium</TouchFriendlyControls.Button>
                  <TouchFriendlyControls.Button variant="primary" size="lg">Large</TouchFriendlyControls.Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">With Icons</h3>
                <div className="flex flex-wrap gap-2">
                  <TouchFriendlyControls.Button 
                    variant="primary" 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </svg>
                    }
                    iconPosition="right"
                  >
                    Next
                  </TouchFriendlyControls.Button>
                  
                  <TouchFriendlyControls.Button 
                    variant="secondary" 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5"></path>
                        <path d="M12 19l-7-7 7-7"></path>
                      </svg>
                    }
                  >
                    Back
                  </TouchFriendlyControls.Button>
                </div>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard title="Form Controls">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Select Dropdown</h3>
                <TouchFriendlyControls.Select
                  label="Select Option"
                  options={[
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                    { value: 'option3', label: 'Option 3' },
                  ]}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Tabs</h3>
                <TouchFriendlyControls.Tabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {activeTab === 'overview' && <p>Overview content - swipe left/right to change tabs</p>}
                  {activeTab === 'details' && <p>Details content - swipe left/right to change tabs</p>}
                  {activeTab === 'settings' && <p>Settings content - swipe left/right to change tabs</p>}
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Swipe Gestures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SwipeableCard
            onSwipeLeft={() => setSwipeMessage('Swiped Left!')}
            onSwipeRight={() => setSwipeMessage('Swiped Right!')}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Swipeable Card</h3>
              <p className="mb-4">Swipe left or right on this card</p>
              {swipeMessage && (
                <div className="mt-4 p-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
                  {swipeMessage}
                </div>
              )}
            </div>
          </SwipeableCard>
          
          <DashboardCard 
            title="Collapsible Card" 
            subtitle="Swipe up/down to expand/collapse"
            collapsible={true}
            defaultCollapsed={false}
          >
            <p>This card can be collapsed by swiping down or expanded by swiping up when collapsed.</p>
            <p className="mt-2">You can also tap the header to toggle.</p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p>Additional content that can be hidden when collapsed.</p>
            </div>
          </DashboardCard>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Optimized Components</h2>
        <div className="space-y-6">
          <DashboardCard title="Filter Bar">
            <FilterBar
              pageId="tablet-demo"
              onFilterChange={() => {}}
              filterOptions={filterOptions}
              sortOptions={sortOptions}
            />
          </DashboardCard>
          
          <DashboardCard title="Time Range Selector">
            <TimeRangeSelector
              onChange={() => {}}
              pageId="tablet-demo"
            />
          </DashboardCard>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Touch Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard title="Touch Feedback Examples">
            <div className="space-y-4">
              <button className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 rounded-md touch-feedback">
                Button with Touch Feedback
              </button>
              
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md touch-feedback">
                <p>Div with Touch Feedback</p>
              </div>
              
              <div className="flex justify-between">
                <button className="py-3 px-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md touch-feedback">
                  Button 1
                </button>
                <button className="py-3 px-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md touch-feedback">
                  Button 2
                </button>
                <button className="py-3 px-4 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md touch-feedback">
                  Button 3
                </button>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}