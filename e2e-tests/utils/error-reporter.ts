import { Page, BrowserContext } from '@playwright/test';
import { DetectedError, ErrorCategories, BrowserInfo } from './error-detector';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Error Reporting and Documentation System
 * 
 * This module provides comprehensive error documentation capabilities including
 * screenshot capture, DOM state recording, and structured error report generation
 * with actionable fix suggestions.
 * 
 * Requirements: 2.4, 2.5, 5.1, 5.2
 */

export interface ErrorReport {
  summary: ErrorSummary;
  roleSpecificErrors: { [roleName: string]: RoleErrorSummary };
  categorizedErrors: CategorizedErrorReport;
  fixSuggestions: FixSuggestion[];
  testCoverage: CoverageReport;
  generatedAt: Date;
  testEnvironment: TestEnvironment;
}

export interface ErrorSummary {
  totalErrors: number;
  criticalErrors: number;
  highPriorityErrors: number;
  mediumPriorityErrors: number;
  lowPriorityErrors: number;
  errorsByType: {
    runtime: number;
    network: number;
    rendering: number;
    navigation: number;
  };
}

export interface RoleErrorSummary {
  roleName: string;
  totalErrors: number;
  criticalErrors: number;
  highPriorityErrors: number;
  errors: DetectedError[];
  commonIssues: string[];
  affectedFeatures: string[];
}

export interface CategorizedErrorReport {
  runtimeErrors: ErrorDetail[];
  networkErrors: ErrorDetail[];
  renderingErrors: ErrorDetail[];
  navigationErrors: ErrorDetail[];
}

export interface ErrorDetail extends DetectedError {
  reproductionInstructions: string;
  debuggingContext: DebuggingContext;
  relatedErrors: string[];
  fixSuggestion: FixSuggestion;
}

export interface DebuggingContext {
  screenshotPath?: string;
  domSnapshotPath?: string;
  networkTrace?: NetworkTraceInfo[];
  consoleContext: ConsoleContextInfo[];
  pageState: PageStateInfo;
}

export interface NetworkTraceInfo {
  url: string;
  method: string;
  status: number;
  timing: number;
  headers: Record<string, string>;
  error?: string;
}

export interface ConsoleContextInfo {
  type: string;
  message: string;
  timestamp: Date;
  relevanceScore: number;
}

export interface PageStateInfo {
  url: string;
  title: string;
  viewport: { width: number; height: number };
  userAgent: string;
  timestamp: Date;
}

export interface FixSuggestion {
  id: string;
  errorId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'code' | 'configuration' | 'data' | 'infrastructure';
  title: string;
  description: string;
  actionableSteps: string[];
  codeExample?: string;
  relatedFiles: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface CoverageReport {
  totalRoutes: number;
  testedRoutes: number;
  coveragePercentage: number;
  roleSpecificCoverage: {
    [roleName: string]: {
      totalFeatures: number;
      testedFeatures: number;
      coveragePercentage: number;
    };
  };
  untestedAreas: string[];
}

export interface TestEnvironment {
  browserName: string;
  browserVersion: string;
  platform: string;
  viewport: { width: number; height: number };
  mockMode: boolean;
  testSuite: string;
}

export class ErrorReporter {
  private reportDirectory: string;
  private screenshotDirectory: string;
  private domSnapshotDirectory: string;

  constructor(
    private page: Page,
    private context: BrowserContext,
    baseReportPath: string = './test-data/error-reports'
  ) {
    this.reportDirectory = baseReportPath;
    this.screenshotDirectory = path.join(baseReportPath, 'screenshots');
    this.domSnapshotDirectory = path.join(baseReportPath, 'dom-snapshots');
    
    this.ensureDirectoriesExist();
  }

