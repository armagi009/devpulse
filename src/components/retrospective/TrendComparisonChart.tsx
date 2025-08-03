'use client';

/**
 * TrendComparisonChart Component
 * Displays a comparison of team metrics between two time periods
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamMetric {
  id: string;
  repositoryId: string;
  date: Date;
  velocityScore: number;
  prMergeRate: number;
  issueResolutionRate: number;
  cycleTimeAverage: number;
  collaborationScore: number;
  knowledgeSharingScore: number;
  memberCount: number;
  totalCommits: number;
  totalPrs: number;
  totalIssues: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TrendComparisonChartProps {
  repositoryId: string;
  currentPeriod: {
    start: Date;
    end: Date;
  };
  previousPeriod?: {
    start: Date;
    end: Date;
  };
  teamMetrics: TeamMetric[];
}

export default function TrendComparisonChart({
  repositoryId,
  currentPeriod,
  previousPeriod,
  teamMetrics,
}: TrendComparisonChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('velocityScore');
  const [chartData, setChartData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  
  // Prepare chart data
  useEffect(() => {
    // Format team metrics for chart
    const formattedMetrics = teamMetrics.map(metric => ({
      date: format(new Date(metric.date), 'MMM dd'),
      velocityScore: Number(metric.velocityScore),
      collaborationScore: Number(metric.collaborationScore),
      knowledgeSharingScore: Number(metric.knowledgeSharingScore),
      prMergeRate: Number(metric.prMergeRate) * 100,
      issueResolutionRate: Number(metric.issueResolutionRate) * 100,
      cycleTimeAverage: Number(metric.cycleTimeAverage),
    }));
    
    setChartData(formattedMetrics);
    
    // Prepare comparison data
    const currentAvg = calculateAverages(teamMetrics);
    
    // If we have previous period data, fetch and calculate averages
    if (previousPeriod) {
      // In a real implementation, we would fetch previous period data
      // For now, we'll just use mock data
      const mockPreviousData = {
        velocityScore: currentAvg.velocityScore * 0.9,
        collaborationScore: currentAvg.collaborationScore * 0.95,
        knowledgeSharingScore: currentAvg.knowledgeSharingScore * 0.85,
        prMergeRate: currentAvg.prMergeRate * 0.9,
        issueResolutionRate: currentAvg.issueResolutionRate * 1.05,
        cycleTimeAverage: currentAvg.cycleTimeAverage * 1.1,
      };
      
      setComparisonData([
        {
          name: 'Previous',
          velocityScore: mockPreviousData.velocityScore,
          collaborationScore: mockPreviousData.collaborationScore,
          knowledgeSharingScore: mockPreviousData.knowledgeSharingScore,
          prMergeRate: mockPreviousData.prMergeRate * 100,
          issueResolutionRate: mockPreviousData.issueResolutionRate * 100,
          cycleTimeAverage: mockPreviousData.cycleTimeAverage,
        },
        {
          name: 'Current',
          velocityScore: currentAvg.velocityScore,
          collaborationScore: currentAvg.collaborationScore,
          knowledgeSharingScore: currentAvg.knowledgeSharingScore,
          prMergeRate: currentAvg.prMergeRate * 100,
          issueResolutionRate: currentAvg.issueResolutionRate * 100,
          cycleTimeAverage: currentAvg.cycleTimeAverage,
        },
      ]);
    }
  }, [teamMetrics, previousPeriod]);
  
  // Calculate averages for metrics
  const calculateAverages = (metrics: TeamMetric[]) => {
    if (metrics.length === 0) {
      return {
        velocityScore: 0,
        collaborationScore: 0,
        knowledgeSharingScore: 0,
        prMergeRate: 0,
        issueResolutionRate: 0,
        cycleTimeAverage: 0,
      };
    }
    
    const sum = metrics.reduce(
      (acc, metric) => ({
        velocityScore: acc.velocityScore + Number(metric.velocityScore),
        collaborationScore: acc.collaborationScore + Number(metric.collaborationScore),
        knowledgeSharingScore: acc.knowledgeSharingScore + Number(metric.knowledgeSharingScore),
        prMergeRate: acc.prMergeRate + Number(metric.prMergeRate),
        issueResolutionRate: acc.issueResolutionRate + Number(metric.issueResolutionRate),
        cycleTimeAverage: acc.cycleTimeAverage + Number(metric.cycleTimeAverage),
      }),
      {
        velocityScore: 0,
        collaborationScore: 0,
        knowledgeSharingScore: 0,
        prMergeRate: 0,
        issueResolutionRate: 0,
        cycleTimeAverage: 0,
      }
    );
    
    return {
      velocityScore: sum.velocityScore / metrics.length,
      collaborationScore: sum.collaborationScore / metrics.length,
      knowledgeSharingScore: sum.knowledgeSharingScore / metrics.length,
      prMergeRate: sum.prMergeRate / metrics.length,
      issueResolutionRate: sum.issueResolutionRate / metrics.length,
      cycleTimeAverage: sum.cycleTimeAverage / metrics.length,
    };
  };
  
  // Get metric display name
  const getMetricDisplayName = (metric: string) => {
    switch (metric) {
      case 'velocityScore':
        return 'Velocity Score';
      case 'collaborationScore':
        return 'Collaboration Score';
      case 'knowledgeSharingScore':
        return 'Knowledge Sharing';
      case 'prMergeRate':
        return 'PR Merge Rate (%)';
      case 'issueResolutionRate':
        return 'Issue Resolution (%)';
      case 'cycleTimeAverage':
        return 'Cycle Time (hours)';
      default:
        return metric;
    }
  };
  
  // Get metric color
  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'velocityScore':
        return '#3b82f6'; // blue-500
      case 'collaborationScore':
        return '#10b981'; // emerald-500
      case 'knowledgeSharingScore':
        return '#8b5cf6'; // violet-500
      case 'prMergeRate':
        return '#f59e0b'; // amber-500
      case 'issueResolutionRate':
        return '#ef4444'; // red-500
      case 'cycleTimeAverage':
        return '#6366f1'; // indigo-500
      default:
        return '#6b7280'; // gray-500
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2">
        {['velocityScore', 'collaborationScore', 'knowledgeSharingScore', 'prMergeRate', 'issueResolutionRate', 'cycleTimeAverage'].map((metric) => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-2 py-1 text-xs rounded-md ${
              selectedMetric === metric
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {getMetricDisplayName(metric)}
          </button>
        ))}
      </div>
      
      <Tabs defaultValue="trend">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trend">
          {/* Trend Chart */}
          <div className="h-[250px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={selectedMetric === 'cycleTimeAverage' ? [0, 'auto'] : [0, 100]} 
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    name={getMetricDisplayName(selectedMetric)}
                    stroke={getMetricColor(selectedMetric)}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No trend data available for this period.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="comparison">
          {/* Comparison Chart */}
          <div className="h-[250px]">
            {comparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    domain={selectedMetric === 'cycleTimeAverage' ? [0, 'auto'] : [0, 100]} 
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey={selectedMetric}
                    name={getMetricDisplayName(selectedMetric)}
                    fill={getMetricColor(selectedMetric)}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No comparison data available.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}