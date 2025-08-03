# Touch Interactions Guide

This guide explains how to implement touch-friendly interactions in the DevPulse application.

## Overview

The touch interactions system provides utilities and components for creating touch-friendly interfaces that work well on mobile and tablet devices. It includes:

- Touch gesture detection (swipe, tap, long press, double tap, pinch)
- Touch-friendly UI components with appropriate sizing
- Haptic feedback support
- Swipe actions for common operations
- Optimized form controls for touch input

## Touch Utilities

The `touch-interactions.ts` utility provides several functions and hooks for working with touch interactions:

### Basic Functions

```typescript
// Check if the current device supports touch
const isTouch = isTouchDevice();

// Check if the current viewport is tablet-sized
const isTablet = isTabletViewport();

// Check if the current viewport is mobile-sized
const isMobile = isMobileViewport();

// Get a class name for touch-friendly sizing
const className = getTouchFriendlyClass('base-class');
const largeClassName = getTouchFriendlyClass('base-class', 'large');

// Provide haptic feedback (if supported by the device)
provideHapticFeedback('light'); // Options: 'light', 'medium', 'heavy'
```

### Touch Handlers Hook

The `useTouchHandlers` hook provides a way to handle various touch gestures:

```typescript
const touchHandlers = useTouchHandlers({
  // Handle swipe gestures (left, right, up, down)
  onSwipe: (event) => {
    console.log(`Swiped ${event.direction}`);
    console.log(`Distance: ${event.distance.x}px, ${event.distance.y}px`);
    
    // Check if it's a long swipe (useful for actions like delete)
    if (event.isLongSwipe) {
      console.log('Long swipe detected');
    }
  },
  
  // Handle tap gestures
  onTap: (event) => {
    console.log('Tapped');
  },
  
  // Handle long press gestures
  onLongPress: (event) => {
    console.log('Long pressed');
  },
  
  // Handle double tap gestures
  onDoubleTap: (event) => {
    console.log('Double tapped');
  },
  
  // Handle pinch gestures (for zoom)
  onPinch: (scale, event) => {
    console.log(`Pinch scale: ${scale}`);
  }
});

// Apply the handlers to a component
return (
  <div 
    {...touchHandlers}
    className="touch-target"
  >
    Touch me
  </div>
);
```

### Viewport Type Hook

The `useViewportType` hook provides the current viewport type:

```typescript
const viewportType = useViewportType(); // Returns 'mobile', 'tablet', or 'desktop'

return (
  <div>
    {viewportType === 'mobile' && <MobileView />}
    {viewportType === 'tablet' && <TabletView />}
    {viewportType === 'desktop' && <DesktopView />}
  </div>
);
```

## Touch-Friendly Components

The `TouchFriendlyControls` component provides several touch-optimized UI components:

### Button

```tsx
import TouchFriendlyControls from '@/components/ui/TouchFriendlyControls';

// Basic button
<TouchFriendlyControls.Button>
  Click Me
</TouchFriendlyControls.Button>

// Button variants
<TouchFriendlyControls.Button variant="secondary">
  Secondary Button
</TouchFriendlyControls.Button>

// Button sizes
<TouchFriendlyControls.Button size="lg">
  Large Button
</TouchFriendlyControls.Button>

// Button with icon
<TouchFriendlyControls.Button 
  icon={<Icon />}
  iconPosition="left"
>
  Button with Icon
</TouchFriendlyControls.Button>
```

### Form Controls

```tsx
// Select dropdown
<TouchFriendlyControls.Select
  label="Select Option"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  value={selectedOption}
  onChange={(e) => setSelectedOption(e.target.value)}
/>

// Text input
<TouchFriendlyControls.Input
  label="Text Input"
  placeholder="Enter text"
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
/>

// Checkbox
<TouchFriendlyControls.Checkbox
  label="Check me"
  checked={isChecked}
  onChange={() => setIsChecked(!isChecked)}
/>

// Radio button
<TouchFriendlyControls.Radio
  label="Select me"
  name="radio-group"
  value="option1"
/>

// Toggle switch
<TouchFriendlyControls.Toggle
  label="Enable feature"
  checked={isEnabled}
  onChange={() => setIsEnabled(!isEnabled)}
/>

// Slider
<TouchFriendlyControls.Slider
  label="Adjust value"
  min={0}
  max={100}
  value={sliderValue}
  onChange={(e) => setSliderValue(parseInt(e.target.value))}
  showValue
/>
```

