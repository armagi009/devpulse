/**
 * Responsive Layout System
 * 
 * This module provides utilities for creating fluid responsive layouts
 * using CSS Grid, Flexbox, and container queries.
 */

// Breakpoint definitions (matching design document)
export const breakpoints = {
  mobile: '640px',
  tablet: '1024px',
  desktop: '1025px',
  wide: '1280px',
  ultraWide: '1536px',
};

// CSS Grid template areas for different layouts
export const gridTemplates = {
  // Single column layout (mobile)
  singleColumn: `
    "header"
    "main"
    "sidebar"
    "footer"
  `,
  
  // Two column layout (tablet)
  twoColumn: `
    "header header"
    "sidebar main"
    "footer footer"
  `,
  
  // Three column layout (desktop)
  threeColumn: `
    "header header header"
    "sidebar main aside"
    "footer footer footer"
  `,
  
  // Dashboard layout
  dashboard: `
    "header header header"
    "sidebar content content"
    "sidebar content content"
  `,
  
  // Analytics layout
  analytics: `
    "header header header header"
    "sidebar chart1 chart2 chart3"
    "sidebar chart4 chart5 chart6"
    "sidebar summary summary summary"
  `,
};

// Grid column configurations
export const gridColumns = {
  // Equal columns
  equal: {
    2: 'repeat(2, 1fr)',
    3: 'repeat(3, 1fr)',
    4: 'repeat(4, 1fr)',
    5: 'repeat(5, 1fr)',
    6: 'repeat(6, 1fr)',
    12: 'repeat(12, 1fr)',
  },
  
  // Auto-fit columns with minimum width
  autoFit: (minWidth: string) => `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
  
  // Auto-fill columns with minimum width
  autoFill: (minWidth: string) => `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
  
  // Custom column sizes
  custom: {
    sidebar: '1fr 3fr',
    sidebarRight: '3fr 1fr',
    asymmetric: '1fr 2fr 1fr',
    dashboard: '250px 1fr',
  },
};

// Flexbox layout presets
export const flexLayouts = {
  // Center content both horizontally and vertically
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Distribute items evenly
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Stack items vertically
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  // Wrap items to next line when needed
  wrap: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  
  // New: Row with even spacing
  rowEven: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  
  // New: Column with items at start
  columnStart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  
  // New: Column with items at end
  columnEnd: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
};

// Container query breakpoints (for component-level responsiveness)
export const containerBreakpoints = {
  xs: '240px',
  small: '300px',
  medium: '600px',
  large: '900px',
  xl: '1200px',
};

// Helper function to generate container query CSS
export const containerQuery = (size: keyof typeof containerBreakpoints, styles: Record<string, string | number>) => {
  const breakpoint = containerBreakpoints[size];
  return {
    [`@container (min-width: ${breakpoint})`]: {
      ...styles,
    },
  };
};

// Helper function for max-width container queries
export const containerQueryMax = (size: keyof typeof containerBreakpoints, styles: Record<string, string | number>) => {
  const breakpoint = containerBreakpoints[size];
  return {
    [`@container (max-width: ${breakpoint})`]: {
      ...styles,
    },
  };
};

// Helper function for container query ranges
export const containerQueryRange = (
  minSize: keyof typeof containerBreakpoints, 
  maxSize: keyof typeof containerBreakpoints, 
  styles: Record<string, string | number>
) => {
  const minBreakpoint = containerBreakpoints[minSize];
  const maxBreakpoint = containerBreakpoints[maxSize];
  return {
    [`@container (min-width: ${minBreakpoint}) and (max-width: ${maxBreakpoint})`]: {
      ...styles,
    },
  };
};

// Fluid spacing scale (grows proportionally with viewport)
export const fluidSpacing = {
  '2xs': 'clamp(0.125rem, 0.25vw, 0.25rem)',
  xs: 'clamp(0.25rem, 0.5vw, 0.5rem)',
  sm: 'clamp(0.5rem, 1vw, 1rem)',
  md: 'clamp(1rem, 2vw, 1.5rem)',
  lg: 'clamp(1.5rem, 3vw, 2.5rem)',
  xl: 'clamp(2rem, 4vw, 3.5rem)',
  '2xl': 'clamp(2.5rem, 5vw, 4rem)',
  // Negative values for margins
  'neg-xs': 'clamp(-0.5rem, -0.5vw, -0.25rem)',
  'neg-sm': 'clamp(-1rem, -1vw, -0.5rem)',
  'neg-md': 'clamp(-1.5rem, -2vw, -1rem)',
};

// Fluid typography scale
export const fluidTypography = {
  xs: 'clamp(0.75rem, 1vw, 0.875rem)',
  sm: 'clamp(0.875rem, 1.2vw, 1rem)',
  base: 'clamp(1rem, 1.5vw, 1.125rem)',
  lg: 'clamp(1.125rem, 2vw, 1.25rem)',
  xl: 'clamp(1.25rem, 2.5vw, 1.5rem)',
  '2xl': 'clamp(1.5rem, 3vw, 1.875rem)',
  '3xl': 'clamp(1.875rem, 4vw, 2.25rem)',
  '4xl': 'clamp(2.25rem, 5vw, 3rem)',
  '5xl': 'clamp(3rem, 6vw, 4rem)',
};

// Grid layout helper
export const createGridLayout = (columns: string, rows: string = 'auto', gap: string = fluidSpacing.md) => ({
  display: 'grid',
  gridTemplateColumns: columns,
  gridTemplateRows: rows,
  gap,
});

// Responsive grid that adapts based on container width
export const responsiveGrid = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
    gap: fluidSpacing.md,
  },
};

// Media query helpers
export const mediaQuery = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (min-width: ${breakpoints.mobile}) and (max-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.tablet})`,
  wide: `@media (min-width: ${breakpoints.wide})`,
  ultraWide: `@media (min-width: ${breakpoints.ultraWide})`,
};

// Helper function to create media query styles
export const createMediaQueryStyles = (
  breakpoint: keyof typeof mediaQuery,
  styles: Record<string, string | number>
) => {
  return {
    [mediaQuery[breakpoint]]: {
      ...styles,
    },
  };
};

// Helper function to create responsive styles for multiple breakpoints
export const createResponsiveStyles = (
  styles: {
    base?: Record<string, string | number>;
    mobile?: Record<string, string | number>;
    tablet?: Record<string, string | number>;
    desktop?: Record<string, string | number>;
    wide?: Record<string, string | number>;
    ultraWide?: Record<string, string | number>;
  }
) => {
  return {
    ...(styles.base || {}),
    ...(styles.mobile ? { [mediaQuery.mobile]: styles.mobile } : {}),
    ...(styles.tablet ? { [mediaQuery.tablet]: styles.tablet } : {}),
    ...(styles.desktop ? { [mediaQuery.desktop]: styles.desktop } : {}),
    ...(styles.wide ? { [mediaQuery.wide]: styles.wide } : {}),
    ...(styles.ultraWide ? { [mediaQuery.ultraWide]: styles.ultraWide } : {}),
  };
};

// Container layout presets
export const containerLayouts = {
  card: {
    padding: fluidSpacing.md,
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    backgroundColor: 'white',
    containerType: 'inline-size',
  },
  section: {
    padding: fluidSpacing.lg,
    marginBottom: fluidSpacing.xl,
    containerType: 'inline-size',
  },
  panel: {
    padding: fluidSpacing.md,
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    containerType: 'inline-size',
  },
};