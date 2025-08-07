/**
 * Wellness Dashboard E2E Tests
 * End-to-end testing for the developer wellness dashboard
 */

import { test, expect } from '@playwright/test';

test.describe('Wellness Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-123',
            name: 'Test Developer',
            email: 'test@example.com',
            image: 'https://example.com/avatar.jpg'
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    // Mock permissions API
    await page.route('**/api/auth/permissions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          permissions: ['VIEW_PERSONAL_METRICS']
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
            userId: 'test-user-123',
            repositoryId: 'default',
            riskScore: 45,
            confidence: 0.85,
            keyFactors: [
              {
                name: 'Late Night Commits',
                impact: 0.3,
                description: 'High frequency of commits after 10 PM'
              },
              {
                name: 'Code Review Pressure',
                impact: 0.2,
                description: 'Increased review turnaround time'
              }
            ],
            recommendations: [
              'Consider reducing late-night coding sessions',
              'Schedule regular breaks during intensive work periods',
              'Increase pair programming to distribute knowledge'
            ],
            historicalTrend: [
              { date: '2024-01-01T00:00:00.000Z', value: 30 },
              { date: '2024-01-15T00:00:00.000Z', value: 35 },
              { date: '2024-02-01T00:00:00.000Z', value: 45 }
            ],
            lastUpdated: '2024-02-01T00:00:00.000Z'
          }
        })
      });
    });

    // Mock productivity analytics API
    await page.route('**/api/analytics/productivity**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            metrics: {
              userId: 'test-user-123',
              timeRange: {
                start: '2024-01-01T00:00:00.000Z',
                end: '2024-02-01T00:00:00.000Z'
              },
              commitCount: 45,
              prCount: 12,
              issueCount: 8,
              reviewCount: 15,
              linesAdded: 2500,
              linesDeleted: 800,
              commitFrequency: [
                { date: '2024-01-01T00:00:00.000Z', count: 3 },
                { date: '2024-01-02T00:00:00.000Z', count: 5 },
                { date: '2024-01-03T00:00:00.000Z', count: 2 }
              ],
              codeQualityScore: 0.88,
              collaborationScore: 0.75
            }
          }
        })
      });
    });
  });

  test('should load wellness dashboard successfully', async ({ page }) => {
    await page.goto('/dashboard/wellness');

    // Wait for the page to load
    await expect(page.locator('text=Welcome back, Test Developer')).toBeVisible();
    
    // Check that the wellness score is displayed
    await expect(page.locator('text=/Wellness Score: \\d+\\/100/')).toBeVisible();
    
    // Check that risk level is displayed
    await expect(page.locator('text=moderate risk')).toBeVisible();
  });

  test('should display navigation tabs', async ({ page }) => {
    await page.goto('/dashboard/wellness');

    // Check all navigation tabs are present
    await expect(page.locator('button:has-text("Overview")')).toBeVisible();
    await expect(page.locator('button:has-text("AI Insights")')).toBeVisible();
    await expect(page.locator('button:has-text("Live Activity")')).toBeVisible();
    await expect(page.locator('button:has-text("Wellness")')).toBeVisible();
  });

  test('should switch between tabs correctly', async ({ page }) => {
    await page.goto('/dashboard/wellness');

    // Default should be Overview tab
    await expect(page.locator('text=Commits Today')).toBeVisible();

    // Click on AI Insights tab
    await page.click('button:has-text("AI Insights")');
    await expect(page.locator('text=AI Burnout Prevention Insights')).toBeVisible();

    // Click on Live Activity tab
    await page.click('button:has-text("Live Activity")');
    await expect(page.locator('text=Real-Time Activity Feed')).toBeVisible();

    // Click on Wellness tab
    await page.click('button:has-text("Wellness")');
    await expect(page.locator('text=Wellness Score Breakdown')).toBeVisible();
  });

  test('should display overview metrics', async ({ page }) => {
    await page.goto('/dashboard/wellness');

    // Check key metrics are displayed
    await expect(page.locator('text=Commits Today')).toBeVisible();
    await expect(page.locator('text=Code Reviews')).toBeVisible();
    await expect(page.locator('text=Issues Resolved')).toBeVisible();
    await expect(page.locator('text=Bug Reports')).toBeVisible();

    // Check wellness gauges
    await expect(page.locator('text=Work-Life Balance')).toBeVisible();
    await expect(page.locator('text=Code Quality')).toBeVisible();
    await expect(page.locator('text=Collaboration')).toBeVisible();
    await expect(page.locator('text=Stress Level')).toBeVisible();
  });

  test('should display AI insights when tab is selected', async ({ page }) => {
    await page.goto('/dashboard/wellness');

    // Click on AI Insights tab
    await page.click('button:has-text("AI Insights")');

    // Check AI insights sections
    await expect(page.locator('text=Self-Reassurance: You\'ve Got This')).toBeVisible();
    await expect(page.locator('text=Peer Validation: You\'re Not Alone')).toBeVisible();
    await expect(page.locator('text=Social Impact: Your Contributions Matter')).toBeVisible();

    // Check AI recommendation
    await expect(page.locator('text=AI Recommendation')).toBeVisible();
    await expect(page.locator('button:has-text("Schedule Break")')).toBeVisible();
  });

  test('should display wellness recommendations', async ({ page }) => {
    await page.goto('/dashboard/wellness');

    // Click on Wellness tab
    await page.click('button:has-text("Wellness")');

    // Check recommendations are displayed
    await expect(page.locator('text=Areas for Improvement')).toBeVisible();
    await expect(page.locator('text=Consider reducing late-night coding sessions')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/wellness');

    // Check that content is still visible and accessible
    await expect(page.locator('text=Welcome back, Test Developer')).toBeVisible();
    await expect(page.locator('button:has-text("Overview")')).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard/wellness');

    // Check that content is properly laid out
    await expect(page.locator('text=Welcome back, Test Developer')).toBeVisible();
    await expect(page.locator('text=Commits Today')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/analytics/burnout**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      });
    });

    await page.goto('/dashboard/wellness');

    // Should still render with fallback data
    await expect(page.locator('text=Welcome back, Test Developer')).toBeVisible();
    await expect(page.locator('text=moderate risk')).toBeVisible();
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

    await page.goto('/dashboard/wellness');

    // Should redirect to unauthorized page
    await expect(page).toHaveURL('/unauthorized');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard/wellness');

    // Tab to the AI Insights button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Should switch to AI Insights tab
    await expect(page.locator('text=AI Burnout Prevention Insights')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/dashboard/wellness');

    // Check for proper ARIA labels
    const overviewButton = page.locator('button:has-text("Overview")');
    await expect(overviewButton).toHaveAttribute('aria-pressed', 'true');

    // Check for proper heading hierarchy
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('should update time display', async ({ page }) => {
    await page.goto('/dashboard/wellness');

    // Check that time-related content is present
    await expect(page.locator('text=Welcome back, Test Developer')).toBeVisible();
    
    // Wait a moment and check that the page is still functional
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Welcome back, Test Developer')).toBeVisible();
  });

  test('should display quick action buttons', async ({ page }) => {
    await page.goto('/dashboard/wellness');

    // Check quick action buttons are present
    await expect(page.locator('text=Schedule break reminder')).toBeVisible();
    await expect(page.locator('text=Request pair programming')).toBeVisible();
    await expect(page.locator('text=Block focus time')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Delay the API response to test loading state
    await page.route('**/api/analytics/burnout**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            userId: 'test-user-123',
            riskScore: 45,
            confidence: 0.85,
            keyFactors: [],
            recommendations: [],
            historicalTrend: [],
            lastUpdated: '2024-02-01T00:00:00.000Z'
          }
        })
      });
    });

    await page.goto('/dashboard/wellness');

    // Should show loading state initially
    await expect(page.locator('[role="status"]')).toBeVisible();

    // Should eventually show content
    await expect(page.locator('text=Welcome back, Test Developer')).toBeVisible({ timeout: 5000 });
  });
});