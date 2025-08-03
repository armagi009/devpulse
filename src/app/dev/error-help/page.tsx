'use client';

import React, { useState } from 'react';
import { 
  DocProvider, 
  DocCategory,
  DocArticle
} from '../../../components/help/DocumentationBrowser';
import {
  ErrorHelp,
  ErrorHelpModal,
  useErrorHelp,
  errorHelpMap
} from '../../../components/help/ErrorHelp';

// Sample documentation data for error help
const docCategories: DocCategory[] = [
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Find solutions to common issues'
  }
];

const docArticles: DocArticle[] = [
  {
    id: 'common-issues',
    title: 'Troubleshooting Common Issues',
    categoryId: 'troubleshooting',
    tags: ['troubleshooting', 'errors', 'support'],
    lastUpdated: 'August 1, 2025',
    content: (
      <div>
        <p className="mb-4">
          This guide addresses common issues that users may encounter when using DevPulse
          and provides solutions to resolve them.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Authentication Issues</h2>
        <div className="mb-4">
          <h3 className="font-medium">Symptom: Unable to log in</h3>
          <p className="mt-1">Possible solutions:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Verify that your email and password are correct</li>
            <li>Check if your account has been locked due to too many failed attempts</li>
            <li>Try resetting your password</li>
            <li>Ensure your account has been activated</li>
          </ul>
        </div>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Repository Sync Issues</h2>
        <div className="mb-4">
          <h3 className="font-medium">Symptom: Repository data is not updating</h3>
          <p className="mt-1">Possible solutions:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Check your repository connection settings</li>
            <li>Verify that your access tokens are still valid</li>
            <li>Ensure the repository still exists and you have access to it</li>
            <li>Check if you've reached API rate limits</li>
          </ul>
        </div>
      </div>
    ),
    relatedArticles: []
  }
];

export default function ErrorHelpDemo() {
  const [selectedErrorCode, setSelectedErrorCode] = useState<string>('AUTH_001');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { showErrorHelp, hideErrorHelp, ErrorHelpModal: DynamicErrorHelpModal } = useErrorHelp();
  
  const errorCodes = Object.keys(errorHelpMap);
  
  return (
    <DocProvider initialCategories={docCategories} initialArticles={docArticles}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Error Help Demo</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Inline Error Help</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select an error code:</label>
            <select
              value={selectedErrorCode}
              onChange={(e) => setSelectedErrorCode(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border rounded-md"
            >
              {errorCodes.map(code => (
                <option key={code} value={code}>
                  {code} - {errorHelpMap[code].title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mt-4">
            <ErrorHelp errorCode={selectedErrorCode} />
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Modal Error Help</h2>
          <div className="space-y-4">
            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Show Error Modal
              </button>
              
              <ErrorHelpModal
                errorCode={selectedErrorCode}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Dynamic Error Help</h3>
              <p className="mb-2">
                This example uses a hook to show error help modals from anywhere in your application.
              </p>
              <div className="flex flex-wrap gap-2">
                {errorCodes.map(code => (
                  <button
                    key={code}
                    onClick={() => showErrorHelp(code)}
                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Show {code}
                  </button>
                ))}
              </div>
              
              <DynamicErrorHelpModal />
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Error Simulation</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Authentication Error</h3>
              <p className="mb-2">Simulate an authentication error:</p>
              <button
                onClick={() => {
                  alert('Authentication Error: Invalid credentials (AUTH_001)');
                  showErrorHelp('AUTH_001');
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try to Login
              </button>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Repository Sync Error</h3>
              <p className="mb-2">Simulate a repository sync error:</p>
              <button
                onClick={() => {
                  alert('Sync Error: Failed to sync repository (SYNC_001)');
                  showErrorHelp('SYNC_001');
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sync Repository
              </button>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">API Error</h3>
              <p className="mb-2">Simulate an API error:</p>
              <button
                onClick={() => {
                  alert('API Error: Request failed (API_001)');
                  showErrorHelp('API_001');
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Fetch Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </DocProvider>
  );
}