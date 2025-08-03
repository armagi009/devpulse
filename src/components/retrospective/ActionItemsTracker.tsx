'use client';

/**
 * ActionItemsTracker Component
 * Allows tracking and managing action items from retrospectives
 */

import React, { useState } from 'react';
import { CheckCircle, Circle, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ActionItemsTrackerProps {
  retrospectiveId: string;
  initialActionItems: string[];
}

interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function ActionItemsTracker({ 
  retrospectiveId, 
  initialActionItems 
}: ActionItemsTrackerProps) {
  // Convert string array to ActionItem objects
  const [actionItems, setActionItems] = useState<ActionItem[]>(
    initialActionItems.map((text, index) => ({
      id: `initial-${index}`,
      text,
      completed: false,
    }))
  );
  
  const [newItemText, setNewItemText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toggle action item completion
  const toggleActionItem = (id: string) => {
    setActionItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    
    // In a real implementation, we would save this to the database
    // saveActionItems();
  };
  
  // Add new action item
  const addActionItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ActionItem = {
      id: `new-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
    };
    
    setActionItems([...actionItems, newItem]);
    setNewItemText('');
    
    // In a real implementation, we would save this to the database
    // saveActionItems();
  };
  
  // Remove action item
  const removeActionItem = (id: string) => {
    setActionItems(items => items.filter(item => item.id !== id));
    
    // In a real implementation, we would save this to the database
    // saveActionItems();
  };
  
  // Save action items to database
  const saveActionItems = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // In a real implementation, we would save to the database
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Example API call:
      // const response = await fetch(`/api/retrospectives/${retrospectiveId}/action-items`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     actionItems: actionItems.map(item => ({
      //       text: item.text,
      //       completed: item.completed,
      //     })),
      //   }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to save action items');
      // }
      
    } catch (err) {
      console.error('Error saving action items:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Action Items List */}
      <ul className="space-y-2">
        {actionItems.map((item) => (
          <li key={item.id} className="flex items-center justify-between group">
            <div className="flex items-center flex-1">
              <button
                onClick={() => toggleActionItem(item.id)}
                className="flex-shrink-0 mr-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {item.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <span className={item.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}>
                {item.text}
              </span>
            </div>
            <button
              onClick={() => removeActionItem(item.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        
        {actionItems.length === 0 && (
          <li className="text-gray-500 dark:text-gray-400 text-center py-2">
            No action items yet. Add some below.
          </li>
        )}
      </ul>
      
      {/* Add New Action Item */}
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Add a new action item..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addActionItem();
            }
          }}
          className="flex-1"
        />
        <Button onClick={addActionItem} size="sm">
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}
      
      {/* Save Button */}
      {/* In a real implementation, we would show a save button */}
      {/* <div className="flex justify-end mt-4">
        <Button onClick={saveActionItems} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div> */}
    </div>
  );
}