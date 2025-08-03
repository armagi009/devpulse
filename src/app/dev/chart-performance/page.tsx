'use client';

/**
 * Chart Performance Demo Page
 * 
 * This page demonstrates the chart performance optimizations implemented in task #25.
 * It shows how to use virtualization, progressive loading, and other techniques
 * to improve chart rendering performance with large datasets.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  BarChart,
  ProgressiveChartLoader,
  SharedLegend,
  VirtualizedDataRenderer
} from '@/components/charts';
import { downsampleData, calculateOptimalDataPoints } from '@/lib/utils/chart-optimization';

export default function ChartPerformancePage() {
  const [largeDataset, setLargeDataset] = useState<any[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1000);
  
  // Generate large dataset on component mount
  useEffect(() => {
    // Generate 10,000 data points
    const data = Array.from({ length: 10000 }, (_, i) => {
      const x = i;
      // Create a sine wave with some noise
      const y = Math.sin(i / 100) * 50 + 50 + (Math.random() * 10 - 5);
      return { x, y, label: `Point ${i}` };
    });
    
    setLargeDataset(data);
    
    // Add window resize listener
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Calculate optimal number of points based on screen width
  const optimalPoints = calculateOptimalDataPoints(windowWidth, 5);
  
  // Downsample data for efficient rendering
  const downsampledData = downsampleData(largeDataset, optimalPoints);
  
  // Prepare data for charts
  const lineChartData = {
    labels: downsampledData.map(point => point.label),
    datasets: [
      {
        label: 'Optimized Dataset',
        data: downsampledData.map(point => point.y),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      }
    ]
  };
  
  // Prepare bar chart data (using fewer points for bars)
  const barChartData = {
    labels: downsampledData.slice(0, 50).map(point => point.label),
    datasets: [
      {
        label: 'Optimized Dataset',
        data: downsampledData.slice(0, 50).map(point => point.y),
        backgroundColor: '#3b82f6',
      }
    ]
  };
  
  // Shared legend items
  const legendItems = [
    { label: 'Optimized Dataset', color: '#3b82f6' },
    { label: 'Raw Dataset', color: '#ef4444' },
  ];
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Chart Performance Optimization</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Chart Rendering Optimizations</CardTitle>
            <CardDescription>
              Techniques used to improve chart rendering performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Virtualization for large datasets</li>
              <li>Progressive loading of chart data</li>
              <li>Efficient chart update mechanisms</li>
              <li>SVG rendering optimizations</li>
              <li>Data downsampling for large datasets</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Current optimization statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Original Data Points</p>
                <p className="text-2xl font-bold">{largeDataset.length.toLocaleString()}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Optimized Data Points</p>
                <p className="text-2xl font-bold">{downsampledData.length.toLocaleString()}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reduction Ratio</p>
                <p className="text-2xl font-bold">
                  {largeDataset.length > 0 
                    ? `${((1 - downsampledData.length / largeDataset.length) * 100).toFixed(1)}%` 
                    : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Shared legend for all charts */}
      <div className="mb-6">
        <SharedLegend items={legendItems} position="top" className="justify-center" />
      </div>
      
      {/* Line chart with progressive loading */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Progressive Loading Line Chart</CardTitle>
          <CardDescription>
            Chart loads data progressively to maintain responsiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressiveChartLoader
            data={lineChartData}
            initialChunkSize={100}
            chunkSize={500}
            renderChart={(data) => (
              <LineChart
                data={data}
                height={300}
                showLegend={false}
                smooth={true}
                fillArea={true}
                optimizeSvg={true}
              />
            )}
          />
        </CardContent>
      </Card>
      
      {/* Bar chart with deferred rendering */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Deferred Rendering Bar Chart</CardTitle>
          <CardDescription>
            Chart renders only when scrolled into view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            data={barChartData}
            height={300}
            showLegend={false}
            deferRender={true}
            optimizeSvg={true}
          />
        </CardContent>
      </Card>
      
      {/* Virtualized data visualization */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Virtualized Data Visualization</CardTitle>
          <CardDescription>
            Only renders data points currently visible in the viewport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] border rounded-md">
            <VirtualizedDataRenderer
              data={largeDataset}
              itemWidth={10}
              getItemKey={(item) => item.x}
              renderItem={(item) => (
                <div 
                  className="h-full w-2"
                  style={{
                    backgroundColor: '#3b82f6',
                    height: `${item.y}%`,
                    transform: 'translateY(-100%)',
                    position: 'absolute',
                    bottom: 0,
                  }}
                  title={`Value: ${item.y.toFixed(2)}`}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
          <CardDescription>
            How these optimizations were implemented
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Virtualization</h3>
              <p className="text-gray-700 dark:text-gray-300">
                The VirtualizedDataRenderer component only renders data points that are currently visible
                in the viewport, significantly reducing DOM size and improving performance for large datasets.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Progressive Loading</h3>
              <p className="text-gray-700 dark:text-gray-300">
                The ProgressiveChartLoader component loads and renders data in chunks, showing a meaningful
                visualization quickly while loading more data in the background.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Efficient Updates</h3>
              <p className="text-gray-700 dark:text-gray-300">
                The SharedLegend component reduces re-renders by centralizing legend state, while
                optimized chart components use memoization and selective updates.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">SVG Optimization</h3>
              <p className="text-gray-700 dark:text-gray-300">
                SVG rendering is optimized by setting appropriate attributes, disabling pointer events
                on non-interactive elements, and using CSS containment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}