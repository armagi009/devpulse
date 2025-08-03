/**
 * useResizeObserver Hook
 * 
 * A custom hook that uses ResizeObserver to track element dimensions.
 * This is useful for responsive components that need to adapt to container size changes.
 */

import { useEffect, useState, useRef, RefObject } from 'react';

interface ResizeObserverEntry {
  target: Element;
  contentRect: DOMRectReadOnly;
  borderBoxSize: ReadonlyArray<ResizeObserverSize>;
  contentBoxSize: ReadonlyArray<ResizeObserverSize>;
  devicePixelContentBoxSize: ReadonlyArray<ResizeObserverSize>;
}

interface ResizeObserverSize {
  inlineSize: number;
  blockSize: number;
}

/**
 * Hook that observes and returns the size of a DOM element
 */
export function useResizeObserver<T extends HTMLElement = HTMLDivElement>(
  ref: RefObject<T>,
  debounceMs: number = 0
) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Handler for resize events
    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (!entries.length) return;

      const entry = entries[0];
      
      // Clear any existing timeout
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      // Apply debounce if specified
      if (debounceMs > 0) {
        debounceTimeout.current = setTimeout(() => {
          setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }, debounceMs);
      } else {
        // Update immediately if no debounce
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };

    // Create and connect the observer
    resizeObserver.current = new ResizeObserver(
      handleResize as ResizeObserverCallback
    );
    resizeObserver.current.observe(element);

    // Set initial size
    setSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    // Cleanup
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, [ref, debounceMs]);

  return size;
}