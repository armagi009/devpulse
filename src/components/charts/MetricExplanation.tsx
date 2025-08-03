import React from 'react';
import ChartTooltip from './ChartTooltip';
import { cn } from '@/lib/utils';

export interface MetricDefinition {
  name: string;
  description: string;
  formula?: string;
  interpretation?: string;
  examples?: Array<{
    value: string | number;
    meaning: string;
  }>;
  relatedMetrics?: Array<{
    name: string;
    relationship: string;
  }>;
}

export interface MetricExplanationProps {
  metric: MetricDefinition;
  className?: string;
  iconOnly?: boolean;
  interactive?: boolean;
}

/**
 * MetricExplanation component for providing context about metrics
 */
export const MetricExplanation: React.FC<MetricExplanationProps> = ({
  metric,
  className = '',
  iconOnly = false,
  interactive = true,
}) => {
  // Render the tooltip content
  const renderTooltipContent = () => (
    <div className="metric-explanation">
      <p className="mb-2">{metric.description}</p>
      
      {metric.formula && (
        <div className="mb-2">
          <div className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
            Formula
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono text-xs">
            {metric.formula}
          </div>
        </div>
      )}
      
      {metric.interpretation && (
        <div className="mb-2">
          <div className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
            Interpretation
          </div>
          <p className="text-sm">{metric.interpretation}</p>
        </div>
      )}
      
      {metric.examples && metric.examples.length > 0 && (
        <div className="mb-2">
          <div className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
            Examples
          </div>
          <ul className="list-disc list-inside text-sm">
            {metric.examples.map((example, index) => (
              <li key={index}>
                <span className="font-medium">{example.value}</span>: {example.meaning}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {metric.relatedMetrics && metric.relatedMetrics.length > 0 && (
        <div>
          <div className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
            Related Metrics
          </div>
          <ul className="list-disc list-inside text-sm">
            {metric.relatedMetrics.map((related, index) => (
              <li key={index}>
                <span className="font-medium">{related.name}</span>: {related.relationship}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
  
  return (
    <ChartTooltip
      title={iconOnly ? metric.name : undefined}
      content={renderTooltipContent()}
      position="top"
      showIcon={iconOnly}
      interactive={interactive}
      maxWidth={400}
      className={className}
      data-testid="metric-explanation"
    >
      {iconOnly ? (
        <span className="inline-flex items-center justify-center w-5 h-5">
          <span className="sr-only">Info about {metric.name}</span>
        </span>
      ) : (
        <span className="inline-flex items-center">
          <span className="font-medium">{metric.name}</span>
        </span>
      )}
    </ChartTooltip>
  );
};

export default MetricExplanation;