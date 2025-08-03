import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SystemSettingsForm from '../SystemSettingsForm';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('SystemSettingsForm Component', () => {
  const mockSettings = [
    {
      id: '1',
      key: 'general_appName',
      value: 'DevPulse',
      description: 'Application name',
      isEncrypted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      key: 'general_enableAnalytics',
      value: 'true',
      description: 'Enable analytics tracking',
      isEncrypted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      key: 'api_maxRequestsPerMinute',
      value: '60',
      description: 'Maximum API requests per minute',
      isEncrypted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      key: 'security_apiKey',
      value: 'secret-key',
      description: 'API security key',
      isEncrypted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('renders all settings grouped by category', () => {
    render(<SystemSettingsForm settings={mockSettings} />);
    
    // Check for category headings
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('Api Settings')).toBeInTheDocument();
    expect(screen.getByText('Security Settings')).toBeInTheDocument();
    
    // Check for setting labels
    expect(screen.getByText('App Name')).toBeInTheDocument();
    expect(screen.getByText('Enable Analytics')).toBeInTheDocument();
    expect(screen.getByText('Max Requests Per Minute')).toBeInTheDocument();
    expect(screen.getByText('Api Key')).toBeInTheDocument();
  });

  it('renders different input types based on value type', () => {
    render(<SystemSettingsForm settings={mockSettings} />);
    
    // Text input
    const textInput = screen.getByLabelText('App Name');
    expect(textInput).toHaveAttribute('type', 'text');
    expect(textInput).toHaveValue('DevPulse');
    
    // Checkbox for boolean
    const checkbox = screen.getByLabelText('Enable Analytics');
    expect(checkbox).toHaveAttribute('type', 'checkbox');
    expect(checkbox).toBeChecked();
    
    // Number input
    const numberInput = screen.getByLabelText('Max Requests Per Minute');
    expect(numberInput).toHaveAttribute('type', 'number');
    expect(numberInput).toHaveValue(60);
    
    // Password input for encrypted values
    const passwordInput = screen.getByLabelText('Api Key');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toBeDisabled();
  });

  it('updates form values when inputs change', () => {
    render(<SystemSettingsForm settings={mockSettings} />);
    
    // Change text input
    const textInput = screen.getByLabelText('App Name');
    fireEvent.change(textInput, { target: { value: 'New App Name' } });
    expect(textInput).toHaveValue('New App Name');
    
    // Toggle checkbox
    const checkbox = screen.getByLabelText('Enable Analytics');
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    
    // Change number input
    const numberInput = screen.getByLabelText('Max Requests Per Minute');
    fireEvent.change(numberInput, { target: { value: '100' } });
    expect(numberInput).toHaveValue(100);
  });

  it('submits form with updated values', async () => {
    render(<SystemSettingsForm settings={mockSettings} />);
    
    // Change some values
    fireEvent.change(screen.getByLabelText('App Name'), { target: { value: 'New App Name' } });
    fireEvent.click(screen.getByLabelText('Enable Analytics')); // Toggle to false
    fireEvent.change(screen.getByLabelText('Max Requests Per Minute'), { target: { value: '100' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Settings'));
    
    // Check loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    // Verify fetch was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            'general_appName': 'New App Name',
            'general_enableAnalytics': 'false',
            'api_maxRequestsPerMinute': '100',
            'security_apiKey': 'secret-key',
          }
        }),
      });
    });
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Settings updated successfully')).toBeInTheDocument();
    });
  });

  it('displays error message when form submission fails', async () => {
    // Mock fetch to return an error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to update settings' }),
    });
    
    render(<SystemSettingsForm settings={mockSettings} />);
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Settings'));
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Failed to update settings')).toBeInTheDocument();
    });
  });

  it('disables encrypted fields', () => {
    render(<SystemSettingsForm settings={mockSettings} />);
    
    // Check that encrypted field is disabled
    const encryptedField = screen.getByLabelText('Api Key');
    expect(encryptedField).toBeDisabled();
  });

  it('displays field descriptions when provided', () => {
    render(<SystemSettingsForm settings={mockSettings} />);
    
    // Check for field descriptions
    expect(screen.getByText('Application name')).toBeInTheDocument();
    expect(screen.getByText('Enable analytics tracking')).toBeInTheDocument();
    expect(screen.getByText('Maximum API requests per minute')).toBeInTheDocument();
    expect(screen.getByText('API security key')).toBeInTheDocument();
  });
});