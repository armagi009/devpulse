import React from 'react';
import { applyTextStyle, createTextStyle, createContainerQueryTextStyle } from '@/lib/styles/responsive-typography';

interface ResponsiveTextProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
  variant?: 
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' 
    | 'bodyLarge' | 'bodyBase' | 'bodySmall' 
    | 'displayLarge' | 'displayMedium' | 'displaySmall'
    | 'fluidXs' | 'fluidSm' | 'fluidBase' | 'fluidLg' | 'fluidXl' | 'fluid2xl' | 'fluid3xl' | 'fluid4xl' | 'fluid5xl';
  children: React.ReactNode;
  className?: string;
  containerQuery?: boolean;
  containerSize?: 'small' | 'medium' | 'large';
  containerType?: 'heading' | 'body';
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose' | 'extra';
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
}

/**
 * ResponsiveText Component
 * 
 * A component that applies fluid responsive typography styles.
 * It automatically scales text size based on viewport width or container width.
 * 
 * This component supports both viewport-based fluid typography and container query-based
 * typography, allowing text to adapt based on either the viewport size or its container size.
 */
const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  as: Component = 'p',
  variant = 'bodyBase',
  children,
  className = '',
  containerQuery = false,
  containerSize = 'medium',
  containerType = 'body',
  weight,
  lineHeight,
  letterSpacing,
}) => {
  // Determine which styling approach to use
  let textStyle;
  
  if (containerQuery) {
    // Use container query-based typography
    textStyle = createContainerQueryTextStyle(
      containerSize,
      containerType,
      weight,
      lineHeight
    );
  } else if (weight || lineHeight || letterSpacing) {
    // Use custom text style with specified properties
    const category = 
      variant.startsWith('h') ? 'heading' :
      variant.startsWith('display') ? 'display' :
      variant.startsWith('fluid') ? 'fluid' : 'body';
    
    const size = 
      variant.startsWith('h') ? variant as keyof typeof import('@/lib/styles/responsive-typography').fontSizes.heading :
      variant.startsWith('display') ? variant.replace('display', '').toLowerCase() as keyof typeof import('@/lib/styles/responsive-typography').fontSizes.display :
      variant.startsWith('fluid') ? variant.replace('fluid', '').toLowerCase() as keyof typeof import('@/lib/styles/responsive-typography').fontSizes.fluid :
      variant.replace('body', '').toLowerCase() as keyof typeof import('@/lib/styles/responsive-typography').fontSizes.body;
    
    textStyle = createTextStyle(
      size,
      category,
      weight,
      lineHeight,
      letterSpacing
    );
  } else {
    // Use predefined text style
    textStyle = applyTextStyle(variant);
  }
  
  return (
    <Component
      className={`responsive-text ${className}`}
      style={textStyle}
    >
      {children}
    </Component>
  );
};

export default ResponsiveText;