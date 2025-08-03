import React from 'react';
import { useHelp } from './HelpContext';

type HelpPanelProps = {
  className?: string;
  position?: 'right' | 'left' | 'bottom';
  width?: 'narrow' | 'medium' | 'wide';
};

export const HelpPanel: React.FC<HelpPanelProps> = ({
  className = '',
  position = 'right',
  width = 'medium'
}) => {
  const { isHelpOpen, currentTopic, closeHelp, helpTopics } = useHelp();

  if (!isHelpOpen || !currentTopic) {
    return null;
  }

  const positionClasses = {
    right: 'right-0 top-0 h-full',
    left: 'left-0 top-0 h-full',
    bottom: 'bottom-0 left-0 right-0'
  };

  const widthClasses = {
    narrow: position === 'bottom' ? 'h-1/4' : 'w-64',
    medium: position === 'bottom' ? 'h-1/3' : 'w-80',
    wide: position === 'bottom' ? 'h-1/2' : 'w-96'
  };

  const renderRelatedTopics = () => {
    if (!currentTopic.relatedTopics || currentTopic.relatedTopics.length === 0) {
      return null;
    }

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700">Related Topics</h4>
        <ul className="mt-2 space-y-1">
          {currentTopic.relatedTopics.map(topicId => {
            const topic = helpTopics[topicId];
            if (!topic) return null;
            
            return (
              <li key={topicId}>
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  onClick={() => topic && closeHelp()}
                >
                  {topic.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div
      className={`fixed bg-white shadow-lg border border-gray-200 z-50 overflow-auto ${
        positionClasses[position]
      } ${widthClasses[width]} ${className}`}
      role="dialog"
      aria-labelledby="help-panel-title"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 id="help-panel-title" className="text-lg font-medium text-gray-900">
            {currentTopic.title}
          </h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={closeHelp}
            aria-label="Close help panel"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <div className="prose prose-sm max-w-none">
          {typeof currentTopic.content === 'string' ? (
            <p>{currentTopic.content}</p>
          ) : (
            currentTopic.content
          )}
        </div>
        
        {renderRelatedTopics()}
      </div>
    </div>
  );
};