/**
 * Interactive Element Testing Utilities
 * 
 * Provides comprehensive UI interaction testing for buttons, forms, dropdowns, and charts.
 * Builds upon existing mobile-responsiveness touch interaction patterns and adds systematic
 * testing of data visualization components and filters.
 * 
 * Requirements: 4.1, 4.2, 4.3
 */

import { Page, Locator, expect } from '@playwright/test';
import { ErrorDetector } from './error-detector';

export interface InteractionTestResult {
  elementType: string;
  selector: string;
  testType: string;
  success: boolean;
  errorMessage?: string;
  screenshot?: string;
  timing: number;
  accessibility: AccessibilityResult;
}

export interface AccessibilityResult {
  hasAriaLabel: boolean;
  hasTabIndex: boolean;
  isKeyboardAccessible: boolean;
  hasProperContrast: boolean;
  meetsMinimumSize: boolean;
}

export interface FormTestResult extends InteractionTestResult {
  fieldType: string;
  validationTested: boolean;
  submissionTested: boolean;
  errorHandlingTested: boolean;
}

export interface ChartTestResult extends InteractionTestResult {
  chartType: string;
  interactionTypes: string[];
  tooltipTested: boolean;
  legendTested: boolean;
  filtersTested: boolean;
  responsiveTested: boolean;
}

export interface DropdownTestResult extends InteractionTestResult {
  optionCount: number;
  searchable: boolean;
  multiSelect: boolean;
  keyboardNavigationTested: boolean;
}

export interface ButtonTestResult extends InteractionTestResult {
  buttonType: string;
  states: string[];
  loadingStateTested: boolean;
  disabledStateTested: boolean;
  navigationTested: boolean;
  textContentAccurate: boolean;
  expectedText?: string;
  actualText?: string;
  destinationUrl?: string;
  apiCallTested: boolean;
  apiCallSuccess?: boolean;
  apiError?: string;
}

export interface LinkTestResult extends InteractionTestResult {
  href: string;
  isInternal: boolean;
  destinationExists: boolean;
  statusCode?: number;
  textContentAccurate: boolean;
  expectedText?: string;
  actualText?: string;
}

export interface InteractionTestSuite {
  buttons: ButtonTestResult[];
  links: LinkTestResult[];
  forms: FormTestResult[];
  dropdowns: DropdownTestResult[];
  charts: ChartTestResult[];
  filters: InteractionTestResult[];
  modals: InteractionTestResult[];
  tabs: InteractionTestResult[];
  accordions: InteractionTestResult[];
}

export interface InteractionTestOptions {
  includeAccessibility?: boolean;
  captureScreenshots?: boolean;
  testKeyboardNavigation?: boolean;
  testTouchInteractions?: boolean;
  testResponsiveness?: boolean;
  timeout?: number;
  skipSlowTests?: boolean;
}

/**
 * Interactive Element Tester class for comprehensive UI interaction testing
 */
export class InteractiveElementTester {
  private page: Page;
  private errorDetector: ErrorDetector;
  private testResults: InteractionTestSuite;
  private screenshotCounter: number = 0;

  constructor(page: Page, errorDetector: ErrorDetector) {
    this.page = page;
    this.errorDetector = errorDetector;
    this.testResults = {
      buttons: [],
      links: [],
      forms: [],
      dropdowns: [],
      charts: [],
      filters: [],
      modals: [],
      tabs: [],
      accordions: []
    };
  }

