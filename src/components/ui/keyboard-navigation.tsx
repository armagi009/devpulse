/**
 * Keyboard Navigation Components
 * Components and hooks for improving keyboard navigation
 */

import React, { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { generateAccessibilityId } from './accessibility-utils';

/**
 * SkipLink Component
 * Creates a skip link for keyboard users to bypass navigation
 */
export function SkipLink({ targetId, children }: { targetId: string, children: React.ReactNode }) {
  return (
    <a 
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:outline focus:outline-2 focus:outline-blue-500"
    >
      {children}
    </a>
  );
}

/**
 * FocusTrap Component
 * Traps focus within a component for modals and dialogs
 */
export function FocusTrap({ children, active = true }: { children: React.ReactNode, active?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown as any);
    
    // Focus the first element when the trap is activated
    if (firstElement) {
      firstElement.focus();
    }
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [active]);
  
  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}

/**
 * KeyboardNavList Component
 * Enhances list navigation with keyboard support
 */
export function KeyboardNavList({ 
  children, 
  orientation = 'vertical',
  onItemSelect,
  className
}: { 
  children: React.ReactNode, 
  orientation?: 'vertical' | 'horizontal',
  onItemSelect?: (index: number) => void,
  className?: string
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listId = generateAccessibilityId('nav-list');
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!listRef.current) return;
    
    const items = Array.from(listRef.current.children);
    
    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical') {
          e.preventDefault();
          const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
          setActiveIndex(nextIndex);
          (items[nextIndex] as HTMLElement).focus();
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical') {
          e.preventDefault();
          const prevIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
          setActiveIndex(prevIndex);
          (items[prevIndex] as HTMLElement).focus();
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          e.preventDefault();
          const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
          setActiveIndex(nextIndex);
          (items[nextIndex] as HTMLElement).focus();
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          e.preventDefault();
          const prevIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
          setActiveIndex(prevIndex);
          (items[prevIndex] as HTMLElement).focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        (items[0] as HTMLElement).focus();
        break;
      case 'End':
        e.preventDefault();
        const lastIndex = items.length - 1;
        setActiveIndex(lastIndex);
        (items[lastIndex] as HTMLElement).focus();
        break;
      case 'Enter':
      case ' ':
        if (activeIndex >= 0 && onItemSelect) {
          e.preventDefault();
          onItemSelect(activeIndex);
        }
        break;
    }
  };
  
  // Clone children to add necessary props
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        role: 'option',
        tabIndex: index === 0 ? 0 : -1,
        'aria-selected': index === activeIndex,
        onFocus: () => setActiveIndex(index),
        ...child.props
      });
    }
    return child;
  });
  
  return (
    <ul
      ref={listRef}
      id={listId}
      className={className}
      role="listbox"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
    >
      {enhancedChildren}
    </ul>
  );
}

/**
 * useKeyboardShortcut Hook
 * Hook for adding keyboard shortcuts to components
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean, alt?: boolean, shift?: boolean, meta?: boolean } = {}
) {
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      const { ctrl = false, alt = false, shift = false, meta = false } = modifiers;
      
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        e.ctrlKey === ctrl &&
        e.altKey === alt &&
        e.shiftKey === shift &&
        e.metaKey === meta
      ) {
        e.preventDefault();
        callback();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, modifiers]);
}