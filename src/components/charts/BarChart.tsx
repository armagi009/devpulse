import React, { useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import BaseChart, { BaseChartProps } from './BaseChart';
import { useChartTheme } from './ChartThemeProvider';
import { useMediaQuery } from 'react-responsive';
import { announceToScreenReader } from '../ui/accessibility-utils';
import KeyboardNavigableChart from './KeyboardNavigableChart';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface BarChartProps extends BaseChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  options?: ChartOptions<'bar'>;
  showLegend?: boolean;
  horizontal?: boolean;
  stacked?: boolean;
  // Accessibility props
  enableKeyboardNavigation?: boolean;
  announceDataChanges?: boolean;
  textSummary?: string;
}

/**
 * BarChart component for categorical data visualization
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  options = {},
  showLegend = true,
  horizontal = false,
  stacked = false,
  // Accessibility props
  enableKeyboardNavigation = true,
  announceDataChanges = true,
  textSummary,
  ...baseProps
}) => {
  const theme = useChartTheme();
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Check if data is empty
  const isEmpty = useMemo(() => {
    return !data || !data.datasets || data.datasets.length === 0 || 
      data.datasets.every(dataset => !dataset.data || dataset.data.length === 0);
  }, [data]);
  
  // Generate accessibility data for screen readers
  const accessibilityData = useMemo(() => {
    if (isEmpty) return [];
    
    return data.labels.map((label, i) => {
      // For multiple datasets, create an entry for each dataset value
      if (data.datasets.length > 1) {
        return data.datasets.map(dataset => ({
          label,
          category: dataset.label,
          value: dataset.data[i]
        }));
      }
      
      // For single dataset, create one entry per label
      return {
        label,
        value: data.datasets[0].data[i],
        category: data.datasets[0].label
      };
    }).flat();
  }, [data, isEmpty]);
  
  // Generate text summary for screen readers
  const generatedTextSummary = useMemo(() => {
    if (isEmpty || !data) return '';
    
    // If user provided a summary, use that
    if (textSummary) return textSummary;
    
    // Otherwise generate a basic summary
    const datasetCount = data.datasets.length;
    const pointCount = data.labels.length;
    
    let summary = `Bar chart with ${pointCount} data points`;
    if (datasetCount > 1) {
      summary += ` across ${datasetCount} datasets`;
    }
    
    // Add information about the highest and lowest values
    if (datasetCount === 1 && pointCount > 0) {
      const values = data.datasets[0].data;
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const maxIndex = values.indexOf(maxValue);
      const minIndex = values.indexOf(minValue);
      
      summary += `. Highest value: ${maxValue} for ${data.labels[maxIndex]}. `;
      summary += `Lowest value: ${minValue} for ${data.labels[minIndex]}.`;
    }
    
    return summary;
  }, [data, isEmpty, textSummary]);
  
  // Configure chart options with theme and performance optimizations
  const chartOptions = useMemo<ChartOptions<'bar'>>(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: horizontal ? 'y' : 'x',
      interaction: {
        mode: 'index',
        intersect: false,
      },
      // Performance optimizations
      animation: {
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1000,
      },
      // Optimize rendering by limiting ticks
      scales: {
        x: {
          ticks: {
            maxTicksLimit: isMobile ? 6 : Math.min(12, data.labels ? Math.ceil(data.labels.length / 10) : 12),
            // Only show labels for every nth tick when there are many data points
            callback: function(val, index) {
              if (!data.labels) return val;
              const labelCount = data.labels.length;
              // Skip labels if there are too many
              if (labelCount > 20) {
                const skipFactor = Math.ceil(labelCount / (isMobile ? 6 : 12));
                return index % skipFactor === 0 ? this.getLabelForValue(val as number) : '';
              }
              return this.getLabelForValue(val as number);
            }
          },
        },
      },
      plugins: {
        legend: {
          display: showLegend && (data.datasets.length > 1 || !isMobile),
          position: 'top',
          labels: {
            color: theme.colors.text,
            font: {
              family: theme.fonts.base,
            },
            usePointStyle: true,
            boxWidth: 8,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: theme.colors.tooltip.background,
          titleColor: theme.colors.tooltip.text,
          bodyColor: theme.colors.tooltip.text,
          borderColor: theme.colors.tooltip.border,
          borderWidth: 1,
          padding: 12,
          cornerRadius: theme.borderRadius,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          callbacks: {
            // Add screen reader announcement when tooltip is shown
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              
              // Announce the data point to screen readers
              if (announceDataChanges) {
                const dataLabel = data.labels[context.dataIndex];
                const announcement = `${dataLabel}: ${context.parsed.y}${label ? ` (${context.dataset.label})` : ''}`;
                announceToScreenReader(announcement);
              }
              
              return label;
            }
          }
        },
      },
      scales: {
        x: {
          stacked: stacked,
          grid: {
            display: !horizontal,
            color: theme.colors.grid,
            drawBorder: false,
          },
          ticks: {
            color: theme.colors.text,
            font: {
              family: theme.fonts.base,
            },
            maxRotation: horizontal ? 0 : (isMobile ? 45 : 0),
            minRotation: horizontal ? 0 : (isMobile ? 45 : 0),
            autoSkip: true,
            maxTicksLimit: isMobile ? 6 : 12,
          },
        },
        y: {
          stacked: stacked,
          grid: {
            display: horizontal,
            color: theme.colors.grid,
            drawBorder: false,
          },
          ticks: {
            color: theme.colors.text,
            font: {
              family: theme.fonts.base,
            },
            padding: 8,
          },
          beginAtZero: true,
        },
      },
      animation: {
        duration: 1000,
      },
      ...options,
    };
  }, [theme, options, showLegend, horizontal, stacked, isMobile, data, announceDataChanges]);
  
  // Process chart data with theme colors
  const chartData = useMemo<ChartData<'bar'>>(() => {
    if (!data || !data.datasets) {
      return { labels: [], datasets: [] };
    }
    
    return {
      labels: data.labels || [],
      datasets: data.datasets.map((dataset, index) => {
        // Handle single color or array of colors
        const backgroundColor = dataset.backgroundColor || 
          (Array.isArray(dataset.data) && dataset.data.length > 1 && data.datasets.length === 1
            ? dataset.data.map((_, i) => theme.colors.primary[i % theme.colors.primary.length])
            : theme.colors.primary[index % theme.colors.primary.length]);
            
        const borderColor = dataset.borderColor || 
          (Array.isArray(backgroundColor) 
            ? backgroundColor.map(color => color) 
            : backgroundColor);
            
        return {
          ...dataset,
          backgroundColor,
          borderColor,
          borderWidth: dataset.borderWidth || 0,
          borderRadius: theme.borderRadius,
        };
      }),
    };
  }, [data, theme]);
  
  // Prepare keyboard navigation data
  const keyboardNavData = useMemo(() => {
    if (isEmpty || !data || !data.labels) return [];
    
    return data.labels.map((label, i) => {
      // For single dataset, create simple data points
      if (data.datasets.length === 1) {
        return {
          index: i,
          label,
          value: data.datasets[0].data[i],
          dataset: data.datasets[0].label
        };
      }
      
      // For multiple datasets, use the first dataset as the primary value
      return {
        index: i,
        label,
        value: data.datasets[0].data[i],
        dataset: data.datasets[0].label,
        additionalValues: data.datasets.slice(1).map(ds => ({
          label: ds.label,
          value: ds.data[i]
        }))
      };
    });
  }, [data, isEmpty]);
  
  // Handle keyboard navigation focus
  const handleDataPointFocus = (point: any) => {
    if (announceDataChanges) {
      let announcement = `${point.label}: ${point.value}`;
      if (point.dataset) {
        announcement += ` (${point.dataset})`;
      }
      if (point.additionalValues) {
        point.additionalValues.forEach((av: any) => {
          announcement += `. ${av.label}: ${av.value}`;
        });
      }
      announceToScreenReader(announcement);
    }
  };
  
  // Render the chart with accessibility features
  const renderChart = () => {
    const chart = <Bar data={chartData} options={chartOptions} />;
    
    if (enableKeyboardNavigation && !isEmpty) {
      return (
        <KeyboardNavigableChart
          data={keyboardNavData}
          chartRef={chartRef}
          onFocus={handleDataPointFocus}
          announceOnFocus={announceDataChanges}
        >
          <div ref={chartRef}>
            {chart}
          </div>
        </KeyboardNavigableChart>
      );
    }
    
    return chart;
  };
  
  return (
    <BaseChart 
      {...baseProps} 
      isEmpty={isEmpty}
      accessibilityData={accessibilityData}
      textSummary={generatedTextSummary}
      altText={`Bar chart ${horizontal ? 'horizontal' : 'vertical'}${stacked ? ', stacked' : ''}`}
    >
      {renderChart()}
    </BaseChart>
  );
};

export default BarChart;