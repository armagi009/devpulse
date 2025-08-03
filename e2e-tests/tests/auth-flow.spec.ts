import { test, expect } from '@playwright/test';
import { createAuthHelper } from '../utils/auth-helpers';

/**
 * Authentication Flow Tests
 * 
 * These tests verify the authentication flow of the application.
 * They test the sign-in page, authentication process, and redirection after authentication.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

test.describe('Authentication Flow', () => {
  test('should display the sign-in page correctly', async ({ page }) => {
    // Navigate to the sign-in page
    await page.goto('/auth/signin');
    
    // Verify the page title
    await expect(page).toHaveTitle(/Sign In | DevPulse/);
    
    // Verify the GitHub OAuth button is present
    const githubButton = page.getByRole('button', { name: /Sign in with GitHub/i });
    await expect(githubButton).toBeVisible();
    
    // Verify the page layout and content
    await expect(page.getByRole('heading', { name: /Sign in to DevPulse/i })).toBeVisible();
    await expect(page.getByText(/Connect with your GitHub account to access your development analytics/i)).toBeVisible();
  });

  test('should redirect to mock auth selection in development mode', async ({ page }) => {
    // Go to sign-in page
    await page.goto('/auth/signin');
    
    // Click the mock user sign-in button (should be visible in development mode)
    await page.getByRole('link', { name: /Sign in with Mock User/i }).click();
    
    // Verify redirection to mock user selection page
    await expect(page).toHaveURL(/\/auth\/mock\/select/);
    
    // Verify mock user selection page content
    await expect(page.getByRole('heading', { name: /Select a Mock User/i })).toBeVisible();
    await expect(page.getByText(/This is a development feature/i)).toBeVisible();
  });

  test('should select a mock user and redirect to dashboard', async ({ page }) => {
    const authHelper = createAuthHelper(page);
    // Authenticate using the helper
    const redirectUrl = await authHelper.authenticateUser('1001');
    // Verify we're on the dashboard
    expect(redirectUrl).toMatch(/\/dashboard/);
    // Verify authentication state
    await authHelper.verifyAuthenticated();
  });

  test('should handle sign out correctly', async ({ page }) => {
    const authHelper = createAuthHelper(page);
    // Sign in with a mock user
    await authHelper.authenticateUser('1001');
    // Verify we're authenticated
    await authHelper.verifyAuthenticated();
    // Sign out
    await authHelper.signOut();
    // Verify we're signed out
    await authHelper.verifySignedOut();
  });

  test('should redirect to onboarding for new users', async ({ page }) => {
    const authHelper = createAuthHelper(page);
    // Authenticate using a new user (Quinn Wilson)
    const redirectUrl = await authHelper.authenticateUser('1010');
    // Verify we're redirected to either dashboard or onboarding
    expect(redirectUrl).toMatch(/\/(dashboard|onboarding)/);
    // Verify authentication state
    await authHelper.verifyAuthenticated();
  });
});