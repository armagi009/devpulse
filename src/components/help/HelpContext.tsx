import React, { createContext, useContext, useState, ReactNode } from 'react';

export type HelpTopic = {
  id: string;
  title: string;
  content: string | ReactNode;
  relatedTopics?: string[];
};

type HelpContextType = {
  isHelpOpen: boolean;
  currentTopic: HelpTopic | null;
  openHelp: (topic: HelpTopic) => void;
  closeHelp: () => void;
  helpTopics: Record<string, HelpTopic>;
  registerTopic: (topic: HelpTopic) => void;
};

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

type HelpProviderProps = {
  children: ReactNode;
  initialTopics?: HelpTopic[];
};

export const HelpProvider: React.FC<HelpProviderProps> = ({ 
  children, 
  initialTopics = [] 
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<HelpTopic | null>(null);
  const [helpTopics, setHelpTopics] = useState<Record<string, HelpTopic>>(
    initialTopics.reduce((acc, topic) => {
      acc[topic.id] = topic;
      return acc;
    }, {} as Record<string, HelpTopic>)
  );

  const openHelp = (topic: HelpTopic) => {
    setCurrentTopic(topic);
    setIsHelpOpen(true);
  };

  const closeHelp = () => {
    setIsHelpOpen(false);
  };

  const registerTopic = (topic: HelpTopic) => {
    setHelpTopics(prev => ({
      ...prev,
      [topic.id]: topic
    }));
  };

  return (
    <HelpContext.Provider
      value={{
        isHelpOpen,
        currentTopic,
        openHelp,
        closeHelp,
        helpTopics,
        registerTopic
      }}
    >
      {children}
    </HelpContext.Provider>
  );
};