/**
 * Test-specific session configuration utilities
 * Helps ensure proper session management during E2E tests
 */
import { Page } from '@playwright/test';

export class SessionManager {
  constructor(private page: Page) {}

  /**
   * Wait for session to be established after authentication
   */
  async waitForSession(timeout: number = 10000): Promise<void> {
    // Wait for the session API call to complete
    await this.page.waitForResponse(
      response => response.url().includes('/api/auth/session') && response.status() === 200,
      { timeout }
    );
    
    // Additional wait for any session-related redirects
    await this.page.waitForLoadState('networkidle', { timeout: 5000 });
  }

  /**
   * Verify session exists by checking the session API
   */
  async verifySessionExists(): Promise<boolean> {
    try {
      const response = await this.page.request.get('/api/auth/session');
      const session = await response.json();
      return !!(session && session.user);
    } catch {
      return false;
    }
  }

  /**
   * Clear all authentication-related cookies and storage
   */
  async clearAuthState(): Promise<void> {
    // Clear cookies
    await this.page.context().clearCookies();
    
    // Clear local storage (with error handling)
    try {
      await this.page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          // Ignore localStorage access errors
          console.log('Could not clear storage:', e.message);
        }
      });
    } catch (e) {
      // Ignore if we can't access storage
      console.log('Could not access page storage:', e.message);
    }
  }

  /**
   * Set up test-friendly session configuration
   */
  async setupTestSession(): Promise<void> {
    // Ensure we start with a clean state
    await this.clearAuthState();
    
    // Set any test-specific configuration
    await this.page.addInitScript(() => {
      // Disable any session timeout mechanisms during tests
      window.__TEST_MODE__ = true;
    });
  }

  /**
   * Wait for authentication flow to complete
   */
  async waitForAuthCompletion(expectedUrl?: RegExp, timeout: number = 20000): Promise<void> {
    // Wait for any authentication redirects
    if (expectedUrl) {
      await this.page.waitForURL(expectedUrl, { timeout });
    }
    
    // Wait for session to be established
    await this.waitForSession(timeout);
    
    // Wait for page to be fully loaded
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 5000 });
  }
}

/**
 * Create a session manager for a page
 */
export function createSessionManager(page: Page): SessionManager {
  return new SessionManager(page);
}