/**
 * Team Dashboard Page Tests
 */

import { render, screen } from '@testing-library/react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import TeamDashboardPage from '../page';

// Mock dependencies
jest.mock('next-auth');
jest.mock('next/navigation');
jest.mock('@/lib/db/prisma');
jest.mock('@/components/analytics/TeamCollaborationMetrics', () => ({
  __esModule: true,
  default: () => <div data-testid="team-collaboration-metrics">Team Collaboration Metrics</div>,
}));

describe('TeamDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login if not authenticated', async () => {
    // Mock session to return null (not authenticated)
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    // Render the page
    await TeamDashboardPage();
    
    // Check if redirect was called with the correct path
    expect(redirect).toHaveBeenCalledWith('/auth/signin');
  });

  it('displays team collaboration metrics when repository is available', async () => {
    // Mock authenticated session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });
    
    // Mock repositories
    (prisma.repository.findMany as jest.Mock).mockResolvedValue([
      { id: 'repo-123', name: 'Test Repo' },
    ]);
    
    // Mock user settings
    (prisma.userSettings.findUnique as jest.Mock).mockResolvedValue({
      selectedRepositories: ['repo-123'],
    });
    
    // Create a container to render the component
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Render the page
    const result = await TeamDashboardPage();
    render(result, { container });
    
    // Check if the team collaboration metrics component is rendered
    expect(screen.getByText('Team Collaboration Analytics')).toBeInTheDocument();
  });

  it('displays no repositories message when no repositories are available', async () => {
    // Mock authenticated session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });
    
    // Mock empty repositories
    (prisma.repository.findMany as jest.Mock).mockResolvedValue([]);
    
    // Mock empty user settings
    (prisma.userSettings.findUnique as jest.Mock).mockResolvedValue({
      selectedRepositories: [],
    });
    
    // Create a container to render the component
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Render the page
    const result = await TeamDashboardPage();
    render(result, { container });
    
    // Check if the no repositories message is displayed
    expect(screen.getByText('No Repositories Available')).toBeInTheDocument();
  });
});