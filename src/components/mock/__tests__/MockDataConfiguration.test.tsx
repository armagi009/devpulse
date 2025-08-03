/**
 * Tests for the MockDataConfiguration component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MockDataConfiguration from '../MockDataConfiguration';
import { ModeProvider } from '@/lib/context/ModeContext';
import { AppMode } from '@/lib/types/roles';
import * as mockDataStore from '@/lib/mock/mock-data-store';

// Mock the mock-data-store module
jest.mock('@/lib/mock/mock-data-store', () => ({
  resetMockData: jest.fn().mockResolvedValue({}),
  getMockData: jest.fn().mockResolvedValue({}),
}));

describe('MockDataConfiguration', () => {
  const mockOnDataSetUpdated = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the component with tabs', () => {
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <MockDataConfiguration dataSet="test-data-set" onDataSetUpdated={mockOnDataSetUpdated} />
      </ModeProvider>
    );
    
    expect(screen.getByText('Predefined Scenarios')).toBeInTheDocument();
    expect(screen.getByText('Custom Configuration')).toBeInTheDocument();
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
  });
  
  it('shows predefined scenarios by default', () => {
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <MockDataConfiguration dataSet="test-data-set" onDataSetUpdated={mockOnDataSetUpdated} />
      </ModeProvider>
    );
    
    expect(screen.getByText('Healthy Team')).toBeInTheDocument();
    expect(screen.getByText('Burnout Risk')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Silos')).toBeInTheDocument();
  });
  
  it('switches to custom configuration tab when clicked', () => {
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <MockDataConfiguration dataSet="test-data-set" onDataSetUpdated={mockOnDataSetUpdated} />
      </ModeProvider>
    );
    
    fireEvent.click(screen.getByText('Custom Configuration'));
    
    expect(screen.getByLabelText('Repositories')).toBeInTheDocument();
    expect(screen.getByLabelText('Users Per Repository')).toBeInTheDocument();
    expect(screen.getByLabelText('Time Range (Days)')).toBeInTheDocument();
  });
  
  it('switches to advanced settings tab when clicked', () => {
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <MockDataConfiguration dataSet="test-data-set" onDataSetUpdated={mockOnDataSetUpdated} />
      </ModeProvider>
    );
    
    fireEvent.click(screen.getByText('Advanced Settings'));
    
    expect(screen.getByLabelText('Error Simulation Rate (%)')).toBeInTheDocument();
    expect(screen.getByLabelText('Min Latency (ms)')).toBeInTheDocument();
    expect(screen.getByLabelText('Max Latency (ms)')).toBeInTheDocument();
  });
  
  it('selects a predefined scenario when clicked', () => {
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <MockDataConfiguration dataSet="test-data-set" onDataSetUpdated={mockOnDataSetUpdated} />
      </ModeProvider>
    );
    
    fireEvent.click(screen.getByText('Burnout Risk'));
    fireEvent.click(screen.getByText('Custom Configuration'));
    
    // Check that the custom options were updated with the scenario options
    const activityLevelSelect = screen.getByLabelText('Activity Level') as HTMLSelectElement;
    expect(activityLevelSelect.value).toBe('high');
  });
  
  it('generates mock data when form is submitted', async () => {
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <MockDataConfiguration dataSet="test-data-set" onDataSetUpdated={mockOnDataSetUpdated} />
      </ModeProvider>
    );
    
    fireEvent.click(screen.getByText('Generate Mock Data'));
    
    await waitFor(() => {
      expect(mockDataStore.resetMockData).toHaveBeenCalledWith('test-data-set', expect.any(Object));
      expect(mockOnDataSetUpdated).toHaveBeenCalled();
    });
  });
  
  it('shows error when no data set is selected', () => {
    render(
      <ModeProvider initialMode={AppMode.MOCK}>
        <MockDataConfiguration dataSet="" onDataSetUpdated={mockOnDataSetUpdated} />
      </ModeProvider>
    );
    
    fireEvent.click(screen.getByText('Generate Mock Data'));
    
    expect(screen.getByText('No data set selected')).toBeInTheDocument();
    expect(mockDataStore.resetMockData).not.toHaveBeenCalled();
  });
});