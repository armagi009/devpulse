'use client';

/**
 * Sync Status Badge Component
 * Displays the sync status of a repository
 */

import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';

// Sync status badge props
interface SyncStatusBadgeProps {
  lastSyncedAt: Date | null;
  isLoading?: boolean;
  onClick?: () => void;
}

export default function SyncStatusBadge({
  lastSyncedAt,
  isLoading = false,
  onClick,
}: SyncStatusBadgeProps) {
  // Determine status
  let status: 'never' | 'recent' | 'outdated' = 'never';
  let statusText = 'Never synced';
  let statusColor = 'bg-gray-500';
  let timeAgo = '';
  
  if (lastSyncedAt) {
    const now = new Date();
    const daysSinceSync = Math.floor((now.getTime() - lastSyncedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceSync < 1) {
      status = 'recent';
      statusText = 'Recently synced';
      statusColor = 'bg-green-500';
    } else {
      status = 'outdated';
      statusText = 'Needs sync';
      statusColor = 'bg-yellow-500';
    }
    
    timeAgo = formatDistanceToNow(lastSyncedAt, { addSuffix: true });
  }
  
  // Handle loading state
  if (isLoading) {
    statusText = 'Syncing...';
    statusColor = 'bg-blue-500';
  }
  
  return (
    <div 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
      onClick={onClick}
    >
      <span className={`mr-1.5 h-2 w-2 rounded-full ${statusColor}`}></span>
      <span>{statusText}</span>
      {lastSyncedAt && (
        <span className="ml-1 text-gray-500 dark:text-gray-400">
          ({timeAgo})
        </span>
      )}
    </div>
  );
}