'use client';

import React, { useState } from 'react';
import { 
  DocProvider, 
  DocCategory,
  DocArticle
} from '../../../components/help/DocumentationBrowser';
import {
  EnhancedErrorBoundary,
  withErrorBoundary,
  useErrorThrower
} from '../../../components/ui/enhanced-error-boundary';
import {
  TroubleshootingGuide,
  troubleshootingGuides
} from '../../../components/help/TroubleshootingGuide';

// Sample documentation data for error recovery
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
      </div>
    ),
    relatedArticles: []
  }
];

// Component that throws errors for testing
const ErrorThrower: React.FC<{ errorType: string }> = ({ errorType }) => {
  const { throwError } = useErrorThrower();
  
  // Throw error on render
  throwError(errorType, `Test ${errorType}`);
  
  return <div>This should not be displayed</div>;
};

// Wrap ErrorThrower with error boundary
const SafeErrorThrower = withErrorBoundary(ErrorThrower);

// Button that throws errors when clicked
const ErrorButton: React.FC<{ errorType: string; label: string }> = ({ errorType, label }) => {
  const { throwError } = useErrorThrower();
  
  return (
    <button
      onClick={() => throwError(errorType, `Test ${errorType}`)}
      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {label}
    </button>
  );
};

// Safe button that throws errors when clicked
const SafeErrorButton = withErrorBoundary(ErrorButton);

export default function ErrorRecoveryDemo() {
  const [selectedGuide, setSelectedGuide] = useState<string>('connection-issues');
  const [showErrorThrower, setShowErrorThrower] = useState<boolean>(false);
  const [selectedErrorType, setSelectedErrorType] = useState<string>('TypeError');
  
  const errorTypes = [
    'TypeError',
    'SyntaxError',
    'ReferenceError',
    'AuthenticationError',
    'PermissionError',
    'SyncError',
    'NetworkError',
    'DataError',
    'CustomError'
  ];
  
  const guideIds = Object.keys(troubleshootingGuides);
  
  return (
    <DocProvider initialCategories={docCategories} initialArticles={docArticles}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Error Recovery Demo</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Enhanced Error Boundary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-4">Error Boundary Demo</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select error type:</label>
                <select
                  value={selectedErrorType}
                  onChange={(e) => setSelectedErrorType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {errorTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <button
                  onClick={() => setShowErrorThrower(!showErrorThrower)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {showErrorThrower ? 'Hide' : 'Show'} Error Component
                </button>
              </div>
              
              {showErrorThrower && (
                <div className="mt-4 p-4 border rounded-md">
                  <EnhancedErrorBoundary>
                    <ErrorThrower errorType={selectedErrorType} />
                  </EnhancedErrorBoundary>
                </div>
              )}
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-4">Error Button Demo</h3>
              <p className="mb-4">
                Click the buttons below to trigger different types of errors:
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <EnhancedErrorBoundary>
                  <SafeErrorButton errorType="TypeError" label="Type Error" />
                </EnhancedErrorBoundary>
                
                <EnhancedErrorBoundary>
                  <SafeErrorButton errorType="AuthenticationError" label="Auth Error" />
                </EnhancedErrorBoundary>
                
                <EnhancedErrorBoundary>
                  <SafeErrorButton errorType="SyncError" label="Sync Error" />
                </EnhancedErrorBoundary>
                
                <EnhancedErrorBoundary>
                  <SafeErrorButton errorType="NetworkError" label="Network Error" />
                </EnhancedErrorBoundary>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Guides</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select a guide:</label>
            <select
              value={selectedGuide}
              onChange={(e) => setSelectedGuide(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border rounded-md"
            >
              {guideIds.map(id => (
                <option key={id} value={id}>
                  {troubleshootingGuides[id].title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mt-4">
            <TroubleshootingGuide 
              guideId={selectedGuide} 
              onComplete={() => console.log('Guide completed')}
            />
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Error Recovery Workflow</h2>
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Simulated Error Recovery</h3>
            <p className="mb-4">
              This example demonstrates a complete error recovery workflow:
            </p>
            
            <ol className="list-decimal pl-5 mb-4 space-y-2">
              <li>User encounters an error</li>
              <li>Error boundary catches the error and displays help</li>
              <li>User follows troubleshooting steps</li>
              <li>User resolves the issue and continues</li>
            </ol>
            
            <div className="mt-4">
              <EnhancedErrorBoundary
                fallback={(error, errorInfo, reset) => (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
                      <p className="mt-1 text-red-700">
                        {error.toString()}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-medium text-red-800 mb-2">Troubleshooting</h3>
                      <TroubleshootingGuide 
                        guideId="connection-issues" 
                        onComplete={reset}
                      />
                    </div>
                  </div>
                )}
              >
                <div className="p-4 bg-gray-50 border rounded-md">
                  <h4 className="font-medium mb-2">Simulated Application</h4>
                  <p className="mb-4">
                    Click the button below to simulate an error:
                  </p>
                  <ErrorButton errorType="NetworkError" label="Simulate Network Error" />
                </div>
              </EnhancedErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </DocProvider>
  );
}