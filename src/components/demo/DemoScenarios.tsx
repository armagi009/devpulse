/**
 * Demo Scenarios Component
 * 
 * This component provides a set of guided demo scenarios for presenting
 * the application's features in a structured way.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useMode } from '@/lib/context/ModeContext';
import { AppMode } from '@/lib/types/roles';
import { useRouter } from 'next/navigation';
import MockDataBadge from '../ui/mock-data-badge';

// Demo scenario interface
interface DemoScenario {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  targetAudience: string[];
  steps: DemoStep[];
  mockDataSet?: string;
}

// Demo step interface
interface DemoStep {
  id: string;
  title: string;
  description: string;
  path: string;
  duration: number; // in seconds
  highlights?: {
    selector: string;
    description: string;
  }[];
}

// Predefined demo scenarios
const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'developer-productivity',
    name: 'Developer Productivity Overview',
    description: 'A guided tour of the developer productivity features, showing how developers can track their work patterns and improve productivity.',
    duration: 5,
    targetAudience: ['Developers', 'Team Leads'],
    mockDataSet: 'high-velocity',
    steps: [
      {
        id: 'dashboard',
        title: 'Developer Dashboard',
        description: 'Overview of the developer dashboard showing key metrics and insights.',
        path: '/dashboard/developer',
        duration: 60,
        highlights: [
          {
            selector: '.productivity-chart',
            description: 'Shows your productivity trends over time',
          },
          {
            selector: '.recent-activity',
            description: 'Displays your most recent development activities',
          },
        ],
      },
      {
        id: 'productivity',
        title: 'Productivity Analytics',
        description: 'Detailed productivity metrics and insights to help improve your workflow.',
        path: '/dashboard/productivity',
        duration: 90,
        highlights: [
          {
            selector: '.work-patterns',
            description: 'Visualizes your work patterns throughout the day',
          },
          {
            selector: '.focus-time',
            description: 'Shows periods of deep focus vs. fragmented work',
          },
        ],
      },
      {
        id: 'team-collaboration',
        title: 'Team Collaboration',
        description: 'See how your work integrates with your team and identify collaboration opportunities.',
        path: '/dashboard/team',
        duration: 60,
        highlights: [
          {
            selector: '.knowledge-sharing',
            description: 'Identifies areas where knowledge sharing can be improved',
          },
          {
            selector: '.code-review-metrics',
            description: 'Shows code review participation and effectiveness',
          },
        ],
      },
    ],
  },
  {
    id: 'team-lead-overview',
    name: 'Team Lead Dashboard Tour',
    description: 'A comprehensive overview of the team lead features, focusing on team health, burnout prevention, and productivity.',
    duration: 8,
    targetAudience: ['Team Leads', 'Managers'],
    mockDataSet: 'burnout-risk',
    steps: [
      {
        id: 'team-dashboard',
        title: 'Team Overview Dashboard',
        description: 'High-level view of team performance and health metrics.',
        path: '/dashboard/team-lead',
        duration: 60,
        highlights: [
          {
            selector: '.team-velocity',
            description: 'Shows team velocity trends over time',
          },
          {
            selector: '.team-health',
            description: 'Provides an overview of team health indicators',
          },
        ],
      },
      {
        id: 'burnout-radar',
        title: 'Burnout Radar',
        description: 'Early warning system for potential burnout issues in your team.',
        path: '/dashboard/burnout',
        duration: 120,
        highlights: [
          {
            selector: '.burnout-indicators',
            description: 'Highlights potential burnout risk factors',
          },
          {
            selector: '.work-life-balance',
            description: 'Shows work-life balance metrics for team members',
          },
        ],
      },
      {
        id: 'retrospective',
        title: 'Team Retrospectives',
        description: 'Tools for conducting effective team retrospectives and tracking action items.',
        path: '/dashboard/retrospective',
        duration: 90,
        highlights: [
          {
            selector: '.retrospective-insights',
            description: 'AI-generated insights based on team performance',
          },
          {
            selector: '.action-items',
            description: 'Track and manage action items from retrospectives',
          },
        ],
      },
      {
        id: 'team-members',
        title: 'Team Member Management',
        description: 'Manage team members and their roles within the system.',
        path: '/dashboard/team/members',
        duration: 60,
        highlights: [
          {
            selector: '.member-roles',
            description: 'Configure roles and permissions for team members',
          },
          {
            selector: '.invite-members',
            description: 'Invite new members to join your team',
          },
        ],
      },
    ],
  },
  {
    id: 'admin-features',
    name: 'Administrator Features',
    description: 'A tour of the administrative features for system configuration and user management.',
    duration: 6,
    targetAudience: ['Administrators', 'IT Staff'],
    mockDataSet: 'default',
    steps: [
      {
        id: 'admin-dashboard',
        title: 'Admin Dashboard',
        description: 'Overview of system health and administrative functions.',
        path: '/dashboard/admin',
        duration: 60,
        highlights: [
          {
            selector: '.system-health',
            description: 'Monitors system health and performance',
          },
          {
            selector: '.user-statistics',
            description: 'Shows user activity and engagement metrics',
          },
        ],
      },
      {
        id: 'app-settings',
        title: 'Application Settings',
        description: 'Configure global application settings and features.',
        path: '/admin/settings',
        duration: 90,
        highlights: [
          {
            selector: '.mode-settings',
            description: 'Configure application mode (live, mock, demo)',
          },
          {
            selector: '.feature-toggles',
            description: 'Enable or disable specific application features',
          },
        ],
      },
      {
        id: 'user-management',
        title: 'User Management',
        description: 'Manage users, roles, and permissions.',
        path: '/dashboard/admin/users',
        duration: 90,
        highlights: [
          {
            selector: '.user-roles',
            description: 'Assign roles to users',
          },
          {
            selector: '.permission-management',
            description: 'Configure granular permissions for users and roles',
          },
        ],
      },
    ],
  },
];

interface DemoScenariosProps {
  onScenarioSelect?: (scenario: DemoScenario) => void;
}

export default function DemoScenarios({ onScenarioSelect }: DemoScenariosProps) {
  const { mode, switchMode } = useMode();
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we're in demo mode
  const isInDemoMode = mode === AppMode.DEMO;
  
  // Handle scenario selection
  const handleScenarioSelect = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    if (onScenarioSelect) {
      onScenarioSelect(scenario);
    }
  };
  
  // Start the selected demo scenario
  const startDemoScenario = async () => {
    if (!selectedScenario) return;
    
    try {
      setIsStarting(true);
      setError(null);
      
      // If not in demo mode, switch to demo mode
      if (!isInDemoMode) {
        const success = await switchMode(AppMode.DEMO, {
          mockDataSetId: selectedScenario.mockDataSet || 'default',
        });
        
        if (!success) {
          throw new Error('Failed to switch to demo mode');
        }
      }
      
      // Navigate to the first step
      if (selectedScenario.steps.length > 0) {
        router.push(selectedScenario.steps[0].path);
        setCurrentStep(0);
      }
    } catch (err) {
      console.error('Error starting demo scenario:', err);
      setError(`Failed to start demo: ${(err as Error).message}`);
    } finally {
      setIsStarting(false);
    }
  };
  
  // Navigate to the next step in the scenario
  const goToNextStep = () => {
    if (!selectedScenario) return;
    
    const nextStep = currentStep + 1;
    if (nextStep < selectedScenario.steps.length) {
      router.push(selectedScenario.steps[nextStep].path);
      setCurrentStep(nextStep);
    }
  };
  
  // Navigate to the previous step in the scenario
  const goToPreviousStep = () => {
    if (!selectedScenario || currentStep <= 0) return;
    
    const prevStep = currentStep - 1;
    router.push(selectedScenario.steps[prevStep].path);
    setCurrentStep(prevStep);
  };
  
  // End the demo and return to live mode
  const endDemo = async () => {
    try {
      setIsStarting(true);
      setError(null);
      
      // Switch back to live mode
      const success = await switchMode(AppMode.LIVE);
      
      if (!success) {
        throw new Error('Failed to exit demo mode');
      }
      
      // Reset state
      setSelectedScenario(null);
      setCurrentStep(0);
      
      // Navigate to home
      router.push('/');
    } catch (err) {
      console.error('Error ending demo:', err);
      setError(`Failed to end demo: ${(err as Error).message}`);
    } finally {
      setIsStarting(false);
    }
  };
  
  return (
    <MockDataBadge badgeText="DEMO">
      <div className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
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
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {!selectedScenario ? (
          // Scenario selection view
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              Select a Demo Scenario
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose a guided demo scenario to showcase the application's features
            </p>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {DEMO_SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  onClick={() => handleScenarioSelect(scenario)}
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {scenario.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {scenario.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-gray-400 dark:text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                          {scenario.duration} min
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {scenario.targetAudience.map((audience) => (
                          <span
                            key={audience}
                            className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {audience}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Scenario details view
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                {selectedScenario.name}
              </h2>
              <button
                onClick={() => setSelectedScenario(null)}
                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Back to Scenarios
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedScenario.description}
            </p>
            
            <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Demo Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <ul className="list-disc space-y-1 pl-5">
                      <li>Duration: {selectedScenario.duration} minutes</li>
                      <li>Target Audience: {selectedScenario.targetAudience.join(', ')}</li>
                      <li>Steps: {selectedScenario.steps.length}</li>
                      {selectedScenario.mockDataSet && (
                        <li>Mock Data Set: {selectedScenario.mockDataSet}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Demo Steps
              </h3>
              <div className="space-y-2">
                {selectedScenario.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-start rounded-md border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        {step.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {step.description}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <svg
                          className="mr-1 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {step.duration} seconds
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setSelectedScenario(null)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={startDemoScenario}
                disabled={isStarting}
                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400 dark:disabled:bg-blue-800"
              >
                {isStarting ? 'Starting...' : 'Start Demo'}
              </button>
            </div>
          </div>
        )}
        
        {/* Demo Controls - Only show when in demo mode and a scenario is selected */}
        {isInDemoMode && selectedScenario && (
          <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousStep}
                disabled={currentStep <= 0}
                className="rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedScenario.steps[currentStep]?.title || 'Demo Step'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Step {currentStep + 1} of {selectedScenario.steps.length}
                </div>
              </div>
              
              <button
                onClick={goToNextStep}
                disabled={currentStep >= selectedScenario.steps.length - 1}
                className="rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="mx-2 h-6 border-l border-gray-300 dark:border-gray-600"></div>
              
              <button
                onClick={endDemo}
                className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
              >
                End Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </MockDataBadge>
  );
}