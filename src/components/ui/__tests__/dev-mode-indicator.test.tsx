/**
 * Dev Mode Indicator Tests
 */
import { render, screen, fireEvent } from '@testing-library/react';
import DevModeIndicator from '../dev-mode-indicator';
import { getDevModeConfig } from '@/lib/config/dev-mode';
import { getCurrentMockUser, getAvailableMockUsers } from '@/lib/mock/mock-user-store';

// Mock the next/navigation router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn(),
  }),
}));

// Mock the dev mode config
jest.mock('@/lib/config/dev-mode', () => ({
  getDevModeConfig: jest.fn(),
}));

// Mock the mock user store
jest.mock('@/lib/mock/mock-user-store', () => ({
  getCurrentMockUser: jest.fn(),
  getAvailableMockUsers: jest.fn(),
  setCurrentMockUser: jest.fn(),
}));

describe('DevModeIndicator', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    (getDevModeConfig as jest.Mock).mockReturnValue({
      useMockAuth: true,
      useMockApi: true,
      showDevModeIndicator: true,
      logMockCalls: true,
      simulateErrors: false,
      errorProbability: 0.1,
      mockDataSet: 'default',
    });
    
    (getCurrentMockUser as jest.Mock).mockReturnValue({
      id: 1001,
      login: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: 'https://example.com/avatar.png',
      role: 'developer',
      workPattern: 'regular',
      activityLevel: 'medium',
      collaborationStyle: 'team-player',
      responseTime: 'average',
      workHours: 'standard',
      specialties: ['testing'],
    });
    
    (getAvailableMockUsers as jest.Mock).mockReturnValue([
      {
        id: 1001,
        login: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://example.com/avatar.png',
        role: 'developer',
        workPattern: 'regular',
        activityLevel: 'medium',
        collaborationStyle: 'team-player',
        responseTime: 'average',
        workHours: 'standard',
        specialties: ['testing'],
        current: true,
      },
      {
        id: 1002,
        login: 'other-user',
        name: 'Other User',
        email: 'other@example.com',
        avatar_url: 'https://example.com/avatar2.png',
        role: 'manager',
        workPattern: 'irregular',
        activityLevel: 'high',
        collaborationStyle: 'mentor',
        responseTime: 'fast',
        workHours: 'late-night',
        specialties: ['management'],
        current: false,
      },
    ]);
  });

  it('renders the dev mode indicator button when mock mode is enabled', () => {
    render(<DevModeIndicator />);
    
    // The button should be visible
    expect(screen.getByTitle('Development Mode')).toBeInTheDocument();
  });

  it('does not render when mock mode is disabled', () => {
    (getDevModeConfig as jest.Mock).mockReturnValue({
      useMockAuth: false,
      useMockApi: false,
      showDevModeIndicator: true,
    });
    
    const { container } = render(<DevModeIndicator />);
    
    // The component should not render anything
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render when indicator is disabled', () => {
    (getDevModeConfig as jest.Mock).mockReturnValue({
      useMockAuth: true,
      useMockApi: true,
      showDevModeIndicator: false,
    });
    
    const { container } = render(<DevModeIndicator />);
    
    // The component should not render anything
    expect(container).toBeEmptyDOMElement();
  });

  it('opens the panel when the button is clicked', () => {
    render(<DevModeIndicator />);
    
    // Click the button
    fireEvent.click(screen.getByTitle('Development Mode'));
    
    // The panel should be visible
    expect(screen.getByText('Development Mode Active')).toBeInTheDocument();
  });

  it('shows the current mock user information', () => {
    render(<DevModeIndicator />);
    
    // Click the button to open the panel
    fireEvent.click(screen.getByTitle('Development Mode'));
    
    // The current user info should be visible
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@test-user', { exact: false })).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(<DevModeIndicator />);
    
    // Click the button to open the panel
    fireEvent.click(screen.getByTitle('Development Mode'));
    
    // Click the Users tab
    fireEvent.click(screen.getByText('Users'));
    
    // The Users tab content should be visible
    expect(screen.getByText('Available Mock Users')).toBeInTheDocument();
    
    // Click the API Logs tab
    fireEvent.click(screen.getByText('API Logs'));
    
    // The API Logs tab content should be visible
    expect(screen.getByText('Mock API Call Logs')).toBeInTheDocument();
    
    // Click the Debug tab
    fireEvent.click(screen.getByText('Debug'));
    
    // The Debug tab content should be visible
    expect(screen.getByText('Debug Information')).toBeInTheDocument();
    
    // Click the Info tab
    fireEvent.click(screen.getByText('Info'));
    
    // The Info tab content should be visible
    expect(screen.getByText('Mock Auth:')).toBeInTheDocument();
  });
});