import React, { useState } from 'react';
import { DocLink } from './DocumentationBrowser';

// Types for troubleshooting steps
export type TroubleshootingStep = {
  id: string;
  question: string;
  solutions: {
    answer: string;
    action: string;
    nextStep?: string;
    docArticleId?: string;
  }[];
};

// Types for troubleshooting guide
export type TroubleshootingGuide = {
  id: string;
  title: string;
  description: string;
  initialStep: string;
  steps: TroubleshootingStep[];
};

// Sample troubleshooting guides
export const troubleshootingGuides: Record<string, TroubleshootingGuide> = {
  'connection-issues': {
    id: 'connection-issues',
    title: 'Connection Issues',
    description: 'Troubleshoot problems connecting to the application or API',
    initialStep: 'check-internet',
    steps: [
      {
        id: 'check-internet',
        question: 'Can you access other websites?',
        solutions: [
          {
            answer: 'No',
            action: 'Check your internet connection. Try disconnecting and reconnecting to your network.',
            nextStep: 'try-different-network'
          },
          {
            answer: 'Yes',
            action: 'Your internet connection is working. Let\'s check if our service is down.',
            nextStep: 'check-service-status'
          }
        ]
      },
      {
        id: 'try-different-network',
        question: 'Can you try a different network (e.g., mobile hotspot)?',
        solutions: [
          {
            answer: 'Yes, and it works',
            action: 'The issue is with your primary network. Contact your network administrator or ISP.',
            docArticleId: 'common-issues'
          },
          {
            answer: 'Yes, but still doesn\'t work',
            action: 'The issue might be with our service or your device.',
            nextStep: 'check-service-status'
          },
          {
            answer: 'No, I can\'t try another network',
            action: 'Try restarting your router and device.',
            nextStep: 'check-service-status'
          }
        ]
      },
      {
        id: 'check-service-status',
        question: 'Is our status page reporting any outages?',
        solutions: [
          {
            answer: 'Yes',
            action: 'We\'re experiencing service issues. Please check back later or subscribe to updates on our status page.',
            docArticleId: 'common-issues'
          },
          {
            answer: 'No',
            action: 'Our service appears to be running normally. Let\'s check your browser.',
            nextStep: 'check-browser'
          },
          {
            answer: 'I can\'t access the status page',
            action: 'Try accessing our status page from a different device or network.',
            nextStep: 'check-browser'
          }
        ]
      },
      {
        id: 'check-browser',
        question: 'Have you tried a different browser or incognito mode?',
        solutions: [
          {
            answer: 'Yes, and it works',
            action: 'The issue might be with your browser extensions or cache. Try clearing your cache and disabling extensions.',
            docArticleId: 'common-issues'
          },
          {
            answer: 'Yes, but still doesn\'t work',
            action: 'The issue might be with your account or specific to your device.',
            nextStep: 'contact-support'
          },
          {
            answer: 'No, I haven\'t tried',
            action: 'Please try using a different browser or incognito mode to rule out browser-specific issues.',
            nextStep: 'contact-support'
          }
        ]
      },
      {
        id: 'contact-support',
        question: 'Would you like to contact our support team?',
        solutions: [
          {
            answer: 'Yes',
            action: 'Please contact our support team with details about your issue. Include any error messages and steps you\'ve already tried.',
            docArticleId: 'common-issues'
          },
          {
            answer: 'No, I\'ll try again later',
            action: 'You can try again later or check our documentation for more troubleshooting tips.',
            docArticleId: 'common-issues'
          }
        ]
      }
    ]
  },
  'sync-issues': {
    id: 'sync-issues',
    title: 'Repository Sync Issues',
    description: 'Troubleshoot problems with repository synchronization',
    initialStep: 'check-permissions',
    steps: [
      {
        id: 'check-permissions',
        question: 'Do you have admin access to the repository?',
        solutions: [
          {
            answer: 'Yes',
            action: 'You have the necessary permissions. Let\'s check your access tokens.',
            nextStep: 'check-tokens'
          },
          {
            answer: 'No',
            action: 'You need admin access to sync repositories. Please contact your repository administrator.',
            docArticleId: 'common-issues'
          },
          {
            answer: 'I\'m not sure',
            action: 'Check your repository permissions in GitHub/GitLab settings.',
            nextStep: 'check-tokens'
          }
        ]
      },
      {
        id: 'check-tokens',
        question: 'Have your access tokens expired or been revoked?',
        solutions: [
          {
            answer: 'Yes',
            action: 'You need to generate new access tokens and update them in your integration settings.',
            docArticleId: 'common-issues'
          },
          {
            answer: 'No',
            action: 'Your tokens are valid. Let\'s check if you\'ve reached API rate limits.',
            nextStep: 'check-rate-limits'
          },
          {
            answer: 'I\'m not sure',
            action: 'Check your integration settings and try regenerating your access tokens.',
            nextStep: 'check-rate-limits'
          }
        ]
      },
      {
        id: 'check-rate-limits',
        question: 'Have you reached API rate limits?',
        solutions: [
          {
            answer: 'Yes',
            action: 'You\'ve reached the API rate limits. Wait for the limits to reset or upgrade your plan for higher limits.',
            docArticleId: 'common-issues'
          },
          {
            answer: 'No',
            action: 'You haven\'t reached rate limits. Let\'s check if the repository still exists.',
            nextStep: 'check-repo-exists'
          },
          {
            answer: 'I\'m not sure',
            action: 'Check your API usage in your GitHub/GitLab settings or try again later.',
            nextStep: 'check-repo-exists'
          }
        ]
      },
      {
        id: 'check-repo-exists',
        question: 'Does the repository still exist and is accessible?',
        solutions: [
          {
            answer: 'Yes',
            action: 'The repository exists and is accessible. Let\'s try a manual sync.',
            nextStep: 'try-manual-sync'
          },
          {
            answer: 'No',
            action: 'The repository has been deleted or made private. Update your integration settings.',
            docArticleId: 'common-issues'
          },
          {
            answer: 'I\'m not sure',
            action: 'Check if you can access the repository directly through GitHub/GitLab.',
            nextStep: 'try-manual-sync'
          }
        ]
      },
      {
        id: 'try-manual-sync',
        question: 'Have you tried a manual sync?',
        solutions: [
          {
            answer: 'Yes, and it worked',
            action: 'The issue has been resolved. You might want to check your automatic sync settings.',
            docArticleId: 'common-issues'
          },
          {
            answer: 'Yes, but it failed',
            action: 'There might be an issue with the repository or our sync service.',
            nextStep: 'contact-support'
          },
          {
            answer: 'No, I haven\'t tried',
            action: 'Try triggering a manual sync from your repository settings.',
            nextStep: 'contact-support'
          }
        ]
      },
      {
        id: 'contact-support',
        question: 'Would you like to contact our support team?',
        solutions: [
          {
            answer: 'Yes',
            action: 'Please contact our support team with details about your sync issues. Include any error messages and steps you\'ve already tried.',
            docArticleId: 'common-issues'
          },
          {
            answer: 'No, I\'ll try again later',
            action: 'You can try again later or check our documentation for more troubleshooting tips.',
            docArticleId: 'common-issues'
          }
        ]
      }
    ]
  }
};

