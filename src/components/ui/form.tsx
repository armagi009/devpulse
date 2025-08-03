'use client';

/**
 * Form Components
 * Accessible form components for DevPulse
 */

import * as React from 'react';
import { Input, InputProps } from './input';
import { cn } from '@/lib/utils';
import { generateAccessibilityId } from './accessibility-utils';

// Form Context for managing form state and validation
interface FormContextValue {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setFieldTouched: (name: string) => void;
  setFieldError: (name: string, error: string | null) => void;
  isSubmitting: boolean;
}

const FormContext = React.createContext<FormContextValue>({
  errors: {},
  touched: {},
  setFieldTouched: () => {},
  setFieldError: () => {},
  isSubmitting: false,
});

// Form Component
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  initialErrors?: Record<string, string>;
}

export function Form({
  children,
  onSubmit,
  initialErrors = {},
  className,
  ...props
}: FormProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>(initialErrors);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const setFieldTouched = React.useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setFieldError = React.useCallback((name: string, error: string | null) => {
    setErrors((prev) => {
      if (error === null) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return { ...prev, [name]: error };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched on submit
    const formElements = e.currentTarget.elements;
    const fieldNames = new Set<string>();
    const newErrors: Record<string, string> = {};
    
    for (let i = 0; i < formElements.length; i++) {
      const element = formElements[i] as HTMLInputElement;
      if (element.name) {
        fieldNames.add(element.name);
        
        // Check for required fields
        if (element.hasAttribute('required') && !element.value) {
          const fieldName = element.name.charAt(0).toUpperCase() + element.name.slice(1);
          newErrors[element.name] = `${fieldName} is required`;
        }
      }
    }
    
    const newTouched = Array.from(fieldNames).reduce((acc, name) => {
      acc[name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(newTouched);
    
    // Update errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
    
    // If there are errors, don't submit
    if (Object.keys(errors).length > 0 || Object.keys(newErrors).length > 0) {
      // Find the first error and focus that element
      const errorKey = Object.keys(errors)[0] || Object.keys(newErrors)[0];
      const firstErrorField = document.querySelector(`[name="${errorKey}"]`);
      if (firstErrorField instanceof HTMLElement) {
        firstErrorField.focus();
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider
      value={{
        errors,
        touched,
        setFieldTouched,
        setFieldError,
        isSubmitting,
      }}
    >
      <form
        onSubmit={handleSubmit}
        className={className}
        noValidate
        role="form"
        aria-label="Form"
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

// Form Group Component
interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FormGroup({ children, className }: FormGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  );
}

// Form Label Component
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({
  children,
  htmlFor,
  required,
  className,
  ...props
}: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-sm font-medium text-gray-700 dark:text-gray-300',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

// Form Input Component
interface FormInputProps extends InputProps {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  validate?: (value: string) => string | null;
}

export function FormInput({
  name,
  label,
  helperText,
  required,
  validate,
  className,
  onBlur,
  onChange,
  id,
  ...props
}: FormInputProps) {
  const { errors, touched, setFieldTouched, setFieldError, isSubmitting } = React.useContext(FormContext);
  const inputId = id || `input-${name}`;
  const helperTextId = `helper-${inputId}`;
  const errorId = `error-${inputId}`;
  const hasError = touched[name] && errors[name];
  
  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFieldTouched(name);
      
      if (validate) {
        const error = validate(e.target.value);
        setFieldError(name, error);
      }
      
      onBlur?.(e);
    },
    [name, onBlur, setFieldTouched, setFieldError, validate]
  );
  
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (touched[name] && validate) {
        const error = validate(e.target.value);
        setFieldError(name, error);
      }
      
      onChange?.(e);
    },
    [name, onChange, setFieldError, touched, validate]
  );

  return (
    <FormGroup>
      {label && (
        <FormLabel htmlFor={inputId} required={required}>
          {label}
        </FormLabel>
      )}
      <Input
        id={inputId}
        name={name}
        className={cn(
          hasError && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={
          helperText && !hasError
            ? helperTextId
            : hasError
            ? errorId
            : undefined
        }
        required={required}
        onBlur={handleBlur}
        onChange={handleChange}
        disabled={isSubmitting || props.disabled}
        {...props}
      />
      {helperText && !hasError && (
        <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
      )}
      {hasError && <FormErrorMessage id={errorId}>{errors[name]}</FormErrorMessage>}
    </FormGroup>
  );
}

// Form Helper Text Component
interface FormHelperTextProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function FormHelperText({
  children,
  id,
  className,
}: FormHelperTextProps) {
  return (
    <p
      id={id}
      className={cn('text-xs text-gray-500 dark:text-gray-400', className)}
    >
      {children}
    </p>
  );
}

// Form Error Message Component
interface FormErrorMessageProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function FormErrorMessage({
  children,
  id,
  className,
}: FormErrorMessageProps) {
  return (
    <p
      id={id}
      className={cn('text-xs text-red-500 dark:text-red-400', className)}
      role="alert"
    >
      {children}
    </p>
  );
}

// Form Submit Button Component
interface FormSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export function FormSubmit({
  children,
  isLoading,
  loadingText = 'Submitting...',
  className,
  disabled,
  ...props
}: FormSubmitProps) {
  const { isSubmitting } = React.useContext(FormContext);
  const isDisabled = isSubmitting || isLoading || disabled;
  
  return (
    <button
      type="submit"
      className={cn(
        'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {(isSubmitting || isLoading) ? loadingText : children}
    </button>
  );
}

// Form Checkbox Component
interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  helperText?: string;
  validate?: (checked: boolean) => string | null;
}

export function FormCheckbox({
  name,
  label,
  helperText,
  validate,
  className,
  onBlur,
  onChange,
  id,
  ...props
}: FormCheckboxProps) {
  const { errors, touched, setFieldTouched, setFieldError, isSubmitting } = React.useContext(FormContext);
  const inputId = id || `checkbox-${name}`;
  const helperTextId = `helper-${inputId}`;
  const errorId = `error-${inputId}`;
  const hasError = touched[name] && errors[name];
  
  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFieldTouched(name);
      
      if (validate) {
        const error = validate(e.target.checked);
        setFieldError(name, error);
      }
      
      onBlur?.(e);
    },
    [name, onBlur, setFieldTouched, setFieldError, validate]
  );
  
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (touched[name] && validate) {
        const error = validate(e.target.checked);
        setFieldError(name, error);
      }
      
      onChange?.(e);
    },
    [name, onChange, setFieldError, touched, validate]
  );

  return (
    <FormGroup>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={inputId}
            name={name}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800',
              hasError && 'border-red-500 focus:ring-red-500',
              className
            )}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              helperText && !hasError
                ? helperTextId
                : hasError
                ? errorId
                : undefined
            }
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={isSubmitting || props.disabled}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor={inputId}
            className="font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
          {helperText && !hasError && (
            <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
          )}
          {hasError && <FormErrorMessage id={errorId}>{errors[name]}</FormErrorMessage>}
        </div>
      </div>
    </FormGroup>
  );
}

// Form Select Component
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  validate?: (value: string) => string | null;
}

export function FormSelect({
  name,
  label,
  helperText,
  required,
  options,
  validate,
  className,
  onBlur,
  onChange,
  id,
  ...props
}: FormSelectProps) {
  const { errors, touched, setFieldTouched, setFieldError, isSubmitting } = React.useContext(FormContext);
  const selectId = id || `select-${name}`;
  const helperTextId = `helper-${selectId}`;
  const errorId = `error-${selectId}`;
  const hasError = touched[name] && errors[name];
  
  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLSelectElement>) => {
      setFieldTouched(name);
      
      if (validate) {
        const error = validate(e.target.value);
        setFieldError(name, error);
      }
      
      onBlur?.(e);
    },
    [name, onBlur, setFieldTouched, setFieldError, validate]
  );
  
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (touched[name] && validate) {
        const error = validate(e.target.value);
        setFieldError(name, error);
      }
      
      onChange?.(e);
    },
    [name, onChange, setFieldError, touched, validate]
  );

  return (
    <FormGroup>
      {label && (
        <FormLabel htmlFor={selectId} required={required}>
          {label}
        </FormLabel>
      )}
      <select
        id={selectId}
        name={name}
        className={cn(
          'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white',
          hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={
          helperText && !hasError
            ? helperTextId
            : hasError
            ? errorId
            : undefined
        }
        required={required}
        onBlur={handleBlur}
        onChange={handleChange}
        disabled={isSubmitting || props.disabled}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !hasError && (
        <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
      )}
      {hasError && <FormErrorMessage id={errorId}>{errors[name]}</FormErrorMessage>}
    </FormGroup>
  );
}

