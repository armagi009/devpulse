import React, { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface LineChartProps extends BaseChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
    }>;
  };
  options?: ChartOptions<'line'>;
  showLegend?: boolean;
  smooth?: boolean;
  fillArea?: boolean;
  // Accessibility props
  enableKeyboardNavigation?: boolean;
  announceDataChanges?: boolean;
  trendDescription?: string;
  textSummary?: string;
}

/**
 * LineChart component for time series data visualization
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  options = {},
  showLegend = true,
  smooth = true,
  fillArea = false,
  // Accessibility props
  enableKeyboardNavigation = true,
  announceDataChanges = true,
  trendDescription,
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
  
  // Generate trend description if not provided
  const generatedTrendDescription = useMemo(() => {
    if (trendDescription || isEmpty || !data || data.datasets.length === 0) return trendDescription || '';
    
    // Generate trend description for the first dataset
    const values = data.datasets[0].data;
    if (values.length < 2) return '';
    
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const percentChange = (change / Math.abs(firstValue)) * 100;
    
    if (change > 0) {
      return `Increasing trend with ${percentChange.toFixed(1)}% growth from ${firstValue} to ${lastValue}.`;
    } else if (change < 0) {
      return `Decreasing trend with ${Math.abs(percentChange).toFixed(1)}% decline from ${firstValue} to ${lastValue}.`;
    } else {
      return 'Stable trend with no significant change.';
    }
  }, [data, isEmpty, trendDescription]);
  
  // Generate text summary for screen readers
  const generatedTextSummary = useMemo(() => {
    if (isEmpty || !data) return '';
    
    // If user provided a summary, use that
    if (textSummary) return textSummary;
    
    // Otherwise generate a basic summary
    const datasetCount = data.datasets.length;
    const pointCount = data.labels.length;
    
    let summary = `Line chart with ${pointCount} data points`;
    if (datasetCount > 1) {
      summary += ` across ${datasetCount} datasets`;
    }
    
    // Add trend description if available
    if (generatedTrendDescription) {
      summary += `. ${generatedTrendDescription}`;
    }
    
    return summary;
  }, [data, isEmpty, textSummary, generatedTrendDescription]);
  
  // Configure chart options with theme and performance optimizations
  const chartOptions = useMemo<ChartOptions<'line'>>(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      // Performance optimizations
      animation: {
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1000,
      },
      elements: {
        point: {
          // Only show points when there are few data points or on hover
          radius: data.labels && data.labels.length > 100 ? 0 : 3,
          hoverRadius: 5,
        },
      },
      // Optimize rendering by limiting ticks
      scales: {
        x: {
          ticks: {
            maxTicksLimit: isMobile ? 6 : Math.min(12, data.labels ? Math.ceil(data.labels.length / 10) : 12),
            major: {
              enabled: true
            },
            // Only show labels for every nth tick when there are many data points
            callback: function(val, index) {
              if (!data.labels) return val;
              const labelCount = data.labels.length;
              const skipFactor = Math.ceil(labelCount / (isMobile ? 6 : 12));
              return index % skipFactor === 0 ? this.getLabelForValue(val as number) : '';
            }
          },
        },
      },
      plugins: {
        legend: {
          display: showLegend && !isMobile,
          position: 'top',
          labels: {
            color: theme.colors.text,
            font: {
              family: theme.fonts.base,
            },
            usePointStyle: true,
            boxWidth: 6,
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
            // Format tooltip values and announce to screen readers
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
          grid: {
            color: theme.colors.grid,
            drawBorder: false,
            tickLength: 8,
          },
          ticks: {
            color: theme.colors.text,
            font: {
              family: theme.fonts.base,
            },
            maxRotation: isMobile ? 45 : 0,
            minRotation: isMobile ? 45 : 0,
            autoSkip: true,
            maxTicksLimit: isMobile ? 6 : 12,
          },
        },
        y: {
          grid: {
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
      elements: {
        line: {
          tension: smooth ? 0.4 : 0, // Smooth lines if enabled
          borderWidth: 2,
        },
        point: {
          radius: 3,
          hoverRadius: 5,
          hitRadius: 30,
          borderWidth: 2,
        },
      },
      animation: {
        duration: 1000,
      },
      ...options,
    };
  }, [theme, options, showLegend, smooth, isMobile, data, announceDataChanges]);
  
  // Process chart data with theme colors
  const chartData = useMemo<ChartData<'line'>>(() => {
    if (!data || !data.datasets) {
      return { labels: [], datasets: [] };
    }
    
    return {
      labels: data.labels || [],
      datasets: data.datasets.map((dataset, index) => ({
        ...dataset,
        borderColor: dataset.borderColor || theme.colors.primary[index % theme.colors.primary.length],
        backgroundColor: dataset.backgroundColor || 
          (fillArea ? `${theme.colors.primary[index % theme.colors.primary.length]}33` : // 20% opacity
          theme.colors.primary[index % theme.colors.primary.length]),
        fill: fillArea,
        pointBackgroundColor: theme.colors.background,
      })),
    };
  }, [data, theme, fillArea]);
  
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
    const chart = <Line data={chartData} options={chartOptions} />;
    
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
      altText={`Line chart${smooth ? ' with smooth lines' : ''}${fillArea ? ' and filled areas' : ''}`}
    >
      {renderChart()}
    </BaseChart>
  );
};

export default LineChart;