// Component to display a troubleshooting guide
export const TroubleshootingGuide: React.FC<{
  guideId: string;
  className?: string;
  onComplete?: () => void;
}> = ({
  guideId,
  className = '',
  onComplete
}) => {
  const guide = troubleshootingGuides[guideId];
  const [currentStepId, setCurrentStepId] = useState<string>(guide?.initialStep || '');
  const [history, setHistory] = useState<string[]>([]);
  const [completed, setCompleted] = useState<boolean>(false);
  
  if (!guide) {
    return (
      <div className={`p-4 border rounded-md bg-red-50 ${className}`}>
        <h3 className="font-medium text-red-800 mb-2">Guide Not Found</h3>
        <p className="text-red-700">
          Troubleshooting guide with ID "{guideId}" not found.
        </p>
      </div>
    );
  }
  
  const currentStep = guide.steps.find(step => step.id === currentStepId);
  
  const handleSolutionClick = (nextStep?: string, docArticleId?: string) => {
    if (nextStep) {
      setHistory([...history, currentStepId]);
      setCurrentStepId(nextStep);
    } else {
      setCompleted(true);
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousStep = newHistory.pop();
      setHistory(newHistory);
      setCurrentStepId(previousStep!);
    }
  };
  
  const handleRestart = () => {
    setHistory([]);
    setCurrentStepId(guide.initialStep);
    setCompleted(false);
  };
  
  if (completed) {
    return (
      <div className={`p-4 border rounded-md bg-green-50 ${className}`}>
        <h3 className="font-medium text-green-800 mb-2">Troubleshooting Complete</h3>
        <p className="text-green-700 mb-4">
          We hope this guide helped you resolve your issue.
        </p>
        <button
          onClick={handleRestart}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Start Over
        </button>
      </div>
    );
  }
  
  if (!currentStep) {
    return (
      <div className={`p-4 border rounded-md bg-red-50 ${className}`}>
        <h3 className="font-medium text-red-800 mb-2">Step Not Found</h3>
        <p className="text-red-700 mb-4">
          Troubleshooting step not found.
        </p>
        <button
          onClick={handleRestart}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Restart Guide
        </button>
      </div>
    );
  }
  
  return (
    <div className={`p-4 border rounded-md ${className}`}>
      <h3 className="font-medium mb-2">{guide.title}</h3>
      <p className="text-gray-600 mb-4">{guide.description}</p>
      
      <div className="mb-4">
        <h4 className="font-medium mb-2">{currentStep.question}</h4>
        <div className="space-y-2">
          {currentStep.solutions.map((solution, index) => (
            <button
              key={index}
              onClick={() => handleSolutionClick(solution.nextStep, solution.docArticleId)}
              className="w-full text-left px-3 py-2 border rounded hover:bg-gray-50"
            >
              {solution.answer}
            </button>
          ))}
        </div>
      </div>
      
      {currentStep.solutions.map((solution, index) => (
        <div
          key={`solution-${index}`}
          className="hidden"
          id={`solution-${currentStep.id}-${index}`}
        >
          <p className="mb-2">{solution.action}</p>
          {solution.docArticleId && (
            <DocLink articleId={solution.docArticleId} variant="button">
              View Documentation
            </DocLink>
          )}
        </div>
      ))}
      
      <div className="flex justify-between mt-4">
        <button
          onClick={handleBack}
          disabled={history.length === 0}
          className={`px-3 py-1 rounded ${
            history.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Back
        </button>
        
        <button
          onClick={handleRestart}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Restart
        </button>
      </div>
    </div>
  );
};