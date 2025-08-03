/**
 * BurnoutFactors Component
 * Displays key factors contributing to burnout risk
 */

import React from 'react';
import { BurnoutFactor } from '@/lib/analytics/burnout-calculator';

interface BurnoutFactorsProps {
  factors: BurnoutFactor[];
}

export default function BurnoutFactors({ factors }: BurnoutFactorsProps) {
  // Get impact color based on impact value
  const getImpactColor = (impact: number): string => {
    if (impact < 0.3) {
      return 'bg-green-500';
    } else if (impact < 0.6) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  };

  // Handle undefined factors
  if (!factors) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No key factors available. This could be due to insufficient data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {factors.map((factor, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {factor.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(factor.impact * 100)}%
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className={`h-2 rounded-full ${getImpactColor(factor.impact)}`}
              style={{ width: `${factor.impact * 100}%` }}
            ></div>
          </div>
          
          {/* Description */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {factor.description}
          </p>
        </div>
      ))}
      
      {factors.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No key factors available. This could be due to insufficient data.
        </p>
      )}
    </div>
  );
}