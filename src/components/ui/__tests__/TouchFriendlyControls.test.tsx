/**
 * Tests for TouchFriendlyControls component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  TouchFriendlyButton,
  TouchFriendlySelect,
  TouchFriendlyInput,
  TouchFriendlyCheckbox,
  TouchFriendlyToggle
} from '../TouchFriendlyControls';

// Mock touch interactions utility
vi.mock('@/lib/utils/touch-interactions', () => ({
  isTouchDevice: vi.fn().mockReturnValue(true),
  isTabletViewport: vi.fn().mockReturnValue(false),
  isMobileViewport: vi.fn().mockReturnValue(false),
  useTouchHandlers: vi.fn().mockReturnValue({
    onTouchStart: vi.fn(),
    onTouchMove: vi.fn(),
    onTouchEnd: vi.fn(),
  }),
  provideHapticFeedback: vi.fn(),
  useViewportType: vi.fn().mockReturnValue('tablet')
}));

describe('TouchFriendlyControls', () => {
  describe('TouchFriendlyButton', () => {
    it('should render with correct classes for touch devices', () => {
      render(<TouchFriendlyButton>Test Button</TouchFriendlyButton>);
      const button = screen.getByRole('button', { name: 'Test Button' });
      
      expect(button).toHaveClass('touch-target');
      expect(button).toBeInTheDocument();
    });
    
    it('should apply variant classes correctly', () => {
      render(<TouchFriendlyButton variant="secondary">Secondary Button</TouchFriendlyButton>);
      const button = screen.getByRole('button', { name: 'Secondary Button' });
      
      expect(button).toHaveClass('bg-gray-200');
    });
    
    it('should render with icon when provided', () => {
      render(
        <TouchFriendlyButton icon={<span data-testid="test-icon">Icon</span>}>
          Button with Icon
        </TouchFriendlyButton>
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });
  
  describe('TouchFriendlySelect', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' }
    ];
    
    it('should render with correct classes for touch devices', () => {
      render(<TouchFriendlySelect options={options} />);
      const select = screen.getByRole('combobox');
      
      expect(select).toHaveClass('touch-target');
      expect(select).toBeInTheDocument();
    });
    
    it('should render all options', () => {
      render(<TouchFriendlySelect options={options} />);
      const optionElements = screen.getAllByRole('option');
      
      expect(optionElements).toHaveLength(2);
      expect(optionElements[0]).toHaveValue('option1');
      expect(optionElements[1]).toHaveValue('option2');
    });
    
    it('should render label when provided', () => {
      render(<TouchFriendlySelect options={options} label="Test Label" />);
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
  });
  
  describe('TouchFriendlyInput', () => {
    it('should render with correct classes for touch devices', () => {
      render(<TouchFriendlyInput />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('touch-form-control');
      expect(input).toBeInTheDocument();
    });
    
    it('should render label when provided', () => {
      render(<TouchFriendlyInput label="Test Label" />);
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
    
    it('should render error message when provided', () => {
      render(<TouchFriendlyInput error="Error message" />);
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
    
    it('should render with icon when provided', () => {
      render(
        <TouchFriendlyInput icon={<span data-testid="test-icon">Icon</span>} />
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });
  
  describe('TouchFriendlyCheckbox', () => {
    it('should render with correct classes for touch devices', () => {
      render(<TouchFriendlyCheckbox label="Test Checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      
      expect(checkbox).toHaveClass('touch-checkbox');
      expect(checkbox).toBeInTheDocument();
    });
    
    it('should render label', () => {
      render(<TouchFriendlyCheckbox label="Test Checkbox" />);
      
      expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
    });
    
    it('should handle checked state', () => {
      render(<TouchFriendlyCheckbox label="Test Checkbox" defaultChecked />);
      const checkbox = screen.getByRole('checkbox');
      
      expect(checkbox).toBeChecked();
    });
  });
  
  describe('TouchFriendlyToggle', () => {
    it('should render with correct classes', () => {
      render(<TouchFriendlyToggle label="Test Toggle" />);
      
      expect(screen.getByText('Test Toggle')).toBeInTheDocument();
    });
    
    it('should handle checked state', () => {
      const onChange = vi.fn();
      render(<TouchFriendlyToggle label="Test Toggle" checked={true} onChange={onChange} />);
      
      const toggle = screen.getByRole('checkbox');
      expect(toggle).toBeChecked();
      
      fireEvent.click(toggle);
      expect(onChange).toHaveBeenCalled();
    });
  });
});