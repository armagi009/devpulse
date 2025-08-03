'use client';

/**
 * Touch Interactions Demo Page
 * 
 * Demonstrates the touch-friendly controls and interactions
 */

import React, { useState } from 'react';
import TouchFriendlyControls from '@/components/ui/TouchFriendlyControls';
import { useTouchHandlers, isTouchDevice, provideHapticFeedback } from '@/lib/utils/touch-interactions';
import { cn } from '@/lib/utils';

export default function TouchInteractionsPage() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [selectedOption, setSelectedOption] = useState('option1');
  const [inputValue, setInputValue] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [toggleValue, setToggleValue] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [touchInfo, setTouchInfo] = useState<string | null>(null);
  
  // Demo items for swipe actions
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' },
  ]);
  
  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    provideHapticFeedback('medium');
  };
  
  const archiveItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, name: `${item.name} (Archived)` } : item
    ));
    provideHapticFeedback('light');
  };
  
  // Touch handlers for demo area
  const touchHandlers = useTouchHandlers({
    onSwipe: (event) => {
      setSwipeDirection(`Swiped ${event.direction} (${Math.round(event.distance.x)}px, ${Math.round(event.distance.y)}px)`);
      setTimeout(() => setSwipeDirection(null), 2000);
    },
    onTap: () => {
      setTouchInfo('Tapped');
      setTimeout(() => setTouchInfo(null), 2000);
    },
    onLongPress: () => {
      setTouchInfo('Long pressed');
      provideHapticFeedback('medium');
      setTimeout(() => setTouchInfo(null), 2000);
    },
    onDoubleTap: () => {
      setTouchInfo('Double tapped');
      provideHapticFeedback('light');
      setTimeout(() => setTouchInfo(null), 2000);
    },
    onPinch: (scale) => {
      setTouchInfo(`Pinch scale: ${scale.toFixed(2)}`);
      setTimeout(() => setTouchInfo(null), 2000);
    }
  });
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Touch Interactions Demo</h1>
      
      <div className="mb-6">
        <TouchFriendlyControls.Tabs
          tabs={[
            { id: 'buttons', label: 'Buttons' },
            { id: 'inputs', label: 'Inputs' },
            { id: 'gestures', label: 'Gestures' },
            { id: 'swipe', label: 'Swipe Actions' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>
      
      {activeTab === 'buttons' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Touch-Friendly Buttons</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Button Variants</h3>
              <div className="space-y-4">
                <TouchFriendlyControls.Button>
                  Primary Button
                </TouchFriendlyControls.Button>
                
                <TouchFriendlyControls.Button variant="secondary">
                  Secondary Button
                </TouchFriendlyControls.Button>
                
                <TouchFriendlyControls.Button variant="outline">
                  Outline Button
                </TouchFriendlyControls.Button>
                
                <TouchFriendlyControls.Button variant="ghost">
                  Ghost Button
                </TouchFriendlyControls.Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Button Sizes</h3>
              <div className="space-y-4">
                <TouchFriendlyControls.Button size="sm">
                  Small Button
                </TouchFriendlyControls.Button>
                
                <TouchFriendlyControls.Button size="md">
                  Medium Button
                </TouchFriendlyControls.Button>
                
                <TouchFriendlyControls.Button size="lg">
                  Large Button
                </TouchFriendlyControls.Button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Buttons with Icons</h3>
            <div className="flex flex-wrap gap-4">
              <TouchFriendlyControls.Button
                icon={<span className="text-lg">👍</span>}
              >
                With Icon
              </TouchFriendlyControls.Button>
              
              <TouchFriendlyControls.Button
                icon={<span className="text-lg">🔍</span>}
                iconPosition="right"
                variant="secondary"
              >
                Icon Right
              </TouchFriendlyControls.Button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'inputs' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Touch-Friendly Form Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <TouchFriendlyControls.Input
                label="Text Input"
                placeholder="Enter some text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              
              <TouchFriendlyControls.Input
                label="Input with Icon"
                placeholder="Search..."
                icon={<span className="text-gray-400">🔍</span>}
              />
              
              <TouchFriendlyControls.Select
                label="Select Option"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <TouchFriendlyControls.Checkbox
                label="Touch-friendly checkbox with larger target area"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
              
              <TouchFriendlyControls.Radio
                label="Radio option 1"
                name="radio-group"
                value="option1"
              />
              
              <TouchFriendlyControls.Radio
                label="Radio option 2"
                name="radio-group"
                value="option2"
              />
              
              <TouchFriendlyControls.Toggle
                label="Toggle switch"
                checked={toggleValue}
                onChange={() => setToggleValue(!toggleValue)}
              />
              
              <TouchFriendlyControls.Slider
                label="Slider Control"
                min={0}
                max={100}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                showValue
              />
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'gestures' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Touch Gestures</h2>
          
          <div 
            className={cn(
              "p-8 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 h-64 flex items-center justify-center relative",
              isTouchDevice() ? "touch-feedback" : ""
            )}
            {...touchHandlers}
          >
            <div className="text-center">
              <p className="text-lg mb-2">Touch Interaction Area</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try swiping, tapping, long pressing, or pinching
              </p>
              
              {(swipeDirection || touchInfo) && (
                <div className="mt-4 p-2 bg-primary-100 dark:bg-primary-900 rounded">
                  <p>{swipeDirection || touchInfo}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> These gestures work best on touch devices. If you're using a desktop, 
              try viewing this page on a mobile device or using touch emulation in your browser's developer tools.
            </p>
          </div>
        </div>
      )}
      
      {activeTab === 'swipe' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Swipe Actions</h2>
          
          <div className="space-y-4">
            {items.map((item) => (
              <TouchFriendlyControls.SwipeToAction
                key={item.id}
                leftAction={{
                  label: 'Archive',
                  icon: <span className="text-lg">📁</span>,
                  color: '#4CAF50',
                  onAction: () => archiveItem(item.id)
                }}
                rightAction={{
                  label: 'Delete',
                  icon: <span className="text-lg">🗑️</span>,
                  color: '#F44336',
                  onAction: () => removeItem(item.id)
                }}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Swipe left or right
                  </span>
                </div>
              </TouchFriendlyControls.SwipeToAction>
            ))}
          </div>
          
          {items.length === 0 && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              <p>All items removed. Refresh the page to reset.</p>
              <TouchFriendlyControls.Button
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Refresh
              </TouchFriendlyControls.Button>
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Tip:</strong> Swipe all the way left or right to trigger the actions.
              On touch devices, you'll feel haptic feedback when the action is triggered.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}