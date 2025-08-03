/**
 * Component Content Verification System
 * 
 * Validates that components render actual content rather than placeholder text or loading states.
 * Tests charts contain real data elements, not placeholder text (catch "Chart Component Here" issues).
 * Verifies loading states transition to actual content within reasonable timeframes.
 * Adds visual regression testing for component layout and alignment issues.
 * 
 * Requirements: 2.3, 4.2
 */

import { Page, Locator, expect } from '@playwright/test';
import { ErrorDetector } from './error-detector';

export interface ContentVerificationResult {
  componentType: string;
  selector: string;
  hasRealContent: boolean;
  hasPlaceholderText: boolean;
  placeholderTexts: string[];
  loadingStateHandled: boolean;
  loadingTimeout: boolean;
  visualRegressionIssues: VisualIssue[];
  contentElements: ContentElement[];
  timing: {
    initialLoad: number;
    contentReady: number;
    totalTime: number;
  };
  screenshot?: string;
  errorMessage?: string;
  success: boolean;
}

export interface ContentElement {
  type: 'text' | 'chart' | 'image' | 'list' | 'table' | 'form';
  selector: string;
  hasContent: boolean;
  isEmpty: boolean;
  isPlaceholder: boolean;
  content?: string;
}

export interface VisualIssue {
  type: 'layout' | 'alignment' | 'overflow' | 'spacing' | 'sizing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  element: string;
  expectedBehavior: string;
  actualBehavior: string;
}

export interface ComponentVerificationOptions {
  maxLoadingWaitTime?: number;
  captureScreenshots?: boolean;
  checkVisualRegression?: boolean;
  validateChartData?: boolean;
  checkResponsiveLayout?: boolean;
  timeout?: number;
}

/**
 * Component Content Verifier class for validating component content
 */
export class ComponentContentVerifier {
  private page: Page;
  private errorDetector: ErrorDetector;
  private screenshotCounter: number = 0;

  // Common placeholder text patterns to detect
  private readonly PLACEHOLDER_PATTERNS = [
    /Chart Component Here/i,
    /Component Here/i,
    /Loading\.\.\./i,
    /Placeholder/i,
    /TODO:/i,
    /FIXME:/i,
    /Lorem ipsum/i,
    /Sample text/i,
    /Test content/i,
    /Coming soon/i,
    /Under construction/i,
    /\[object Object\]/i,
    /undefined/i,
    /null/i,
    /NaN/i,
    /^$/, // Empty content
    /^\s+$/ // Only whitespace
  ];

  // Chart-specific placeholder patterns
  private readonly CHART_PLACEHOLDER_PATTERNS = [
    /No data available/i,
    /Chart loading/i,
    /Data not found/i,
    /Chart Component Here/i,
    /Visualization placeholder/i
  ];

  constructor(page: Page, errorDetector: ErrorDetector) {
    this.page = page;
    this.errorDetector = errorDetector;
  }

