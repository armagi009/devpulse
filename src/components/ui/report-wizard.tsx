'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { Wizard, WizardStep } from '@/components/ui/wizard';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, CheckCircle, AlertCircle, BarChart, PieChart, LineChart, Download } from 'lucide-react';
import { handleApiResponse, logError, formatErrorMessage } from '@/lib/utils/error-handler';

interface ReportWizardProps {
  reportType: 'team' | 'productivity' | 'burnout';
  teamId?: string;
  teamName?: string;
  onComplete?: (reportId: string) => void;
}

export default function ReportWizard({ 
  reportType, 
  teamId,
  teamName,
  onComplete 
}: ReportWizardProps) {
  const router = useRouter();
  
  // State
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30), // Default to last 30 days
    to: new Date(),
  });
  
  const [reportTitle, setReportTitle] = useState(`${getReportTypeName(reportType)} Report - ${format(new Date(), 'MMM d, yyyy')}`);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(getDefaultMetrics(reportType));
  const [reportFormat, setReportFormat] = useState<'interactive' | 'pdf' | 'csv'>('interactive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);
  
  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setDateRange(prev => {
      // If no date is selected or both dates are selected, start a new selection
      if (!prev.from || (prev.from && prev.to)) {
        return {
          from: date,
          to: date,
        };
      }
      
      // If only the start date is selected, select the end date
      return {
        from: prev.from,
        to: date,
      };
    });
  };
  
  // Toggle metric selection
  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };
  
  // Generate report
  const generateReport = async (): Promise<boolean> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Determine API endpoint based on report type
      const endpoint = getReportEndpoint(reportType);
      
      // Call API to generate report
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: reportTitle,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          metrics: selectedMetrics,
          format: reportFormat,
          teamId: teamId,
        }),
      });
      
      // Use our error handling utility
      const data = await handleApiResponse(response);
      
      // Store the generated report ID
      setGeneratedReportId(data.id);
      
      return true;
    } catch (err) {
      // Log the error
      logError(err, { reportType, dateRange, selectedMetrics }, 'ReportWizard');
      
      // Format error message for display
      setError(formatErrorMessage(err));
      return false;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle wizard completion
  const handleWizardComplete = () => {
    if (generatedReportId) {
      if (onComplete) {
        onComplete(generatedReportId);
      } else {
        // Navigate to the report detail page
        router.push(`/dashboard/${reportType}/${generatedReportId}`);
      }
    }
  };
  
  // Helper functions
  function getReportTypeName(type: 'team' | 'productivity' | 'burnout'): string {
    switch (type) {
      case 'team':
        return teamName ? `${teamName} Team` : 'Team';
      case 'productivity':
        return 'Productivity';
      case 'burnout':
        return 'Burnout Risk';
      default:
        return 'Analytics';
    }
  }
  
  function getReportEndpoint(type: 'team' | 'productivity' | 'burnout'): string {
    switch (type) {
      case 'team':
        return '/api/analytics/team';
      case 'productivity':
        return '/api/analytics/productivity';
      case 'burnout':
        return '/api/analytics/burnout';
      default:
        return '/api/analytics/metrics';
    }
  }
  
  function getDefaultMetrics(type: 'team' | 'productivity' | 'burnout'): string[] {
    switch (type) {
      case 'team':
        return ['velocity', 'collaboration', 'code_quality', 'knowledge_distribution'];
      case 'productivity':
        return ['commit_frequency', 'code_churn', 'pull_request_throughput', 'issue_resolution_time'];
      case 'burnout':
        return ['work_hours', 'after_hours_work', 'weekend_work', 'response_time', 'workload_balance'];
      default:
        return [];
    }
  }
  
  function getAvailableMetrics(type: 'team' | 'productivity' | 'burnout'): { id: string; name: string; description: string }[] {
    switch (type) {
      case 'team':
        return [
          { id: 'velocity', name: 'Team Velocity', description: 'Measures the amount of work completed in a given time period' },
          { id: 'collaboration', name: 'Collaboration Index', description: 'Measures how team members work together on code' },
          { id: 'code_quality', name: 'Code Quality', description: 'Analyzes code quality metrics like test coverage and complexity' },
          { id: 'knowledge_distribution', name: 'Knowledge Distribution', description: 'Shows how knowledge is spread across the team' },
          { id: 'pr_review_time', name: 'PR Review Time', description: 'Average time to review pull requests' },
          { id: 'merge_frequency', name: 'Merge Frequency', description: 'How often code is merged to the main branch' },
          { id: 'issue_throughput', name: 'Issue Throughput', description: 'Rate at which issues are resolved' },
          { id: 'team_stability', name: 'Team Stability', description: 'Consistency of team membership over time' },
        ];
      case 'productivity':
        return [
          { id: 'commit_frequency', name: 'Commit Frequency', description: 'How often code is committed' },
          { id: 'code_churn', name: 'Code Churn', description: 'Amount of code rewritten or deleted shortly after being written' },
          { id: 'pull_request_throughput', name: 'PR Throughput', description: 'Rate at which PRs are created and merged' },
          { id: 'issue_resolution_time', name: 'Issue Resolution Time', description: 'Time taken to resolve issues' },
          { id: 'deployment_frequency', name: 'Deployment Frequency', description: 'How often code is deployed to production' },
          { id: 'build_time', name: 'Build Time', description: 'Time taken for builds to complete' },
          { id: 'test_pass_rate', name: 'Test Pass Rate', description: 'Percentage of tests that pass' },
          { id: 'code_review_coverage', name: 'Code Review Coverage', description: 'Percentage of code changes that are reviewed' },
        ];
      case 'burnout':
        return [
          { id: 'work_hours', name: 'Work Hours', description: 'Total hours worked per day/week' },
          { id: 'after_hours_work', name: 'After Hours Work', description: 'Work done outside of normal business hours' },
          { id: 'weekend_work', name: 'Weekend Work', description: 'Amount of work done on weekends' },
          { id: 'response_time', name: 'Response Time', description: 'Time to respond to messages and requests' },
          { id: 'workload_balance', name: 'Workload Balance', description: 'Distribution of work across team members' },
          { id: 'context_switching', name: 'Context Switching', description: 'Frequency of switching between different tasks' },
          { id: 'vacation_usage', name: 'Vacation Usage', description: 'How often team members take time off' },
          { id: 'meeting_load', name: 'Meeting Load', description: 'Time spent in meetings' },
        ];
      default:
        return [];
    }
  }
  
  const availableMetrics = getAvailableMetrics(reportType);
  
  return (
    <Wizard onComplete={handleWizardComplete} className="max-w-3xl mx-auto">
      {/* Step 1: Select Time Period */}
      <WizardStep 
        title="Select Time Period" 
        description="Choose the time period for your report"
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Select a time period for your {getReportTypeName(reportType).toLowerCase()} report. This will determine which data is included in the analysis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      format(dateRange.from, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? (
                      format(dateRange.to, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={(date) => date > new Date() || (dateRange.from && date < dateRange.from)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDateRange({
                from: subDays(new Date(), 7),
                to: new Date()
              })}
            >
              Last 7 days
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDateRange({
                from: subDays(new Date(), 30),
                to: new Date()
              })}
            >
              Last 30 days
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDateRange({
                from: subDays(new Date(), 90),
                to: new Date()
              })}
            >
              Last 90 days
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
            <p className="flex items-start">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Tip:</strong> For the most accurate insights, select a time period with sufficient data.
                We recommend at least 14 days for meaningful trends.
              </span>
            </p>
          </div>
        </div>
      </WizardStep>
      
      {/* Step 2: Select Metrics */}
      <WizardStep 
        title="Select Metrics" 
        description="Choose which metrics to include in your report"
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Select the metrics you want to include in your report. You can choose multiple metrics to get a comprehensive view.
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {availableMetrics.map(metric => (
              <div key={metric.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => toggleMetric(metric.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm rounded-md ${
                    selectedMetrics.includes(metric.id)
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{metric.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{metric.description}</span>
                  </div>
                  {selectedMetrics.includes(metric.id) && (
                    <CheckCircle className="h-5 w-5 ml-2 flex-shrink-0" />
                  )}
                </button>
              </div>
            ))}
          </div>
          
          {selectedMetrics.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 text-sm dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
              <p className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>
                  <strong>Note:</strong> You must select at least one metric to continue.
                </span>
              </p>
            </div>
          )}
        </div>
      </WizardStep>
      
      {/* Step 3: Report Format */}
      <WizardStep 
        title="Report Format" 
        description="Choose how you want to view and share your report"
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Select the format for your report. You can choose an interactive dashboard, a downloadable PDF, or CSV data.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={`border rounded-lg p-4 cursor-pointer ${
                reportFormat === 'interactive' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => setReportFormat('interactive')}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-full mb-3 ${
                  reportFormat === 'interactive' 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <BarChart className="h-6 w-6" />
                </div>
                <h4 className="font-medium mb-1">Interactive Dashboard</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Explore data with interactive charts and filters
                </p>
              </div>
            </div>
            
            <div 
              className={`border rounded-lg p-4 cursor-pointer ${
                reportFormat === 'pdf' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => setReportFormat('pdf')}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-full mb-3 ${
                  reportFormat === 'pdf' 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <Download className="h-6 w-6" />
                </div>
                <h4 className="font-medium mb-1">PDF Report</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Downloadable report with charts and insights
                </p>
              </div>
            </div>
            
            <div 
              className={`border rounded-lg p-4 cursor-pointer ${
                reportFormat === 'csv' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => setReportFormat('csv')}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-full mb-3 ${
                  reportFormat === 'csv' 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-medium mb-1">CSV Data</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Raw data for custom analysis in spreadsheets
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Title
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
      </WizardStep>
      
      {/* Step 4: Generate Report */}
      <WizardStep 
        title="Generate Report" 
        description="Review and generate your report"
        onNext={generateReport}
        completeLabel="View Report"
      >
        <div className="space-y-6">
          {generatedReportId ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Report Generated Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your {getReportTypeName(reportType).toLowerCase()} report has been created and is ready to view.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 dark:bg-gray-800 dark:border-gray-700">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Report Summary</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Report Type:</span>
                    <span>{getReportTypeName(reportType)}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Time Period:</span>
                    <span>{format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Metrics:</span>
                    <span>{selectedMetrics.length} selected</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Format:</span>
                    <span>{reportFormat === 'interactive' ? 'Interactive Dashboard' : reportFormat === 'pdf' ? 'PDF Report' : 'CSV Data'}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Title:</span>
                    <span>{reportTitle}</span>
                  </li>
                </ul>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm flex items-start dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                <p className="flex items-start">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Note:</strong> Generating a report may take a few moments depending on the amount of data and selected metrics.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </WizardStep>
    </Wizard>
  );
}