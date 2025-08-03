/**
 * Mode Boundary Warning Component
 * 
 * This component displays a warning when users are about to perform actions
 * that would cross mode boundaries (e.g., saving mock data to a live system).
 */

'use client';

import React, { useState } from 'react';
import { useMode } from '@/lib/context/ModeContext';
import { AppMode } from '@/lib/types/roles';

interface ModeBoundaryWarningProps {
  children: React.ReactNode;
  actionType: 'save' | 'delete' | 'modify' | 'export' | 'import' | 'custom';
  customWarning?: string;
  onProceed?: () => void;
  onCancel?: () => void;
  disableWarning?: boolean;
}

export default function ModeBoundaryWarning({
  children,
  actionType,
  customWarning,
  onProceed,
  onCancel,
  disableWarning = false,
}: ModeBoundaryWarningProps) {
  const { mode, isMockOrDemo } = useMode();
  const [showWarning, setShowWarning] = useState(false);
  
  // If not in mock or demo mode, or warning is disabled, just render children
  if (!isMockOrDemo() || disableWarning) {
    return <>{children}</>;
  }
  
  // Generate warning message based on action type
  const getWarningMessage = () => {
    if (customWarning) {
      return customWarning;
    }
    
    switch (actionType) {
      case 'save':
        return `You are about to save data while in ${mode} mode. This data will not be saved to the production system.`;
      case 'delete':
        return `You are about to delete data while in ${mode} mode. This will not affect the production system.`;
      case 'modify':
        return `You are about to modify data while in ${mode} mode. These changes will not affect the production system.`;
      case 'export':
        return `You are about to export data from ${mode} mode. This data is not from the production system.`;
      case 'import':
        return `You are about to import data while in ${mode} mode. This data will not be imported to the production system.`;
      default:
        return `You are about to perform an action while in ${mode} mode. This may not affect the production system.`;
    }
  };
  
  // Handle click on the child element
  const handleClick = (e: React.MouseEvent) => {
    // If warning is already showing, don't do anything
    if (showWarning) {
      return;
    }
    
    // Prevent the default action
    e.preventDefault();
    e.stopPropagation();
    
    // Show the warning
    setShowWarning(true);
  };
  
  // Handle proceeding with the action
  const handleProceed = () => {
    setShowWarning(false);
    if (onProceed) {
      onProceed();
    }
  };
  
  // Handle canceling the action
  const handleCancel = () => {
    setShowWarning(false);
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <>
      <div onClick={handleClick}>
        {children}
      </div>
      
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-foreground">
                  {mode} Mode Warning
                </h3>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>{getWarningMessage()}</p>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn btn-sm bg-muted hover:bg-muted/80 text-foreground"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm bg-warning-500 hover:bg-warning-600 text-white"
                    onClick={handleProceed}
                  >
                    Proceed Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}