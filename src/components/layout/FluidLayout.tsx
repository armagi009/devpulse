'use client';

import React from 'react';
import { gridTemplates, breakpoints, fluidSpacing, containerLayouts } from '@/lib/styles/responsive-layout';

interface FluidLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dashboard' | 'analytics';
  containerQuery?: boolean;
  containerName?: string;
}

/**
 * FluidLayout Component
 * 
 * A responsive layout component that adapts its structure based on viewport size.
 * Uses CSS Grid with named template areas for flexible content placement.
 * Supports container queries for component-level responsiveness.
 */
const FluidLayout: React.FC<FluidLayoutProps> = ({ 
  children, 
  className = '',
  variant = 'default',
  containerQuery = true,
  containerName,
}) => {
  // Select the appropriate grid template based on variant
  const getGridTemplate = () => {
    switch (variant) {
      case 'dashboard':
        return gridTemplates.dashboard;
      case 'analytics':
        return gridTemplates.analytics;
      default:
        return gridTemplates.singleColumn;
    }
  };
  
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      containerType: 'inline-size',
      containerName: containerName || '',
    }
  } : {};
  
  return (
    <div 
      className={`fluid-layout ${className}`}
      style={{
        display: 'grid',
        gridTemplateAreas: getGridTemplate(),
        gap: fluidSpacing.md,
        padding: fluidSpacing.md,
      }}
      {...containerAttributes}
    >
      <style jsx>{`
        .fluid-layout {
          width: 100%;
        }
        
        @media (min-width: ${breakpoints.mobile}) {
          .fluid-layout {
            grid-template-areas: ${gridTemplates.twoColumn};
            grid-template-columns: 1fr 2fr;
          }
        }
        
        @media (min-width: ${breakpoints.tablet}) {
          .fluid-layout {
            grid-template-areas: ${variant === 'default' 
              ? gridTemplates.threeColumn 
              : variant === 'dashboard' 
                ? gridTemplates.dashboard 
                : gridTemplates.analytics};
            grid-template-columns: ${variant === 'default' 
              ? '1fr 3fr 1fr' 
              : variant === 'dashboard' 
                ? '250px 1fr 1fr' 
                : '250px 1fr 1fr 1fr'};
          }
        }
      `}</style>
      {children}
    </div>
  );
};

/**
 * Layout section components for placing content in specific grid areas
 */
interface LayoutSectionProps {
  children: React.ReactNode;
  className?: string;
  containerQuery?: boolean;
  containerName?: string;
}

export const Header: React.FC<LayoutSectionProps> = ({ 
  children, 
  className = '',
  containerQuery = false,
  containerName,
}) => {
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      containerType: 'inline-size',
      containerName: containerName || '',
    }
  } : {};
  
  return (
    <header 
      className={`fluid-layout-header ${className}`} 
      style={{ gridArea: 'header' }}
      {...containerAttributes}
    >
      {children}
    </header>
  );
};

export const Main: React.FC<LayoutSectionProps> = ({ 
  children, 
  className = '',
  containerQuery = false,
  containerName,
}) => {
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      containerType: 'inline-size',
      containerName: containerName || '',
    }
  } : {};
  
  return (
    <main 
      className={`fluid-layout-main ${className}`} 
      style={{ gridArea: 'main' }}
      {...containerAttributes}
    >
      {children}
    </main>
  );
};

export const Sidebar: React.FC<LayoutSectionProps> = ({ 
  children, 
  className = '',
  containerQuery = false,
  containerName,
}) => {
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      containerType: 'inline-size',
      containerName: containerName || '',
    }
  } : {};
  
  return (
    <aside 
      className={`fluid-layout-sidebar ${className}`} 
      style={{ gridArea: 'sidebar' }}
      {...containerAttributes}
    >
      {children}
    </aside>
  );
};

export const Footer: React.FC<LayoutSectionProps> = ({ 
  children, 
  className = '',
  containerQuery = false,
  containerName,
}) => {
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      containerType: 'inline-size',
      containerName: containerName || '',
    }
  } : {};
  
  return (
    <footer 
      className={`fluid-layout-footer ${className}`} 
      style={{ gridArea: 'footer' }}
      {...containerAttributes}
    >
      {children}
    </footer>
  );
};

// Additional layout sections for dashboard and analytics layouts
export const Content: React.FC<LayoutSectionProps> = ({ 
  children, 
  className = '',
  containerQuery = false,
  containerName,
}) => {
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      containerType: 'inline-size',
      containerName: containerName || '',
    }
  } : {};
  
  return (
    <div 
      className={`fluid-layout-content ${className}`} 
      style={{ gridArea: 'content' }}
      {...containerAttributes}
    >
      {children}
    </div>
  );
};

export const Aside: React.FC<LayoutSectionProps> = ({ 
  children, 
  className = '',
  containerQuery = false,
  containerName,
}) => {
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      containerType: 'inline-size',
      containerName: containerName || '',
    }
  } : {};
  
  return (
    <aside 
      className={`fluid-layout-aside ${className}`} 
      style={{ gridArea: 'aside' }}
      {...containerAttributes}
    >
      {children}
    </aside>
  );
};

export const Chart: React.FC<LayoutSectionProps & { area: string }> = ({ 
  children, 
  className = '',
  area,
  containerQuery = true,
  containerName,
}) => {
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      containerType: 'inline-size',
      containerName: containerName || '',
    }
  } : {};
  
  return (
    <div 
      className={`fluid-layout-chart ${className}`} 
      style={{ gridArea: area }}
      {...containerAttributes}
    >
      {children}
    </div>
  );
};

export const Summary: React.FC<LayoutSectionProps> = ({ 
  children, 
  className = '',
  containerQuery = false,
  containerName,
}) => {
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      containerType: 'inline-size',
      containerName: containerName || '',
    }
  } : {};
  
  return (
    <div 
      className={`fluid-layout-summary ${className}`} 
      style={{ gridArea: 'summary' }}
      {...containerAttributes}
    >
      {children}
    </div>
  );
};

// Container components
export const Card: React.FC<LayoutSectionProps> = ({ 
  children, 
  className = '',
  containerQuery = true,
  containerName,
}) => {
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      ...containerLayouts.card,
      containerName: containerName || '',
    }
  } : {
    style: {
      ...containerLayouts.card,
      containerType: undefined,
    }
  };
  
  return (
    <div 
      className={`fluid-layout-card ${className}`}
      {...containerAttributes}
    >
      {children}
    </div>
  );
};

export const Section: React.FC<LayoutSectionProps> = ({ 
  children, 
  className = '',
  containerQuery = true,
  containerName,
}) => {
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      ...containerLayouts.section,
      containerName: containerName || '',
    }
  } : {
    style: {
      ...containerLayouts.section,
      containerType: undefined,
    }
  };
  
  return (
    <section 
      className={`fluid-layout-section ${className}`}
      {...containerAttributes}
    >
      {children}
    </section>
  );
};

export const Panel: React.FC<LayoutSectionProps> = ({ 
  children, 
  className = '',
  containerQuery = true,
  containerName,
}) => {
  // Container query attributes
  const containerAttributes = containerQuery ? {
    style: {
      ...containerLayouts.panel,
      containerName: containerName || '',
    }
  } : {
    style: {
      ...containerLayouts.panel,
      containerType: undefined,
    }
  };
  
  return (
    <div 
      className={`fluid-layout-panel ${className}`}
      {...containerAttributes}
    >
      {children}
    </div>
  );
};

export default FluidLayout;