// Form Textarea Component
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  validate?: (value: string) => string | null;
}

export function FormTextarea({
  name,
  label,
  helperText,
  required,
  validate,
  className,
  onBlur,
  onChange,
  id,
  ...props
}: FormTextareaProps) {
  const { errors, touched, setFieldTouched, setFieldError, isSubmitting } = React.useContext(FormContext);
  const textareaId = id || `textarea-${name}`;
  const helperTextId = `helper-${textareaId}`;
  const errorId = `error-${textareaId}`;
  const hasError = touched[name] && errors[name];
  
  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFieldTouched(name);
      
      if (validate) {
        const error = validate(e.target.value);
        setFieldError(name, error);
      }
      
      onBlur?.(e);
    },
    [name, onBlur, setFieldTouched, setFieldError, validate]
  );
  
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (touched[name] && validate) {
        const error = validate(e.target.value);
        setFieldError(name, error);
      }
      
      onChange?.(e);
    },
    [name, onChange, setFieldError, touched, validate]
  );

  return (
    <FormGroup>
      {label && (
        <FormLabel htmlFor={textareaId} required={required}>
          {label}
        </FormLabel>
      )}
      <textarea
        id={textareaId}
        name={name}
        className={cn(
          'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white',
          hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={
          helperText && !hasError
            ? helperTextId
            : hasError
            ? errorId
            : undefined
        }
        required={required}
        onBlur={handleBlur}
        onChange={handleChange}
        disabled={isSubmitting || props.disabled}
        {...props}
      />
      {helperText && !hasError && (
        <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
      )}
      {hasError && <FormErrorMessage id={errorId}>{errors[name]}</FormErrorMessage>}
    </FormGroup>
  );
}

// Form Radio Group Component
interface FormRadioGroupProps {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  validate?: (value: string) => string | null;
  className?: string;
  disabled?: boolean;
}

export function FormRadioGroup({
  name,
  label,
  helperText,
  required,
  options,
  value,
  onChange,
  validate,
  className,
  disabled,
}: FormRadioGroupProps) {
  const { errors, touched, setFieldTouched, setFieldError, isSubmitting } = React.useContext(FormContext);
  const groupId = `radio-group-${name}`;
  const helperTextId = `helper-${groupId}`;
  const errorId = `error-${groupId}`;
  const hasError = touched[name] && errors[name];
  
  const handleBlur = React.useCallback(() => {
    setFieldTouched(name);
    
    if (validate) {
      const error = validate(value);
      setFieldError(name, error);
    }
  }, [name, setFieldTouched, setFieldError, validate, value]);
  
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
      
      if (touched[name] && validate) {
        const error = validate(e.target.value);
        setFieldError(name, error);
      }
    },
    [name, onChange, setFieldError, touched, validate]
  );

  return (
    <FormGroup className={className}>
      {label && (
        <FormLabel required={required}>{label}</FormLabel>
      )}
      <div
        role="radiogroup"
        aria-labelledby={label ? groupId : undefined}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={
          helperText && !hasError
            ? helperTextId
            : hasError
            ? errorId
            : undefined
        }
        className="space-y-2"
      >
        {options.map((option) => {
          const radioId = `${name}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center">
              <input
                id={radioId}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(
                  'h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800',
                  hasError && 'border-red-500 focus:ring-red-500'
                )}
                disabled={isSubmitting || disabled}
                required={required}
              />
              <label
                htmlFor={radioId}
                className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      {helperText && !hasError && (
        <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
      )}
      {hasError && <FormErrorMessage id={errorId}>{errors[name]}</FormErrorMessage>}
    </FormGroup>
  );
}