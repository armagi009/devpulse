import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ChartAnnouncer } from '../ChartAnnouncer';
import * as accessibilityUtils from '../../ui/accessibility-utils';

// Mock the announceToScreenReader function
jest.mock('../../ui/accessibility-utils', () => ({
  ...jest.requireActual('../../ui/accessibility-utils'),
  announceToScreenReader: jest.fn(),
}));

describe('ChartAnnouncer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('announces chart title on initial render', () => {
    render(
      <ChartAnnouncer chartTitle="Test Chart" announcements={[]}>
        <div>Chart Content</div>
      </ChartAnnouncer>
    );
    
    expect(accessibilityUtils.announceToScreenReader).toHaveBeenCalledWith('Chart: Test Chart');
  });

  it('announces data changes when provided', () => {
    const previousData = [10, 20, 30];
    const currentData = [15, 25, 35];
    
    render(
      <ChartAnnouncer 
        chartTitle="Test Chart" 
        announcements={[]}
        dataChanges={{
          previous: previousData,
          current: currentData,
          description: 'Data has been updated with new values'
        }}
      >
        <div>Chart Content</div>
      </ChartAnnouncer>
    );
    
    expect(accessibilityUtils.announceToScreenReader).toHaveBeenCalledWith('Data has been updated with new values');
  });

  it('announces sequential announcements with interval', async () => {
    jest.useFakeTimers();
    
    const announcements = [
      'First announcement',
      'Second announcement',
      'Third announcement'
    ];
    
    render(
      <ChartAnnouncer 
        chartTitle="Test Chart" 
        announcements={announcements}
        interval={500}
      >
        <div>Chart Content</div>
      </ChartAnnouncer>
    );
    
    // Initial title announcement + first announcement
    expect(accessibilityUtils.announceToScreenReader).toHaveBeenCalledWith('Chart: Test Chart');
    expect(accessibilityUtils.announceToScreenReader).toHaveBeenCalledWith('First announcement');
    
    // Advance timers for second announcement
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(accessibilityUtils.announceToScreenReader).toHaveBeenCalledWith('Second announcement');
    
    // Advance timers for third announcement
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(accessibilityUtils.announceToScreenReader).toHaveBeenCalledWith('Third announcement');
    
    // No more announcements after all are done
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(accessibilityUtils.announceToScreenReader).toHaveBeenCalledTimes(4); // Title + 3 announcements
    
    jest.useRealTimers();
  });

  it('resets announcements when they change', () => {
    const { rerender } = render(
      <ChartAnnouncer 
        chartTitle="Test Chart" 
        announcements={['Initial announcement']}
      >
        <div>Chart Content</div>
      </ChartAnnouncer>
    );
    
    expect(accessibilityUtils.announceToScreenReader).toHaveBeenCalledWith('Chart: Test Chart');
    expect(accessibilityUtils.announceToScreenReader).toHaveBeenCalledWith('Initial announcement');
    
    // Reset mock to check new announcements
    jest.clearAllMocks();
    
    // Rerender with new announcements
    rerender(
      <ChartAnnouncer 
        chartTitle="Test Chart" 
        announcements={['New announcement']}
      >
        <div>Chart Content</div>
      </ChartAnnouncer>
    );
    
    expect(accessibilityUtils.announceToScreenReader).toHaveBeenCalledWith('New announcement');
  });

  it('renders children correctly', () => {
    render(
      <ChartAnnouncer chartTitle="Test Chart" announcements={[]}>
        <div data-testid="chart-content">Chart Content</div>
      </ChartAnnouncer>
    );
    
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    expect(screen.getByText('Chart Content')).toBeInTheDocument();
  });
});