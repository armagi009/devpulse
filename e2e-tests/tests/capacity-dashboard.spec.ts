/**
 * Capacity Dashboard E2E Tests
 * End-to-end testing for the manager capacity dashboard
 */

import { test, expect } from '@playwright/test';

test.describe('Capacity Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-manager-123',
            name: 'Test Manager',
            email: 'manager@example.com',
            image: 'https://example.com/manager-avatar.jpg'
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    // Mock permissions API for manager
    await page.route('**/api/auth/permissions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          permissions: ['VIEW_TEAM_METRICS', 'VIEW_BURNOUT_TEAM']
        })
      });
    });

    // Mock team analytics API
    await page.route('**/api/analytics/team**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            teamId: 'team-123',
            metrics: {
              velocity: {
                average: 8.5,
                trend: 'increasing',
                percentageChange: 12.3
              },
              collaboration: {
                score: 0.75,
                network: {
                  nodes: [
                    { id: '1', name: 'Sarah Chen' },
                    { id: '2', name: 'Marcus Rodriguez' },
                    { id: '3', name: 'Priya Patel' },
                    { id: '4', name: 'Alex Kim' }
                  ]
                },
                bottlenecks: [
                  { memberId: '1', reason: 'High review load' }
                ]
              }
            }
          }
        })
      });
    });

    // Mock burnout analytics API
    await page.route('**/api/analytics/burnout**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            userId: 'test-manager-123',
            repositoryId: 'default',
            riskScore: 75,
            confidence: 0.85,
            keyFactors: [
              {
                name: 'Late Night Commits',
                impact: 0.4,
                description: 'High frequency of commits after 10 PM'
              }
            ],
            recommendations: [
              'Redistribute 2-3 tasks from backlog',
              'Schedule wellness check-in',
              'Pair with junior dev to reduce load'
            ],
            historicalTrend: [
              { date: '2024-01-01T00:00:00.000Z', value: 65 },
              { date: '2024-02-01T00:00:00.000Z', value: 75 }
            ],
            lastUpdated: '2024-02-01T00:00:00.000Z'
          }
        })
      });
    });
  });

  test('should load capacity dashboard successfully', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Wait for the page to load
    await expect(page.locator('text=Team Capacity Intelligence')).toBeVisible();
    
    // Check that team metrics are displayed
    await expect(page.locator('text=Team Avg Capacity')).toBeVisible();
    await expect(page.locator('text=High Risk Developers')).toBeVisible();
    await expect(page.locator('text=Burnouts Prevented')).toBeVisible();
    await expect(page.locator('text=Team Velocity')).toBeVisible();
  });

  test('should display team members', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Check that team members are displayed
    await expect(page.locator('text=Sarah Chen')).toBeVisible();
    await expect(page.locator('text=Marcus Rodriguez')).toBeVisible();
    await expect(page.locator('text=Priya Patel')).toBeVisible();
    await expect(page.locator('text=Alex Kim')).toBeVisible();
  });

  test('should display capacity distribution chart', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Check capacity distribution
    await expect(page.locator('text=Team Capacity Distribution')).toBeVisible();
    await expect(page.locator('text=0-60%')).toBeVisible();
    await expect(page.locator('text=60-80%')).toBeVisible();
    await expect(page.locator('text=80-90%')).toBeVisible();
    await expect(page.locator('text=90-100%')).toBeVisible();

    // Check distribution labels
    await expect(page.locator('text=Underutilized')).toBeVisible();
    await expect(page.locator('text=Optimal')).toBeVisible();
    await expect(page.locator('text=High')).toBeVisible();
    await expect(page.locator('text=Critical')).toBeVisible();
  });

  test('should switch between capacity and wellness views', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Check view toggle buttons
    await expect(page.locator('button:has-text("Capacity View")')).toBeVisible();
    await expect(page.locator('button:has-text("Wellness View")')).toBeVisible();

    // Click wellness view
    await page.click('button:has-text("Wellness View")');
    
    // Verify the button state changed
    await expect(page.locator('button:has-text("Wellness View")')).toHaveClass(/bg-purple-600/);
  });

  test('should allow timeframe selection', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Check timeframe selector
    const timeframeSelect = page.locator('select').first();
    await expect(timeframeSelect).toBeVisible();

    // Change timeframe
    await timeframeSelect.selectOption('month');
    await expect(timeframeSelect).toHaveValue('month');
  });

  test('should display manager action center', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Check action center
    await expect(page.locator('text=Immediate Actions Required')).toBeVisible();
    
    // Check for high risk member alerts
    await expect(page.locator('text=High Burnout Risk')).toBeVisible();
    await expect(page.locator('button:has-text("Schedule 1:1")')).toBeVisible();
  });

  test('should display capacity management tools', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Check management tools
    await expect(page.locator('text=Capacity Management Tools')).toBeVisible();
    await expect(page.locator('text=Redistribute Sprint Tasks')).toBeVisible();
    await expect(page.locator('text=Schedule Team Check-ins')).toBeVisible();
    await expect(page.locator('text=Suggest Focus Time')).toBeVisible();
    await expect(page.locator('text=Pair Programming Matrix')).toBeVisible();
  });

  test('should display AI management insights', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Check AI insights
    await expect(page.locator('text=AI Management Insights')).toBeVisible();
    await expect(page.locator('text=Capacity Optimization')).toBeVisible();
    await expect(page.locator('text=Team Dynamics')).toBeVisible();

    // Check action buttons
    await expect(page.locator('button:has-text("View Suggestions")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Plan")')).toBeVisible();
  });

  test('should open team member detail modal', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Click on a team member
    await page.click('text=Sarah Chen');

    // Check modal opens
    await expect(page.locator('text=Current Capacity')).toBeVisible();
    await expect(page.locator('text=Key Metrics')).toBeVisible();
    await expect(page.locator('text=Late Night Commits')).toBeVisible();
    await expect(page.locator('text=Weekend Activity')).toBeVisible();
  });

  test('should close team member detail modal', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Click on a team member to open modal
    await page.click('text=Sarah Chen');
    await expect(page.locator('text=Current Capacity')).toBeVisible();

    // Close modal
    await page.click('text=✕');
    await expect(page.locator('text=Current Capacity')).not.toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/capacity');

    // Check that content is still visible and accessible
    await expect(page.locator('text=Team Capacity Intelligence')).toBeVisible();
    await expect(page.locator('text=Sarah Chen')).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard/capacity');

    // Check that content is properly laid out
    await expect(page.locator('text=Team Capacity Intelligence')).toBeVisible();
    await expect(page.locator('text=Team Avg Capacity')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/analytics/team**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      });
    });

    await page.goto('/dashboard/capacity');

    // Should still render basic structure
    await expect(page.locator('text=Team Capacity Intelligence')).toBeVisible();
  });

  test('should redirect unauthorized users', async ({ page }) => {
    // Mock unauthorized response
    await page.route('**/api/auth/permissions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          permissions: [] // No permissions
        })
      });
    });

    await page.goto('/dashboard/capacity');

    // Should redirect to unauthorized page
    await expect(page).toHaveURL('/unauthorized');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Tab to the wellness view button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Should switch to wellness view
    await expect(page.locator('button:has-text("Wellness View")')).toHaveClass(/bg-purple-600/);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Check for proper ARIA labels
    const capacityButton = page.locator('button:has-text("Capacity View")');
    await expect(capacityButton).toBeVisible();

    // Check for proper heading hierarchy
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should display risk indicators correctly', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Check for risk level indicators
    await expect(page.locator('text=high risk')).toBeVisible();
    await expect(page.locator('text=moderate risk')).toBeVisible();
  });

  test('should show alert indicators for team members', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Look for alert indicators (bell icons with numbers)
    const alertElements = page.locator('[data-testid="alert-indicator"], .text-warning');
    await expect(alertElements.first()).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Delay the API response to test loading state
    await page.route('**/api/analytics/team**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            teamId: 'team-123',
            metrics: {
              velocity: { average: 8.5 },
              collaboration: {
                score: 0.75,
                network: { nodes: [] }
              }
            }
          }
        })
      });
    });

    await page.goto('/dashboard/capacity');

    // Should show loading state initially
    await expect(page.locator('[role="status"]')).toBeVisible();

    // Should eventually show content
    await expect(page.locator('text=Team Capacity Intelligence')).toBeVisible({ timeout: 5000 });
  });

  test('should allow clicking on management tools', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Click on redistribute tasks tool
    const redistributeButton = page.locator('text=Redistribute Sprint Tasks').locator('..');
    await expect(redistributeButton).toBeVisible();
    await redistributeButton.click();

    // Should be clickable (no error thrown)
  });

  test('should display team metrics with correct values', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Check that metrics display reasonable values
    await expect(page.locator('text=/\\d+%/')).toBeVisible(); // Capacity percentage
    await expect(page.locator('text=/\\d+/')).toBeVisible(); // Numeric values
  });

  test('should show configure alerts button', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Check configure alerts button
    await expect(page.locator('button:has-text("Configure Alerts")')).toBeVisible();
  });

  test('should display capacity gauges for team members', async ({ page }) => {
    await page.goto('/dashboard/capacity');

    // Look for capacity percentage displays
    await expect(page.locator('text=/\\d+%/')).toBeVisible();
  });
});