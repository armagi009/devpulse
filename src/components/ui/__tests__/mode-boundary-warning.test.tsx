/**
 * Tests for the ModeBoundaryWarning component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModeBoundaryWarning from '../mode-boundary-warning';
import { ModeProvider } from '@/lib/context/ModeContext';
import { AppMode } from '@/lib/types/roles';

describe('ModeBoundaryWarning', () => {
  it('renders children without warning when not in mock or demo mode', () => {
    render(
      <ModeProvider initialMode={AppMode.LIVE}>
        <ModeBoundaryWarning actionType="save">
          <button data-testid="action-button">Save</button>
        </ModeBoundaryWarning>
      </ModeProvider>
    );
    
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('action-button'));
    expect(screen.queryByText('MOCK Mode Warning')).not.toBeInTheDocument();
    expect(screen.queryByText('DEMO Mode Warning')).not.toBeInTheDocument();
  });
  
  it('shows warning when clicking in mock mode', () => {
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <ModeBoundaryWarning actionType="save">
          <button data-testid="action-button">Save</button>
        </ModeBoundaryWarning>
      </ModeProvider>
    );
    
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('action-button'));
    expect(screen.getByText('MOCK Mode Warning')).toBeInTheDocument();
    expect(screen.getByText(/You are about to save data while in MOCK mode/)).toBeInTheDocument();
  });
  
  it('shows warning when clicking in demo mode', () => {
    render(
      <ModeProvider initialMode={AppMode.DEMO}>
        <ModeBoundaryWarning actionType="delete">
          <button data-testid="action-button">Delete</button>
        </ModeBoundaryWarning>
      </ModeProvider>
    );
    
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('action-button'));
    expect(screen.getByText('DEMO Mode Warning')).toBeInTheDocument();
    expect(screen.getByText(/You are about to delete data while in DEMO mode/)).toBeInTheDocument();
  });
  
  it('calls onProceed when proceeding', () => {
    const mockProceed = jest.fn();
    
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <ModeBoundaryWarning actionType="save" onProceed={mockProceed}>
          <button data-testid="action-button">Save</button>
        </ModeBoundaryWarning>
      </ModeProvider>
    );
    
    fireEvent.click(screen.getByTestId('action-button'));
    fireEvent.click(screen.getByText('Proceed Anyway'));
    
    expect(mockProceed).toHaveBeenCalledTimes(1);
  });
  
  it('calls onCancel when canceling', () => {
    const mockCancel = jest.fn();
    
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <ModeBoundaryWarning actionType="save" onCancel={mockCancel}>
          <button data-testid="action-button">Save</button>
        </ModeBoundaryWarning>
      </ModeProvider>
    );
    
    fireEvent.click(screen.getByTestId('action-button'));
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
  
  it('shows custom warning message when provided', () => {
    const customWarning = 'This is a custom warning message';
    
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <ModeBoundaryWarning actionType="save" customWarning={customWarning}>
          <button data-testid="action-button">Save</button>
        </ModeBoundaryWarning>
      </ModeProvider>
    );
    
    fireEvent.click(screen.getByTestId('action-button'));
    expect(screen.getByText(customWarning)).toBeInTheDocument();
  });
  
  it('does not show warning when disableWarning is true', () => {
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <ModeBoundaryWarning actionType="save" disableWarning={true}>
          <button data-testid="action-button">Save</button>
        </ModeBoundaryWarning>
      </ModeProvider>
    );
    
    fireEvent.click(screen.getByTestId('action-button'));
    expect(screen.queryByText('MOCK Mode Warning')).not.toBeInTheDocument();
  });
});