import React from 'react';
import { render, screen } from '@testing-library/react';
import ResponsiveText from '../ResponsiveText';

// Mock the responsive-typography utilities
jest.mock('@/lib/styles/responsive-typography', () => ({
  applyTextStyle: jest.fn().mockReturnValue({ fontSize: '1rem' }),
  createTextStyle: jest.fn().mockReturnValue({ fontSize: '1.25rem', fontWeight: '600' }),
  createContainerQueryTextStyle: jest.fn().mockReturnValue({ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }),
  fontSizes: {
    heading: { h1: '2rem', h2: '1.5rem' },
    body: { base: '1rem', large: '1.25rem' },
    display: { large: '3rem', medium: '2.5rem' },
    fluid: { base: 'clamp(1rem, 2vw, 1.5rem)', lg: 'clamp(1.25rem, 3vw, 2rem)' }
  }
}));

describe('ResponsiveText Component', () => {
  it('renders with default props', () => {
    render(<ResponsiveText>Test Text</ResponsiveText>);
    
    const textElement = screen.getByText('Test Text');
    expect(textElement.tagName).toBe('P'); // Default element is p
    expect(textElement).toHaveClass('responsive-text');
    expect(textElement).toHaveStyle('font-size: 1rem');
  });

  it('renders with custom element type', () => {
    render(<ResponsiveText as="h1">Heading Text</ResponsiveText>);
    
    const headingElement = screen.getByText('Heading Text');
    expect(headingElement.tagName).toBe('H1');
  });

  it('renders with custom variant', () => {
    render(<ResponsiveText variant="h1">Large Heading</ResponsiveText>);
    
    const headingElement = screen.getByText('Large Heading');
    expect(headingElement).toHaveStyle('font-size: 1rem'); // Mock returns 1rem
  });

  it('applies custom className', () => {
    render(<ResponsiveText className="custom-class">Custom Class Text</ResponsiveText>);
    
    const textElement = screen.getByText('Custom Class Text');
    expect(textElement).toHaveClass('responsive-text');
    expect(textElement).toHaveClass('custom-class');
  });

  it('applies custom text style with weight and lineHeight', () => {
    render(
      <ResponsiveText 
        variant="bodyLarge" 
        weight="semibold" 
        lineHeight="tight"
      >
        Custom Style Text
      </ResponsiveText>
    );
    
    const textElement = screen.getByText('Custom Style Text');
    expect(textElement).toHaveStyle('font-size: 1.25rem');
    expect(textElement).toHaveStyle('font-weight: 600');
  });

  it('applies container query styles when containerQuery is true', () => {
    render(
      <ResponsiveText 
        containerQuery={true}
        containerSize="large"
        containerType="heading"
      >
        Container Query Text
      </ResponsiveText>
    );
    
    const textElement = screen.getByText('Container Query Text');
    expect(textElement).toHaveStyle('font-size: clamp(1rem, 2vw, 1.5rem)');
  });

  it('renders with display variant', () => {
    render(<ResponsiveText variant="displayLarge">Display Text</ResponsiveText>);
    
    const textElement = screen.getByText('Display Text');
    expect(textElement).toHaveStyle('font-size: 1rem'); // Mock returns 1rem
  });

  it('renders with fluid variant', () => {
    render(<ResponsiveText variant="fluidLg">Fluid Text</ResponsiveText>);
    
    const textElement = screen.getByText('Fluid Text');
    expect(textElement).toHaveStyle('font-size: 1rem'); // Mock returns 1rem
  });
});