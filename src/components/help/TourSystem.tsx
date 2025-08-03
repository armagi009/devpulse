import React, { createContext, useContext, useState, useEffect } from 'react';
import { TourStep, FeatureTour } from './FeatureTour';

// Types for the tour system
export type Tour = {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  category?: string;
  priority?: number;
  completed?: boolean;
  onComplete?: () => void;
};

type TourContextType = {
  tours: Record<string, Tour>;
  activeTour: Tour | null;
  isTourActive: boolean;
  registerTour: (tour: Tour) => void;
  startTour: (tourId: string) => void;
  endTour: () => void;
  completeTour: (tourId: string) => void;
  resetTours: () => void;
};

const TourContext = createContext<TourContextType | undefined>(undefined);

// Local storage key for storing tour state
const TOUR_STORAGE_KEY = 'devpulse-tours-completed';

export const useTours = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTours must be used within a TourProvider');
  }
  return context;
};

type TourProviderProps = {
  children: React.ReactNode;
  initialTours?: Tour[];
};

export const TourProvider: React.FC<TourProviderProps> = ({
  children,
  initialTours = [],
}) => {
  // Load completed tours from local storage
  const loadCompletedTours = (): Record<string, boolean> => {
    try {
      if (typeof window === 'undefined') return {};
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load tour state from localStorage:', error);
      return {};
    }
  };

  // Initialize state
  const completedTours = loadCompletedTours();
  
  const [tours, setTours] = useState<Record<string, Tour>>(
    initialTours.reduce((acc, tour) => {
      acc[tour.id] = { ...tour, completed: completedTours[tour.id] || false };
      return acc;
    }, {} as Record<string, Tour>)
  );
  
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);

  // Save completed tours to local storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const completedState = Object.entries(tours).reduce(
      (acc, [id, tour]) => {
        acc[id] = tour.completed || false;
        return acc;
      },
      {} as Record<string, boolean>
    );
    
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(completedState));
    } catch (error) {
      console.error('Failed to save tour state to localStorage:', error);
    }
  }, [tours]);

  const registerTour = (tour: Tour) => {
    setTours(prev => ({
      ...prev,
      [tour.id]: {
        ...tour,
        completed: completedTours[tour.id] || false,
      },
    }));
  };

  const startTour = (tourId: string) => {
    if (tours[tourId]) {
      setActiveTour(tours[tourId]);
      setIsTourActive(true);
    } else {
      console.error(`Tour with id "${tourId}" not found`);
    }
  };

  const endTour = () => {
    setActiveTour(null);
    setIsTourActive(false);
  };

  const completeTour = (tourId: string) => {
    setTours(prev => {
      if (!prev[tourId]) return prev;
      
      const updatedTour = {
        ...prev[tourId],
        completed: true,
      };
      
      // Call onComplete callback if provided
      if (prev[tourId].onComplete) {
        prev[tourId].onComplete();
      }
      
      return {
        ...prev,
        [tourId]: updatedTour,
      };
    });
    
    endTour();
  };

  const resetTours = () => {
    setTours(prev => {
      const resetToursState = { ...prev };
      Object.keys(resetToursState).forEach(id => {
        resetToursState[id] = { ...resetToursState[id], completed: false };
      });
      return resetToursState;
    });
    
    try {
      localStorage.removeItem(TOUR_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset tours in localStorage:', error);
    }
  };

  return (
    <TourContext.Provider
      value={{
        tours,
        activeTour,
        isTourActive,
        registerTour,
        startTour,
        endTour,
        completeTour,
        resetTours,
      }}
    >
      {children}
      {activeTour && isTourActive && (
        <FeatureTour
          steps={activeTour.steps}
          isOpen={isTourActive}
          onClose={endTour}
          onComplete={() => completeTour(activeTour.id)}
        />
      )}
    </TourContext.Provider>
  );
};

// Component to display available tours
export const TourList: React.FC<{
  filter?: 'all' | 'completed' | 'incomplete';
  category?: string;
  className?: string;
}> = ({ 
  filter = 'all',
  category,
  className = ''
}) => {
  const { tours, startTour } = useTours();
  
  const filteredTours = Object.values(tours)
    .filter(tour => {
      if (category && tour.category !== category) return false;
      
      switch (filter) {
        case 'completed':
          return tour.completed;
        case 'incomplete':
          return !tour.completed;
        case 'all':
        default:
          return true;
      }
    })
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  if (filteredTours.length === 0) {
    return (
      <div className={`p-4 bg-gray-50 rounded-md ${className}`}>
        <p className="text-gray-500 text-center">No tours available</p>
      </div>
    );
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      {filteredTours.map(tour => (
        <div 
          key={tour.id}
          className="border rounded-md p-3 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{tour.name}</h3>
              <p className="text-sm text-gray-600">{tour.description}</p>
            </div>
            <div className="flex items-center">
              {tour.completed && (
                <span className="mr-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Completed
                </span>
              )}
              <button
                onClick={() => startTour(tour.id)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                {tour.completed ? 'Replay' : 'Start'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Component to trigger a tour
export const TourButton: React.FC<{
  tourId: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'text';
}> = ({
  tourId,
  children,
  className = '',
  variant = 'primary'
}) => {
  const { tours, startTour } = useTours();
  
  if (!tours[tourId]) {
    console.warn(`Tour with id "${tourId}" not found`);
    return null;
  }
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    text: 'text-blue-600 hover:text-blue-800 hover:underline'
  };
  
  return (
    <button
      onClick={() => startTour(tourId)}
      className={`px-3 py-1 rounded ${variantClasses[variant]} ${className}`}
    >
      {children || `Tour: ${tours[tourId].name}`}
    </button>
  );
};

// Component to manage tour settings
export const TourSettings: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { tours, resetTours } = useTours();
  
  const completedCount = Object.values(tours).filter(tour => tour.completed).length;
  const totalCount = Object.values(tours).length;
  
  // Get all unique categories
  const categories = Array.from(
    new Set(
      Object.values(tours)
        .map(tour => tour.category)
        .filter(Boolean) as string[]
    )
  );
  
  return (
    <div className={`p-4 border rounded-md bg-white ${className}`}>
      <h3 className="text-lg font-medium mb-4">Tour Settings</h3>
      
      <div className="mb-4">
        <p>
          {completedCount} of {totalCount} tours completed
        </p>
        {completedCount > 0 && (
          <div className="mt-2">
            <button
              onClick={resetTours}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reset All Tours
            </button>
          </div>
        )}
      </div>
      
      {categories.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Tour Categories</h4>
          <ul className="space-y-1">
            {categories.map(category => {
              const toursInCategory = Object.values(tours).filter(
                tour => tour.category === category
              );
              const completedInCategory = toursInCategory.filter(
                tour => tour.completed
              ).length;
              
              return (
                <li key={category} className="flex justify-between">
                  <span>{category}</span>
                  <span className="text-sm text-gray-600">
                    {completedInCategory}/{toursInCategory.length} completed
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};