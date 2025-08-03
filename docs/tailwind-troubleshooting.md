# Tailwind CSS Troubleshooting Guide

This guide helps diagnose and fix common Tailwind CSS issues in the DevPulse application.

## Quick Start

If you're seeing unstyled components (plain HTML), follow these steps:

1. Run the fix script:
   ```bash
   npm run fix:tailwind
   ```

2. Restart the development server:
   ```bash
   npm run dev
   ```

3. Visit the diagnostic page:
   ```
   http://localhost:3000/dev/css-diagnostic
   ```

## Common Issues and Solutions

### 1. Plain HTML Appearance (No Styling)

**Symptoms:**
- Components look like unstyled HTML
- No colors, spacing, or other Tailwind styles are applied

**Solutions:**

a) **Check Tailwind Configuration:**
   - Verify `tailwind.config.js` exists and has correct content paths
   - Ensure `postcss.config.js` includes Tailwind and Autoprefixer

b) **Check CSS Imports:**
   - Make sure `globals.css` includes the Tailwind directives:
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
     ```
   - Verify `globals.css` is imported in `layout.tsx`

c) **Reset Tailwind:**
   If all else fails, reset Tailwind completely:
   ```bash
   npm run reset:tailwind
   ```

### 2. Inconsistent Styling

**Symptoms:**
- Some components are styled, others are not
- Styles appear in development but not in production

**Solutions:**

a) **Check Content Paths:**
   - Ensure all component directories are included in `tailwind.config.js`
   - Example:
     ```js
     content: [
       './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
       './src/components/**/*.{js,ts,jsx,tsx,mdx}',
       './src/app/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     ```

b) **Check for CSS Conflicts:**
   - Look for other CSS files that might override Tailwind
   - Check for inline styles that might take precedence

c) **Clear Cache:**
   - Clear browser cache (hard refresh with Ctrl+F5)
   - Clear Next.js cache:
     ```bash
     rm -rf .next
     ```

### 3. Production Build Issues

**Symptoms:**
- Styles work in development but not in production

**Solutions:**

a) **Check Purging:**
   - Tailwind purges unused styles in production
   - Make sure all used classes are in files matched by content paths

b) **Rebuild and Test:**
   ```bash
   npm run build && npm run start
   ```

c) **Check for Dynamic Classes:**
   - Dynamically constructed class names might be purged
   - Use safelist in `tailwind.config.js` for dynamic classes:
     ```js
     safelist: [
       'bg-red-500',
       'bg-green-500',
       'bg-blue-500',
       // Add other dynamic classes
     ]
     ```

## Diagnostic Tools

### CSS Diagnostic Page

Visit `/dev/css-diagnostic` to see a comprehensive test of Tailwind styles.
This page will show if Tailwind is loading properly and help identify issues.

### Tailwind Test Page

Visit `/dev/tailwind-test` for a simpler test focused on core Tailwind functionality.

### Minimal Test Component

Use the `MinimalTest` component to test Tailwind in isolation:

```jsx
import MinimalTest from '../components/ui/MinimalTest';

export default function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <MinimalTest />
    </div>
  );
}
```

## Scripts

- `npm run fix:tailwind` - Diagnose and fix common Tailwind issues
- `npm run reset:tailwind` - Completely reset and rebuild Tailwind configuration
- `npm run css:check` - Start a server and open the CSS diagnostic page

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js with Tailwind CSS](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
- [Troubleshooting Tailwind CSS](https://tailwindcss.com/docs/content-configuration#troubleshooting)