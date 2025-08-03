import React, { useState, useEffect, useRef } from 'react';

export type TourStep = {
  target: string; // CSS selector for the target element
  title: string;
  content: React.ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
};

type FeatureTourProps = {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export const FeatureTour: React.FC<FeatureTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!isOpen) return;
    
    const updatePosition = () => {
      const targetElement = document.querySelector(currentStep.target);
      if (!targetElement || !tooltipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;
      
      // Calculate position based on placement
      switch (currentStep.placement || 'bottom') {
        case 'top':
          top = targetRect.top - tooltipRect.height - 10;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + 10;
          break;
        case 'bottom':
          top = targetRect.bottom + 10;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - 10;
          break;
      }
      
      // Ensure tooltip stays within viewport
      if (left < 0) left = 10;
      if (top < 0) top = 10;
      if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (top + tooltipRect.height > window.innerHeight) {
        top = window.innerHeight - tooltipRect.height - 10;
      }
      
      setPosition({ top, left });
      
      // Highlight target element
      targetElement.classList.add('tour-highlight');
      
      return () => {
        targetElement.classList.remove('tour-highlight');
      };
    };
    
    // Add highlight styles if not already present
    if (!document.getElementById('tour-highlight-styles')) {
      const style = document.createElement('style');
      style.id = 'tour-highlight-styles';
      style.innerHTML = `
        .tour-highlight {
          position: relative;
          z-index: 1;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        .tour-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
      `;
      document.head.appendChild(style);
    }
    
    updatePosition();
    
    // Update position on resize
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, currentStep, currentStepIndex]);
  
  if (!isOpen) return null;
  
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  return (
    <>
      <div className="tour-backdrop" onClick={onClose} />
      <div
        ref={tooltipRef}
        className="fixed bg-white rounded-lg shadow-lg z-1001 p-4 w-80"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">{currentStep.title}</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
            aria-label="Close tour"
          >
            <svg
              className="h-5 w-5"
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
        
        <div className="mb-4">{currentStep.content}</div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">
              {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="flex space-x-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                onClick={handlePrevious}
              >
                Previous
              </button>
            )}
            <button
              type="button"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleNext}
            >
              {currentStepIndex < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};