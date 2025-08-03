/**
 * Chart Optimization Utilities
 * 
 * A collection of utilities for optimizing chart rendering performance.
 */

/**
 * Downsamples a large dataset to a smaller number of points
 * using the Largest-Triangle-Three-Buckets algorithm.
 * 
 * @param data Array of data points with x and y values
 * @param threshold Maximum number of points to return
 * @returns Downsampled data array
 */
export function downsampleData<T extends { x: number; y: number }>(
  data: T[],
  threshold: number
): T[] {
  if (data.length <= threshold) {
    return data;
  }

  const bucketSize = data.length / threshold;
  const result: T[] = [];
  let lastSelectedPoint: T | null = null;

  // Always add the first point
  result.push(data[0]);
  lastSelectedPoint = data[0];

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate bucket boundaries
    const startIndex = Math.floor((i + 1) * bucketSize);
    const endIndex = Math.floor((i + 2) * bucketSize);
    
    // Find the point in this bucket with the largest area
    let maxArea = -1;
    let maxAreaIndex = startIndex;
    
    const a = lastSelectedPoint!;
    const c = data[Math.min(endIndex, data.length - 1)];
    
    for (let j = startIndex; j < endIndex; j++) {
      const b = data[j];
      
      // Calculate triangle area
      const area = Math.abs(
        (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y)
      ) * 0.5;
      
      if (area > maxArea) {
        maxArea = area;
        maxAreaIndex = j;
      }
    }
    
    // Add the point with the largest area
    result.push(data[maxAreaIndex]);
    lastSelectedPoint = data[maxAreaIndex];
  }

  // Always add the last point
  result.push(data[data.length - 1]);

  return result;
}

/**
 * Determines if a chart needs to be rerendered based on data changes
 * 
 * @param prevData Previous chart data
 * @param newData New chart data
 * @param tolerance Tolerance for considering values as changed (default: 0.001)
 * @returns Boolean indicating if rerender is needed
 */
export function shouldChartUpdate<T extends Record<string, any>>(
  prevData: T[],
  newData: T[],
  tolerance: number = 0.001
): boolean {
  // Different array lengths require update
  if (prevData.length !== newData.length) {
    return true;
  }
  
  // Check if any data point has changed significantly
  for (let i = 0; i < prevData.length; i++) {
    const prev = prevData[i];
    const next = newData[i];
    
    // Check if object keys match
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    
    if (prevKeys.length !== nextKeys.length) {
      return true;
    }
    
    // Check each property
    for (const key of prevKeys) {
      if (typeof prev[key] === 'number' && typeof next[key] === 'number') {
        // For numeric values, check if difference exceeds tolerance
        if (Math.abs(prev[key] - next[key]) > tolerance) {
          return true;
        }
      } else if (prev[key] !== next[key]) {
        // For non-numeric values, check strict equality
        return true;
      }
    }
  }
  
  // No significant changes found
  return false;
}

/**
 * Optimizes SVG rendering by applying various techniques
 * 
 * @param svgElement SVG element to optimize
 */
export function optimizeSvgRendering(svgElement: SVGElement): void {
  if (!svgElement) return;
  
  // Set shape-rendering attribute for better performance
  svgElement.setAttribute('shape-rendering', 'optimizeSpeed');
  
  // Disable pointer events on non-interactive elements
  const nonInteractiveElements = svgElement.querySelectorAll('path, line, rect:not([data-interactive])');
  nonInteractiveElements.forEach(el => {
    el.setAttribute('pointer-events', 'none');
  });
  
  // Group similar elements to reduce DOM size
  const paths = Array.from(svgElement.querySelectorAll('path:not([data-grouped])'));
  const lines = Array.from(svgElement.querySelectorAll('line:not([data-grouped])'));
  
  // Group paths with the same style
  const pathGroups = new Map<string, SVGPathElement[]>();
  paths.forEach(path => {
    const style = path.getAttribute('style') || '';
    const stroke = path.getAttribute('stroke') || '';
    const fill = path.getAttribute('fill') || '';
    const key = `${style}|${stroke}|${fill}`;
    
    if (!pathGroups.has(key)) {
      pathGroups.set(key, []);
    }
    pathGroups.get(key)!.push(path as SVGPathElement);
  });
  
  // Group lines with the same style
  const lineGroups = new Map<string, SVGLineElement[]>();
  lines.forEach(line => {
    const style = line.getAttribute('style') || '';
    const stroke = line.getAttribute('stroke') || '';
    const key = `${style}|${stroke}`;
    
    if (!lineGroups.has(key)) {
      lineGroups.set(key, []);
    }
    lineGroups.get(key)!.push(line as SVGLineElement);
  });
  
  // Apply CSS containment for better rendering performance
  svgElement.style.contain = 'content';
  
  // Use CSS transform instead of SVG transform when possible
  const transformableElements = svgElement.querySelectorAll('[transform]');
  transformableElements.forEach(el => {
    const transform = el.getAttribute('transform');
    if (transform && transform.startsWith('translate')) {
      el.removeAttribute('transform');
      (el as HTMLElement).style.transform = transform
        .replace('translate(', 'translate3d(')
        .replace(')', ', 0)');
    }
  });
}

/**
 * Calculates the optimal number of data points to display based on chart width
 * 
 * @param chartWidth Width of the chart in pixels
 * @param minPointDistance Minimum distance between points in pixels
 * @returns Optimal number of data points
 */
export function calculateOptimalDataPoints(
  chartWidth: number,
  minPointDistance: number = 5
): number {
  return Math.max(10, Math.floor(chartWidth / minPointDistance));
}

/**
 * Batches chart updates to avoid excessive re-renders
 * 
 * @param callback Function to call for updating the chart
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function batchChartUpdates<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let latestArgs: Parameters<T> | null = null;
  
  return (...args: Parameters<T>) => {
    latestArgs = args;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      if (latestArgs) {
        callback(...latestArgs);
      }
      timeoutId = null;
      latestArgs = null;
    }, delay);
  };
}