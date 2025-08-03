/**
 * Tests for the ModeContext
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModeProvider, useMode } from '../ModeContext';
import { AppMode } from '@/lib/types/roles';

// Mock fetch for API calls
global.fetch = jest.fn();

// Test component that uses the mode context
function TestComponent() {
  const { mode, switchMode, isFeatureEnabled, isMockOrDemo } = useMode();
  
  return (
    <div>
      <div data-testid="current-mode">{mode}</div>
      <button 
        data-testid="switch-to-mock" 
        onClick={() => switchMode(AppMode.MOCK)}
      >
        Switch to Mock
      </button>
      <button 
        data-testid="switch-to-demo" 
        onClick={() => switchMode(AppMode.DEMO)}
      >
        Switch to Demo
      </button>
      <button 
        data-testid="switch-to-live" 
        onClick={() => switchMode(AppMode.LIVE)}
      >
        Switch to Live
      </button>
      <div data-testid="is-dashboard-enabled">
        {isFeatureEnabled('dashboard') ? 'Enabled' : 'Disabled'}
      </div>
      <div data-testid="is-mock-or-demo">
        {isMockOrDemo() ? 'Mock or Demo' : 'Live'}
      </div>
    </div>
  );
}

describe('ModeContext', () => {
  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
    
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true,
        appMode: {
          mode: AppMode.LIVE,
          mockDataSetId: null,
          errorSimulation: null,
          enabledFeatures: ['dashboard'],
        }
      }),
    });
  });
  
  it('provides the initial mode', () => {
    render(
      <ModeProvider initialMode={AppMode.LIVE}>
        <TestComponent />
      </ModeProvider>
    );
    
    expect(screen.getByTestId('current-mode')).toHaveTextContent(AppMode.LIVE);
    expect(screen.getByTestId('is-mock-or-demo')).toHaveTextContent('Live');
  });
  
  it('allows switching to mock mode', async () => {
    // Mock successful mode switch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true,
        appMode: {
          mode: AppMode.MOCK,
          mockDataSetId: 'test-mock-data',
          errorSimulation: { enabled: false, rate: 0 },
          enabledFeatures: ['dashboard'],
        }
      }),
    });
    
    render(
      <ModeProvider initialMode={AppMode.LIVE}>
        <TestComponent />
      </ModeProvider>
    );
    
    // Click the button to switch to mock mode
    fireEvent.click(screen.getByTestId('switch-to-mock'));
    
    // Wait for the mode to change
    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent(AppMode.MOCK);
      expect(screen.getByTestId('is-mock-or-demo')).toHaveTextContent('Mock or Demo');
    });
    
    // Verify that fetch was called with the correct arguments
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/app-mode', expect.objectContaining({
      method: 'PUT',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
      }),
      body: expect.any(String),
    }));
    
    // Verify the request body
    const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(requestBody).toEqual(expect.objectContaining({
      mode: AppMode.MOCK,
    }));
  });
  
  it('checks if features are enabled', () => {
    render(
      <ModeProvider initialMode={AppMode.LIVE} initialEnabledFeatures={['dashboard']}>
        <TestComponent />
      </ModeProvider>
    );
    
    expect(screen.getByTestId('is-dashboard-enabled')).toHaveTextContent('Enabled');
  });
  
  it('handles failed mode switches', async () => {
    // Mock failed mode switch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to switch mode' }),
    });
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ModeProvider initialMode={AppMode.LIVE}>
        <TestComponent />
      </ModeProvider>
    );
    
    // Click the button to switch to mock mode
    fireEvent.click(screen.getByTestId('switch-to-mock'));
    
    // Wait for the error to be logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // Mode should not have changed
    expect(screen.getByTestId('current-mode')).toHaveTextContent(AppMode.LIVE);
  });
});