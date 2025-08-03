/**
 * TeamVelocityChart Component
 * Displays team velocity metrics over time
 */

import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamVelocity, TrendPoint } from '@/lib/types/analytics';
import MockDataWrapper from '@/components/mock/MockDataWrapper';

interface TeamVelocityChartProps {
  velocity: TeamVelocity;
}

function TeamVelocityChartBase({ velocity }: TeamVelocityChartProps) {
  // Format trend data for chart
  const trendData = velocity.historicalTrend.map(point => ({
    date: format(new Date(point.date), 'MMM dd'),
    value: point.value,
  }));
  
  // Calculate trend direction
  const trendDirection = calculateTrendDirection(velocity.historicalTrend);
  
  // Metrics for cards
  const metrics = [
    { name: 'Velocity Score', value: velocity.velocityScore, suffix: '/100', 
      description: 'Overall team velocity score based on multiple factors' },
    { name: 'PR Merge Rate', value: Math.round(velocity.prMergeRate * 100), suffix: '%', 
      description: 'Percentage of PRs that get merged' },
    { name: 'Issue Resolution', value: Math.round(velocity.issueResolutionRate * 100), suffix: '%', 
      description: 'Percentage of issues that get resolved' },
    { name: 'Cycle Time', value: Math.round(velocity.cycleTimeAverage), suffix: ' hours', 
      description: 'Average time from PR creation to merge' },
  ];
  
  return (
    <div className="space-y-6">
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name} className="p-4">
            <div className="flex flex-col">
              <div className="text-sm text-gray-500">{metric.name}</div>
              <div className="text-2xl font-bold">
                {metric.value}{metric.suffix}
              </div>
              <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Velocity Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Velocity Trend</CardTitle>
          <CardDescription>
            Team velocity score over time
            {trendDirection === 'up' && (
              <span className="text-green-500 ml-2">↑ Improving</span>
            )}
            {trendDirection === 'down' && (
              <span className="text-red-500 ml-2">↓ Declining</span>
            )}
            {trendDirection === 'stable' && (
              <span className="text-blue-500 ml-2">→ Stable</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Velocity Score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Velocity Components Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Velocity Components</CardTitle>
          <CardDescription>
            Breakdown of factors contributing to velocity score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={[
                  {
                    name: 'Commit Frequency',
                    value: Math.min(100, velocity.commitFrequency * 20), // Scale to 0-100
                    description: `${velocity.commitFrequency.toFixed(1)} commits per day`
                  },
                  {
                    name: 'PR Merge Rate',
                    value: velocity.prMergeRate * 100,
                    description: `${(velocity.prMergeRate * 100).toFixed(0)}% of PRs merged`
                  },
                  {
                    name: 'Issue Resolution',
                    value: velocity.issueResolutionRate * 100,
                    description: `${(velocity.issueResolutionRate * 100).toFixed(0)}% of issues resolved`
                  },
                  {
                    name: 'Cycle Time',
                    value: Math.max(0, 100 - (velocity.cycleTimeAverage / 168) * 100), // Invert and scale
                    description: `${velocity.cycleTimeAverage.toFixed(1)} hours average`
                  }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}`, 
                    name, 
                    props.payload.description
                  ]}
                />
                <Legend />
                <Bar dataKey="value" name="Score" fill="#3b82f6" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>Velocity Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {generateVelocityInsights(velocity)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Calculate trend direction from historical data
 */
function calculateTrendDirection(trendData: TrendPoint[]): 'up' | 'down' | 'stable' {
  if (trendData.length < 2) return 'stable';
  
  // Get first and last points
  const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
  const secondHalf = trendData.slice(Math.floor(trendData.length / 2));
  
  // Calculate averages
  const firstAvg = firstHalf.reduce((sum, point) => sum + point.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, point) => sum + point.value, 0) / secondHalf.length;
  
  // Calculate percentage change
  const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (percentChange > 5) return 'up';
  if (percentChange < -5) return 'down';
  return 'stable';
}

/**
 * Generate insights based on velocity data
 */
function generateVelocityInsights(velocity: TeamVelocity): JSX.Element[] {
  const insights: JSX.Element[] = [];
  
  // Velocity score insight
  if (velocity.velocityScore >= 80) {
    insights.push(
      <div key="high-velocity" className="p-3 bg-green-50 rounded-md border border-green-200 dark:bg-green-900/20 dark:border-green-800">
        <p className="text-green-800 dark:text-green-300">
          <span className="font-semibold">High Team Velocity:</span> Your team is performing exceptionally well with a velocity score of {velocity.velocityScore}/100. Continue maintaining this momentum.
        </p>
      </div>
    );
  } else if (velocity.velocityScore < 50) {
    insights.push(
      <div key="low-velocity" className="p-3 bg-amber-50 rounded-md border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <p className="text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Velocity Improvement Needed:</span> Your team's velocity score of {velocity.velocityScore}/100 indicates room for improvement. Consider reviewing your development processes.
        </p>
      </div>
    );
  }
  
  // Cycle time insight
  if (velocity.cycleTimeAverage > 72) { // More than 3 days
    insights.push(
      <div key="high-cycle-time" className="p-3 bg-red-50 rounded-md border border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <p className="text-red-800 dark:text-red-300">
          <span className="font-semibold">Long Cycle Time:</span> PRs are taking an average of {Math.round(velocity.cycleTimeAverage)} hours to merge. Consider implementing smaller PRs or more frequent code reviews.
        </p>
      </div>
    );
  } else if (velocity.cycleTimeAverage < 24) { // Less than 1 day
    insights.push(
      <div key="low-cycle-time" className="p-3 bg-green-50 rounded-md border border-green-200 dark:bg-green-900/20 dark:border-green-800">
        <p className="text-green-800 dark:text-green-300">
          <span className="font-semibold">Excellent Cycle Time:</span> Your team is merging PRs quickly with an average cycle time of {Math.round(velocity.cycleTimeAverage)} hours.
        </p>
      </div>
    );
  }
  
  // PR merge rate insight
  if (velocity.prMergeRate < 0.7) { // Less than 70%
    insights.push(
      <div key="low-merge-rate" className="p-3 bg-amber-50 rounded-md border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <p className="text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Low PR Merge Rate:</span> Only {Math.round(velocity.prMergeRate * 100)}% of PRs are being merged. Consider reviewing PR quality and review processes.
        </p>
      </div>
    );
  }
  
  // Issue resolution insight
  if (velocity.issueResolutionRate < 0.6) { // Less than 60%
    insights.push(
      <div key="low-issue-resolution" className="p-3 bg-amber-50 rounded-md border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <p className="text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Low Issue Resolution Rate:</span> Only {Math.round(velocity.issueResolutionRate * 100)}% of issues are being resolved. Consider reviewing issue prioritization and assignment.
        </p>
      </div>
    );
  }
  
  // If no insights, add a general one
  if (insights.length === 0) {
    insights.push(
      <div key="general" className="p-3 bg-blue-50 rounded-md border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <p className="text-blue-800 dark:text-blue-300">
          <span className="font-semibold">Balanced Performance:</span> Your team is showing balanced performance across velocity metrics. Continue monitoring for any changes in trends.
        </p>
      </div>
    );
  }
  
  return insights;
}

/**
 * Export the wrapped component
 */
export default function TeamVelocityChart(props: TeamVelocityChartProps) {
  return (
    <MockDataWrapper componentName="TeamVelocityChart">
      <TeamVelocityChartBase {...props} />
    </MockDataWrapper>
  );
}