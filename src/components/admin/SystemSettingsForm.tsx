'use client';

/**
 * System Settings Form Component
 * Form for updating system settings with accessibility improvements
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Form, 
  FormGroup, 
  FormInput, 
  FormCheckbox, 
  FormSubmit, 
  FormLabel,
  FormHelperText,
  FormErrorMessage
} from '@/components/ui/form';
import { ErrorMessage } from '@/components/ui/error-message';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  isEncrypted: boolean;
  lastModifiedBy?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface SystemSettingsFormProps {
  settings: SystemSetting[];
}

export default function SystemSettingsForm({ settings }: SystemSettingsFormProps) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<Record<string, string>>(
    settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Handle input change
  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(null);
    
    try {
      setIsLoading(true);
      
      // Send settings update request
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: formValues }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }
      
      // Show success message
      setSuccess('Settings updated successfully');
      
      // Announce success to screen readers
      const announcer = document.getElementById('settings-announcer');
      if (announcer) {
        announcer.textContent = 'Settings updated successfully';
      }
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to update settings');
      
      // Announce error to screen readers
      const announcer = document.getElementById('settings-announcer');
      if (announcer) {
        announcer.textContent = `Error: ${error instanceof Error ? error.message : 'Failed to update settings'}`;
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Group settings by category
  const groupedSettings: Record<string, SystemSetting[]> = {};
  
  settings.forEach((setting) => {
    const category = setting.key.split('_')[0] || 'general';
    if (!groupedSettings[category]) {
      groupedSettings[category] = [];
    }
    groupedSettings[category].push(setting);
  });
  
  // Format category name
  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  // Format setting key for display
  const formatSettingKey = (key: string) => {
    return key
      .split('_')
      .slice(1)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Determine input type based on value
  const getInputType = (value: string) => {
    if (value === 'true' || value === 'false') {
      return 'boolean';
    } else if (!isNaN(Number(value))) {
      return 'number';
    } else {
      return 'text';
    }
  };
  
  return (
    <>
      {/* Accessible status announcer for screen readers */}
      <div 
        id="settings-announcer" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      ></div>
      
      <Form onSubmit={handleSubmit} className="space-y-6">
        <fieldset>
          <legend className="sr-only">System Settings</legend>
          
          {Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <div key={category} className="space-y-4">
              <h3 
                id={`category-${category}`} 
                className="text-md font-medium text-gray-700 dark:text-gray-300"
              >
                {formatCategory(category)} Settings
              </h3>
              
              <div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                role="group" 
                aria-labelledby={`category-${category}`}
              >
                {categorySettings.map((setting) => {
                  const inputType = getInputType(setting.value);
                  const settingId = `setting-${setting.key}`;
                  
                  return (
                    <div key={setting.id}>
                      {inputType === 'boolean' ? (
                        <FormCheckbox
                          id={settingId}
                          name={setting.key}
                          label={formatSettingKey(setting.key)}
                          checked={formValues[setting.key] === 'true'}
                          onChange={(e) => handleChange(setting.key, e.target.checked ? 'true' : 'false')}
                          disabled={isLoading || setting.isEncrypted}
                          helperText={setting.description || undefined}
                        />
                      ) : (
                        <FormGroup>
                          <FormLabel htmlFor={settingId}>
                            {formatSettingKey(setting.key)}
                          </FormLabel>
                          
                          {inputType === 'number' ? (
                            <input
                              type="number"
                              id={settingId}
                              name={setting.key}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                              value={formValues[setting.key]}
                              onChange={(e) => handleChange(setting.key, e.target.value)}
                              disabled={isLoading || setting.isEncrypted}
                              aria-describedby={setting.description ? `${settingId}-desc` : undefined}
                            />
                          ) : (
                            <input
                              type={setting.isEncrypted ? 'password' : 'text'}
                              id={settingId}
                              name={setting.key}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                              value={formValues[setting.key]}
                              onChange={(e) => handleChange(setting.key, e.target.value)}
                              disabled={isLoading || setting.isEncrypted}
                              aria-describedby={setting.description ? `${settingId}-desc` : undefined}
                            />
                          )}
                          
                          {setting.description && (
                            <FormHelperText id={`${settingId}-desc`}>
                              {setting.description}
                            </FormHelperText>
                          )}
                        </FormGroup>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </fieldset>
        
        <div className="pt-4">
          <FormSubmit
            isLoading={isLoading}
            loadingText="Saving..."
          >
            Save Settings
          </FormSubmit>
        </div>
        
        {error && (
          <ErrorMessage 
            error={new Error(error)} 
            onRetry={() => handleSubmit} 
          />
        )}
        
        {success && (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20" role="status">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Success</h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>{success}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Form>
    </>
  );
}