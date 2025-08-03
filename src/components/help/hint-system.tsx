import React, { useState, useEffect, createContext, useContext } from 'react';
import { Tooltip, Hint } from '../ui/tooltip';

// Types for the hint system
export type HintInfo = {
  id: string;
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  seen?: boolean;
  priority?: number; // Higher number = higher priority
  category?: string;
};

type HintContextType = {
  hints: Record<string, HintInfo>;
  registerHint: (hint: HintInfo) => void;
  markHintAsSeen: (hintId: string) => void;
  resetHints: () => void;
  enabledCategories: string[];
  setEnabledCategories: (categories: string[]) => void;
  isHintSystemEnabled: boolean;
  setHintSystemEnabled: (enabled: boolean) => void;
};

const HintContext = createContext<HintContextType | undefined>(undefined);

// Local storage key for storing hint state
const HINT_STORAGE_KEY = 'devpulse-hints-seen';
const HINT_SETTINGS_KEY = 'devpulse-hints-settings';

export const useHints = () => {
  const context = useContext(HintContext);
  if (!context) {
    throw new Error('useHints must be used within a HintProvider');
  }
  return context;
};

type HintProviderProps = {
  children: React.ReactNode;
  initialHints?: HintInfo[];
  defaultEnabled?: boolean;
};

export const HintProvider: React.FC<HintProviderProps> = ({
  children,
  initialHints = [],
  defaultEnabled = true,
}) => {
  // Load seen hints from local storage
  const loadSeenHints = (): Record<string, boolean> => {
    try {
      const stored = localStorage.getItem(HINT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load hint state from localStorage:', error);
      return {};
    }
  };

  // Load hint settings from local storage
  const loadHintSettings = () => {
    try {
      const stored = localStorage.getItem(HINT_SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        return {
          enabled: settings.enabled ?? defaultEnabled,
          enabledCategories: settings.enabledCategories ?? ['all'],
        };
      }
      return { enabled: defaultEnabled, enabledCategories: ['all'] };
    } catch (error) {
      console.error('Failed to load hint settings from localStorage:', error);
      return { enabled: defaultEnabled, enabledCategories: ['all'] };
    }
  };

  // Initialize state
  const seenHints = loadSeenHints();
  const settings = loadHintSettings();
  
  const [hints, setHints] = useState<Record<string, HintInfo>>(
    initialHints.reduce((acc, hint) => {
      acc[hint.id] = { ...hint, seen: seenHints[hint.id] || false };
      return acc;
    }, {} as Record<string, HintInfo>)
  );
  
  const [isHintSystemEnabled, setHintSystemEnabled] = useState<boolean>(
    settings.enabled
  );
  
  const [enabledCategories, setEnabledCategories] = useState<string[]>(
    settings.enabledCategories
  );

  // Save seen hints to local storage
  useEffect(() => {
    const seenState = Object.entries(hints).reduce(
      (acc, [id, hint]) => {
        acc[id] = hint.seen || false;
        return acc;
      },
      {} as Record<string, boolean>
    );
    
    try {
      localStorage.setItem(HINT_STORAGE_KEY, JSON.stringify(seenState));
    } catch (error) {
      console.error('Failed to save hint state to localStorage:', error);
    }
  }, [hints]);

  // Save hint settings to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        HINT_SETTINGS_KEY,
        JSON.stringify({
          enabled: isHintSystemEnabled,
          enabledCategories,
        })
      );
    } catch (error) {
      console.error('Failed to save hint settings to localStorage:', error);
    }
  }, [isHintSystemEnabled, enabledCategories]);

  const registerHint = (hint: HintInfo) => {
    setHints(prev => ({
      ...prev,
      [hint.id]: {
        ...hint,
        seen: seenHints[hint.id] || false,
      },
    }));
  };

  const markHintAsSeen = (hintId: string) => {
    setHints(prev => {
      if (!prev[hintId]) return prev;
      
      return {
        ...prev,
        [hintId]: {
          ...prev[hintId],
          seen: true,
        },
      };
    });
  };

  const resetHints = () => {
    setHints(prev => {
      const resetHints = { ...prev };
      Object.keys(resetHints).forEach(id => {
        resetHints[id] = { ...resetHints[id], seen: false };
      });
      return resetHints;
    });
    
    try {
      localStorage.removeItem(HINT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset hints in localStorage:', error);
    }
  };

  return (
    <HintContext.Provider
      value={{
        hints,
        registerHint,
        markHintAsSeen,
        resetHints,
        enabledCategories,
        setEnabledCategories,
        isHintSystemEnabled,
        setHintSystemEnabled,
      }}
    >
      {children}
    </HintContext.Provider>
  );
};

// Component to display a hint
type FeatureHintProps = {
  hintId: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  content?: React.ReactNode; // Optional override for the hint content
  showIcon?: boolean;
  className?: string;
  forceShow?: boolean;
};

export const FeatureHint: React.FC<FeatureHintProps> = ({
  hintId,
  children,
  position = 'top',
  content,
  showIcon = true,
  className = '',
  forceShow = false,
}) => {
  const { hints, markHintAsSeen, isHintSystemEnabled, enabledCategories } = useHints();
  const hint = hints[hintId];
  
  if (!hint && !content) {
    console.warn(`Hint with id "${hintId}" not found`);
    return <>{children}</>;
  }
  
  // Check if hint should be shown
  const shouldShow = forceShow || (
    isHintSystemEnabled && 
    !hint?.seen && 
    (enabledCategories.includes('all') || 
     (hint?.category && enabledCategories.includes(hint.category)))
  );
  
  if (!shouldShow) {
    return <>{children}</>;
  }
  
  const handleDismiss = () => {
    markHintAsSeen(hintId);
  };
  
  const hintContent = content || hint?.content;
  const hintPosition = position || hint?.position || 'top';
  
  return (
    <Hint
      hint={
        <div>
          {hintContent}
          <div className="mt-2 text-right">
            <button
              onClick={handleDismiss}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Got it
            </button>
          </div>
        </div>
      }
      position={hintPosition}
      className={className}
      icon={showIcon}
    >
      {children}
    </Hint>
  );
};

// Component to manage hint settings
export const HintSettings: React.FC = () => {
  const { 
    isHintSystemEnabled, 
    setHintSystemEnabled, 
    enabledCategories, 
    setEnabledCategories,
    resetHints,
    hints
  } = useHints();
  
  // Get all unique categories
  const categories = Array.from(
    new Set(
      Object.values(hints)
        .map(hint => hint.category)
        .filter(Boolean) as string[]
    )
  );
  
  const handleCategoryToggle = (category: string) => {
    setEnabledCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };
  
  return (
    <div className="p-4 border rounded-md bg-white">
      <h3 className="text-lg font-medium mb-4">Hint Settings</h3>
      
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isHintSystemEnabled}
            onChange={e => setHintSystemEnabled(e.target.checked)}
            className="mr-2"
          />
          <span>Enable feature hints</span>
        </label>
      </div>
      
      {categories.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Hint Categories</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={enabledCategories.includes('all')}
                onChange={() => handleCategoryToggle('all')}
                className="mr-2"
              />
              <span>All categories</span>
            </label>
            
            {categories.map(category => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    enabledCategories.includes('all') || 
                    enabledCategories.includes(category)
                  }
                  disabled={enabledCategories.includes('all')}
                  onChange={() => handleCategoryToggle(category)}
                  className="mr-2"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={resetHints}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Reset All Hints
      </button>
    </div>
  );
};