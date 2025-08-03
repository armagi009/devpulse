import React from 'react';
import { useHelp, HelpTopic } from './HelpContext';

type HelpButtonProps = {
  topicId: string;
  className?: string;
  variant?: 'icon' | 'text' | 'iconText';
  size?: 'sm' | 'md' | 'lg';
  customTopic?: HelpTopic;
};

export const HelpButton: React.FC<HelpButtonProps> = ({
  topicId,
  className = '',
  variant = 'icon',
  size = 'md',
  customTopic
}) => {
  const { openHelp, helpTopics } = useHelp();

  const handleClick = () => {
    if (customTopic) {
      openHelp(customTopic);
    } else if (helpTopics[topicId]) {
      openHelp(helpTopics[topicId]);
    } else {
      console.error(`Help topic with id "${topicId}" not found`);
    }
  };

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const renderContent = () => {
    switch (variant) {
      case 'text':
        return <span>Help</span>;
      case 'iconText':
        return (
          <>
            <QuestionMarkIcon className={`${sizeClasses[size]} inline-block mr-1`} />
            <span>Help</span>
          </>
        );
      case 'icon':
      default:
        return <QuestionMarkIcon className={sizeClasses[size]} />;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center ${
        variant === 'icon' ? 'p-1' : 'px-3 py-1'
      } ${className}`}
      aria-label="Get help"
    >
      {renderContent()}
    </button>
  );
};

// Simple question mark icon component
const QuestionMarkIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 011-1 1.5 1.5 0 10-1.471-1.794l-1.962-.393A3.5 3.5 0 1113 12.355z"
      clipRule="evenodd"
    />
  </svg>
);