'use client';

/**
 * TeamInsightsPanel Component
 * Displays AI-generated insights about team performance
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Insight } from '@/lib/types/analytics';

interface TeamInsightsPanelProps {
  repositoryId: string;
  startDate: Date;
  endDate: Date;
  observations: string[];
}

export default function TeamInsightsPanel({
  repositoryId,
  startDate,
  endDate,
  observations,
}: TeamInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch team insights
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(
          `/api/insights/team?repositoryId=${repositoryId}&startDate=${new Date(startDate).toISOString()}&endDate=${new Date(endDate).toISOString()}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to fetch team insights');
        }
        
        const data = await response.json();
        setInsights(data.data.insights || []);
      } catch (err) {
        console.error('Error fetching team insights:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, [repositoryId, startDate, endDate]);
  
  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Get confidence level text
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
          Team Insights
        </CardTitle>
        <CardDescription>AI-generated insights about your team's performance</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Observations */}
            <div>
              <h3 className="text-lg font-medium mb-2">Observations</h3>
              <ul className="space-y-2">
                {observations.map((observation, index) => (
                  <li key={index} className="flex">
                    <span className="text-amber-500 mr-2">•</span>
                    <span>{observation}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* AI Insights */}
            {insights.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">AI Insights</h3>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="productivity">Productivity</TabsTrigger>
                    <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <div className="space-y-4">
                      {insights.map((insight) => (
                        <InsightCard key={insight.id} insight={insight} />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="productivity">
                    <div className="space-y-4">
                      {insights
                        .filter((insight) => insight.type === 'productivity')
                        .map((insight) => (
                          <InsightCard key={insight.id} insight={insight} />
                        ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="collaboration">
                    <div className="space-y-4">
                      {insights
                        .filter((insight) => insight.type === 'collaboration')
                        .map((insight) => (
                          <InsightCard key={insight.id} insight={insight} />
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            
            {insights.length === 0 && !isLoading && !error && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No AI insights available for this period.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Insight Card Component
function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{insight.title}</h4>
        <div className="flex items-center space-x-2">
          {insight.trend === 'improving' && (
            <span className="text-green-500 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Improving
            </span>
          )}
          {insight.trend === 'declining' && (
            <span className="text-red-500 flex items-center">
              <TrendingDown className="h-4 w-4 mr-1" />
              Declining
            </span>
          )}
          {insight.trend === 'stable' && (
            <span className="text-blue-500 flex items-center">
              <Minus className="h-4 w-4 mr-1" />
              Stable
            </span>
          )}
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-3">{insight.description}</p>
      
      {/* Metrics */}
      {Object.keys(insight.metrics).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {Object.entries(insight.metrics).map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-gray-700 p-2 rounded">
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatMetricName(key)}</div>
              <div className="font-medium">{formatMetricValue(value)}</div>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Confidence: {getConfidenceText(insight.confidence)}
      </div>
    </div>
  );
}

// Helper functions
function formatMetricName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/([A-Z])\s([A-Z])/g, '$1$2');
}

function formatMetricValue(value: number): string {
  if (value >= 1) {
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  }
  if (value < 1 && value > 0) {
    return `${(value * 100).toFixed(0)}%`;
  }
  return value.toString();
}

function getConfidenceText(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
}