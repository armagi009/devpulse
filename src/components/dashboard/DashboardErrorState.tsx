/**
 * Dashboard Error State
 * Error state components for dashboard pages with retry and recovery options
 */

import React from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Shield, 
  Clock, 
  Home,
  Settings,
  HelpCircle
} from 'lucide-react';
import { ModernCard, ModernButton } from '@/components/ui/modern-card';
import { cn } from '@/lib/utils';

interface DashboardErrorStateProps {
  error: string | null;
  onRetry?: () => void;
  onReset?: () => void;
  className?: string;
  type?: 'network' | 'permission' | 'timeout' | 'server' | 'unknown';
}

/**
 * Get error details based on error type or message
 */
function getErrorDetails(error: string | null, type?: string) {
  // Auto-detect error type from message if not provided
  if (!type && error) {
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')) {
      type = 'network';
    } else if (error.toLowerCase().includes('permission') || error.toLowerCase().includes('unauthorized')) {
      type = 'permission';
    } else if (error.toLowerCase().includes('timeout')) {
      type = 'timeout';
    } else if (error.toLowerCase().includes('server') || error.toLowerCase().includes('500')) {
      type = 'server';
    }
  }

  switch (type) {
    case 'network':
      return {
        icon: Wifi,
        title: 'Connection Problem',
        description: 'Unable to connect to the server. Please check your internet connection.',
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Contact your network administrator if the problem persists'
        ]
      };
    
    case 'permission':
      return {
        icon: Shield,
        title: 'Access Denied',
        description: 'You don\'t have permission to view this dashboard.',
        color: 'text-error',
        bgColor: 'bg-error/10',
        suggestions: [
          'Contact your administrator to request access',
          'Make sure you\'re signed in with the correct account',
          'Try signing out and signing back in'
        ]
      };
    
    case 'timeout':
      return {
        icon: Clock,
        title: 'Request Timeout',
        description: 'The request took too long to complete.',
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        suggestions: [
          'Try again in a few moments',
          'Check your internet connection speed',
          'Contact support if timeouts persist'
        ]
      };
    
    case 'server':
      return {
        icon: AlertTriangle,
        title: 'Server Error',
        description: 'The server encountered an error while processing your request.',
        color: 'text-error',
        bgColor: 'bg-error/10',
        suggestions: [
          'Try refreshing the page',
          'Wait a few minutes and try again',
          'Contact support if the error persists'
        ]
      };
    
    default:
      return {
        icon: AlertTriangle,
        title: 'Something Went Wrong',
        description: error || 'An unexpected error occurred while loading the dashboard.',
        color: 'text-error',
        bgColor: 'bg-error/10',
        suggestions: [
          'Try refreshing the page',
          'Clear your browser cache',
          'Contact support if the problem continues'
        ]
      };
  }
}

/**
 * Main Dashboard Error State Component
 */
export function DashboardErrorState({ 
  error, 
  onRetry, 
  onReset, 
  className, 
  type 
}: DashboardErrorStateProps) {
  const errorDetails = getErrorDetails(error, type);
  const Icon = errorDetails.icon;

  return (
    <div className={cn("flex items-center justify-center min-h-[400px] p-4", className)}>
      <ModernCard className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className={cn("p-3 rounded-full", errorDetails.bgColor)}>
            <Icon size={32} className={errorDetails.color} />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          {errorDetails.title}
        </h2>
        
        <p className="text-muted-foreground mb-6">
          {errorDetails.description}
        </p>

        {/* Error suggestions */}
        <div className="mb-6 p-4 bg-muted rounded-lg text-left">
          <p className="text-sm font-medium text-foreground mb-2">What you can try:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {errorDetails.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <ModernButton
              onClick={onRetry}
              variant="primary"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </ModernButton>
          )}
          
          <ModernButton
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home size={16} />
            Go to Dashboard
          </ModernButton>
        </div>

        {/* Additional actions */}
        <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-border">
          <button
            onClick={() => window.location.href = '/settings'}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings size={14} />
            Settings
          </button>
          
          <button
            onClick={() => window.open('/help', '_blank')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle size={14} />
            Get Help
          </button>
        </div>
      </ModernCard>
    </div>
  );
}

/**
 * Inline error component for smaller spaces
 */
export function InlineErrorState({ 
  error, 
  onRetry, 
  className,
  size = 'md'
}: {
  error: string | null;
  onRetry?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4',
    lg: 'p-6 text-lg'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "bg-error/10 border border-error/20 rounded-lg text-center max-w-sm",
        sizeClasses[size]
      )}>
        <div className="flex items-center justify-center mb-2">
          <AlertTriangle size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} className="text-error" />
        </div>
        
        <p className="text-error-foreground mb-3">
          {error || 'Something went wrong'}
        </p>
        
        {onRetry && (
          <ModernButton
            onClick={onRetry}
            variant="outline"
            size={size === 'sm' ? 'sm' : 'md'}
            className="flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={14} />
            Retry
          </ModernButton>
        )}
      </div>
    </div>
  );
}

/**
 * Error toast notification
 */
export function ErrorToast({ 
  error, 
  onDismiss, 
  onRetry 
}: {
  error: string;
  onDismiss: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <ModernCard className="p-4 border-l-4 border-l-error bg-error/5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-error flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-error-foreground">
              Error
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {error}
            </p>
            
            {onRetry && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={onRetry}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  Retry
                </button>
                <button
                  onClick={onDismiss}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
          
          {!onRetry && (
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
      </ModernCard>
    </div>
  );
}

/**
 * Network status indicator
 */
export function NetworkStatusIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <ModernCard className="p-3 border-l-4 border-l-warning bg-warning/5">
        <div className="flex items-center gap-2">
          <Wifi size={16} className="text-warning" />
          <p className="text-sm text-warning-foreground">
            You're offline
          </p>
        </div>
      </ModernCard>
    </div>
  );
}

export default DashboardErrorState;