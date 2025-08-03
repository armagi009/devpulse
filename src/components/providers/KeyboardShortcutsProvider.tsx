'use client';

/**
 * KeyboardShortcutsProvider Component
 * 
 * Provides keyboard shortcuts functionality throughout the application
 * and registers global shortcuts.
 */

import React, { useState, useEffect } from 'react';
import { registerShortcutGroup, useKeyboardShortcuts } from '@/lib/utils/keyboard-shortcuts';
import KeyboardShortcutsDialog from '@/components/ui/KeyboardShortcutsDialog';

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export default function KeyboardShortcutsProvider({
  children
}: KeyboardShortcutsProviderProps) {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  
  // Register global shortcuts
  useEffect(() => {
    registerShortcutGroup({
      name: 'Global',
      shortcuts: [
        {
          key: '?',
          description: 'Show keyboard shortcuts',
          action: () => setShowShortcutsDialog(true),
          preventDefault: true
        },
        {
          key: 'g',
          ctrlKey: true,
          description: 'Go to dashboard',
          action: () => window.location.href = '/dashboard',
          preventDefault: true
        },
        {
          key: 'h',
          ctrlKey: true,
          description: 'Go home',
          action: () => window.location.href = '/',
          preventDefault: true
        }
      ]
    });
    
    registerShortcutGroup({
      name: 'Navigation',
      shortcuts: [
        {
          key: '1',
          altKey: true,
          description: 'Go to dashboard',
          action: () => window.location.href = '/dashboard',
          preventDefault: true
        },
        {
          key: '2',
          altKey: true,
          description: 'Go to productivity',
          action: () => window.location.href = '/dashboard/productivity',
          preventDefault: true
        },
        {
          key: '3',
          altKey: true,
          description: 'Go to burnout radar',
          action: () => window.location.href = '/dashboard/burnout',
          preventDefault: true
        },
        {
          key: '4',
          altKey: true,
          description: 'Go to team',
          action: () => window.location.href = '/dashboard/team',
          preventDefault: true
        },
        {
          key: '5',
          altKey: true,
          description: 'Go to repositories',
          action: () => window.location.href = '/dashboard/repositories',
          preventDefault: true
        },
        {
          key: '6',
          altKey: true,
          description: 'Go to retrospectives',
          action: () => window.location.href = '/dashboard/retrospective',
          preventDefault: true
        }
      ]
    });
    
    registerShortcutGroup({
      name: 'Actions',
      shortcuts: [
        {
          key: 'r',
          ctrlKey: true,
          description: 'Refresh data',
          action: () => window.location.reload(),
          preventDefault: true
        },
        {
          key: 'f',
          ctrlKey: true,
          description: 'Focus search',
          action: () => {
            const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          },
          preventDefault: true
        }
      ]
    });
  }, []);
  
  // Register keyboard shortcuts for this component
  useKeyboardShortcuts([
    {
      key: 'Escape',
      description: 'Close dialogs',
      action: () => setShowShortcutsDialog(false),
      preventDefault: true
    }
  ]);
  
  return (
    <>
      {children}
      <KeyboardShortcutsDialog 
        isOpen={showShortcutsDialog} 
        onClose={() => setShowShortcutsDialog(false)} 
      />
    </>
  );
}