  /**
   * Verify content for all components on the page
   */
  async verifyAllComponents(options: ComponentVerificationOptions = {}): Promise<ContentVerificationResult[]> {
    const {
      maxLoadingWaitTime = 10000,
      captureScreenshots = false,
      checkVisualRegression = true,
      validateChartData = true,
      checkResponsiveLayout = true,
      timeout = 30000
    } = options;

    this.errorDetector.addReproductionStep('Starting comprehensive component content verification');

    const results: ContentVerificationResult[] = [];

    try {
      // Wait for page to be fully loaded
      await this.page.waitForLoadState('networkidle', { timeout });

      // Find and verify different types of components
      const componentSelectors = [
        // Chart components
        '.recharts-surface',
        '.recharts-wrapper',
        '[data-testid*="chart"]',
        '.chart-container',
        'canvas',
        'svg[class*="chart"]',
        
        // Card components
        '.card',
        '[data-testid*="card"]',
        '.dashboard-card',
        '.metric-card',
        
        // List components
        '.list-container',
        '[role="list"]',
        'ul',
        'ol',
        
        // Table components
        'table',
        '.table-container',
        '[role="table"]',
        
        // Form components
        'form',
        '.form-container',
        
        // Generic content containers
        '.content',
        '.main-content',
        '[data-testid*="content"]',
        '.component'
      ];

      for (const selector of componentSelectors) {
        const components = await this.page.locator(selector).all();
        
        for (let i = 0; i < components.length; i++) {
          const component = components[i];
          const result = await this.verifyComponent(component, selector, i, options);
          results.push(result);
        }
      }

      this.errorDetector.addReproductionStep(`Completed component content verification. Found ${results.length} components.`);
      
      return results;
    } catch (error) {
      this.errorDetector.addReproductionStep(`Component content verification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify a single component
   */
  async verifyComponent(
    component: Locator, 
    selector: string, 
    index: number, 
    options: ComponentVerificationOptions
  ): Promise<ContentVerificationResult> {
    const startTime = Date.now();
    
    const result: ContentVerificationResult = {
      componentType: await this.determineComponentType(component),
      selector: `${selector}:nth-child(${index + 1})`,
      hasRealContent: false,
      hasPlaceholderText: false,
      placeholderTexts: [],
      loadingStateHandled: false,
      loadingTimeout: false,
      visualRegressionIssues: [],
      contentElements: [],
      timing: {
        initialLoad: 0,
        contentReady: 0,
        totalTime: 0
      },
      success: true
    };

    try {
      // Check if component is visible
      await expect(component).toBeVisible();
      result.timing.initialLoad = Date.now() - startTime;

      // Wait for loading states to complete
      await this.waitForLoadingCompletion(component, result, options);

      // Verify component content
      await this.verifyComponentContent(component, result);

      // Check for placeholder text
      await this.checkForPlaceholderText(component, result);

      // Validate chart data if it's a chart component
      if (options.validateChartData && this.isChartComponent(result.componentType)) {
        await this.validateChartData(component, result);
      }

      // Check visual regression issues
      if (options.checkVisualRegression) {
        await this.checkVisualRegressionIssues(component, result);
      }

      // Check responsive layout
      if (options.checkResponsiveLayout) {
        await this.checkResponsiveLayout(component, result);
      }

      // Capture screenshot if enabled
      if (options.captureScreenshots) {
        result.screenshot = await this.captureComponentScreenshot(component, `component-${index}`);
      }

      result.timing.contentReady = Date.now() - startTime - result.timing.initialLoad;
      result.timing.totalTime = Date.now() - startTime;

      // Determine overall success
      result.success = result.hasRealContent && !result.hasPlaceholderText && !result.loadingTimeout;

      if (!result.success) {
        this.errorDetector.addReproductionStep(
          `Component verification failed for ${result.selector}: ` +
          `hasRealContent=${result.hasRealContent}, ` +
          `hasPlaceholderText=${result.hasPlaceholderText}, ` +
          `loadingTimeout=${result.loadingTimeout}`
        );
      }

    } catch (error) {
      result.success = false;
      result.errorMessage = error.message;
      this.errorDetector.addReproductionStep(`Component verification error for ${result.selector}: ${error.message}`);
    }

    return result;
  }

  /**
   * Wait for loading states to complete
   */
  private async waitForLoadingCompletion(
    component: Locator, 
    result: ContentVerificationResult, 
    options: ComponentVerificationOptions
  ): Promise<void> {
    const maxWaitTime = options.maxLoadingWaitTime || 10000;
    const startTime = Date.now();

    try {
      // Common loading indicators
      const loadingSelectors = [
        '.loading',
        '.spinner',
        '.skeleton',
        '[data-loading="true"]',
        '.loading-placeholder',
        '.shimmer',
        '[aria-busy="true"]'
      ];

      let hasLoadingIndicator = false;

      // Check if component has loading indicators
      for (const loadingSelector of loadingSelectors) {
        const loadingElement = component.locator(loadingSelector);
        if (await loadingElement.isVisible()) {
          hasLoadingIndicator = true;
          this.errorDetector.addReproductionStep(`Found loading indicator: ${loadingSelector}`);
          
          // Wait for loading to complete
          try {
            await loadingElement.waitFor({ state: 'hidden', timeout: maxWaitTime });
            result.loadingStateHandled = true;
          } catch (timeoutError) {
            result.loadingTimeout = true;
            result.loadingStateHandled = false;
            this.errorDetector.addReproductionStep(
              `Loading state timeout after ${maxWaitTime}ms for ${loadingSelector}`
            );
          }
          break;
        }
      }

      // If no loading indicators found, wait a short time for content to stabilize
      if (!hasLoadingIndicator) {
        await this.page.waitForTimeout(1000);
        result.loadingStateHandled = true;
      }

    } catch (error) {
      this.errorDetector.addReproductionStep(`Loading completion check failed: ${error.message}`);
    }
  }

  /**
   * Verify component has real content
   */
  private async verifyComponentContent(component: Locator, result: ContentVerificationResult): Promise<void> {
    try {
      // Get all text content from the component
      const textContent = await component.textContent() || '';
      const trimmedContent = textContent.trim();

      // Check for various content elements
      result.contentElements = await this.analyzeContentElements(component);

      // Determine if component has real content
      result.hasRealContent = this.hasRealContent(trimmedContent, result.contentElements);

      if (!result.hasRealContent) {
        this.errorDetector.addReproductionStep(
          `Component lacks real content. Text content: "${trimmedContent.substring(0, 100)}..."`
        );
      }

    } catch (error) {
      this.errorDetector.addReproductionStep(`Content verification failed: ${error.message}`);
    }
  }

  /**
   * Analyze content elements within the component
   */
  private async analyzeContentElements(component: Locator): Promise<ContentElement[]> {
    const elements: ContentElement[] = [];

    try {
      // Text elements
      const textElements = await component.locator('p, span, div, h1, h2, h3, h4, h5, h6').all();
      for (const textEl of textElements) {
        const content = await textEl.textContent() || '';
        const selector = await this.getElementSelector(textEl);
        
        elements.push({
          type: 'text',
          selector,
          hasContent: content.trim().length > 0,
          isEmpty: content.trim().length === 0,
          isPlaceholder: this.isPlaceholderText(content),
          content: content.trim()
        });
      }

      // Chart elements
      const chartElements = await component.locator('svg, canvas, .recharts-surface').all();
      for (const chartEl of chartElements) {
        const selector = await this.getElementSelector(chartEl);
        const hasData = await this.checkChartHasData(chartEl);
        
        elements.push({
          type: 'chart',
          selector,
          hasContent: hasData,
          isEmpty: !hasData,
          isPlaceholder: false
        });
      }

      // List elements
      const listElements = await component.locator('ul, ol, [role="list"]').all();
      for (const listEl of listElements) {
        const selector = await this.getElementSelector(listEl);
        const items = await listEl.locator('li, [role="listitem"]').count();
        
        elements.push({
          type: 'list',
          selector,
          hasContent: items > 0,
          isEmpty: items === 0,
          isPlaceholder: false
        });
      }

      // Table elements
      const tableElements = await component.locator('table, [role="table"]').all();
      for (const tableEl of tableElements) {
        const selector = await this.getElementSelector(tableEl);
        const rows = await tableEl.locator('tr, [role="row"]').count();
        
        elements.push({
          type: 'table',
          selector,
          hasContent: rows > 1, // More than just header
          isEmpty: rows <= 1,
          isPlaceholder: false
        });
      }

      // Image elements
      const imageElements = await component.locator('img').all();
      for (const imgEl of imageElements) {
        const selector = await this.getElementSelector(imgEl);
        const src = await imgEl.getAttribute('src') || '';
        
        elements.push({
          type: 'image',
          selector,
          hasContent: src.length > 0 && !src.includes('placeholder'),
          isEmpty: src.length === 0,
          isPlaceholder: src.includes('placeholder') || src.includes('dummy')
        });
      }

    } catch (error) {
      this.errorDetector.addReproductionStep(`Content element analysis failed: ${error.message}`);
    }

    return elements;
  }

  /**
   * Check for placeholder text in component
   */
  private async checkForPlaceholderText(component: Locator, result: ContentVerificationResult): Promise<void> {
    try {
      const textContent = await component.textContent() || '';
      
      for (const pattern of this.PLACEHOLDER_PATTERNS) {
        if (pattern.test(textContent)) {
          result.hasPlaceholderText = true;
          const match = textContent.match(pattern);
          if (match) {
            result.placeholderTexts.push(match[0]);
            this.errorDetector.addReproductionStep(
              `Found placeholder text: "${match[0]}" in component ${result.selector}`
            );
          }
        }
      }

      // Check for chart-specific placeholders if it's a chart
      if (this.isChartComponent(result.componentType)) {
        for (const pattern of this.CHART_PLACEHOLDER_PATTERNS) {
          if (pattern.test(textContent)) {
            result.hasPlaceholderText = true;
            const match = textContent.match(pattern);
            if (match) {
              result.placeholderTexts.push(match[0]);
              this.errorDetector.addReproductionStep(
                `Found chart placeholder text: "${match[0]}" in component ${result.selector}`
              );
            }
          }
        }
      }

    } catch (error) {
      this.errorDetector.addReproductionStep(`Placeholder text check failed: ${error.message}`);
    }
  }

  /**
   * Validate chart data
   */
  private async validateChartData(component: Locator, result: ContentVerificationResult): Promise<void> {
    try {
      const hasData = await this.checkChartHasData(component);
      
      if (!hasData) {
        result.hasRealContent = false;
        this.errorDetector.addReproductionStep(
          `Chart component ${result.selector} appears to have no data or only placeholder data`
        );
      }

      // Check for specific chart elements that indicate real data
      const chartDataSelectors = [
        '.recharts-bar',
        '.recharts-line',
        '.recharts-area',
        '.recharts-pie-sector',
        'path[d]', // SVG paths with data
        'rect[height]', // Bars with height
        'circle[r]' // Data points
      ];

      let hasDataElements = false;
      for (const selector of chartDataSelectors) {
        const elements = await component.locator(selector).count();
        if (elements > 0) {
          hasDataElements = true;
          break;
        }
      }

      if (!hasDataElements) {
        this.errorDetector.addReproductionStep(
          `Chart component ${result.selector} lacks data visualization elements`
        );
      }

    } catch (error) {
      this.errorDetector.addReproductionStep(`Chart data validation failed: ${error.message}`);
    }
  }

  /**
   * Check for visual regression issues
   */
  private async checkVisualRegressionIssues(component: Locator, result: ContentVerificationResult): Promise<void> {
    try {
      const boundingBox = await component.boundingBox();
      
      if (!boundingBox) {
        result.visualRegressionIssues.push({
          type: 'layout',
          severity: 'high',
          description: 'Component has no bounding box (not rendered)',
          element: result.selector,
          expectedBehavior: 'Component should be visible and have dimensions',
          actualBehavior: 'Component has no bounding box'
        });
        return;
      }

      // Check for zero or negative dimensions
      if (boundingBox.width <= 0 || boundingBox.height <= 0) {
        result.visualRegressionIssues.push({
          type: 'sizing',
          severity: 'high',
          description: 'Component has invalid dimensions',
          element: result.selector,
          expectedBehavior: 'Component should have positive width and height',
          actualBehavior: `Width: ${boundingBox.width}, Height: ${boundingBox.height}`
        });
      }

      // Check for overflow issues
      const parentBox = await component.locator('..').boundingBox();
      if (parentBox && boundingBox.width > parentBox.width * 1.1) { // Allow 10% tolerance
        result.visualRegressionIssues.push({
          type: 'overflow',
          severity: 'medium',
          description: 'Component appears to overflow its container',
          element: result.selector,
          expectedBehavior: 'Component should fit within its container',
          actualBehavior: `Component width (${boundingBox.width}) exceeds container width (${parentBox.width})`
        });
      }

      // Check for very small components that might indicate layout issues
      if (boundingBox.width < 10 || boundingBox.height < 10) {
        result.visualRegressionIssues.push({
          type: 'sizing',
          severity: 'medium',
          description: 'Component appears unusually small',
          element: result.selector,
          expectedBehavior: 'Component should have reasonable dimensions',
          actualBehavior: `Very small dimensions: ${boundingBox.width}x${boundingBox.height}`
        });
      }

    } catch (error) {
      this.errorDetector.addReproductionStep(`Visual regression check failed: ${error.message}`);
    }
  }

  /**
   * Check responsive layout
   */
  private async checkResponsiveLayout(component: Locator, result: ContentVerificationResult): Promise<void> {
    try {
      const originalViewport = this.page.viewportSize();
      if (!originalViewport) return;

      // Get original dimensions
      const desktopBox = await component.boundingBox();
      if (!desktopBox) return;

      // Test mobile viewport
      await this.page.setViewportSize({ width: 375, height: 667 });
      await this.page.waitForTimeout(1000);

      const mobileBox = await component.boundingBox();
      if (mobileBox) {
        // Check if component adapts to mobile
        if (mobileBox.width > 375) {
          result.visualRegressionIssues.push({
            type: 'layout',
            severity: 'medium',
            description: 'Component does not adapt to mobile viewport',
            element: result.selector,
            expectedBehavior: 'Component should fit within mobile viewport (375px)',
            actualBehavior: `Component width: ${mobileBox.width}px`
          });
        }

        // Check if component becomes too small on mobile
        if (mobileBox.height < desktopBox.height * 0.3) {
          result.visualRegressionIssues.push({
            type: 'layout',
            severity: 'low',
            description: 'Component becomes very small on mobile',
            element: result.selector,
            expectedBehavior: 'Component should maintain reasonable size on mobile',
            actualBehavior: `Mobile height (${mobileBox.height}) is much smaller than desktop (${desktopBox.height})`
          });
        }
      }

      // Restore original viewport
      await this.page.setViewportSize(originalViewport);
      await this.page.waitForTimeout(500);

    } catch (error) {
      this.errorDetector.addReproductionStep(`Responsive layout check failed: ${error.message}`);
    }
  }

  // Helper methods

  /**
   * Determine component type
   */
  private async determineComponentType(component: Locator): Promise<string> {
    try {
      const className = await component.getAttribute('class') || '';
      const tagName = await component.evaluate(el => el.tagName.toLowerCase());
      const testId = await component.getAttribute('data-testid') || '';

      // Chart components
      if (className.includes('chart') || className.includes('recharts') || 
          testId.includes('chart') || tagName === 'canvas') {
        return 'chart';
      }

      // Card components
      if (className.includes('card') || testId.includes('card')) {
        return 'card';
      }

      // Table components
      if (tagName === 'table' || className.includes('table') || testId.includes('table')) {
        return 'table';
      }

      // List components
      if (tagName === 'ul' || tagName === 'ol' || className.includes('list')) {
        return 'list';
      }

      // Form components
      if (tagName === 'form' || className.includes('form')) {
        return 'form';
      }

      return 'generic';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Check if component type is a chart
   */
  private isChartComponent(componentType: string): boolean {
    return componentType === 'chart';
  }

  /**
   * Check if text is placeholder text
   */
  private isPlaceholderText(text: string): boolean {
    return this.PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text));
  }

  /**
   * Check if component has real content
   */
  private hasRealContent(textContent: string, contentElements: ContentElement[]): boolean {
    // If there's meaningful text content
    if (textContent.length > 10 && !this.isPlaceholderText(textContent)) {
      return true;
    }

    // If there are content elements with real content
    const hasContentElements = contentElements.some(element => 
      element.hasContent && !element.isPlaceholder
    );

    return hasContentElements;
  }

  /**
   * Check if chart has data
   */
  private async checkChartHasData(chart: Locator): Promise<boolean> {
    try {
      // Check for data visualization elements
      const dataSelectors = [
        '.recharts-bar',
        '.recharts-line',
        '.recharts-area',
        '.recharts-pie-sector',
        'path[d*="M"]', // SVG paths with move commands
        'rect[height]:not([height="0"])', // Bars with non-zero height
        'circle[r]:not([r="0"])', // Data points with non-zero radius
        'line[x1][y1][x2][y2]' // Lines with coordinates
      ];

      for (const selector of dataSelectors) {
        const count = await chart.locator(selector).count();
        if (count > 0) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get element selector
   */
  private async getElementSelector(element: Locator): Promise<string> {
    try {
      const testId = await element.getAttribute('data-testid');
      if (testId) return `[data-testid="${testId}"]`;

      const id = await element.getAttribute('id');
      if (id) return `#${id}`;

      const className = await element.getAttribute('class');
      if (className) {
        const firstClass = className.split(' ')[0];
        return `.${firstClass}`;
      }

      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      return tagName;
    } catch {
      return 'unknown-element';
    }
  }

  /**
   * Capture component screenshot
   */
  private async captureComponentScreenshot(component: Locator, prefix: string): Promise<string> {
    try {
      const filename = `${prefix}-${this.screenshotCounter++}.png`;
      const path = `./test-data/error-reports/screenshots/${filename}`;
      await component.screenshot({ path });
      return path;
    } catch (error) {
      this.errorDetector.addReproductionStep(`Screenshot capture failed: ${error.message}`);
      return '';
    }
  }

  /**
   * Get verification summary
   */
  getVerificationSummary(results: ContentVerificationResult[]): {
    totalComponents: number;
    componentsWithRealContent: number;
    componentsWithPlaceholders: number;
    componentsWithLoadingIssues: number;
    componentsWithVisualIssues: number;
    successRate: number;
    componentTypes: { [key: string]: number };
    commonIssues: { [key: string]: number };
  } {
    const totalComponents = results.length;
    const componentsWithRealContent = results.filter(r => r.hasRealContent).length;
    const componentsWithPlaceholders = results.filter(r => r.hasPlaceholderText).length;
    const componentsWithLoadingIssues = results.filter(r => r.loadingTimeout).length;
    const componentsWithVisualIssues = results.filter(r => r.visualRegressionIssues.length > 0).length;
    const successRate = totalComponents > 0 ? (results.filter(r => r.success).length / totalComponents) * 100 : 0;

    const componentTypes: { [key: string]: number } = {};
    const commonIssues: { [key: string]: number } = {};

    results.forEach(result => {
      componentTypes[result.componentType] = (componentTypes[result.componentType] || 0) + 1;
      
      if (result.hasPlaceholderText) {
        result.placeholderTexts.forEach(placeholder => {
          commonIssues[placeholder] = (commonIssues[placeholder] || 0) + 1;
        });
      }
      
      result.visualRegressionIssues.forEach(issue => {
        commonIssues[issue.description] = (commonIssues[issue.description] || 0) + 1;
      });
    });

    return {
      totalComponents,
      componentsWithRealContent,
      componentsWithPlaceholders,
      componentsWithLoadingIssues,
      componentsWithVisualIssues,
      successRate,
      componentTypes,
      commonIssues
    };
  }
}

/**
 * Factory function to create a component content verifier
 */
export function createComponentContentVerifier(page: Page, errorDetector: ErrorDetector): ComponentContentVerifier {
  return new ComponentContentVerifier(page, errorDetector);
}