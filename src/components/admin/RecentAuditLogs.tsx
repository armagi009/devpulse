/**
 * Recent Audit Logs Component
 * 
 * Displays recent audit logs for administrators
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: string;
  user?: {
    username: string;
    avatarUrl?: string;
  };
}

interface RecentAuditLogsProps {
  logs?: AuditLog[];
}

export default function RecentAuditLogs({ logs: propLogs }: RecentAuditLogsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  // Ensure logs is always an array
  const safeLogs = Array.isArray(logs) ? logs : [];
  
  // Use provided logs or fetch them
  useEffect(() => {
    if (propLogs) {
      setLogs(propLogs);
      setLoading(false);
      return;
    }

    const fetchRecentLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Generate mock data for demonstration
        const mockLogs: AuditLog[] = [
          {
            id: '1',
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: 'user-123',
            description: 'User logged in successfully',
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
            user: {
              username: 'john.doe',
              avatarUrl: undefined
            }
          },
          {
            id: '2',
            action: 'REPOSITORY_SYNC',
            entityType: 'Repository',
            entityId: 'repo-456',
            description: 'Repository sync completed',
            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
            user: {
              username: 'system',
              avatarUrl: undefined
            }
          },
          {
            id: '3',
            action: 'USER_SETTINGS_UPDATE',
            entityType: 'User',
            entityId: 'user-789',
            description: 'User updated notification preferences',
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            user: {
              username: 'jane.smith',
              avatarUrl: undefined
            }
          },
          {
            id: '4',
            action: 'TEAM_CREATED',
            entityType: 'Team',
            entityId: 'team-101',
            description: 'New team created: Frontend Team',
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
            user: {
              username: 'admin',
              avatarUrl: undefined
            }
          },
          {
            id: '5',
            action: 'BURNOUT_ALERT',
            entityType: 'User',
            entityId: 'user-555',
            description: 'High burnout risk detected for user',
            createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
            user: {
              username: 'system',
              avatarUrl: undefined
            }
          }
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setLogs(mockLogs);
      } catch (error) {
        console.error('Error fetching recent audit logs:', error);
        setError('Failed to fetch recent audit logs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentLogs();
  }, [propLogs]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => setLoading(true)}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
        <button
          onClick={() => router.push('/dashboard/admin/audit-logs')}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All
        </button>
      </div>
      
      {safeLogs.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {safeLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3">
              {log.user?.avatarUrl ? (
                <img
                  src={log.user.avatarUrl}
                  alt={log.user.username}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {log.user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {log.user?.username || 'Unknown User'}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400" title={formatDate(log.createdAt)}>
                    {timeAgo(log.createdAt)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-medium">{log.action}</span> - {log.description}
                </p>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {log.entityType} {log.entityId}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}