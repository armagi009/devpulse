/**
 * Responsive Typography System
 * 
 * This module provides a fluid typography system that scales based on viewport size.
 * It uses CSS clamp() function to create smooth transitions between sizes.
 */

// Base font sizes for different text elements
export const fontSizes = {
  // Body text sizes
  body: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
  },
  
  // Heading sizes
  heading: {
    h1: 'clamp(1.875rem, 1.5rem + 1.875vw, 3rem)',
    h2: 'clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem)',
    h3: 'clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)',
    h4: 'clamp(1.125rem, 1rem + 0.5vw, 1.25rem)',
    h5: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
    h6: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
  },
  
  // Display text (larger than headings)
  display: {
    sm: 'clamp(2.25rem, 1.75rem + 2.5vw, 3.75rem)',
    md: 'clamp(3rem, 2.25rem + 3.75vw, 5rem)',
    lg: 'clamp(3.75rem, 3rem + 3.75vw, 6rem)',
  },
  
  // New: Fluid sizes for different contexts
  fluid: {
    xs: 'clamp(0.75rem, 1vw, 0.875rem)',
    sm: 'clamp(0.875rem, 1.2vw, 1rem)',
    base: 'clamp(1rem, 1.5vw, 1.125rem)',
    lg: 'clamp(1.125rem, 2vw, 1.25rem)',
    xl: 'clamp(1.25rem, 2.5vw, 1.5rem)',
    '2xl': 'clamp(1.5rem, 3vw, 1.875rem)',
    '3xl': 'clamp(1.875rem, 4vw, 2.25rem)',
    '4xl': 'clamp(2.25rem, 5vw, 3rem)',
    '5xl': 'clamp(3rem, 6vw, 4rem)',
  }
};

// Line heights that scale with font size
export const lineHeights = {
  tight: '1.1',
  normal: '1.5',
  loose: '1.8',
  // New: More precise control
  none: '1',
  snug: '1.25',
  relaxed: '1.625',
  extra: '2',
};

// Letter spacing options
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

// Font weights
export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// Responsive text styles for different elements
export const textStyles = {
  // Heading styles
  h1: {
    fontSize: fontSizes.heading.h1,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSizes.heading.h2,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSizes.heading.h3,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: fontSizes.heading.h4,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontSize: fontSizes.heading.h5,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontSize: fontSizes.heading.h6,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Body text styles
  bodyLarge: {
    fontSize: fontSizes.body.lg,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodyBase: {
    fontSize: fontSizes.body.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontSize: fontSizes.body.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Display text styles
  displayLarge: {
    fontSize: fontSizes.display.lg,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  displayMedium: {
    fontSize: fontSizes.display.md,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  displaySmall: {
    fontSize: fontSizes.display.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  
  // New: Fluid text styles
  fluidXs: {
    fontSize: fontSizes.fluid.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  fluidSm: {
    fontSize: fontSizes.fluid.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  fluidBase: {
    fontSize: fontSizes.fluid.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  fluidLg: {
    fontSize: fontSizes.fluid.lg,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  fluidXl: {
    fontSize: fontSizes.fluid.xl,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  fluid2xl: {
    fontSize: fontSizes.fluid['2xl'],
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  },
  fluid3xl: {
    fontSize: fontSizes.fluid['3xl'],
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  },
  fluid4xl: {
    fontSize: fontSizes.fluid['4xl'],
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  fluid5xl: {
    fontSize: fontSizes.fluid['5xl'],
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
};

// Helper function to apply text style
export const applyTextStyle = (style: keyof typeof textStyles) => {
  return textStyles[style];
};

// Helper function to create custom text style
export const createTextStyle = (
  size: keyof typeof fontSizes.body | keyof typeof fontSizes.heading | keyof typeof fontSizes.display | keyof typeof fontSizes.fluid,
  category: 'body' | 'heading' | 'display' | 'fluid' = 'body',
  weight: keyof typeof fontWeights = 'normal',
  lineHeight: keyof typeof lineHeights = 'normal',
  spacing: keyof typeof letterSpacing = 'normal'
) => {
  return {
    fontSize: fontSizes[category][size as keyof (typeof fontSizes)[typeof category]],
    fontWeight: fontWeights[weight],
    lineHeight: lineHeights[lineHeight],
    letterSpacing: letterSpacing[spacing],
  };
};

// Container query based typography
export const containerQueryTypography = {
  // Small container typography
  small: {
    heading: 'clamp(1.125rem, 5cqi, 1.25rem)',
    body: 'clamp(0.875rem, 4cqi, 1rem)',
  },
  
  // Medium container typography
  medium: {
    heading: 'clamp(1.25rem, 6cqi, 1.5rem)',
    body: 'clamp(1rem, 4.5cqi, 1.125rem)',
  },
  
  // Large container typography
  large: {
    heading: 'clamp(1.5rem, 7cqi, 1.875rem)',
    body: 'clamp(1.125rem, 5cqi, 1.25rem)',
  },
};

// Helper function to generate container query styles
export const createContainerQueryTextStyle = (
  size: 'small' | 'medium' | 'large',
  type: 'heading' | 'body',
  weight: keyof typeof fontWeights = 'normal',
  lineHeight: keyof typeof lineHeights = 'normal'
) => {
  return {
    fontSize: containerQueryTypography[size][type],
    fontWeight: fontWeights[weight],
    lineHeight: lineHeights[lineHeight],
  };
};