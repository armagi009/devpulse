import { renderHook, act } from '@testing-library/react';
import { 
  useKeyboardShortcuts, 
  registerShortcutGroup, 
  unregisterShortcutGroup, 
  getAllShortcutGroups,
  formatShortcut
} from '../keyboard-shortcuts';

describe('Keyboard Shortcuts Utility', () => {
  // Clear all shortcuts before each test
  beforeEach(() => {
    // Clear all registered shortcuts
    const groups = getAllShortcutGroups();
    groups.forEach(group => {
      unregisterShortcutGroup(group.name);
    });
  });
  
  describe('registerShortcutGroup', () => {
    it('should register a shortcut group', () => {
      const group = {
        name: 'Test Group',
        shortcuts: [
          {
            key: 'a',
            description: 'Test Shortcut',
            action: jest.fn()
          }
        ]
      };
      
      registerShortcutGroup(group);
      
      const groups = getAllShortcutGroups();
      expect(groups).toHaveLength(1);
      expect(groups[0].name).toBe('Test Group');
      expect(groups[0].shortcuts).toHaveLength(1);
      expect(groups[0].shortcuts[0].key).toBe('a');
    });
    
    it('should replace an existing group with the same name', () => {
      const group1 = {
        name: 'Test Group',
        shortcuts: [
          {
            key: 'a',
            description: 'Test Shortcut 1',
            action: jest.fn()
          }
        ]
      };
      
      const group2 = {
        name: 'Test Group',
        shortcuts: [
          {
            key: 'b',
            description: 'Test Shortcut 2',
            action: jest.fn()
          }
        ]
      };
      
      registerShortcutGroup(group1);
      registerShortcutGroup(group2);
      
      const groups = getAllShortcutGroups();
      expect(groups).toHaveLength(1);
      expect(groups[0].shortcuts[0].key).toBe('b');
    });
  });
  
  describe('unregisterShortcutGroup', () => {
    it('should unregister a shortcut group', () => {
      const group = {
        name: 'Test Group',
        shortcuts: [
          {
            key: 'a',
            description: 'Test Shortcut',
            action: jest.fn()
          }
        ]
      };
      
      registerShortcutGroup(group);
      unregisterShortcutGroup('Test Group');
      
      const groups = getAllShortcutGroups();
      expect(groups).toHaveLength(0);
    });
  });
  
  describe('formatShortcut', () => {
    it('should format a simple shortcut', () => {
      const shortcut = {
        key: 'a',
        description: 'Test Shortcut',
        action: jest.fn()
      };
      
      expect(formatShortcut(shortcut)).toBe('A');
    });
    
    it('should format a shortcut with modifiers', () => {
      const shortcut = {
        key: 'a',
        ctrlKey: true,
        altKey: true,
        description: 'Test Shortcut',
        action: jest.fn()
      };
      
      expect(formatShortcut(shortcut)).toBe('Ctrl + Alt + A');
    });
    
    it('should format space key correctly', () => {
      const shortcut = {
        key: ' ',
        description: 'Test Shortcut',
        action: jest.fn()
      };
      
      expect(formatShortcut(shortcut)).toBe('Space');
    });
  });
  
  describe('useKeyboardShortcuts', () => {
    it('should register keyboard shortcuts', () => {
      const shortcut = {
        key: 'a',
        description: 'Test Shortcut',
        action: jest.fn(),
        preventDefault: true
      };
      
      renderHook(() => useKeyboardShortcuts([shortcut]));
      
      // Simulate keydown event
      const event = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(event);
      
      expect(shortcut.action).toHaveBeenCalled();
    });
    
    it('should not trigger shortcuts when disabled', () => {
      const shortcut = {
        key: 'a',
        description: 'Test Shortcut',
        action: jest.fn(),
        preventDefault: true
      };
      
      renderHook(() => useKeyboardShortcuts([shortcut], false));
      
      // Simulate keydown event
      const event = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(event);
      
      expect(shortcut.action).not.toHaveBeenCalled();
    });
    
    it('should match shortcuts with modifiers', () => {
      const shortcut = {
        key: 'a',
        ctrlKey: true,
        description: 'Test Shortcut',
        action: jest.fn(),
        preventDefault: true
      };
      
      renderHook(() => useKeyboardShortcuts([shortcut]));
      
      // Simulate keydown event without Ctrl
      let event = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(event);
      
      expect(shortcut.action).not.toHaveBeenCalled();
      
      // Simulate keydown event with Ctrl
      event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
      document.dispatchEvent(event);
      
      expect(shortcut.action).toHaveBeenCalled();
    });
  });
});