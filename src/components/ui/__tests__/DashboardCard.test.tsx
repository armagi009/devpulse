import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardCard from '../DashboardCard';

describe('DashboardCard', () => {
  it('renders children correctly', () => {
    render(
      <DashboardCard>
        <div data-testid="card-content">Card Content</div>
      </DashboardCard>
    );
    
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });
  
  it('renders title and subtitle', () => {
    render(
      <DashboardCard title="Test Title" subtitle="Test Subtitle">
        Content
      </DashboardCard>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });
  
  it('renders icon when provided', () => {
    const icon = <svg data-testid="test-icon" />;
    
    render(
      <DashboardCard title="Test Title" icon={icon}>
        Content
      </DashboardCard>
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
  
  it('renders actions when provided', () => {
    render(
      <DashboardCard 
        title="Test Title" 
        actions={<button data-testid="action-button">Action</button>}
      >
        Content
      </DashboardCard>
    );
    
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
  });
  
  it('renders footer when provided', () => {
    render(
      <DashboardCard 
        title="Test Title" 
        footer={<div data-testid="footer">Footer Content</div>}
      >
        Content
      </DashboardCard>
    );
    
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
  
  it('shows loading state when loading is true', () => {
    render(
      <DashboardCard loading={true}>
        Content
      </DashboardCard>
    );
    
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
  
  it('shows error state when error is provided', () => {
    render(
      <DashboardCard error="Test Error">
        Content
      </DashboardCard>
    );
    
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });
  
  it('toggles collapsed state when collapsible is true', () => {
    render(
      <DashboardCard title="Collapsible Card" collapsible={true}>
        <div data-testid="content">Collapsible Content</div>
      </DashboardCard>
    );
    
    // Content should be visible initially
    expect(screen.getByTestId('content')).toBeVisible();
    
    // Click the header to collapse
    fireEvent.click(screen.getByText('Collapsible Card'));
    
    // Content should have opacity-0 class when collapsed
    const contentContainer = screen.getByTestId('content').parentElement;
    expect(contentContainer).toHaveClass('opacity-0');
    expect(contentContainer).toHaveClass('max-h-0');
  });
  
  it('applies custom className to container', () => {
    const { container } = render(
      <DashboardCard className="test-class">
        Content
      </DashboardCard>
    );
    
    expect(container.firstChild).toHaveClass('test-class');
  });
  
  it('applies noPadding prop correctly', () => {
    render(
      <DashboardCard noPadding={true}>
        <div data-testid="content">No Padding Content</div>
      </DashboardCard>
    );
    
    const contentContainer = screen.getByTestId('content').parentElement;
    expect(contentContainer).not.toHaveClass('p-4');
  });
});