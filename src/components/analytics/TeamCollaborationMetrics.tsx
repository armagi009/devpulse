/**
 * TeamCollaborationMetrics Component
 * Displays team collaboration metrics and visualizations
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/components/ui/api-error';
import { ApiErrorBoundary } from '@/components/ui/error-boundary-wrapper';
import { handleApiResponse } from '@/lib/utils/error-handler';

// Import visualization components
import TeamVelocityChart from './TeamVelocityChart';
import CollaborationNetworkChart from './CollaborationNetworkChart';
import PullRequestFlow from './PullRequestFlow';
import KnowledgeDistribution from './KnowledgeDistribution';

// Types
import type { 
  TeamVelocity, 
  CollaborationMetrics, 
  KnowledgeDistribution as KnowledgeDistributionType 
} from '@/lib/types/analytics';

interface TeamCollaborationMetricsProps {
  repositoryId: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Fetch team analytics data
 */
async function fetchTeamAnalytics(repositoryId: string, startDate?: string, endDate?: string) {
  // Build query parameters
  const params = new URLSearchParams();
  params.append('repositoryId', repositoryId);
  
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  // Fetch data
  const response = await fetch(`/api/analytics/team?${params.toString()}`);
  return handleApiResponse(response);
}

/**
 * TeamCollaborationMetrics Component
 */
export default function TeamCollaborationMetrics({ 
  repositoryId, 
  timeRange 
}: TeamCollaborationMetricsProps) {
  // State
  const [activeTab, setActiveTab] = useState('velocity');
  const [timeRangeFilter, setTimeRangeFilter] = useState<30 | 60 | 90>(30);
  
  // Format date for API
  const formatDate = (date: Date) => date.toISOString();
  
  // Calculate time range based on filter
  const getTimeRangeFromFilter = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - timeRangeFilter);
    return { start, end };
  };
  
  // Use provided time range or calculated one
  const effectiveTimeRange = timeRange || getTimeRangeFromFilter();
  
  // Query for team analytics data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teamAnalytics', repositoryId, effectiveTimeRange.start, effectiveTimeRange.end],
    queryFn: () => fetchTeamAnalytics(
      repositoryId,
      formatDate(effectiveTimeRange.start),
      formatDate(effectiveTimeRange.end)
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Handle loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  // Handle error state
  if (error) {
    return <ApiError error={error} onRetry={() => refetch()} />;
  }
  
  // Handle insufficient data
  if (data && !data.hasSufficientData) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium">Insufficient Data</h3>
          <p className="text-gray-500 dark:text-gray-400">
            There isn't enough data to generate meaningful team analytics.
            We need at least 10 commits, 2 PRs, and 2 contributors.
          </p>
        </div>
      </Card>
    );
  }
  
  // Mock PR flow data (in a real implementation, this would come from the API)
  const prFlowData = {
    statuses: [
      { name: 'Draft', count: 5, avgTimeInStatus: 24 },
      { name: 'Open', count: 8, avgTimeInStatus: 36 },
      { name: 'In Review', count: 12, avgTimeInStatus: 48 },
      { name: 'Changes Requested', count: 3, avgTimeInStatus: 72 },
      { name: 'Approved', count: 6, avgTimeInStatus: 12 },
      { name: 'Merged', count: 25, avgTimeInStatus: 4 },
    ],
    transitions: [
      { source: 'Draft', target: 'Open', value: 5 },
      { source: 'Open', target: 'In Review', value: 8 },
      { source: 'In Review', target: 'Changes Requested', value: 3 },
      { source: 'In Review', target: 'Approved', value: 9 },
      { source: 'Changes Requested', target: 'In Review', value: 3 },
      { source: 'Approved', target: 'Merged', value: 6 },
    ],
    bottlenecks: ['In Review', 'Changes Requested'],
    cycleTime: 72, // hours
    throughput: 8.5, // PRs per week
    mergeRate: 0.85, // percentage
  };
  
  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      {!timeRange && (
        <div className="flex justify-end">
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRangeFilter(30)}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRangeFilter === 30
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRangeFilter(60)}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRangeFilter === 60
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              60 Days
            </button>
            <button
              onClick={() => setTimeRangeFilter(90)}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRangeFilter === 90
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="velocity">Team Velocity</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration Network</TabsTrigger>
          <TabsTrigger value="pr-flow">PR Flow</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="velocity" className="mt-6">
          <ApiErrorBoundary componentName="TeamVelocityChart">
            {data?.velocity && <TeamVelocityChart velocity={data.velocity} />}
          </ApiErrorBoundary>
        </TabsContent>
        
        <TabsContent value="collaboration" className="mt-6">
          <ApiErrorBoundary componentName="CollaborationNetworkChart">
            {data?.collaboration && <CollaborationNetworkChart collaboration={data.collaboration} />}
          </ApiErrorBoundary>
        </TabsContent>
        
        <TabsContent value="pr-flow" className="mt-6">
          <ApiErrorBoundary componentName="PullRequestFlow">
            <PullRequestFlow prFlow={prFlowData} />
          </ApiErrorBoundary>
        </TabsContent>
        
        <TabsContent value="knowledge" className="mt-6">
          <ApiErrorBoundary componentName="KnowledgeDistribution">
            {data?.knowledge && <KnowledgeDistribution knowledge={data.knowledge} />}
          </ApiErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Loading Skeleton
 */
function LoadingSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    </Card>
  );
}