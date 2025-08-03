'use client';

/**
 * Form Accessibility Demo Page
 * Demonstrates accessible form components
 */

import React, { useState } from 'react';
import {
  Form,
  FormGroup,
  FormInput,
  FormCheckbox,
  FormSelect,
  FormTextarea,
  FormRadioGroup,
  FormSubmit,
  FormLabel,
  FormHelperText,
  FormErrorMessage
} from '@/components/ui/form';

export default function FormAccessibilityDemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'developer',
    message: '',
    notifications: false,
    department: 'engineering'
  });
  
  const [submissionResult, setSubmissionResult] = useState<{
    success?: string;
    error?: string;
  }>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleRadioChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset submission result
    setSubmissionResult({});
    
    // Simulate API call
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate validation error for demo purposes
      if (!formData.email.includes('@')) {
        setSubmissionResult({
          error: 'Please enter a valid email address'
        });
        return;
      }
      
      // Simulate successful submission
      setSubmissionResult({
        success: 'Form submitted successfully!'
      });
      
      // Announce success to screen readers
      const announcer = document.getElementById('form-announcer');
      if (announcer) {
        announcer.textContent = 'Form submitted successfully!';
      }
    } catch (error) {
      setSubmissionResult({
        error: 'An error occurred while submitting the form. Please try again.'
      });
      
      // Announce error to screen readers
      const announcer = document.getElementById('form-announcer');
      if (announcer) {
        announcer.textContent = 'An error occurred while submitting the form. Please try again.';
      }
    }
  };
  
  // Validation functions
  const validateName = (value: string) => {
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    return null;
  };
  
  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    if (!value.includes('@')) return 'Please enter a valid email address';
    return null;
  };
  
  const validateMessage = (value: string) => {
    if (value && value.length < 10) return 'Message must be at least 10 characters';
    return null;
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Form Accessibility Demo</h1>
      
      {/* Accessible status announcer for screen readers */}
      <div 
        id="form-announcer" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      ></div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <Form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              validate={validateName}
              helperText="Enter your full name as it appears on official documents"
            />
            
            <FormInput
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              validate={validateEmail}
              helperText="We'll never share your email with anyone else"
            />
          </div>
          
          <FormSelect
            name="department"
            label="Department"
            value={formData.department}
            onChange={handleChange}
            options={[
              { value: 'engineering', label: 'Engineering' },
              { value: 'product', label: 'Product' },
              { value: 'design', label: 'Design' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'sales', label: 'Sales' }
            ]}
            helperText="Select the department you work in"
          />
          
          <FormRadioGroup
            name="role"
            label="Your Role"
            value={formData.role}
            onChange={handleRadioChange}
            options={[
              { value: 'developer', label: 'Developer' },
              { value: 'team_lead', label: 'Team Lead' },
              { value: 'admin', label: 'Administrator' }
            ]}
            helperText="Select your primary role in the organization"
          />
          
          <FormTextarea
            name="message"
            label="Message (Optional)"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            validate={validateMessage}
            helperText="If you have any specific requirements or questions, please let us know"
          />
          
          <FormCheckbox
            name="notifications"
            label="Receive email notifications about system updates and new features"
            checked={formData.notifications}
            onChange={handleChange}
          />
          
          <div className="flex flex-col space-y-4">
            <FormSubmit>Submit Form</FormSubmit>
            
            {submissionResult.success && (
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
                      <p>{submissionResult.success}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {submissionResult.error && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20" role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{submissionResult.error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Form>
      </div>
      
      <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Accessibility Features</h2>
        
        <ul className="list-disc pl-5 space-y-2">
          <li>All form controls have proper labels with <code>htmlFor</code> attributes</li>
          <li>Required fields are clearly marked</li>
          <li>Helper text is associated with inputs using <code>aria-describedby</code></li>
          <li>Error messages are announced to screen readers with <code>role="alert"</code></li>
          <li>Form controls have proper focus states for keyboard navigation</li>
          <li>Form validation provides clear error messages</li>
          <li>Status messages are announced to screen readers using live regions</li>
          <li>Color is not the only means of conveying information</li>
          <li>All interactive elements have sufficient color contrast</li>
        </ul>
      </div>
    </div>
  );
}