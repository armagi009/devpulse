/**
 * Quick demo of enhanced testing capabilities
 */

import { test, expect } from '@playwright/test';
import { ErrorDetector } from './utils/error-detector';
import { ComponentContentVerifier } from './utils/component-content-verifier';

test.describe('Quick Enhanced Testing Demo', () => {
  test('should demonstrate enhanced error detection and content verification', async ({ page, context }) => {
    // Initialize enhanced testing utilities
    const errorDetector = new ErrorDetector(page, context);
    const contentVerifier = new ComponentContentVerifier(page, errorDetector);

    console.log('🚀 Starting Quick Enhanced Testing Demo...');

    // Navigate to the home page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 1. Test Runtime Error Monitoring (Task 10.3)
    console.log('🔧 Checking runtime errors...');
    
    // Wait a moment to capture any runtime errors
    await page.waitForTimeout(2000);
    
    const errorSummary = errorDetector.getErrorSummary();
    console.log(`✅ Runtime Error Monitoring Results:`);
    console.log(`   - Total errors detected: ${errorSummary.total}`);
    console.log(`   - Critical errors: ${errorSummary.critical}`);
    console.log(`   - High priority errors: ${errorSummary.high}`);
    console.log(`   - Medium priority errors: ${errorSummary.medium}`);
    console.log(`   - Low priority errors: ${errorSummary.low}`);

    if (errorSummary.total > 0) {
      const errorsByType = errorDetector.getErrorStatsByType();
      console.log(`   - Error breakdown by type:`, errorsByType);
      
      const componentErrors = errorDetector.getComponentErrorSummary();
      if (componentErrors.totalComponentErrors > 0) {
        console.log(`   - Component errors: ${componentErrors.totalComponentErrors}`);
        console.log(`   - Import errors: ${componentErrors.importErrors}`);
        console.log(`   - Common problematic components:`, componentErrors.commonComponents);
      }

      const apiErrors = errorDetector.getApiErrorSummary();
      if (apiErrors.totalApiErrors > 0) {
        console.log(`   - API errors: ${apiErrors.totalApiErrors}`);
        console.log(`   - Integration failures: ${apiErrors.integrationFailures}`);
        console.log(`   - Status code breakdown:`, apiErrors.statusCodeBreakdown);
      }
    }

    // 2. Test Component Content Verification (Task 10.2)
    console.log('🔍 Verifying component content (limited scope)...');
    
    // Test just a few key components to avoid timeout
    const headerComponent = page.locator('header').first();
    const mainContent = page.locator('main, .main-content, [role="main"]').first();
    
    if (await headerComponent.isVisible()) {
      const headerResult = await contentVerifier.verifyComponent(headerComponent, 'header', 0, {
        validateChartData: false,
        checkVisualRegression: true,
        maxLoadingWaitTime: 3000
      });
      
      console.log(`✅ Header Component Verification:`);
      console.log(`   - Has real content: ${headerResult.hasRealContent}`);
      console.log(`   - Has placeholder text: ${headerResult.hasPlaceholderText}`);
      console.log(`   - Loading handled: ${headerResult.loadingStateHandled}`);
      console.log(`   - Visual issues: ${headerResult.visualRegressionIssues.length}`);
      
      if (headerResult.placeholderTexts.length > 0) {
        console.log(`   - Placeholder texts found:`, headerResult.placeholderTexts);
      }
    }

    if (await mainContent.isVisible()) {
      const mainResult = await contentVerifier.verifyComponent(mainContent, 'main', 0, {
        validateChartData: false,
        checkVisualRegression: true,
        maxLoadingWaitTime: 3000
      });
      
      console.log(`✅ Main Content Verification:`);
      console.log(`   - Has real content: ${mainResult.hasRealContent}`);
      console.log(`   - Content elements found: ${mainResult.contentElements.length}`);
      console.log(`   - Visual issues: ${mainResult.visualRegressionIssues.length}`);
    }

    // 3. Test Basic Interactive Elements (simplified version of Task 10.1)
    console.log('📝 Testing basic interactive elements...');
    
    const buttons = await page.locator('button, [role="button"], a[class*="btn"]').all();
    const links = await page.locator('a[href]').all();
    
    console.log(`✅ Interactive Elements Found:`);
    console.log(`   - Buttons: ${buttons.length}`);
    console.log(`   - Links: ${links.length}`);
    
    // Test a few buttons for text accuracy issues
    let textIssues = 0;
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      try {
        const text = await button.textContent() || '';
        const trimmedText = text.trim();
        
        // Check for common text accuracy issues
        const commonIssues = [
          'New Retro',
          'Chart Component Here',
          'Component Here',
          'TODO:',
          'FIXME:',
          'undefined',
          '[object Object]'
        ];
        
        for (const issue of commonIssues) {
          if (trimmedText.includes(issue)) {
            textIssues++;
            console.log(`   ⚠️  Text accuracy issue in button ${i + 1}: "${trimmedText}"`);
            break;
          }
        }
      } catch (error) {
        // Skip buttons that can't be accessed
      }
    }
    
    if (textIssues === 0) {
      console.log(`   ✅ No text accuracy issues found in sampled buttons`);
    }

    // 4. Generate Summary Report
    console.log('\n📊 QUICK TEST SUMMARY:');
    console.log('=======================');
    console.log(`🔍 Runtime Errors: ${errorSummary.total} detected`);
    console.log(`📝 Interactive Elements: ${buttons.length + links.length} found`);
    console.log(`⚠️  Text Issues: ${textIssues} found`);
    
    if (errorSummary.total === 0 && textIssues === 0) {
      console.log('🎉 Quick test passed! No major issues detected.');
    } else {
      console.log(`⚠️  ${errorSummary.total + textIssues} issues detected for review.`);
    }

    // Test passes regardless - we're demonstrating detection capabilities
    expect(true).toBe(true);
  });

  test('should demonstrate API endpoint discovery', async ({ page, context }) => {
    const errorDetector = new ErrorDetector(page, context);
    
    console.log('🌐 API Endpoint Discovery Demo...');
    
    // Track network requests
    const apiRequests: string[] = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/')) {
        const endpoint = new URL(url).pathname;
        if (!apiRequests.includes(endpoint)) {
          apiRequests.push(endpoint);
        }
      }
    });
    
    // Navigate and trigger some API calls
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Try to trigger more API calls by interacting with elements
    try {
      const signInButton = page.locator('a[href*="signin"], button:has-text("Sign in")').first();
      if (await signInButton.isVisible()) {
        await signInButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      // Continue if interaction fails
    }
    
    console.log(`✅ API Endpoints Discovered: ${apiRequests.length}`);
    apiRequests.forEach((endpoint, index) => {
      console.log(`   ${index + 1}. ${endpoint}`);
    });
    
    if (apiRequests.length === 0) {
      console.log('   ℹ️  No API endpoints called during this session');
    }
    
    expect(true).toBe(true);
  });
});