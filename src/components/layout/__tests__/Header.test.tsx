/**
 * Header Component Tests
 * Testing role-based navigation and wellness/capacity links
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/types/roles';
import Header from '../Header';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('@/lib/hooks/usePermissions');
jest.mock('@/components/ui/notification-center', () => ({
  NotificationCenterButton: ({ className }: { className?: string }) => (
    <button className={className} data-testid="notification-center">
      Notifications
    </button>
  )
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  image: 'https://example.com/avatar.jpg'
};

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard');
  });

  describe('Basic Rendering', () => {
    it('renders DevPulse logo', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });

      render(<Header user={mockUser} />);

      expect(screen.getByText('DevPulse')).toBeInTheDocument();
    });

    it('renders mobile menu button', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });

      render(<Header user={mockUser} />);

      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('renders user avatar and name when user is provided', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });

      render(<Header user={mockUser} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByAltText('John Doe')).toBeInTheDocument();
    });

    it('renders sign in button when no user is provided', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });

      render(<Header user={null} />);

      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Role-Based Navigation', () => {
    it('shows basic navigation for users without special permissions', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });

      render(<Header user={mockUser} />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /analytics/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /wellness/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /capacity intelligence/i })).not.toBeInTheDocument();
    });

    it('shows wellness link for users with VIEW_PERSONAL_METRICS permission', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn((permission) => permission === PERMISSIONS.VIEW_PERSONAL_METRICS),
        permissions: [PERMISSIONS.VIEW_PERSONAL_METRICS]
      });

      render(<Header user={mockUser} />);

      expect(screen.getByRole('link', { name: /wellness/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /capacity intelligence/i })).not.toBeInTheDocument();
    });

    it('shows capacity intelligence link for users with VIEW_TEAM_METRICS permission', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn((permission) => permission === PERMISSIONS.VIEW_TEAM_METRICS),
        permissions: [PERMISSIONS.VIEW_TEAM_METRICS]
      });

      render(<Header user={mockUser} />);

      expect(screen.getByRole('link', { name: /capacity intelligence/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /wellness/i })).not.toBeInTheDocument();
    });

    it('shows capacity intelligence link for users with VIEW_BURNOUT_TEAM permission', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn((permission) => permission === PERMISSIONS.VIEW_BURNOUT_TEAM),
        permissions: [PERMISSIONS.VIEW_BURNOUT_TEAM]
      });

      render(<Header user={mockUser} />);

      expect(screen.getByRole('link', { name: /capacity intelligence/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /wellness/i })).not.toBeInTheDocument();
    });

    it('shows both wellness and capacity links for users with both permissions', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn((permission) => 
          permission === PERMISSIONS.VIEW_PERSONAL_METRICS || 
          permission === PERMISSIONS.VIEW_TEAM_METRICS
        ),
        permissions: [PERMISSIONS.VIEW_PERSONAL_METRICS, PERMISSIONS.VIEW_TEAM_METRICS]
      });

      render(<Header user={mockUser} />);

      expect(screen.getByRole('link', { name: /wellness/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /capacity intelligence/i })).toBeInTheDocument();
    });
  });

  describe('Navigation Active States', () => {
    beforeEach(() => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
        permissions: [PERMISSIONS.VIEW_PERSONAL_METRICS, PERMISSIONS.VIEW_TEAM_METRICS]
      });
    });

    it('highlights dashboard link when on dashboard page', () => {
      mockUsePathname.mockReturnValue('/dashboard');

      render(<Header user={mockUser} />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('bg-primary', 'text-white');
    });

    it('highlights analytics link when on analytics page', () => {
      mockUsePathname.mockReturnValue('/analytics');

      render(<Header user={mockUser} />);

      const analyticsLink = screen.getByRole('link', { name: /analytics/i });
      expect(analyticsLink).toHaveClass('bg-primary', 'text-white');
    });

    it('highlights wellness link when on wellness page', () => {
      mockUsePathname.mockReturnValue('/dashboard/wellness');

      render(<Header user={mockUser} />);

      const wellnessLink = screen.getByRole('link', { name: /wellness/i });
      expect(wellnessLink).toHaveClass('bg-primary', 'text-white');
    });

    it('highlights capacity link when on capacity page', () => {
      mockUsePathname.mockReturnValue('/dashboard/capacity');

      render(<Header user={mockUser} />);

      const capacityLink = screen.getByRole('link', { name: /capacity intelligence/i });
      expect(capacityLink).toHaveClass('bg-primary', 'text-white');
    });

    it('does not highlight dashboard link when on sub-pages', () => {
      mockUsePathname.mockReturnValue('/dashboard/wellness');

      render(<Header user={mockUser} />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).not.toHaveClass('bg-primary', 'text-white');
    });
  });

  describe('User Menu Functionality', () => {
    beforeEach(() => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });
    });

    it('opens user menu when avatar is clicked', async () => {
      render(<Header user={mockUser} />);

      const avatarButton = screen.getByRole('button', { name: /john doe/i });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('Your Profile')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Sign out')).toBeInTheDocument();
      });
    });

    it('closes user menu when clicking outside', async () => {
      render(<Header user={mockUser} />);

      const avatarButton = screen.getByRole('button', { name: /john doe/i });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('Your Profile')).toBeInTheDocument();
      });

      // Click outside the menu
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Your Profile')).not.toBeInTheDocument();
      });
    });

    it('displays user information in dropdown', async () => {
      render(<Header user={mockUser} />);

      const avatarButton = screen.getByRole('button', { name: /john doe/i });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Menu', () => {
    beforeEach(() => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });
    });

    it('toggles mobile menu when button is clicked', () => {
      const setSidebarOpen = jest.fn();
      render(<Header user={mockUser} sidebarOpen={false} setSidebarOpen={setSidebarOpen} />);

      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      fireEvent.click(menuButton);

      expect(setSidebarOpen).toHaveBeenCalledWith(true);
    });

    it('shows close icon when sidebar is open', () => {
      render(<Header user={mockUser} sidebarOpen={true} />);

      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      const closeIcon = menuButton.querySelector('svg path[d*="M6 18L18 6M6 6l12 12"]');
      expect(closeIcon).toBeInTheDocument();
    });

    it('shows hamburger icon when sidebar is closed', () => {
      render(<Header user={mockUser} sidebarOpen={false} />);

      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      const hamburgerIcon = menuButton.querySelector('svg path[d*="M4 6h16M4 12h16M4 18h16"]');
      expect(hamburgerIcon).toBeInTheDocument();
    });
  });

  describe('Notification Center', () => {
    it('renders notification center button when user is authenticated', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });

      render(<Header user={mockUser} />);

      expect(screen.getByTestId('notification-center')).toBeInTheDocument();
    });

    it('does not render notification center when user is not authenticated', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });

      render(<Header user={null} />);

      expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
    });
  });

  describe('Landing Page Behavior', () => {
    it('hides navigation when on landing page', () => {
      mockUsePathname.mockReturnValue('/');
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
        permissions: [PERMISSIONS.VIEW_PERSONAL_METRICS]
      });

      render(<Header user={mockUser} />);

      expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /wellness/i })).not.toBeInTheDocument();
    });

    it('shows navigation when not on landing page', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
        permissions: [PERMISSIONS.VIEW_PERSONAL_METRICS]
      });

      render(<Header user={mockUser} />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /wellness/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
        permissions: [PERMISSIONS.VIEW_PERSONAL_METRICS, PERMISSIONS.VIEW_TEAM_METRICS]
      });
    });

    it('has proper ARIA labels for mobile menu button', () => {
      render(<Header user={mockUser} sidebarOpen={false} />);

      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates ARIA expanded state when sidebar is open', () => {
      render(<Header user={mockUser} sidebarOpen={true} />);

      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('has proper alt text for user avatar', () => {
      render(<Header user={mockUser} />);

      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
    });

    it('provides fallback when user has no image', () => {
      const userWithoutImage = { ...mockUser, image: null };
      render(<Header user={userWithoutImage} />);

      expect(screen.getByText('J')).toBeInTheDocument(); // First letter of name
    });
  });

  describe('Link Behavior', () => {
    beforeEach(() => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
        permissions: [PERMISSIONS.VIEW_PERSONAL_METRICS, PERMISSIONS.VIEW_TEAM_METRICS]
      });
    });

    it('has correct href attributes for navigation links', () => {
      render(<Header user={mockUser} />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
      expect(screen.getByRole('link', { name: /analytics/i })).toHaveAttribute('href', '/analytics');
      expect(screen.getByRole('link', { name: /wellness/i })).toHaveAttribute('href', '/dashboard/wellness');
      expect(screen.getByRole('link', { name: /capacity intelligence/i })).toHaveAttribute('href', '/dashboard/capacity');
    });

    it('has correct href attributes for user menu links', async () => {
      render(<Header user={mockUser} />);

      const avatarButton = screen.getByRole('button', { name: /john doe/i });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /your profile/i })).toHaveAttribute('href', '/profile');
        expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
        expect(screen.getByRole('link', { name: /sign out/i })).toHaveAttribute('href', '/api/auth/signout');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined user gracefully', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });

      render(<Header user={undefined} />);

      expect(screen.getByText('DevPulse')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });

    it('handles user with missing name', () => {
      const userWithoutName = { ...mockUser, name: null };
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        permissions: []
      });

      render(<Header user={userWithoutName} />);

      expect(screen.getByText('U')).toBeInTheDocument(); // Fallback initial
    });

    it('handles permission check errors gracefully', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: jest.fn(() => { throw new Error('Permission check failed'); }),
        permissions: []
      });

      render(<Header user={mockUser} />);

      // Should still render basic navigation
      expect(screen.getByText('DevPulse')).toBeInTheDocument();
    });
  });
});