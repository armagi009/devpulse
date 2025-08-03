/**
 * Accessibility Utilities
 * Helper functions for improving accessibility
 */

/**
 * Generates a unique ID for accessibility purposes
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 */
export function generateAccessibilityId(prefix: string = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Color formats supported by the contrast utilities
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/**
 * WCAG Contrast Standards
 */
export enum ContrastStandard {
  AA_NORMAL = 4.5,       // WCAG AA for normal text (>=14px)
  AA_LARGE = 3.0,        // WCAG AA for large text (>=18px or >=14px bold)
  AAA_NORMAL = 7.0,      // WCAG AAA for normal text
  AAA_LARGE = 4.5,       // WCAG AAA for large text
  UI_COMPONENT = 3.0     // WCAG AA for UI components and graphics
}

/**
 * Contrast check result with detailed information
 */
export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAALarge: boolean;
  passesAAA: boolean;
  passesAAALarge: boolean;
  passesUIComponents: boolean;
}

/**
 * Checks if a color contrast ratio meets WCAG AA standards for normal text
 * @param foreground - Foreground color in hex format (e.g., "#FFFFFF")
 * @param background - Background color in hex format (e.g., "#000000")
 * @returns Boolean indicating if the contrast ratio meets WCAG AA standards
 */
export function hasValidContrast(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= ContrastStandard.AA_NORMAL;
}

/**
 * Performs a comprehensive contrast check against all WCAG standards
 * @param foreground - Foreground color in hex, rgb, or hsl format
 * @param background - Background color in hex, rgb, or hsl format
 * @returns ContrastResult object with detailed information
 */
export function checkContrast(foreground: string, background: string): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  
  return {
    ratio,
    passesAA: ratio >= ContrastStandard.AA_NORMAL,
    passesAALarge: ratio >= ContrastStandard.AA_LARGE,
    passesAAA: ratio >= ContrastStandard.AAA_NORMAL,
    passesAAALarge: ratio >= ContrastStandard.AAA_LARGE,
    passesUIComponents: ratio >= ContrastStandard.UI_COMPONENT
  };
}

/**
 * Calculates the contrast ratio between two colors
 * @param foreground - Foreground color in hex, rgb, or hsl format
 * @param background - Background color in hex, rgb, or hsl format
 * @returns The contrast ratio as a number
 */
export function getContrastRatio(foreground: string, background: string): number {
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculates the relative luminance of a color
 * @param color - Color in hex, rgb, or hsl format
 * @returns The relative luminance as a number between 0 and 1
 */
export function getLuminance(color: string): number {
  // Convert color to RGB values
  const rgb = parseColorToRgb(color);
  if (!rgb) return 0;
  
  const { r, g, b } = rgb;
  
  // Calculate luminance
  const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Parses a color string to RGB values
 * @param color - Color in hex, rgb, or hsl format
 * @returns Object with r, g, b values normalized to 0-1 range, or null if parsing fails
 */
export function parseColorToRgb(color: string): { r: number, g: number, b: number } | null {
  color = color.trim().toLowerCase();
  
  // Handle hex format
  if (color.startsWith('#')) {
    return parseHexToRgb(color);
  }
  
  // Handle rgb/rgba format
  if (color.startsWith('rgb')) {
    return parseRgbString(color);
  }
  
  // Handle hsl/hsla format
  if (color.startsWith('hsl')) {
    return parseHslString(color);
  }
  
  // Handle CSS named colors
  const namedColor = getNamedColor(color);
  if (namedColor) {
    return parseHexToRgb(namedColor);
  }
  
  return null;
}

/**
 * Parses a hex color string to RGB values
 * @param hex - Hex color string (e.g., "#FFFFFF")
 * @returns Object with r, g, b values normalized to 0-1 range
 */
function parseHexToRgb(hex: string): { r: number, g: number, b: number } | null {
  // Remove # if present
  hex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Handle shorthand hex (#RGB)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Validate hex format
  if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return null;
  }
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return { r, g, b };
}

/**
 * Parses an RGB/RGBA color string to RGB values
 * @param rgb - RGB/RGBA color string (e.g., "rgb(255, 255, 255)" or "rgba(255, 255, 255, 0.5)")
 * @returns Object with r, g, b values normalized to 0-1 range
 */
function parseRgbString(rgb: string): { r: number, g: number, b: number } | null {
  // Extract values from rgb/rgba string
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (!match) return null;
  
  const r = parseInt(match[1], 10) / 255;
  const g = parseInt(match[2], 10) / 255;
  const b = parseInt(match[3], 10) / 255;
  
  return { r, g, b };
}

/**
 * Parses an HSL/HSLA color string to RGB values
 * @param hsl - HSL/HSLA color string (e.g., "hsl(0, 0%, 100%)" or "hsla(0, 0%, 100%, 0.5)")
 * @returns Object with r, g, b values normalized to 0-1 range
 */
function parseHslString(hsl: string): { r: number, g: number, b: number } | null {
  // Extract values from hsl/hsla string
  const match = hsl.match(/hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*[\d.]+)?\)/);
  if (!match) return null;
  
  const h = parseInt(match[1], 10) / 360;
  const s = parseInt(match[2], 10) / 100;
  const l = parseInt(match[3], 10) / 100;
  
  return hslToRgb(h, s, l);
}

/**
 * Converts HSL values to RGB
 * @param h - Hue (0-1)
 * @param s - Saturation (0-1)
 * @param l - Lightness (0-1)
 * @returns Object with r, g, b values normalized to 0-1 range
 */
function hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r, g, b };
}

/**
 * Gets the hex value for a CSS named color
 * @param name - CSS color name (e.g., "white")
 * @returns Hex color string or null if not found
 */
function getNamedColor(name: string): string | null {
  const namedColors: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
    yellow: '#FFFF00',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    silver: '#C0C0C0',
    gray: '#808080',
    maroon: '#800000',
    olive: '#808000',
    navy: '#000080',
    purple: '#800080',
    teal: '#008080',
    orange: '#FFA500',
    pink: '#FFC0CB',
    // Add more named colors as needed
  };
  
  return namedColors[name] || null;
}

/**
 * Adjusts a color to ensure it meets the specified contrast ratio with a background color
 * @param color - Color to adjust in hex format
 * @param backgroundColor - Background color in hex format
 * @param targetRatio - Target contrast ratio (default: 4.5 for WCAG AA)
 * @returns Adjusted color in hex format
 */
export function adjustColorForContrast(
  color: string, 
  backgroundColor: string, 
  targetRatio: number = ContrastStandard.AA_NORMAL
): string {
  // Parse colors to RGB
  const colorRgb = parseColorToRgb(color);
  if (!colorRgb) return color;
  
  // Get current contrast ratio
  const currentRatio = getContrastRatio(color, backgroundColor);
  
  // If already meeting target, return original color
  if (currentRatio >= targetRatio) {
    return color;
  }
  
  // Determine if we need to lighten or darken the color
  const bgLuminance = getLuminance(backgroundColor);
  const colorLuminance = getLuminance(color);
  
  const shouldLighten = colorLuminance <= bgLuminance;
  
  // Binary search to find the right adjustment
  let adjustedColor = color;
  let min = 0;
  let max = 1;
  let factor = 0.5;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    adjustedColor = shouldLighten 
      ? lightenColor(color, factor) 
      : darkenColor(color, factor);
    
    const newRatio = getContrastRatio(adjustedColor, backgroundColor);
    
    if (Math.abs(newRatio - targetRatio) < 0.1) {
      break;
    }
    
    if (newRatio < targetRatio) {
      min = factor;
    } else {
      max = factor;
    }
    
    factor = (min + max) / 2;
    attempts++;
  }
  
  return adjustedColor;
}

/**
 * Lightens a color by a specified factor
 * @param color - Color in hex format
 * @param factor - Factor to lighten by (0-1)
 * @returns Lightened color in hex format
 */
export function lightenColor(color: string, factor: number): string {
  const rgb = parseColorToRgb(color);
  if (!rgb) return color;
  
  const { r, g, b } = rgb;
  
  // Lighten each component
  const newR = r + (1 - r) * factor;
  const newG = g + (1 - g) * factor;
  const newB = b + (1 - b) * factor;
  
  // Convert back to hex
  return rgbToHex(newR, newG, newB);
}

/**
 * Darkens a color by a specified factor
 * @param color - Color in hex format
 * @param factor - Factor to darken by (0-1)
 * @returns Darkened color in hex format
 */
export function darkenColor(color: string, factor: number): string {
  const rgb = parseColorToRgb(color);
  if (!rgb) return color;
  
  const { r, g, b } = rgb;
  
  // Darken each component
  const newR = r * (1 - factor);
  const newG = g * (1 - factor);
  const newB = b * (1 - factor);
  
  // Convert back to hex
  return rgbToHex(newR, newG, newB);
}

/**
 * Converts RGB values to a hex color string
 * @param r - Red component (0-1)
 * @param g - Green component (0-1)
 * @param b - Blue component (0-1)
 * @returns Hex color string
 */
function rgbToHex(r: number, g: number, b: number): string {
  // Convert to 0-255 range and ensure valid bounds
  const rInt = Math.max(0, Math.min(255, Math.round(r * 255)));
  const gInt = Math.max(0, Math.min(255, Math.round(g * 255)));
  const bInt = Math.max(0, Math.min(255, Math.round(b * 255)));
  
  // Convert to hex
  const rHex = rInt.toString(16).padStart(2, '0');
  const gHex = gInt.toString(16).padStart(2, '0');
  const bHex = bInt.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Creates an accessible announcement for screen readers
 * @param message - The message to announce
 */
export function announceToScreenReader(message: string): void {
  // Create or get the live region
  let liveRegion = document.getElementById('a11y-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'a11y-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.margin = '-1px';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    document.body.appendChild(liveRegion);
  }
  
  // Update the live region
  liveRegion.textContent = message;
}

/**
 * Checks if a string is a valid ARIA role
 * @param role - The ARIA role to check
 * @returns Boolean indicating if the role is valid
 */
export function isValidAriaRole(role: string): boolean {
  const validRoles = [
    'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 
    'cell', 'checkbox', 'columnheader', 'combobox', 'complementary', 
    'contentinfo', 'definition', 'dialog', 'directory', 'document', 
    'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading', 
    'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 
    'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 
    'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation', 
    'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup', 
    'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider', 
    'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 
    'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 
    'treeitem'
  ];
  
  return validRoles.includes(role);
}

/**
 * Enhances an element with proper focus management
 * @param element - The DOM element to enhance
 */
export function enhanceFocusManagement(element: HTMLElement): void {
  // Ensure the element is focusable
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '0');
  }
  
  // Add focus visible styles
  element.addEventListener('focus', () => {
    element.classList.add('focus-visible');
  });
  
  element.addEventListener('blur', () => {
    element.classList.remove('focus-visible');
  });
}