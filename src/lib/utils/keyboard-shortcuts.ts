/**
 * Keyboard Shortcuts Utility
 * 
 * This module provides utilities for registering and handling keyboard shortcuts
 * throughout the application.
 */

import { useEffect, useCallback, useRef } from 'react';

export type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
};

export type ShortcutGroup = {
  name: string;
  shortcuts: KeyboardShortcut[];
};

// Global registry of all keyboard shortcuts
const globalShortcuts: ShortcutGroup[] = [];

/**
 * Register a group of shortcuts globally
 */
export function registerShortcutGroup(group: ShortcutGroup): void {
  // Check if group already exists
  const existingGroupIndex = globalShortcuts.findIndex(g => g.name === group.name);
  
  if (existingGroupIndex >= 0) {
    // Replace existing group
    globalShortcuts[existingGroupIndex] = group;
  } else {
    // Add new group
    globalShortcuts.push(group);
  }
}

/**
 * Unregister a group of shortcuts
 */
export function unregisterShortcutGroup(groupName: string): void {
  const index = globalShortcuts.findIndex(g => g.name === groupName);
  if (index >= 0) {
    globalShortcuts.splice(index, 1);
  }
}

/**
 * Get all registered shortcut groups
 */
export function getAllShortcutGroups(): ShortcutGroup[] {
  return [...globalShortcuts];
}

/**
 * Check if a keyboard event matches a shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  return (
    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
    !!event.ctrlKey === !!shortcut.ctrlKey &&
    !!event.altKey === !!shortcut.altKey &&
    !!event.shiftKey === !!shortcut.shiftKey &&
    !!event.metaKey === !!shortcut.metaKey
  );
}

/**
 * Format a keyboard shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Win');
  
  // Format the key
  let key = shortcut.key;
  if (key === ' ') key = 'Space';
  if (key.length === 1) key = key.toUpperCase();
  
  parts.push(key);
  
  return parts.join(' + ');
}

/**
 * React hook for using keyboard shortcuts in a component
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
): void {
  // Use a ref to keep the latest shortcuts without triggering effect
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;
  
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Skip if user is typing in an input, textarea, or contentEditable element
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }
      
      for (const shortcut of shortcutsRef.current) {
        if (matchesShortcut(event, shortcut)) {
          if (shortcut.preventDefault) {
            event.preventDefault();
          }
          
          if (shortcut.stopPropagation) {
            event.stopPropagation();
          }
          
          shortcut.action();
          return;
        }
      }
    },
    [enabled]
  );
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Component for displaying keyboard shortcuts help
 */
export function useShortcutsHelp() {
  // Get all registered shortcuts
  const allShortcuts = getAllShortcutGroups();
  
  // Format shortcuts for display
  const formattedShortcuts = allShortcuts.map(group => ({
    name: group.name,
    shortcuts: group.shortcuts.map(shortcut => ({
      key: formatShortcut(shortcut),
      description: shortcut.description
    }))
  }));
  
  return formattedShortcuts;
}