'use client';

/**
 * UI Test Page
 * 
 * This page showcases all the new UI components implemented for desktop optimization.
 */

import React, { useState } from 'react';
import { useKeyboardShortcuts } from '@/lib/utils/keyboard-shortcuts';
import ResponsiveGrid, { ResponsiveGridItem } from '@/components/ui/ResponsiveGrid';
import DashboardCard from '@/components/ui/DashboardCard';
import MultiColumnLayout from '@/components/layout/MultiColumnLayout';
import KeyboardShortcutsDialog from '@/components/ui/KeyboardShortcutsDialog';

export default function UITestPage() {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [testState, setTestState] = useState({
    loading: false,
    error: null as string | null,
    collapsed: false,
  });
  
  // Register keyboard shortcuts for this page
  useKeyboardShortcuts([
    {
      key: 'l',
      ctrlKey: true,
      description: 'Toggle loading state',
      action: () => setTestState(prev => ({ ...prev, loading: !prev.loading })),
      preventDefault: true
    },
    {
      key: 'e',
      ctrlKey: true,
      description: 'Toggle error state',
      action: () => setTestState(prev => ({ 
        ...prev, 
        error: prev.error ? null : 'Test error message' 
      })),
      preventDefault: true
    },
    {
      key: 'c',
      ctrlKey: true,
      description: 'Toggle collapsed state',
      action: () => setTestState(prev => ({ ...prev, collapsed: !prev.collapsed })),
      preventDefault: true
    },
    {
      key: 'k',
      ctrlKey: true,
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcutsDialog(true),
      preventDefault: true
    }
  ]);
  
  // Sidebar content
  const sidebarContent = (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sidebar Content</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        This is the sidebar content. It can be collapsed using the button on its edge.
      </p>
      <div className="space-y-2">
        <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Sidebar Button 1
        </button>
        <button className="w-full rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
          Sidebar Button 2
        </button>
      </div>
    </div>
  );
  
  // Right panel content
  const rightPanelContent = (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Right Panel Content</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        This is the right panel content. It can be collapsed using the button on its edge.
      </p>
      <div className="space-y-2">
        <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Attention needed</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>This is a notification in the right panel.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">UI Test Page</h1>
            <div className="space-x-2">
              <button
                onClick={() => setTestState(prev => ({ ...prev, loading: !prev.loading }))}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Toggle Loading
              </button>
              <button
                onClick={() => setTestState(prev => ({ ...prev, error: prev.error ? null : 'Test error message' }))}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Toggle Error
              </button>
              <button
                onClick={() => setShowShortcutsDialog(true)}
                className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Show Keyboard Shortcuts
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <DashboardCard
            title="Test Instructions"
            subtitle="How to test the UI components"
          >
            <div className="prose dark:prose-invert max-w-none">
              <p>This page showcases all the new UI components implemented for desktop optimization. Use the buttons above to toggle different states and test the components.</p>
              
              <h3>Keyboard Shortcuts</h3>
              <ul>
                <li><kbd>Ctrl</kbd> + <kbd>L</kbd>: Toggle loading state</li>
                <li><kbd>Ctrl</kbd> + <kbd>E</kbd>: Toggle error state</li>
                <li><kbd>Ctrl</kbd> + <kbd>C</kbd>: Toggle collapsed state</li>
                <li><kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>?</kbd>: Show keyboard shortcuts dialog</li>
              </ul>
              
              <h3>Components to Test</h3>
              <ul>
                <li><strong>ResponsiveGrid</strong>: The grid layout below</li>
                <li><strong>DashboardCard</strong>: The cards in the grid</li>
                <li><strong>MultiColumnLayout</strong>: The three-column layout below</li>
                <li><strong>KeyboardShortcutsDialog</strong>: The dialog that appears when you press <kbd>?</kbd></li>
              </ul>
              
              <h3>Testing Responsive Behavior</h3>
              <p>Resize your browser window to see how the components adapt to different screen sizes.</p>
            </div>
          </DashboardCard>
          
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">ResponsiveGrid Component</h2>
            
            <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
              <DashboardCard
                title="Basic Card"
                subtitle="A simple card with title and subtitle"
                loading={testState.loading}
                error={testState.error}
              >
                <p className="text-gray-600 dark:text-gray-300">This is a basic card with title and subtitle.</p>
              </DashboardCard>
              
              <DashboardCard
                title="Card with Icon"
                subtitle="A card with an icon"
                icon={
                  <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                loading={testState.loading}
                error={testState.error}
              >
                <p className="text-gray-600 dark:text-gray-300">This card has an icon in its header.</p>
              </DashboardCard>
              
              <DashboardCard
                title="Card with Actions"
                subtitle="A card with action buttons"
                actions={
                  <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                }
                loading={testState.loading}
                error={testState.error}
              >
                <p className="text-gray-600 dark:text-gray-300">This card has action buttons in its header.</p>
              </DashboardCard>
              
              <DashboardCard
                title="Card with Footer"
                subtitle="A card with a footer"
                footer={
                  <div className="flex justify-end">
                    <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Action
                    </button>
                  </div>
                }
                loading={testState.loading}
                error={testState.error}
              >
                <p className="text-gray-600 dark:text-gray-300">This card has a footer with an action button.</p>
              </DashboardCard>
              
              <ResponsiveGridItem colSpan={{ xs: 1, md: 2 }}>
                <DashboardCard
                  title="Wide Card"
                  subtitle="A card that spans multiple columns"
                  loading={testState.loading}
                  error={testState.error}
                >
                  <p className="text-gray-600 dark:text-gray-300">This card spans multiple columns on larger screens.</p>
                </DashboardCard>
              </ResponsiveGridItem>
              
              <DashboardCard
                title="Collapsible Card"
                subtitle="A card that can be collapsed"
                collapsible={true}
                defaultCollapsed={testState.collapsed}
                loading={testState.loading}
                error={testState.error}
              >
                <p className="text-gray-600 dark:text-gray-300">This card can be collapsed by clicking on its header.</p>
              </DashboardCard>
              
              <DashboardCard
                title="No Padding Card"
                subtitle="A card without padding"
                noPadding={true}
                loading={testState.loading}
                error={testState.error}
              >
                <div className="bg-gray-100 p-4 dark:bg-gray-700">
                  <p className="text-gray-600 dark:text-gray-300">This card has no padding in its body.</p>
                </div>
              </DashboardCard>
            </ResponsiveGrid>
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">MultiColumnLayout Component</h2>
            
            <div className="border border-gray-200 rounded-lg dark:border-gray-700 h-[500px]">
              <MultiColumnLayout
                sidebar={sidebarContent}
                rightPanel={rightPanelContent}
                sidebarWidth="280px"
                rightPanelWidth="300px"
                collapsible={true}
              >
                <div className="p-4 space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Main Content</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    This is the main content area of the MultiColumnLayout component. It is flanked by a sidebar on the left and a right panel.
                    Both the sidebar and right panel can be collapsed using the buttons on their edges.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    On mobile screens, the layout will stack vertically with the sidebar on top, followed by the main content, and then the right panel.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Section 1</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Content for section 1.</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Section 2</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Content for section 2.</p>
                    </div>
                  </div>
                </div>
              </MultiColumnLayout>
            </div>
          </div>
        </div>
      </main>
      
      <KeyboardShortcutsDialog
        isOpen={showShortcutsDialog}
        onClose={() => setShowShortcutsDialog(false)}
      />
    </div>
  );
}