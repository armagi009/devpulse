/**
 * BurnoutRecommendations Component
 * Displays recommendations to prevent burnout
 */

import React from 'react';

interface BurnoutRecommendationsProps {
  recommendations: string[];
}

export default function BurnoutRecommendations({ recommendations }: BurnoutRecommendationsProps) {
  // If no recommendations, show message
  if (recommendations.length === 0) {
    return (
      <div className="bg-gray-50 rounded-md p-4 dark:bg-gray-700/30">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No recommendations available. This could be due to insufficient data or low burnout risk.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation, index) => (
        <div 
          key={index} 
          className="bg-blue-50 rounded-md p-4 dark:bg-blue-900/20"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {recommendation}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}