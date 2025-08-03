# DevPulse UI Components

This directory contains the UI components used throughout the DevPulse application. These components are designed to be reusable, accessible, and responsive.

## Desktop-Optimized Components

The following components are specifically designed to optimize the desktop experience:

### ResponsiveGrid

A flexible grid layout component that adapts to different screen sizes and allows for customizable column configurations.

```tsx
import ResponsiveGrid, { ResponsiveGridItem } from '@/components/ui/ResponsiveGrid';

// Basic usage
<ResponsiveGrid columns={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</ResponsiveGrid>

// Advanced usage with responsive columns
<ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</ResponsiveGrid>

// With grid items that span multiple columns/rows
<ResponsiveGrid columns={4}>
  <ResponsiveGridItem colSpan={2} rowSpan={1}>
    <div>Wide Item</div>
  </ResponsiveGridItem>
  <div>Regular Item</div>
  <div>Regular Item</div>
</ResponsiveGrid>
```

### DashboardCard

A flexible card component for dashboard layouts with various display options.

```tsx
import DashboardCard from '@/components/ui/DashboardCard';

// Basic usage
<DashboardCard title="Card Title">
  <p>Card content</p>
</DashboardCard>

// With subtitle, icon, and actions
<DashboardCard 
  title="Card Title" 
  subtitle="Card Subtitle"
  icon={<SomeIcon />}
  actions={<button>Action</button>}
>
  <p>Card content</p>
</DashboardCard>

// With footer
<DashboardCard 
  title="Card Title"
  footer={<button>View More</button>}
>
  <p>Card content</p>
</DashboardCard>

// Collapsible card
<DashboardCard 
  title="Collapsible Card"
  collapsible={true}
  defaultCollapsed={false}
>
  <p>Card content</p>
</DashboardCard>

// Loading and error states
<DashboardCard loading={true}>
  <p>This content won't be shown while loading</p>
</DashboardCard>

<DashboardCard error="An error occurred">
  <p>This content won't be shown when there's an error</p>
</DashboardCard>
```

### KeyboardShortcutsDialog

A dialog that displays all available keyboard shortcuts in the application.

```tsx
import KeyboardShortcutsDialog from '@/components/ui/KeyboardShortcutsDialog';

// Basic usage
const [isOpen, setIsOpen] = useState(false);

<KeyboardShortcutsDialog 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
/>

// Open the dialog
<button onClick={() => setIsOpen(true)}>Show Keyboard Shortcuts</button>
```

## Layout Components

### MultiColumnLayout

A layout component that optimizes content for desktop displays by arranging content in multiple columns.

```tsx
import MultiColumnLayout from '@/components/layout/MultiColumnLayout';

// Basic usage
<MultiColumnLayout>
  <div>Main content</div>
</MultiColumnLayout>

// With sidebar and right panel
<MultiColumnLayout
  sidebar={<div>Sidebar content</div>}
  rightPanel={<div>Right panel content</div>}
>
  <div>Main content</div>
</MultiColumnLayout>

// With custom widths and collapsible panels
<MultiColumnLayout
  sidebar={<div>Sidebar content</div>}
  rightPanel={<div>Right panel content</div>}
  sidebarWidth="300px"
  rightPanelWidth="250px"
  collapsible={true}
>
  <div>Main content</div>
</MultiColumnLayout>
```

## Keyboard Shortcuts

The application includes a keyboard shortcuts system that allows users to navigate and perform actions quickly. The following components and utilities are available:

### KeyboardShortcutsProvider

A provider component that registers global shortcuts and makes them available throughout the application.

```tsx
import KeyboardShortcutsProvider from '@/components/providers/KeyboardShortcutsProvider';

// Wrap your application with the provider
<KeyboardShortcutsProvider>
  <App />
</KeyboardShortcutsProvider>
```

### useKeyboardShortcuts

A hook for registering keyboard shortcuts in a component.

```tsx
import { useKeyboardShortcuts } from '@/lib/utils/keyboard-shortcuts';

// Register shortcuts in a component
useKeyboardShortcuts([
  {
    key: 'g',
    ctrlKey: true,
    description: 'Go to dashboard',
    action: () => router.push('/dashboard'),
    preventDefault: true
  },
  {
    key: 'h',
    ctrlKey: true,
    description: 'Go home',
    action: () => router.push('/'),
    preventDefault: true
  }
]);
```

## Accessibility

All components are designed with accessibility in mind. They include:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader announcements
- Sufficient color contrast

## Responsive Design

Components are designed to work well on all screen sizes, from mobile to desktop. They use:

- Responsive grid layouts
- Flexible sizing
- Mobile-first approach
- Adaptive layouts based on screen size
- Touch-friendly controls for mobile devices