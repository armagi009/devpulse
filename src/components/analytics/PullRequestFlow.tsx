'use client';

/**
 * PullRequestFlow Component
 * Displays PR workflow analysis and bottlenecks
 */

import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Sankey,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PRStatus {
  name: string;
  count: number;
  avgTimeInStatus: number; // hours
}

interface PRFlow {
  statuses: PRStatus[];
  transitions: {
    source: string;
    target: string;
    value: number;
  }[];
  bottlenecks: string[];
  cycleTime: number; // hours
  throughput: number; // PRs per week
  mergeRate: number; // percentage
}

interface PullRequestFlowProps {
  prFlow: PRFlow;
}

export default function PullRequestFlow({ prFlow }: PullRequestFlowProps) {
  const [selectedMetric, setSelectedMetric] = useState<'count' | 'time'>('count');
  
  // Colors for different statuses
  const getStatusColor = (status: string) => {
    if (prFlow.bottlenecks.includes(status)) {
      return '#ef4444'; // red-500
    }
    
    switch (status) {
      case 'Draft':
        return '#94a3b8'; // slate-400
      case 'Open':
        return '#3b82f6'; // blue-500
      case 'In Review':
        return '#f59e0b'; // amber-500
      case 'Changes Requested':
        return '#f97316'; // orange-500
      case 'Approved':
        return '#10b981'; // emerald-500
      case 'Merged':
        return '#8b5cf6'; // violet-500
      default:
        return '#6b7280'; // gray-500
    }
  };
  
  return (
    <div className="space-y-6">
      {/* PR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Cycle Time
              </div>
              <div className="text-3xl font-bold mt-1">
                {Math.round(prFlow.cycleTime)} hours
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Average time from PR creation to merge
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Throughput
              </div>
              <div className="text-3xl font-bold mt-1">
                {prFlow.throughput.toFixed(1)} PRs/week
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Number of PRs merged per week
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Merge Rate
              </div>
              <div className="text-3xl font-bold mt-1">
                {Math.round(prFlow.mergeRate * 100)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Percentage of PRs that get merged
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* PR Status Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Pull Request Status</CardTitle>
              <CardDescription>
                Distribution of PRs by status
              </CardDescription>
            </div>
            <div className="flex space-x-2 mt-2 md:mt-0">
              <button
                onClick={() => setSelectedMetric('count')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedMetric === 'count'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Count
              </button>
              <button
                onClick={() => setSelectedMetric('time')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedMetric === 'time'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Time
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prFlow.statuses}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedMetric === 'count' ? (
                  <Bar 
                    dataKey="count" 
                    name="Number of PRs" 
                    fill="#8884d8"
                  >
                    {prFlow.statuses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                    ))}
                  </Bar>
                ) : (
                  <Bar 
                    dataKey="avgTimeInStatus" 
                    name="Avg. Hours in Status" 
                    fill="#82ca9d"
                  >
                    {prFlow.statuses.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={prFlow.bottlenecks.includes(entry.name) ? '#ef4444' : '#82ca9d'} 
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* PR Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>PR Flow Efficiency</CardTitle>
          <CardDescription>
            Time spent in each status vs. ideal flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis 
                  type="category" 
                  dataKey="name" 
                  name="Status" 
                />
                <YAxis 
                  type="number" 
                  dataKey="avgTimeInStatus" 
                  name="Hours" 
                  unit="h"
                />
                <ZAxis 
                  type="number" 
                  dataKey="count" 
                  range={[50, 400]} 
                  name="Count" 
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter 
                  name="PR Status" 
                  data={prFlow.statuses} 
                  fill="#8884d8"
                >
                  {prFlow.statuses.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getStatusColor(entry.name)} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Bottleneck Analysis */}
      {prFlow.bottlenecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Bottlenecks</CardTitle>
            <CardDescription>
              Stages where PRs spend excessive time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prFlow.bottlenecks.map((bottleneck) => {
                const status = prFlow.statuses.find(s => s.name === bottleneck);
                if (!status) return null;
                
                return (
                  <div key={bottleneck} className="p-3 bg-red-50 rounded-md border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium text-red-800 dark:text-red-300">{bottleneck}</h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                          PRs spend an average of {Math.round(status.avgTimeInStatus)} hours in this status
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0 text-right">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs dark:bg-red-900 dark:text-red-200">
                          {status.count} PRs
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-red-800 dark:text-red-300">Recommendations:</h4>
                      <ul className="list-disc list-inside text-xs text-red-700 dark:text-red-400 mt-1">
                        {bottleneck === 'In Review' && (
                          <>
                            <li>Consider implementing a review rotation or dedicated review time</li>
                            <li>Set up automated reminders for PRs waiting for review</li>
                          </>
                        )}
                        {bottleneck === 'Changes Requested' && (
                          <>
                            <li>Improve initial PR quality through better guidelines or pre-PR checklists</li>
                            <li>Consider pair programming for complex changes</li>
                          </>
                        )}
                        {bottleneck === 'Open' && (
                          <>
                            <li>Encourage team members to pick up open PRs more quickly</li>
                            <li>Implement a PR assignment system</li>
                          </>
                        )}
                        {bottleneck === 'Draft' && (
                          <>
                            <li>Review your draft PR process to ensure drafts are being finalized in a timely manner</li>
                            <li>Consider breaking down large PRs into smaller, more manageable pieces</li>
                          </>
                        )}
                        <li>Set up SLAs for maximum time in each status</li>
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}