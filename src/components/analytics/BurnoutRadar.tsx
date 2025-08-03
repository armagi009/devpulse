/**
 * BurnoutRadar Component
 * Displays burnout risk assessment with visualizations
 */

import React from 'react';
import { BurnoutRiskAssessment } from '@/lib/analytics/burnout-calculator';
import BurnoutRiskScore from './BurnoutRiskScore';
import BurnoutFactors from './BurnoutFactors';
import BurnoutTrend from './BurnoutTrend';
import BurnoutRecommendations from './BurnoutRecommendations';

interface BurnoutRadarProps {
  burnoutData: BurnoutRiskAssessment;
}

export default function BurnoutRadar({ burnoutData }: BurnoutRadarProps) {
  // Get risk level text and color
  const getRiskLevel = (score: number): { text: string; color: string } => {
    if (score < 30) {
      return { text: 'Low Risk', color: 'text-green-500' };
    } else if (score < 50) {
      return { text: 'Moderate Risk', color: 'text-yellow-500' };
    } else if (score < 70) {
      return { text: 'High Risk', color: 'text-orange-500' };
    } else {
      return { text: 'Very High Risk', color: 'text-red-500' };
    }
  };

  const riskLevel = getRiskLevel(burnoutData.riskScore);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Risk Score Card */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Risk Score</h2>
          <BurnoutRiskScore 
            score={burnoutData.riskScore} 
            confidence={burnoutData.confidence} 
            riskLevel={riskLevel}
          />
        </div>

        {/* Key Factors Card */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key Factors</h2>
          <BurnoutFactors factors={burnoutData.keyFactors} />
        </div>

        {/* Historical Trend Card */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 md:col-span-2 lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Historical Trend</h2>
          <BurnoutTrend trendData={burnoutData.historicalTrend} />
        </div>
      </div>

      {/* Recommendations Card */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recommendations</h2>
        <BurnoutRecommendations recommendations={burnoutData.recommendations} />
      </div>
    </div>
  );
}