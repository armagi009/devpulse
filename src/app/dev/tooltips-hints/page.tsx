'use client';

import React, { useState } from 'react';
import { Tooltip, Hint, ProgressiveDisclosure } from '../../../components/ui/tooltip';
import { 
  HintProvider, 
  FeatureHint, 
  HintSettings 
} from '../../../components/help/hint-system';

const initialHints = [
  {
    id: 'dashboard-metrics',
    content: 'These metrics show your team performance over time. Click on any chart to see more details.',
    position: 'bottom',
    category: 'dashboard'
  },
  {
    id: 'filter-controls',
    content: 'Use these filters to narrow down the data by date range, team members, or repositories.',
    position: 'top',
    category: 'filters'
  },
  {
    id: 'new-feature-burnout',
    content: 'New! Burnout detection helps you identify team members who might be overworked.',
    position: 'right',
    category: 'new-features',
    priority: 10
  },
  {
    id: 'chart-interactions',
    content: 'You can hover over chart elements to see detailed values, or click to drill down.',
    position: 'left',
    category: 'charts'
  }
];

export default function TooltipsAndHintsDemo() {
  const [count, setCount] = useState(0);
  
  return (
    <HintProvider initialHints={initialHints}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Tooltips and Hints Demo</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Basic Tooltips</h2>
          <div className="flex space-x-4 mb-4">
            <Tooltip content="This is a simple tooltip">
              <button className="px-3 py-1 bg-gray-200 rounded">Hover me</button>
            </Tooltip>
            
            <Tooltip 
              content={
                <div>
                  <p className="font-medium">Rich Content Tooltip</p>
                  <p>You can include formatting, links, and more.</p>
                  <ul className="list-disc pl-4 mt-1">
                    <li>Item one</li>
                    <li>Item two</li>
                  </ul>
                </div>
              }
              position="right"
              maxWidth="300px"
            >
              <button className="px-3 py-1 bg-gray-200 rounded">Rich tooltip</button>
            </Tooltip>
            
            <Tooltip 
              content="This tooltip appears below the element"
              position="bottom"
            >
              <button className="px-3 py-1 bg-gray-200 rounded">Bottom tooltip</button>
            </Tooltip>
            
            <Tooltip 
              content="This tooltip appears on the left"
              position="left"
            >
              <button className="px-3 py-1 bg-gray-200 rounded">Left tooltip</button>
            </Tooltip>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Hints with Icons</h2>
          <div className="space-y-4">
            <div>
              <Hint 
                hint="This field is required for accurate metrics calculation" 
                icon={true}
              >
                <label className="block">
                  Team Size
                  <input 
                    type="number" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter team size" 
                  />
                </label>
              </Hint>
            </div>
            
            <div>
              <Hint 
                hint="Select repositories to include in the analysis" 
                icon={true}
              >
                <label className="block">
                  Repositories
                  <select 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option>All repositories</option>
                    <option>Selected repositories</option>
                    <option>Active repositories</option>
                  </select>
                </label>
              </Hint>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Feature Hints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Dashboard Metrics</h3>
              </div>
              <FeatureHint hintId="dashboard-metrics">
                <div className="bg-gray-100 p-4 rounded-md h-40 flex items-center justify-center">
                  [Dashboard Metrics Visualization]
                </div>
              </FeatureHint>
            </div>
            
            <div className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Filter Controls</h3>
              </div>
              <FeatureHint hintId="filter-controls">
                <div className="flex space-x-2 mb-4">
                  <select className="px-2 py-1 border rounded">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Custom range</option>
                  </select>
                  <select className="px-2 py-1 border rounded">
                    <option>All team members</option>
                    <option>Developers only</option>
                    <option>Team leads only</option>
                  </select>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded">Apply</button>
                </div>
              </FeatureHint>
            </div>
            
            <div className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Burnout Detection</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">New</span>
              </div>
              <FeatureHint hintId="new-feature-burnout">
                <div className="bg-gray-100 p-4 rounded-md h-40 flex items-center justify-center">
                  [Burnout Detection Feature]
                </div>
              </FeatureHint>
            </div>
            
            <div className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Interactive Charts</h3>
              </div>
              <FeatureHint hintId="chart-interactions">
                <div className="bg-gray-100 p-4 rounded-md h-40 flex items-center justify-center">
                  [Interactive Chart Example]
                </div>
              </FeatureHint>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Progressive Disclosure</h2>
          <div className="space-y-4">
            <ProgressiveDisclosure 
              summary="What are burnout indicators?"
              initialOpen={false}
            >
              <p>
                Burnout indicators analyze work patterns to identify potential signs of burnout.
                These include metrics like:
              </p>
              <ul className="list-disc pl-5 mt-2">
                <li>Working hours outside normal business hours</li>
                <li>Consecutive days of activity without breaks</li>
                <li>Sudden changes in productivity patterns</li>
                <li>Decreased code quality or increased error rates</li>
              </ul>
            </ProgressiveDisclosure>
            
            <ProgressiveDisclosure 
              summary="How is productivity calculated?"
              initialOpen={false}
            >
              <p>
                Productivity is calculated using a combination of metrics:
              </p>
              <ul className="list-disc pl-5 mt-2">
                <li>Code commit frequency and size</li>
                <li>Pull request throughput and review time</li>
                <li>Issue resolution rate</li>
                <li>Documentation contributions</li>
              </ul>
              <p className="mt-2">
                These metrics are weighted based on your team's configuration and normalized
                across different project types.
              </p>
            </ProgressiveDisclosure>
            
            <ProgressiveDisclosure 
              summary="Advanced chart configuration options"
              initialOpen={false}
            >
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium">
                    Chart Type
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                      <option>Line chart</option>
                      <option>Bar chart</option>
                      <option>Area chart</option>
                      <option>Scatter plot</option>
                    </select>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium">
                    Data Aggregation
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Quarterly</option>
                    </select>
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input type="checkbox" id="show-trend" className="mr-2" />
                  <label htmlFor="show-trend">Show trend line</label>
                </div>
                
                <div className="flex items-center">
                  <input type="checkbox" id="show-anomalies" className="mr-2" />
                  <label htmlFor="show-anomalies">Highlight anomalies</label>
                </div>
              </div>
            </ProgressiveDisclosure>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Interactive Example</h2>
          <div className="border rounded-lg p-4 bg-white shadow">
            <p className="mb-4">
              Click the button below to increment the counter. A hint will appear after 5 clicks.
            </p>
            
            <FeatureHint
              hintId="counter-hint"
              content="You've clicked 5 times! Try clicking 5 more times for another surprise."
              forceShow={count === 5}
            >
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setCount(count + 1)}
              >
                Count: {count}
              </button>
            </FeatureHint>
            
            {count >= 10 && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
                Congratulations! You've discovered a hidden feature!
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Hint Settings</h2>
          <HintSettings />
        </div>
      </div>
    </HintProvider>
  );
}