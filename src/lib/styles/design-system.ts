/**
 * DevPulse Design System
 * 
 * This file defines the core design tokens and theme configuration
 * for the DevPulse application. It ensures consistency across
 * all components and views.
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: 'hsl(221.2, 83.2%, 95.9%)',
    100: 'hsl(221.2, 83.2%, 91.2%)',
    200: 'hsl(221.2, 83.2%, 86.4%)',
    300: 'hsl(221.2, 83.2%, 77.8%)',
    400: 'hsl(221.2, 83.2%, 65.1%)',
    500: 'hsl(221.2, 83.2%, 53.3%)', // Primary blue
    600: 'hsl(221.2, 83.2%, 46.7%)',
    700: 'hsl(221.2, 83.2%, 40.0%)',
    800: 'hsl(221.2, 83.2%, 33.3%)',
    900: 'hsl(221.2, 83.2%, 26.7%)',
    950: 'hsl(221.2, 83.2%, 13.3%)',
  },
  
  // Neutral colors for text, backgrounds, etc.
  neutral: {
    50: 'hsl(0, 0%, 98.0%)',
    100: 'hsl(0, 0%, 96.1%)',
    200: 'hsl(0, 0%, 93.0%)',
    300: 'hsl(0, 0%, 88.7%)',
    400: 'hsl(0, 0%, 74.1%)',
    500: 'hsl(0, 0%, 60.0%)',
    600: 'hsl(0, 0%, 45.1%)',
    700: 'hsl(0, 0%, 32.2%)',
    800: 'hsl(0, 0%, 20.0%)',
    900: 'hsl(0, 0%, 12.0%)',
    950: 'hsl(0, 0%, 4.0%)',
  },
  
  // Semantic colors
  success: {
    50: 'hsl(142.1, 76.2%, 95.0%)',
    100: 'hsl(141.5, 84.5%, 88.5%)',
    500: 'hsl(142.1, 70.6%, 45.3%)',
    900: 'hsl(144.3, 80.4%, 10.0%)',
  },
  warning: {
    50: 'hsl(48.5, 96.6%, 95.0%)',
    100: 'hsl(48.8, 96.6%, 88.8%)',
    500: 'hsl(48.3, 96.0%, 50.0%)',
    900: 'hsl(32.1, 92.0%, 23.5%)',
  },
  error: {
    50: 'hsl(0, 85.7%, 97.3%)',
    100: 'hsl(0, 93.3%, 94.1%)',
    500: 'hsl(0, 84.2%, 60.2%)',
    900: 'hsl(0, 73.7%, 20.0%)',
  },
  info: {
    50: 'hsl(210, 100%, 97.5%)',
    100: 'hsl(210, 100%, 95.1%)',
    500: 'hsl(210, 100%, 50.0%)',
    900: 'hsl(210, 100%, 20.0%)',
  },
  
  // Data visualization colors
  dataViz: {
    blue: 'hsl(221.2, 83.2%, 53.3%)',
    green: 'hsl(142.1, 70.6%, 45.3%)',
    yellow: 'hsl(48.3, 96.0%, 50.0%)',
    red: 'hsl(0, 84.2%, 60.2%)',
    purple: 'hsl(262, 83.3%, 57.8%)',
    teal: 'hsl(168, 76.6%, 42.5%)',
    orange: 'hsl(32, 95.0%, 60.0%)',
    pink: 'hsl(332, 79.0%, 65.0%)',
  },
};

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

export const radii = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

export const zIndices = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
};

export const transitions = {
  DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: '150ms cubic-bezier(0.4, 0, 1, 1)',
  easeOut: '150ms cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Theme configuration for light and dark modes
export const lightTheme = {
  background: colors.neutral[50],
  foreground: colors.neutral[900],
  card: colors.neutral[50],
  cardForeground: colors.neutral[900],
  popover: colors.neutral[50],
  popoverForeground: colors.neutral[900],
  primary: colors.primary[500],
  primaryForeground: colors.neutral[50],
  secondary: colors.neutral[100],
  secondaryForeground: colors.neutral[900],
  muted: colors.neutral[100],
  mutedForeground: colors.neutral[600],
  accent: colors.neutral[100],
  accentForeground: colors.neutral[900],
  destructive: colors.error[500],
  destructiveForeground: colors.neutral[50],
  border: colors.neutral[200],
  input: colors.neutral[200],
  ring: colors.primary[500],
};

export const darkTheme = {
  background: colors.neutral[950],
  foreground: colors.neutral[50],
  card: colors.neutral[900],
  cardForeground: colors.neutral[50],
  popover: colors.neutral[900],
  popoverForeground: colors.neutral[50],
  primary: colors.primary[400],
  primaryForeground: colors.neutral[950],
  secondary: colors.neutral[800],
  secondaryForeground: colors.neutral[50],
  muted: colors.neutral[800],
  mutedForeground: colors.neutral[400],
  accent: colors.neutral[800],
  accentForeground: colors.neutral[50],
  destructive: colors.error[500],
  destructiveForeground: colors.neutral[50],
  border: colors.neutral[800],
  input: colors.neutral[800],
  ring: colors.primary[400],
};