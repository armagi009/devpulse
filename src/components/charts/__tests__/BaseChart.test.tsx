import React from 'react';
import { render, screen } from '@testing-library/react';
import { BaseChart } from '../BaseChart';

// Mock dependencies
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() })
}));

jest.mock('react-responsive', () => ({
  useMediaQuery: () => false
}));

jest.mock('@/lib/utils/chart-optimization', () => ({
  optimizeSvgRendering: jest.fn()
}));

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

// Mock accessibility utils
jest.mock('../../../components/ui/accessibility-utils', () => ({
  generateAccessibilityId: (prefix: string) => `${prefix}-test-id`
}));

describe('BaseChart Component', () => {
  it('renders with title and description', () => {
    render(
      <BaseChart 
        title="Test Chart" 
        description="This is a test chart"
      >
        <div data-testid="chart-content">Chart Content</div>
      </BaseChart>
    );
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
    expect(screen.getByText('This is a test chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });
  
  it('renders loading state', () => {
    render(
      <BaseChart 
        loading={true}
        title="Test Chart"
      >
        <div>Chart Content</div>
      </BaseChart>
    );
    
    expect(screen.queryByText('Test Chart')).not.toBeInTheDocument();
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
    
    // Check for accessibility attributes
    const loadingContainer = screen.getByTestId('chart-skeleton').parentElement;
    expect(loadingContainer).toHaveAttribute('aria-busy', 'true');
    expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
  });
  
  it('renders error state', () => {
    render(
      <BaseChart 
        error={new Error('Test error')}
        title="Test Chart"
      >
        <div>Chart Content</div>
      </BaseChart>
    );
    
    expect(screen.queryByText('Test Chart')).not.toBeInTheDocument();
    expect(screen.getByText('Failed to load chart data')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    
    // Check for accessibility attributes
    const errorContainer = screen.getByRole('button', { name: /retry/i }).closest('div');
    expect(errorContainer?.parentElement).toHaveAttribute('role', 'alert');
  });
  
  it('renders empty state', () => {
    const emptyMessage = 'No chart data available';
    render(
      <BaseChart 
        isEmpty={true}
        emptyMessage={emptyMessage}
        title="Test Chart"
      >
        <div>Chart Content</div>
      </BaseChart>
    );
    
    expect(screen.queryByText('Test Chart')).not.toBeInTheDocument();
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    
    // Check for accessibility attributes
    const emptyContainer = screen.getByText(emptyMessage).closest('div')?.parentElement;
    expect(emptyContainer).toHaveAttribute('role', 'region');
    expect(emptyContainer).toHaveAttribute('aria-label', `Test Chart - ${emptyMessage}`);
  });
  
  it('applies custom dimensions', () => {
    render(
      <BaseChart 
        height="400px"
        width="800px"
        title="Test Chart"
      >
        <div data-testid="chart-content">Chart Content</div>
      </BaseChart>
    );
    
    const container = screen.getByTestId('chart-container');
    expect(container).toHaveStyle('height: 400px');
    expect(container).toHaveStyle('width: 800px');
  });
  
  it('renders accessible table when accessibilityData is provided', () => {
    const accessibilityData = [
      { label: 'Jan', value: 10 },
      { label: 'Feb', value: 20 },
      { label: 'Mar', value: 30 }
    ];
    
    render(
      <BaseChart 
        title="Test Chart"
        accessibilityData={accessibilityData}
        textSummary="Chart showing monthly values"
      >
        <div data-testid="chart-content">Chart Content</div>
      </BaseChart>
    );
    
    // Table should be in the document but visually hidden
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(table.parentElement).toHaveClass('sr-only');
    
    // Check table caption
    expect(screen.getByText('Chart showing monthly values')).toBeInTheDocument();
    
    // Check table headers
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    
    // Check data rows
    accessibilityData.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
      expect(screen.getByText(item.value.toString())).toBeInTheDocument();
    });
  });
  
  it('sets proper ARIA attributes on chart content', () => {
    render(
      <BaseChart 
        title="Test Chart"
        description="This is a test chart"
        altText="Alternative text for chart"
        ariaLabelledBy="external-label"
        ariaDescribedBy="external-description"
      >
        <div data-testid="chart-content">Chart Content</div>
      </BaseChart>
    );
    
    const chartContent = screen.getByTestId('chart-content').parentElement;
    expect(chartContent).toHaveAttribute('role', 'img');
    
    // Check that aria-labelledby includes both title ID and external label
    const labelledBy = chartContent?.getAttribute('aria-labelledby') || '';
    expect(labelledBy).toContain('external-label');
    
    // Check that aria-describedby includes both description ID and external description
    const describedBy = chartContent?.getAttribute('aria-describedby') || '';
    expect(describedBy).toContain('external-description');
    
    // Alt text should not be used when title is present
    expect(chartContent).not.toHaveAttribute('aria-label', 'Alternative text for chart');
  });
  
  it('uses altText when title is not provided', () => {
    render(
      <BaseChart 
        altText="Alternative text for chart"
      >
        <div data-testid="chart-content">Chart Content</div>
      </BaseChart>
    );
    
    const chartContent = screen.getByTestId('chart-content').parentElement;
    expect(chartContent).toHaveAttribute('aria-label', 'Alternative text for chart');
  });
});