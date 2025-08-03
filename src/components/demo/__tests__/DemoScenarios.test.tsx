/**
 * Tests for the DemoScenarios component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DemoScenarios from '../DemoScenarios';
import { AppMode } from '@/lib/types/roles';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the ModeContext
jest.mock('@/lib/context/ModeContext', () => {
  const originalModule = jest.requireActual('@/lib/context/ModeContext');
  
  return {
    ...originalModule,
    useMode: jest.fn(),
    ModeProvider: ({ children }) => children,
  };
});

// Import the mocked hook
import { useMode } from '@/lib/context/ModeContext';

describe('DemoScenarios', () => {
  const mockOnScenarioSelect = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to LIVE mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.LIVE,
      setMode: jest.fn()
    });
  });
  
  it('renders the component with scenario list', () => {
    render(<DemoScenarios onScenarioSelect={mockOnScenarioSelect} />);
    
    expect(screen.getByText('Select a Demo Scenario')).toBeInTheDocument();
    expect(screen.getByText('Developer Productivity Overview')).toBeInTheDocument();
    expect(screen.getByText('Team Lead Dashboard Tour')).toBeInTheDocument();
    expect(screen.getByText('Administrator Features')).toBeInTheDocument();
  });
  
  it('shows scenario details when a scenario is selected', () => {
    render(<DemoScenarios onScenarioSelect={mockOnScenarioSelect} />);
    
    fireEvent.click(screen.getByText('Developer Productivity Overview'));
    
    expect(screen.getByText('Demo Information')).toBeInTheDocument();
    expect(screen.getByText('Demo Steps')).toBeInTheDocument();
    expect(screen.getByText('Developer Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Start Demo')).toBeInTheDocument();
  });
  
  it('calls onScenarioSelect when a scenario is selected', () => {
    render(<DemoScenarios onScenarioSelect={mockOnScenarioSelect} />);
    
    fireEvent.click(screen.getByText('Developer Productivity Overview'));
    
    expect(mockOnScenarioSelect).toHaveBeenCalledTimes(1);
    expect(mockOnScenarioSelect).toHaveBeenCalledWith(expect.objectContaining({
      id: 'developer-productivity',
      name: 'Developer Productivity Overview',
    }));
  });
  
  it('returns to scenario list when back button is clicked', () => {
    render(<DemoScenarios onScenarioSelect={mockOnScenarioSelect} />);
    
    fireEvent.click(screen.getByText('Developer Productivity Overview'));
    fireEvent.click(screen.getByText('Back to Scenarios'));
    
    expect(screen.getByText('Select a Demo Scenario')).toBeInTheDocument();
  });
  
  it('shows demo controls when in demo mode', () => {
    // Mock the hook to return DEMO mode
    (useMode as jest.Mock).mockReturnValue({ 
      mode: AppMode.DEMO,
      setMode: jest.fn()
    });
    
    render(<DemoScenarios onScenarioSelect={mockOnScenarioSelect} />);
    
    // In demo mode, the component should show "Cancel" button instead of "End Demo"
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});