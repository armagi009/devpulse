'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Bell, X, Check, Settings, Trash2, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  source?: string;
}

// Context interface
interface NotificationCenterContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Create context
const NotificationCenterContext = createContext<NotificationCenterContextValue | undefined>(undefined);

// Provider props
interface NotificationCenterProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
}

// Provider component
export const NotificationCenterProvider: React.FC<NotificationCenterProviderProps> = ({
  children,
  maxNotifications = 50,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Convert string timestamps back to Date objects
        const withDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(withDates);
      } catch (error) {
        console.error('Failed to parse saved notifications:', error);
      }
    }
  }, []);
  
  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => {
      // Add new notification and limit to maxNotifications
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });
    
    return id;
  };
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Remove a notification
  const removeNotification = (id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  return (
    <NotificationCenterContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationCenterContext.Provider>
  );
};

// Hook to use notification center
export const useNotificationCenter = () => {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error('useNotificationCenter must be used within a NotificationCenterProvider');
  }
  return context;
};

// Notification center button component
interface NotificationCenterButtonProps {
  className?: string;
}

export const NotificationCenterButton: React.FC<NotificationCenterButtonProps> = ({
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotificationCenter();
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className={cn('relative', className)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notification center. ${unreadCount} unread notifications`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      
      {isOpen && (
        <NotificationCenterPanel onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

// Notification center panel component
interface NotificationCenterPanelProps {
  onClose: () => void;
}

const NotificationCenterPanel: React.FC<NotificationCenterPanelProps> = ({
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotificationCenter();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  // Filter notifications based on current filter
  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.read);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-center-panel')) {
        onClose();
      }
    };
    
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);
  
  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="notification-center-panel absolute right-0 top-full mt-2 w-80 max-h-[80vh] overflow-hidden rounded-md border bg-background shadow-lg z-50">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">Notifications</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            aria-label="Mark all as read"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
            aria-label="Clear all notifications"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close notification center"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex border-b">
        <button
          className={cn(
            'flex-1 p-2 text-sm font-medium',
            filter === 'all' ? 'border-b-2 border-primary' : ''
          )}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={cn(
            'flex-1 p-2 text-sm font-medium',
            filter === 'unread' ? 'border-b-2 border-primary' : ''
          )}
          onClick={() => setFilter('unread')}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>
      
      <div className="overflow-y-auto max-h-[60vh]">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <BellOff className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={cn(
                'border-b p-3 hover:bg-muted/50 transition-colors',
                !notification.read && 'bg-muted/20'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm truncate">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                      onClick={() => markAsRead(notification.id)}
                    >
                      {notification.actionLabel || 'View details'}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-1 mt-2">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => removeNotification(notification.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="border-t p-2 text-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs w-full"
          asChild
        >
          <a href="/settings">Manage notification settings</a>
        </Button>
      </div>
    </div>
  );
};

// Notification item component for individual notifications
interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onRemove,
}) => {
  const { markAsRead, removeNotification } = useNotificationCenter();
  
  const handleRead = () => {
    if (onRead) {
      onRead(notification.id);
    } else {
      markAsRead(notification.id);
    }
  };
  
  const handleRemove = () => {
    if (onRemove) {
      onRemove(notification.id);
    } else {
      removeNotification(notification.id);
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div
      className={cn(
        'border rounded-md p-3 hover:bg-muted/50 transition-colors',
        !notification.read && 'bg-muted/20'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm truncate">
              {notification.title}
            </h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimestamp(notification.timestamp)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          {notification.actionUrl && (
            <a
              href={notification.actionUrl}
              className="text-xs text-primary hover:underline mt-1 inline-block"
              onClick={handleRead}
            >
              {notification.actionLabel || 'View details'}
            </a>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-1 mt-2">
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleRead}
          >
            Mark as read
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={handleRemove}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
};