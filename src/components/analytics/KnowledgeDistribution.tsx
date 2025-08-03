'use client';

/**
 * KnowledgeDistribution Component
 * Displays how code knowledge is distributed across the team
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
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { KnowledgeDistribution as KnowledgeDistributionType } from '@/lib/types/analytics';

interface KnowledgeDistributionProps {
  knowledge: KnowledgeDistributionType;
}

export default function KnowledgeDistribution({ knowledge }: KnowledgeDistributionProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];
  
  // Get selected file data
  const selectedFileData = selectedFile
    ? knowledge.fileOwnership.find(file => file.filename === selectedFile)
    : null;
  
  // Format file ownership data for chart
  const fileOwnershipData = knowledge.fileOwnership
    .slice(0, 10) // Show top 10 files
    .map(file => ({
      name: file.filename.substring(0, 15) + (file.filename.length > 15 ? '...' : ''),
      fullName: file.filename,
      owner: file.owner,
      percentage: Math.round(file.ownershipPercentage * 100),
    }));
  
  // Format risk areas for chart
  const riskData = knowledge.riskAreas.map(risk => ({
    name: risk.area,
    value: Math.round(risk.riskLevel * 100),
    description: risk.description,
  }));
  
  // Calculate bus factor
  const busFactor = calculateBusFactor(knowledge);
  
  // Colors for risk levels
  const getRiskColor = (value: number) => {
    if (value > 70) return '#ef4444'; // High risk - red
    if (value > 40) return '#f59e0b'; // Medium risk - amber
    return '#10b981'; // Low risk - green
  };
  
  return (
    <div className="space-y-6">
      {/* Knowledge Score and Bus Factor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Knowledge Sharing Score
              </div>
              <div className="text-3xl font-bold mt-1">
                {knowledge.knowledgeSharingScore}/100
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Higher is better - indicates well-distributed knowledge
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-gray-700">
                <div 
                  className={`h-2.5 rounded-full ${
                    knowledge.knowledgeSharingScore > 70 ? 'bg-green-500' : 
                    knowledge.knowledgeSharingScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${knowledge.knowledgeSharingScore}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Bus Factor
              </div>
              <div className="text-3xl font-bold mt-1">
                {busFactor}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Number of developers who can be "hit by a bus" before the project is in trouble
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-gray-700">
                <div 
                  className={`h-2.5 rounded-full ${
                    busFactor > 3 ? 'bg-green-500' : 
                    busFactor > 1 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, busFactor * 20)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Risk Areas Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Risk Areas</CardTitle>
          <CardDescription>
            Areas of potential knowledge silos or bus factor risks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={riskData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Risk Level"
                  dataKey="value"
                  stroke="#ff7300"
                  fill="#ff7300"
                  fillOpacity={0.6}
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Risk Level']} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* File Ownership Chart */}
      <Card>
        <CardHeader>
          <CardTitle>File Ownership</CardTitle>
          <CardDescription>
            Primary owners of key files (click on a bar to see details)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={fileOwnershipData} 
                layout="vertical"
                onClick={(data) => {
                  if (data && data.activePayload) {
                    setSelectedFile(data.activePayload[0].payload.fullName);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip 
                  formatter={(value, name, props) => [`${value}%`, `Ownership`]}
                  labelFormatter={(label) => `File: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="percentage" 
                  name="Ownership %" 
                  fill="#3b82f6"
                  cursor="pointer"
                >
                  {fileOwnershipData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.percentage > 80 ? '#ef4444' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Selected File Details */}
      {selectedFileData && (
        <Card>
          <CardHeader>
            <CardTitle>File Details: {selectedFileData.filename}</CardTitle>
            <CardDescription>
              Knowledge distribution for this file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Contributors</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={selectedFileData.contributors}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="contributionPercentage"
                        nameKey="username"
                        label={({ username, contributionPercentage }) => 
                          `${username}: ${(contributionPercentage * 100).toFixed(0)}%`
                        }
                      >
                        {selectedFileData.contributors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(0)}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Risk Assessment</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Primary Owner</span>
                      <span>{selectedFileData.owner}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Ownership Percentage</span>
                      <span>{(selectedFileData.ownershipPercentage * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Number of Contributors</span>
                      <span>{selectedFileData.contributors.length}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Knowledge Silo Risk</span>
                      <span className={`px-2 py-1 rounded text-white ${
                        selectedFileData.ownershipPercentage > 0.8 ? 'bg-red-500' : 
                        selectedFileData.ownershipPercentage > 0.6 ? 'bg-amber-500' : 'bg-green-500'
                      }`}>
                        {selectedFileData.ownershipPercentage > 0.8 ? 'High' : 
                         selectedFileData.ownershipPercentage > 0.6 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Knowledge Distribution Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Distribution Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {generateKnowledgeInsights(knowledge, busFactor)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Calculate bus factor based on knowledge distribution
 */
function calculateBusFactor(knowledge: KnowledgeDistributionType): number {
  // Count files with multiple contributors
  const filesWithMultipleContributors = knowledge.fileOwnership.filter(
    file => file.contributors.length > 1 && file.ownershipPercentage < 0.8
  ).length;
  
  // Calculate percentage of files with multiple contributors
  const percentageWithMultipleContributors = 
    filesWithMultipleContributors / Math.max(1, knowledge.fileOwnership.length);
  
  // Calculate bus factor based on percentage
  // This is a simplified calculation - in reality, bus factor would be more complex
  if (percentageWithMultipleContributors > 0.8) return 4; // Excellent distribution
  if (percentageWithMultipleContributors > 0.6) return 3; // Good distribution
  if (percentageWithMultipleContributors > 0.4) return 2; // Fair distribution
  if (percentageWithMultipleContributors > 0.2) return 1; // Poor distribution
  return 1; // Minimum bus factor is 1
}

/**
 * Generate insights based on knowledge distribution
 */
function generateKnowledgeInsights(
  knowledge: KnowledgeDistributionType, 
  busFactor: number
): JSX.Element[] {
  const insights: JSX.Element[] = [];
  
  // Bus factor insight
  if (busFactor <= 1) {
    insights.push(
      <div key="low-bus-factor" className="p-3 bg-red-50 rounded-md border border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <p className="text-red-800 dark:text-red-300">
          <span className="font-semibold">Critical Bus Factor Risk:</span> Your team has a bus factor of only {busFactor}, indicating that knowledge is concentrated in very few individuals. This poses a significant risk to project continuity.
        </p>
      </div>
    );
  } else if (busFactor >= 4) {
    insights.push(
      <div key="high-bus-factor" className="p-3 bg-green-50 rounded-md border border-green-200 dark:bg-green-900/20 dark:border-green-800">
        <p className="text-green-800 dark:text-green-300">
          <span className="font-semibold">Excellent Knowledge Distribution:</span> Your team has a healthy bus factor of {busFactor}, indicating that knowledge is well-distributed across multiple team members.
        </p>
      </div>
    );
  }
  
  // Knowledge silos insight
  const silosRisk = knowledge.riskAreas.find(risk => risk.area === 'Knowledge Silos');
  if (silosRisk && silosRisk.riskLevel > 0.7) {
    insights.push(
      <div key="knowledge-silos" className="p-3 bg-amber-50 rounded-md border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <p className="text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Knowledge Silos Detected:</span> {silosRisk.description}. Consider implementing pair programming or code reviews to spread knowledge.
        </p>
      </div>
    );
  }
  
  // Overall knowledge sharing score insight
  if (knowledge.knowledgeSharingScore < 50) {
    insights.push(
      <div key="low-sharing-score" className="p-3 bg-amber-50 rounded-md border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <p className="text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Low Knowledge Sharing:</span> Your team's knowledge sharing score of {knowledge.knowledgeSharingScore}/100 indicates that knowledge is not well-distributed. Consider implementing knowledge sharing sessions or documentation initiatives.
        </p>
      </div>
    );
  } else if (knowledge.knowledgeSharingScore > 80) {
    insights.push(
      <div key="high-sharing-score" className="p-3 bg-green-50 rounded-md border border-green-200 dark:bg-green-900/20 dark:border-green-800">
        <p className="text-green-800 dark:text-green-300">
          <span className="font-semibold">Excellent Knowledge Sharing:</span> Your team's knowledge sharing score of {knowledge.knowledgeSharingScore}/100 indicates that knowledge is well-distributed across the team.
        </p>
      </div>
    );
  }
  
  // If no insights, add a general one
  if (insights.length === 0) {
    insights.push(
      <div key="general" className="p-3 bg-blue-50 rounded-md border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <p className="text-blue-800 dark:text-blue-300">
          <span className="font-semibold">Balanced Knowledge Distribution:</span> Your team shows a balanced knowledge distribution pattern. Continue monitoring for any changes in knowledge sharing dynamics.
        </p>
      </div>
    );
  }
  
  return insights;
}