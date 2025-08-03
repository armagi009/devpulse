'use client';

/**
 * RetrospectiveGenerator Component
 * Allows users to generate team retrospectives
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { handleApiResponse, logError, formatErrorMessage } from '@/lib/utils/error-handler';

interface RetrospectiveGeneratorProps {
  repositoryId: string;
}

export default function RetrospectiveGenerator({ repositoryId }: RetrospectiveGeneratorProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 14), // Default to last 2 weeks
    to: new Date(),
  });
  
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
  
  // Generate retrospective
  const generateRetrospective = async () => {
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
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
        }),
      });
      
      // Use our error handling utility
      const data = await handleApiResponse(response);
      
      // Refresh the page to show the new retrospective
      router.refresh();
      
      // Navigate to the retrospective detail page
      router.push(`/dashboard/retrospective/${data.id}`);
    } catch (err) {
      // Log the error
      logError(err, { repositoryId, dateRange }, 'RetrospectiveGenerator');
      
      // Format error message for display
      setError(formatErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New Retrospective</CardTitle>
        <CardDescription>
          Create an AI-powered retrospective for your team based on GitHub activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Period
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
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
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
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
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-3 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
            <p>
              <strong>Note:</strong> Generating a retrospective may take up to a minute as we analyze your team's activity and generate insights.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateRetrospective} 
          disabled={isGenerating || !dateRange.from || !dateRange.to}
          className="w-full sm:w-auto"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Retrospective'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}