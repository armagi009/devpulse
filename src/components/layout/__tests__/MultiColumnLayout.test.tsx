import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MultiColumnLayout from '../MultiColumnLayout';

// Mock window.innerWidth for testing responsive behavior
const mockWindowInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

describe('MultiColumnLayout', () => {
  beforeEach(() => {
    // Reset window.innerWidth to desktop size
    mockWindowInnerWidth(1200);
  });
  
  it('renders children correctly', () => {
    render(
      <MultiColumnLayout>
        <div data-testid="content">Main Content</div>
      </MultiColumnLayout>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
  
  it('renders sidebar when provided', () => {
    render(
      <MultiColumnLayout sidebar={<div data-testid="sidebar">Sidebar Content</div>}>
        <div>Main Content</div>
      </MultiColumnLayout>
    );
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });
  
  it('renders right panel when provided', () => {
    render(
      <MultiColumnLayout rightPanel={<div data-testid="right-panel">Right Panel Content</div>}>
        <div>Main Content</div>
      </MultiColumnLayout>
    );
    
    expect(screen.getByTestId('right-panel')).toBeInTheDocument();
  });
  
  it('applies custom className to container', () => {
    const { container } = render(
      <MultiColumnLayout className="test-class">
        <div>Main Content</div>
      </MultiColumnLayout>
    );
    
    expect(container.firstChild).toHaveClass('test-class');
  });
  
  it('applies custom className to content', () => {
    render(
      <MultiColumnLayout contentClassName="content-class">
        <div data-testid="content">Main Content</div>
      </MultiColumnLayout>
    );
    
    const contentContainer = screen.getByTestId('content').parentElement;
    expect(contentContainer).toHaveClass('content-class');
  });
  
  it('applies custom className to sidebar', () => {
    render(
      <MultiColumnLayout 
        sidebar={<div>Sidebar Content</div>}
        sidebarClassName="sidebar-class"
      >
        <div>Main Content</div>
      </MultiColumnLayout>
    );
    
    // Find the sidebar container
    const sidebarContainer = screen.getByText('Sidebar Content').closest('div');
    expect(sidebarContainer?.parentElement).toHaveClass('sidebar-class');
  });
  
  it('applies custom className to right panel', () => {
    render(
      <MultiColumnLayout 
        rightPanel={<div>Right Panel Content</div>}
        rightPanelClassName="right-panel-class"
      >
        <div>Main Content</div>
      </MultiColumnLayout>
    );
    
    // Find the right panel container
    const rightPanelContainer = screen.getByText('Right Panel Content').closest('div');
    expect(rightPanelContainer?.parentElement).toHaveClass('right-panel-class');
  });
  
  it('renders stacked layout on mobile', () => {
    // Set window.innerWidth to mobile size
    mockWindowInnerWidth(600);
    
    const { container } = render(
      <MultiColumnLayout 
        sidebar={<div data-testid="sidebar">Sidebar Content</div>}
        rightPanel={<div data-testid="right-panel">Right Panel Content</div>}
      >
        <div data-testid="content">Main Content</div>
      </MultiColumnLayout>
    );
    
    // Check that the container has flex-col class for stacked layout
    expect(container.firstChild).toHaveClass('flex-col');
    
    // Check that all three sections are rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('right-panel')).toBeInTheDocument();
  });
  
  it('toggles sidebar collapse when button is clicked', () => {
    render(
      <MultiColumnLayout 
        sidebar={<div data-testid="sidebar">Sidebar Content</div>}
        collapsible={true}
      >
        <div>Main Content</div>
      </MultiColumnLayout>
    );
    
    // Find the sidebar toggle button
    const toggleButton = screen.getByLabelText('Collapse sidebar');
    
    // Click the button to collapse sidebar
    fireEvent.click(toggleButton);
    
    // Check that the sidebar is now collapsed
    const sidebarContainer = screen.getByTestId('sidebar').closest('div');
    expect(sidebarContainer).toHaveClass('opacity-0');
  });
  
  it('toggles right panel collapse when button is clicked', () => {
    render(
      <MultiColumnLayout 
        rightPanel={<div data-testid="right-panel">Right Panel Content</div>}
        collapsible={true}
      >
        <div>Main Content</div>
      </MultiColumnLayout>
    );
    
    // Find the right panel toggle button
    const toggleButton = screen.getByLabelText('Collapse panel');
    
    // Click the button to collapse right panel
    fireEvent.click(toggleButton);
    
    // Check that the right panel is now collapsed
    const rightPanelContainer = screen.getByTestId('right-panel').closest('div');
    expect(rightPanelContainer).toHaveClass('opacity-0');
  });
});