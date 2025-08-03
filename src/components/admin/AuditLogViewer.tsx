/**
 * Audit Log Viewer Component
 * 
 * Displays audit logs with filtering and pagination for administrators
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata: any;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    username: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function AuditLogViewer() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });
  
  // Filter states
  const [userId, setUserId] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [entityType, setEntityType] = useState<string>('');
  const [entityId, setEntityId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Sort states
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (action) params.append('action', action);
      if (entityType) params.append('entityType', entityType);
      if (entityId) params.append('entityId', entityId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      // Make API request
      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      
      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    if (session?.user?.role === 'ADMINISTRATOR') {
      fetchAuditLogs();
    }
  }, [session, pagination.page, sortBy, sortOrder]);
  
  // Handle filter submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    fetchAuditLogs();
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Default to descending for new column
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Show loading state
  if (loading && logs.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error</h3>
        <p className="text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={fetchAuditLogs}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Filter form */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Filter Audit Logs
        </h3>
        
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Action
              </label>
              <input
                type="text"
                id="action"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="e.g. LOGIN, UPDATE_USER"
              />
            </div>
            
            <div>
              <label htmlFor="entityType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Entity Type
              </label>
              <input
                type="text"
                id="entityType"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                placeholder="e.g. User, Repository"
              />
            </div>
            
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User ID
              </label>
              <input
                type="text"
                id="userId"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User ID"
              />
            </div>
            
            <div>
              <label htmlFor="entityId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Entity ID
              </label>
              <input
                type="text"
                id="entityId"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="Entity ID"
              />
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setUserId('');
                setAction('');
                setEntityType('');
                setEntityId('');
                setStartDate('');
                setEndDate('');
              }}
              className="px-4 py-2 mr-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Clear Filters
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Filtering...' : 'Apply Filters'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Audit logs table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('createdAt')}
                >
                  <div className="flex items-center">
                    Timestamp
                    {sortBy === 'createdAt' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('action')}
                >
                  <div className="flex items-center">
                    Action
                    {sortBy === 'action' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('entityType')}
                >
                  <div className="flex items-center">
                    Entity Type
                    {sortBy === 'entityType' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.entityType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.user ? (
                        <div className="flex items-center">
                          {log.user.avatarUrl && (
                            <img
                              src={log.user.avatarUrl}
                              alt={log.user.username}
                              className="h-6 w-6 rounded-full mr-2"
                            />
                          )}
                          <span>{log.user.username}</span>
                        </div>
                      ) : (
                        <span>Unknown User</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <button
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => {
                          // Show details in a modal or expandable section
                          alert(JSON.stringify(log.metadata, null, 2));
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
              </span>{' '}
              of <span className="font-medium">{pagination.totalCount}</span> results
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 border rounded-md ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}