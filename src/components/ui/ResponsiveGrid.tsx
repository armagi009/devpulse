'use client';

/**
 * ResponsiveGrid Component
 * 
 * A flexible grid layout component that adapts to different screen sizes
 * and allows for customizable column configurations.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type ColumnConfig = {
  xs?: number; // Mobile (< 640px)
  sm?: number; // Small screens (>= 640px)
  md?: number; // Medium screens (>= 768px)
  lg?: number; // Large screens (>= 1024px)
  xl?: number; // Extra large screens (>= 1280px)
  xxl?: number; // 2XL screens (>= 1536px)
};

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: ColumnConfig | number;
  gap?: number | string;
  rowGap?: number | string;
  columnGap?: number | string;
  className?: string;
  itemClassName?: string;
}

/**
 * Converts a column configuration to Tailwind CSS grid classes
 */
function getGridClasses(columns: ColumnConfig | number): string {
  if (typeof columns === 'number') {
    return `grid-cols-1 sm:grid-cols-${Math.min(columns, 2)} md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${columns}`;
  }

  const { xs = 1, sm, md, lg, xl, xxl } = columns;
  
  return cn(
    `grid-cols-${xs}`,
    sm && `sm:grid-cols-${sm}`,
    md && `md:grid-cols-${md}`,
    lg && `lg:grid-cols-${lg}`,
    xl && `xl:grid-cols-${xl}`,
    xxl && `2xl:grid-cols-${xxl}`
  );
}

/**
 * Converts a gap value to a Tailwind CSS gap class
 */
function getGapClass(gap: number | string | undefined): string {
  if (gap === undefined) return 'gap-4';
  
  if (typeof gap === 'number') {
    return `gap-${gap}`;
  }
  
  return `gap-[${gap}]`;
}

/**
 * ResponsiveGrid component for creating responsive grid layouts
 */
export default function ResponsiveGrid({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap,
  rowGap,
  columnGap,
  className,
  itemClassName,
  ...props
}: ResponsiveGridProps) {
  // Convert children to array
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div
      className={cn(
        'grid w-full',
        getGridClasses(columns),
        gap !== undefined ? getGapClass(gap) : null,
        rowGap !== undefined ? `row-${getGapClass(rowGap)}` : null,
        columnGap !== undefined ? `col-${getGapClass(columnGap)}` : null,
        className
      )}
      {...props}
    >
      {childrenArray.map((child, index) => (
        <div key={index} className={itemClassName}>
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * ResponsiveGridItem component for creating items within a responsive grid
 * that can span multiple columns or rows
 */
export function ResponsiveGridItem({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  rowSpan?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  [key: string]: any;
}) {
  // Generate column span classes
  const getColSpanClasses = () => {
    if (typeof colSpan === 'number') {
      return `col-span-${colSpan}`;
    }
    
    return cn(
      colSpan.xs && `col-span-${colSpan.xs}`,
      colSpan.sm && `sm:col-span-${colSpan.sm}`,
      colSpan.md && `md:col-span-${colSpan.md}`,
      colSpan.lg && `lg:col-span-${colSpan.lg}`,
      colSpan.xl && `xl:col-span-${colSpan.xl}`,
      colSpan.xxl && `2xl:col-span-${colSpan.xxl}`
    );
  };
  
  // Generate row span classes
  const getRowSpanClasses = () => {
    if (typeof rowSpan === 'number') {
      return `row-span-${rowSpan}`;
    }
    
    return cn(
      rowSpan.xs && `row-span-${rowSpan.xs}`,
      rowSpan.sm && `sm:row-span-${rowSpan.sm}`,
      rowSpan.md && `md:row-span-${rowSpan.md}`,
      rowSpan.lg && `lg:row-span-${rowSpan.lg}`,
      rowSpan.xl && `xl:row-span-${rowSpan.xl}`,
      rowSpan.xxl && `2xl:row-span-${rowSpan.xxl}`
    );
  };
  
  return (
    <div
      className={cn(
        getColSpanClasses(),
        getRowSpanClasses(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}