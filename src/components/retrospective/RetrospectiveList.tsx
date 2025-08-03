'use client';

/**
 * RetrospectiveList Component
 * Displays a list of generated retrospectives
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronRightIcon } from 'lucide-react';

interface Retrospective {
  id: string;
  startDate: Date;
  endDate: Date;
  teamHealthScore: number;
  createdAt: Date;
}

interface RetrospectiveListProps {
  repositoryId: string;
  initialRetrospectives?: Retrospective[];
}

export default function RetrospectiveList({ 
  repositoryId, 
  initialRetrospectives = [] 
}: RetrospectiveListProps) {
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>(initialRetrospectives);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch retrospectives if none provided
  useEffect(() => {
    if (initialRetrospectives.length > 0) return;
    
    const fetchRetrospectives = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/insights/retrospective?repositoryId=${repositoryId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to fetch retrospectives');
        }
        
        setRetrospectives(data.data.retrospectives);
      } catch (err) {
        console.error('Error fetching retrospectives:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRetrospectives();
  }, [repositoryId, initialRetrospectives]);
  
  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
        {error}
      </div>
    );
  }
  
  // Handle empty state
  if (retrospectives.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <p className="mb-4">No retrospectives have been generated yet.</p>
          <p>Generate your first retrospective using the form above.</p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {retrospectives.map((retrospective) => (
        <Link 
          key={retrospective.id} 
          href={`/dashboard/retrospective/${retrospective.id}`}
          className="block"
        >
          <Card className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>
                      {format(new Date(retrospective.startDate), 'MMM d, yyyy')} - {format(new Date(retrospective.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="text-lg font-medium">
                    Retrospective {format(new Date(retrospective.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Team Health</div>
                    <div className="flex items-center">
                      <div 
                        className={`h-2.5 w-2.5 rounded-full mr-1.5 ${getHealthScoreColor(Number(retrospective.teamHealthScore))}`}
                      ></div>
                      <span className="font-medium">{retrospective.teamHealthScore}/100</span>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}