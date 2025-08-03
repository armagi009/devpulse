'use client';

import React, { useState } from 'react';
import { 
  HelpProvider, 
  HelpButton, 
  HelpPanel, 
  FeatureTour,
  HelpTopic,
  TourStep
} from '../../../components/help';

const helpTopics: HelpTopic[] = [
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    content: (
      <div>
        <p>The dashboard provides an overview of your key metrics and performance indicators.</p>
        <p>Use the filters at the top to adjust the time range and focus on specific data.</p>
        <ul className="list-disc pl-5 mt-2">
          <li>View your productivity trends</li>
          <li>Monitor team collaboration</li>
          <li>Track burnout indicators</li>
        </ul>
      </div>
    ),
    relatedTopics: ['productivity-metrics', 'burnout-indicators']
  },
  {
    id: 'productivity-metrics',
    title: 'Productivity Metrics',
    content: 'Productivity metrics measure your coding activity, pull request velocity, and code quality over time. These metrics help you understand your performance trends and identify areas for improvement.',
    relatedTopics: ['dashboard-overview', 'code-quality']
  },
  {
    id: 'burnout-indicators',
    title: 'Burnout Indicators',
    content: 'Burnout indicators analyze your work patterns to identify potential signs of burnout. These include working hours, commit frequency during off-hours, and changes in productivity patterns.',
    relatedTopics: ['dashboard-overview', 'work-life-balance']
  },
  {
    id: 'code-quality',
    title: 'Code Quality',
    content: 'Code quality metrics measure the health of your codebase through metrics like test coverage, code complexity, and technical debt indicators.',
    relatedTopics: ['productivity-metrics']
  },
  {
    id: 'work-life-balance',
    title: 'Work-Life Balance',
    content: 'Work-life balance metrics help you maintain a healthy balance between work and personal time by tracking after-hours work, weekend activity, and vacation time.',
    relatedTopics: ['burnout-indicators']
  }
];

const tourSteps: TourStep[] = [
  {
    target: '#dashboard-card',
    title: 'Dashboard Overview',
    content: 'This is your main dashboard where you can see all your key metrics at a glance.',
    placement: 'bottom'
  },
  {
    target: '#productivity-section',
    title: 'Productivity Metrics',
    content: 'Here you can track your productivity trends over time and compare with team averages.',
    placement: 'right'
  },
  {
    target: '#burnout-section',
    title: 'Burnout Indicators',
    content: 'Monitor your burnout risk factors and get recommendations to maintain work-life balance.',
    placement: 'left'
  },
  {
    target: '#help-button',
    title: 'Help Button',
    content: 'Click this button anytime you need help with a specific feature or concept.',
    placement: 'top'
  }
];

export default function ContextualHelpDemo() {
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  return (
    <HelpProvider initialTopics={helpTopics}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Contextual Help System Demo</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Help Buttons</h2>
          <div className="flex space-x-4 mb-4">
            <HelpButton topicId="dashboard-overview" />
            <HelpButton topicId="productivity-metrics" variant="text" />
            <HelpButton topicId="burnout-indicators" variant="iconText" />
            <HelpButton 
              topicId="custom" 
              customTopic={{
                id: 'custom',
                title: 'Custom Help Topic',
                content: 'This is a custom help topic created inline without registering it globally.'
              }}
              size="lg"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div id="dashboard-card" className="border rounded-lg p-4 bg-white shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Dashboard Overview</h3>
              <HelpButton topicId="dashboard-overview" size="sm" />
            </div>
            <p className="text-gray-600">
              View your key metrics and performance indicators at a glance.
            </p>
          </div>
          
          <div id="productivity-section" className="border rounded-lg p-4 bg-white shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Productivity Metrics</h3>
              <HelpButton topicId="productivity-metrics" size="sm" />
            </div>
            <p className="text-gray-600">
              Track your coding activity and pull request velocity over time.
            </p>
          </div>
          
          <div id="burnout-section" className="border rounded-lg p-4 bg-white shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Burnout Indicators</h3>
              <HelpButton topicId="burnout-indicators" size="sm" />
            </div>
            <p className="text-gray-600">
              Monitor your work patterns to prevent burnout and maintain balance.
            </p>
          </div>
          
          <div className="border rounded-lg p-4 bg-white shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Code Quality</h3>
              <HelpButton topicId="code-quality" size="sm" />
            </div>
            <p className="text-gray-600">
              Measure the health of your codebase through various quality metrics.
            </p>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Feature Tour</h2>
          <p className="mb-4">
            Take a guided tour of the interface to learn about key features.
          </p>
          <button
            id="help-button"
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setIsTourOpen(true)}
          >
            Start Tour
          </button>
        </div>
        
        <FeatureTour
          steps={tourSteps}
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          onComplete={() => setIsTourOpen(false)}
        />
        
        <HelpPanel position="right" width="medium" />
      </div>
    </HelpProvider>
  );
}