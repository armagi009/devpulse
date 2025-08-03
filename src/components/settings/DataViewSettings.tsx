'use client';

/**
 * DataViewSettings Component
 * Allows users to customize how data is displayed in the application
 */

import React, { useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

// Chart type options
interface ChartTypeOption {
  id: string;
  name: string;
  description: string;
}

// Metric visibility options
interface MetricOption {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultVisible: boolean;
}

// Default view options
interface DefaultViewOption {
  id: string;
  name: string;
  description: string;
}

// Available chart types
const chartTypeOptions: ChartTypeOption[] = [
  {
    id: 'bar',
    name: 'Bar Chart',
    description: 'Best for comparing values across categories',
  },
  {
    id: 'line',
    name: 'Line Chart',
    description: 'Best for showing trends over time',
  },
  {
    id: 'area',
    name: 'Area Chart',
    description: 'Similar to line charts but with filled areas',
  },
  {
    id: 'pie',
    name: 'Pie Chart',
    description: 'Best for showing proportions of a whole',
  },
  {
    id: 'radar',
    name: 'Radar Chart',
    description: 'Best for comparing multiple variables',
  },
];

// Available metrics (shortened for brevity)
const metricOptions: MetricOption[] = [
  // Productivity metrics
  {
    id: 'commitFrequency',
    name: 'Commit Frequency',
    description: 'How often code is committed',
    category: 'productivity',
    defaultVisible: true,
  },
  {
    id: 'codeChurn',
    name: 'Code Churn',
    description: 'How much code is rewritten shortly after being written',
    category: 'productivity',
    defaultVisible: true,
  },
  // Burnout metrics
  {
    id: 'workHours',
    name: 'Work Hours',
    description: 'Distribution of work hours',
    category: 'burnout',
    defaultVisible: true,
  },
  {
    id: 'afterHoursWork',
    name: 'After Hours Work',
    description: 'Work done outside normal hours',
    category: 'burnout',
    defaultVisible: true,
  },
  // Team metrics
  {
    id: 'codeReviewParticipation',
    name: 'Code Review Participation',
    description: 'Level of participation in code reviews',
    category: 'team',
    defaultVisible: true,
  },
  {
    id: 'knowledgeSharing',
    name: 'Knowledge Sharing',
    description: 'How knowledge is shared across the team',
    category: 'team',
    defaultVisible: true,
  },
];

// Default view options
const defaultViewOptions: DefaultViewOption[] = [
  {
    id: 'summary',
    name: 'Summary View',
    description: 'High-level overview with key metrics',
  },
  {
    id: 'detailed',
    name: 'Detailed View',
    description: 'In-depth view with all metrics',
  },
  {
    id: 'compact',
    name: 'Compact View',
    description: 'Condensed view with minimal details',
  },
  {
    id: 'custom',
    name: 'Custom View',
    description: 'Personalized view with selected metrics',
  },
];

export default function DataViewSettings() {
  const { settings, updateSettings, loading, error } = useSettings();
  
  // Local state for data view preferences
  const [preferredChartType, setPreferredChartType] = useState<string>('bar');
  const [visibleMetrics, setVisibleMetrics] = useState<Record<string, boolean>>({});
  const [defaultView, setDefaultView] = useState<string>('summary');
  const [dataRefreshInterval, setDataRefreshInterval] = useState<number>(5);
  const [showDataLabels, setShowDataLabels] = useState<boolean>(true);
  const [showLegends, setShowLegends] = useState<boolean>(true);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Initialize local state from settings
  useEffect(() => {
    if (settings) {
      // Parse data view settings if they exist
      const dataViewSettings = settings.dashboardLayout?.dataViewSettings as any || {};
      
      // Initialize chart type
      setPreferredChartType(dataViewSettings.preferredChartType || 'bar');
      
      // Initialize visible metrics
      const metrics: Record<string, boolean> = {};
      metricOptions.forEach(metric => {
        metrics[metric.id] = dataViewSettings.visibleMetrics?.[metric.id] ?? metric.defaultVisible;
      });
      setVisibleMetrics(metrics);
      
      // Initialize other settings
      setDefaultView(dataViewSettings.defaultView || 'summary');
      setDataRefreshInterval(dataViewSettings.dataRefreshInterval || 5);
      setShowDataLabels(dataViewSettings.showDataLabels !== false);
      setShowLegends(dataViewSettings.showLegends !== false);
      setShowGridLines(dataViewSettings.showGridLines !== false);
    }
  }, [settings]);
  
  // Handle chart type selection
  const handleChartTypeChange = async (chartType: string) => {
    setPreferredChartType(chartType);
    await saveDataViewSettings();
  };
  
  // Handle metric visibility toggle
  const handleMetricToggle = async (metricId: string) => {
    const newValue = !visibleMetrics[metricId];
    setVisibleMetrics(prev => ({ ...prev, [metricId]: newValue }));
    await saveDataViewSettings();
  };
  
  // Handle default view change
  const handleDefaultViewChange = async (view: string) => {
    setDefaultView(view);
    await saveDataViewSettings();
  };
  
  // Handle data refresh interval change
  const handleRefreshIntervalChange = async (interval: number) => {
    setDataRefreshInterval(interval);
    await saveDataViewSettings();
  };
  
  // Handle toggle for data labels, legends, and grid lines
  const handleToggle = async (setting: 'dataLabels' | 'legends' | 'gridLines') => {
    switch (setting) {
      case 'dataLabels':
        setShowDataLabels(!showDataLabels);
        break;
      case 'legends':
        setShowLegends(!showLegends);
        break;
      case 'gridLines':
        setShowGridLines(!showGridLines);
        break;
    }
    await saveDataViewSettings();
  };
  
  // Save data view settings to the database
  const saveDataViewSettings = async () => {
    try {
      setSaveStatus('saving');
      
      // Get current dashboard layout or initialize empty object
      const currentLayout = (settings?.dashboardLayout as any) || {};
      
      // Create data view settings object
      const dataViewSettings = {
        preferredChartType,
        visibleMetrics,
        defaultView,
        dataRefreshInterval,
        showDataLabels,
        showLegends,
        showGridLines,
      };
      
      // Update settings in database
      await updateSettings({
        dashboardLayout: {
          ...currentLayout,
          dataViewSettings,
        },
      });
      
      setSaveStatus('success');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Error updating data view settings:', err);
      setSaveStatus('error');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Default View */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Default View</h3>
        <p className="text-sm text-muted-foreground">
          Choose how data is displayed by default
        </p>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {defaultViewOptions.map((option) => (
            <div
              key={option.id}
              className={`flex cursor-pointer flex-col rounded-lg border p-4 transition-all hover:border-primary ${
                defaultView === option.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => handleDefaultViewChange(option.id)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  id={`view-${option.id}`}
                  name="defaultView"
                  className="h-4 w-4 text-primary"
                  checked={defaultView === option.id}
                  onChange={() => handleDefaultViewChange(option.id)}
                />
                <label htmlFor={`view-${option.id}`} className="ml-2 font-medium">
                  {option.name}
                </label>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Preferred Chart Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preferred Chart Type</h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred chart type for data visualization
        </p>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {chartTypeOptions.map((option) => (
            <div
              key={option.id}
              className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 transition-all hover:border-primary ${
                preferredChartType === option.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => handleChartTypeChange(option.id)}
            >
              <div className="mb-3 h-24 w-24 rounded-md bg-gray-100 p-2 dark:bg-gray-800">
                {/* Placeholder for chart icon */}
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  {option.id}
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-medium">{option.name}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Metric Visibility */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Metric Visibility</h3>
        <p className="text-sm text-muted-foreground">
          Select which metrics you want to see in your dashboard
        </p>
        
        {/* Productivity Metrics */}
        <div className="space-y-2">
          <h4 className="font-medium">Productivity Metrics</h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {metricOptions
              .filter(metric => metric.category === 'productivity')
              .map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <h5 className="font-medium">{metric.name}</h5>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
                    <input
                      type="checkbox"
                      id={`metric-${metric.id}`}
                      className="peer sr-only"
                      checked={visibleMetrics[metric.id] || false}
                      onChange={() => handleMetricToggle(metric.id)}
                    />
                    <span
                      className={`${
                        visibleMetrics[metric.id] ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
                      } inline-block h-4 w-4 transform rounded-full transition`}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Burnout Metrics */}
        <div className="space-y-2">
          <h4 className="font-medium">Burnout Metrics</h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {metricOptions
              .filter(metric => metric.category === 'burnout')
              .map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <h5 className="font-medium">{metric.name}</h5>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
                    <input
                      type="checkbox"
                      id={`metric-${metric.id}`}
                      className="peer sr-only"
                      checked={visibleMetrics[metric.id] || false}
                      onChange={() => handleMetricToggle(metric.id)}
                    />
                    <span
                      className={`${
                        visibleMetrics[metric.id] ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
                      } inline-block h-4 w-4 transform rounded-full transition`}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Team Metrics */}
        <div className="space-y-2">
          <h4 className="font-medium">Team Metrics</h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {metricOptions
              .filter(metric => metric.category === 'team')
              .map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <h5 className="font-medium">{metric.name}</h5>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
                    <input
                      type="checkbox"
                      id={`metric-${metric.id}`}
                      className="peer sr-only"
                      checked={visibleMetrics[metric.id] || false}
                      onChange={() => handleMetricToggle(metric.id)}
                    />
                    <span
                      className={`${
                        visibleMetrics[metric.id] ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
                      } inline-block h-4 w-4 transform rounded-full transition`}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      
      {/* Data Refresh Interval */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Data Refresh Interval</h3>
        <p className="text-sm text-muted-foreground">
          How often should data be refreshed (in minutes)
        </p>
        
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={dataRefreshInterval}
            onChange={(e) => handleRefreshIntervalChange(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="w-16 text-center">{dataRefreshInterval} min</span>
        </div>
      </div>
      
      {/* Chart Display Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Chart Display Options</h3>
        <p className="text-sm text-muted-foreground">
          Configure how charts are displayed
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show Data Labels</h4>
              <p className="text-sm text-muted-foreground">Display values on chart elements</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
              <input
                type="checkbox"
                id="show-data-labels"
                className="peer sr-only"
                checked={showDataLabels}
                onChange={() => handleToggle('dataLabels')}
              />
              <span
                className={`${
                  showDataLabels ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
                } inline-block h-4 w-4 transform rounded-full transition`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show Legends</h4>
              <p className="text-sm text-muted-foreground">Display chart legends</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
              <input
                type="checkbox"
                id="show-legends"
                className="peer sr-only"
                checked={showLegends}
                onChange={() => handleToggle('legends')}
              />
              <span
                className={`${
                  showLegends ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
                } inline-block h-4 w-4 transform rounded-full transition`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show Grid Lines</h4>
              <p className="text-sm text-muted-foreground">Display grid lines on charts</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700">
              <input
                type="checkbox"
                id="show-grid-lines"
                className="peer sr-only"
                checked={showGridLines}
                onChange={() => handleToggle('gridLines')}
              />
              <span
                className={`${
                  showGridLines ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-white'
                } inline-block h-4 w-4 transform rounded-full transition`}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Status */}
      {saveStatus === 'saving' && (
        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 animate-spin text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Saving</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>Your data view preferences are being saved...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {saveStatus === 'success' && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Success</h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>Your data view preferences have been saved.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>Failed to save data view preferences. Please try again.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}