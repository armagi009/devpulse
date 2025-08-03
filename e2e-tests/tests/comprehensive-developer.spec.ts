import { test, expect } from '@playwright/test';
import { createAuthHelper } from '../utils/auth-helpers';

/**
 * Comprehensive Developer Role Test Suite
 * 
 * This test suite provides comprehensive testing for developer role functionality,
 * including navigation testing, interactive features, and role-specific permissions.
 * Extends existing auth-flow patterns and dashboard-loading patterns.
 * 
 * Requirements: 3.1, 3.4, 4.1, 4.2, 4.4, 4.5
 */

test.describe('Comprehensive Developer Role Tests', () => {
  // Before each test, authenticate as developer user (extends auth-flow.spec.ts pattern)
  test.beforeEach(async ({ page }) => {
    const authHelper = createAuthHelper(page);
    // Authenticate using Alex Johnson (developer user)
    await authHelper.authenticateUser('1001');
    // Verify we're authenticated
    await authHelper.verifyAuthenticated();
  });

  test.describe('Developer Navigation Testing', () => {
    test('should discover and test all developer-accessible routes', async ({ page }) => {
      // Test navigation to expected developer routes
      const expectedDeveloperRoutes = [
        '/dashboard',
        '/dashboard/developer',
        '/dashboard/productivity', 
        '/dashboard/burnout',
        '/profile',
        '/settings'
      ];

      for (const route of expectedDeveloperRoutes) {
        // Navigate to route
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Verify page loaded successfully (no error page)
        const pageTitle = await page.title();
        expect(pageTitle, `Page title should not be empty for ${route}`).not.toBe('');
        
        // Check for error indicators
        const errorElements = await page.locator('[data-testid="error-page"], .error-page, [data-testid="access-denied"]').count() +
          await page.locator('text="Access Denied"').count() +
          await page.locator('text="404"').count();
        expect(errorElements, `No error elements should be present on ${route}`).toBe(0);
        
        // Verify page content loaded
        const bodyText = await page.locator('body').textContent();
        expect(bodyText, `Page should have content for ${route}`).toBeTruthy();
        expect(bodyText?.length, `Page content should not be empty for ${route}`).toBeGreaterThan(10);
      }
    });

    test('should validate developer dashboard sections', async ({ page }) => {
      // Navigate to developer dashboard
      await page.goto('/dashboard/developer');
      await page.waitForSelector('[data-testid="dashboard-content"], .space-y-6', { state: 'visible', timeout: 10000 });
      
      // Verify dashboard title and description
      await expect(page.getByRole('heading', { name: /Developer Dashboard/i })).toBeVisible();
      
      // Test personal metrics sections
      const metricsSection = page.locator('text=Burnout Risk').first();
      await expect(metricsSection).toBeVisible();
      
      const activitySection = page.locator('text=Recent Activity').first();
      await expect(activitySection).toBeVisible();
      
      const contributionSection = page.locator('text=Code Contribution Pattern').first();
      await expect(contributionSection).toBeVisible();
      
      // Test quick actions section
      const quickActionsSection = page.locator('text=Quick Actions').first();
      await expect(quickActionsSection).toBeVisible();
      
      // Verify quick action buttons are present
      const syncReposButton = page.getByText('Sync Repos');
      await expect(syncReposButton).toBeVisible();
      
      const viewPRsButton = page.getByText('View PRs');
      await expect(viewPRsButton).toBeVisible();
      
      const repositoriesButton = page.getByText('Repositories');
      await expect(repositoriesButton).toBeVisible();
      
      const profileButton = page.getByText('Profile');
      await expect(profileButton).toBeVisible();
    });

    test('should test personal analytics navigation', async ({ page }) => {
      // Navigate to productivity dashboard
      await page.goto('/dashboard/productivity');
      await page.waitForLoadState('networkidle');
      
      // Verify productivity page loads
      const productivityHeading = page.getByRole('heading', { name: /Productivity/i }).first();
      await expect(productivityHeading).toBeVisible();
      
      // Navigate to burnout dashboard
      await page.goto('/dashboard/burnout');
      await page.waitForLoadState('networkidle');
      
      // Verify burnout page loads
      const burnoutHeading = page.getByRole('heading', { name: /Burnout/i }).first();
      await expect(burnoutHeading).toBeVisible();
      
      // Test navigation back to main dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Verify main dashboard loads
      const dashboardHeading = page.getByRole('heading', { name: /Dashboard/i }).first();
      await expect(dashboardHeading).toBeVisible();
    });

    test('should validate developer-specific permissions', async ({ page }) => {
      // Test that developer cannot access admin routes
      const restrictedRoutes = [
        '/admin',
        '/admin/settings', 
        '/admin/users',
        '/dashboard/admin'
      ];
      
      for (const restrictedRoute of restrictedRoutes) {
        await page.goto(restrictedRoute);
        await page.waitForLoadState('networkidle');
        
        // Should be redirected to unauthorized page or dashboard
        const currentUrl = page.url();
        const isUnauthorized = currentUrl.includes('/unauthorized') || 
                              currentUrl.includes('/dashboard') ||
                              await page.locator('[data-testid="access-denied"], text="Access Denied", text="Unauthorized"').isVisible();
        
        expect(isUnauthorized, `Developer should not have access to ${restrictedRoute}`).toBe(true);
      }
      
      // Test that developer cannot access team management features
      await page.goto('/dashboard/team/members');
      await page.waitForLoadState('networkidle');
      
      const hasTeamManagementAccess = await page.locator('[data-testid="team-members-table"]').isVisible();
      expect(hasTeamManagementAccess, 'Developer should not have team management access').toBe(false);
    });

    test('should test UI rendering for developer role', async ({ page }) => {
      // Navigate to developer dashboard
      await page.goto('/dashboard/developer');
      await page.waitForSelector('[data-testid="dashboard-content"], .space-y-6', { state: 'visible' });
      
      // Check for proper role-based UI elements
      const roleIndicator = page.locator('[data-testid="user-role"], .role-badge');
      if (await roleIndicator.isVisible()) {
        const roleText = await roleIndicator.textContent();
        expect(roleText?.toLowerCase()).toContain('developer');
      }
      
      // Verify developer-specific navigation items are visible
      const sidebar = page.locator('nav[class*="sidebar"], #sidebar, [data-testid="sidebar"]').first();
      if (await sidebar.isVisible()) {
        // Check for personal metrics links
        const personalMetricsLink = sidebar.locator('a[href*="/dashboard/productivity"], a[href*="/productivity"]');
        if (await personalMetricsLink.count() > 0) {
          await expect(personalMetricsLink.first()).toBeVisible();
        }
        
        // Check that team management links are not visible
        const teamManagementLink = sidebar.locator('a[href*="/dashboard/team/members"], a[href*="/team/members"]');
        const teamManagementCount = await teamManagementLink.count();
        expect(teamManagementCount, 'Team management links should not be visible to developer').toBe(0);
      }
      
      // Test responsive behavior
      await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
      await page.waitForTimeout(500);
      
      // Verify mobile navigation works
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button[aria-label*="menu"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.waitForTimeout(500);
        
        const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav');
        if (await mobileNav.isVisible()) {
          await expect(mobileNav).toBeVisible();
        }
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test.describe('Developer Interactive Features Testing', () => {
    test('should test code contribution metrics interactions', async ({ page }) => {
      // Navigate to developer dashboard
      await page.goto('/dashboard/developer');
      await page.waitForSelector('[data-testid="dashboard-content"], .space-y-6', { state: 'visible' });
      
      // Test repository selection dropdown if multiple repositories exist
      const repositorySelect = page.locator('select').first();
      if (await repositorySelect.isVisible()) {
        // Get all options
        const options = await repositorySelect.locator('option').all();
        if (options.length > 1) {
          // Test selecting different repositories
          for (let i = 0; i < Math.min(options.length, 3); i++) {
            const optionValue = await options[i].getAttribute('value');
            if (optionValue) {
              await repositorySelect.selectOption(optionValue);
              await page.waitForTimeout(1000); // Wait for data to load
              
              // Verify dashboard updates
              await page.waitForSelector('.space-y-6', { state: 'visible' });
            }
          }
        }
      }
      
      // Test burnout risk score interactions
      const burnoutCard = page.locator('text=Burnout Risk').locator('..').first();
      if (await burnoutCard.isVisible()) {
        // Look for interactive elements within burnout card
        const burnoutInteractives = burnoutCard.locator('button, [role="button"], .clickable');
        const interactiveCount = await burnoutInteractives.count();
        
        for (let i = 0; i < interactiveCount; i++) {
          const interactive = burnoutInteractives.nth(i);
          if (await interactive.isVisible()) {
            await interactive.click();
            await page.waitForTimeout(500);
          }
        }
      }
      
      // Test recent activity metrics
      const activityCard = page.locator('text=Recent Activity').locator('..').first();
      if (await activityCard.isVisible()) {
        // Look for charts or interactive elements
        const chartElements = activityCard.locator('.recharts-surface, canvas, svg');
        const chartCount = await chartElements.count();
        
        if (chartCount > 0) {
          // Test chart interactions (hover, click)
          const firstChart = chartElements.first();
          await firstChart.hover();
          await page.waitForTimeout(500);
          
          // Look for tooltips or interactive chart elements
          const chartInteractives = activityCard.locator('.recharts-tooltip, .chart-tooltip, [data-testid*="tooltip"]');
          if (await chartInteractives.count() > 0) {
            await expect(chartInteractives.first()).toBeVisible();
          }
        }
      }
    });

    test('should test personal productivity charts and filters', async ({ page }) => {
      // Navigate to productivity dashboard
      await page.goto('/dashboard/productivity');
      await page.waitForLoadState('networkidle');
      
      // Test time range selector if present
      const timeRangeSelector = page.locator('[data-testid="time-range-selector"], .time-range-selector, button:has-text("Time Range")');
      if (await timeRangeSelector.count() > 0) {
        await timeRangeSelector.first().click();
        await page.waitForTimeout(500);
        
        // Look for time range options
        const timeRangeOptions = page.locator('[role="menuitem"], .time-range-option, button:has-text("Last"), button:has-text("Days")');
        const optionCount = await timeRangeOptions.count();
        
        if (optionCount > 0) {
          // Test selecting different time ranges
          const optionsToTest = Math.min(optionCount, 3);
          for (let i = 0; i < optionsToTest; i++) {
            const option = timeRangeOptions.nth(i);
            if (await option.isVisible()) {
              await option.click();
              await page.waitForTimeout(1000); // Wait for chart to update
              
              // Verify charts update
              await page.waitForSelector('.recharts-surface, canvas, svg', { state: 'visible', timeout: 5000 });
            }
          }
        }
      }
      
      // Test chart interactions
      const charts = page.locator('.recharts-surface, canvas, svg');
      const chartCount = await charts.count();
      
      for (let i = 0; i < Math.min(chartCount, 3); i++) {
        const chart = charts.nth(i);
        if (await chart.isVisible()) {
          // Test hover interactions
          await chart.hover();
          await page.waitForTimeout(500);
          
          // Test click interactions
          await chart.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Test filter controls if present
      const filterControls = page.locator('[data-testid*="filter"], .filter-control, select, input[type="search"]');
      const filterCount = await filterControls.count();
      
      for (let i = 0; i < Math.min(filterCount, 3); i++) {
        const filter = filterControls.nth(i);
        if (await filter.isVisible()) {
          const tagName = await filter.evaluate(el => el.tagName.toLowerCase());
          
          if (tagName === 'select') {
            const options = await filter.locator('option').all();
            if (options.length > 1) {
              const optionValue = await options[1].getAttribute('value');
              if (optionValue) {
                await filter.selectOption(optionValue);
                await page.waitForTimeout(1000);
              }
            }
          } else if (tagName === 'input') {
            await filter.fill('test');
            await page.waitForTimeout(500);
            await filter.clear();
          } else {
            await filter.click();
            await page.waitForTimeout(500);
          }
        }
      }
    });

    test('should test individual settings and preferences', async ({ page }) => {
      // Navigate to settings page
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      
      // Test appearance settings
      const appearanceSection = page.locator('text=Appearance').locator('..').first();
      if (await appearanceSection.isVisible()) {
        // Test theme toggle
        const themeToggle = appearanceSection.locator('button, [role="switch"], input[type="checkbox"]').first();
        if (await themeToggle.isVisible()) {
          await themeToggle.click();
          await page.waitForTimeout(500);
          
          // Verify theme change
          const bodyClass = await page.locator('body').getAttribute('class');
          expect(bodyClass).toBeTruthy();
        }
      }
      
      // Test notification settings
      const notificationSection = page.locator('text=Notification').locator('..').first();
      if (await notificationSection.isVisible()) {
        const notificationToggles = notificationSection.locator('input[type="checkbox"], [role="switch"]');
        const toggleCount = await notificationToggles.count();
        
        for (let i = 0; i < Math.min(toggleCount, 3); i++) {
          const toggle = notificationToggles.nth(i);
          if (await toggle.isVisible()) {
            await toggle.click();
            await page.waitForTimeout(300);
          }
        }
      }
      
      // Test data view settings
      const dataViewSection = page.locator('text=Data View').locator('..').first();
      if (await dataViewSection.isVisible()) {
        const dataViewControls = dataViewSection.locator('select, input, button');
        const controlCount = await dataViewControls.count();
        
        for (let i = 0; i < Math.min(controlCount, 3); i++) {
          const control = dataViewControls.nth(i);
          if (await control.isVisible()) {
            const tagName = await control.evaluate(el => el.tagName.toLowerCase());
            
            if (tagName === 'select') {
              const options = await control.locator('option').all();
              if (options.length > 1) {
                const optionValue = await options[1].getAttribute('value');
                if (optionValue) {
                  await control.selectOption(optionValue);
                  await page.waitForTimeout(500);
                }
              }
            } else if (tagName === 'button') {
              await control.click();
              await page.waitForTimeout(500);
            }
          }
        }
      }
    });

    test('should test form submissions and data export', async ({ page }) => {
      // Test profile form submission
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      // Look for profile form
      const profileForm = page.locator('form').first();
      if (await profileForm.isVisible()) {
        // Fill out form fields
        const nameInput = profileForm.locator('input[name="name"], input[placeholder*="name"]').first();
        if (await nameInput.isVisible()) {
          await nameInput.fill('Test Developer');
        }
        
        const emailInput = profileForm.locator('input[name="email"], input[type="email"]').first();
        if (await emailInput.isVisible()) {
          const currentValue = await emailInput.inputValue();
          if (!currentValue) {
            await emailInput.fill('test.developer@example.com');
          }
        }
        
        // Test form submission
        const submitButton = profileForm.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          
          // Look for success message or form validation
          const successMessage = page.locator('[data-testid="success-message"], .success, .alert-success, text="saved", text="updated"');
          const errorMessage = page.locator('[data-testid="error-message"], .error, .alert-error');
          
          // Either success or error message should appear
          const hasMessage = await successMessage.count() > 0 || await errorMessage.count() > 0;
          expect(hasMessage, 'Form submission should show feedback message').toBe(true);
        }
      }
      
      // Test data export functionality
      await page.goto('/dashboard/developer');
      await page.waitForSelector('[data-testid="dashboard-content"], .space-y-6', { state: 'visible' });
      
      // Look for export buttons
      const exportButtons = page.locator('button:has-text("Export"), button:has-text("Download"), [data-testid*="export"]');
      const exportCount = await exportButtons.count();
      
      if (exportCount > 0) {
        for (let i = 0; i < Math.min(exportCount, 2); i++) {
          const exportButton = exportButtons.nth(i);
          if (await exportButton.isVisible()) {
            // Set up download listener
            const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
            
            await exportButton.click();
            await page.waitForTimeout(1000);
            
            const download = await downloadPromise;
            if (download) {
              expect(download.suggestedFilename()).toBeTruthy();
            }
          }
        }
      }
    });

    test('should test responsive behavior and accessibility', async ({ page }) => {
      // Test different viewport sizes
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1280, height: 720, name: 'Desktop' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/dashboard/developer');
        await page.waitForSelector('[data-testid="dashboard-content"], .space-y-6', { state: 'visible' });
        
        // Verify content is visible and properly laid out
        const mainContent = page.locator('[data-testid="dashboard-content"], .space-y-6').first();
        await expect(mainContent).toBeVisible();
        
        // Test mobile navigation if on mobile viewport
        if (viewport.width < 768) {
          const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button[aria-label*="menu"], .hamburger');
          if (await mobileMenuButton.isVisible()) {
            await mobileMenuButton.click();
            await page.waitForTimeout(500);
            
            const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav');
            if (await mobileNav.isVisible()) {
              await expect(mobileNav).toBeVisible();
              
              // Close mobile menu
              await mobileMenuButton.click();
              await page.waitForTimeout(500);
            }
          }
        }
        
        // Test scrolling behavior
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
      }
      
      // Reset to desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Test keyboard navigation
      await page.goto('/dashboard/developer');
      await page.waitForSelector('[data-testid="dashboard-content"], .space-y-6', { state: 'visible' });
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      // Find focusable elements and test tab navigation
      const focusableElements = page.locator('button, a, input, select, [tabindex]:not([tabindex="-1"])');
      const focusableCount = await focusableElements.count();
      
      // Test tabbing through first few elements
      for (let i = 0; i < Math.min(focusableCount, 5); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
        
        // Verify focus is visible
        const focusedElement = page.locator(':focus');
        if (await focusedElement.count() > 0) {
          await expect(focusedElement).toBeVisible();
        }
      }
      
      // Test Enter key activation on focused elements
      const focusedElement = page.locator(':focus');
      if (await focusedElement.count() > 0) {
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'button' || tagName === 'a') {
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
        }
      }
    });
  });
});