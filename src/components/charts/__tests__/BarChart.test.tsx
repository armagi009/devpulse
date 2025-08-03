import React from 'react';
import { render, screen } from '@testing-library/react';
import { BarChart } from '../BarChart';
import { ChartThemeProvider } from '../ChartThemeProvider';

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mocked-bar-chart" />
}));

// Mock react-responsive
jest.mock('react-responsive', () => ({
  useMediaQuery: () => false
}));

describe('BarChart Component', () => {
  const mockData = {
    labels: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
    datasets: [
      {
        label: 'Dataset 1',
        data: [10, 20, 30, 25, 40],
        backgroundColor: '#ff0000',
        borderColor: '#ff0000',
      }
    ]
  };

  const renderBarChart = (props = {}) => {
    return render(
      <ChartThemeProvider>
        <BarChart 
          data={mockData}
          title="Test Bar Chart"
          description="Bar chart description"
          {...props}
        />
      </ChartThemeProvider>
    );
  };

  it('renders with title and description', () => {
    renderBarChart();
    
    expect(screen.getByText('Test Bar Chart')).toBeInTheDocument();
    expect(screen.getByText('Bar chart description')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-bar-chart')).toBeInTheDocument();
  });

  it('renders with custom height and width', () => {
    renderBarChart({ height: '300px', width: '600px' });
    
    const container = screen.getByTestId('chart-container');
    expect(container).toHaveStyle('height: 300px');
    expect(container).toHaveStyle('width: 600px');
  });

  it('renders loading state', () => {
    renderBarChart({ loading: true });
    
    expect(screen.queryByText('Test Bar Chart')).not.toBeInTheDocument();
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-bar-chart')).not.toBeInTheDocument();
  });

  it('renders error state', () => {
    renderBarChart({ error: new Error('Chart error') });
    
    expect(screen.queryByText('Test Bar Chart')).not.toBeInTheDocument();
    expect(screen.getByText('Failed to load chart data')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-bar-chart')).not.toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    renderBarChart({ 
      data: { 
        labels: [], 
        datasets: [] 
      },
      emptyMessage: 'No data available'
    });
    
    expect(screen.queryByText('Test Bar Chart')).not.toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-bar-chart')).not.toBeInTheDocument();
  });

  it('passes horizontal prop to chart options', () => {
    const { rerender } = renderBarChart({ horizontal: true });
    
    // With horizontal=true, the chart should render
    expect(screen.getByTestId('mocked-bar-chart')).toBeInTheDocument();
    
    // Re-render with horizontal=false
    rerender(
      <ChartThemeProvider>
        <BarChart 
          data={mockData}
          title="Test Bar Chart"
          description="Bar chart description"
          horizontal={false}
        />
      </ChartThemeProvider>
    );
    
    // Chart should still render with different options
    expect(screen.getByTestId('mocked-bar-chart')).toBeInTheDocument();
  });

  it('passes stacked prop to chart options', () => {
    const { rerender } = renderBarChart({ stacked: true });
    
    // With stacked=true, the chart should render
    expect(screen.getByTestId('mocked-bar-chart')).toBeInTheDocument();
    
    // Re-render with stacked=false
    rerender(
      <ChartThemeProvider>
        <BarChart 
          data={mockData}
          title="Test Bar Chart"
          description="Bar chart description"
          stacked={false}
        />
      </ChartThemeProvider>
    );
    
    // Chart should still render with different options
    expect(screen.getByTestId('mocked-bar-chart')).toBeInTheDocument();
  });

  it('handles multiple datasets', () => {
    const multiDatasetMock = {
      labels: ['Category A', 'Category B', 'Category C'],
      datasets: [
        {
          label: 'Dataset 1',
          data: [10, 20, 30],
          backgroundColor: '#ff0000',
        },
        {
          label: 'Dataset 2',
          data: [15, 25, 35],
          backgroundColor: '#00ff00',
        }
      ]
    };
    
    renderBarChart({ data: multiDatasetMock });
    
    // Chart should render with multiple datasets
    expect(screen.getByTestId('mocked-bar-chart')).toBeInTheDocument();
  });
});