'use client';

import React, { useState } from 'react';
import { 
  TourProvider, 
  TourList, 
  TourButton, 
  TourSettings,
  Tour
} from '../../../components/help/TourSystem';

// Define some example tours
const exampleTours: Tour[] = [
  {
    id: 'dashboard-intro',
    name: 'Dashboard Introduction',
    description: 'Learn how to navigate and use the main dashboard features',
    category: 'onboarding',
    priority: 10,
    steps: [
      {
        target: '#dashboard-overview',
        title: 'Dashboard Overview',
        content: 'This is your main dashboard where you can see all your key metrics at a glance.',
        placement: 'bottom'
      },
      {
        target: '#metrics-section',
        title: 'Key Metrics',
        content: 'Here you can see your team\'s performance metrics and trends.',
        placement: 'right'
      },
      {
        target: '#filters-section',
        title: 'Data Filters',
        content: 'Use these filters to narrow down the data by date range, team members, or repositories.',
        placement: 'top'
      },
      {
        target: '#actions-section',
        title: 'Quick Actions',
        content: 'Access common actions like generating reports or scheduling meetings from here.',
        placement: 'left'
      }
    ]
  },
  {
    id: 'productivity-features',
    name: 'Productivity Features',
    description: 'Discover tools to boost your team\'s productivity',
    category: 'features',
    priority: 5,
    steps: [
      {
        target: '#productivity-chart',
        title: 'Productivity Chart',
        content: 'This chart shows your team\'s productivity trends over time.',
        placement: 'bottom'
      },
      {
        target: '#code-metrics',
        title: 'Code Metrics',
        content: 'View detailed metrics about code quality, test coverage, and more.',
        placement: 'right'
      },
      {
        target: '#team-comparison',
        title: 'Team Comparison',
        content: 'Compare your team\'s performance with other teams or industry benchmarks.',
        placement: 'top'
      }
    ]
  },
  {
    id: 'burnout-detection',
    name: 'Burnout Detection',
    description: 'Learn how to use the burnout detection features',
    category: 'features',
    priority: 8,
    steps: [
      {
        target: '#burnout-indicators',
        title: 'Burnout Indicators',
        content: 'These indicators help identify potential burnout risks in your team.',
        placement: 'bottom'
      },
      {
        target: '#work-patterns',
        title: 'Work Patterns',
        content: 'Analyze work patterns to identify unhealthy habits like late-night commits.',
        placement: 'right'
      },
      {
        target: '#recommendations',
        title: 'Recommendations',
        content: 'Get personalized recommendations to improve work-life balance.',
        placement: 'top'
      }
    ]
  },
  {
    id: 'onboarding-tour',
    name: 'New User Onboarding',
    description: 'Welcome tour for new users',
    category: 'onboarding',
    priority: 15,
    steps: [
      {
        target: '#welcome-section',
        title: 'Welcome to DevPulse',
        content: 'DevPulse helps you monitor and improve your development team\'s performance.',
        placement: 'bottom'
      },
      {
        target: '#profile-setup',
        title: 'Complete Your Profile',
        content: 'Set up your profile to personalize your experience.',
        placement: 'right'
      },
      {
        target: '#team-setup',
        title: 'Connect Your Team',
        content: 'Connect your team members to start tracking team metrics.',
        placement: 'top'
      },
      {
        target: '#repo-setup',
        title: 'Connect Repositories',
        content: 'Connect your code repositories to analyze code metrics.',
        placement: 'left'
      },
      {
        target: '#next-steps',
        title: 'Next Steps',
        content: 'Explore the dashboard and discover more features through guided tours.',
        placement: 'bottom'
      }
    ]
  }
];

