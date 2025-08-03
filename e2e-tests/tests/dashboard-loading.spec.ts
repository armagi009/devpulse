import { test, expect } from '@playwright/test';

/**
 * Dashboard Loading Tests
 * 
 * These tests verify the dashboard loading behavior, including:
 * - Initial loading state
 * - Data rendering
 * - Performance metrics
 * - Error handling
 * 
 * Requirements: 4.3, 4.5, 7.1, 7.2
 */

test.describe('Dashboard Loading', () => {
  // Before each test, navigate to the dashboard with a mock user
  test.beforeEach(async ({ page }) => {
    // Go to mock user selection and select a user
    await page.goto('/auth/mock/select');
    await page.getByRole('button', { name: /Developer User/i }).click();
    
    // Verify redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display loading states initially', async ({ page }) => {
    // Reload the page to see initial loading states
    await page.reload();
    
    // Verify loading skeletons are visible
    await expect(page.getByTestId('dashboard-skeleton')).toBeVisible();
    
    // Wait for content to load
    await expect(page.getByTestId('dashboard-skeleton')).toBeHidden({ timeout: 5000 });
    
    // Verify dashboard content is visible after loading
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });

  test('should render dashboard cards with data', async ({ page }) => {
    // Wait for dashboard to load completely
    await page.waitForSelector('[data-testid="dashboard-content"]', { state: 'visible' });
    
    // Verify productivity metrics card is visible
    const productivityCard = page.getByRole('heading', { name: /Productivity Metrics/i }).first();
    await expect(productivityCard).toBeVisible();
    
    // Verify chart elements are rendered
    await expect(page.locator('.recharts-surface').first()).toBeVisible();
    
    // Verify data is displayed in the charts
    await expect(page.locator('.recharts-layer.recharts-bar-rectangle').first()).toBeVisible();
  });

  test('should load dashboard within performance threshold', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();
    
    // Reload the page
    await page.reload();
    
    // Wait for dashboard content to be visible
    await page.waitForSelector('[data-testid="dashboard-content"]', { state: 'visible' });
    
    // Calculate load time
    const loadTime = Date.now() - startTime;
    
    // Verify load time is within threshold (2 seconds as per requirement 7.1)
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Navigate to dashboard with error simulation
    await page.goto('/dashboard?simulateError=true');
    
    // Wait for error states to appear
    await page.waitForSelector('[data-testid="api-error"]', { state: 'visible' });
    
    // Verify error message is displayed
    await expect(page.getByTestId('api-error')).toBeVisible();
    
    // Verify retry button is available
    const retryButton = page.getByRole('button', { name: /Retry/i });
    await expect(retryButton).toBeVisible();
    
    // Click retry button
    await retryButton.click();
    
    // Verify dashboard attempts to reload data
    await expect(page.getByTestId('dashboard-skeleton')).toBeVisible();
  });

  test('should navigate between dashboard sections', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-content"]', { state: 'visible' });
    
    // Navigate to productivity section
    await page.getByRole('link', { name: /Productivity/i }).click();
    
    // Verify URL changed
    await expect(page).toHaveURL(/\/dashboard\/productivity/);
    
    // Verify productivity content loaded
    await expect(page.getByRole('heading', { name: /Productivity Dashboard/i })).toBeVisible();
    
    // Navigate to team section
    await page.getByRole('link', { name: /Team/i }).click();
    
    // Verify URL changed
    await expect(page).toHaveURL(/\/dashboard\/team/);
    
    // Verify team content loaded
    await expect(page.getByRole('heading', { name: /Team Dashboard/i })).toBeVisible();
  });

  test('should filter dashboard data', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-content"]', { state: 'visible' });
    
    // Open time range selector
    await page.getByRole('button', { name: /Time Range/i }).click();
    
    // Select last 7 days
    await page.getByRole('button', { name: /Last 7 Days/i }).click();
    
    // Verify loading state appears
    await expect(page.getByTestId('dashboard-loading')).toBeVisible();
    
    // Verify loading state disappears
    await expect(page.getByTestId('dashboard-loading')).toBeHidden({ timeout: 5000 });
    
    // Verify time range indicator shows selected range
    await expect(page.getByText(/Last 7 Days/i)).toBeVisible();
  });
});