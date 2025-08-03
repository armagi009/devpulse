/**
 * BurnoutRiskScore Component
 * Displays burnout risk score with gauge visualization
 */

import React from 'react';

interface BurnoutRiskScoreProps {
  score: number;
  confidence: number;
  riskLevel: {
    text: string;
    color: string;
  };
}

export default function BurnoutRiskScore({ score, confidence, riskLevel }: BurnoutRiskScoreProps) {
  // Calculate gauge rotation based on score (0-100)
  const gaugeRotation = (score / 100) * 180;
  
  // Format confidence as percentage
  const confidencePercentage = Math.round(confidence * 100);

  return (
    <div className="flex flex-col items-center">
      {/* Gauge visualization */}
      <div className="relative w-48 h-24 mb-4">
        {/* Gauge background */}
        <div className="absolute w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full rounded-t-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
        
        {/* Gauge color sections */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full rounded-t-full overflow-hidden">
              <div className="absolute top-0 left-0 w-1/3 h-full bg-green-500"></div>
              <div className="absolute top-0 left-1/3 w-1/3 h-full bg-yellow-500"></div>
              <div className="absolute top-0 left-2/3 w-1/3 h-full bg-red-500"></div>
            </div>
          </div>
        </div>
        
        {/* Gauge needle */}
        <div 
          className="absolute top-0 left-1/2 w-1 h-24 bg-gray-800 dark:bg-white origin-bottom transform -translate-x-1/2"
          style={{ transform: `translateX(-50%) rotate(${gaugeRotation - 90}deg)` }}
        >
          <div className="absolute top-0 left-1/2 w-3 h-3 rounded-full bg-gray-800 dark:bg-white transform -translate-x-1/2"></div>
        </div>
        
        {/* Gauge center */}
        <div className="absolute bottom-0 left-1/2 w-4 h-4 rounded-full bg-gray-800 dark:bg-white transform -translate-x-1/2"></div>
      </div>
      
      {/* Score display */}
      <div className="text-center">
        <div className="text-4xl font-bold mb-1" className={riskLevel.color}>
          {score}
        </div>
        <div className={`text-sm font-medium mb-2 ${riskLevel.color}`}>
          {riskLevel.text}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Confidence: {confidencePercentage}%
        </div>
      </div>
    </div>
  );
}