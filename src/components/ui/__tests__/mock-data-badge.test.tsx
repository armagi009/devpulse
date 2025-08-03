/**
 * Tests for the MockDataBadge component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import MockDataBadge from '../mock-data-badge';
import { AppMode } from '@/lib/types/roles';

// Mock the ModeContext
jest.mock('@/lib/context/ModeContext', () => ({
  useMode: jest.fn().mockImplementation(() => ({
    mode: AppMode.LIVE,
    isMockOrDemo: jest.fn().mockReturnValue(false)
  }))
}));

// Import the mocked hook
import { useMode } from '@/lib/context/ModeContext';

describe('MockDataBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children without badge when not in mock or demo mode', () => {
    // Mock the hook to return LIVE mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.LIVE,
      isMockOrDemo: jest.fn().mockReturnValue(false)
    });
    
    render(
      <MockDataBadge>
        <div data-testid="content">Test Content</div>
      </MockDataBadge>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByText('MOCK')).not.toBeInTheDocument();
    expect(screen.queryByText('DEMO')).not.toBeInTheDocument();
  });
  
  it('renders badge with MOCK text when in mock mode', () => {
    // Mock the hook to return MOCK mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.MOCK,
      isMockOrDemo: jest.fn().mockReturnValue(true)
    });
    
    render(
      <MockDataBadge>
        <div data-testid="content">Test Content</div>
      </MockDataBadge>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('MOCK')).toBeInTheDocument();
  });
  
  it('renders badge with DEMO text when in demo mode', () => {
    // Mock the hook to return DEMO mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.DEMO,
      isMockOrDemo: jest.fn().mockReturnValue(true)
    });
    
    render(
      <MockDataBadge>
        <div data-testid="content">Test Content</div>
      </MockDataBadge>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('DEMO')).toBeInTheDocument();
  });
  
  it('renders custom badge text when provided', () => {
    // Mock the hook to return MOCK mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.MOCK,
      isMockOrDemo: jest.fn().mockReturnValue(true)
    });
    
    render(
      <MockDataBadge badgeText="CUSTOM">
        <div data-testid="content">Test Content</div>
      </MockDataBadge>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('CUSTOM')).toBeInTheDocument();
  });
  
  it('does not render badge when showBadge is false', () => {
    // Mock the hook to return MOCK mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.MOCK,
      isMockOrDemo: jest.fn().mockReturnValue(true)
    });
    
    render(
      <MockDataBadge showBadge={false}>
        <div data-testid="content">Test Content</div>
      </MockDataBadge>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByText('MOCK')).not.toBeInTheDocument();
  });
});