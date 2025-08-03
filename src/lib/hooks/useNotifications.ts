import { useToast, Toast } from '@/components/ui/toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface NotificationOptions extends Partial<Omit<Toast, 'id' | 'type' | 'message'>> {
  autoClose?: boolean;
}

/**
 * Hook for managing notifications throughout the application
 * Provides a simplified interface for showing different types of notifications
 */
export function useNotifications() {
  const { addToast, removeToast } = useToast();

  const showNotification = (
    type: NotificationType,
    message: string,
    options?: NotificationOptions
  ) => {
    const { autoClose = true, ...restOptions } = options || {};
    
    const duration = autoClose ? (restOptions.duration || 5000) : 0;
    
    const id = addToast({
      type,
      message,
      duration,
      ...restOptions,
    });
    
    return id;
  };

  const updateNotification = (
    id: string,
    type: NotificationType,
    message: string,
    options?: NotificationOptions
  ) => {
    removeToast(id);
    return showNotification(type, message, options);
  };

  const dismissNotification = (id: string) => {
    removeToast(id);
  };

  // Convenience methods for different notification types
  const success = (message: string, options?: NotificationOptions) => 
    showNotification('success', message, options);
    
  const error = (message: string, options?: NotificationOptions) => 
    showNotification('error', message, options);
    
  const warning = (message: string, options?: NotificationOptions) => 
    showNotification('warning', message, options);
    
  const info = (message: string, options?: NotificationOptions) => 
    showNotification('info', message, options);
    
  const loading = (message: string, options?: NotificationOptions) => 
    showNotification('loading', message, { autoClose: false, ...options });

  // Method to show a loading notification and then update it when complete
  const withLoading = async <T>(
    loadingMessage: string,
    promise: Promise<T>,
    successMessage: string,
    errorMessage: string = 'An error occurred'
  ): Promise<T> => {
    const id = loading(loadingMessage);
    
    try {
      const result = await promise;
      updateNotification(id, 'success', successMessage);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      updateNotification(id, 'error', message);
      throw err;
    }
  };

  return {
    showNotification,
    updateNotification,
    dismissNotification,
    success,
    error,
    warning,
    info,
    loading,
    withLoading,
  };
}