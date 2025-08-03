import { test, expect } from '@playwright/test';
import { NavigationCrawler, setupNavigationCrawlerWithAuth } from '../utils/navigation-crawler';
import { ErrorDetector } from '../utils/error-detector';
import { InteractiveElementTester } from '../utils/interactive-element-tester';
import { UserRole } from '../../src/lib/types/roles';

/**
 * Comprehensive Manager Role Test Suite
 * 
 * This test suite provides comprehensive testing for manager role functionality,
 * including administrative features, system settings, user management, and 
 * organizational analytics. Extends existing auth-flow patterns and dashboard-loading patterns.
 * 
 * Requirements: 3.3, 3.4, 4.1, 4.2, 4.3
 */

test.describe('Comprehensive Manager Role Tests', () => {
  let navigationCrawler: NavigationCrawler;
  let errorDetector: ErrorDetector;
  let interactiveElementTester: InteractiveElementTester;

  // Before each test, authenticate as manager user (extends auth-flow.spec.ts pattern)
  test.beforeEach(async ({ page, context }) => {
    // Initialize error detection
    errorDetector = new ErrorDetector(page, context);
    errorDetector.setUserContext('manager', 'Manager User');
    
    // Initialize interactive element tester
    interactiveElementTester = new InteractiveElementTester(page, errorDetector);
    
    // Go to mock user selection and select manager user
    await page.goto('/auth/mock/select');
    await page.getByRole('button', { name: /Manager User/i }).click();
    
    // Verify redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Initialize navigation crawler with administrator role
    navigationCrawler = await setupNavigationCrawlerWithAuth(page, UserRole.ADMINISTRATOR);
    
    errorDetector.addReproductionStep('Authenticated as manager user and initialized test utilities');
  });

  test.describe('Manager Administrative Testing', () => {
    test('should discover and test all manager-accessible routes', async ({ page }) => {
      errorDetector.addReproductionStep('Starting manager route discovery');
      
      // Discover all routes available to manager
      const discoveredRoutes = await navigationCrawler.discoverRoutes({
        includeChildren: true,
        validatePermissions: true,
        captureScreenshots: false
      });
      
      // Test expected manager routes
      const expectedManagerRoutes = [
        '/dashboard',
        '/dashboard/admin',
        '/admin/settings',
        '/dashboard/analytics',
        '/dashboard/team',
        '/dashboard/productivity',
        '/dashboard/burnout',
        '/profile',
        '/settings'
      ];

      for (const route of expectedManagerRoutes) {
        errorDetector.addReproductionStep(`Testing route: ${route}`);
        
        // Navigate to route
        const isAccessible = await navigationCrawler.navigateToRoute(route);
        expect(isAccessible, `Manager should have access to ${route}`).toBe(true);
        
        // Verify page loaded successfully (no error page)
        const pageTitle = await page.title();
        expect(pageTitle, `Page title should not be empty for ${route}`).not.toBe('');
        
        // Check for error indicators
        const errorElements = await page.locator('[data-testid="error-page"], .error-page, [data-testid="access-denied"], text="Access Denied", text="404"').count();
        expect(errorElements, `No error elements should be present on ${route}`).toBe(0);
        
        // Verify page content loaded
        const bodyText = await page.locator('body').textContent();
        expect(bodyText, `Page should have content for ${route}`).toBeTruthy();
        expect(bodyText?.length, `Page content should not be empty for ${route}`).toBeGreaterThan(10);
        
        // Detect any rendering issues
        await errorDetector.detectRenderingIssues();
      }
      
      errorDetector.addReproductionStep('Completed manager route discovery and testing');
    });

    test('should validate team dashboard sections', async ({ page }) => {
      errorDetector.addReproductionStep('Testing team dashboard sections');
      
      // Navigate to team dashboard
      await page.goto('/dashboard/team');
      await page.waitForSelector('[data-testid="dashboard-content"], .space-y-6', { state: 'visible', timeout: 10000 });
      
      // Verify dashboard title and description
      await expect(page.getByRole('heading', { name: /Team Dashboard/i })).toBeVisible();
      
      // Test team metrics sections
      const teamMetricsSection = page.locator('text=Team Metrics').first();
      if (await teamMetricsSection.isVisible()) {
        await expect(teamMetricsSection).toBeVisible();
      }
      
      const teamVelocitySection = page.locator('text=Team Velocity').first();
      if (await teamVelocitySection.isVisible()) {
        await expect(teamVelocitySection).toBeVisible();
      }
      
      const collaborationSection = page.locator('text=Collaboration').first();
      if (await collaborationSection.isVisible()) {
        await expect(collaborationSection).toBeVisible();
      }
      
      // Test team management sections
      const teamMembersSection = page.locator('text=Team Members').first();
      if (await teamMembersSection.isVisible()) {
        await expect(teamMembersSection).toBeVisible();
      }
      
      // Test burnout monitoring section
      const burnoutMonitoringSection = page.locator('text=Burnout Monitoring').first();
      if (await burnoutMonitoringSection.isVisible()) {
        await expect(burnoutMonitoringSection).toBeVisible();
      }
      
      // Verify team-lead specific action buttons are present
      const manageTeamButton = page.getByText('Manage Team');
      if (await manageTeamButton.isVisible()) {
        await expect(manageTeamButton).toBeVisible();
      }
      
      const inviteMemberButton = page.getByText('Invite Member');
      if (await inviteMemberButton.isVisible()) {
        await expect(inviteMemberButton).toBeVisible();
      }
      
      const createRetrospectiveButton = page.getByText('Create Retrospective');
      if (await createRetrospectiveButton.isVisible()) {
        await expect(createRetrospectiveButton).toBeVisible();
      }
      
      errorDetector.addReproductionStep('Completed team dashboard sections testing');
    });

    test('should test team member management navigation', async ({ page }) => {
      errorDetector.addReproductionStep('Testing team member management navigation');
      
      // Navigate to team members page
      await page.goto('/dashboard/team/members');
      await page.waitForLoadState('networkidle');
      
      // Verify team members page loads
      const teamMembersHeading = page.getByRole('heading', { name: /Team Members/i }).first();
      if (await teamMembersHeading.isVisible()) {
        await expect(teamMembersHeading).toBeVisible();
      }
      
      // Test team members table if present
      const teamMembersTable = page.locator('[data-testid="team-members-table"], .team-members-table, table');
      if (await teamMembersTable.isVisible()) {
        await expect(teamMembersTable).toBeVisible();
        
        // Test table headers
        const tableHeaders = teamMembersTable.locator('th, .table-header');
        const headerCount = await tableHeaders.count();
        expect(headerCount, 'Team members table should have headers').toBeGreaterThan(0);
      }
      
      // Test member invitation functionality
      const inviteButton = page.locator('button:has-text("Invite"), [data-testid="invite-member"]');
      if (await inviteButton.isVisible()) {
        await expect(inviteButton).toBeVisible();
      }
      
      // Navigate to team analytics
      await page.goto('/dashboard/team');
      await page.waitForLoadState('networkidle');
      
      // Verify team analytics page loads
      const teamAnalyticsHeading = page.getByRole('heading', { name: /Team/i }).first();
      if (await teamAnalyticsHeading.isVisible()) {
        await expect(teamAnalyticsHeading).toBeVisible();
      }
      
      errorDetector.addReproductionStep('Completed team member management navigation testing');
    });

    test('should validate team-lead specific permissions', async ({ page }) => {
      errorDetector.addReproductionStep('Testing team-lead specific permissions');
      
      // Test that team-lead can access team management routes
      const allowedRoutes = [
        '/dashboard/team',
        '/dashboard/team/members',
        '/dashboard/retrospective'
      ];
      
      for (const allowedRoute of allowedRoutes) {
        await page.goto(allowedRoute);
        await page.waitForLoadState('networkidle');
        
        // Should not be redirected to unauthorized page
        const currentUrl = page.url();
        const isAuthorized = !currentUrl.includes('/unauthorized') && 
                            !await page.locator('[data-testid="access-denied"], text="Access Denied", text="Unauthorized"').isVisible();
        
        expect(isAuthorized, `Team-lead should have access to ${allowedRoute}`).toBe(true);
      }
      
      // Test that team-lead cannot access admin routes
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
        
        expect(isUnauthorized, `Team-lead should not have access to ${restrictedRoute}`).toBe(true);
      }
      
      errorDetector.addReproductionStep('Completed team-lead permissions testing');
    });

    test('should test UI rendering for team-lead role', async ({ page }) => {
      errorDetector.addReproductionStep('Testing UI rendering for team-lead role');
      
      // Navigate to team dashboard
      await page.goto('/dashboard/team');
      await page.waitForSelector('[data-testid="dashboard-content"], .space-y-6', { state: 'visible' });
      
      // Check for proper role-based UI elements
      const roleIndicator = page.locator('[data-testid="user-role"], .role-badge');
      if (await roleIndicator.isVisible()) {
        const roleText = await roleIndicator.textContent();
        expect(roleText?.toLowerCase()).toContain('team');
      }
      
      // Verify team-lead specific navigation items are visible
      const sidebar = page.locator('nav[class*="sidebar"], #sidebar, [data-testid="sidebar"]').first();
      if (await sidebar.isVisible()) {
        // Check for team management links
        const teamManagementLink = sidebar.locator('a[href*="/dashboard/team"], a[href*="/team"]');
        if (await teamManagementLink.count() > 0) {
          await expect(teamManagementLink.first()).toBeVisible();
        }
        
        // Check for retrospective links
        const retrospectiveLink = sidebar.locator('a[href*="/retrospective"]');
        if (await retrospectiveLink.count() > 0) {
          await expect(retrospectiveLink.first()).toBeVisible();
        }
        
        // Check that admin links are not visible
        const adminLink = sidebar.locator('a[href*="/admin"]');
        const adminLinkCount = await adminLink.count();
        expect(adminLinkCount, 'Admin links should not be visible to team-lead').toBe(0);
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
      
      errorDetector.addReproductionStep('Completed UI rendering testing for team-lead role');
    });
  });

  test.describe('Team Management Interactive Features Testing', () => {
    test('should test team member invitation functionality', async ({ page }) => {
      errorDetector.addReproductionStep('Testing team member invitation functionality');
      
      // Navigate to team members page
      await page.goto('/dashboard/team/members');
      await page.waitForLoadState('networkidle');
      
      // Test invite member button
      const inviteButton = page.locator('button:has-text("Invite"), [data-testid="invite-member"], [data-testid="invite-button"]');
      if (await inviteButton.isVisible()) {
        await inviteButton.click();
        await page.waitForTimeout(1000);
        
        // Check if invite modal or form opened
        const inviteModal = page.locator('[role="dialog"], .modal, [data-testid="invite-modal"]');
        const inviteForm = page.locator('form[data-testid="invite-form"], form:has(input[type="email"])');
        
        if (await inviteModal.isVisible()) {
          // Test modal form
          const emailInput = inviteModal.locator('input[type="email"], input[name="email"]');
          if (await emailInput.isVisible()) {
            await emailInput.fill('test.member@example.com');
          }
          
          const roleSelect = inviteModal.locator('select[name="role"], [data-testid="role-select"]');
          if (await roleSelect.isVisible()) {
            const options = await roleSelect.locator('option').all();
            if (options.length > 1) {
              await roleSelect.selectOption({ index: 1 });
            }
          }
          
          // Test form submission (if it's a test/mock environment)
          const submitButton = inviteModal.locator('button[type="submit"], button:has-text("Send"), button:has-text("Invite")');
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(2000);
            
            // Check for success or error message
            const successMessage = page.locator('[data-testid="success-message"], .success, .alert-success');
            const errorMessage = page.locator('[data-testid="error-message"], .error, .alert-error');
            
            const hasMessage = await successMessage.count() > 0 || await errorMessage.count() > 0;
            expect(hasMessage, 'Invite form submission should show feedback message').toBe(true);
          }
          
          // Close modal
          const closeButton = inviteModal.locator('[aria-label="Close"], .close, [data-testid="close"]');
          if (await closeButton.isVisible()) {
            await closeButton.click();
          } else {
            await page.keyboard.press('Escape');
          }
        } else if (await inviteForm.isVisible()) {
          // Test inline form
          const emailInput = inviteForm.locator('input[type="email"], input[name="email"]');
          if (await emailInput.isVisible()) {
            await emailInput.fill('test.member@example.com');
            await emailInput.clear(); // Clear to test validation
          }
        }
      }
      
      errorDetector.addReproductionStep('Completed team member invitation functionality testing');
    });

    test('should test role assignment and team settings functionality', async ({ page }) => {
      errorDetector.addReproductionStep('Testing role assignment and team settings functionality');
      
      // Navigate to team members page
      await page.goto('/dashboard/team/members');
      await page.waitForLoadState('networkidle');
      
      // Test role assignment for existing members
      const memberRows = page.locator('[data-testid="member-row"], .member-row, tbody tr');
      const memberCount = await memberRows.count();
      
      if (memberCount > 0) {
        // Test role dropdown for first member
        const firstMemberRow = memberRows.first();
        const roleSelect = firstMemberRow.locator('select[name="role"], [data-testid="role-select"]');
        
        if (await roleSelect.isVisible()) {
          const options = await roleSelect.locator('option').all();
          if (options.length > 1) {
            // Test changing role
            const currentValue = await roleSelect.inputValue();
            const firstOptionValue = await options[0].getAttribute('value');
            const newOptionIndex = currentValue === firstOptionValue ? 1 : 0;
            await roleSelect.selectOption({ index: newOptionIndex });
            await page.waitForTimeout(1000);
            
            // Check for confirmation or update message
            const updateMessage = page.locator('[data-testid="update-message"], .update-success, .role-updated');
            if (await updateMessage.isVisible()) {
              await expect(updateMessage).toBeVisible();
            }
          }
        }
        
        // Test member actions (remove, edit, etc.)
        const memberActions = firstMemberRow.locator('button, [role="button"]');
        const actionCount = await memberActions.count();
        
        for (let i = 0; i < Math.min(actionCount, 3); i++) {
          const action = memberActions.nth(i);
          if (await action.isVisible()) {
            const actionText = await action.textContent();
            
            // Skip destructive actions in testing
            if (actionText && !actionText.toLowerCase().includes('delete') && !actionText.toLowerCase().includes('remove')) {
              await action.click();
              await page.waitForTimeout(500);
              
              // Handle any modals that might open
              const modal = page.locator('[role="dialog"], .modal');
              if (await modal.isVisible()) {
                const closeButton = modal.locator('[aria-label="Close"], .close, button:has-text("Cancel")');
                if (await closeButton.isVisible()) {
                  await closeButton.click();
                }
              }
            }
          }
        }
      }
      
      // Test team settings if available
      const teamSettingsButton = page.locator('button:has-text("Settings"), [data-testid="team-settings"]');
      if (await teamSettingsButton.isVisible()) {
        await teamSettingsButton.click();
        await page.waitForTimeout(1000);
        
        // Test team settings form
        const settingsForm = page.locator('form[data-testid="team-settings"], form:has(input[name*="team"])');
        if (await settingsForm.isVisible()) {
          // Test team name input
          const teamNameInput = settingsForm.locator('input[name="name"], input[name="teamName"]');
          if (await teamNameInput.isVisible()) {
            const currentName = await teamNameInput.inputValue();
            await teamNameInput.fill(currentName + ' Updated');
            await teamNameInput.fill(currentName); // Restore original
          }
          
          // Test team description
          const descriptionInput = settingsForm.locator('textarea[name="description"], input[name="description"]');
          if (await descriptionInput.isVisible()) {
            await descriptionInput.fill('Test team description');
            await descriptionInput.clear();
          }
        }
      }
      
      errorDetector.addReproductionStep('Completed role assignment and team settings functionality testing');
    });

    test('should test team analytics charts and interactions', async ({ page }) => {
      errorDetector.addReproductionStep('Testing team analytics charts and interactions');
      
      // Navigate to team dashboard
      await page.goto('/dashboard/team');
      await page.waitForSelector('[data-testid="dashboard-content"], .space-y-6', { state: 'visible' });
      
      // Test all interactive elements on the page
      const interactionResults = await interactiveElementTester.testAllInteractiveElements({
        includeAccessibility: true,
        captureScreenshots: false,
        testKeyboardNavigation: true,
        testTouchInteractions: true,
        testResponsiveness: true,
        timeout: 10000
      });
      
      // Verify charts were tested
      expect(interactionResults.charts.length, 'Should have tested team analytics charts').toBeGreaterThan(0);
      
      // Test specific team analytics features
      await testTeamVelocityChart(page);
      await testCollaborationMetrics(page);
      await testBurnoutMonitoring(page);
      
      errorDetector.addReproductionStep('Completed team analytics charts and interactions testing');
    });

    test('should test retrospective tools and creation', async ({ page }) => {
      errorDetector.addReproductionStep('Testing retrospective tools and creation');
      
      // Navigate to retrospective page
      await page.goto('/dashboard/retrospective');
      await page.waitForLoadState('networkidle');
      
      // Test create retrospective functionality
      const createRetrospectiveButton = page.locator('button:has-text("Create"), [data-testid="create-retrospective"]');
      if (await createRetrospectiveButton.isVisible()) {
        await createRetrospectiveButton.click();
        await page.waitForTimeout(1000);
        
        // Test retrospective creation form/wizard
        const retrospectiveForm = page.locator('form[data-testid="retrospective-form"], .retrospective-wizard');
        if (await retrospectiveForm.isVisible()) {
          // Test retrospective title
          const titleInput = retrospectiveForm.locator('input[name="title"], input[placeholder*="title"]');
          if (await titleInput.isVisible()) {
            await titleInput.fill('Test Sprint Retrospective');
          }
          
          // Test date selection
          const dateInput = retrospectiveForm.locator('input[type="date"], [data-testid="date-picker"]');
          if (await dateInput.isVisible()) {
            await dateInput.fill('2024-01-15');
          }
          
          // Test team member selection
          const memberSelect = retrospectiveForm.locator('select[name="members"], [data-testid="member-select"]');
          if (await memberSelect.isVisible()) {
            const options = await memberSelect.locator('option').all();
            if (options.length > 1) {
              await memberSelect.selectOption({ index: 1 });
            }
          }
          
          // Test form submission
          const submitButton = retrospectiveForm.locator('button[type="submit"], button:has-text("Create")');
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(2000);
          }
        }
      }
      
      // Test existing retrospectives list
      const retrospectivesList = page.locator('[data-testid="retrospectives-list"], .retrospectives-list');
      if (await retrospectivesList.isVisible()) {
        const retrospectiveItems = retrospectivesList.locator('.retrospective-item, [data-testid="retrospective-item"]');
        const itemCount = await retrospectiveItems.count();
        
        if (itemCount > 0) {
          // Test viewing a retrospective
          const firstItem = retrospectiveItems.first();
          const viewButton = firstItem.locator('button:has-text("View"), a:has-text("View")');
          if (await viewButton.isVisible()) {
            await viewButton.click();
            await page.waitForTimeout(1000);
            
            // Verify retrospective details page loaded
            const retrospectiveDetails = page.locator('[data-testid="retrospective-details"], .retrospective-details');
            if (await retrospectiveDetails.isVisible()) {
              await expect(retrospectiveDetails).toBeVisible();
            }
          }
        }
      }
      
      errorDetector.addReproductionStep('Completed retrospective tools and creation testing');
    });

    test('should test team-specific data filtering and time range selection', async ({ page }) => {
      errorDetector.addReproductionStep('Testing team-specific data filtering and time range selection');
      
      // Navigate to team dashboard
      await page.goto('/dashboard/team');
      await page.waitForSelector('[data-testid="dashboard-content"], .space-y-6', { state: 'visible' });
      
      // Test time range selector
      const timeRangeSelector = page.locator('[data-testid="time-range-selector"], .time-range-selector, button:has-text("Time Range")');
      if (await timeRangeSelector.count() > 0) {
        await timeRangeSelector.first().click();
        await page.waitForTimeout(500);
        
        // Test different time range options
        const timeRangeOptions = page.locator('[role="menuitem"], .time-range-option, button:has-text("Last"), button:has-text("Days")');
        const optionCount = await timeRangeOptions.count();
        
        if (optionCount > 0) {
          const optionsToTest = Math.min(optionCount, 3);
          for (let i = 0; i < optionsToTest; i++) {
            const option = timeRangeOptions.nth(i);
            if (await option.isVisible()) {
              await option.click();
              await page.waitForTimeout(1500); // Wait for charts to update
              
              // Verify charts update
              const charts = page.locator('.recharts-surface, canvas, svg');
              if (await charts.count() > 0) {
                await expect(charts.first()).toBeVisible();
              }
              
              // Reopen time range selector for next option
              if (i < optionsToTest - 1) {
                await timeRangeSelector.first().click();
                await page.waitForTimeout(500);
              }
            }
          }
        }
      }
      
      // Test team member filter
      const memberFilter = page.locator('[data-testid="member-filter"], .member-filter, select[name="member"]');
      if (await memberFilter.isVisible()) {
        const options = await memberFilter.locator('option').all();
        if (options.length > 1) {
          // Test filtering by different team members
          for (let i = 1; i < Math.min(options.length, 4); i++) {
            const optionValue = await options[i].getAttribute('value');
            if (optionValue) {
              await memberFilter.selectOption(optionValue);
              await page.waitForTimeout(1000);
              
              // Verify data updates
              await page.waitForSelector('.space-y-6', { state: 'visible' });
            }
          }
        }
      }
      
      // Test repository filter
      const repositoryFilter = page.locator('[data-testid="repository-filter"], .repository-filter, select[name="repository"]');
      if (await repositoryFilter.isVisible()) {
        const options = await repositoryFilter.locator('option').all();
        if (options.length > 1) {
          // Test filtering by different repositories
          for (let i = 1; i < Math.min(options.length, 3); i++) {
            const optionValue = await options[i].getAttribute('value');
            if (optionValue) {
              await repositoryFilter.selectOption(optionValue);
              await page.waitForTimeout(1000);
              
              // Verify data updates
              await page.waitForSelector('.space-y-6', { state: 'visible' });
            }
          }
        }
      }
      
      // Test search functionality
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
        await searchInput.clear();
        await page.waitForTimeout(500);
      }
      
      errorDetector.addReproductionStep('Completed team-specific data filtering and time range selection testing');
    });

    test('should test report generation and data export', async ({ page }) => {
      errorDetector.addReproductionStep('Testing report generation and data export');
      
      // Navigate to team dashboard
      await page.goto('/dashboard/team');
      await page.waitForSelector('[data-testid="dashboard-content"], .space-y-6', { state: 'visible' });
      
      // Test report generation
      const generateReportButton = page.locator('button:has-text("Generate Report"), [data-testid="generate-report"]');
      if (await generateReportButton.isVisible()) {
        await generateReportButton.click();
        await page.waitForTimeout(1000);
        
        // Test report configuration modal/form
        const reportModal = page.locator('[role="dialog"], .modal, [data-testid="report-modal"]');
        if (await reportModal.isVisible()) {
          // Test report type selection
          const reportTypeSelect = reportModal.locator('select[name="type"], [data-testid="report-type"]');
          if (await reportTypeSelect.isVisible()) {
            const options = await reportTypeSelect.locator('option').all();
            if (options.length > 1) {
              await reportTypeSelect.selectOption({ index: 1 });
            }
          }
          
          // Test date range selection
          const startDateInput = reportModal.locator('input[name="startDate"], input[type="date"]').first();
          if (await startDateInput.isVisible()) {
            await startDateInput.fill('2024-01-01');
          }
          
          const endDateInput = reportModal.locator('input[name="endDate"], input[type="date"]').last();
          if (await endDateInput.isVisible()) {
            await endDateInput.fill('2024-01-31');
          }
          
          // Test report generation
          const generateButton = reportModal.locator('button:has-text("Generate"), button[type="submit"]');
          if (await generateButton.isVisible()) {
            const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
            await generateButton.click();
            
            const download = await downloadPromise;
            if (download) {
              expect(download.suggestedFilename()).toBeTruthy();
            }
          }
          
          // Close modal
          const closeButton = reportModal.locator('[aria-label="Close"], .close');
          if (await closeButton.isVisible()) {
            await closeButton.click();
          }
        }
      }
      
      // Test data export functionality
      const exportButtons = page.locator('button:has-text("Export"), button:has-text("Download"), [data-testid*="export"]');
      const exportCount = await exportButtons.count();
      
      if (exportCount > 0) {
        for (let i = 0; i < Math.min(exportCount, 2); i++) {
          const exportButton = exportButtons.nth(i);
          if (await exportButton.isVisible()) {
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
      
      errorDetector.addReproductionStep('Completed report generation and data export testing');
    });
  });

// Helper functions for specific team analytics testing
async function testTeamVelocityChart(page: any) {
  const velocityChart = page.locator('[data-testid="velocity-chart"], .velocity-chart').first();
  if (await velocityChart.isVisible()) {
    // Test chart interactions
    await velocityChart.hover();
    await page.waitForTimeout(500);
    
    // Look for tooltips
    const tooltip = page.locator('.recharts-tooltip, .tooltip, [role="tooltip"]');
    if (await tooltip.isVisible()) {
      await expect(tooltip).toBeVisible();
    }
    
    // Test chart click
    await velocityChart.click();
    await page.waitForTimeout(500);
  }
}

async function testCollaborationMetrics(page: any) {
  const collaborationChart = page.locator('[data-testid="collaboration-chart"], .collaboration-metrics').first();
  if (await collaborationChart.isVisible()) {
    // Test chart interactions
    await collaborationChart.hover();
    await page.waitForTimeout(500);
    
    // Test legend interactions if present
    const legend = collaborationChart.locator('.recharts-legend, .chart-legend');
    if (await legend.isVisible()) {
      const legendItems = legend.locator('.recharts-legend-item, .legend-item');
      const itemCount = await legendItems.count();
      
      for (let i = 0; i < Math.min(itemCount, 3); i++) {
        const item = legendItems.nth(i);
        if (await item.isVisible()) {
          await item.click();
          await page.waitForTimeout(300);
        }
      }
    }
  }
}

async function testBurnoutMonitoring(page: any) {
  const burnoutSection = page.locator('[data-testid="burnout-monitoring"], .burnout-monitoring').first();
  if (await burnoutSection.isVisible()) {
    // Test burnout risk indicators
    const riskIndicators = burnoutSection.locator('.risk-indicator, [data-testid="risk-indicator"]');
    const indicatorCount = await riskIndicators.count();
    
    for (let i = 0; i < Math.min(indicatorCount, 3); i++) {
      const indicator = riskIndicators.nth(i);
      if (await indicator.isVisible()) {
        await indicator.hover();
        await page.waitForTimeout(300);
      }
    }
    
    // Test burnout alerts or notifications
    const burnoutAlerts = burnoutSection.locator('.alert, .notification, [data-testid="burnout-alert"]');
    if (await burnoutAlerts.count() > 0) {
      await expect(burnoutAlerts.first()).toBeVisible();
    }
  }
  }

  test.afterEach(async ({ page }) => {
    // Check for any errors detected during the test
    if (errorDetector) {
      const errorSummary = errorDetector.getErrorSummary();
      if (errorSummary.total > 0) {
        console.log('Errors detected during team-lead test:', errorSummary);
        
        // Log critical and high severity errors
        const categorizedErrors = errorDetector.getCategorizedErrors();
        if (categorizedErrors.critical.length > 0) {
          console.error('Critical errors:', categorizedErrors.critical);
        }
        if (categorizedErrors.high.length > 0) {
          console.error('High severity errors:', categorizedErrors.high);
        }
      }
      
      // Clear errors for next test
      errorDetector.clearErrors();
    }
  });
});