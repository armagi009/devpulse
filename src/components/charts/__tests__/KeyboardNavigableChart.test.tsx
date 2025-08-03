import React, { useRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { KeyboardNavigableChart } from '../KeyboardNavigableChart';

describe('KeyboardNavigableChart Component', () => {
  const mockData = [
    { index: 0, label: 'Jan', value: 10 },
    { index: 1, label: 'Feb', value: 20 },
    { index: 2, label: 'Mar', value: 30 },
    { index: 3, label: 'Apr', value: 25 },
    { index: 4, label: 'May', value: 40 },
  ];

  const TestComponent = ({ onFocus = jest.fn(), onBlur = jest.fn() }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    
    return (
      <KeyboardNavigableChart
        data={mockData}
        chartRef={chartRef}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <div ref={chartRef} data-testid="chart-element">
          Chart Content
        </div>
      </KeyboardNavigableChart>
    );
  };

  it('makes chart element focusable', () => {
    render(<TestComponent />);
    
    const chartElement = screen.getByTestId('chart-element');
    expect(chartElement).toHaveAttribute('tabindex', '0');
    expect(chartElement).toHaveAttribute('role', 'application');
    expect(chartElement).toHaveAttribute('aria-roledescription', 'interactive chart');
  });

  it('handles keyboard navigation with arrow keys', () => {
    const mockFocusHandler = jest.fn();
    render(<TestComponent onFocus={mockFocusHandler} />);
    
    const chartElement = screen.getByTestId('chart-element');
    
    // Focus the chart
    act(() => {
      chartElement.focus();
    });
    expect(mockFocusHandler).toHaveBeenCalledWith(mockData[0]);
    mockFocusHandler.mockClear();
    
    // Navigate with arrow right
    act(() => {
      fireEvent.keyDown(chartElement, { key: 'ArrowRight' });
    });
    expect(mockFocusHandler).toHaveBeenCalledWith(mockData[1]);
    mockFocusHandler.mockClear();
    
    // Navigate with arrow down (same behavior as right)
    act(() => {
      fireEvent.keyDown(chartElement, { key: 'ArrowDown' });
    });
    expect(mockFocusHandler).toHaveBeenCalledWith(mockData[2]);
    mockFocusHandler.mockClear();
    
    // Navigate to end
    act(() => {
      fireEvent.keyDown(chartElement, { key: 'End' });
    });
    expect(mockFocusHandler).toHaveBeenCalledWith(mockData[4]);
    mockFocusHandler.mockClear();
    
    // Navigate with arrow left
    act(() => {
      fireEvent.keyDown(chartElement, { key: 'ArrowLeft' });
    });
    expect(mockFocusHandler).toHaveBeenCalledWith(mockData[3]);
    mockFocusHandler.mockClear();
    
    // Navigate with arrow up (same behavior as left)
    act(() => {
      fireEvent.keyDown(chartElement, { key: 'ArrowUp' });
    });
    expect(mockFocusHandler).toHaveBeenCalledWith(mockData[2]);
    mockFocusHandler.mockClear();
    
    // Navigate to home
    act(() => {
      fireEvent.keyDown(chartElement, { key: 'Home' });
    });
    expect(mockFocusHandler).toHaveBeenCalledWith(mockData[0]);
  });

  it('calls onBlur when escape key is pressed', () => {
    const mockBlurHandler = jest.fn();
    render(<TestComponent onBlur={mockBlurHandler} />);
    
    const chartElement = screen.getByTestId('chart-element');
    
    // Focus the chart
    act(() => {
      chartElement.focus();
    });
    
    // Press escape
    act(() => {
      fireEvent.keyDown(chartElement, { key: 'Escape' });
    });
    expect(mockBlurHandler).toHaveBeenCalled();
  });

  it('calls onBlur when chart loses focus', () => {
    const mockBlurHandler = jest.fn();
    render(<TestComponent onBlur={mockBlurHandler} />);
    
    const chartElement = screen.getByTestId('chart-element');
    
    // Focus the chart
    act(() => {
      chartElement.focus();
    });
    
    // Blur the chart
    act(() => {
      chartElement.blur();
    });
    expect(mockBlurHandler).toHaveBeenCalled();
  });
});