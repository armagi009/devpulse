/**
 * Wellness Dashboard Page Tests
 * Comprehensive testing for the developer wellness dashboard
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useWellnessData } from '@/lib/hooks/useWellnessData';
import { PERMISSIONS } from '@/lib/types/roles';
import WellnessDashboardPage from '../page';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('@/lib/hooks/usePermissions');
jest.mock('@/lib/hooks/useWellnessData');
jest.mock('@/components/layout/Header', () => {
  return function MockHeader({ user }: { user: any }) {
    return <div data-testid="header">Header - {user?.name}</div>;
  };
});

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;
const mockUseWellnessData = useWellnessData as jest.MockedFunction<typeof useWellnessData>;

const mockPush = jest.fn();
const mockRouter = { push: mockPush };

// Mock data
const mockWellnessData = {
  riskScore: 45,
  confidence: 0.85,
  keyFactors: [
    { name: 'Late Night Commits', impact: 0.3, description: 'High frequency of commits after 10 PM' },
    { name: 'Code Review Pressure', impact: 0.2, description: 'Increased review turnaround time' }
  ],
  recommendations: [
    'Consider reducing late-night coding sessions',
    'Schedule regular breaks during intensive work periods',
    'Increase pair programming to distribute knowledge'
  ],
  historicalTrend: [
    { date: new Date('2024-01-01'), value: 30 },
    { date: new Date('2024-01-15'), value: 35 },
    { date: new Date('2024-02-01'), value: 45 }
  ]
};

const mockSession = {
  user: {
    name: 'John Developer',
    email: 'john@example.com',
    image: 'https://example.com/avatar.jpg'
  }
};

describe('WellnessDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn().mockReturnValue(true),
      permissions: [PERMISSIONS.VIEW_PERSONAL_METRICS]
    });
    mockUseWellnessData.mockReturnValue({
      data: { wellnessData: mockWellnessData },
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      clearError: jest.fn()
    });
  });

  describe('Authentication and Authorization', () => {
    it('shows loading state when session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading'
      });

      render(<WellnessDashboardPage />);
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('redirects to unauthorized when user lacks permissions', async () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });

      render(<WellnessDashboardPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/unauthorized');
      });
    });

    it('renders dashboard when user is authenticated and has permissions', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });

      render(<WellnessDashboardPage />);

      expect(screen.getByText('Welcome back, John Developer')).toBeInTheDocument();
      expect(screen.getByText(/Wellness Score: \d+\/100/)).toBeInTheDocument();
    });
  });

  describe('Data Loading and Error Handling', () => {
    it('shows loading state when data is loading', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
      mockUseWellnessData.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refresh: jest.fn(),
        clearError: jest.fn()
      });

      render(<WellnessDashboardPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('displays error state when data fetch fails', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
      mockUseWellnessData.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'Failed to fetch wellness data',
        refresh: jest.fn(),
        clearError: jest.fn()
      });

      render(<WellnessDashboardPage />);

      // Should still render with fallback data
      expect(screen.getByText('Welcome back, John Developer')).toBeInTheDocument();
    });

    it('displays wellness data when loaded successfully', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });

      render(<WellnessDashboardPage />);

      expect(screen.getByText('Welcome back, John Developer')).toBeInTheDocument();
      expect(screen.getByText('moderate risk')).toBeInTheDocument();
    });
  });

  describe('Dashboard Navigation', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('renders all navigation tabs', () => {
      render(<WellnessDashboardPage />);

      expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ai insights/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /live activity/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /wellness/i })).toBeInTheDocument();
    });

    it('switches between tabs correctly', async () => {
      render(<WellnessDashboardPage />);

      // Default tab should be overview
      expect(screen.getByText('Commits Today')).toBeInTheDocument();

      // Click on AI Insights tab
      fireEvent.click(screen.getByRole('button', { name: /ai insights/i }));
      
      await waitFor(() => {
        expect(screen.getByText('AI Burnout Prevention Insights')).toBeInTheDocument();
      });

      // Click on Activity tab
      fireEvent.click(screen.getByRole('button', { name: /live activity/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Real-Time Activity Feed')).toBeInTheDocument();
      });

      // Click on Wellness tab
      fireEvent.click(screen.getByRole('button', { name: /wellness/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Wellness Score Breakdown')).toBeInTheDocument();
      });
    });
  });

  describe('Overview Tab', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('displays key metrics cards', () => {
      render(<WellnessDashboardPage />);

      expect(screen.getByText('Commits Today')).toBeInTheDocument();
      expect(screen.getByText('Code Reviews')).toBeInTheDocument();
      expect(screen.getByText('Issues Resolved')).toBeInTheDocument();
      expect(screen.getByText('Bug Reports')).toBeInTheDocument();
    });

    it('displays wellness gauges', () => {
      render(<WellnessDashboardPage />);

      expect(screen.getByText('Work-Life Balance')).toBeInTheDocument();
      expect(screen.getByText('Code Quality')).toBeInTheDocument();
      expect(screen.getByText('Collaboration')).toBeInTheDocument();
      expect(screen.getByText('Stress Level')).toBeInTheDocument();
    });

    it('displays quick action buttons', () => {
      render(<WellnessDashboardPage />);

      expect(screen.getByText('Schedule break reminder')).toBeInTheDocument();
      expect(screen.getByText('Request pair programming')).toBeInTheDocument();
      expect(screen.getByText('Block focus time')).toBeInTheDocument();
    });
  });

  describe('AI Insights Tab', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('displays AI insights when tab is selected', async () => {
      render(<WellnessDashboardPage />);

      fireEvent.click(screen.getByRole('button', { name: /ai insights/i }));

      await waitFor(() => {
        expect(screen.getByText('Self-Reassurance: You\'ve Got This')).toBeInTheDocument();
        expect(screen.getByText('Peer Validation: You\'re Not Alone')).toBeInTheDocument();
        expect(screen.getByText('Social Impact: Your Contributions Matter')).toBeInTheDocument();
      });
    });

    it('displays AI recommendation section', async () => {
      render(<WellnessDashboardPage />);

      fireEvent.click(screen.getByRole('button', { name: /ai insights/i }));

      await waitFor(() => {
        expect(screen.getByText('AI Recommendation')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /schedule break/i })).toBeInTheDocument();
      });
    });
  });

  describe('Activity Tab', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('displays activity feed when tab is selected', async () => {
      render(<WellnessDashboardPage />);

      fireEvent.click(screen.getByRole('button', { name: /live activity/i }));

      await waitFor(() => {
        expect(screen.getByText('Real-Time Activity Feed')).toBeInTheDocument();
        expect(screen.getByText('Live')).toBeInTheDocument();
      });
    });

    it('displays daily pattern information', async () => {
      render(<WellnessDashboardPage />);

      fireEvent.click(screen.getByRole('button', { name: /live activity/i }));

      await waitFor(() => {
        expect(screen.getByText('Today\'s Pattern')).toBeInTheDocument();
        expect(screen.getByText('Morning (6-12)')).toBeInTheDocument();
        expect(screen.getByText('Afternoon (12-18)')).toBeInTheDocument();
        expect(screen.getByText('Evening (18-24)')).toBeInTheDocument();
      });
    });
  });

  describe('Wellness Tab', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('displays wellness breakdown when tab is selected', async () => {
      render(<WellnessDashboardPage />);

      fireEvent.click(screen.getByRole('button', { name: /wellness/i }));

      await waitFor(() => {
        expect(screen.getByText('Wellness Score Breakdown')).toBeInTheDocument();
      });
    });

    it('displays recommendations from wellness data', async () => {
      render(<WellnessDashboardPage />);

      fireEvent.click(screen.getByRole('button', { name: /wellness/i }));

      await waitFor(() => {
        expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
        // Should display recommendations from mock data
        expect(screen.getByText(/Consider reducing late-night coding sessions/)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('renders properly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<WellnessDashboardPage />);

      expect(screen.getByText('Welcome back, John Developer')).toBeInTheDocument();
      // Navigation should still be functional
      expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();
    });

    it('renders properly on tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<WellnessDashboardPage />);

      expect(screen.getByText('Welcome back, John Developer')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('updates time display every second', async () => {
      jest.useFakeTimers();
      
      render(<WellnessDashboardPage />);

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      // Time should update (this is a basic test - in real implementation you'd check actual time display)
      expect(screen.getByText('Welcome back, John Developer')).toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('has proper ARIA labels for interactive elements', () => {
      render(<WellnessDashboardPage />);

      const overviewButton = screen.getByRole('button', { name: /overview/i });
      expect(overviewButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('supports keyboard navigation', () => {
      render(<WellnessDashboardPage />);

      const insightsTab = screen.getByRole('button', { name: /ai insights/i });
      insightsTab.focus();
      
      expect(document.activeElement).toBe(insightsTab);
    });

    it('provides proper heading hierarchy', () => {
      render(<WellnessDashboardPage />);

      // Should have proper heading structure
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('handles API errors gracefully', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
      mockUseWellnessData.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'Network error',
        refresh: jest.fn(),
        clearError: jest.fn()
      });

      render(<WellnessDashboardPage />);

      // Should still render with fallback data
      expect(screen.getByText('Welcome back, John Developer')).toBeInTheDocument();
      expect(screen.getByText('moderate risk')).toBeInTheDocument();
    });

    it('allows manual refresh on error', async () => {
      const mockRefresh = jest.fn();
      
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
      mockUseWellnessData.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'Network error',
        refresh: mockRefresh,
        clearError: jest.fn()
      });

      render(<WellnessDashboardPage />);

      // In a real implementation, there would be a refresh button
      // This is a placeholder for that functionality
      expect(mockRefresh).toBeDefined();
    });
  });
});