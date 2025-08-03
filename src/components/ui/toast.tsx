'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

// Toast Position
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

// Toast Interface
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Context Interface
interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  position: ToastPosition;
  setPosition: (position: ToastPosition) => void;
}

// Create Context
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Toast Provider Props
interface ToastProviderProps {
  children: React.ReactNode;
  defaultPosition?: ToastPosition;
}

// Toast Provider Component
export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  defaultPosition = 'bottom-right' 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [position, setPosition] = useState<ToastPosition>(defaultPosition);

  // Add Toast
  const addToast = (toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || (toast.type === 'loading' ? 0 : 5000),
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    return id;
  };

  // Remove Toast
  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Auto-remove toasts after duration
  useEffect(() => {
    const timers = toasts
      .filter((toast) => toast.duration !== 0)
      .map((toast) => {
        return setTimeout(() => {
          removeToast(toast.id);
          toast.onClose?.();
        }, toast.duration);
      });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, position, setPosition }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use Toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Container Component
const ToastContainer: React.FC = () => {
  const { toasts, removeToast, position } = useToast();

  const positionClasses = {
    'top-right': 'top-4 right-4 flex-col-reverse',
    'top-left': 'top-4 left-4 flex-col-reverse',
    'bottom-right': 'bottom-4 right-4 flex-col',
    'bottom-left': 'bottom-4 left-4 flex-col',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 flex-col-reverse',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 flex-col',
  };

  return (
    <div
      className={cn(
        'fixed z-50 flex gap-2 max-h-screen overflow-hidden p-4 max-w-[420px] w-full',
        positionClasses[position]
      )}
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// Toast Item Component
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const { type, message, title, action } = toast;

  const typeClasses = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
    loading: 'bg-gray-50 border-gray-500 text-gray-800',
  };

  const iconMap = {
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-500">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-yellow-500">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-500">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    ),
    loading: <Spinner size="sm" />,
  };

  return (
    <div
      className={cn(
        'w-full rounded-lg border-l-4 p-4 shadow-md transition-all duration-300 animate-slide-in',
        typeClasses[type]
      )}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{iconMap[type]}</div>
        <div className="flex-1">
          {title && <h3 className="font-medium">{title}</h3>}
          <p className={cn('text-sm', title && 'mt-1')}>{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium underline hover:text-opacity-80"
            >
              {action.label}
            </button>
          )}
        </div>
        {type !== 'loading' && (
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-md p-1 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Utility functions for common toast types
export const toast = {
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return useToast().addToast({ message, type: 'success', ...options });
  },
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return useToast().addToast({ message, type: 'error', ...options });
  },
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return useToast().addToast({ message, type: 'warning', ...options });
  },
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return useToast().addToast({ message, type: 'info', ...options });
  },
  loading: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return useToast().addToast({ message, type: 'loading', ...options });
  },
  dismiss: (id: string) => {
    useToast().removeToast(id);
  },
  update: (id: string, options: Partial<Omit<Toast, 'id'>>) => {
    const { removeToast, addToast } = useToast();
    removeToast(id);
    return addToast({ ...options } as Omit<Toast, 'id'>);
  },
};