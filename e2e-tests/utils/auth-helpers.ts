/**
 * Authentication Test Helpers
 * 
 * Utilities to help with authentication testing and session management
 */

import { Page, expect } from '@playwright/test';
import { createSessionManager, SessionManager } from './test-session-config';

export class AuthHelper {
  private sessionManager: SessionManager;

  constructor(private page: Page) {
    this.sessionManager = createSessionManager(page);
  }

  /**
   * Authenticate a user using the mock authentication system
   */
  async authenticateUser(userId: string = '1001') {
    // Set up test session
    await this.sessionManager.setupTestSession();
    
    // Go to mock user selection page
    await this.page.goto('/auth/mock/select');
    
    // Wait for the page to load and users to be displayed
    await expect(this.page.getByRole('heading', { name: /Select a Mock User/i })).toBeVisible();
    
    // Wait for users to load
    await this.page.waitForSelector('div[class*="border rounded-lg p-4 flex items-center cursor-pointer"]', { timeout: 10000 });
    
    // Find the user card based on userId or use first available
    let userCard;
    if (userId === '1001') {
      // Alex Johnson - regular developer
      userCard = this.page.locator('div[class*="border rounded-lg p-4 flex items-center cursor-pointer"]').filter({ hasText: /Alex Johnson/i }).first();
    } else if (userId === '1005') {
      // Casey Kim - weekend warrior
      userCard = this.page.locator('div[class*="border rounded-lg p-4 flex items-center cursor-pointer"]').filter({ hasText: /Casey Kim/i }).first();
    } else if (userId === '1010') {
      // Quinn Wilson - new hire
      userCard = this.page.locator('div[class*="border rounded-lg p-4 flex items-center cursor-pointer"]').filter({ hasText: /Quinn Wilson/i }).first();
    } else if (userId === '1002') {
      // Sam Taylor - team lead
      userCard = this.page.locator('div[class*="border rounded-lg p-4 flex items-center cursor-pointer"]').filter({ hasText: /Sam Taylor/i }).first();
    } else if (userId === '1007') {
      // Jordan Smith - manager
      userCard = this.page.locator('div[class*="border rounded-lg p-4 flex items-center cursor-pointer"]').filter({ hasText: /Jordan Smith/i }).first();
    } else {
      // Default to first user card
      userCard = this.page.locator('div[class*="border rounded-lg p-4 flex items-center cursor-pointer"]').first();
    }
    
    await expect(userCard).toBeVisible();
    
    // Click the user card to authenticate
    await userCard.click();
    
    // Wait for authentication to complete - be more flexible about the redirect
    try {
      await this.page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
    } catch (error) {
      // If direct redirect doesn't work, check if we're on a sign-in callback page
      const currentUrl = this.page.url();
      if (currentUrl.includes('/auth/signin') && currentUrl.includes('callbackUrl')) {
        // Wait a bit more for the redirect to complete
        await this.page.waitForTimeout(3000);
        await this.page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
      } else {
        throw error;
      }
    }
    
    // Verify authentication was successful by checking session
    await this.verifyAuthenticated();
    
    return this.page.url();
  }

  /**
   * Verify that the user is authenticated
   */
  async verifyAuthenticated() {
    // Check if we're on a protected page (dashboard or onboarding)
    const url = this.page.url();
    expect(url).toMatch(/\/(dashboard|onboarding)/);
    
    // Verify session exists
    const hasSession = await this.sessionManager.verifySessionExists();
    expect(hasSession).toBe(true);
    
    // Wait for page content to load
    if (url.includes('/dashboard')) {
      await expect(this.page.getByRole('heading', { name: 'Welcome to DevPulse' })).toBeVisible();
    } else if (url.includes('/onboarding')) {
      await expect(this.page.getByRole('heading', { name: /Welcome/i })).toBeVisible();
    }
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    // Look for sign out button or link
    const signOutButton = this.page.getByRole('button', { name: /Sign out/i })
      .or(this.page.getByRole('link', { name: /Sign out/i }));
    
    // Try to find user menu first
    const userMenuSelectors = [
      '[data-testid="user-profile-menu"]',
      '[data-testid*="user"]',
      'button:has-text("Alex Johnson")',
      'button:has-text("Sam Taylor")',
      'button:has-text("Jordan Smith")',
      '[aria-label*="user menu"]',
      '[aria-label*="profile"]'
    ];
    
    let menuClicked = false;
    for (const selector of userMenuSelectors) {
      try {
        const menu = this.page.locator(selector).first();
        if (await menu.isVisible({ timeout: 2000 })) {
          await menu.click();
          menuClicked = true;
          break;
        }
      } catch {
        // Continue to next selector
      }
    }
    
    // Now try to click sign out
    try {
      await signOutButton.click({ timeout: 5000 });
      // Wait for sign out to complete
      await this.page.waitForURL(/^(\/|\/auth\/signin)/, { timeout: 10000 });
    } catch (error) {
      // If sign out button not found, try alternative approaches
      console.log('Sign out button not found, trying alternative methods');
      // Try direct navigation to sign out
      await this.page.goto('/api/auth/signout');
      // Wait for the sign out page to load
      await this.page.waitForLoadState('domcontentloaded');
      // Look for and click the sign out confirmation button
      const signOutPageButton = this.page.getByRole('button', { name: /Sign out/i });
      if (await signOutPageButton.isVisible({ timeout: 3000 })) {
        await signOutPageButton.click();
        await this.page.waitForURL(/^(\/|\/auth\/signin)/, { timeout: 10000 });
      }
    }
    
    // Clear auth state to ensure clean sign out
    await this.sessionManager.clearAuthState();
    
    // Verify sign out was successful
    await this.verifySignedOut();
  }

