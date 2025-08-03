'use client';

/**
 * Mock Data Import/Export Component
 * 
 * This component provides functionality for importing and exporting mock data sets.
 */

import React, { useState, useRef } from 'react';
import { exportMockData, importMockData } from '@/lib/mock/mock-data-store';

interface MockDataImportExportProps {
  dataSet: string;
  onDataSetUpdated: () => void;
}

export default function MockDataImportExport({ 
  dataSet, 
  onDataSetUpdated 
}: MockDataImportExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newDataSetName, setNewDataSetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export mock data
  const handleExportMockData = async () => {
    if (!dataSet) {
      setError('No data set selected');
      return;
    }

    try {
      setIsExporting(true);
      setError(null);
      setSuccess(null);
      
      const jsonData = await exportMockData(dataSet);
      
      // Create a download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataSet}-mock-data.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(`Successfully exported mock data for "${dataSet}"`);
    } catch (err) {
      console.error('Error exporting mock data:', err);
      setError(`Failed to export mock data: ${(err as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Import mock data
  const handleImportMockData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDataSetName) {
      setError('Please enter a name for the new data set');
      return;
    }
    
    if (!fileInputRef.current?.files?.length) {
      setError('Please select a file to import');
      return;
    }

    try {
      setIsImporting(true);
      setError(null);
      setSuccess(null);
      
      const file = fileInputRef.current.files[0];
      const jsonData = await file.text();
      
      await importMockData(newDataSetName, jsonData);
      
      setSuccess(`Successfully imported mock data as "${newDataSetName}"`);
      setNewDataSetName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onDataSetUpdated();
    } catch (err) {
      console.error('Error importing mock data:', err);
      setError(`Failed to import mock data: ${(err as Error).message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/30">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Data</h3>
        <div className="mt-2">
          <button
            onClick={handleExportMockData}
            disabled={isExporting || !dataSet}
            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {isExporting ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin text-gray-700 dark:text-gray-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export Selected Data Set
              </>
            )}
          </button>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Export the selected mock data set as a JSON file
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Import Data</h3>
        <form onSubmit={handleImportMockData} className="mt-2 space-y-4">
          <div>
            <label htmlFor="newDataSetName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Data Set Name
            </label>
            <input
              type="text"
              name="newDataSetName"
              id="newDataSetName"
              value={newDataSetName}
              onChange={(e) => setNewDataSetName(e.target.value)}
              placeholder="Enter a name for the imported data set"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="importFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Import File
            </label>
            <input
              type="file"
              name="importFile"
              id="importFile"
              ref={fileInputRef}
              accept=".json,application/json"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900/20 dark:file:text-blue-300 dark:hover:file:bg-blue-900/30"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select a JSON file containing mock data to import
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isImporting}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400 dark:disabled:bg-blue-800"
            >
              {isImporting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Import Data Set
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}