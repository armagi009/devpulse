'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  NotificationCenterButton, 
  useNotificationCenter, 
  NotificationItem,
  NotificationType
} from '@/components/ui/notification-center';

export default function NotificationManagementDemo() {
  const { 
    addNotification, 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    clearAllNotifications 
  } = useNotificationCenter();
  
  const [title, setTitle] = useState('Notification Title');
  const [message, setMessage] = useState('This is a notification message.');
  const [type, setType] = useState<NotificationType>('info');
  const [actionUrl, setActionUrl] = useState('/settings');
  const [actionLabel, setActionLabel] = useState('View Settings');
  
  const notificationTypes: NotificationType[] = ['info', 'success', 'warning', 'error', 'system'];
  
  const createNotification = () => {
    addNotification({
      title,
      message,
      type,
      actionUrl: actionUrl || undefined,
      actionLabel: actionLabel || undefined,
    });
  };
  
  const createSampleNotifications = () => {
    // Add a few sample notifications
    addNotification({
      title: 'Repository Sync Complete',
      message: 'All repositories have been synchronized successfully.',
      type: 'success',
    });
    
    addNotification({
      title: 'New Team Member',
      message: 'John Doe has joined your team.',
      type: 'info',
      actionUrl: '/dashboard/team',
      actionLabel: 'View Team',
    });
    
    addNotification({
      title: 'Burnout Risk Alert',
      message: 'Your team shows signs of increased burnout risk.',
      type: 'warning',
      actionUrl: '/dashboard/burnout',
      actionLabel: 'View Report',
    });
    
    addNotification({
      title: 'API Rate Limit Exceeded',
      message: 'GitHub API rate limit has been exceeded. Some data may be delayed.',
      type: 'error',
    });
    
    addNotification({
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur on July 25, 2025 at 2:00 AM UTC.',
      type: 'system',
    });
  };
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Notification Management System</h1>
        <NotificationCenterButton />
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Create Notification</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
              >
                {notificationTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Action URL (optional)</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/some/path"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Action Label (optional)</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                placeholder="View Details"
              />
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <Button onClick={createNotification}>
              Create Notification
            </Button>
            <Button variant="outline" onClick={createSampleNotifications}>
              Add Sample Notifications
            </Button>
          </div>
        </Card>
      </section>
      
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Notification Management</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Mark All as Read
            </Button>
            <Button variant="outline" onClick={clearAllNotifications} disabled={notifications.length === 0}>
              Clear All
            </Button>
          </div>
        </div>
        
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Notification Stats</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">Total Notifications</div>
                <div className="text-2xl font-bold">{notifications.length}</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">Unread Notifications</div>
                <div className="text-2xl font-bold">{unreadCount}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Notifications</h3>
            {notifications.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                No notifications to display
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Notification Center</h2>
        <Card className="p-6">
          <div className="text-center">
            <p className="mb-4">
              Click the notification bell icon in the top right corner of this page to open the notification center.
            </p>
            <NotificationCenterButton className="mx-auto" />
          </div>
        </Card>
      </section>
    </div>
  );
}