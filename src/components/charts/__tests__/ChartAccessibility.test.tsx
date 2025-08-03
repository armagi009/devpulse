import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChartAccessibility } from '../ChartAccessibility';

describe('ChartAccessibility Component', () => {
  const mockData = [
    { label: 'Jan', value: 10 },
    { label: 'Feb', value: 20 },
    { label: 'Mar', value: 30 },
    { label: 'Apr', value: 25 },
    { label: 'May', value: 40 },
  ];

  it('renders accessible table with data', () => {
    render(
      <ChartAccessibility
        chartType="line"
        title="Test Chart"
        description="Chart description"
        data={mockData}
      >
        <div data-testid="chart-content">Chart Content</div>
      </ChartAccessibility>
    );
    
    // Check that the table is rendered with sr-only class
    const table = screen.getByRole('table');
    expect(table).toHaveClass('sr-only');
    
    // Check that the table has correct aria-label
    expect(table).toHaveAttribute('aria-label', 'Test Chart data table');
    
    // Check that the caption contains the description
    const caption = screen.getByText('Chart description');
    expect(caption).toBeInTheDocument();
    
    // Check that all data points are in the table
    mockData.forEach(point => {
      expect(screen.getByText(point.label)).toBeInTheDocument();
      expect(screen.getByText(point.value.toString())).toBeInTheDocument();
    });
    
    // Check that the chart content is rendered
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('renders with categories when provided', () => {
    const dataWithCategories = [
      { label: 'Jan', value: 10, category: 'Sales' },
      { label: 'Feb', value: 20, category: 'Sales' },
      { label: 'Jan', value: 15, category: 'Revenue' },
      { label: 'Feb', value: 25, category: 'Revenue' },
    ];
    
    render(
      <ChartAccessibility
        chartType="bar"
        title="Test Chart"
        data={dataWithCategories}
      >
        <div>Chart Content</div>
      </ChartAccessibility>
    );
    
    // Check that the category column is rendered
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getAllByText('Sales').length).toBe(2);
    expect(screen.getAllByText('Revenue').length).toBe(2);
  });

  it('handles keyboard navigation', () => {
    const mockFocusHandler = jest.fn();
    
    render(
      <ChartAccessibility
        chartType="line"
        title="Test Chart"
        data={mockData}
        onDataPointFocus={mockFocusHandler}
      >
        <div>Chart Content</div>
      </ChartAccessibility>
    );
    
    // Get all focusable cells
    const cells = screen.getAllByRole('cell', { name: /Jan|Feb|Mar|Apr|May/ });
    
    // Focus the first cell
    cells[0].focus();
    
    // Navigate down with arrow key
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    expect(mockFocusHandler).toHaveBeenCalledWith(mockData[1], 1);
    
    // Navigate to end
    fireEvent.keyDown(document.activeElement as Element, { key: 'End' });
    expect(mockFocusHandler).toHaveBeenCalledWith(mockData[4], 4);
    
    // Navigate to home
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(mockFocusHandler).toHaveBeenCalledWith(mockData[0], 0);
  });

  it('includes summary and trend description when provided', () => {
    render(
      <ChartAccessibility
        chartType="line"
        title="Test Chart"
        data={mockData}
        summaryText="This chart shows monthly values"
        trendDescription="Values are increasing over time"
      >
        <div>Chart Content</div>
      </ChartAccessibility>
    );
    
    const caption = screen.getByText(/This chart shows monthly values/);
    expect(caption).toBeInTheDocument();
    expect(caption).toHaveTextContent('Values are increasing over time');
  });
});