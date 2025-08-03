/**
 * Tests for MockDataWrapper component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import MockDataWrapper from '../MockDataWrapper';
import * as mockDataUtils from '../../../lib/mock/mock-data-utils';

// Mock dependencies
jest.mock('../../../lib/mock/mock-data-utils', () => ({
  isUsingMockData: jest.fn(),
  logMockDataUsage: jest.fn()
}));

describe('MockDataWrapper', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('renders children with mock data badge when using mock data', () => {
    // Mock isUsingMockData to return true
    (mockDataUtils.isUsingMockData as jest.Mock).mockReturnValue(true);
    
    render(
      <MockDataWrapper componentName="TestComponent">
        <div data-testid="test-content">Test Content</div>
      </MockDataWrapper>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(mockDataUtils.logMockDataUsage).toHaveBeenCalledWith('TestComponent');
  });

  it('renders children without mock data badge when not using mock data', () => {
    // Mock isUsingMockData to return false
    (mockDataUtils.isUsingMockData as jest.Mock).mockReturnValue(false);
    
    render(
      <MockDataWrapper componentName="TestComponent">
        <div data-testid="test-content">Test Content</div>
      </MockDataWrapper>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(mockDataUtils.logMockDataUsage).not.toHaveBeenCalled();
  });
});