/**
 * Tests for Interactive Element Tester
 * 
 * Unit tests to verify the interactive element testing utilities work correctly
 */

import { test, expect } from '@playwright/test';
import { InteractiveElementTester, InteractionTestOptions } from '../interactive-element-tester';
import { ErrorDetector } from '../error-detector';

test.describe('Interactive Element Tester', () => {
  test('should create tester instance and initialize correctly', async ({ page, context }) => {
    const errorDetector = new ErrorDetector(page, context);
    const tester = new InteractiveElementTester(page, errorDetector);
    
    expect(tester).toBeDefined();
    expect(tester.getTestResults()).toBeDefined();
    
    const results = tester.getTestResults();
    expect(results.buttons).toHaveLength(0);
    expect(results.forms).toHaveLength(0);
    expect(results.dropdowns).toHaveLength(0);
    expect(results.charts).toHaveLength(0);
    expect(results.filters).toHaveLength(0);
    expect(results.modals).toHaveLength(0);
    expect(results.tabs).toHaveLength(0);
    expect(results.accordions).toHaveLength(0);
    
    const summary = tester.getTestSummary();
    expect(summary.totalTests).toBe(0);
    expect(summary.successfulTests).toBe(0);
    expect(summary.failedTests).toBe(0);
    expect(summary.successRate).toBe(0);
    expect(summary.elementTypes).toEqual({});
  });

  test('should clear test results correctly', async ({ page, context }) => {
    const errorDetector = new ErrorDetector(page, context);
    const tester = new InteractiveElementTester(page, errorDetector);
    
    tester.clearTestResults();
    const results = tester.getTestResults();
    
    expect(results.buttons).toHaveLength(0);
    expect(results.forms).toHaveLength(0);
    expect(results.dropdowns).toHaveLength(0);
    expect(results.charts).toHaveLength(0);
  });

  test('should handle basic page interaction testing', async ({ page, context }) => {
    // Navigate to a simple page with some interactive elements
    await page.setContent(`
      <html>
        <body>
          <button id="test-button">Test Button</button>
          <form id="test-form">
            <input type="text" name="test-input" />
            <button type="submit">Submit</button>
          </form>
          <select id="test-dropdown">
            <option value="1">Option 1</option>
            <option value="2">Option 2</option>
          </select>
        </body>
      </html>
    `);

    const errorDetector = new ErrorDetector(page, context);
    const tester = new InteractiveElementTester(page, errorDetector);
    
    // Test buttons
    const buttonResults = await tester.testButtons({
      includeAccessibility: false,
      captureScreenshots: false,
      testKeyboardNavigation: false,
      testTouchInteractions: false,
      timeout: 1000
    });
    
    expect(buttonResults.length).toBeGreaterThan(0);
    expect(buttonResults[0].elementType).toBe('button');
    expect(buttonResults[0].success).toBe(true);
    
    // Test forms
    const formResults = await tester.testForms({
      includeAccessibility: false,
      captureScreenshots: false,
      skipSlowTests: true,
      timeout: 1000
    });
    
    expect(formResults.length).toBeGreaterThan(0);
    expect(formResults[0].elementType).toBe('form');
    
    // Test dropdowns
    const dropdownResults = await tester.testDropdowns({
      includeAccessibility: false,
      captureScreenshots: false,
      timeout: 1000
    });
    
    expect(dropdownResults.length).toBeGreaterThan(0);
    expect(dropdownResults[0].elementType).toBe('dropdown');
    
    // Verify test summary
    const summary = tester.getTestSummary();
    expect(summary.totalTests).toBeGreaterThan(0);
    expect(summary.elementTypes).toHaveProperty('button');
    expect(summary.elementTypes).toHaveProperty('form');
    expect(summary.elementTypes).toHaveProperty('dropdown');
  });
});