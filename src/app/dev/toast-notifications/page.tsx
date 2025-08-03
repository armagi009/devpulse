'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToastProvider, useToast, ToastPosition } from '@/components/ui/toast';

function ToastDemo() {
  const { addToast, position, setPosition } = useToast();
  const [customTitle, setCustomTitle] = useState('Notification Title');
  const [customMessage, setCustomMessage] = useState('This is a notification message.');
  const [customDuration, setCustomDuration] = useState(5000);

  const positions: ToastPosition[] = [
    'top-right',
    'top-left',
    'bottom-right',
    'bottom-left',
    'top-center',
    'bottom-center',
  ];

  const showToast = (type: 'success' | 'error' | 'warning' | 'info' | 'loading') => {
    const id = addToast({
      type,
      title: customTitle || undefined,
      message: customMessage,
      duration: customDuration,
      action: type !== 'loading' ? {
        label: 'Undo',
        onClick: () => {
          addToast({
            type: 'info',
            message: 'Action undone!',
            duration: 3000,
          });
        },
      } : undefined,
    });

    // For loading toast, automatically update it after 3 seconds
    if (type === 'loading') {
      setTimeout(() => {
        addToast({
          type: 'success',
          title: 'Completed',
          message: 'Operation completed successfully!',
          duration: 3000,
        });
      }, 3000);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Toast Types</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => showToast('success')}>Success Toast</Button>
          <Button onClick={() => showToast('error')} variant="destructive">Error Toast</Button>
          <Button onClick={() => showToast('warning')} variant="outline">Warning Toast</Button>
          <Button onClick={() => showToast('info')} variant="secondary">Info Toast</Button>
          <Button onClick={() => showToast('loading')}>Loading Toast</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Toast Position</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {positions.map((pos) => (
            <Button
              key={pos}
              variant={position === pos ? 'default' : 'outline'}
              onClick={() => setPosition(pos)}
            >
              {pos}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Custom Toast</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title (optional)
              </label>
              <input
                id="title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message
              </label>
              <input
                id="message"
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1">
                Duration (ms)
              </label>
              <input
                id="duration"
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="0"
                step="1000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Set to 0 for persistent toast
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={() => showToast('success')}>Show Custom Toast</Button>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Toast Queue Demo</h2>
        <Button
          onClick={() => {
            // Show multiple toasts in sequence
            addToast({
              type: 'info',
              message: 'Starting process...',
              duration: 2000,
            });
            
            setTimeout(() => {
              addToast({
                type: 'loading',
                message: 'Processing data...',
                duration: 0,
              });
            }, 1000);
            
            setTimeout(() => {
              addToast({
                type: 'success',
                message: 'Process completed successfully!',
                duration: 3000,
              });
            }, 4000);
          }}
        >
          Show Toast Sequence
        </Button>
      </section>
    </div>
  );
}

export default function ToastNotificationsPage() {
  return (
    <ToastProvider>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Toast Notification System</h1>
        <ToastDemo />
      </div>
    </ToastProvider>
  );
}