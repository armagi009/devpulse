/**
 * Navigation Crawler Utility
 * 
 * Provides systematic route discovery and role-based route access validation
 * for comprehensive testing. Builds on existing dashboard-loading patterns
 * and auth patterns.
 * 
 * Requirements: 1.2, 3.4
 */

import { Page, Locator } from '@playwright/test';
import { UserRole, PERMISSIONS } from '../../src/lib/types/roles';

export interface RouteInfo {
  path: string;
  name: string;
  icon?: string;
  permission?: string;
  role?: UserRole;
  children?: RouteInfo[];
  isActive?: boolean;
  isAccessible?: boolean;
  errorMessage?: string;
}

export interface NavigationState {
  currentPath: string;
  availableRoutes: RouteInfo[];
  restrictedRoutes: RouteInfo[];
  navigationErrors: string[];
}

export interface CrawlerOptions {
  includeChildren?: boolean;
  validatePermissions?: boolean;
  captureScreenshots?: boolean;
  timeout?: number;
}

/**
 * Navigation Crawler class for systematic route discovery
 */
export class NavigationCrawler {
  private page: Page;
  private baseUrl: string;
  private currentRole: UserRole | null = null;
  private discoveredRoutes: Map<string, RouteInfo> = new Map();
  private navigationErrors: string[] = [];

  constructor(page: Page, baseUrl: string = '') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  /**
   * Set the current user role for permission validation
   */
  setUserRole(role: UserRole): void {
    this.currentRole = role;
  }

  /**
   * Get the current user role
   */
  getCurrentRole(): UserRole | null {
    return this.currentRole;
  }

