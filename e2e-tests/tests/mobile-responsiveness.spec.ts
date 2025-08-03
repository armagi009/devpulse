import { test, expect } from '@playwright/test';

/**
 * Mobile Responsiveness Tests
 * 
 * These tests verify the application's responsive behavior on mobile devices.
 * They test layout adaptation, touch interactions, and mobile-specific features.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.6
 */

// Use mobile viewport for all tests in this file
test.use({ viewport: { width: 375, height: 667 } });

test.describe('Mobile Responsiveness', () => {
  // Before each test, navigate to the dashboard with a mock user
  test.beforeEach(async ({ page }) => {
    // Go to mock user selection and select a user
    await page.goto('/auth/mock/select');
    await page.getByRole('button', { name: /Developer User/i }).click();
    
    // Verify redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display mobile navigation menu', async ({ page }) => {
    // Verify mobile menu button is visible
    const mobileMenuButton = page.getByRole('button', { name: /Menu/i });
    await expect(mobileMenuButton).toBeVisible();
    
    // Click mobile menu button
    await mobileMenuButton.click();
    
    // Verify mobile menu is displayed
    const mobileMenu = page.getByTestId('mobile-menu');
    await expect(mobileMenu).toBeVisible();
    
    // Verify navigation links are visible in mobile menu
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Productivity/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Team/i })).toBeVisible();
  });

  test('should stack dashboard cards vertically on mobile', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-content"]', { state: 'visible' });
    
    // Get all dashboard cards
    const cards = await page.locator('.dashboard-card').all();
    
    // Verify there are multiple cards
    expect(cards.length).toBeGreaterThan(1);
    
    // Get bounding boxes of first two cards
    const card1Box = await cards[0].boundingBox();
    const card2Box = await cards[1].boundingBox();
    
    // Verify cards are stacked vertically (second card is below first card)
    expect(card2Box.y).toBeGreaterThan(card1Box.y + card1Box.height - 5); // Allow 5px overlap for shadows
    
    // Verify cards take full width
    expect(card1Box.width).toBeGreaterThan(350); // Almost full width of 375px viewport
  });

  test('should support touch interactions on charts', async ({ page }) => {
    // Navigate to productivity dashboard
    await page.goto('/dashboard/productivity');
    
    // Wait for charts to load
    await page.waitForSelector('.recharts-surface', { state: 'visible' });
    
    // Get the first chart
    const chart = page.locator('.recharts-surface').first();
    
    // Tap on the chart
    await chart.tap();
    
    // Verify tooltip appears
    await expect(page.locator('.recharts-tooltip-wrapper')).toBeVisible();
    
    // Tap elsewhere to dismiss tooltip
    await page.tap('body', { position: { x: 10, y: 10 } });
    
    // Verify tooltip disappears
    await expect(page.locator('.recharts-tooltip-wrapper')).toBeHidden();
  });

  test('should use mobile-optimized controls', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');
    
    // Verify touch-friendly controls are used
    await expect(page.getByTestId('touch-friendly-toggle')).toBeVisible();
    await expect(page.getByTestId('touch-friendly-slider')).toBeVisible();
    
    // Verify controls are larger on mobile
    const toggle = await page.getByTestId('touch-friendly-toggle').boundingBox();
    
    // Touch targets should be at least 44x44 pixels (iOS accessibility guideline)
    expect(toggle.height).toBeGreaterThanOrEqual(44);
    expect(toggle.width).toBeGreaterThanOrEqual(44);
  });

  test('should use progressive disclosure on mobile', async ({ page }) => {
    // Navigate to team dashboard
    await page.goto('/dashboard/team');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="team-dashboard-content"]', { state: 'visible' });
    
    // Verify "Show More" button is visible for complex content
    const showMoreButton = page.getByRole('button', { name: /Show More/i });
    await expect(showMoreButton).toBeVisible();
    
    // Click "Show More" button
    await showMoreButton.click();
    
    // Verify additional content is displayed
    await expect(page.getByTestId('expanded-content')).toBeVisible();
    
    // Verify "Show Less" button is now visible
    await expect(page.getByRole('button', { name: /Show Less/i })).toBeVisible();
  });

  test('should adapt data visualizations for mobile', async ({ page }) => {
    // Navigate to analytics dashboard
    await page.goto('/dashboard/analytics');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="analytics-content"]', { state: 'visible' });
    
    // Verify simplified charts are used on mobile
    await expect(page.getByTestId('mobile-data-display')).toBeVisible();
    
    // Verify complex visualizations are hidden
    await expect(page.getByTestId('desktop-visualization')).toBeHidden();
    
    // Verify mobile-specific legend is visible
    await expect(page.getByTestId('mobile-legend')).toBeVisible();
  });

  test('should optimize network usage on mobile', async ({ page }) => {
    // Enable slow 3G network simulation
    await page.route('**/*', async (route) => {
      // Add delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Verify low-resolution images are loaded
    const images = await page.locator('img[data-mobile-optimized="true"]').all();
    expect(images.length).toBeGreaterThan(0);
    
    // Verify lazy loading is applied
    const lazyImages = await page.locator('img[loading="lazy"]').all();
    expect(lazyImages.length).toBeGreaterThan(0);
    
    // Verify offline indicator appears when network is slow
    await expect(page.getByTestId('network-status-indicator')).toBeVisible();
  });
});