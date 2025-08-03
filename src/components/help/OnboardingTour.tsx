import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TourProvider, useTours, Tour } from './TourSystem';

// Define the onboarding tour steps for different pages
const onboardingTours: Record<string, Tour> = {
  welcome: {
    id: 'welcome-tour',
    name: 'Welcome Tour',
    description: 'Get started with DevPulse',
    category: 'onboarding',
    priority: 100,
    steps: [
      {
        target: '#welcome-header',
        title: 'Welcome to DevPulse',
        content: 'DevPulse helps you monitor and improve your development team\'s performance.',
        placement: 'bottom'
      },
      {
        target: '#welcome-features',
        title: 'Key Features',
        content: 'Discover the key features that will help you track and improve your team\'s performance.',
        placement: 'right'
      },
      {
        target: '#get-started-button',
        title: 'Get Started',
        content: 'Click here to begin setting up your account.',
        placement: 'top'
      }
    ]
  },
  profile: {
    id: 'profile-setup-tour',
    name: 'Profile Setup',
    description: 'Set up your profile',
    category: 'onboarding',
    priority: 90,
    steps: [
      {
        target: '#profile-form',
        title: 'Your Profile',
        content: 'Fill in your profile details to personalize your experience.',
        placement: 'top'
      },
      {
        target: '#role-selection',
        title: 'Select Your Role',
        content: 'Choose your role to customize the dashboard for your needs.',
        placement: 'right'
      },
      {
        target: '#preferences-section',
        title: 'Set Preferences',
        content: 'Configure your notification and display preferences.',
        placement: 'bottom'
      },
      {
        target: '#save-profile-button',
        title: 'Save Profile',
        content: 'Click here to save your profile and continue.',
        placement: 'top'
      }
    ]
  },
  team: {
    id: 'team-setup-tour',
    name: 'Team Setup',
    description: 'Connect your team',
    category: 'onboarding',
    priority: 80,
    steps: [
      {
        target: '#team-setup-header',
        title: 'Team Setup',
        content: 'Connect your team members to start tracking team metrics.',
        placement: 'bottom'
      },
      {
        target: '#invite-members',
        title: 'Invite Team Members',
        content: 'Send invitations to your team members to join your workspace.',
        placement: 'right'
      },
      {
        target: '#team-roles',
        title: 'Assign Roles',
        content: 'Assign roles to team members to control access and permissions.',
        placement: 'top'
      },
      {
        target: '#continue-button',
        title: 'Continue',
        content: 'Click here to proceed to the next step.',
        placement: 'top'
      }
    ]
  },
  repositories: {
    id: 'repository-setup-tour',
    name: 'Repository Setup',
    description: 'Connect your code repositories',
    category: 'onboarding',
    priority: 70,
    steps: [
      {
        target: '#repository-setup-header',
        title: 'Repository Setup',
        content: 'Connect your code repositories to analyze code metrics.',
        placement: 'bottom'
      },
      {
        target: '#github-integration',
        title: 'GitHub Integration',
        content: 'Connect your GitHub repositories to track pull requests, commits, and more.',
        placement: 'right'
      },
      {
        target: '#repository-selection',
        title: 'Select Repositories',
        content: 'Choose which repositories you want to track and analyze.',
        placement: 'top'
      },
      {
        target: '#sync-settings',
        title: 'Sync Settings',
        content: 'Configure how often you want to sync data from your repositories.',
        placement: 'left'
      },
      {
        target: '#finish-setup-button',
        title: 'Finish Setup',
        content: 'Click here to complete the setup and go to your dashboard.',
        placement: 'top'
      }
    ]
  },
  dashboard: {
    id: 'dashboard-intro-tour',
    name: 'Dashboard Introduction',
    description: 'Learn how to use your dashboard',
    category: 'onboarding',
    priority: 60,
    steps: [
      {
        target: '#dashboard-header',
        title: 'Your Dashboard',
        content: 'This is your main dashboard where you can see all your key metrics at a glance.',
        placement: 'bottom'
      },
      {
        target: '#metrics-overview',
        title: 'Key Metrics',
        content: 'Here you can see your team\'s performance metrics and trends.',
        placement: 'right'
      },
      {
        target: '#quick-filters',
        title: 'Quick Filters',
        content: 'Use these filters to narrow down the data by date range, team members, or repositories.',
        placement: 'top'
      },
      {
        target: '#navigation-sidebar',
        title: 'Navigation',
        content: 'Access different sections of the application from this sidebar.',
        placement: 'right'
      },
      {
        target: '#help-button',
        title: 'Help & Tours',
        content: 'Click here anytime to access help resources and guided tours.',
        placement: 'left'
      }
    ]
  }
};