### Tabs

```tsx
<TouchFriendlyControls.Tabs
  tabs={[
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3' }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

### Swipeable Components

```tsx
// Simple swipeable card
<TouchFriendlyControls.SwipeableCard
  onSwipeLeft={() => console.log('Swiped left')}
  onSwipeRight={() => console.log('Swiped right')}
>
  Swipe me left or right
</TouchFriendlyControls.SwipeableCard>

// Swipe to action (e.g., for list items)
<TouchFriendlyControls.SwipeToAction
  leftAction={{
    label: 'Archive',
    icon: <ArchiveIcon />,
    color: '#4CAF50',
    onAction: () => archiveItem(item.id)
  }}
  rightAction={{
    label: 'Delete',
    icon: <DeleteIcon />,
    color: '#F44336',
    onAction: () => deleteItem(item.id)
  }}
>
  <div className="p-4">
    <h3>List Item</h3>
    <p>Swipe left or right to perform actions</p>
  </div>
</TouchFriendlyControls.SwipeToAction>
```

## CSS Classes

The touch interactions system provides several CSS classes for touch-friendly styling:

```css
/* Basic touch target sizing (44x44px - iOS HIG recommendation) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 8px;
}

/* Larger touch targets (48x48px - Material Design recommendation) */
.touch-target-large {
  min-height: 48px;
  min-width: 48px;
  padding: 12px;
}

/* Touch feedback effect */
.touch-feedback {
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}

/* Touch-friendly form controls */
.touch-form-control {
  min-height: 48px;
  padding: 12px 16px;
  font-size: 16px; /* Prevents iOS zoom on focus */
}

/* Touch-friendly checkboxes and radio buttons */
.touch-checkbox,
.touch-radio {
  min-width: 24px;
  min-height: 24px;
}
```

## Best Practices

1. **Use appropriate touch target sizes**
   - Ensure interactive elements are at least 44x44px (iOS) or 48x48px (Material Design)
   - Add sufficient spacing between touch targets (at least 8px)

2. **Provide visual feedback**
   - Use the `touch-feedback` class for visual touch feedback
   - Consider haptic feedback for important actions

3. **Optimize form controls**
   - Use touch-friendly form controls with larger hit areas
   - Set font size to at least 16px to prevent iOS zoom on focus

4. **Implement gesture-based interactions**
   - Use swipe gestures for common actions (delete, archive, navigate)
   - Ensure gestures have visual indicators and feedback

5. **Test on actual devices**
   - Test touch interactions on real mobile and tablet devices
   - Consider different screen sizes and device capabilities

## Example Implementation

```tsx
import React, { useState } from 'react';
import TouchFriendlyControls from '@/components/ui/TouchFriendlyControls';
import { useTouchHandlers, provideHapticFeedback } from '@/lib/utils/touch-interactions';

export default function TouchExample() {
  const [message, setMessage] = useState('');
  
  const touchHandlers = useTouchHandlers({
    onSwipe: (event) => {
      setMessage(`Swiped ${event.direction}`);
      provideHapticFeedback('light');
    },
    onLongPress: () => {
      setMessage('Long pressed');
      provideHapticFeedback('medium');
    }
  });
  
  return (
    <div className="p-4">
      <div 
        {...touchHandlers}
        className="p-8 bg-gray-100 rounded-lg touch-feedback"
      >
        Touch interaction area
      </div>
      
      {message && (
        <div className="mt-4 p-2 bg-blue-100 rounded">
          {message}
        </div>
      )}
      
      <div className="mt-8">
        <TouchFriendlyControls.Button
          onClick={() => setMessage('Button clicked')}
        >
          Touch-friendly Button
        </TouchFriendlyControls.Button>
      </div>
    </div>
  );
}
```

## Accessibility Considerations

When implementing touch interactions, ensure they are accessible:

1. Always provide alternative interaction methods (e.g., buttons for swipe actions)
2. Ensure touch targets meet minimum size requirements (44x44px)
3. Provide clear visual feedback for touch interactions
4. Test with screen readers and assistive technologies
5. Follow WCAG 2.1 guidelines for touch interactions