export default function GuidedToursDemo() {
  const [activeTab, setActiveTab] = useState<'all' | 'onboarding' | 'features'>('all');
  
  return (
    <TourProvider initialTours={exampleTours}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Guided Tours Demo</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Dashboard Example</h2>
          <div className="border rounded-lg p-6 bg-white shadow">
            <div id="dashboard-overview" className="mb-6">
              <h3 className="text-lg font-medium mb-2">Dashboard Overview</h3>
              <p className="text-gray-600">
                Welcome to your development team dashboard. Here you can monitor your team's performance,
                track productivity metrics, and identify potential issues.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div id="metrics-section" className="border rounded p-4">
                <h4 className="font-medium mb-2">Key Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pull Requests</span>
                    <span className="font-medium">24 (+12%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Code Reviews</span>
                    <span className="font-medium">36 (+8%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cycle Time</span>
                    <span className="font-medium">2.4 days (-5%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Build Success</span>
                    <span className="font-medium">98.2% (+1.5%)</span>
                  </div>
                </div>
              </div>
              
              <div id="filters-section" className="border rounded p-4">
                <h4 className="font-medium mb-2">Data Filters</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm">Date Range</label>
                    <select className="w-full border rounded p-1">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last quarter</option>
                      <option>Custom range</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm">Team Members</label>
                    <select className="w-full border rounded p-1">
                      <option>All team members</option>
                      <option>Developers only</option>
                      <option>Team leads only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm">Repositories</label>
                    <select className="w-full border rounded p-1">
                      <option>All repositories</option>
                      <option>Active repositories</option>
                      <option>Selected repositories</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div id="productivity-chart" className="border rounded p-4">
                <h4 className="font-medium mb-2">Productivity Trend</h4>
                <div className="bg-gray-100 h-40 flex items-center justify-center">
                  [Productivity Chart]
                </div>
              </div>
              
              <div id="code-metrics" className="border rounded p-4">
                <h4 className="font-medium mb-2">Code Metrics</h4>
                <div className="bg-gray-100 h-40 flex items-center justify-center">
                  [Code Metrics Chart]
                </div>
              </div>
              
              <div id="burnout-indicators" className="border rounded p-4">
                <h4 className="font-medium mb-2">Burnout Indicators</h4>
                <div className="bg-gray-100 h-40 flex items-center justify-center">
                  [Burnout Chart]
                </div>
              </div>
            </div>
            
            <div id="actions-section" className="mt-6 flex justify-end space-x-3">
              <button className="px-3 py-1 border rounded">Export Report</button>
              <button className="px-3 py-1 border rounded">Schedule Meeting</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">
                View Details
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tour Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <TourButton tourId="dashboard-intro">
              Dashboard Tour
            </TourButton>
            
            <TourButton 
              tourId="productivity-features" 
              variant="secondary"
            >
              Productivity Features
            </TourButton>
            
            <TourButton 
              tourId="burnout-detection" 
              variant="text"
            >
              Learn about burnout detection
            </TourButton>
            
            <TourButton 
              tourId="onboarding-tour"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Start Onboarding
            </TourButton>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Tours</h2>
          
          <div className="border-b mb-4">
            <nav className="flex space-x-4">
              <button
                className={`py-2 px-1 border-b-2 ${
                  activeTab === 'all' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('all')}
              >
                All Tours
              </button>
              <button
                className={`py-2 px-1 border-b-2 ${
                  activeTab === 'onboarding' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('onboarding')}
              >
                Onboarding
              </button>
              <button
                className={`py-2 px-1 border-b-2 ${
                  activeTab === 'features' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('features')}
              >
                Features
              </button>
            </nav>
          </div>
          
          {activeTab === 'all' && <TourList filter="all" />}
          {activeTab === 'onboarding' && <TourList filter="all" category="onboarding" />}
          {activeTab === 'features' && <TourList filter="all" category="features" />}
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tour Settings</h2>
          <TourSettings />
        </div>
        
        <div id="welcome-section" className="hidden"></div>
        <div id="profile-setup" className="hidden"></div>
        <div id="team-setup" className="hidden"></div>
        <div id="repo-setup" className="hidden"></div>
        <div id="next-steps" className="hidden"></div>
        <div id="team-comparison" className="hidden"></div>
        <div id="work-patterns" className="hidden"></div>
        <div id="recommendations" className="hidden"></div>
      </div>
    </TourProvider>
  );
}