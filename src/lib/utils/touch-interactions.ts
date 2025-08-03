/**
 * Touch Interactions Utility
 * 
 * Provides utilities for handling touch interactions in tablet and mobile interfaces
 */

// Minimum distance in pixels to register a swipe
const SWIPE_THRESHOLD = 50;
// Maximum time in milliseconds for a swipe to be registered
const SWIPE_TIMEOUT = 300;
// Minimum distance for a long swipe (used for actions like delete)
const LONG_SWIPE_THRESHOLD = 120;
// Minimum time in milliseconds for a long press
const LONG_PRESS_DURATION = 500;
// Maximum movement allowed during a tap (in pixels)
const TAP_MOVEMENT_THRESHOLD = 10;

export interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: {
    x: number;
    y: number;
  };
  target: EventTarget | null;
  isLongSwipe: boolean;
}

export interface TouchHandlers {
  onSwipe?: (event: SwipeEvent) => void;
  onTap?: (event: React.TouchEvent) => void;
  onLongPress?: (event: React.TouchEvent) => void;
  onDoubleTap?: (event: React.TouchEvent) => void;
  onPinch?: (scale: number, event: React.TouchEvent) => void;
}

/**
 * Creates touch event handlers for components
 */
export function useTouchHandlers(handlers: TouchHandlers) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let longPressTimer: NodeJS.Timeout | null = null;
  let lastTapTime = 0;
  let initialTouchDistance = 0;
  
  const handleTouchStart = (e: React.TouchEvent) => {
    // Handle multi-touch for pinch gestures
    if (e.touches.length === 2 && handlers.onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialTouchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
    
    // Handle single touch events
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
      
      // Set up long press timer
      if (handlers.onLongPress) {
        longPressTimer = setTimeout(() => {
          handlers.onLongPress?.(e);
        }, LONG_PRESS_DURATION);
      }
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    // Handle pinch gesture
    if (e.touches.length === 2 && handlers.onPinch && initialTouchDistance > 0) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scale = currentDistance / initialTouchDistance;
      handlers.onPinch(scale, e);
    }
    
    // For single touch, check if we should cancel long press due to movement
    if (e.touches.length === 1 && longPressTimer) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      // If moved more than threshold, cancel long press
      if (Math.abs(deltaX) > TAP_MOVEMENT_THRESHOLD || Math.abs(deltaY) > TAP_MOVEMENT_THRESHOLD) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    
    // Reset pinch initial distance
    initialTouchDistance = 0;
    
    // Process single touch end events
    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      const touchEndTime = Date.now();
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const deltaTime = touchEndTime - touchStartTime;
      
      // Check if it's a swipe
      if (deltaTime < SWIPE_TIMEOUT) {
        // Horizontal swipe
        if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
          const direction = deltaX > 0 ? 'right' : 'left';
          const isLongSwipe = Math.abs(deltaX) > LONG_SWIPE_THRESHOLD;
          
          handlers.onSwipe?.({
            direction,
            distance: { x: deltaX, y: deltaY },
            target: e.target,
            isLongSwipe
          });
        }
        // Vertical swipe
        else if (Math.abs(deltaY) > SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
          const direction = deltaY > 0 ? 'down' : 'up';
          const isLongSwipe = Math.abs(deltaY) > LONG_SWIPE_THRESHOLD;
          
          handlers.onSwipe?.({
            direction,
            distance: { x: deltaX, y: deltaY },
            target: e.target,
            isLongSwipe
          });
        }
        // Tap or Double Tap
        else if (Math.abs(deltaX) < TAP_MOVEMENT_THRESHOLD && Math.abs(deltaY) < TAP_MOVEMENT_THRESHOLD) {
          const now = Date.now();
          
          // Check for double tap
          if (handlers.onDoubleTap && now - lastTapTime < 300) {
            handlers.onDoubleTap(e);
            lastTapTime = 0; // Reset to prevent triple tap detection
          } 
          // Single tap
          else if (handlers.onTap) {
            handlers.onTap(e);
            lastTapTime = now;
          }
        }
      }
    }
  };
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

/**
 * Determines if the current device is likely a touch device
 */
export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Determines if the current viewport is likely a tablet
 */
export function isTabletViewport() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 640 && window.innerWidth <= 1024;
}

/**
 * Determines if the current viewport is likely a mobile device
 */
export function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 640;
}

/**
 * Adds touch-friendly sizing to an element's className
 */
export function getTouchFriendlyClass(baseClass: string = '', size: 'default' | 'large' = 'default') {
  return `${baseClass} ${size === 'large' ? 'touch-target-large' : 'touch-target'}`;
}

/**
 * Hook to detect and respond to viewport changes
 */
export function useViewportType() {
  const [viewportType, setViewportType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setViewportType('mobile');
      } else if (window.innerWidth <= 1024) {
        setViewportType('tablet');
      } else {
        setViewportType('desktop');
      }
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return viewportType;
}

/**
 * Provides haptic feedback if available on the device
 */
export function provideHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  
  switch (type) {
    case 'light':
      navigator.vibrate(10);
      break;
    case 'medium':
      navigator.vibrate(20);
      break;
    case 'heavy':
      navigator.vibrate([30, 10, 30]);
      break;
  }
}