  /**
   * Discover all application routes by parsing sidebar navigation
   */
  async discoverRoutes(options: CrawlerOptions = {}): Promise<RouteInfo[]> {
    const {
      includeChildren = true,
      validatePermissions = true,
      captureScreenshots = false,
      timeout = 5000
    } = options;

    try {
      // Wait for navigation to be visible
      await this.page.waitForSelector('nav', { timeout });

      // Get all navigation links from sidebar
      const sidebarRoutes = await this.extractSidebarRoutes(includeChildren);
      
      // Get additional routes from header navigation if present
      const headerRoutes = await this.extractHeaderRoutes();
      
      // Get mobile navigation routes if present
      const mobileRoutes = await this.extractMobileRoutes();
      
      // Combine all discovered routes
      const allRoutes = [...sidebarRoutes, ...headerRoutes, ...mobileRoutes];
      
      // Remove duplicates based on path
      const uniqueRoutes = this.deduplicateRoutes(allRoutes);
      
      // Validate permissions if requested
      if (validatePermissions && this.currentRole) {
        await this.validateRoutePermissions(uniqueRoutes);
      }
      
      // Capture screenshots if requested
      if (captureScreenshots) {
        await this.captureNavigationScreenshots(uniqueRoutes);
      }
      
      // Store discovered routes
      uniqueRoutes.forEach(route => {
        this.discoveredRoutes.set(route.path, route);
      });
      
      return uniqueRoutes;
    } catch (error) {
      const errorMessage = `Failed to discover routes: ${error.message}`;
      this.navigationErrors.push(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Extract routes from sidebar navigation
   */
  private async extractSidebarRoutes(includeChildren: boolean = true): Promise<RouteInfo[]> {
    const routes: RouteInfo[] = [];
    
    try {
      // Look for sidebar navigation
      const sidebar = this.page.locator('nav[class*="sidebar"], #sidebar, [data-testid="sidebar"]').first();
      
      if (await sidebar.isVisible()) {
        // Get all navigation links
        const navLinks = sidebar.locator('a[href]');
        const linkCount = await navLinks.count();
        
        for (let i = 0; i < linkCount; i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');
          const text = await link.textContent();
          
          if (href && text) {
            const route: RouteInfo = {
              path: href.trim(),
              name: text.trim(),
              isAccessible: true
            };
            
            // Try to extract icon information
            const icon = link.locator('svg, [class*="icon"]').first();
            if (await icon.isVisible()) {
              const iconClass = await icon.getAttribute('class');
              route.icon = iconClass || 'icon';
            }
            
            routes.push(route);
          }
        }
        
        // Handle expandable navigation items if includeChildren is true
        if (includeChildren) {
          await this.extractExpandableRoutes(sidebar, routes);
        }
      }
    } catch (error) {
      this.navigationErrors.push(`Error extracting sidebar routes: ${error.message}`);
    }
    
    return routes;
  }

  /**
   * Extract routes from header navigation
   */
  private async extractHeaderRoutes(): Promise<RouteInfo[]> {
    const routes: RouteInfo[] = [];
    
    try {
      // Look for header navigation
      const header = this.page.locator('header nav, [data-testid="header-nav"]').first();
      
      if (await header.isVisible()) {
        const navLinks = header.locator('a[href]');
        const linkCount = await navLinks.count();
        
        for (let i = 0; i < linkCount; i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');
          const text = await link.textContent();
          
          if (href && text) {
            routes.push({
              path: href.trim(),
              name: text.trim(),
              isAccessible: true
            });
          }
        }
      }
    } catch (error) {
      this.navigationErrors.push(`Error extracting header routes: ${error.message}`);
    }
    
    return routes;
  }

  /**
   * Extract routes from mobile navigation
   */
  private async extractMobileRoutes(): Promise<RouteInfo[]> {
    const routes: RouteInfo[] = [];
    
    try {
      // Look for mobile navigation
      const mobileNav = this.page.locator('[data-testid="mobile-nav"], .mobile-nav').first();
      
      if (await mobileNav.isVisible()) {
        const navLinks = mobileNav.locator('a[href]');
        const linkCount = await navLinks.count();
        
        for (let i = 0; i < linkCount; i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');
          const text = await link.textContent();
          
          if (href && text) {
            routes.push({
              path: href.trim(),
              name: text.trim(),
              isAccessible: true
            });
          }
        }
      }
    } catch (error) {
      this.navigationErrors.push(`Error extracting mobile routes: ${error.message}`);
    }
    
    return routes;
  }

  /**
   * Extract expandable/collapsible navigation routes
   */
  private async extractExpandableRoutes(sidebar: Locator, routes: RouteInfo[]): Promise<void> {
    try {
      // Look for expandable navigation items (buttons with children)
      const expandableItems = sidebar.locator('button[aria-expanded], [data-expandable]');
      const expandableCount = await expandableItems.count();
      
      for (let i = 0; i < expandableCount; i++) {
        const expandableItem = expandableItems.nth(i);
        const isExpanded = await expandableItem.getAttribute('aria-expanded') === 'true';
        
        // If not expanded, click to expand
        if (!isExpanded) {
          await expandableItem.click();
          await this.page.waitForTimeout(500); // Wait for expansion animation
        }
        
        // Find child navigation items
        const parentContainer = expandableItem.locator('..').first();
        const childLinks = parentContainer.locator('a[href]');
        const childCount = await childLinks.count();
        
        for (let j = 0; j < childCount; j++) {
          const childLink = childLinks.nth(j);
          const href = await childLink.getAttribute('href');
          const text = await childLink.textContent();
          
          if (href && text) {
            const childRoute: RouteInfo = {
              path: href.trim(),
              name: text.trim(),
              isAccessible: true
            };
            
            // Check if this is already in routes as a parent
            const parentRoute = routes.find(r => r.path === href.trim());
            if (parentRoute) {
              // This is a parent route, skip adding as child
              continue;
            }
            
            routes.push(childRoute);
          }
        }
      }
    } catch (error) {
      this.navigationErrors.push(`Error extracting expandable routes: ${error.message}`);
    }
  }

  /**
   * Remove duplicate routes based on path
   */
  private deduplicateRoutes(routes: RouteInfo[]): RouteInfo[] {
    const uniqueRoutes = new Map<string, RouteInfo>();
    
    routes.forEach(route => {
      if (!uniqueRoutes.has(route.path)) {
        uniqueRoutes.set(route.path, route);
      }
    });
    
    return Array.from(uniqueRoutes.values());
  }

  /**
   * Validate route permissions based on current user role
   */
  private async validateRoutePermissions(routes: RouteInfo[]): Promise<void> {
    if (!this.currentRole) return;
    
    // Define route permission mappings based on the Navigation component
    const routePermissions: Record<string, string> = {
      '/dashboard/productivity': PERMISSIONS.VIEW_PERSONAL_METRICS,
      '/dashboard/burnout': PERMISSIONS.VIEW_BURNOUT_PERSONAL,
      '/dashboard/team': PERMISSIONS.VIEW_TEAM_METRICS,
      '/dashboard/team/members': PERMISSIONS.MANAGE_TEAMS,
      '/dashboard/repositories': PERMISSIONS.MANAGE_REPOSITORIES,
      '/dashboard/retrospective': PERMISSIONS.CREATE_RETROSPECTIVES,
      '/admin': PERMISSIONS.ADMIN_SYSTEM,
      '/admin/users': PERMISSIONS.ADMIN_USERS,
      '/admin/settings': PERMISSIONS.ADMIN_SYSTEM,
      '/admin/mock-mode': PERMISSIONS.ADMIN_MOCK_MODE,
    };
    
    // Define role permissions based on DEFAULT_ROLE_PERMISSIONS
    const rolePermissions: Record<UserRole, string[]> = {
      [UserRole.DEVELOPER]: [
        PERMISSIONS.VIEW_PERSONAL_METRICS,
        PERMISSIONS.VIEW_BURNOUT_PERSONAL,
      ],
      [UserRole.TEAM_LEAD]: [
        PERMISSIONS.VIEW_PERSONAL_METRICS,
        PERMISSIONS.VIEW_TEAM_METRICS,
        PERMISSIONS.VIEW_BURNOUT_PERSONAL,
        PERMISSIONS.VIEW_BURNOUT_TEAM,
        PERMISSIONS.MANAGE_REPOSITORIES,
        PERMISSIONS.MANAGE_TEAMS,
        PERMISSIONS.CREATE_RETROSPECTIVES,
      ],
      [UserRole.ADMINISTRATOR]: Object.values(PERMISSIONS),
    };
    
    const userPermissions = rolePermissions[this.currentRole] || [];
    
    routes.forEach(route => {
      const requiredPermission = routePermissions[route.path];
      
      if (requiredPermission) {
        route.permission = requiredPermission;
        route.role = this.currentRole;
        route.isAccessible = userPermissions.includes(requiredPermission);
        
        if (!route.isAccessible) {
          route.errorMessage = `Access denied: Missing permission ${requiredPermission}`;
        }
      }
    });
  }

  /**
   * Capture screenshots of navigation states
   */
  private async captureNavigationScreenshots(routes: RouteInfo[]): Promise<void> {
    try {
      // Capture main navigation screenshot
      await this.page.screenshot({
        path: `test-results/navigation-overview-${this.currentRole || 'unknown'}.png`,
        fullPage: true
      });
      
      // Capture individual route screenshots for accessible routes
      for (const route of routes.slice(0, 5)) { // Limit to first 5 to avoid too many screenshots
        if (route.isAccessible) {
          try {
            await this.page.goto(`${this.baseUrl}${route.path}`);
            await this.page.waitForLoadState('networkidle');
            await this.page.screenshot({
              path: `test-results/route-${route.path.replace(/\//g, '-')}-${this.currentRole || 'unknown'}.png`,
              fullPage: true
            });
          } catch (error) {
            this.navigationErrors.push(`Failed to capture screenshot for ${route.path}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      this.navigationErrors.push(`Error capturing navigation screenshots: ${error.message}`);
    }
  }

  /**
   * Navigate to a specific route and validate access
   */
  async navigateToRoute(path: string, options: { validateAccess?: boolean } = {}): Promise<boolean> {
    const { validateAccess = true } = options;
    
    try {
      await this.page.goto(`${this.baseUrl}${path}`);
      await this.page.waitForLoadState('networkidle');
      
      if (validateAccess) {
        // Check for access denied indicators
        const accessDeniedSelectors = [
          '[data-testid="access-denied"]',
          '.access-denied',
          'text="Access Denied"',
          'text="Unauthorized"',
          'text="403"',
          'text="Forbidden"'
        ];
        
        for (const selector of accessDeniedSelectors) {
          if (await this.page.locator(selector).isVisible()) {
            this.navigationErrors.push(`Access denied for route: ${path}`);
            return false;
          }
        }
        
        // Check for error pages
        const errorSelectors = [
          '[data-testid="error-page"]',
          '.error-page',
          'text="Page Not Found"',
          'text="404"',
          'text="500"'
        ];
        
        for (const selector of errorSelectors) {
          if (await this.page.locator(selector).isVisible()) {
            this.navigationErrors.push(`Error page encountered for route: ${path}`);
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      this.navigationErrors.push(`Failed to navigate to ${path}: ${error.message}`);
      return false;
    }
  }

  /**
   * Test all discovered routes for accessibility
   */
  async testAllRoutes(options: { timeout?: number } = {}): Promise<NavigationState> {
    const { timeout = 10000 } = options;
    const availableRoutes: RouteInfo[] = [];
    const restrictedRoutes: RouteInfo[] = [];
    
    const routes = Array.from(this.discoveredRoutes.values());
    
    for (const route of routes) {
      try {
        const isAccessible = await this.navigateToRoute(route.path, { validateAccess: true });
        
        if (isAccessible) {
          availableRoutes.push({ ...route, isAccessible: true });
        } else {
          restrictedRoutes.push({ ...route, isAccessible: false });
        }
        
        // Wait between navigation attempts
        await this.page.waitForTimeout(500);
      } catch (error) {
        const errorMessage = `Error testing route ${route.path}: ${error.message}`;
        this.navigationErrors.push(errorMessage);
        restrictedRoutes.push({
          ...route,
          isAccessible: false,
          errorMessage
        });
      }
    }
    
    return {
      currentPath: this.page.url(),
      availableRoutes,
      restrictedRoutes,
      navigationErrors: this.navigationErrors
    };
  }

  /**
   * Get navigation state for current role
   */
  async getNavigationState(): Promise<NavigationState> {
    const routes = Array.from(this.discoveredRoutes.values());
    const availableRoutes = routes.filter(r => r.isAccessible !== false);
    const restrictedRoutes = routes.filter(r => r.isAccessible === false);
    
    return {
      currentPath: this.page.url(),
      availableRoutes,
      restrictedRoutes,
      navigationErrors: this.navigationErrors
    };
  }

  /**
   * Clear navigation errors
   */
  clearErrors(): void {
    this.navigationErrors = [];
  }

  /**
   * Get all navigation errors
   */
  getErrors(): string[] {
    return [...this.navigationErrors];
  }

  /**
   * Get discovered routes
   */
  getDiscoveredRoutes(): RouteInfo[] {
    return Array.from(this.discoveredRoutes.values());
  }

  /**
   * Check if a route exists in discovered routes
   */
  hasRoute(path: string): boolean {
    return this.discoveredRoutes.has(path);
  }

  /**
   * Get route information by path
   */
  getRoute(path: string): RouteInfo | undefined {
    return this.discoveredRoutes.get(path);
  }
}

/**
 * Factory function to create a navigation crawler instance
 */
export function createNavigationCrawler(page: Page, baseUrl: string = ''): NavigationCrawler {
  return new NavigationCrawler(page, baseUrl);
}

/**
 * Helper function to setup navigation crawler with role-based authentication
 */
export async function setupNavigationCrawlerWithAuth(
  page: Page, 
  role: UserRole,
  baseUrl: string = ''
): Promise<NavigationCrawler> {
  const crawler = new NavigationCrawler(page, baseUrl);
  
  // Navigate to mock user selection based on role
  await page.goto('/auth/mock/select');
  
  // Select appropriate mock user based on role
  const roleButtonMap = {
    [UserRole.DEVELOPER]: /Developer User/i,
    [UserRole.TEAM_LEAD]: /Team Lead User/i,
    [UserRole.ADMINISTRATOR]: /Admin User/i,
  };
  
  const buttonSelector = roleButtonMap[role];
  if (buttonSelector) {
    await page.getByRole('button', { name: buttonSelector }).click();
    await page.waitForURL(/\/dashboard/);
  }
  
  crawler.setUserRole(role);
  return crawler;
}