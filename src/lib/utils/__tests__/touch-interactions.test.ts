/**
 * Tests for touch-interactions utility
 */

import { getTouchFriendlyClass } from '../touch-interactions';

// Mock the module
jest.mock('../touch-interactions', () => {
  const actual = jest.requireActual('../touch-interactions');
  return {
    ...actual,
    isTouchDevice: jest.fn(),
    isTabletViewport: jest.fn(),
    isMobileViewport: jest.fn(),
    provideHapticFeedback: jest.fn(),
    useViewportType: jest.fn(),
    // Keep getTouchFriendlyClass as is since it doesn't use browser APIs
  };
});

describe('Touch Interactions Utility', () => {
  describe('getTouchFriendlyClass', () => {
    it('should add touch-target class to base class', () => {
      expect(getTouchFriendlyClass('base-class')).toBe('base-class touch-target');
    });
    
    it('should add touch-target-large class when large size is specified', () => {
      expect(getTouchFriendlyClass('base-class', 'large')).toBe('base-class touch-target-large');
    });
  });
});