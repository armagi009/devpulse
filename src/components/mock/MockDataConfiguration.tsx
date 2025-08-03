/**
 * Mock Data Configuration Component
 * 
 * This component provides a comprehensive interface for configuring mock data
 * parameters, scenarios, and generation options.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useMode } from '@/lib/context/ModeContext';
import { AppMode } from '@/lib/types/roles';
import { MockDataOptions } from '@/lib/types/mock';
import { resetMockData, getMockData } from '@/lib/mock/mock-data-store';
import MockDataBadge from '../ui/mock-data-badge';

// Predefined scenarios for quick configuration
interface MockScenario {
  id: string;
  name: string;
  description: string;
  options: MockDataOptions;
  tags: string[];
}

const PREDEFINED_SCENARIOS: MockScenario[] = [
  {
    id: 'healthy-team',
    name: 'Healthy Team',
    description: 'A well-balanced team with good collaboration and no burnout issues',
    options: {
      repositories: 3,
      usersPerRepo: 5,
      timeRangeInDays: 90,
      activityLevel: 'medium',
      burnoutPatterns: false,
      collaborationPatterns: true,
    },
    tags: ['collaboration', 'balanced', 'demo'],
  },
  {
    id: 'burnout-risk',
    name: 'Burnout Risk',
    description: 'Team showing signs of burnout with irregular work patterns',
    options: {
      repositories: 4,
      usersPerRepo: 6,
      timeRangeInDays: 90,
      activityLevel: 'high',
      burnoutPatterns: true,
      collaborationPatterns: true,
    },
    tags: ['burnout', 'overwork', 'stress'],
  },
  {
    id: 'knowledge-silos',
    name: 'Knowledge Silos',
    description: 'Team with poor knowledge sharing and collaboration',
    options: {
      repositories: 5,
      usersPerRepo: 8,
      timeRangeInDays: 90,
      activityLevel: 'medium',
      burnoutPatterns: false,
      collaborationPatterns: false,
    },
    tags: ['silos', 'collaboration', 'knowledge'],
  },
  {
    id: 'high-velocity',
    name: 'High Velocity Team',
    description: 'Team with high productivity and fast delivery',
    options: {
      repositories: 6,
      usersPerRepo: 4,
      timeRangeInDays: 60,
      activityLevel: 'high',
      burnoutPatterns: false,
      collaborationPatterns: true,
    },
    tags: ['productivity', 'velocity', 'demo'],
  },
  {
    id: 'new-team',
    name: 'New Team Formation',
    description: 'Recently formed team with growing collaboration',
    options: {
      repositories: 2,
      usersPerRepo: 4,
      timeRangeInDays: 30,
      activityLevel: 'low',
      burnoutPatterns: false,
      collaborationPatterns: true,
    },
    tags: ['new', 'onboarding', 'growth'],
  },
];

// Advanced configuration options
interface AdvancedOptions {
  errorRate: number;
  latency: {
    min: number;
    max: number;
  };
  dataQuality: 'clean' | 'realistic' | 'problematic';
  includeOutliers: boolean;
  progressiveLoading: boolean;
}

const DEFAULT_ADVANCED_OPTIONS: AdvancedOptions = {
  errorRate: 0,
  latency: {
    min: 100,
    max: 500,
  },
  dataQuality: 'realistic',
  includeOutliers: true,
  progressiveLoading: true,
};

interface MockDataConfigurationProps {
  dataSet: string;
  onDataSetUpdated: () => void;
}

export default function MockDataConfiguration({
  dataSet,
  onDataSetUpdated,
}: MockDataConfigurationProps) {
  const { mode, switchMode, errorSimulation } = useMode();
  const [activeTab, setActiveTab] = useState<'scenarios' | 'custom' | 'advanced'>('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [customOptions, setCustomOptions] = useState<MockDataOptions>({
    repositories: 5,
    usersPerRepo: 3,
    timeRangeInDays: 90,
    activityLevel: 'medium',
    burnoutPatterns: true,
    collaborationPatterns: true,
  });
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>(DEFAULT_ADVANCED_OPTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Load current error simulation settings
  useEffect(() => {
    if (errorSimulation) {
      setAdvancedOptions(prev => ({
        ...prev,
        errorRate: errorSimulation.rate * 100,
      }));
    }
  }, [errorSimulation]);
  
  // Handle scenario selection
  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    
    // Find the selected scenario
    const scenario = PREDEFINED_SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      // Update custom options with scenario options
      setCustomOptions(scenario.options);
    }
  };
  
  // Handle custom options change
  const handleCustomOptionsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCustomOptions(prev => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setCustomOptions(prev => ({
        ...prev,
        [name]: parseInt(value, 10),
      }));
      return;
    }
    
    // Handle other inputs
    setCustomOptions(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle advanced options change
  const handleAdvancedOptionsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAdvancedOptions(prev => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      if (name === 'latencyMin') {
        setAdvancedOptions(prev => ({
          ...prev,
          latency: {
            ...prev.latency,
            min: parseInt(value, 10),
          },
        }));
      } else if (name === 'latencyMax') {
        setAdvancedOptions(prev => ({
          ...prev,
          latency: {
            ...prev.latency,
            max: parseInt(value, 10),
          },
        }));
      } else {
        setAdvancedOptions(prev => ({
          ...prev,
          [name]: parseInt(value, 10),
        }));
      }
      return;
    }
    
    // Handle other inputs
    setAdvancedOptions(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Generate mock data
  const handleGenerateMockData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataSet) {
      setError('No data set selected');
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      setSuccess(null);
      
      // Generate mock data with options
      await resetMockData(dataSet, customOptions);
      
      // Update error simulation settings
      await switchMode(mode, {
        errorSimulation: {
          enabled: advancedOptions.errorRate > 0,
          rate: advancedOptions.errorRate / 100,
        },
      });
      
      setSuccess(`Successfully generated mock data for "${dataSet}"`);
      onDataSetUpdated();
    } catch (err) {
      console.error('Error generating mock data:', err);
      setError(`Failed to generate mock data: ${(err as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <MockDataBadge>
      <div className="space-y-6">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
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

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-4 dark:bg-green-900/30">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'scenarios'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Predefined Scenarios
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'custom'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Custom Configuration
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'advanced'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Advanced Settings
            </button>
          </nav>
        </div>
        
        <form onSubmit={handleGenerateMockData}>
          {/* Scenarios Tab */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PREDEFINED_SCENARIOS.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      selectedScenario === scenario.id
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => handleScenarioSelect(scenario.id)}
                  >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {scenario.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {scenario.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {scenario.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
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
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Select a predefined scenario to quickly configure mock data. You can customize the settings further in the Custom Configuration tab.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Custom Configuration Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="repositories" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Repositories
                </label>
                <input
                  type="number"
                  name="repositories"
                  id="repositories"
                  min="1"
                  max="20"
                  value={customOptions.repositories}
                  onChange={handleCustomOptionsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Number of repositories to generate (1-20)
                </p>
              </div>

              <div>
                <label htmlFor="usersPerRepo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Users Per Repository
                </label>
                <input
                  type="number"
                  name="usersPerRepo"
                  id="usersPerRepo"
                  min="1"
                  max="10"
                  value={customOptions.usersPerRepo}
                  onChange={handleCustomOptionsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Number of users contributing to each repository (1-10)
                </p>
              </div>

              <div>
                <label htmlFor="timeRangeInDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Range (Days)
                </label>
                <input
                  type="number"
                  name="timeRangeInDays"
                  id="timeRangeInDays"
                  min="30"
                  max="365"
                  value={customOptions.timeRangeInDays}
                  onChange={handleCustomOptionsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Time range for generated data in days (30-365)
                </p>
              </div>

              <div>
                <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Activity Level
                </label>
                <select
                  name="activityLevel"
                  id="activityLevel"
                  value={customOptions.activityLevel}
                  onChange={handleCustomOptionsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Overall activity level for generated data
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    name="burnoutPatterns"
                    id="burnoutPatterns"
                    checked={customOptions.burnoutPatterns}
                    onChange={handleCustomOptionsChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="burnoutPatterns" className="font-medium text-gray-700 dark:text-gray-300">
                    Include Burnout Patterns
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Generate data that can trigger different burnout risk levels
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    name="collaborationPatterns"
                    id="collaborationPatterns"
                    checked={customOptions.collaborationPatterns}
                    onChange={handleCustomOptionsChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="collaborationPatterns" className="font-medium text-gray-700 dark:text-gray-300">
                    Include Collaboration Patterns
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Generate data that demonstrates different team collaboration patterns
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Advanced Settings Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="errorRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Error Simulation Rate (%)
                </label>
                <input
                  type="range"
                  name="errorRate"
                  id="errorRate"
                  min="0"
                  max="100"
                  step="5"
                  value={advancedOptions.errorRate}
                  onChange={handleAdvancedOptionsChange}
                  className="mt-1 block w-full"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0% (No Errors)</span>
                  <span>{advancedOptions.errorRate}%</span>
                  <span>100% (Always Fail)</span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Simulate API errors to test error handling and fallback mechanisms
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latencyMin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Min Latency (ms)
                  </label>
                  <input
                    type="number"
                    name="latencyMin"
                    id="latencyMin"
                    min="0"
                    max="2000"
                    value={advancedOptions.latency.min}
                    onChange={handleAdvancedOptionsChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="latencyMax" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Max Latency (ms)
                  </label>
                  <input
                    type="number"
                    name="latencyMax"
                    id="latencyMax"
                    min="0"
                    max="5000"
                    value={advancedOptions.latency.max}
                    onChange={handleAdvancedOptionsChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Simulate network latency for API responses (in milliseconds)
              </p>
              
              <div>
                <label htmlFor="dataQuality" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data Quality
                </label>
                <select
                  name="dataQuality"
                  id="dataQuality"
                  value={advancedOptions.dataQuality}
                  onChange={handleAdvancedOptionsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="clean">Clean (No anomalies)</option>
                  <option value="realistic">Realistic (Some anomalies)</option>
                  <option value="problematic">Problematic (Many anomalies)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Quality of generated data, from clean to problematic with anomalies
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    name="includeOutliers"
                    id="includeOutliers"
                    checked={advancedOptions.includeOutliers}
                    onChange={handleAdvancedOptionsChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="includeOutliers" className="font-medium text-gray-700 dark:text-gray-300">
                    Include Outliers
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Generate statistical outliers in the data to test visualization robustness
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    name="progressiveLoading"
                    id="progressiveLoading"
                    checked={advancedOptions.progressiveLoading}
                    onChange={handleAdvancedOptionsChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="progressiveLoading" className="font-medium text-gray-700 dark:text-gray-300">
                    Progressive Loading
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Simulate progressive loading of data in chunks for large datasets
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-6">
            <button
              type="submit"
              disabled={isGenerating || !dataSet}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400 dark:disabled:bg-blue-800"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>Generate Mock Data</>
              )}
            </button>
          </div>
        </form>
      </div>
    </MockDataBadge>
  );
}