  /**
   * Generate comprehensive error report from detected errors
   */
  async generateErrorReport(
    errors: DetectedError[],
    testCoverage?: CoverageReport
  ): Promise<ErrorReport> {
    const summary = this.generateErrorSummary(errors);
    const roleSpecificErrors = this.groupErrorsByRole(errors);
    const categorizedErrors = await this.categorizeErrorsWithDetails(errors);
    const fixSuggestions = await this.generateFixSuggestions(errors);
    const testEnvironment = await this.getTestEnvironment();

    const report: ErrorReport = {
      summary,
      roleSpecificErrors,
      categorizedErrors,
      fixSuggestions,
      testCoverage: testCoverage || this.generateDefaultCoverage(),
      generatedAt: new Date(),
      testEnvironment
    };

    // Save report to file
    await this.saveReportToFile(report);
    
    return report;
  }

  /**
   * Capture enhanced screenshot with error context
   */
  async captureErrorScreenshot(
    errorId: string,
    highlightSelector?: string
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `error-${errorId}-${timestamp}.png`;
    const screenshotPath = path.join(this.screenshotDirectory, filename);

    try {
      // Highlight error element if selector provided
      if (highlightSelector) {
        await this.page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            element.style.outline = '3px solid red';
            element.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
          }
        }, highlightSelector);
      }

      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
        animations: 'disabled'
      });

      return screenshotPath;
    } catch (error) {
      console.warn(`Failed to capture screenshot for error ${errorId}:`, error);
      return '';
    }
  }

  /**
   * Capture DOM state with enhanced context
   */
  async captureDOMState(errorId: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `dom-${errorId}-${timestamp}.html`;
    const domPath = path.join(this.domSnapshotDirectory, filename);

    try {
      const domContent = await this.page.evaluate(() => {
        // Enhanced DOM capture with computed styles and error context
        const html = document.documentElement.outerHTML;
        const errorElements = Array.from(document.querySelectorAll('[data-error], .error, .alert-error'));
        
        let enhancedContent = html;
        
        // Add error context comments
        if (errorElements.length > 0) {
          enhancedContent += '\n<!-- ERROR CONTEXT -->\n';
          errorElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const styles = window.getComputedStyle(element);
            enhancedContent += `<!-- Error Element ${index + 1}: ${element.tagName} -->\n`;
            enhancedContent += `<!-- Position: ${rect.x}, ${rect.y} Size: ${rect.width}x${rect.height} -->\n`;
            enhancedContent += `<!-- Display: ${styles.display}, Visibility: ${styles.visibility} -->\n`;
          });
        }
        
        return enhancedContent;
      });

      await fs.promises.writeFile(domPath, domContent, 'utf8');
      return domPath;
    } catch (error) {
      console.warn(`Failed to capture DOM state for error ${errorId}:`, error);
      return '';
    }
  }

  /**
   * Generate detailed reproduction instructions
   */
  generateReproductionInstructions(error: DetectedError): string {
    const steps = [
      `1. Navigate to: ${error.url}`,
      `2. Set mock user role to: ${error.userRole}`,
      `3. Select mock user: ${error.mockUser}`,
      ...error.reproductionSteps.map((step, index) => `${index + 4}. ${step}`),
      `Expected: Error should occur - ${error.message}`
    ];

    return steps.join('\n');
  }

  /**
   * Generate debugging context for error
   */
  async generateDebuggingContext(error: DetectedError): Promise<DebuggingContext> {
    const screenshotPath = await this.captureErrorScreenshot(error.id);
    const domSnapshotPath = await this.captureDOMState(error.id);
    
    const consoleContext = (error.consoleMessages || []).map(msg => ({
      type: msg.type,
      message: msg.text,
      timestamp: msg.timestamp,
      relevanceScore: this.calculateConsoleRelevance(msg.text, error.message)
    }));

    const networkTrace = (error.networkRequests || []).map(req => ({
      url: req.url,
      method: req.method,
      status: req.status,
      timing: req.responseTime,
      headers: {},
      error: req.error
    }));

    const pageState: PageStateInfo = {
      url: error.url,
      title: await this.page.title().catch(() => 'Unknown'),
      viewport: error.browserInfo.viewport,
      userAgent: await this.page.evaluate(() => navigator.userAgent),
      timestamp: error.timestamp
    };

    return {
      screenshotPath,
      domSnapshotPath,
      networkTrace,
      consoleContext,
      pageState
    };
  }

  /**
   * Generate fix suggestions based on error patterns
   */
  async generateFixSuggestions(errors: DetectedError[]): Promise<FixSuggestion[]> {
    const suggestions: FixSuggestion[] = [];
    
    for (const error of errors) {
      const suggestion = await this.generateFixSuggestionForError(error);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    // Group similar suggestions and prioritize
    return this.prioritizeAndDeduplicateSuggestions(suggestions);
  }

  /**
   * Generate fix suggestion for individual error
   */
  private async generateFixSuggestionForError(error: DetectedError): Promise<FixSuggestion | null> {
    const suggestionId = `fix-${error.id}`;
    
    // Runtime error suggestions
    if (error.type === 'runtime') {
      return this.generateRuntimeErrorSuggestion(suggestionId, error);
    }
    
    // Network error suggestions
    if (error.type === 'network') {
      return this.generateNetworkErrorSuggestion(suggestionId, error);
    }
    
    // Rendering error suggestions
    if (error.type === 'rendering') {
      return this.generateRenderingErrorSuggestion(suggestionId, error);
    }
    
    // Navigation error suggestions
    if (error.type === 'navigation') {
      return this.generateNavigationErrorSuggestion(suggestionId, error);
    }

    return null;
  }

  /**
   * Generate runtime error fix suggestions
   */
  private generateRuntimeErrorSuggestion(id: string, error: DetectedError): FixSuggestion {
    const message = error.message.toLowerCase();
    
    if (message.includes('cannot read property') || message.includes('cannot read properties')) {
      return {
        id,
        errorId: error.id,
        priority: error.severity,
        category: 'code',
        title: 'Fix Null/Undefined Property Access',
        description: 'Add null checks or optional chaining to prevent accessing properties on null/undefined objects.',
        actionableSteps: [
          'Identify the variable that is null/undefined',
          'Add null checks: if (variable && variable.property)',
          'Or use optional chaining: variable?.property',
          'Consider default values: variable?.property || defaultValue'
        ],
        codeExample: `// Before
const value = data.user.name;

// After
const value = data?.user?.name || 'Unknown';`,
        relatedFiles: this.extractFilesFromStackTrace(error.stackTrace),
        estimatedEffort: 'low',
        tags: ['null-check', 'optional-chaining', 'defensive-programming']
      };
    }

    if (message.includes('is not a function')) {
      return {
        id,
        errorId: error.id,
        priority: error.severity,
        category: 'code',
        title: 'Fix Function Call on Non-Function',
        description: 'Ensure the variable is a function before calling it.',
        actionableSteps: [
          'Check if the variable is defined and is a function',
          'Add type checking: typeof variable === "function"',
          'Consider using optional function calls',
          'Verify import/export statements'
        ],
        codeExample: `// Before
callback();

// After
if (typeof callback === 'function') {
  callback();
}`,
        relatedFiles: this.extractFilesFromStackTrace(error.stackTrace),
        estimatedEffort: 'low',
        tags: ['type-checking', 'function-validation']
      };
    }

    // Default runtime error suggestion
    return {
      id,
      errorId: error.id,
      priority: error.severity,
      category: 'code',
      title: 'Fix Runtime Error',
      description: 'Investigate and fix the runtime error based on the stack trace.',
      actionableSteps: [
        'Review the error message and stack trace',
        'Identify the problematic code location',
        'Add appropriate error handling',
        'Test the fix thoroughly'
      ],
      relatedFiles: this.extractFilesFromStackTrace(error.stackTrace),
      estimatedEffort: 'medium',
      tags: ['runtime-error', 'debugging']
    };
  }

  /**
   * Generate network error fix suggestions
   */
  private generateNetworkErrorSuggestion(id: string, error: DetectedError): FixSuggestion {
    const message = error.message.toLowerCase();
    
    if (message.includes('404')) {
      return {
        id,
        errorId: error.id,
        priority: error.severity,
        category: 'configuration',
        title: 'Fix 404 Not Found Error',
        description: 'The requested resource was not found. Check URL and routing configuration.',
        actionableSteps: [
          'Verify the URL is correct',
          'Check if the API endpoint exists',
          'Review routing configuration',
          'Ensure the resource is properly deployed'
        ],
        relatedFiles: ['src/app/api/**/*.ts', 'next.config.js'],
        estimatedEffort: 'medium',
        tags: ['404', 'routing', 'api-endpoint']
      };
    }

    if (message.includes('500') || message.includes('5')) {
      return {
        id,
        errorId: error.id,
        priority: 'critical',
        category: 'infrastructure',
        title: 'Fix Server Error',
        description: 'Server-side error occurred. Check server logs and error handling.',
        actionableSteps: [
          'Check server logs for detailed error information',
          'Review API endpoint implementation',
          'Verify database connections and queries',
          'Add proper error handling and logging'
        ],
        relatedFiles: ['src/app/api/**/*.ts', 'src/lib/**/*.ts'],
        estimatedEffort: 'high',
        tags: ['server-error', 'api', 'backend']
      };
    }

    // Default network error suggestion
    return {
      id,
      errorId: error.id,
      priority: error.severity,
      category: 'configuration',
      title: 'Fix Network Error',
      description: 'Network request failed. Check connectivity and endpoint configuration.',
      actionableSteps: [
        'Verify network connectivity',
        'Check API endpoint configuration',
        'Review request headers and parameters',
        'Add retry logic for transient failures'
      ],
      relatedFiles: ['src/lib/api/**/*.ts'],
      estimatedEffort: 'medium',
      tags: ['network', 'api', 'connectivity']
    };
  }

  /**
   * Generate rendering error fix suggestions
   */
  private generateRenderingErrorSuggestion(id: string, error: DetectedError): FixSuggestion {
    const message = error.message.toLowerCase();
    
    if (message.includes('broken image')) {
      return {
        id,
        errorId: error.id,
        priority: error.severity,
        category: 'data',
        title: 'Fix Broken Image',
        description: 'Image failed to load. Check image source and availability.',
        actionableSteps: [
          'Verify image URL is correct and accessible',
          'Check if image file exists in public directory',
          'Add fallback image or error handling',
          'Optimize image loading with lazy loading'
        ],
        codeExample: `<img 
  src={imageSrc} 
  alt={altText}
  onError={(e) => {
    e.target.src = '/fallback-image.png';
  }}
/>`,
        relatedFiles: ['public/**/*', 'src/components/**/*.tsx'],
        estimatedEffort: 'low',
        tags: ['images', 'assets', 'fallback']
      };
    }

    if (message.includes('missing css')) {
      return {
        id,
        errorId: error.id,
        priority: error.severity,
        category: 'configuration',
        title: 'Fix Missing CSS',
        description: 'CSS file failed to load. Check stylesheet references and build configuration.',
        actionableSteps: [
          'Verify CSS file exists and is properly imported',
          'Check build configuration for CSS processing',
          'Review Tailwind CSS configuration if applicable',
          'Ensure CSS files are included in the build output'
        ],
        relatedFiles: ['tailwind.config.js', 'src/app/globals.css', 'postcss.config.mjs'],
        estimatedEffort: 'medium',
        tags: ['css', 'styling', 'build-config']
      };
    }

    // Default rendering error suggestion
    return {
      id,
      errorId: error.id,
      priority: error.severity,
      category: 'code',
      title: 'Fix Rendering Issue',
      description: 'Component rendering failed. Check component implementation and dependencies.',
      actionableSteps: [
        'Review component code for errors',
        'Check component dependencies and imports',
        'Verify data props are properly passed',
        'Add error boundaries for better error handling'
      ],
      relatedFiles: ['src/components/**/*.tsx'],
      estimatedEffort: 'medium',
      tags: ['rendering', 'components', 'react']
    };
  }

  /**
   * Generate navigation error fix suggestions
   */
  private generateNavigationErrorSuggestion(id: string, error: DetectedError): FixSuggestion {
    return {
      id,
      errorId: error.id,
      priority: error.severity,
      category: 'configuration',
      title: 'Fix Navigation Error',
      description: 'Navigation failed. Check routing configuration and permissions.',
      actionableSteps: [
        'Verify route exists in the application',
        'Check user permissions for the route',
        'Review navigation component implementation',
        'Test navigation flow manually'
      ],
      relatedFiles: ['src/app/**/*.tsx', 'src/middleware.ts'],
      estimatedEffort: 'medium',
      tags: ['navigation', 'routing', 'permissions']
    };
  }

  /**
   * Extract file paths from stack trace
   */
  private extractFilesFromStackTrace(stackTrace?: string): string[] {
    if (!stackTrace) return [];
    
    const fileMatches = stackTrace.match(/at .+?\((.+?):\d+:\d+\)/g) || [];
    const files = fileMatches
      .map(match => {
        const pathMatch = match.match(/\((.+?):\d+:\d+\)/);
        return pathMatch ? pathMatch[1] : null;
      })
      .filter(Boolean)
      .filter(file => file && file.includes('src/'))
      .map(file => file!.replace(/.*\/src\//, 'src/'));
    
    return [...new Set(files)];
  }

  /**
   * Calculate console message relevance to error
   */
  private calculateConsoleRelevance(consoleMessage: string, errorMessage: string): number {
    const consoleLower = consoleMessage.toLowerCase();
    const errorLower = errorMessage.toLowerCase();
    
    // High relevance for exact matches or similar keywords
    if (consoleLower.includes(errorLower) || errorLower.includes(consoleLower)) {
      return 0.9;
    }
    
    // Medium relevance for error-related keywords
    const errorKeywords = ['error', 'failed', 'exception', 'undefined', 'null'];
    const hasErrorKeywords = errorKeywords.some(keyword => consoleLower.includes(keyword));
    
    if (hasErrorKeywords) {
      return 0.6;
    }
    
    // Low relevance for warnings
    if (consoleLower.includes('warn')) {
      return 0.3;
    }
    
    return 0.1;
  }

  /**
   * Generate error summary statistics
   */
  private generateErrorSummary(errors: DetectedError[]): ErrorSummary {
    const summary: ErrorSummary = {
      totalErrors: errors.length,
      criticalErrors: errors.filter(e => e.severity === 'critical').length,
      highPriorityErrors: errors.filter(e => e.severity === 'high').length,
      mediumPriorityErrors: errors.filter(e => e.severity === 'medium').length,
      lowPriorityErrors: errors.filter(e => e.severity === 'low').length,
      errorsByType: {
        runtime: errors.filter(e => e.type === 'runtime').length,
        network: errors.filter(e => e.type === 'network').length,
        rendering: errors.filter(e => e.type === 'rendering').length,
        navigation: errors.filter(e => e.type === 'navigation').length
      }
    };

    return summary;
  }

  /**
   * Group errors by user role
   */
  private groupErrorsByRole(errors: DetectedError[]): { [roleName: string]: RoleErrorSummary } {
    const roleGroups: { [roleName: string]: DetectedError[] } = {};
    
    errors.forEach(error => {
      if (!roleGroups[error.userRole]) {
        roleGroups[error.userRole] = [];
      }
      roleGroups[error.userRole].push(error);
    });

    const roleSpecificErrors: { [roleName: string]: RoleErrorSummary } = {};
    
    Object.entries(roleGroups).forEach(([roleName, roleErrors]) => {
      const commonIssues = this.identifyCommonIssues(roleErrors);
      const affectedFeatures = this.identifyAffectedFeatures(roleErrors);
      
      roleSpecificErrors[roleName] = {
        roleName,
        totalErrors: roleErrors.length,
        criticalErrors: roleErrors.filter(e => e.severity === 'critical').length,
        highPriorityErrors: roleErrors.filter(e => e.severity === 'high').length,
        errors: roleErrors,
        commonIssues,
        affectedFeatures
      };
    });

    return roleSpecificErrors;
  }

  /**
   * Categorize errors with enhanced details
   */
  private async categorizeErrorsWithDetails(errors: DetectedError[]): Promise<CategorizedErrorReport> {
    const categorized: CategorizedErrorReport = {
      runtimeErrors: [],
      networkErrors: [],
      renderingErrors: [],
      navigationErrors: []
    };

    for (const error of errors) {
      const errorDetail: ErrorDetail = {
        ...error,
        reproductionInstructions: this.generateReproductionInstructions(error),
        debuggingContext: await this.generateDebuggingContext(error),
        relatedErrors: this.findRelatedErrors(error, errors),
        fixSuggestion: await this.generateFixSuggestionForError(error) || this.getDefaultFixSuggestion(error)
      };

      switch (error.type) {
        case 'runtime':
          categorized.runtimeErrors.push(errorDetail);
          break;
        case 'network':
          categorized.networkErrors.push(errorDetail);
          break;
        case 'rendering':
          categorized.renderingErrors.push(errorDetail);
          break;
        case 'navigation':
          categorized.navigationErrors.push(errorDetail);
          break;
      }
    }

    return categorized;
  }

  /**
   * Find related errors based on similarity
   */
  private findRelatedErrors(targetError: DetectedError, allErrors: DetectedError[]): string[] {
    return allErrors
      .filter(error => 
        error.id !== targetError.id &&
        (error.url === targetError.url ||
         error.message.includes(targetError.message.split(':')[0]) ||
         error.userRole === targetError.userRole)
      )
      .map(error => error.id);
  }

  /**
   * Get default fix suggestion for errors without specific suggestions
   */
  private getDefaultFixSuggestion(error: DetectedError): FixSuggestion {
    return {
      id: `default-fix-${error.id}`,
      errorId: error.id,
      priority: error.severity,
      category: 'code',
      title: `Fix ${error.type} Error`,
      description: `Address the ${error.type} error: ${error.message}`,
      actionableSteps: [
        'Review the error details and context',
        'Identify the root cause',
        'Implement appropriate fix',
        'Test the solution thoroughly'
      ],
      relatedFiles: [],
      estimatedEffort: 'medium',
      tags: [error.type, 'general-fix']
    };
  }

  /**
   * Identify common issues across errors
   */
  private identifyCommonIssues(errors: DetectedError[]): string[] {
    const issuePatterns: { [pattern: string]: number } = {};
    
    errors.forEach(error => {
      const message = error.message.toLowerCase();
      
      // Extract common patterns
      if (message.includes('cannot read property')) {
        issuePatterns['Null/undefined property access'] = (issuePatterns['Null/undefined property access'] || 0) + 1;
      }
      if (message.includes('404')) {
        issuePatterns['Missing API endpoints'] = (issuePatterns['Missing API endpoints'] || 0) + 1;
      }
      if (message.includes('network')) {
        issuePatterns['Network connectivity issues'] = (issuePatterns['Network connectivity issues'] || 0) + 1;
      }
      if (message.includes('broken image')) {
        issuePatterns['Missing or broken images'] = (issuePatterns['Missing or broken images'] || 0) + 1;
      }
    });

    return Object.entries(issuePatterns)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .map(([pattern, _]) => pattern);
  }

  /**
   * Identify affected features from errors
   */
  private identifyAffectedFeatures(errors: DetectedError[]): string[] {
    const features = new Set<string>();
    
    errors.forEach(error => {
      const url = error.url.toLowerCase();
      
      if (url.includes('/dashboard')) features.add('Dashboard');
      if (url.includes('/analytics')) features.add('Analytics');
      if (url.includes('/team')) features.add('Team Management');
      if (url.includes('/settings')) features.add('Settings');
      if (url.includes('/profile')) features.add('User Profile');
      if (url.includes('/auth')) features.add('Authentication');
      if (url.includes('/api')) features.add('API Integration');
    });

    return Array.from(features);
  }

  /**
   * Prioritize and deduplicate fix suggestions
   */
  private prioritizeAndDeduplicateSuggestions(suggestions: FixSuggestion[]): FixSuggestion[] {
    // Group similar suggestions
    const grouped: { [key: string]: FixSuggestion[] } = {};
    
    suggestions.forEach(suggestion => {
      const key = `${suggestion.category}-${suggestion.title}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(suggestion);
    });

    // Take the highest priority suggestion from each group
    const deduplicated = Object.values(grouped).map(group => {
      return group.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })[0];
    });

    // Sort by priority
    return deduplicated.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate default coverage report
   */
  private generateDefaultCoverage(): CoverageReport {
    return {
      totalRoutes: 0,
      testedRoutes: 0,
      coveragePercentage: 0,
      roleSpecificCoverage: {},
      untestedAreas: []
    };
  }

  /**
   * Get test environment information
   */
  private async getTestEnvironment(): Promise<TestEnvironment> {
    const browserInfo = this.context.browser();
    const viewport = this.page.viewportSize() || { width: 1280, height: 720 };

    return {
      browserName: browserInfo?.browserType().name() || 'unknown',
      browserVersion: browserInfo?.version() || 'unknown',
      platform: process.platform,
      viewport,
      mockMode: true, // Assuming mock mode for comprehensive testing
      testSuite: 'comprehensive-testing'
    };
  }

  /**
   * Save error report to file
   */
  private async saveReportToFile(report: ErrorReport): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.reportDirectory, `error-report-${timestamp}.json`);
    
    try {
      await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
      console.log(`Error report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Failed to save error report:', error);
    }
  }

  /**
   * Generate HTML report for better readability
   */
  async generateHTMLReport(report: ErrorReport): Promise<string> {
    const htmlContent = this.generateHTMLContent(report);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlPath = path.join(this.reportDirectory, `error-report-${timestamp}.html`);
    
    try {
      await fs.promises.writeFile(htmlPath, htmlContent, 'utf8');
      console.log(`HTML error report saved to: ${htmlPath}`);
      return htmlPath;
    } catch (error) {
      console.error('Failed to save HTML error report:', error);
      return '';
    }
  }

  /**
   * Generate HTML content for the report
   */
  private generateHTMLContent(report: ErrorReport): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Error Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .summary-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .critical { border-left: 5px solid #dc3545; }
        .high { border-left: 5px solid #fd7e14; }
        .medium { border-left: 5px solid #ffc107; }
        .low { border-left: 5px solid #28a745; }
        .error-section { margin-bottom: 30px; }
        .error-item { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
        .error-header { font-weight: bold; margin-bottom: 10px; }
        .fix-suggestion { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 10px; margin-top: 10px; border-radius: 3px; }
        .code-example { background: #f1f1f1; padding: 10px; font-family: monospace; white-space: pre-wrap; border-radius: 3px; margin: 10px 0; }
        .tags { margin-top: 10px; }
        .tag { background: #007bff; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
        .reproduction-steps { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Comprehensive Error Report</h1>
        <p><strong>Generated:</strong> ${report.generatedAt.toISOString()}</p>
        <p><strong>Test Environment:</strong> ${report.testEnvironment.browserName} ${report.testEnvironment.browserVersion} on ${report.testEnvironment.platform}</p>
        <p><strong>Viewport:</strong> ${report.testEnvironment.viewport.width}x${report.testEnvironment.viewport.height}</p>
    </div>

    <div class="summary">
        <div class="summary-card critical">
            <h3>Critical Errors</h3>
            <div style="font-size: 2em; font-weight: bold;">${report.summary.criticalErrors}</div>
        </div>
        <div class="summary-card high">
            <h3>High Priority</h3>
            <div style="font-size: 2em; font-weight: bold;">${report.summary.highPriorityErrors}</div>
        </div>
        <div class="summary-card medium">
            <h3>Medium Priority</h3>
            <div style="font-size: 2em; font-weight: bold;">${report.summary.mediumPriorityErrors}</div>
        </div>
        <div class="summary-card low">
            <h3>Low Priority</h3>
            <div style="font-size: 2em; font-weight: bold;">${report.summary.lowPriorityErrors}</div>
        </div>
    </div>

    <div class="error-section">
        <h2>Error Details</h2>
        ${this.generateErrorDetailsHTML(report.categorizedErrors)}
    </div>

    <div class="error-section">
        <h2>Fix Suggestions</h2>
        ${this.generateFixSuggestionsHTML(report.fixSuggestions)}
    </div>

    <div class="error-section">
        <h2>Role-Specific Summary</h2>
        ${this.generateRoleSummaryHTML(report.roleSpecificErrors)}
    </div>
</body>
</html>`;
  }

  /**
   * Generate HTML for error details
   */
  private generateErrorDetailsHTML(categorizedErrors: CategorizedErrorReport): string {
    let html = '';
    
    const sections = [
      { title: 'Runtime Errors', errors: categorizedErrors.runtimeErrors },
      { title: 'Network Errors', errors: categorizedErrors.networkErrors },
      { title: 'Rendering Errors', errors: categorizedErrors.renderingErrors },
      { title: 'Navigation Errors', errors: categorizedErrors.navigationErrors }
    ];

    sections.forEach(section => {
      if (section.errors.length > 0) {
        html += `<h3>${section.title}</h3>`;
        section.errors.forEach(error => {
          html += `
            <div class="error-item ${error.severity}">
                <div class="error-header">${error.message}</div>
                <p><strong>URL:</strong> ${error.url}</p>
                <p><strong>User Role:</strong> ${error.userRole} (${error.mockUser})</p>
                <p><strong>Timestamp:</strong> ${error.timestamp.toISOString()}</p>
                
                <div class="reproduction-steps">
                    <strong>Reproduction Steps:</strong><br>
                    <pre>${error.reproductionInstructions}</pre>
                </div>
                
                <div class="fix-suggestion">
                    <strong>Fix Suggestion:</strong> ${error.fixSuggestion.title}<br>
                    ${error.fixSuggestion.description}
                    <ul>
                        ${error.fixSuggestion.actionableSteps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                    ${error.fixSuggestion.codeExample ? `<div class="code-example">${error.fixSuggestion.codeExample}</div>` : ''}
                </div>
                
                <div class="tags">
                    ${error.fixSuggestion.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
          `;
        });
      }
    });

    return html;
  }

  /**
   * Generate HTML for fix suggestions
   */
  private generateFixSuggestionsHTML(fixSuggestions: FixSuggestion[]): string {
    return fixSuggestions.map(suggestion => `
      <div class="error-item ${suggestion.priority}">
          <div class="error-header">${suggestion.title}</div>
          <p>${suggestion.description}</p>
          <p><strong>Category:</strong> ${suggestion.category}</p>
          <p><strong>Estimated Effort:</strong> ${suggestion.estimatedEffort}</p>
          
          <h4>Action Steps:</h4>
          <ul>
              ${suggestion.actionableSteps.map(step => `<li>${step}</li>`).join('')}
          </ul>
          
          ${suggestion.codeExample ? `<div class="code-example">${suggestion.codeExample}</div>` : ''}
          
          ${suggestion.relatedFiles.length > 0 ? `
              <p><strong>Related Files:</strong> ${suggestion.relatedFiles.join(', ')}</p>
          ` : ''}
          
          <div class="tags">
              ${suggestion.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
      </div>
    `).join('');
  }

  /**
   * Generate HTML for role-specific summary
   */
  private generateRoleSummaryHTML(roleSpecificErrors: { [roleName: string]: RoleErrorSummary }): string {
    return Object.values(roleSpecificErrors).map(roleSummary => `
      <div class="error-item">
          <div class="error-header">${roleSummary.roleName} Role</div>
          <p><strong>Total Errors:</strong> ${roleSummary.totalErrors}</p>
          <p><strong>Critical:</strong> ${roleSummary.criticalErrors}, <strong>High:</strong> ${roleSummary.highPriorityErrors}</p>
          
          ${roleSummary.commonIssues.length > 0 ? `
              <h4>Common Issues:</h4>
              <ul>
                  ${roleSummary.commonIssues.map(issue => `<li>${issue}</li>`).join('')}
              </ul>
          ` : ''}
          
          ${roleSummary.affectedFeatures.length > 0 ? `
              <h4>Affected Features:</h4>
              <ul>
                  ${roleSummary.affectedFeatures.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
          ` : ''}
      </div>
    `).join('');
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectoriesExist(): void {
    const directories = [
      this.reportDirectory,
      this.screenshotDirectory,
      this.domSnapshotDirectory
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
}