// Component to automatically start tours based on the current page
export const AutoTour: React.FC = () => {
  const { startTour, tours } = useTours();
  const pathname = usePathname();
  
  useEffect(() => {
    // Map pathname to tour ID
    const pathToTourMap: Record<string, string> = {
      '/onboarding/welcome': 'welcome-tour',
      '/onboarding/profile': 'profile-setup-tour',
      '/onboarding/team': 'team-setup-tour',
      '/onboarding/repositories': 'repository-setup-tour',
      '/dashboard': 'dashboard-intro-tour'
    };
    
    const tourId = pathToTourMap[pathname];
    
    if (tourId && tours[tourId] && !tours[tourId].completed) {
      // Small delay to ensure the page is fully rendered
      const timer = setTimeout(() => {
        startTour(tourId);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, startTour, tours]);
  
  return null;
};

// Onboarding tour provider that includes all onboarding tours
export const OnboardingTourProvider: React.FC<{
  children: React.ReactNode;
  additionalTours?: Tour[];
}> = ({ children, additionalTours = [] }) => {
  const allTours = [...Object.values(onboardingTours), ...additionalTours];
  
  return (
    <TourProvider initialTours={allTours}>
      {children}
      <AutoTour />
    </TourProvider>
  );
};

// Component to navigate through onboarding steps
export const OnboardingNavigation: React.FC<{
  currentStep: 'welcome' | 'profile' | 'team' | 'repositories' | 'dashboard';
  className?: string;
}> = ({ currentStep, className = '' }) => {
  const router = useRouter();
  
  const steps = [
    { id: 'welcome', label: 'Welcome', path: '/onboarding/welcome' },
    { id: 'profile', label: 'Profile', path: '/onboarding/profile' },
    { id: 'team', label: 'Team', path: '/onboarding/team' },
    { id: 'repositories', label: 'Repositories', path: '/onboarding/repositories' },
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' }
  ];
  
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      router.push(steps[currentIndex + 1].path);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      router.push(steps[currentIndex - 1].path);
    }
  };
  
  const handleSkip = () => {
    router.push('/dashboard');
  };
  
  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center ${index > 0 ? 'ml-2' : ''}`}
            >
              {index > 0 && (
                <div className="w-8 h-0.5 bg-gray-300 mr-2"></div>
              )}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < currentIndex 
                    ? 'bg-green-500 text-white' 
                    : index === currentIndex 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < currentIndex ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`ml-2 text-sm ${
                index === currentIndex ? 'font-medium text-blue-600' : 'text-gray-600'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <div>
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          {currentIndex < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Skip
            </button>
          )}
          
          {currentIndex < steps.length - 1 ? (
            <button
              id={currentStep === 'welcome' ? 'get-started-button' : 
                 currentStep === 'profile' ? 'save-profile-button' :
                 currentStep === 'team' ? 'continue-button' :
                 'finish-setup-button'}
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentStep === 'welcome' ? 'Get Started' : 
               currentStep === 'profile' ? 'Save Profile' :
               currentStep === 'team' ? 'Continue' :
               currentStep === 'repositories' ? 'Finish Setup' : 'Next'}
            </button>
          ) : (
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};