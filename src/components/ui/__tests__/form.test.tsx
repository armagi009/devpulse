/**
 * Form Components Tests
 * Tests for accessibility compliance of form components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Form,
  FormGroup,
  FormInput,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  FormCheckbox,
  FormSelect,
  FormTextarea,
  FormRadioGroup,
  FormSubmit
} from '../form';

describe('Form Components Accessibility', () => {
  // Form component tests
  describe('Form', () => {
    it('renders a form with proper attributes', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      render(<Form onSubmit={handleSubmit}><button type="submit">Submit</button></Form>);
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('noValidate');
      
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
  
  // FormLabel tests
  describe('FormLabel', () => {
    it('renders a label with proper attributes', () => {
      render(<FormLabel htmlFor="test-input">Test Label</FormLabel>);
      
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });
    
    it('indicates required fields with visual indicator', () => {
      render(<FormLabel htmlFor="test-input" required>Required Field</FormLabel>);
      
      const label = screen.getByText('Required Field');
      expect(label).toContainHTML('*');
    });
  });
  
  // FormInput tests
  describe('FormInput', () => {
    it('connects label to input with matching IDs', () => {
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormInput name="test" label="Test Input" />
        </Form>
      );
      
      const label = screen.getByText('Test Input');
      const input = screen.getByLabelText('Test Input');
      expect(label).toHaveAttribute('for', input.id);
    });
    
    it('shows helper text with proper ARIA attributes', () => {
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormInput name="test" label="Test Input" helperText="This is helper text" />
        </Form>
      );
      
      const input = screen.getByLabelText('Test Input');
      const helperText = screen.getByText('This is helper text');
      expect(input).toHaveAttribute('aria-describedby', helperText.id);
    });
    
    it('shows validation errors with proper ARIA attributes', async () => {
      const validate = (value: string) => value ? null : 'This field is required';
      
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormInput 
            name="test" 
            label="Test Input" 
            validate={validate} 
          />
        </Form>
      );
      
      const input = screen.getByLabelText('Test Input');
      fireEvent.blur(input);
      
      const errorMessage = await screen.findByText('This field is required');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', errorMessage.id);
    });
  });
  
  // FormCheckbox tests
  describe('FormCheckbox', () => {
    it('renders an accessible checkbox with label', () => {
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormCheckbox name="test" label="Accept terms" />
        </Form>
      );
      
      const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
      expect(checkbox).toBeInTheDocument();
    });
    
    it('shows validation errors for checkboxes', async () => {
      const validate = (checked: boolean) => checked ? null : 'You must accept the terms';
      
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormCheckbox 
            name="terms" 
            label="Accept terms" 
            validate={validate} 
          />
        </Form>
      );
      
      const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
      fireEvent.blur(checkbox);
      
      const errorMessage = await screen.findByText('You must accept the terms');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
      expect(checkbox).toHaveAttribute('aria-describedby', errorMessage.id);
    });
  });
  
  // FormSelect tests
  describe('FormSelect', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];
    
    it('renders an accessible select with options', () => {
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormSelect 
            name="test" 
            label="Select an option" 
            options={options} 
          />
        </Form>
      );
      
      const select = screen.getByRole('combobox', { name: 'Select an option' });
      expect(select).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
    
    it('shows validation errors for select', async () => {
      const validate = (value: string) => value === 'option1' ? 'Please select a different option' : null;
      
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormSelect 
            name="test" 
            label="Select an option" 
            options={options} 
            validate={validate} 
            defaultValue="option1"
          />
        </Form>
      );
      
      const select = screen.getByRole('combobox', { name: 'Select an option' });
      fireEvent.blur(select);
      
      const errorMessage = await screen.findByText('Please select a different option');
      expect(select).toHaveAttribute('aria-invalid', 'true');
      expect(select).toHaveAttribute('aria-describedby', errorMessage.id);
    });
  });
  
  // FormTextarea tests
  describe('FormTextarea', () => {
    it('renders an accessible textarea with label', () => {
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormTextarea 
            name="test" 
            label="Enter description" 
          />
        </Form>
      );
      
      const textarea = screen.getByRole('textbox', { name: 'Enter description' });
      expect(textarea).toBeInTheDocument();
    });
    
    it('shows validation errors for textarea', async () => {
      const validate = (value: string) => value.length < 10 ? 'Description must be at least 10 characters' : null;
      
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormTextarea 
            name="test" 
            label="Enter description" 
            validate={validate} 
            defaultValue="Short"
          />
        </Form>
      );
      
      const textarea = screen.getByRole('textbox', { name: 'Enter description' });
      fireEvent.blur(textarea);
      
      const errorMessage = await screen.findByText('Description must be at least 10 characters');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', errorMessage.id);
    });
  });
  
  // FormRadioGroup tests
  describe('FormRadioGroup', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];
    
    it('renders an accessible radio group', () => {
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormRadioGroup 
            name="test" 
            label="Select one option" 
            options={options} 
            value="option1"
            onChange={() => {}}
          />
        </Form>
      );
      
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();
      
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);
      expect(radios[0]).toBeChecked();
    });
    
    it('shows validation errors for radio group', async () => {
      const validate = (value: string) => value === 'option1' ? 'Please select Option 2' : null;
      
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormRadioGroup 
            name="test" 
            label="Select one option" 
            options={options} 
            value="option1"
            onChange={() => {}}
            validate={validate}
          />
        </Form>
      );
      
      const radio = screen.getByLabelText('Option 1');
      fireEvent.blur(radio);
      
      const errorMessage = await screen.findByText('Please select Option 2');
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-invalid', 'true');
      expect(radiogroup).toHaveAttribute('aria-describedby', errorMessage.id);
    });
  });
  
  // FormSubmit tests
  describe('FormSubmit', () => {
    it('renders an accessible submit button', () => {
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormSubmit>Submit Form</FormSubmit>
        </Form>
      );
      
      const button = screen.getByRole('button', { name: 'Submit Form' });
      expect(button).toHaveAttribute('type', 'submit');
    });
    
    it('shows loading state with accessible text', () => {
      render(
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormSubmit isLoading loadingText="Processing...">Submit Form</FormSubmit>
        </Form>
      );
      
      const button = screen.getByRole('button', { name: 'Processing...' });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });
  
  // Form validation and submission tests
  describe('Form Validation and Submission', () => {
    it('submits the form when valid', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      
      render(
        <Form onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>
      );
      
      // Submit the form
      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });
      
      // Check that form was submitted
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
});