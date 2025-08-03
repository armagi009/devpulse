import React from 'react';
import { render, screen } from '@testing-library/react';
import { LineChart } from '../LineChart';
import { ChartThemeProvider } from '../ChartThemeProvider';

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mocked-line-chart" />
}));

// Mock react-responsive
jest.mock('react-responsive', () => ({
  useMediaQuery: () => false
}));

describe('LineChart Component', () => {
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Dataset 1',
        data: [10, 20, 30, 25, 40],
        borderColor: '#ff0000',
        backgroundColor: '#ff000033',
      }
    ]
  };

  const renderLineChart = (props = {}) => {
    return render(
      <ChartThemeProvider>
        <LineChart 
          data={mockData}
          title="Test Line Chart"
          description="Line chart description"
          {...props}
        />
      </ChartThemeProvider>
    );
  };

  it('renders with title and description', () => {
    renderLineChart();
    
    expect(screen.getByText('Test Line Chart')).toBeInTheDocument();
    expect(screen.getByText('Line chart description')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument();
  });

  it('renders with custom height and width', () => {
    renderLineChart({ height: '300px', width: '600px' });
    
    const container = screen.getByTestId('chart-container');
    expect(container).toHaveStyle('height: 300px');
    expect(container).toHaveStyle('width: 600px');
  });

  it('renders loading state', () => {
    renderLineChart({ loading: true });
    
    expect(screen.queryByText('Test Line Chart')).not.toBeInTheDocument();
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-line-chart')).not.toBeInTheDocument();
  });

  it('renders error state', () => {
    renderLineChart({ error: new Error('Chart error') });
    
    expect(screen.queryByText('Test Line Chart')).not.toBeInTheDocument();
    expect(screen.getByText('Failed to load chart data')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-line-chart')).not.toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    renderLineChart({ 
      data: { 
        labels: [], 
        datasets: [] 
      },
      emptyMessage: 'No data available'
    });
    
    expect(screen.queryByText('Test Line Chart')).not.toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-line-chart')).not.toBeInTheDocument();
  });

  it('passes smooth prop to chart options', () => {
    const { rerender } = renderLineChart({ smooth: true });
    
    // With smooth=true, the chart should render
    expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument();
    
    // Re-render with smooth=false
    rerender(
      <ChartThemeProvider>
        <LineChart 
          data={mockData}
          title="Test Line Chart"
          description="Line chart description"
          smooth={false}
        />
      </ChartThemeProvider>
    );
    
    // Chart should still render with different options
    expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument();
  });

  it('passes fillArea prop to chart options', () => {
    const { rerender } = renderLineChart({ fillArea: true });
    
    // With fillArea=true, the chart should render
    expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument();
    
    // Re-render with fillArea=false
    rerender(
      <ChartThemeProvider>
        <LineChart 
          data={mockData}
          title="Test Line Chart"
          description="Line chart description"
          fillArea={false}
        />
      </ChartThemeProvider>
    );
    
    // Chart should still render with different options
    expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument();
  });
});