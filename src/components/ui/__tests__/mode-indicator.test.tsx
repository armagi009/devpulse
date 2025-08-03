/**
 * Tests for the ModeIndicator component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModeIndicator from '../mode-indicator';
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

describe('ModeIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when not in mock or demo mode', () => {
    // Mock the hook to return LIVE mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.LIVE,
      isMockOrDemo: jest.fn().mockReturnValue(false)
    });
    
    render(<ModeIndicator />);
    
    expect(screen.queryByText('MOCK Mode')).not.toBeInTheDocument();
    expect(screen.queryByText('DEMO Mode')).not.toBeInTheDocument();
  });
  
  it('renders with MOCK Mode text when in mock mode', () => {
    // Mock the hook to return MOCK mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.MOCK,
      isMockOrDemo: jest.fn().mockReturnValue(true)
    });
    
    render(<ModeIndicator />);
    
    // Use a function to match text that might be split across elements
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('MOCK') || false;
    })).toBeInTheDocument();
    
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('Mode') || false;
    })).toBeInTheDocument();
  });
  
  it('renders with DEMO Mode text when in demo mode', () => {
    // Mock the hook to return DEMO mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.DEMO,
      isMockOrDemo: jest.fn().mockReturnValue(true)
    });
    
    render(<ModeIndicator />);
    
    // Use a function to match text that might be split across elements
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('DEMO') || false;
    })).toBeInTheDocument();
    
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('Mode') || false;
    })).toBeInTheDocument();
  });
  
  it('minimizes when minimize button is clicked', () => {
    // Mock the hook to return MOCK mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.MOCK,
      isMockOrDemo: jest.fn().mockReturnValue(true)
    });
    
    render(<ModeIndicator />);
    
    // Use a function to match text that might be split across elements
    const mockText = screen.getByText((content, element) => {
      return element?.textContent?.includes('MOCK') || false;
    });
    expect(mockText).toBeInTheDocument();
    
    // Click the minimize button
    fireEvent.click(screen.getByTitle('Minimize'));
    
    // Text should no longer be visible
    expect(screen.queryByText((content, element) => {
      return element?.textContent?.includes('MOCK') || false;
    })).not.toBeInTheDocument();
  });
  
  it('hides completely when hide button is clicked', () => {
    // Mock the hook to return MOCK mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.MOCK,
      isMockOrDemo: jest.fn().mockReturnValue(true)
    });
    
    render(<ModeIndicator />);
    
    // Use a function to match text that might be split across elements
    const mockText = screen.getByText((content, element) => {
      return element?.textContent?.includes('MOCK') || false;
    });
    expect(mockText).toBeInTheDocument();
    
    // Click the hide button
    fireEvent.click(screen.getByTitle('Hide'));
    
    // Indicator should no longer be in the document
    expect(screen.queryByText((content, element) => {
      return element?.textContent?.includes('MOCK') || false;
    })).not.toBeInTheDocument();
  });
  
  it('does not show label when showLabel is false', () => {
    // Mock the hook to return MOCK mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.MOCK,
      isMockOrDemo: jest.fn().mockReturnValue(true)
    });
    
    render(<ModeIndicator showLabel={false} />);
    
    // The component should still render but without the label
    expect(screen.queryByText('Mode')).not.toBeInTheDocument();
  });
});