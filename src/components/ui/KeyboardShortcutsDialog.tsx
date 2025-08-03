'use client';

/**
 * KeyboardShortcutsDialog Component
 * 
 * A dialog that displays all available keyboard shortcuts in the application.
 */

import React, { useState, useEffect } from 'react';
import { useShortcutsHelp, useKeyboardShortcuts } from '@/lib/utils/keyboard-shortcuts';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsDialog({
  isOpen,
  onClose
}: KeyboardShortcutsDialogProps) {
  const shortcuts = useShortcutsHelp();
  
  // Register keyboard shortcut to close dialog with Escape
  useKeyboardShortcuts([
    {
      key: 'Escape',
      description: 'Close dialog',
      action: onClose,
      preventDefault: true
    }
  ], isOpen);
  
  // Handle click outside to close
  const dialogRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        ref={dialogRef}
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl"
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {shortcuts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No keyboard shortcuts registered</p>
          ) : (
            <div className="space-y-6">
              {shortcuts.map((group, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{group.name}</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Shortcut
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {group.shortcuts.map((shortcut, shortcutIndex) => (
                          <tr key={shortcutIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">
                              <span className="inline-flex items-center px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {shortcut.key}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {shortcut.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
          <p>Press <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono">?</kbd> anywhere in the application to open this dialog.</p>
        </div>
      </div>
    </div>
  );
}