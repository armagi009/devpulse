'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { Wizard, WizardStep } from '@/components/ui/wizard';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { handleApiResponse, logError, formatErrorMessage } from '@/lib/utils/error-handler';
import { Card, CardContent } from '@/components/ui/card';

interface RetrospectiveWizardProps {
  repositoryId: string;
  repositoryName: string;
  teamMembers?: { id: string; name: string; avatarUrl?: string }[];
}

export default function RetrospectiveWizard({ 
  repositoryId, 
  repositoryName,
  teamMembers = []
}: RetrospectiveWizardProps) {
  const router = useRouter();
  
  // State
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 14), // Default to last 2 weeks
    to: new Date(),
  });
  
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [customFocusArea, setCustomFocusArea] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [retrospectiveTitle, setRetrospectiveTitle] = useState(`${repositoryName} Retrospective - ${format(new Date(), 'MMM d, yyyy')}`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedRetrospectiveId, setGeneratedRetrospectiveId] = useState<string | null>(null);
  
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
  
  // Toggle focus area
  const toggleFocusArea = (area: string) => {
    setFocusAreas(prev => 
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };
  
  // Add custom focus area
  const addCustomFocusArea = () => {
    if (customFocusArea.trim() && !focusAreas.includes(customFocusArea.trim())) {
      setFocusAreas(prev => [...prev, customFocusArea.trim()]);
      setCustomFocusArea('');
    }
  };
  
  // Toggle team member selection
  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };
  
  // Generate retrospective
  const generateRetrospective = async (): Promise<boolean> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Call API to generate retrospective
      const response = await fetch('/api/insights/retrospective', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryId,
          title: retrospectiveTitle,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
          teamMembers: selectedTeamMembers.length > 0 ? selectedTeamMembers : undefined,
        }),
      });
      
      // Use our error handling utility
      const data = await handleApiResponse(response);
      
      // Store the generated retrospective ID
      setGeneratedRetrospectiveId(data.id);
      
      return true;
    } catch (err) {
      // Log the error
      logError(err, { repositoryId, dateRange, focusAreas }, 'RetrospectiveWizard');
      
      // Format error message for display
      setError(formatErrorMessage(err));
      return false;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle wizard completion
  const handleWizardComplete = () => {
    if (generatedRetrospectiveId) {
      // Navigate to the retrospective detail page
      router.push(`/dashboard/retrospective/${generatedRetrospectiveId}`);
    }
  };
  
  // Common focus areas
  const commonFocusAreas = [
    'Code Quality',
    'Collaboration',
    'Process Improvement',
    'Technical Debt',
    'Knowledge Sharing',
    'Velocity',
    'Testing',
    'Documentation',
  ];
  
  return (
    <Wizard onComplete={handleWizardComplete} className="max-w-3xl mx-auto">
      {/* Step 1: Select Time Period */}
      <WizardStep 
        title="Select Time Period" 
        description="Choose the time period for your retrospective analysis"
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Select a time period to analyze for your retrospective. This will determine which commits, 
            pull requests, and other activities are included in the analysis.
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
          
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
            <p className="flex items-start">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Tip:</strong> For sprint retrospectives, select the exact sprint dates. 
                For regular retrospectives, 2-4 weeks is usually a good time frame.
              </span>
            </p>
          </div>
        </div>
      </WizardStep>
      
      {/* Step 2: Focus Areas */}
      <WizardStep 
        title="Select Focus Areas" 
        description="Choose specific areas to focus on in your retrospective"
        isOptional={true}
        canSkip={true}
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Select specific areas you want to focus on in your retrospective. This helps the AI 
            generate more targeted insights and recommendations.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonFocusAreas.map(area => (
              <div key={area} className="flex items-center">
                <button
                  type="button"
                  onClick={() => toggleFocusArea(area)}
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md ${
                    focusAreas.includes(area)
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  <span>{area}</span>
                  {focusAreas.includes(area) && (
                    <CheckCircle className="h-4 w-4 ml-2" />
                  )}
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={customFocusArea}
              onChange={(e) => setCustomFocusArea(e.target.value)}
              placeholder="Add custom focus area..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <Button 
              onClick={addCustomFocusArea}
              disabled={!customFocusArea.trim()}
              variant="outline"
            >
              Add
            </Button>
          </div>
          
          {focusAreas.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Focus Areas:
              </h4>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map(area => (
                  <div 
                    key={area}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    <span>{area}</span>
                    <button
                      type="button"
                      onClick={() => toggleFocusArea(area)}
                      className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </WizardStep>
      
      {/* Step 3: Team Members */}
      <WizardStep 
        title="Select Team Members" 
        description="Choose which team members to include in the retrospective"
        isOptional={true}
        canSkip={true}
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Select team members to include in the retrospective analysis. If none are selected,
            all contributors to the repository will be included.
          </p>
          
          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleTeamMember(member.id)}
                    className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
                      selectedTeamMembers.includes(member.id)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {member.avatarUrl && (
                      <img 
                        src={member.avatarUrl} 
                        alt={member.name} 
                        className="h-6 w-6 rounded-full mr-2"
                      />
                    )}
                    <span className="flex-1 text-left">{member.name}</span>
                    {selectedTeamMembers.includes(member.id) && (
                      <CheckCircle className="h-4 w-4 ml-2" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                No team members found. All contributors to the repository will be included.
              </p>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
            <p className="flex items-start">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Note:</strong> Selecting specific team members helps focus the retrospective on their contributions and interactions.
              </span>
            </p>
          </div>
        </div>
      </WizardStep>
      
      {/* Step 4: Retrospective Details */}
      <WizardStep 
        title="Retrospective Details" 
        description="Set a title and finalize your retrospective"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Retrospective Title
            </label>
            <input
              type="text"
              value={retrospectiveTitle}
              onChange={(e) => setRetrospectiveTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 dark:bg-gray-800 dark:border-gray-700">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Retrospective Summary</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="font-medium mr-2">Repository:</span>
                <span>{repositoryName}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">Time Period:</span>
                <span>{format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}</span>
              </li>
              {focusAreas.length > 0 && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">Focus Areas:</span>
                  <span>{focusAreas.join(', ')}</span>
                </li>
              )}
              {selectedTeamMembers.length > 0 && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">Team Members:</span>
                  <span>{selectedTeamMembers.length} selected</span>
                </li>
              )}
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
                <strong>Note:</strong> Generating a retrospective may take up to a minute as we analyze your team's activity and generate insights.
              </span>
            </p>
          </div>
        </div>
      </WizardStep>
      
      {/* Step 5: Generate Retrospective */}
      <WizardStep 
        title="Generate Retrospective" 
        description="Create your retrospective report"
        onNext={generateRetrospective}
        completeLabel="View Retrospective"
      >
        <div className="space-y-6">
          {generatedRetrospectiveId ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Retrospective Generated Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your retrospective has been created and is ready to view.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">
                Click the "Generate Retrospective" button below to create your retrospective. This will:
              </p>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Analyze repository activity during the selected time period</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Identify patterns, achievements, and challenges</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Generate insights and recommendations</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Create action items for team improvement</span>
                </li>
              </ul>
              
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 text-sm dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
                <p className="flex items-start">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Important:</strong> This process may take up to a minute to complete. Please don't close this window during generation.
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