  /**
   * Verify that the user is signed out
   */
  async verifySignedOut() {
    // Check that we're on home page or sign in page
    const url = this.page.url();
    expect(url).toMatch(/^(\/|\/auth\/signin)/);
    
    // Look for sign in elements
    const signInElement = this.page.getByRole('link', { name: /Sign In/i })
      .or(this.page.getByRole('button', { name: /Sign in/i }))
      .or(this.page.getByText(/Sign in/i));
    
    await expect(signInElement).toBeVisible();
  }

  /**
   * Wait for authentication state to stabilize
   */
  async waitForAuthState(timeout: number = 10000) {
    // Wait for any pending authentication redirects
    await this.page.waitForLoadState('networkidle', { timeout });
    
    // Check if we're in an authenticated state
    const url = this.page.url();
    if (url.includes('/dashboard') || url.includes('/onboarding')) {
      await this.verifyAuthenticated();
    } else if (url.includes('/auth/signin') || url === new URL(this.page.url()).origin + '/') {
      await this.verifySignedOut();
    }
  }

  /**
   * Get current authentication status
   */
  async getAuthStatus(): Promise<'authenticated' | 'unauthenticated' | 'unknown'> {
    const url = this.page.url();
    if (url.includes('/dashboard') || url.includes('/onboarding')) {
      return 'authenticated';
    } else if (url.includes('/auth/signin') || url === new URL(this.page.url()).origin + '/') {
      return 'unauthenticated';
    }
    return 'unknown';
  }
}

/**
 * Create an auth helper instance for a page
 */
export function createAuthHelper(page: Page): AuthHelper {
  return new AuthHelper(page);
}

/**
 * Sign in with a mock user and wait for authentication to complete
 * @deprecated Use createAuthHelper(page).authenticateUser() instead
 */
export async function signInWithMockUser(page: Page, userIndex: number = 0): Promise<void> {
  const authHelper = createAuthHelper(page);
  const userIds = ['1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010'];
  const userId = userIds[userIndex] || '1001';
  await authHelper.authenticateUser(userId);
}

/**
 * Check if user is currently authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check if we're on a protected page (dashboard)
    const url = page.url();
    if (url.includes('/dashboard')) {
      // Try to find dashboard content
      const dashboardHeading = page.getByRole('heading', { name: 'Welcome to DevPulse' });
      await dashboardHeading.waitFor({ timeout: 2000 });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Wait for authentication state to stabilize
 */
export async function waitForAuthState(page: Page, expectedState: 'authenticated' | 'unauthenticated', timeout: number = 10000): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const currentlyAuthenticated = await isAuthenticated(page);
    
    if (expectedState === 'authenticated' && currentlyAuthenticated) {
      console.log('Authentication state confirmed: authenticated');
      return;
    }
    
    if (expectedState === 'unauthenticated' && !currentlyAuthenticated) {
      console.log('Authentication state confirmed: unauthenticated');
      return;
    }
    
    // Wait a bit before checking again
    await page.waitForTimeout(500);
  }
  
  throw new Error(`Authentication state did not stabilize to ${expectedState} within ${timeout}ms`);
}

/**
 * Sign out and wait for sign out to complete
 */
export async function signOut(page: Page): Promise<void> {
  console.log('Starting sign out process...');
  
  // Look for user profile menu or sign out option
  const signOutButton = page.getByRole('button', { name: /Sign out/i }).or(page.getByRole('link', { name: /Sign out/i }));
  
  // If there's a user menu, try to click it first
  const userMenu = page.getByTestId('user-profile-menu')
    .or(page.locator('[data-testid*="user"]'))
    .or(page.locator('button:has-text("Alex Johnson")'))
    .or(page.locator('[aria-label*="user"]'));
  
  try {
    // Try to click user menu first
    const menuElement = userMenu.first();
    if (await menuElement.isVisible({ timeout: 2000 })) {
      console.log('Clicking user menu...');
      await menuElement.click();
      await page.waitForTimeout(500); // Wait for menu to open
    }
  } catch (error) {
    console.log('No user menu found, trying direct sign out');
  }
  
  // Click sign out button
  try {
    await signOutButton.click({ timeout: 5000 });
    console.log('Sign out button clicked');
  } catch (error) {
    console.log('Could not find sign out button, trying alternative methods');
    // Try navigating to sign out URL directly
    await page.goto('/api/auth/signout');
    await page.getByRole('button', { name: /Sign out/i }).click();
  }
  
  // Wait for sign out to complete
  await page.waitForURL(/^http:\/\/localhost:3000\/(|auth\/signin)/, { timeout: 10000 });
  
  // Verify user is signed out
  await expect(page.getByRole('link', { name: /Sign In/i }).or(page.getByRole('button', { name: /Sign in/i }))).toBeVisible();
  
  console.log('Sign out completed successfully');
}

/**
 * Get current session information for debugging
 */
export async function getSessionInfo(page: Page): Promise<any> {
  try {
    const response = await page.request.get('/api/auth/session');
    const session = await response.json();
    console.log('Current session:', session);
    return session;
  } catch (error) {
    console.log('Could not get session info:', error);
    return null;
  }
}