import React, { useState, useRef, useEffect } from 'react';

type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  maxWidth?: string;
  className?: string;
  showArrow?: boolean;
  interactive?: boolean;
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
  maxWidth = '250px',
  className = '',
  showArrow = true,
  interactive = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'right':
        top = triggerRect.top + scrollTop + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + scrollLeft + 8;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollTop + 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + scrollTop + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left + scrollLeft - tooltipRect.width - 8;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 10) left = 10;
    if (top < 10) top = 10;
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }
    if (top + tooltipRect.height > viewportHeight + scrollTop - 10) {
      top = viewportHeight + scrollTop - tooltipRect.height - 10;
    }

    setTooltipPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate position after tooltip is visible to get correct dimensions
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!interactive) {
      setIsVisible(false);
    }
  };

  const handleTooltipMouseEnter = () => {
    if (interactive && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    if (interactive) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible]);

  const getArrowStyles = () => {
    switch (position) {
      case 'top':
        return {
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          borderRight: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
        };
      case 'right':
        return {
          left: '-4px',
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          borderLeft: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
        };
      case 'bottom':
        return {
          top: '-4px',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          borderLeft: '1px solid #e2e8f0',
          borderTop: '1px solid #e2e8f0',
        };
      case 'left':
        return {
          right: '-4px',
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          borderRight: '1px solid #e2e8f0',
          borderTop: '1px solid #e2e8f0',
        };
    }
  };

  return (
    <div className="inline-block relative" ref={triggerRef}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 bg-white text-gray-800 p-2 rounded shadow-lg border border-gray-200 text-sm ${className}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            maxWidth,
          }}
          role="tooltip"
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          {content}
          {showArrow && (
            <div
              className="absolute w-2 h-2 bg-white"
              style={getArrowStyles()}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Hint component that builds on top of Tooltip
type HintProps = {
  children: React.ReactNode;
  hint: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  icon?: boolean;
};

export const Hint: React.FC<HintProps> = ({
  children,
  hint,
  position = 'top',
  className = '',
  icon = false
}) => {
  if (icon) {
    return (
      <span className="inline-flex items-center">
        {children}
        <Tooltip content={hint} position={position} className={className}>
          <span className="ml-1 text-gray-400 hover:text-gray-600 cursor-help">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-.25 3.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v3.5a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-3.5z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </Tooltip>
      </span>
    );
  }

  return (
    <Tooltip content={hint} position={position} className={className}>
      {children}
    </Tooltip>
  );
};

// Progressive disclosure component
type ProgressiveDisclosureProps = {
  summary: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  initialOpen?: boolean;
};

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  summary,
  children,
  className = '',
  initialOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className={`border border-gray-200 rounded-md ${className}`}>
      <button
        type="button"
        className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-medium">{summary}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};