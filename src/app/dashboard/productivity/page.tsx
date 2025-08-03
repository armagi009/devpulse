'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import UnifiedNavigation from '@/components/layout/UnifiedNavigation';
import FilterStateProvider from '@/components/ui/FilterStateProvider';
import ProductivityMetrics from '@/components/analytics/ProductivityMetrics';
import { getMockData } from '@/lib/mock/mock-data-store';
import { isUsingMockData } from '@/lib/mock/mock-data-utils';

export default function ProductivityPage() {
  const { data: session, status } = useSession();
  const pageId = 'productivity';
  
  // Filter options - will be populated with mock data if available
  const filterOptions = [
    {
      id: 'repository',
      label: 'Repository',
      options: [
        { value: 'all', label: 'All Repositories' },
        { value: 'repo1', label: 'Repository 1' },
        { value: 'repo2', label: 'Repository 2' },
        { value: 'repo3', label: 'Repository 3' },
      ],
    },
    {
      id: 'metric',
      label: 'Metric Type',
      options: [
        { value: 'commits', label: 'Commits' },
        { value: 'pull_requests', label: 'Pull Requests' },
        { value: 'code_reviews', label: 'Code Reviews' },
        { value: 'all', label: 'All Metrics' },
      ],
    },
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'date_desc', label: 'Date (Newest First)' },
    { value: 'date_asc', label: 'Date (Oldest First)' },
    { value: 'activity_desc', label: 'Activity (Highest First)' },
    { value: 'activity_asc', label: 'Activity (Lowest First)' },
  ];
  
  // Fetch data function with mock data support
  const fetchData = async (filterState: any) => {
    try {
      // Format dates for API
      const startDate = filterState.timeRange.start.toISOString().split('T')[0];
      const endDate = filterState.timeRange.end.toISOString().split('T')[0];
      
      if (isUsingMockData()) {
        // Use mock data
        const mockData = await getMockData();
        
        // Generate productivity data from mock commits
        const productivityData = {
          commits: [],
          pullRequests: [],
          codeReviews: [],
          contributionData: []
        };
        
        // Process mock commits to create contribution heatmap data
        Object.values(mockData.commits).flat().forEach(commit => {
          const commitDate = new Date(commit.commit.author.date);
          if (commitDate >= filterState.timeRange.start && commitDate <= filterState.timeRange.end) {
            productivityData.contributionData.push({
              date: commitDate.toISOString(),
              value: 1 // Each commit counts as 1 contribution
            });
          }
        });
        
        // Aggregate contributions by date
        const contributionMap = new Map();
        productivityData.contributionData.forEach(point => {
          const dateStr = point.date.split('T')[0];
          contributionMap.set(dateStr, (contributionMap.get(dateStr) || 0) + point.value);
        });
        
        // Convert back to array format
        productivityData.contributionData = Array.from(contributionMap.entries()).map(([date, value]) => ({
          date: new Date(date).toISOString(),
          value
        }));
        
        return productivityData;
      } else {
        // Build query params for real API
        const params = new URLSearchParams({
          start: startDate,
          end: endDate,
          sort: filterState.sortBy || 'date_desc',
        });
        
        // Add filter params
        if (filterState.filters.repository) {
          params.append('repository', filterState.filters.repository);
        }
        
        if (filterState.filters.metric) {
          params.append('metric', filterState.filters.metric);
        }
        
        // Fetch data from API
        const response = await fetch(`/api/analytics/productivity?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch productivity metrics');
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching productivity data:', error);
      
      // Fallback to demo data
      return {
        commits: [],
        pullRequests: [],
        codeReviews: [],
        contributionData: generateDemoContributionData(filterState.timeRange.start, filterState.timeRange.end)
      };
    }
  };
  
  // Generate demo contribution data for fallback
  const generateDemoContributionData = (startDate: Date, endDate: Date) => {
    const data = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Generate random contribution count (0-10)
      const value = Math.floor(Math.random() * 11);
      data.push({
        date: currentDate.toISOString(),
        value
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };
  
  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <UnifiedNavigation user={session?.user}>
        <div className="space-y-6 p-4 md:p-6">
          <div className="h-64 rounded-lg bg-gray-200 animate-pulse dark:bg-gray-700"></div>
        </div>
      </UnifiedNavigation>
    );
  }
  
  return (
    <UnifiedNavigation user={session?.user}>
      <div className="space-y-6 p-4 md:p-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Productivity Metrics
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your coding patterns and productivity trends
            </p>
          </div>
        </div>

        {/* Mock Data Indicator */}
        {isUsingMockData() && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  🔧 Demo Mode: Showing sample productivity data for demonstration purposes.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Filter State Provider */}
        <FilterStateProvider
          pageId={pageId}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          showTimeRange={true}
          fetchData={fetchData}
          className="bg-white p-4 rounded-lg shadow dark:bg-gray-800"
        >
          {(data, loading) => (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
              {loading ? (
                // Skeleton loading state
                <>
                  <div className="h-64 rounded-lg bg-gray-200 animate-pulse dark:bg-gray-700"></div>
                  <div className="h-64 rounded-lg bg-gray-200 animate-pulse dark:bg-gray-700"></div>
                  <div className="h-64 rounded-lg bg-gray-200 animate-pulse dark:bg-gray-700"></div>
                  <div className="h-64 rounded-lg bg-gray-200 animate-pulse dark:bg-gray-700"></div>
                </>
              ) : (
                // Actual content
                <ProductivityMetrics data={data} />
              )}
            </div>
          )}
        </FilterStateProvider>
      </div>
    </UnifiedNavigation>
  );
}