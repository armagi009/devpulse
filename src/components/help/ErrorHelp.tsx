import React from 'react';
import { DocLink } from './DocumentationBrowser';

// Types for error help content
export type ErrorHelpContent = {
  title: string;
  description: React.ReactNode;
  solutions: React.ReactNode[];
  docArticleId?: string;
};

// Map of error codes to help content
export const errorHelpMap: Record<string, ErrorHelpContent> = {
  'AUTH_001': {
    title: 'Authentication Failed',
    description: 'Your login attempt was unsuccessful. This could be due to incorrect credentials or account issues.',
    solutions: [
      'Verify that your email and password are correct',
      'Check if your account has been locked due to too many failed attempts',
      'Try resetting your password',
      'Ensure your account has been activated'
    ],
    docArticleId: 'common-issues'
  },
  'SYNC_001': {
    title: 'Repository Sync Failed',
    description: 'We encountered an issue while trying to sync your repository data.',
    solutions: [
      'Check your repository connection settings',
      'Verify that your access tokens are still valid',
      'Ensure the repository still exists and you have access to it',
      'Check if you\'ve reached API rate limits'
    ],
    docArticleId: 'common-issues'
  },
  'API_001': {
    title: 'API Request Failed',
    description: 'A request to our API failed. This could be due to network issues or server problems.',
    solutions: [
      'Check your internet connection',
      'Try refreshing the page',
      'If the problem persists, our servers might be experiencing issues'
    ],
    docArticleId: 'common-issues'
  },
  'DATA_001': {
    title: 'Data Loading Error',
    description: 'We couldn\'t load the requested data. This might be due to missing or corrupted data.',
    solutions: [
      'Try refreshing the page',
      'Check if you have the necessary permissions to view this data',
      'Verify that the data source is properly configured'
    ],
    docArticleId: 'common-issues'
  },
  'PERM_001': {
    title: 'Permission Denied',
    description: 'You don\'t have permission to perform this action or access this resource.',
    solutions: [
      'Contact your workspace administrator to request access',
      'Check if your role has the necessary permissions',
      'Verify that you\'re logged in with the correct account'
    ],
    docArticleId: 'common-issues'
  }
};

// Component to display error help
export const ErrorHelp: React.FC<{
  errorCode: string;
  className?: string;
}> = ({
  errorCode,
  className = ''
}) => {
  const helpContent = errorHelpMap[errorCode];
  
  if (!helpContent) {
    return (
      <div className={`p-4 border rounded-md bg-red-50 ${className}`}>
        <h3 className="font-medium text-red-800 mb-2">Unknown Error</h3>
        <p className="text-red-700 mb-3">
          We don't have specific help content for error code: {errorCode}
        </p>
        <p className="text-sm text-red-600">
          Please contact support if you continue to experience this issue.
        </p>
      </div>
    );
  }
  
  return (
    <div className={`p-4 border rounded-md bg-red-50 ${className}`}>
      <h3 className="font-medium text-red-800 mb-2">{helpContent.title}</h3>
      <p className="text-red-700 mb-3">
        {helpContent.description}
      </p>
      
      <div className="mb-3">
        <h4 className="font-medium text-red-800 mb-1">Suggested Solutions:</h4>
        <ul className="list-disc pl-5 text-red-700">
          {helpContent.solutions.map((solution, index) => (
            <li key={index} className="mb-1">{solution}</li>
          ))}
        </ul>
      </div>
      
      {helpContent.docArticleId && (
        <div className="mt-4">
          <DocLink articleId={helpContent.docArticleId} variant="button" className="bg-red-600 hover:bg-red-700">
            View Troubleshooting Guide
          </DocLink>
        </div>
      )}
    </div>
  );
};

// Component to display error help in a modal
export const ErrorHelpModal: React.FC<{
  errorCode: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({
  errorCode,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Error Help</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <ErrorHelp errorCode={errorCode} />
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook to use error help
export const useErrorHelp = () => {
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const [currentErrorCode, setCurrentErrorCode] = React.useState<string>('');
  
  const showErrorHelp = (errorCode: string) => {
    setCurrentErrorCode(errorCode);
    setIsHelpOpen(true);
  };
  
  const hideErrorHelp = () => {
    setIsHelpOpen(false);
  };
  
  const ErrorHelpModalComponent = () => (
    <ErrorHelpModal
      errorCode={currentErrorCode}
      isOpen={isHelpOpen}
      onClose={hideErrorHelp}
    />
  );
  
  return {
    showErrorHelp,
    hideErrorHelp,
    ErrorHelpModal: ErrorHelpModalComponent
  };
};