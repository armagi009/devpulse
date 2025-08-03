/**
 * Data Management Settings Component
 * 
 * Allows users to export and delete their data
 */

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ExportOptions {
  entityTypes: string[];
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  includePersonalData: boolean;
  includeRepositoryData: boolean;
}

interface DeletionOptions {
  reason?: string;
  deleteType: 'soft' | 'hard';
  exportBeforeDelete: boolean;
  entityTypes?: string[];
}

export default function DataManagementSettings() {
  const { data: session } = useSession();
  const router = useRouter();
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const [deletionSuccess, setDeletionSuccess] = useState<string | null>(null);
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false);
  const [scheduledDeletion, setScheduledDeletion] = useState(false);
  
  // Export options state
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    entityTypes: ['User', 'BurnoutMetric', 'PullRequest', 'Issue'],
    format: 'json',
    includePersonalData: true,
    includeRepositoryData: true,
  });
  
  // Deletion options state
  const [deletionOptions, setDeletionOptions] = useState<DeletionOptions>({
    deleteType: 'soft',
    exportBeforeDelete: true,
  });
  
  // Date range state for export
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Scheduled deletion date
  const [scheduledDate, setScheduledDate] = useState<string>('');
  
  // Handle export options change
  const handleExportOptionChange = (field: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle entity type selection for export
  const handleEntityTypeChange = (entityType: string, checked: boolean) => {
    setExportOptions(prev => {
      if (checked) {
        return { ...prev, entityTypes: [...prev.entityTypes, entityType] };
      } else {
        return { ...prev, entityTypes: prev.entityTypes.filter(type => type !== entityType) };
      }
    });
  };
  
  // Handle deletion options change
  const handleDeletionOptionChange = (field: keyof DeletionOptions, value: any) => {
    setDeletionOptions(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle data export
  const handleExportData = async () => {
    if (!session?.user?.id) return;
    
    try {
      setExportLoading(true);
      setExportError(null);
      setExportSuccess(null);
      
      // Prepare export options
      const options = { ...exportOptions };
      
      // Add date range if both dates are provided
      if (startDate && endDate) {
        options.dateRange = {
          start: startDate,
          end: endDate,
        };
      }
      
      // Make API request
      const response = await fetch(`/api/users/${session.user.id}/data-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      // Handle different export formats
      const contentType = response.headers.get('Content-Type');
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'devpulse-export';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create a download link for the exported data
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportSuccess('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      setExportError('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Handle data deletion
  const handleDeleteData = async () => {
    if (!session?.user?.id) return;
    
    try {
      setDeletionLoading(true);
      setDeletionError(null);
      setDeletionSuccess(null);
      
      // Make API request
      const response = await fetch(`/api/users/${session.user.id}/data-deletion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deletionOptions),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete data');
      }
      
      const result = await response.json();
      
      setDeletionSuccess(result.message);
      setShowDeletionConfirm(false);
      
      // If this was a hard deletion, redirect to sign out
      if (deletionOptions.deleteType === 'hard') {
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      setDeletionError('Failed to delete data. Please try again.');
    } finally {
      setDeletionLoading(false);
    }
  };
  
  // Handle scheduled deletion
  const handleScheduleDeletion = async () => {
    if (!session?.user?.id || !scheduledDate) return;
    
    try {
      setDeletionLoading(true);
      setDeletionError(null);
      setDeletionSuccess(null);
      
      // Make API request
      const response = await fetch(`/api/users/${session.user.id}/data-deletion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...deletionOptions,
          scheduledDate,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to schedule data deletion');
      }
      
      const result = await response.json();
      
      setDeletionSuccess(result.message);
      setShowDeletionConfirm(false);
    } catch (error) {
      console.error('Error scheduling data deletion:', error);
      setDeletionError('Failed to schedule data deletion. Please try again.');
    } finally {
      setDeletionLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Data Export Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Export Your Data
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Download a copy of your data in various formats. You can select which types of data to include.
        </p>
        
        {exportError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {exportError}
          </div>
        )}
        
        {exportSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {exportSuccess}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Types to Export
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="export-user"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={exportOptions.entityTypes.includes('User')}
                  onChange={(e) => handleEntityTypeChange('User', e.target.checked)}
                />
                <label htmlFor="export-user" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  User Profile
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="export-burnout"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={exportOptions.entityTypes.includes('BurnoutMetric')}
                  onChange={(e) => handleEntityTypeChange('BurnoutMetric', e.target.checked)}
                />
                <label htmlFor="export-burnout" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Burnout Metrics
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="export-pr"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={exportOptions.entityTypes.includes('PullRequest')}
                  onChange={(e) => handleEntityTypeChange('PullRequest', e.target.checked)}
                />
                <label htmlFor="export-pr" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Pull Requests
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="export-issue"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={exportOptions.entityTypes.includes('Issue')}
                  onChange={(e) => handleEntityTypeChange('Issue', e.target.checked)}
                />
                <label htmlFor="export-issue" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Issues
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="export-repo"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={exportOptions.entityTypes.includes('Repository')}
                  onChange={(e) => handleEntityTypeChange('Repository', e.target.checked)}
                />
                <label htmlFor="export-repo" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Repositories
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="export-settings"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={exportOptions.entityTypes.includes('UserSettings')}
                  onChange={(e) => handleEntityTypeChange('UserSettings', e.target.checked)}
                />
                <label htmlFor="export-settings" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  User Settings
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Format
            </label>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="format-json"
                  name="format"
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  checked={exportOptions.format === 'json'}
                  onChange={() => handleExportOptionChange('format', 'json')}
                />
                <label htmlFor="format-json" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  JSON
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="format-csv"
                  name="format"
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  checked={exportOptions.format === 'csv'}
                  onChange={() => handleExportOptionChange('format', 'csv')}
                />
                <label htmlFor="format-csv" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  CSV
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="format-pdf"
                  name="format"
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  checked={exportOptions.format === 'pdf'}
                  onChange={() => handleExportOptionChange('format', 'pdf')}
                />
                <label htmlFor="format-pdf" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  PDF
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-date" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="include-personal"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={exportOptions.includePersonalData}
              onChange={(e) => handleExportOptionChange('includePersonalData', e.target.checked)}
            />
            <label htmlFor="include-personal" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Include personal data
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="include-repo"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={exportOptions.includeRepositoryData}
              onChange={(e) => handleExportOptionChange('includeRepositoryData', e.target.checked)}
            />
            <label htmlFor="include-repo" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Include repository data
            </label>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleExportData}
              disabled={exportLoading || exportOptions.entityTypes.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {exportLoading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Data Deletion Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Data Deletion
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Delete your data from the system. You can choose between soft deletion (anonymization) or hard deletion (complete removal).
        </p>
        
        {deletionError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {deletionError}
          </div>
        )}
        
        {deletionSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {deletionSuccess}
          </div>
        )}
        
        {!showDeletionConfirm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deletion Type
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="delete-soft"
                    name="delete-type"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={deletionOptions.deleteType === 'soft'}
                    onChange={() => handleDeletionOptionChange('deleteType', 'soft')}
                  />
                  <label htmlFor="delete-soft" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Soft Delete (Anonymize)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="delete-hard"
                    name="delete-type"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={deletionOptions.deleteType === 'hard'}
                    onChange={() => handleDeletionOptionChange('deleteType', 'hard')}
                  />
                  <label htmlFor="delete-hard" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Hard Delete (Complete Removal)
                  </label>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {deletionOptions.deleteType === 'soft' 
                  ? 'Soft deletion will anonymize your personal information but keep your contributions for team analytics.'
                  : 'Hard deletion will completely remove all your data from the system. This action cannot be undone.'}
              </p>
            </div>
            
            <div>
              <label htmlFor="deletion-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Deletion (Optional)
              </label>
              <textarea
                id="deletion-reason"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Please let us know why you're deleting your data..."
                value={deletionOptions.reason || ''}
                onChange={(e) => handleDeletionOptionChange('reason', e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="export-before-delete"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={deletionOptions.exportBeforeDelete}
                onChange={(e) => handleDeletionOptionChange('exportBeforeDelete', e.target.checked)}
              />
              <label htmlFor="export-before-delete" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Export data before deletion
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="schedule-deletion"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={scheduledDeletion}
                onChange={(e) => setScheduledDeletion(e.target.checked)}
              />
              <label htmlFor="schedule-deletion" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Schedule deletion for a future date
              </label>
            </div>
            
            {scheduledDeletion && (
              <div>
                <label htmlFor="scheduled-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scheduled Deletion Date
                </label>
                <input
                  type="date"
                  id="scheduled-date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Ensure date is in the future
                />
              </div>
            )}
            
            <div className="pt-4">
              <button
                onClick={() => setShowDeletionConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {scheduledDeletion ? 'Schedule Deletion' : 'Delete Data'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-red-800 dark:text-red-200 mb-4">
              Confirm Data Deletion
            </h4>
            
            <p className="text-red-700 dark:text-red-300 mb-6">
              {scheduledDeletion 
                ? `Are you sure you want to schedule data deletion for ${new Date(scheduledDate).toLocaleDateString()}?` 
                : `Are you sure you want to ${deletionOptions.deleteType === 'soft' ? 'anonymize' : 'permanently delete'} your data? This action cannot be undone.`}
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeletionConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              
              <button
                onClick={scheduledDeletion ? handleScheduleDeletion : handleDeleteData}
                disabled={deletionLoading || (scheduledDeletion && !scheduledDate)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deletionLoading 
                  ? 'Processing...' 
                  : scheduledDeletion 
                    ? 'Confirm Schedule' 
                    : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}