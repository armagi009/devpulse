/**
 * Example integration of Interactive Element Tester with Navigation Crawler
 * 
 * This example shows how the interactive element testing utilities integrate
 * with the existing navigation crawler and error detection systems.
 */

import { Page, BrowserContext } from '@playwright/test';
import { InteractiveElementTester, InteractionTestOptions } from './interactive-element-tester';
import { NavigationCrawler, setupNavigationCrawlerWithAuth } from './navigation-crawler';
import { ErrorDetector } from './error-detector';
import { ErrorReporter } from './error-reporter';
import { UserRole } from '@/lib/types/roles';

/**
 * Example function showing comprehensive interaction testing workflow
 */
export async function runComprehensiveInteractionTesting(
  page: Page,
  context: BrowserContext,
  userRole: UserRole
): Promise<void> {
  // Initialize testing utilities
  const errorDetector = new ErrorDetector(page, context);
  const errorReporter = new ErrorReporter(page, context);
  const interactionTester = new InteractiveElementTester(page, errorDetector);
  
  // Set up navigation crawler with authentication
  const navigationCrawler = await setupNavigationCrawlerWithAuth(page, userRole);
  
  // Set user context for error tracking
  errorDetector.setUserContext(userRole, `${userRole}-mock-user`);
  
  try {
    // Discover all routes for the current role
    const routes = await navigationCrawler.discoverRoutes({
      includeChildren: true,
      validatePermissions: true,
      captureScreenshots: false
    });
    
    console.log(`Discovered ${routes.length} routes for role: ${userRole}`);
    
    // Test interactions on each accessible route
    for (const route of routes) {
      if (route.isAccessible) {
        console.log(`Testing interactions on route: ${route.path}`);
        
        // Navigate to the route
        const navigationSuccess = await navigationCrawler.navigateToRoute(route.path);
        
        if (navigationSuccess) {
          // Configure interaction testing options
          const testOptions: InteractionTestOptions = {
            includeAccessibility: true,
            captureScreenshots: false, // Set to true for debugging
            testKeyboardNavigation: true,
            testTouchInteractions: true,
            testResponsiveness: true,
            timeout: 5000,
            skipSlowTests: false
          };
          
          // Run comprehensive interaction testing
          const interactionResults = await interactionTester.testAllInteractiveElements(testOptions);
          
          // Log results for this route
          const summary = interactionTester.getTestSummary();
          console.log(`Route ${route.path} - Tested ${summary.totalTests} elements, ${summary.successfulTests} successful, ${summary.failedTests} failed`);
          
          // Check for rendering issues
          await errorDetector.detectRenderingIssues();
          
          // Clear results for next route (optional, depending on requirements)
          // interactionTester.clearTestResults();
        } else {
          console.log(`Failed to navigate to route: ${route.path}`);
        }
      } else {
        console.log(`Skipping restricted route: ${route.path}`);
      }
    }
    
    // Generate comprehensive error report
    const errors = errorDetector.getErrors();
    const errorReport = await errorReporter.generateErrorReport(errors);
    
    // Generate final interaction testing summary
    const finalSummary = interactionTester.getTestSummary();
    console.log('=== Final Interaction Testing Summary ===');
    console.log(`Total elements tested: ${finalSummary.totalTests}`);
    console.log(`Successful tests: ${finalSummary.successfulTests}`);
    console.log(`Failed tests: ${finalSummary.failedTests}`);
    console.log(`Success rate: ${finalSummary.successRate.toFixed(2)}%`);
    console.log('Element types tested:', finalSummary.elementTypes);
    
    // Log error summary
    const errorSummary = errorDetector.getErrorSummary();
    console.log('=== Error Detection Summary ===');
    console.log(`Total errors: ${errorSummary.total}`);
    console.log(`Critical errors: ${errorSummary.critical}`);
    console.log(`High priority errors: ${errorSummary.high}`);
    console.log(`Medium priority errors: ${errorSummary.medium}`);
    console.log(`Low priority errors: ${errorSummary.low}`);
    
  } catch (error) {
    console.error('Comprehensive interaction testing failed:', error);
    errorDetector.addReproductionStep(`Comprehensive testing failed: ${error.message}`);
  }
}

/**
 * Example function for testing specific element types on current page
 */
export async function testSpecificElementTypes(
  page: Page,
  context: BrowserContext,
  elementTypes: string[] = ['buttons', 'forms', 'charts']
): Promise<void> {
  const errorDetector = new ErrorDetector(page, context);
  const interactionTester = new InteractiveElementTester(page, errorDetector);
  
  const testOptions: InteractionTestOptions = {
    includeAccessibility: true,
    captureScreenshots: true,
    testKeyboardNavigation: true,
    testTouchInteractions: true,
    timeout: 3000
  };
  
  for (const elementType of elementTypes) {
    console.log(`Testing ${elementType}...`);
    
    try {
      switch (elementType) {
        case 'buttons':
          await interactionTester.testButtons(testOptions);
          break;
        case 'forms':
          await interactionTester.testForms(testOptions);
          break;
        case 'dropdowns':
          await interactionTester.testDropdowns(testOptions);
          break;
        case 'charts':
          await interactionTester.testCharts(testOptions);
          break;
        case 'filters':
          await interactionTester.testFilters(testOptions);
          break;
        case 'modals':
          await interactionTester.testModals(testOptions);
          break;
        case 'tabs':
          await interactionTester.testTabs(testOptions);
          break;
        case 'accordions':
          await interactionTester.testAccordions(testOptions);
          break;
        default:
          console.log(`Unknown element type: ${elementType}`);
      }
    } catch (error) {
      console.error(`Failed to test ${elementType}:`, error);
    }
  }
  
  // Print summary
  const summary = interactionTester.getTestSummary();
  console.log(`Completed testing. Success rate: ${summary.successRate.toFixed(2)}%`);
}

/**
 * Example function for accessibility-focused interaction testing
 */
export async function runAccessibilityInteractionTesting(
  page: Page,
  context: BrowserContext
): Promise<void> {
  const errorDetector = new ErrorDetector(page, context);
  const interactionTester = new InteractiveElementTester(page, errorDetector);
  
  const accessibilityOptions: InteractionTestOptions = {
    includeAccessibility: true,
    testKeyboardNavigation: true,
    testTouchInteractions: false,
    testResponsiveness: false,
    captureScreenshots: true,
    timeout: 2000
  };
  
  console.log('Running accessibility-focused interaction testing...');
  
  // Test all interactive elements with accessibility focus
  await interactionTester.testAllInteractiveElements(accessibilityOptions);
  
  const results = interactionTester.getTestResults();
  
  // Analyze accessibility results
  const accessibilityIssues = [];
  
  [...results.buttons, ...results.forms, ...results.dropdowns].forEach(result => {
    const accessibility = result.accessibility;
    if (!accessibility.hasAriaLabel) {
      accessibilityIssues.push(`${result.elementType} at ${result.selector} missing aria-label`);
    }
    if (!accessibility.isKeyboardAccessible) {
      accessibilityIssues.push(`${result.elementType} at ${result.selector} not keyboard accessible`);
    }
    if (!accessibility.meetsMinimumSize) {
      accessibilityIssues.push(`${result.elementType} at ${result.selector} below minimum touch target size`);
    }
  });
  
  console.log('=== Accessibility Issues Found ===');
  accessibilityIssues.forEach(issue => console.log(`- ${issue}`));
  
  if (accessibilityIssues.length === 0) {
    console.log('No accessibility issues found!');
  }
}