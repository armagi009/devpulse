# Form Accessibility Guidelines

This document provides guidelines for creating accessible forms in the DevPulse application.

## Key Accessibility Features

Our form components implement the following accessibility features:

1. **Proper Labeling**: All form controls have associated labels with proper `for` attributes.
2. **Error Identification**: Form validation errors are clearly identified and associated with their respective inputs.
3. **Descriptive Instructions**: Helper text and error messages are properly associated with inputs using `aria-describedby`.
4. **Keyboard Navigation**: All form controls are keyboard accessible and follow a logical tab order.
5. **Screen Reader Support**: ARIA attributes are used to enhance screen reader announcements.
6. **Visual Indicators**: Required fields are clearly marked with visual indicators.
7. **Focus Management**: Error states properly manage focus to help users correct issues.

## Using Accessible Form Components

### Basic Form Structure

```tsx
import { 
  Form, 
  FormGroup, 
  FormInput, 
  FormLabel, 
  FormSubmit 
} from '@/components/ui/form';

export function MyForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormInput 
        name="email" 
        label="Email Address" 
        type="email" 
        required 
        helperText="We'll never share your email with anyone else."
        validate={(value) => {
          if (!value) return 'Email is required';
          if (!value.includes('@')) return 'Please enter a valid email address';
          return null;
        }}
      />
      
      <FormSubmit>Submit</FormSubmit>
    </Form>
  );
}
```

### Form Validation

Our form components support both client-side validation and server-side validation:

1. **Client-side validation**: Use the `validate` prop to provide a validation function.
2. **Server-side validation**: Handle server validation errors by updating the form context.

```tsx
// Client-side validation
<FormInput 
  name="password" 
  label="Password" 
  type="password" 
  required 
  validate={(value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
  }}
/>

// Server-side validation
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // Submit form data
    const response = await submitForm(formData);
    
    // Handle success
  } catch (error) {
    // If server returns validation errors
    if (error.validationErrors) {
      // Update form errors
      Object.entries(error.validationErrors).forEach(([field, message]) => {
        setFieldError(field, message);
      });
    }
  }
};
```

### Form Groups and Layout

Use `FormGroup` to group related form controls:

```tsx
<Form onSubmit={handleSubmit}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormGroup>
      <FormLabel htmlFor="firstName">First Name</FormLabel>
      <FormInput id="firstName" name="firstName" />
    </FormGroup>
    
    <FormGroup>
      <FormLabel htmlFor="lastName">Last Name</FormLabel>
      <FormInput id="lastName" name="lastName" />
    </FormGroup>
  </div>
  
  <FormSubmit>Submit</FormSubmit>
</Form>
```

### Checkbox and Radio Groups

For checkbox and radio groups, use the appropriate components:

```tsx
// Checkbox
<FormCheckbox 
  name="terms" 
  label="I agree to the terms and conditions" 
  required 
/>

// Radio Group
<FormRadioGroup 
  name="role" 
  label="Select your role" 
  options={[
    { value: 'developer', label: 'Developer' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'admin', label: 'Administrator' }
  ]} 
  value={selectedRole}
  onChange={setSelectedRole}
/>
```

### Select Dropdowns

For select dropdowns, use the `FormSelect` component:

```tsx
<FormSelect 
  name="country" 
  label="Country" 
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' }
  ]} 
  required 
/>
```

### Textarea

For multi-line text input, use the `FormTextarea` component:

```tsx
<FormTextarea 
  name="comments" 
  label="Comments" 
  rows={4} 
  helperText="Please provide any additional comments or feedback."
/>
```

## Accessibility Best Practices

1. **Use Clear Labels**: Avoid placeholder-only inputs. Always use explicit labels.
2. **Group Related Fields**: Use `fieldset` and `legend` for groups of related inputs.
3. **Provide Helpful Error Messages**: Error messages should be clear and suggest how to fix the issue.
4. **Maintain Keyboard Focus**: After form submission with errors, focus should move to the first error.
5. **Use Appropriate Input Types**: Use the correct input type (email, tel, number, etc.) for better mobile experience.
6. **Test with Screen Readers**: Regularly test forms with screen readers to ensure they announce labels, instructions, and errors properly.
7. **Provide Feedback**: Always provide clear feedback after form submission, whether successful or not.

## WCAG Compliance

Our form components are designed to meet WCAG 2.1 AA standards, specifically:

- **1.3.1 Info and Relationships**: Form elements have proper labels and relationships.
- **2.4.6 Headings and Labels**: Labels are descriptive and clear.
- **3.3.1 Error Identification**: Errors are clearly identified.
- **3.3.2 Labels or Instructions**: All form controls have clear labels and instructions.
- **3.3.3 Error Suggestion**: Error messages suggest how to fix the problem.
- **3.3.4 Error Prevention**: Important forms have validation and confirmation steps.
- **4.1.3 Status Messages**: Form status changes are announced to screen readers.

## Testing Form Accessibility

Use the following methods to test form accessibility:

1. **Keyboard Navigation**: Test that all form controls can be accessed and operated using only the keyboard.
2. **Screen Reader Testing**: Use screen readers (NVDA, VoiceOver, JAWS) to verify that all form elements are properly announced.
3. **Automated Testing**: Run automated accessibility tests using tools like Axe or Lighthouse.
4. **Color Contrast**: Ensure that form controls and error messages have sufficient color contrast.
5. **Zoom Testing**: Test forms at 200% zoom to ensure they remain usable.