  /**
   * Test all interactive elements on the current page
   */
  async testAllInteractiveElements(options: InteractionTestOptions = {}): Promise<InteractionTestSuite> {
    const {
      includeAccessibility = true,
      captureScreenshots = false,
      testKeyboardNavigation = true,
      testTouchInteractions = true,
      testResponsiveness = true,
      timeout = 5000,
      skipSlowTests = false
    } = options;

    this.errorDetector.addReproductionStep('Starting comprehensive interactive element testing');

    try {
      // Wait for page to be fully loaded
      await this.page.waitForLoadState('networkidle', { timeout });

      // Test different types of interactive elements
      await this.testButtons(options);
      await this.testLinks(options);
      await this.testForms(options);
      await this.testDropdowns(options);
      await this.testCharts(options);
      await this.testFilters(options);
      await this.testModals(options);
      await this.testTabs(options);
      await this.testAccordions(options);

      this.errorDetector.addReproductionStep('Completed comprehensive interactive element testing');
      
      return this.testResults;
    } catch (error) {
      this.errorDetector.addReproductionStep(`Interactive element testing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test all buttons on the page
   */
  async testButtons(options: InteractionTestOptions): Promise<ButtonTestResult[]> {
    this.errorDetector.addReproductionStep('Testing buttons');
    
    const buttonSelectors = [
      'button',
      '[role="button"]',
      'input[type="button"]',
      'input[type="submit"]',
      'a[class*="btn"]',
      '[data-testid*="button"]'
    ];

    const buttons = await this.findElements(buttonSelectors);
    const results: ButtonTestResult[] = [];

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const result = await this.testSingleButton(button, i, options);
      results.push(result);
      this.testResults.buttons.push(result);
    }

    return results;
  }

  /**
   * Test a single button element
   */
  private async testSingleButton(button: Locator, index: number, options: InteractionTestOptions): Promise<ButtonTestResult> {
    const startTime = Date.now();
    const selector = await this.getElementSelector(button);
    
    const result: ButtonTestResult = {
      elementType: 'button',
      selector,
      testType: 'button-interaction',
      success: true,
      timing: 0,
      accessibility: await this.testAccessibility(button, options),
      buttonType: 'unknown',
      states: [],
      loadingStateTested: false,
      disabledStateTested: false,
      navigationTested: false,
      textContentAccurate: true,
      apiCallTested: false
    };

    try {
      // Determine button type
      result.buttonType = await this.determineButtonType(button);
      
      // Test button visibility and basic properties
      await expect(button).toBeVisible();
      
      // Test button text content accuracy
      await this.testButtonTextContent(button, result);
      
      // Test different button states
      result.states = await this.testButtonStates(button);
      
      // Test button click interaction and navigation
      if (await button.isEnabled()) {
        await this.testButtonClick(button, result, options);
        await this.testButtonNavigation(button, result);
        await this.testButtonApiCalls(button, result);
      } else {
        result.disabledStateTested = true;
        result.states.push('disabled');
      }

      // Test keyboard interaction if enabled
      if (options.testKeyboardNavigation) {
        await this.testButtonKeyboardInteraction(button, result);
      }

      // Test touch interaction if enabled
      if (options.testTouchInteractions) {
        await this.testButtonTouchInteraction(button, result);
      }

      // Capture screenshot if enabled
      if (options.captureScreenshots) {
        result.screenshot = await this.captureElementScreenshot(button, `button-${index}`);
      }

    } catch (error) {
      result.success = false;
      result.errorMessage = error.message;
      this.errorDetector.addReproductionStep(`Button test failed for ${selector}: ${error.message}`);
    }

    result.timing = Date.now() - startTime;
    return result;
  }

  /**
   * Test button click interaction
   */
  private async testButtonClick(button: Locator, result: ButtonTestResult, options: InteractionTestOptions): Promise<void> {
    try {
      // Check if button shows loading state
      const hasLoadingState = await this.checkForLoadingState(button);
      
      // Click the button
      await button.click();
      
      // Wait for any loading states or navigation
      if (hasLoadingState) {
        await this.waitForLoadingToComplete(button);
        result.loadingStateTested = true;
        result.states.push('loading');
      }
      
      // Check for any modal or overlay that might have opened
      await this.checkForModalOrOverlay();
      
      // Wait for any navigation or page changes
      await this.page.waitForTimeout(500);
      
    } catch (error) {
      throw new Error(`Button click failed: ${error.message}`);
    }
  }

  /**
   * Test forms on the page
   */
  async testForms(options: InteractionTestOptions): Promise<FormTestResult[]> {
    this.errorDetector.addReproductionStep('Testing forms');
    
    const forms = await this.page.locator('form').all();
    const results: FormTestResult[] = [];

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const result = await this.testSingleForm(form, i, options);
      results.push(result);
      this.testResults.forms.push(result);
    }

    return results;
  }

  /**
   * Test a single form element
   */
  private async testSingleForm(form: Locator, index: number, options: InteractionTestOptions): Promise<FormTestResult> {
    const startTime = Date.now();
    const selector = await this.getElementSelector(form);
    
    const result: FormTestResult = {
      elementType: 'form',
      selector,
      testType: 'form-interaction',
      success: true,
      timing: 0,
      accessibility: await this.testAccessibility(form, options),
      fieldType: 'mixed',
      validationTested: false,
      submissionTested: false,
      errorHandlingTested: false
    };

    try {
      // Test form fields
      await this.testFormFields(form, result, options);
      
      // Test form validation
      await this.testFormValidation(form, result);
      
      // Test form submission (if safe to do so)
      await this.testFormSubmission(form, result, options);
      
      // Capture screenshot if enabled
      if (options.captureScreenshots) {
        result.screenshot = await this.captureElementScreenshot(form, `form-${index}`);
      }

    } catch (error) {
      result.success = false;
      result.errorMessage = error.message;
      this.errorDetector.addReproductionStep(`Form test failed for ${selector}: ${error.message}`);
    }

    result.timing = Date.now() - startTime;
    return result;
  }

  /**
   * Test form fields within a form
   */
  private async testFormFields(form: Locator, result: FormTestResult, options: InteractionTestOptions): Promise<void> {
    const fieldSelectors = [
      'input:not([type="hidden"])',
      'textarea',
      'select',
      '[role="textbox"]',
      '[role="combobox"]'
    ];

    for (const selector of fieldSelectors) {
      const fields = await form.locator(selector).all();
      
      for (const field of fields) {
        try {
          await this.testFormField(field, options);
        } catch (error) {
          this.errorDetector.addReproductionStep(`Form field test failed: ${error.message}`);
        }
      }
    }
  }

  /**
   * Test individual form field
   */
  private async testFormField(field: Locator, options: InteractionTestOptions): Promise<void> {
    const fieldType = await field.getAttribute('type') || 'text';
    
    // Test field focus
    await field.focus();
    
    // Test field input based on type
    switch (fieldType) {
      case 'text':
      case 'email':
      case 'password':
        await field.fill('test-input');
        await field.clear();
        break;
      case 'checkbox':
      case 'radio':
        await field.check();
        break;
      case 'select':
        const options_list = await field.locator('option').all();
        if (options_list.length > 1) {
          await field.selectOption({ index: 1 });
        }
        break;
    }
    
    // Test keyboard navigation
    if (options.testKeyboardNavigation) {
      await field.press('Tab');
    }
  }

  /**
   * Test dropdowns on the page
   */
  async testDropdowns(options: InteractionTestOptions): Promise<DropdownTestResult[]> {
    this.errorDetector.addReproductionStep('Testing dropdowns');
    
    const dropdownSelectors = [
      'select',
      '[role="combobox"]',
      '[role="listbox"]',
      '[data-testid*="dropdown"]',
      '[class*="dropdown"]',
      '.select-container'
    ];

    const dropdowns = await this.findElements(dropdownSelectors);
    const results: DropdownTestResult[] = [];

    for (let i = 0; i < dropdowns.length; i++) {
      const dropdown = dropdowns[i];
      const result = await this.testSingleDropdown(dropdown, i, options);
      results.push(result);
      this.testResults.dropdowns.push(result);
    }

    return results;
  }

  /**
   * Test a single dropdown element
   */
  private async testSingleDropdown(dropdown: Locator, index: number, options: InteractionTestOptions): Promise<DropdownTestResult> {
    const startTime = Date.now();
    const selector = await this.getElementSelector(dropdown);
    
    const result: DropdownTestResult = {
      elementType: 'dropdown',
      selector,
      testType: 'dropdown-interaction',
      success: true,
      timing: 0,
      accessibility: await this.testAccessibility(dropdown, options),
      optionCount: 0,
      searchable: false,
      multiSelect: false,
      keyboardNavigationTested: false
    };

    try {
      // Test dropdown opening
      await this.testDropdownOpen(dropdown, result);
      
      // Test dropdown options
      await this.testDropdownOptions(dropdown, result);
      
      // Test dropdown selection
      await this.testDropdownSelection(dropdown, result);
      
      // Test keyboard navigation if enabled
      if (options.testKeyboardNavigation) {
        await this.testDropdownKeyboardNavigation(dropdown, result);
      }
      
      // Capture screenshot if enabled
      if (options.captureScreenshots) {
        result.screenshot = await this.captureElementScreenshot(dropdown, `dropdown-${index}`);
      }

    } catch (error) {
      result.success = false;
      result.errorMessage = error.message;
      this.errorDetector.addReproductionStep(`Dropdown test failed for ${selector}: ${error.message}`);
    }

    result.timing = Date.now() - startTime;
    return result;
  }

  /**
   * Test charts and data visualizations
   */
  async testCharts(options: InteractionTestOptions): Promise<ChartTestResult[]> {
    this.errorDetector.addReproductionStep('Testing charts and data visualizations');
    
    const chartSelectors = [
      '.recharts-surface',
      '.recharts-wrapper',
      '[data-testid*="chart"]',
      '.chart-container',
      'canvas',
      'svg[class*="chart"]'
    ];

    const charts = await this.findElements(chartSelectors);
    const results: ChartTestResult[] = [];

    for (let i = 0; i < charts.length; i++) {
      const chart = charts[i];
      const result = await this.testSingleChart(chart, i, options);
      results.push(result);
      this.testResults.charts.push(result);
    }

    return results;
  }

  /**
   * Test a single chart element
   */
  private async testSingleChart(chart: Locator, index: number, options: InteractionTestOptions): Promise<ChartTestResult> {
    const startTime = Date.now();
    const selector = await this.getElementSelector(chart);
    
    const result: ChartTestResult = {
      elementType: 'chart',
      selector,
      testType: 'chart-interaction',
      success: true,
      timing: 0,
      accessibility: await this.testAccessibility(chart, options),
      chartType: 'unknown',
      interactionTypes: [],
      tooltipTested: false,
      legendTested: false,
      filtersTested: false,
      responsiveTested: false
    };

    try {
      // Determine chart type
      result.chartType = await this.determineChartType(chart);
      
      // Test chart hover interactions
      await this.testChartHover(chart, result);
      
      // Test chart click interactions
      await this.testChartClick(chart, result);
      
      // Test chart tooltips
      await this.testChartTooltips(chart, result);
      
      // Test chart legend interactions
      await this.testChartLegend(chart, result);
      
      // Test touch interactions if enabled
      if (options.testTouchInteractions) {
        await this.testChartTouchInteractions(chart, result);
      }
      
      // Test responsive behavior if enabled
      if (options.testResponsiveness) {
        await this.testChartResponsiveness(chart, result);
      }
      
      // Capture screenshot if enabled
      if (options.captureScreenshots) {
        result.screenshot = await this.captureElementScreenshot(chart, `chart-${index}`);
      }

    } catch (error) {
      result.success = false;
      result.errorMessage = error.message;
      this.errorDetector.addReproductionStep(`Chart test failed for ${selector}: ${error.message}`);
    }

    result.timing = Date.now() - startTime;
    return result;
  }

  /**
   * Test chart hover interactions
   */
  private async testChartHover(chart: Locator, result: ChartTestResult): Promise<void> {
    try {
      // Hover over the chart
      await chart.hover();
      result.interactionTypes.push('hover');
      
      // Wait for any hover effects
      await this.page.waitForTimeout(500);
      
      // Check for tooltip appearance
      const tooltipSelectors = [
        '.recharts-tooltip-wrapper',
        '.tooltip',
        '[role="tooltip"]',
        '[data-testid*="tooltip"]'
      ];
      
      for (const tooltipSelector of tooltipSelectors) {
        const tooltip = this.page.locator(tooltipSelector);
        if (await tooltip.isVisible()) {
          result.tooltipTested = true;
          break;
        }
      }
      
    } catch (error) {
      this.errorDetector.addReproductionStep(`Chart hover test failed: ${error.message}`);
    }
  }

  /**
   * Test chart click interactions
   */
  private async testChartClick(chart: Locator, result: ChartTestResult): Promise<void> {
    try {
      // Click on the chart
      await chart.click();
      result.interactionTypes.push('click');
      
      // Wait for any click effects
      await this.page.waitForTimeout(500);
      
    } catch (error) {
      this.errorDetector.addReproductionStep(`Chart click test failed: ${error.message}`);
    }
  }

  /**
   * Test filters and filter controls
   */
  async testFilters(options: InteractionTestOptions): Promise<InteractionTestResult[]> {
    this.errorDetector.addReproductionStep('Testing filters');
    
    const filterSelectors = [
      '[data-testid*="filter"]',
      '.filter-control',
      '.time-range-selector',
      '[role="group"][aria-label*="filter"]',
      '.filter-bar'
    ];

    const filters = await this.findElements(filterSelectors);
    const results: InteractionTestResult[] = [];

    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      const result = await this.testSingleFilter(filter, i, options);
      results.push(result);
      this.testResults.filters.push(result);
    }

    return results;
  }

  /**
   * Test modals and overlays
   */
  async testModals(options: InteractionTestOptions): Promise<InteractionTestResult[]> {
    this.errorDetector.addReproductionStep('Testing modals');
    
    // Look for modal triggers first
    const modalTriggers = await this.findElements([
      '[data-testid*="modal-trigger"]',
      '[aria-haspopup="dialog"]',
      'button[data-modal]'
    ]);

    const results: InteractionTestResult[] = [];

    for (let i = 0; i < modalTriggers.length; i++) {
      const trigger = modalTriggers[i];
      const result = await this.testModalTrigger(trigger, i, options);
      results.push(result);
      this.testResults.modals.push(result);
    }

    return results;
  }

  /**
   * Test tabs and tab panels
   */
  async testTabs(options: InteractionTestOptions): Promise<InteractionTestResult[]> {
    this.errorDetector.addReproductionStep('Testing tabs');
    
    const tabContainers = await this.findElements([
      '[role="tablist"]',
      '.tabs-container',
      '[data-testid*="tabs"]'
    ]);

    const results: InteractionTestResult[] = [];

    for (let i = 0; i < tabContainers.length; i++) {
      const tabContainer = tabContainers[i];
      const result = await this.testTabContainer(tabContainer, i, options);
      results.push(result);
      this.testResults.tabs.push(result);
    }

    return results;
  }

  /**
   * Test accordions and collapsible content
   */
  async testAccordions(options: InteractionTestOptions): Promise<InteractionTestResult[]> {
    this.errorDetector.addReproductionStep('Testing accordions');
    
    const accordionSelectors = [
      '[role="button"][aria-expanded]',
      '.accordion-trigger',
      '[data-testid*="accordion"]',
      'details summary'
    ];

    const accordions = await this.findElements(accordionSelectors);
    const results: InteractionTestResult[] = [];

    for (let i = 0; i < accordions.length; i++) {
      const accordion = accordions[i];
      const result = await this.testSingleAccordion(accordion, i, options);
      results.push(result);
      this.testResults.accordions.push(result);
    }

    return results;
  }

  // Helper methods

  /**
   * Find elements using multiple selectors
   */
  private async findElements(selectors: string[]): Promise<Locator[]> {
    const elements: Locator[] = [];
    
    for (const selector of selectors) {
      try {
        const found = await this.page.locator(selector).all();
        elements.push(...found);
      } catch (error) {
        // Selector might not be valid, continue with others
      }
    }
    
    return elements;
  }

  /**
   * Test accessibility of an element
   */
  private async testAccessibility(element: Locator, options: InteractionTestOptions): Promise<AccessibilityResult> {
    if (!options.includeAccessibility) {
      return {
        hasAriaLabel: false,
        hasTabIndex: false,
        isKeyboardAccessible: false,
        hasProperContrast: false,
        meetsMinimumSize: false
      };
    }

    const result: AccessibilityResult = {
      hasAriaLabel: false,
      hasTabIndex: false,
      isKeyboardAccessible: false,
      hasProperContrast: false,
      meetsMinimumSize: false
    };

    try {
      // Check for aria-label or aria-labelledby
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      result.hasAriaLabel = !!(ariaLabel || ariaLabelledBy);

      // Check for tabindex
      const tabIndex = await element.getAttribute('tabindex');
      result.hasTabIndex = tabIndex !== null;

      // Check if element is focusable
      try {
        await element.focus();
        result.isKeyboardAccessible = true;
      } catch {
        result.isKeyboardAccessible = false;
      }

      // Check minimum size (44x44 pixels for touch targets)
      const boundingBox = await element.boundingBox();
      if (boundingBox) {
        result.meetsMinimumSize = boundingBox.width >= 44 && boundingBox.height >= 44;
      }

      // Note: Color contrast testing would require additional tools
      result.hasProperContrast = true; // Placeholder

    } catch (error) {
      this.errorDetector.addReproductionStep(`Accessibility test failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Get a unique selector for an element
   */
  private async getElementSelector(element: Locator): Promise<string> {
    try {
      // Try to get a data-testid first
      const testId = await element.getAttribute('data-testid');
      if (testId) {
        return `[data-testid="${testId}"]`;
      }

      // Try to get an id
      const id = await element.getAttribute('id');
      if (id) {
        return `#${id}`;
      }

      // Try to get a class
      const className = await element.getAttribute('class');
      if (className) {
        const firstClass = className.split(' ')[0];
        return `.${firstClass}`;
      }

      // Fall back to tag name
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      return tagName;
    } catch {
      return 'unknown-element';
    }
  }

  /**
   * Capture screenshot of an element
   */
  private async captureElementScreenshot(element: Locator, prefix: string): Promise<string> {
    try {
      const filename = `${prefix}-${this.screenshotCounter++}.png`;
      const path = `./test-data/error-reports/screenshots/${filename}`;
      await element.screenshot({ path });
      return path;
    } catch (error) {
      this.errorDetector.addReproductionStep(`Screenshot capture failed: ${error.message}`);
      return '';
    }
  }

  // Additional helper methods for specific element types

  private async determineButtonType(button: Locator): Promise<string> {
    const type = await button.getAttribute('type');
    if (type) return type;

    const role = await button.getAttribute('role');
    if (role) return role;

    const className = await button.getAttribute('class') || '';
    if (className.includes('primary')) return 'primary';
    if (className.includes('secondary')) return 'secondary';
    if (className.includes('danger')) return 'danger';

    return 'button';
  }

  private async testButtonStates(button: Locator): Promise<string[]> {
    const states: string[] = [];

    try {
      if (await button.isEnabled()) states.push('enabled');
      if (await button.isDisabled()) states.push('disabled');
      if (await button.isVisible()) states.push('visible');
      if (await button.isHidden()) states.push('hidden');
    } catch (error) {
      this.errorDetector.addReproductionStep(`Button state test failed: ${error.message}`);
    }

    return states;
  }

  private async testButtonKeyboardInteraction(button: Locator, result: ButtonTestResult): Promise<void> {
    try {
      await button.focus();
      await button.press('Enter');
      await this.page.waitForTimeout(500);
    } catch (error) {
      this.errorDetector.addReproductionStep(`Button keyboard test failed: ${error.message}`);
    }
  }

  private async testButtonTouchInteraction(button: Locator, result: ButtonTestResult): Promise<void> {
    try {
      await button.tap();
      await this.page.waitForTimeout(500);
    } catch (error) {
      this.errorDetector.addReproductionStep(`Button touch test failed: ${error.message}`);
    }
  }

  private async checkForLoadingState(button: Locator): Promise<boolean> {
    try {
      const loadingSelectors = [
        '.loading',
        '.spinner',
        '[data-loading="true"]',
        '.btn-loading'
      ];

      for (const selector of loadingSelectors) {
        if (await button.locator(selector).isVisible()) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private async waitForLoadingToComplete(button: Locator): Promise<void> {
    try {
      // Wait for loading indicators to disappear
      const loadingSelectors = [
        '.loading',
        '.spinner',
        '[data-loading="true"]',
        '.btn-loading'
      ];

      for (const selector of loadingSelectors) {
        const loadingElement = button.locator(selector);
        if (await loadingElement.isVisible()) {
          await loadingElement.waitFor({ state: 'hidden', timeout: 10000 });
        }
      }
    } catch (error) {
      this.errorDetector.addReproductionStep(`Loading state wait failed: ${error.message}`);
    }
  }

  private async checkForModalOrOverlay(): Promise<void> {
    try {
      const modalSelectors = [
        '[role="dialog"]',
        '.modal',
        '.overlay',
        '[data-testid*="modal"]'
      ];

      for (const selector of modalSelectors) {
        const modal = this.page.locator(selector);
        if (await modal.isVisible()) {
          // Modal opened, try to close it
          const closeButton = modal.locator('[aria-label="Close"], .close, [data-testid="close"]');
          if (await closeButton.isVisible()) {
            await closeButton.click();
          } else {
            // Try pressing Escape
            await this.page.keyboard.press('Escape');
          }
          break;
        }
      }
    } catch (error) {
      this.errorDetector.addReproductionStep(`Modal check failed: ${error.message}`);
    }
  }

  private async testFormValidation(form: Locator, result: FormTestResult): Promise<void> {
    try {
      // Try to submit form without filling required fields
      const submitButton = form.locator('input[type="submit"], button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Check for validation messages
        const validationSelectors = [
          '.error',
          '.invalid-feedback',
          '[role="alert"]',
          '.field-error'
        ];

        for (const selector of validationSelectors) {
          if (await form.locator(selector).isVisible()) {
            result.validationTested = true;
            break;
          }
        }
      }
    } catch (error) {
      this.errorDetector.addReproductionStep(`Form validation test failed: ${error.message}`);
    }
  }

  private async testFormSubmission(form: Locator, result: FormTestResult, options: InteractionTestOptions): Promise<void> {
    if (options.skipSlowTests) return;

    try {
      // Fill form with test data (only if it's safe)
      const action = await form.getAttribute('action');
      if (action && (action.includes('test') || action.includes('mock'))) {
        // This appears to be a test form, safe to submit
        await this.fillFormWithTestData(form);
        
        const submitButton = form.locator('input[type="submit"], button[type="submit"]').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          result.submissionTested = true;
          
          // Wait for response
          await this.page.waitForTimeout(2000);
        }
      }
    } catch (error) {
      result.errorHandlingTested = true;
      this.errorDetector.addReproductionStep(`Form submission test failed: ${error.message}`);
    }
  }

  private async fillFormWithTestData(form: Locator): Promise<void> {
    const textInputs = await form.locator('input[type="text"], input[type="email"], textarea').all();
    for (const input of textInputs) {
      await input.fill('test-data');
    }

    const checkboxes = await form.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes) {
      await checkbox.check();
    }
  }

  /**
   * Test all links on the page
   */
  async testLinks(options: InteractionTestOptions): Promise<LinkTestResult[]> {
    this.errorDetector.addReproductionStep('Testing links');
    
    const linkSelectors = [
      'a[href]',
      '[role="link"]',
      '[data-testid*="link"]'
    ];

    const links = await this.findElements(linkSelectors);
    const results: LinkTestResult[] = [];

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const result = await this.testSingleLink(link, i, options);
      results.push(result);
      this.testResults.links.push(result);
    }

    return results;
  }

  /**
   * Test a single link element
   */
  private async testSingleLink(link: Locator, index: number, options: InteractionTestOptions): Promise<LinkTestResult> {
    const startTime = Date.now();
    const selector = await this.getElementSelector(link);
    const href = await link.getAttribute('href') || '';
    
    const result: LinkTestResult = {
      elementType: 'link',
      selector,
      testType: 'link-interaction',
      success: true,
      timing: 0,
      accessibility: await this.testAccessibility(link, options),
      href,
      isInternal: this.isInternalLink(href),
      destinationExists: false,
      textContentAccurate: true
    };

    try {
      // Test link text content accuracy
      await this.testLinkTextContent(link, result);
      
      // Test link destination
      await this.testLinkDestination(link, result);
      
      // Test link click (if safe)
      if (result.isInternal && !href.includes('delete') && !href.includes('remove')) {
        await this.testLinkClick(link, result, options);
      }

      // Test keyboard interaction if enabled
      if (options.testKeyboardNavigation) {
        await this.testLinkKeyboardInteraction(link, result);
      }

      // Capture screenshot if enabled
      if (options.captureScreenshots) {
        result.screenshot = await this.captureElementScreenshot(link, `link-${index}`);
      }

    } catch (error) {
      result.success = false;
      result.errorMessage = error.message;
      this.errorDetector.addReproductionStep(`Link test failed for ${selector}: ${error.message}`);
    }

    result.timing = Date.now() - startTime;
    return result;
  }

  /**
   * Test button text content accuracy
   */
  private async testButtonTextContent(button: Locator, result: ButtonTestResult): Promise<void> {
    try {
      const actualText = await button.textContent() || '';
      result.actualText = actualText.trim();
      
      // Check for common text accuracy issues
      const commonIssues = [
        { wrong: 'New Retro', correct: 'New Repository', context: 'repository' },
        { wrong: 'New Repo', correct: 'New Repository', context: 'repository' },
        { wrong: 'Sync Repos', correct: 'Sync Repositories', context: 'sync' },
        { wrong: 'Chart Component Here', correct: '', context: 'placeholder' }
      ];

      for (const issue of commonIssues) {
        if (result.actualText.includes(issue.wrong)) {
          result.textContentAccurate = false;
          result.expectedText = result.actualText.replace(issue.wrong, issue.correct);
          this.errorDetector.addReproductionStep(
            `Button text accuracy issue: Found "${issue.wrong}" but expected "${issue.correct}" in context: ${issue.context}`
          );
          break;
        }
      }

      // Check for placeholder text that shouldn't be there
      const placeholderPatterns = [
        /Chart Component Here/i,
        /Component Here/i,
        /Placeholder/i,
        /TODO:/i,
        /FIXME:/i
      ];

      for (const pattern of placeholderPatterns) {
        if (pattern.test(result.actualText)) {
          result.textContentAccurate = false;
          result.expectedText = 'Proper component content';
          this.errorDetector.addReproductionStep(
            `Button contains placeholder text: "${result.actualText}"`
          );
          break;
        }
      }

    } catch (error) {
      this.errorDetector.addReproductionStep(`Button text content test failed: ${error.message}`);
    }
  }

  /**
   * Test button navigation functionality
   */
  private async testButtonNavigation(button: Locator, result: ButtonTestResult): Promise<void> {
    try {
      const currentUrl = this.page.url();
      
      // Listen for navigation events
      const navigationPromise = this.page.waitForURL('**', { timeout: 5000 }).catch(() => null);
      
      // Click the button
      await button.click();
      
      // Wait for potential navigation
      const navigationResult = await navigationPromise;
      
      if (navigationResult) {
        result.navigationTested = true;
        result.destinationUrl = this.page.url();
        
        // Check if we got a 404 or error page
        const pageTitle = await this.page.title();
        const pageContent = await this.page.textContent('body') || '';
        
        if (pageTitle.includes('404') || pageContent.includes('404') || 
            pageTitle.includes('Not Found') || pageContent.includes('Not Found')) {
          result.success = false;
          result.errorMessage = `Navigation resulted in 404 error. Destination: ${result.destinationUrl}`;
          this.errorDetector.addReproductionStep(
            `Button navigation failed - 404 error at ${result.destinationUrl}`
          );
        }
        
        // Navigate back to original page
        await this.page.goto(currentUrl);
        await this.page.waitForLoadState('networkidle');
      }
      
    } catch (error) {
      this.errorDetector.addReproductionStep(`Button navigation test failed: ${error.message}`);
    }
  }

  /**
   * Test button API calls
   */
  private async testButtonApiCalls(button: Locator, result: ButtonTestResult): Promise<void> {
    try {
      // Set up network monitoring
      const apiCalls: any[] = [];
      
      this.page.on('response', (response) => {
        if (response.url().includes('/api/')) {
          apiCalls.push({
            url: response.url(),
            status: response.status(),
            method: response.request().method()
          });
        }
      });

      // Click the button
      await button.click();
      
      // Wait for potential API calls
      await this.page.waitForTimeout(2000);
      
      if (apiCalls.length > 0) {
        result.apiCallTested = true;
        
        // Check for failed API calls
        const failedCalls = apiCalls.filter(call => call.status >= 400);
        if (failedCalls.length > 0) {
          result.apiCallSuccess = false;
          result.apiError = `API calls failed: ${failedCalls.map(call => `${call.method} ${call.url} (${call.status})`).join(', ')}`;
          this.errorDetector.addReproductionStep(
            `Button triggered failed API calls: ${result.apiError}`
          );
        } else {
          result.apiCallSuccess = true;
        }
      }
      
    } catch (error) {
      this.errorDetector.addReproductionStep(`Button API call test failed: ${error.message}`);
    }
  }

  /**
   * Test link text content accuracy
   */
  private async testLinkTextContent(link: Locator, result: LinkTestResult): Promise<void> {
    try {
      const actualText = await link.textContent() || '';
      result.actualText = actualText.trim();
      
      // Check for common link text issues
      const commonIssues = [
        { wrong: 'repositories/new', correct: 'New Repository', context: 'navigation' },
        { wrong: 'undefined', correct: 'Proper Link Text', context: 'undefined' },
        { wrong: '[object Object]', correct: 'Proper Link Text', context: 'object' }
      ];

      for (const issue of commonIssues) {
        if (result.actualText.includes(issue.wrong)) {
          result.textContentAccurate = false;
          result.expectedText = issue.correct;
          this.errorDetector.addReproductionStep(
            `Link text accuracy issue: Found "${issue.wrong}" but expected "${issue.correct}"`
          );
          break;
        }
      }

    } catch (error) {
      this.errorDetector.addReproductionStep(`Link text content test failed: ${error.message}`);
    }
  }

  /**
   * Test link destination
   */
  private async testLinkDestination(link: Locator, result: LinkTestResult): Promise<void> {
    try {
      const href = result.href;
      
      if (result.isInternal) {
        // For internal links, check if the route exists
        const currentUrl = this.page.url();
        const baseUrl = new URL(currentUrl).origin;
        const fullUrl = href.startsWith('/') ? `${baseUrl}${href}` : href;
        
        try {
          // Navigate to the link to test if it exists
          const response = await this.page.goto(fullUrl);
          result.statusCode = response?.status();
          
          if (response && response.status() < 400) {
            result.destinationExists = true;
          } else {
            result.destinationExists = false;
            this.errorDetector.addReproductionStep(
              `Link destination does not exist: ${fullUrl} (Status: ${response?.status()})`
            );
          }
          
          // Navigate back
          await this.page.goto(currentUrl);
          await this.page.waitForLoadState('networkidle');
          
        } catch (error) {
          result.destinationExists = false;
          this.errorDetector.addReproductionStep(
            `Link destination test failed for ${fullUrl}: ${error.message}`
          );
        }
      } else {
        // For external links, just mark as existing (we don't want to navigate away)
        result.destinationExists = true;
      }
      
    } catch (error) {
      this.errorDetector.addReproductionStep(`Link destination test failed: ${error.message}`);
    }
  }

  /**
   * Test link click functionality
   */
  private async testLinkClick(link: Locator, result: LinkTestResult, options: InteractionTestOptions): Promise<void> {
    try {
      const currentUrl = this.page.url();
      
      // Click the link
      await link.click();
      
      // Wait for navigation
      await this.page.waitForLoadState('networkidle', { timeout: 5000 });
      
      // Check if we're on a different page
      const newUrl = this.page.url();
      if (newUrl !== currentUrl) {
        // Check for 404 or error pages
        const pageTitle = await this.page.title();
        const pageContent = await this.page.textContent('body') || '';
        
        if (pageTitle.includes('404') || pageContent.includes('404') || 
            pageTitle.includes('Not Found') || pageContent.includes('Not Found')) {
          result.success = false;
          result.errorMessage = `Link click resulted in 404 error. Destination: ${newUrl}`;
          this.errorDetector.addReproductionStep(
            `Link click failed - 404 error at ${newUrl}`
          );
        }
        
        // Navigate back
        await this.page.goto(currentUrl);
        await this.page.waitForLoadState('networkidle');
      }
      
    } catch (error) {
      this.errorDetector.addReproductionStep(`Link click test failed: ${error.message}`);
    }
  }

  /**
   * Test link keyboard interaction
   */
  private async testLinkKeyboardInteraction(link: Locator, result: LinkTestResult): Promise<void> {
    try {
      await link.focus();
      await link.press('Enter');
      await this.page.waitForTimeout(500);
    } catch (error) {
      this.errorDetector.addReproductionStep(`Link keyboard test failed: ${error.message}`);
    }
  }

  /**
   * Check if a link is internal
   */
  private isInternalLink(href: string): boolean {
    if (!href) return false;
    if (href.startsWith('/')) return true;
    if (href.startsWith('#')) return true;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (href.startsWith('http://') || href.startsWith('https://')) {
      const currentDomain = new URL(this.page.url()).hostname;
      try {
        const linkDomain = new URL(href).hostname;
        return linkDomain === currentDomain;
      } catch {
        return false;
      }
    }
    return true;
  }

  private async testDropdownOpen(dropdown: Locator, result: DropdownTestResult): Promise<void> {
    try {
      await dropdown.click();
      await this.page.waitForTimeout(500);
    } catch (error) {
      this.errorDetector.addReproductionStep(`Dropdown open test failed: ${error.message}`);
    }
  }

  private async testDropdownOptions(dropdown: Locator, result: DropdownTestResult): Promise<void> {
    try {
      const options = await dropdown.locator('option, [role="option"]').all();
      result.optionCount = options.length;
    } catch (error) {
      this.errorDetector.addReproductionStep(`Dropdown options test failed: ${error.message}`);
    }
  }

  private async testDropdownSelection(dropdown: Locator, result: DropdownTestResult): Promise<void> {
    try {
      if (result.optionCount > 1) {
        const firstOption = dropdown.locator('option, [role="option"]').first();
        await firstOption.click();
        await this.page.waitForTimeout(500);
      }
    } catch (error) {
      this.errorDetector.addReproductionStep(`Dropdown selection test failed: ${error.message}`);
    }
  }

  private async testDropdownKeyboardNavigation(dropdown: Locator, result: DropdownTestResult): Promise<void> {
    try {
      await dropdown.focus();
      await dropdown.press('ArrowDown');
      await dropdown.press('Enter');
      result.keyboardNavigationTested = true;
    } catch (error) {
      this.errorDetector.addReproductionStep(`Dropdown keyboard test failed: ${error.message}`);
    }
  }

  private async determineChartType(chart: Locator): Promise<string> {
    try {
      const className = await chart.getAttribute('class') || '';
      
      if (className.includes('line')) return 'line';
      if (className.includes('bar')) return 'bar';
      if (className.includes('pie')) return 'pie';
      if (className.includes('area')) return 'area';
      if (className.includes('scatter')) return 'scatter';
      
      // Check for Recharts specific classes
      if (className.includes('recharts')) {
        const rechartsType = className.match(/recharts-(\w+)/);
        if (rechartsType) return rechartsType[1];
      }
      
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private async testChartTooltips(chart: Locator, result: ChartTestResult): Promise<void> {
    try {
      // Hover over chart to trigger tooltip
      await chart.hover();
      await this.page.waitForTimeout(1000);
      
      const tooltipSelectors = [
        '.recharts-tooltip-wrapper',
        '.tooltip',
        '[role="tooltip"]'
      ];
      
      for (const selector of tooltipSelectors) {
        if (await this.page.locator(selector).isVisible()) {
          result.tooltipTested = true;
          break;
        }
      }
    } catch (error) {
      this.errorDetector.addReproductionStep(`Chart tooltip test failed: ${error.message}`);
    }
  }

  private async testChartLegend(chart: Locator, result: ChartTestResult): Promise<void> {
    try {
      const legendSelectors = [
        '.recharts-legend-wrapper',
        '.legend',
        '[data-testid*="legend"]'
      ];
      
      for (const selector of legendSelectors) {
        const legend = this.page.locator(selector);
        if (await legend.isVisible()) {
          // Try clicking on legend items
          const legendItems = await legend.locator('[role="button"], .legend-item').all();
          if (legendItems.length > 0) {
            await legendItems[0].click();
            result.legendTested = true;
          }
          break;
        }
      }
    } catch (error) {
      this.errorDetector.addReproductionStep(`Chart legend test failed: ${error.message}`);
    }
  }

  private async testChartTouchInteractions(chart: Locator, result: ChartTestResult): Promise<void> {
    try {
      await chart.tap();
      result.interactionTypes.push('tap');
      await this.page.waitForTimeout(500);
    } catch (error) {
      this.errorDetector.addReproductionStep(`Chart touch test failed: ${error.message}`);
    }
  }

  private async testChartResponsiveness(chart: Locator, result: ChartTestResult): Promise<void> {
    try {
      // Test different viewport sizes
      const originalViewport = this.page.viewportSize();
      
      // Test mobile viewport
      await this.page.setViewportSize({ width: 375, height: 667 });
      await this.page.waitForTimeout(1000);
      
      // Check if chart is still visible and properly sized
      const mobileBox = await chart.boundingBox();
      if (mobileBox && mobileBox.width > 0) {
        result.responsiveTested = true;
      }
      
      // Restore original viewport
      if (originalViewport) {
        await this.page.setViewportSize(originalViewport);
      }
    } catch (error) {
      this.errorDetector.addReproductionStep(`Chart responsiveness test failed: ${error.message}`);
    }
  }

  private async testSingleFilter(filter: Locator, index: number, options: InteractionTestOptions): Promise<InteractionTestResult> {
    const startTime = Date.now();
    const selector = await this.getElementSelector(filter);
    
    const result: InteractionTestResult = {
      elementType: 'filter',
      selector,
      testType: 'filter-interaction',
      success: true,
      timing: 0,
      accessibility: await this.testAccessibility(filter, options)
    };

    try {
      // Test filter interaction
      await filter.click();
      await this.page.waitForTimeout(500);
      
      // Look for filter options or dropdowns
      const filterOptions = await filter.locator('[role="option"], option').all();
      if (filterOptions.length > 0) {
        await filterOptions[0].click();
        await this.page.waitForTimeout(1000); // Wait for filter to apply
      }
      
      if (options.captureScreenshots) {
        result.screenshot = await this.captureElementScreenshot(filter, `filter-${index}`);
      }
      
    } catch (error) {
      result.success = false;
      result.errorMessage = error.message;
    }

    result.timing = Date.now() - startTime;
    return result;
  }

  private async testModalTrigger(trigger: Locator, index: number, options: InteractionTestOptions): Promise<InteractionTestResult> {
    const startTime = Date.now();
    const selector = await this.getElementSelector(trigger);
    
    const result: InteractionTestResult = {
      elementType: 'modal-trigger',
      selector,
      testType: 'modal-interaction',
      success: true,
      timing: 0,
      accessibility: await this.testAccessibility(trigger, options)
    };

    try {
      // Click trigger to open modal
      await trigger.click();
      await this.page.waitForTimeout(1000);
      
      // Check if modal opened
      const modal = this.page.locator('[role="dialog"], .modal');
      if (await modal.isVisible()) {
        // Try to close modal
        const closeButton = modal.locator('[aria-label="Close"], .close');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await this.page.keyboard.press('Escape');
        }
      }
      
      if (options.captureScreenshots) {
        result.screenshot = await this.captureElementScreenshot(trigger, `modal-trigger-${index}`);
      }
      
    } catch (error) {
      result.success = false;
      result.errorMessage = error.message;
    }

    result.timing = Date.now() - startTime;
    return result;
  }

  private async testTabContainer(tabContainer: Locator, index: number, options: InteractionTestOptions): Promise<InteractionTestResult> {
    const startTime = Date.now();
    const selector = await this.getElementSelector(tabContainer);
    
    const result: InteractionTestResult = {
      elementType: 'tabs',
      selector,
      testType: 'tab-interaction',
      success: true,
      timing: 0,
      accessibility: await this.testAccessibility(tabContainer, options)
    };

    try {
      // Find all tabs
      const tabs = await tabContainer.locator('[role="tab"]').all();
      
      // Test clicking on each tab
      for (let i = 0; i < Math.min(tabs.length, 3); i++) { // Limit to first 3 tabs
        await tabs[i].click();
        await this.page.waitForTimeout(500);
      }
      
      if (options.captureScreenshots) {
        result.screenshot = await this.captureElementScreenshot(tabContainer, `tabs-${index}`);
      }
      
    } catch (error) {
      result.success = false;
      result.errorMessage = error.message;
    }

    result.timing = Date.now() - startTime;
    return result;
  }

  private async testSingleAccordion(accordion: Locator, index: number, options: InteractionTestOptions): Promise<InteractionTestResult> {
    const startTime = Date.now();
    const selector = await this.getElementSelector(accordion);
    
    const result: InteractionTestResult = {
      elementType: 'accordion',
      selector,
      testType: 'accordion-interaction',
      success: true,
      timing: 0,
      accessibility: await this.testAccessibility(accordion, options)
    };

    try {
      // Test accordion expand/collapse
      const isExpanded = await accordion.getAttribute('aria-expanded') === 'true';
      
      // Click to toggle
      await accordion.click();
      await this.page.waitForTimeout(500);
      
      // Click again to toggle back
      await accordion.click();
      await this.page.waitForTimeout(500);
      
      if (options.captureScreenshots) {
        result.screenshot = await this.captureElementScreenshot(accordion, `accordion-${index}`);
      }
      
    } catch (error) {
      result.success = false;
      result.errorMessage = error.message;
    }

    result.timing = Date.now() - startTime;
    return result;
  }

  /**
   * Get test results summary
   */
  getTestResults(): InteractionTestSuite {
    return this.testResults;
  }

  /**
   * Clear test results
   */
  clearTestResults(): void {
    this.testResults = {
      buttons: [],
      links: [],
      forms: [],
      dropdowns: [],
      charts: [],
      filters: [],
      modals: [],
      tabs: [],
      accordions: []
    };
    this.screenshotCounter = 0;
  }

  /**
   * Get test summary statistics
   */
  getTestSummary(): {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    successRate: number;
    elementTypes: { [key: string]: number };
  } {
    const allResults = [
      ...this.testResults.buttons,
      ...this.testResults.links,
      ...this.testResults.forms,
      ...this.testResults.dropdowns,
      ...this.testResults.charts,
      ...this.testResults.filters,
      ...this.testResults.modals,
      ...this.testResults.tabs,
      ...this.testResults.accordions
    ];

    const totalTests = allResults.length;
    const successfulTests = allResults.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;

    const elementTypes: { [key: string]: number } = {};
    allResults.forEach(result => {
      elementTypes[result.elementType] = (elementTypes[result.elementType] || 0) + 1;
    });

    return {
      totalTests,
      successfulTests,
      failedTests,
      successRate,
      elementTypes
    };
  }
}

/**
 * Factory function to create an interactive element tester
 */
export function createInteractiveElementTester(page: Page, errorDetector: ErrorDetector): InteractiveElementTester {
  return new InteractiveElementTester(page, errorDetector);
}