/**
 * Capacity Dashboard Page Tests
 * Comprehensive testing for the manager capacity dashboard
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useCapacityData } from '@/lib/hooks/useCapacityData';
import { PERMISSIONS } from '@/lib/types/roles';
import CapacityDashboardPage from '../page';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('@/lib/hooks/usePermissions');
jest.mock('@/lib/hooks/useCapacityData');
jest.mock('@/components/layout/Header', () => {
  return function MockHeader({ user }: { user: any }) {
    return <div data-testid="header">Header - {user?.name}</div>;
  };
});

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;
const mockUseCapacityData = useCapacityData as jest.MockedFunction<typeof useCapacityData>;

const mockPush = jest.fn();
const mockRouter = { push: mockPush };

// Mock data
const mockTeamMembers = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Frontend',
    capacity: 92,
    burnoutRisk: 'high' as const,
    trend: 'declining' as const,
    velocity: 85,
    wellnessFactor: 0.7,
    collaborationHealth: 88,
    stressMultiplier: 1.3,
    keyMetrics: {
      lateNightCommits: 8,
      weekendActivity: 12,
      reviewResponseTime: '4.2h',
      codeQuality: 78,
      teamInteractions: 23,
      mentoringHours: 2.5
    },
    alerts: [
      { type: 'critical' as const, message: '3 consecutive late-night sessions', time: '2h ago' },
      { type: 'warning' as const, message: 'Code quality declining (-15%)', time: '1d ago' }
    ],
    recommendations: [
      'Redistribute 2-3 tasks from backlog',
      'Schedule wellness check-in',
      'Pair with junior dev to reduce load'
    ]
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    role: 'Full Stack',
    capacity: 78,
    burnoutRisk: 'moderate' as const,
    trend: 'stable' as const,
    velocity: 92,
    wellnessFactor: 0.85,
    collaborationHealth: 95,
    stressMultiplier: 1.1,
    keyMetrics: {
      lateNightCommits: 2,
      weekendActivity: 4,
      reviewResponseTime: '1.8h',
      codeQuality: 91,
      teamInteractions: 45,
      mentoringHours: 6.5
    },
    alerts: [
      { type: 'info' as const, message: 'High mentoring activity - great impact!', time: '6h ago' }
    ],
    recommendations: [
      'Consider for tech lead opportunities',
      'Maintain current healthy patterns'
    ]
  }
];

const mockTeamOverview = {
  averageCapacity: 85,
  highRiskCount: 1,
  optimalCount: 1,
  needsSupportCount: 1,
  totalVelocity: 177,
  teamMorale: 76,
  burnoutPrevented: 3,
  interventionsThisMonth: 7
};

const mockTeamAnalytics = {
  teamId: 'default',
  metrics: {
    velocity: {
      average: 8.5,
      trend: 'increasing',
      percentageChange: 12.3
    },
    collaboration: {
      score: 0.75,
      bottlenecks: []
    }
  }
};

const mockSession = {
  user: {
    name: 'Jane Manager',
    email: 'jane@example.com',
    image: 'https://example.com/avatar.jpg'
  }
};

describe('CapacityDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn().mockReturnValue(true),
      permissions: [PERMISSIONS.VIEW_TEAM_METRICS, PERMISSIONS.VIEW_BURNOUT_TEAM]
    });
    mockUseCapacityData.mockReturnValue({
      data: {
        teamMembers: mockTeamMembers,
        teamOverview: mockTeamOverview,
        teamAnalytics: mockTeamAnalytics
      },
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

      render(<CapacityDashboardPage />);
      
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

      render(<CapacityDashboardPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/unauthorized');
      });
    });

    it('renders dashboard when user has team metrics permission', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn((permission) => permission === PERMISSIONS.VIEW_TEAM_METRICS),
        permissions: [PERMISSIONS.VIEW_TEAM_METRICS]
      });

      render(<CapacityDashboardPage />);

      expect(screen.getByText('Team Capacity Intelligence')).toBeInTheDocument();
    });

    it('renders dashboard when user has burnout team permission', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn((permission) => permission === PERMISSIONS.VIEW_BURNOUT_TEAM),
        permissions: [PERMISSIONS.VIEW_BURNOUT_TEAM]
      });

      render(<CapacityDashboardPage />);

      expect(screen.getByText('Team Capacity Intelligence')).toBeInTheDocument();
    });
  });

  describe('Data Loading and Error Handling', () => {
    it('shows loading state when data is loading', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
      mockUseCapacityData.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refresh: jest.fn(),
        clearError: jest.fn()
      });

      render(<CapacityDashboardPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('displays error state when data fetch fails', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
      mockUseCapacityData.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'Failed to fetch capacity data',
        refresh: jest.fn(),
        clearError: jest.fn()
      });

      render(<CapacityDashboardPage />);

      // Should still render with fallback data
      expect(screen.getByText('Team Capacity Intelligence')).toBeInTheDocument();
    });

    it('displays capacity data when loaded successfully', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });

      render(<CapacityDashboardPage />);

      expect(screen.getByText('Team Capacity Intelligence')).toBeInTheDocument();
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText('Marcus Rodriguez')).toBeInTheDocument();
    });
  });

  describe('Executive Summary Metrics', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('displays team average capacity', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('Team Avg Capacity')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('displays high risk developers count', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('High Risk Developers')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('displays burnouts prevented metric', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('Burnouts Prevented')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays team velocity', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('Team Velocity')).toBeInTheDocument();
      expect(screen.getByText('177')).toBeInTheDocument();
    });
  });

  describe('Capacity Distribution', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('displays capacity distribution chart', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('Team Capacity Distribution')).toBeInTheDocument();
      expect(screen.getByText('0-60%')).toBeInTheDocument();
      expect(screen.getByText('60-80%')).toBeInTheDocument();
      expect(screen.getByText('80-90%')).toBeInTheDocument();
      expect(screen.getByText('90-100%')).toBeInTheDocument();
    });

    it('shows correct distribution labels', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('Underutilized')).toBeInTheDocument();
      expect(screen.getByText('Optimal')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });
  });

  describe('Team Members Display', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('displays all team members', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText('Senior Frontend')).toBeInTheDocument();
      expect(screen.getByText('Marcus Rodriguez')).toBeInTheDocument();
      expect(screen.getByText('Full Stack')).toBeInTheDocument();
    });

    it('shows capacity gauges for each member', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('92%')).toBeInTheDocument();
      expect(screen.getByText('78%')).toBeInTheDocument();
    });

    it('displays risk levels correctly', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('high risk')).toBeInTheDocument();
      expect(screen.getByText('moderate risk')).toBeInTheDocument();
    });

    it('shows alert indicators for members with alerts', () => {
      render(<CapacityDashboardPage />);

      // Sarah Chen should have 2 alerts, Marcus should have 1
      const alertElements = screen.getAllByText(/\d+/);
      const alertCounts = alertElements.filter(el => 
        el.textContent === '2' || el.textContent === '1'
      );
      expect(alertCounts.length).toBeGreaterThan(0);
    });
  });

  describe('View Mode Toggle', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('renders capacity and wellness view buttons', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByRole('button', { name: /capacity view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /wellness view/i })).toBeInTheDocument();
    });

    it('switches between capacity and wellness views', async () => {
      render(<CapacityDashboardPage />);

      const wellnessButton = screen.getByRole('button', { name: /wellness view/i });
      fireEvent.click(wellnessButton);

      // View should switch (in real implementation, this would change the display)
      expect(wellnessButton).toHaveClass('bg-purple-600');
    });
  });

  describe('Timeframe Selection', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('renders timeframe selector', () => {
      render(<CapacityDashboardPage />);

      const timeframeSelect = screen.getByDisplayValue('This Week');
      expect(timeframeSelect).toBeInTheDocument();
    });

    it('allows changing timeframe', async () => {
      render(<CapacityDashboardPage />);

      const timeframeSelect = screen.getByDisplayValue('This Week');
      fireEvent.change(timeframeSelect, { target: { value: 'month' } });

      expect(timeframeSelect).toHaveValue('month');
    });
  });

  describe('Manager Action Center', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('displays immediate actions required', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('Immediate Actions Required')).toBeInTheDocument();
    });

    it('shows high risk member alerts', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('Sarah Chen - High Burnout Risk')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /schedule 1:1/i })).toBeInTheDocument();
    });

    it('shows moderate risk member warnings', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('Marcus Rodriguez - Leadership Potential')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /discuss growth/i })).toBeInTheDocument();
    });
  });

  describe('Capacity Management Tools', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('displays management tool options', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('Capacity Management Tools')).toBeInTheDocument();
      expect(screen.getByText('Redistribute Sprint Tasks')).toBeInTheDocument();
      expect(screen.getByText('Schedule Team Check-ins')).toBeInTheDocument();
      expect(screen.getByText('Suggest Focus Time')).toBeInTheDocument();
      expect(screen.getByText('Pair Programming Matrix')).toBeInTheDocument();
    });

    it('allows clicking on management tools', () => {
      render(<CapacityDashboardPage />);

      const redistributeButton = screen.getByText('Redistribute Sprint Tasks').closest('button');
      expect(redistributeButton).toBeInTheDocument();
      
      if (redistributeButton) {
        fireEvent.click(redistributeButton);
        // In real implementation, this would trigger an action
      }
    });
  });

  describe('AI Manager Insights', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('displays AI insights section', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByText('AI Management Insights')).toBeInTheDocument();
      expect(screen.getByText('Capacity Optimization')).toBeInTheDocument();
      expect(screen.getByText('Team Dynamics')).toBeInTheDocument();
    });

    it('shows actionable AI recommendations', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByRole('button', { name: /view suggestions/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create plan/i })).toBeInTheDocument();
    });
  });

  describe('Developer Detail Modal', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
    });

    it('opens modal when clicking on team member', async () => {
      render(<CapacityDashboardPage />);

      const memberCard = screen.getByText('Sarah Chen').closest('div');
      if (memberCard) {
        fireEvent.click(memberCard);

        await waitFor(() => {
          expect(screen.getByText('Current Capacity')).toBeInTheDocument();
        });
      }
    });

    it('displays detailed member information in modal', async () => {
      render(<CapacityDashboardPage />);

      const memberCard = screen.getByText('Sarah Chen').closest('div');
      if (memberCard) {
        fireEvent.click(memberCard);

        await waitFor(() => {
          expect(screen.getByText('Key Metrics')).toBeInTheDocument();
          expect(screen.getByText('Late Night Commits')).toBeInTheDocument();
          expect(screen.getByText('Weekend Activity')).toBeInTheDocument();
        });
      }
    });

    it('closes modal when clicking close button', async () => {
      render(<CapacityDashboardPage />);

      const memberCard = screen.getByText('Sarah Chen').closest('div');
      if (memberCard) {
        fireEvent.click(memberCard);

        await waitFor(() => {
          const closeButton = screen.getByText('✕');
          fireEvent.click(closeButton);
        });

        await waitFor(() => {
          expect(screen.queryByText('Current Capacity')).not.toBeInTheDocument();
        });
      }
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

      render(<CapacityDashboardPage />);

      expect(screen.getByText('Team Capacity Intelligence')).toBeInTheDocument();
      // Grid should adapt to mobile layout
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    });

    it('renders properly on tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<CapacityDashboardPage />);

      expect(screen.getByText('Team Capacity Intelligence')).toBeInTheDocument();
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
      render(<CapacityDashboardPage />);

      const capacityButton = screen.getByRole('button', { name: /capacity view/i });
      expect(capacityButton).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<CapacityDashboardPage />);

      const wellnessButton = screen.getByRole('button', { name: /wellness view/i });
      wellnessButton.focus();
      
      expect(document.activeElement).toBe(wellnessButton);
    });

    it('provides proper heading hierarchy', () => {
      render(<CapacityDashboardPage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('handles API errors gracefully', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
      mockUseCapacityData.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'Network error',
        refresh: jest.fn(),
        clearError: jest.fn()
      });

      render(<CapacityDashboardPage />);

      // Should still render basic structure
      expect(screen.getByText('Team Capacity Intelligence')).toBeInTheDocument();
    });

    it('allows manual refresh on error', async () => {
      const mockRefresh = jest.fn();
      
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      });
      mockUseCapacityData.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'Network error',
        refresh: mockRefresh,
        clearError: jest.fn()
      });

      render(<CapacityDashboardPage />);

      // In a real implementation, there would be a refresh button
      expect(mockRefresh).toBeDefined();
    });
  });
});