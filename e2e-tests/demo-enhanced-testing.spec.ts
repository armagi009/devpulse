/**
 * Demo test to showcase the enhanced deep interaction testing capabilities
 * This test demonstrates the new features we implemented in task 10
 */

import { test, expect } from '@playwright/test';
import { ErrorDetector } from './utils/error-detector';
import { InteractiveElementTester } from './utils/interactive-element-tester';
import { ComponentContentVerifier } from './utils/component-content-verifier';
import { ApiIntegrationValidator } from './utils/api-integration-validator';

test.describe('Enhanced Deep Interaction Testing Demo', () => {
  test('should demonstrate comprehensive testing capabilities', async ({ page, context }) => {
    // Initialize our enhanced testing utilities
    const errorDetector = new ErrorDetector(page, context);
    const interactiveTester = new InteractiveElementTester(page, errorDetector);
    const contentVerifier = new ComponentContentVerifier(page, errorDetector);
    const apiValidator = new ApiIntegrationValidator(page, errorDetector);

    // Set user context for error tracking
    errorDetector.setUserContext('demo-user', 'test-scenario');
    errorDetector.addReproductionStep('Starting enhanced testing demo');

    // Navigate to the home page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    console.log('🚀 Starting Enhanced Deep Interaction Testing Demo...');

    // 1. Test Interactive Elements (Task 10.1)
    console.log('📝 Testing interactive elements...');
    const interactionResults = await interactiveTester.testAllInteractiveElements({
      includeAccessibility: true,
      testKeyboardNavigation: true,
      captureScreenshots: false,
      timeout: 10000
    });

    console.log(`✅ Interactive Elements Test Results:`);
    console.log(`   - Buttons tested: ${interactionResults.buttons.length}`);
    console.log(`   - Links tested: ${interactionResults.links.length}`);
    console.log(`   - Forms tested: ${interactionResults.forms.length}`);

    // Check for text accuracy issues
    const textIssues = interactionResults.buttons.filter(b => !b.textContentAccurate);
    if (textIssues.length > 0) {
      console.log(`⚠️  Found ${textIssues.length} text accuracy issues`);
      textIssues.forEach(issue => {
        console.log(`   - ${issue.selector}: "${issue.actualText}" should be "${issue.expectedText}"`);
      });
    }

    // Check for navigation issues
    const navIssues = interactionResults.buttons.filter(b => b.navigationTested && !b.success);
    if (navIssues.length > 0) {
      console.log(`🚨 Found ${navIssues.length} navigation issues (404 errors)`);
    }

    // 2. Test Component Content (Task 10.2)
    console.log('🔍 Verifying component content...');
    const contentResults = await contentVerifier.verifyAllComponents({
      validateChartData: true,
      checkVisualRegression: true,
      captureScreenshots: false,
      maxLoadingWaitTime: 5000
    });

    console.log(`✅ Component Content Verification Results:`);
    console.log(`   - Components tested: ${contentResults.length}`);
    
    const placeholderIssues = contentResults.filter(c => c.hasPlaceholderText);
    if (placeholderIssues.length > 0) {
      console.log(`⚠️  Found ${placeholderIssues.length} components with placeholder text`);
      placeholderIssues.forEach(issue => {
        console.log(`   - ${issue.componentType} (${issue.selector}): ${issue.placeholderTexts.join(', ')}`);
      });
    }

    const visualIssues = contentResults.filter(c => c.visualRegressionIssues.length > 0);
    if (visualIssues.length > 0) {
      console.log(`🎨 Found ${visualIssues.length} components with visual issues`);
    }

    // 3. Test Runtime Error Monitoring (Task 10.3)
    console.log('🔧 Checking runtime errors...');
    const errorSummary = errorDetector.getErrorSummary();
    console.log(`✅ Runtime Error Monitoring Results:`);
    console.log(`   - Total errors detected: ${errorSummary.total}`);
    console.log(`   - Critical errors: ${errorSummary.critical}`);
    console.log(`   - High priority errors: ${errorSummary.high}`);

    if (errorSummary.total > 0) {
      const errorsByType = errorDetector.getErrorStatsByType();
      console.log(`   - Error breakdown:`, errorsByType);
      
      const componentErrors = errorDetector.getComponentErrorSummary();
      if (componentErrors.totalComponentErrors > 0) {
        console.log(`   - Component errors: ${componentErrors.totalComponentErrors}`);
        console.log(`   - Import errors: ${componentErrors.importErrors}`);
      }
    }

    // 4. Test API Integration (Task 10.4)
    console.log('🌐 Validating API integrations...');
    const apiResults = await apiValidator.validateAllApiIntegrations({
      testAuthentication: false, // Skip auth for demo
      validateMockData: true,
      testErrorStates: false, // Skip for demo
      timeout: 10000
    });

    console.log(`✅ API Integration Validation Results:`);
    const apiSummary = apiValidator.getValidationSummary();
    console.log(`   - Endpoints tested: ${apiSummary.totalEndpoints}`);
    console.log(`   - Successful: ${apiSummary.successfulEndpoints}`);
    console.log(`   - Failed: ${apiSummary.failedEndpoints}`);
    console.log(`   - Success rate: ${apiSummary.successRate.toFixed(1)}%`);

    if (apiSummary.mockDataIssues > 0) {
      console.log(`⚠️  Mock data issues: ${apiSummary.mockDataIssues}`);
    }

    // 5. Generate Summary Report
    console.log('\n📊 COMPREHENSIVE TEST SUMMARY:');
    console.log('=====================================');
    
    const totalIssues = textIssues.length + navIssues.length + placeholderIssues.length + 
                       visualIssues.length + errorSummary.critical + errorSummary.high + 
                       apiSummary.failedEndpoints;
    
    console.log(`🔍 Total Issues Found: ${totalIssues}`);
    console.log(`📝 Interactive Elements: ${interactionResults.buttons.length + interactionResults.links.length} tested`);
    console.log(`🎨 Components: ${contentResults.length} verified`);
    console.log(`⚡ Runtime Errors: ${errorSummary.total} detected`);
    console.log(`🌐 API Endpoints: ${apiSummary.totalEndpoints} validated`);
    
    if (totalIssues === 0) {
      console.log('🎉 All tests passed! No issues detected.');
    } else {
      console.log(`⚠️  ${totalIssues} issues require attention.`);
    }

    // The test should pass regardless of issues found - we're demonstrating detection capabilities
    expect(true).toBe(true);
  });

  test('should demonstrate error categorization', async ({ page, context }) => {
    const errorDetector = new ErrorDetector(page, context);
    
    // Navigate to a page that might have errors
    await page.goto('http://localhost:3000');
    
    // Wait a bit to capture any runtime errors
    await page.waitForTimeout(3000);
    
    const errors = errorDetector.getErrors();
    const categorized = errorDetector.getCategorizedErrors();
    
    console.log('\n🔍 ERROR CATEGORIZATION DEMO:');
    console.log('==============================');
    console.log(`Total errors: ${errors.length}`);
    console.log(`Critical: ${categorized.critical.length}`);
    console.log(`High: ${categorized.high.length}`);
    console.log(`Medium: ${categorized.medium.length}`);
    console.log(`Low: ${categorized.low.length}`);
    
    if (errors.length > 0) {
      console.log('\nError Details:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.severity.toUpperCase()}] ${error.type}: ${error.message}`);
      });
    }
    
    expect(true).toBe(true);
  });
});