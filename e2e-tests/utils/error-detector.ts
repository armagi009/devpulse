import { Page, BrowserContext } from '@playwright/test';

/**
 * Enhanced Error Detection System
 * 
 * This module provides comprehensive error monitoring capabilities for Playwright tests.
 * It captures JavaScript runtime errors, network errors, and rendering issues with
 * severity assessment and categorization.
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

export interface DetectedError {
  id: string;
  type: 'runtime' | 'network' | 'rendering' | 'navigation' | 'import' | 'component' | 'api';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  stackTrace?: string;
  url: string;
  userRole: string;
  mockUser: string;
  timestamp: Date;
  reproductionSteps: string[];
  screenshot?: string;
  domSnapshot?: string;
  browserInfo: BrowserInfo;
  consoleMessages?: ConsoleMessage[];
  networkRequests?: NetworkRequest[];
  componentInfo?: ComponentErrorInfo;
  importError?: ImportErrorInfo;
  apiError?: ApiErrorInfo;
}

export interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  viewport: {
    width: number;
    height: number;
  };
}

export interface ConsoleMessage {
  type: 'log' | 'error' | 'warn' | 'info' | 'debug';
  text: string;
  timestamp: Date;
  location?: string;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  statusText: string;
  timestamp: Date;
  responseTime: number;
  error?: string;
}

export interface ComponentErrorInfo {
  componentName?: string;
  componentPath?: string;
  errorType: 'import' | 'render' | 'props' | 'lifecycle';
  missingDependencies?: string[];
  brokenImports?: string[];
}

export interface ImportErrorInfo {
  modulePath: string;
  importType: 'default' | 'named' | 'namespace';
  missingExports?: string[];
  circularDependency?: boolean;
  syntaxError?: boolean;
}

export interface ApiErrorInfo {
  endpoint: string;
  method: string;
  statusCode: number;
  responseBody?: string;
  requestPayload?: any;
  integrationFailure: boolean;
}

export interface ErrorCategories {
  critical: DetectedError[];
  high: DetectedError[];
  medium: DetectedError[];
  low: DetectedError[];
}

export interface RuntimeErrorMonitoringOptions {
  captureConsoleErrors?: boolean;
  monitorNetworkRequests?: boolean;
  detectComponentFailures?: boolean;
  detectImportErrors?: boolean;
  detectApiIntegrationFailures?: boolean;
  maxConsoleMessages?: number;
  maxNetworkRequests?: number;
}

export class ErrorDetector {
  private errors: DetectedError[] = [];
  private consoleMessages: ConsoleMessage[] = [];
  private networkRequests: NetworkRequest[] = [];
  private reproductionSteps: string[] = [];
  private currentUserRole: string = 'unknown';
  private currentMockUser: string = 'unknown';
  private monitoringOptions: RuntimeErrorMonitoringOptions;

  constructor(
    private page: Page, 
    private context: BrowserContext,
    options: RuntimeErrorMonitoringOptions = {}
  ) {
    this.monitoringOptions = {
      captureConsoleErrors: true,
      monitorNetworkRequests: true,
      detectComponentFailures: true,
      detectImportErrors: true,
      detectApiIntegrationFailures: true,
      maxConsoleMessages: 1000,
      maxNetworkRequests: 500,
      ...options
    };
    this.setupErrorListeners();
  }

  /**
   * Initialize error detection listeners
   */
  private setupErrorListeners(): void {
    // JavaScript runtime error detection
    this.page.on('pageerror', (error) => {
      this.captureRuntimeError(error);
    });

    // Console error monitoring
    if (this.monitoringOptions.captureConsoleErrors) {
      this.page.on('console', (msg) => {
        this.captureConsoleMessage(msg);
      });
    }

    // Network error detection
    if (this.monitoringOptions.monitorNetworkRequests) {
      this.page.on('response', (response) => {
        this.captureNetworkResponse(response);
      });

      this.page.on('requestfailed', (request) => {
        this.captureFailedRequest(request);
      });
    }

    // Enhanced error monitoring setup
    this.setupEnhancedErrorMonitoring();
  }

  /**
   * Setup enhanced error monitoring for component failures, import errors, and API integration issues
   */
  private setupEnhancedErrorMonitoring(): void {
    try {
      // Inject comprehensive error monitoring script
      this.page.addInitScript(() => {
        // Enhanced unhandled promise rejection monitoring
        window.addEventListener('unhandledrejection', (event) => {
          const error = {
            type: 'unhandled-promise-rejection',
            reason: event.reason?.toString() || 'Unknown rejection reason',
            stack: event.reason?.stack || '',
            timestamp: new Date().toISOString()
          };
          console.error('Enhanced Error Monitor - Unhandled Promise Rejection:', error);
        });

        // Component error boundary monitoring
        const originalConsoleError = console.error;
        console.error = function(...args) {
          const message = args.join(' ');
          
          // Detect React/component errors
          if (message.includes('React') || message.includes('component') || 
              message.includes('render') || message.includes('props')) {
            console.log('Enhanced Error Monitor - Component Error:', {
              type: 'component-error',
              message,
              stack: new Error().stack,
              timestamp: new Date().toISOString()
            });
          }

          // Detect import/export errors
          if (message.includes('import') || message.includes('export') || 
              message.includes('module') || message.includes('Cannot resolve')) {
            console.log('Enhanced Error Monitor - Import Error:', {
              type: 'import-error',
              message,
              stack: new Error().stack,
              timestamp: new Date().toISOString()
            });
          }

          // Detect API integration failures
          if (message.includes('fetch') || message.includes('API') || 
              message.includes('endpoint') || message.includes('request failed')) {
            console.log('Enhanced Error Monitor - API Error:', {
              type: 'api-error',
              message,
              stack: new Error().stack,
              timestamp: new Date().toISOString()
            });
          }

          originalConsoleError.apply(console, args);
        };

        // Monitor for dynamic import failures
        const originalImport = window.import || (() => {});
        if (typeof originalImport === 'function') {
          window.import = function(specifier) {
            return originalImport(specifier).catch(error => {
              console.log('Enhanced Error Monitor - Dynamic Import Failure:', {
                type: 'dynamic-import-error',
                specifier,
                error: error.toString(),
                timestamp: new Date().toISOString()
              });
              throw error;
            });
          };
        }

        // Monitor fetch API for integration failures
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          const url = args[0]?.toString() || 'unknown';
          return originalFetch.apply(this, args)
            .then(response => {
              if (!response.ok) {
                console.log('Enhanced Error Monitor - Fetch Error:', {
                  type: 'fetch-error',
                  url,
                  status: response.status,
                  statusText: response.statusText,
                  timestamp: new Date().toISOString()
                });
              }
              return response;
            })
            .catch(error => {
              console.log('Enhanced Error Monitor - Fetch Failure:', {
                type: 'fetch-failure',
                url,
                error: error.toString(),
                timestamp: new Date().toISOString()
              });
              throw error;
            });
        };
      });
    } catch (error) {
      console.warn('Failed to setup enhanced error monitoring:', error);
    }
  }

  /**
   * Capture JavaScript runtime errors
   */
  private async captureRuntimeError(error: Error): Promise<void> {
    const errorId = this.generateErrorId();
    const severity = this.assessRuntimeErrorSeverity(error);
    
    const detectedError: DetectedError = {
      id: errorId,
      type: 'runtime',
      severity,
      message: error.message,
      stackTrace: error.stack,
      url: this.page.url(),
      userRole: this.currentUserRole,
      mockUser: this.currentMockUser,
      timestamp: new Date(),
      reproductionSteps: [...this.reproductionSteps],
      browserInfo: await this.getBrowserInfo(),
      consoleMessages: [...this.consoleMessages],
      networkRequests: [...this.networkRequests]
    };

    // Capture screenshot and DOM snapshot for debugging
    try {
      detectedError.screenshot = await this.captureScreenshot(errorId);
      detectedError.domSnapshot = await this.captureDOMSnapshot();
    } catch (captureError) {
      console.warn('Failed to capture error context:', captureError);
    }

    this.errors.push(detectedError);
  }

  /**
   * Capture console messages for error context
   */
  private captureConsoleMessage(msg: any): void {
    const consoleMessage: ConsoleMessage = {
      type: msg.type() as ConsoleMessage['type'],
      text: msg.text(),
      timestamp: new Date(),
      location: msg.location()?.url
    };

    // Limit console message storage to prevent memory issues
    if (this.consoleMessages.length >= (this.monitoringOptions.maxConsoleMessages || 1000)) {
      this.consoleMessages.shift(); // Remove oldest message
    }
    this.consoleMessages.push(consoleMessage);

    // Detect console errors as potential issues
    if (msg.type() === 'error') {
      this.captureConsoleError(msg);
    }

    // Detect enhanced error monitor messages
    if (msg.type() === 'log' && msg.text().includes('Enhanced Error Monitor')) {
      this.captureEnhancedErrorMonitorMessage(msg);
    }
  }

  /**
   * Capture console errors as detected errors
   */
  private async captureConsoleError(msg: any): Promise<void> {
    const errorId = this.generateErrorId();
    const severity = this.assessConsoleErrorSeverity(msg.text());
    
    const detectedError: DetectedError = {
      id: errorId,
      type: 'runtime',
      severity,
      message: `Console Error: ${msg.text()}`,
      url: this.page.url(),
      userRole: this.currentUserRole,
      mockUser: this.currentMockUser,
      timestamp: new Date(),
      reproductionSteps: [...this.reproductionSteps],
      browserInfo: await this.getBrowserInfo(),
      consoleMessages: [...this.consoleMessages]
    };

    this.errors.push(detectedError);
  }

  /**
   * Capture enhanced error monitor messages
   */
  private async captureEnhancedErrorMonitorMessage(msg: any): Promise<void> {
    const text = msg.text();
    
    try {
      // Extract error data from the enhanced error monitor message
      const errorDataMatch = text.match(/Enhanced Error Monitor - (.+?):/);
      if (!errorDataMatch) return;

      const errorType = errorDataMatch[1];
      const errorId = this.generateErrorId();

      if (errorType === 'Component Error' && this.monitoringOptions.detectComponentFailures) {
        await this.captureComponentError(errorId, text);
      } else if (errorType === 'Import Error' && this.monitoringOptions.detectImportErrors) {
        await this.captureImportError(errorId, text);
      } else if ((errorType === 'API Error' || errorType === 'Fetch Error' || errorType === 'Fetch Failure') && 
                 this.monitoringOptions.detectApiIntegrationFailures) {
        await this.captureApiIntegrationError(errorId, text);
      }
    } catch (error) {
      console.warn('Failed to parse enhanced error monitor message:', error);
    }
  }

  /**
   * Capture component errors
   */
  private async captureComponentError(errorId: string, message: string): Promise<void> {
    const severity = this.assessComponentErrorSeverity(message);
    
    const componentInfo: ComponentErrorInfo = {
      errorType: this.determineComponentErrorType(message),
      componentName: this.extractComponentName(message),
      componentPath: this.extractComponentPath(message),
      missingDependencies: this.extractMissingDependencies(message),
      brokenImports: this.extractBrokenImports(message)
    };

    const detectedError: DetectedError = {
      id: errorId,
      type: 'component',
      severity,
      message: `Component Error: ${message}`,
      url: this.page.url(),
      userRole: this.currentUserRole,
      mockUser: this.currentMockUser,
      timestamp: new Date(),
      reproductionSteps: [...this.reproductionSteps],
      browserInfo: await this.getBrowserInfo(),
      componentInfo
    };

    this.errors.push(detectedError);
  }

  /**
   * Capture import errors
   */
  private async captureImportError(errorId: string, message: string): Promise<void> {
    const severity = this.assessImportErrorSeverity(message);
    
    const importInfo: ImportErrorInfo = {
      modulePath: this.extractModulePath(message),
      importType: this.determineImportType(message),
      missingExports: this.extractMissingExports(message),
      circularDependency: this.detectCircularDependency(message),
      syntaxError: this.detectSyntaxError(message)
    };

    const detectedError: DetectedError = {
      id: errorId,
      type: 'import',
      severity,
      message: `Import Error: ${message}`,
      url: this.page.url(),
      userRole: this.currentUserRole,
      mockUser: this.currentMockUser,
      timestamp: new Date(),
      reproductionSteps: [...this.reproductionSteps],
      browserInfo: await this.getBrowserInfo(),
      importError: importInfo
    };

    this.errors.push(detectedError);
  }

  /**
   * Capture API integration errors
   */
  private async captureApiIntegrationError(errorId: string, message: string): Promise<void> {
    const severity = this.assessApiErrorSeverity(message);
    
    const apiInfo: ApiErrorInfo = {
      endpoint: this.extractApiEndpoint(message),
      method: this.extractHttpMethod(message),
      statusCode: this.extractStatusCode(message),
      responseBody: this.extractResponseBody(message),
      integrationFailure: this.isIntegrationFailure(message)
    };

    const detectedError: DetectedError = {
      id: errorId,
      type: 'api',
      severity,
      message: `API Integration Error: ${message}`,
      url: this.page.url(),
      userRole: this.currentUserRole,
      mockUser: this.currentMockUser,
      timestamp: new Date(),
      reproductionSteps: [...this.reproductionSteps],
      browserInfo: await this.getBrowserInfo(),
      apiError: apiInfo
    };

    this.errors.push(detectedError);
  }

  /**
   * Capture network responses and detect errors
   */
  private async captureNetworkResponse(response: any): Promise<void> {
    const request = response.request();
    const networkRequest: NetworkRequest = {
      url: response.url(),
      method: request.method(),
      status: response.status(),
      statusText: response.statusText(),
      timestamp: new Date(),
      responseTime: 0 // Will be calculated if needed
    };

    // Limit network request storage to prevent memory issues
    if (this.networkRequests.length >= (this.monitoringOptions.maxNetworkRequests || 500)) {
      this.networkRequests.shift(); // Remove oldest request
    }
    this.networkRequests.push(networkRequest);

    // Detect network errors (4xx, 5xx status codes)
    if (response.status() >= 400) {
      await this.captureNetworkError(response);
    }
  }

  /**
   * Capture failed network requests
   */
  private async captureFailedRequest(request: any): Promise<void> {
    const errorId = this.generateErrorId();
    const severity = this.assessNetworkErrorSeverity(request.url());
    
    const detectedError: DetectedError = {
      id: errorId,
      type: 'network',
      severity,
      message: `Failed Request: ${request.method()} ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`,
      url: this.page.url(),
      userRole: this.currentUserRole,
      mockUser: this.currentMockUser,
      timestamp: new Date(),
      reproductionSteps: [...this.reproductionSteps],
      browserInfo: await this.getBrowserInfo(),
      networkRequests: [...this.networkRequests]
    };

    this.errors.push(detectedError);
  }

  /**
   * Capture network errors (4xx, 5xx responses)
   */
  private async captureNetworkError(response: any): Promise<void> {
    const errorId = this.generateErrorId();
    const severity = this.assessNetworkErrorSeverity(response.url(), response.status());
    
    const detectedError: DetectedError = {
      id: errorId,
      type: 'network',
      severity,
      message: `HTTP ${response.status()} ${response.statusText()}: ${response.url()}`,
      url: this.page.url(),
      userRole: this.currentUserRole,
      mockUser: this.currentMockUser,
      timestamp: new Date(),
      reproductionSteps: [...this.reproductionSteps],
      browserInfo: await this.getBrowserInfo(),
      networkRequests: [...this.networkRequests]
    };

    this.errors.push(detectedError);
  }

  /**
   * Detect rendering issues by checking for missing elements or broken layouts
   */
  async detectRenderingIssues(): Promise<void> {
    try {
      // Check for broken images
      await this.detectBrokenImages();
      
      // Check for missing CSS
      await this.detectMissingCSS();
      
      // Check for layout issues
      await this.detectLayoutIssues();
      
    } catch (error) {
      console.warn('Error during rendering issue detection:', error);
    }
  }

  /**
   * Detect broken images on the page
   */
  private async detectBrokenImages(): Promise<void> {
    const brokenImages = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => ({
          src: img.src,
          alt: img.alt,
          selector: img.tagName + (img.id ? `#${img.id}` : '') + (img.className ? `.${img.className.split(' ').join('.')}` : '')
        }));
    });

    for (const brokenImage of brokenImages) {
      const errorId = this.generateErrorId();
      
      const detectedError: DetectedError = {
        id: errorId,
        type: 'rendering',
        severity: 'medium',
        message: `Broken Image: ${brokenImage.src} (alt: "${brokenImage.alt}")`,
        url: this.page.url(),
        userRole: this.currentUserRole,
        mockUser: this.currentMockUser,
        timestamp: new Date(),
        reproductionSteps: [...this.reproductionSteps],
        browserInfo: await this.getBrowserInfo()
      };

      this.errors.push(detectedError);
    }
  }

  /**
   * Detect missing CSS files or styles
   */
  private async detectMissingCSS(): Promise<void> {
    const missingStyles = await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      const missingStylesheets: string[] = [];
      
      links.forEach(link => {
        const linkElement = link as HTMLLinkElement;
        // Check if stylesheet failed to load
        if (linkElement.sheet === null && linkElement.href) {
          missingStylesheets.push(linkElement.href);
        }
      });
      
      return missingStylesheets;
    });

    for (const missingStylesheet of missingStyles) {
      const errorId = this.generateErrorId();
      
      const detectedError: DetectedError = {
        id: errorId,
        type: 'rendering',
        severity: 'high',
        message: `Missing CSS: ${missingStylesheet}`,
        url: this.page.url(),
        userRole: this.currentUserRole,
        mockUser: this.currentMockUser,
        timestamp: new Date(),
        reproductionSteps: [...this.reproductionSteps],
        browserInfo: await this.getBrowserInfo()
      };

      this.errors.push(detectedError);
    }
  }

  /**
   * Detect layout issues like overlapping elements or invisible content
   */
  private async detectLayoutIssues(): Promise<void> {
    const layoutIssues = await this.page.evaluate(() => {
      const issues: string[] = [];
      
      // Check for elements with zero dimensions that should be visible
      const elements = Array.from(document.querySelectorAll('*'));
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);
        
        // Skip elements that are intentionally hidden
        if (styles.display === 'none' || styles.visibility === 'hidden') {
          return;
        }
        
        // Check for elements with zero dimensions
        if (rect.width === 0 && rect.height === 0 && element.children.length > 0) {
          issues.push(`Element with zero dimensions: ${element.tagName}${element.id ? `#${element.id}` : ''}${element.className ? `.${element.className.split(' ').join('.')}` : ''}`);
        }
      });
      
      return issues;
    });

    for (const issue of layoutIssues) {
      const errorId = this.generateErrorId();
      
      const detectedError: DetectedError = {
        id: errorId,
        type: 'rendering',
        severity: 'medium',
        message: `Layout Issue: ${issue}`,
        url: this.page.url(),
        userRole: this.currentUserRole,
        mockUser: this.currentMockUser,
        timestamp: new Date(),
        reproductionSteps: [...this.reproductionSteps],
        browserInfo: await this.getBrowserInfo()
      };

      this.errors.push(detectedError);
    }
  }

  // Helper methods for error analysis

  /**
   * Assess severity of component errors
   */
  private assessComponentErrorSeverity(message: string): DetectedError['severity'] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cannot read property') || 
        lowerMessage.includes('is not a function') ||
        lowerMessage.includes('render') ||
        lowerMessage.includes('lifecycle')) {
      return 'critical';
    }
    
    if (lowerMessage.includes('props') || lowerMessage.includes('state')) {
      return 'high';
    }
    
    return 'medium';
  }

  /**
   * Assess severity of import errors
   */
  private assessImportErrorSeverity(message: string): DetectedError['severity'] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cannot resolve') || 
        lowerMessage.includes('module not found') ||
        lowerMessage.includes('syntax error')) {
      return 'critical';
    }
    
    if (lowerMessage.includes('circular dependency')) {
      return 'high';
    }
    
    return 'medium';
  }

  /**
   * Assess severity of API errors
   */
  private assessApiErrorSeverity(message: string): DetectedError['severity'] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('500') || lowerMessage.includes('503') ||
        lowerMessage.includes('network error') || lowerMessage.includes('timeout')) {
      return 'critical';
    }
    
    if (lowerMessage.includes('404') || lowerMessage.includes('401') ||
        lowerMessage.includes('403')) {
      return 'high';
    }
    
    return 'medium';
  }

  /**
   * Determine component error type
   */
  private determineComponentErrorType(message: string): ComponentErrorInfo['errorType'] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('import') || lowerMessage.includes('module')) {
      return 'import';
    }
    if (lowerMessage.includes('render')) {
      return 'render';
    }
    if (lowerMessage.includes('props')) {
      return 'props';
    }
    if (lowerMessage.includes('lifecycle') || lowerMessage.includes('mount') || lowerMessage.includes('update')) {
      return 'lifecycle';
    }
    
    return 'render';
  }

  /**
   * Extract component name from error message
   */
  private extractComponentName(message: string): string | undefined {
    const componentMatch = message.match(/component[:\s]+([A-Z][a-zA-Z0-9]*)/i);
    return componentMatch ? componentMatch[1] : undefined;
  }

  /**
   * Extract component path from error message
   */
  private extractComponentPath(message: string): string | undefined {
    const pathMatch = message.match(/at\s+([^\s]+\.(?:tsx?|jsx?))/);
    return pathMatch ? pathMatch[1] : undefined;
  }

  /**
   * Extract missing dependencies from error message
   */
  private extractMissingDependencies(message: string): string[] {
    const dependencies: string[] = [];
    const depMatches = message.matchAll(/cannot find module[:\s]+['"]([^'"]+)['"]/gi);
    for (const match of depMatches) {
      dependencies.push(match[1]);
    }
    return dependencies;
  }

  /**
   * Extract broken imports from error message
   */
  private extractBrokenImports(message: string): string[] {
    const imports: string[] = [];
    const importMatches = message.matchAll(/import[:\s]+['"]([^'"]+)['"]/gi);
    for (const match of importMatches) {
      imports.push(match[1]);
    }
    return imports;
  }

  /**
   * Determine import type
   */
  private determineImportType(message: string): ImportErrorInfo['importType'] {
    if (message.includes('import * as')) {
      return 'namespace';
    }
    if (message.includes('import {')) {
      return 'named';
    }
    return 'default';
  }

  /**
   * Extract module path from error message
   */
  private extractModulePath(message: string): string {
    const pathMatch = message.match(/module[:\s]+['"]([^'"]+)['"]/i);
    return pathMatch ? pathMatch[1] : 'unknown';
  }

  /**
   * Extract missing exports from error message
   */
  private extractMissingExports(message: string): string[] {
    const exports: string[] = [];
    const exportMatches = message.matchAll(/export[:\s]+['"]([^'"]+)['"]/gi);
    for (const match of exportMatches) {
      exports.push(match[1]);
    }
    return exports;
  }

  /**
   * Detect circular dependency
   */
  private detectCircularDependency(message: string): boolean {
    return message.toLowerCase().includes('circular') || message.toLowerCase().includes('cycle');
  }

  /**
   * Detect syntax error
   */
  private detectSyntaxError(message: string): boolean {
    return message.toLowerCase().includes('syntax error') || message.toLowerCase().includes('unexpected token');
  }

  /**
   * Extract API endpoint from error message
   */
  private extractApiEndpoint(message: string): string {
    const urlMatch = message.match(/(?:url|endpoint)[:\s]+([^\s]+)/i);
    return urlMatch ? urlMatch[1] : 'unknown';
  }

  /**
   * Extract HTTP method from error message
   */
  private extractHttpMethod(message: string): string {
    const methodMatch = message.match(/\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/i);
    return methodMatch ? methodMatch[1].toUpperCase() : 'GET';
  }

  /**
   * Extract status code from error message
   */
  private extractStatusCode(message: string): number {
    const statusMatch = message.match(/status[:\s]+(\d{3})/i);
    return statusMatch ? parseInt(statusMatch[1], 10) : 0;
  }

  /**
   * Extract response body from error message
   */
  private extractResponseBody(message: string): string | undefined {
    const bodyMatch = message.match(/response[:\s]+(.+)/i);
    return bodyMatch ? bodyMatch[1] : undefined;
  }

  /**
   * Check if error indicates integration failure
   */
  private isIntegrationFailure(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return lowerMessage.includes('integration') || 
           lowerMessage.includes('connection') ||
           lowerMessage.includes('timeout') ||
           lowerMessage.includes('network');
  }

  /**
   * Assess severity of runtime errors
   */
  private assessRuntimeErrorSeverity(error: Error): DetectedError['severity'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors that break core functionality
    if (
      message.includes('cannot read property') ||
      message.includes('cannot read properties') ||
      message.includes('is not a function') ||
      message.includes('undefined is not an object') ||
      stack.includes('auth') ||
      stack.includes('session')
    ) {
      return 'critical';
    }

    // High priority errors affecting user experience
    if (
      message.includes('network error') ||
      message.includes('fetch') ||
      message.includes('api') ||
      message.includes('chart') ||
      message.includes('data')
    ) {
      return 'high';
    }

    // Medium priority errors with moderate impact
    if (
      message.includes('warning') ||
      message.includes('deprecated') ||
      message.includes('style') ||
      message.includes('css')
    ) {
      return 'medium';
    }

    // Default to medium for unknown errors
    return 'medium';
  }

  /**
   * Assess severity of console errors
   */
  private assessConsoleErrorSeverity(message: string): DetectedError['severity'] {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('uncaught') ||
      lowerMessage.includes('fatal') ||
      lowerMessage.includes('critical') ||
      lowerMessage.includes('authentication') ||
      lowerMessage.includes('authorization')
    ) {
      return 'critical';
    }

    if (
      lowerMessage.includes('failed to fetch') ||
      lowerMessage.includes('network') ||
      lowerMessage.includes('404') ||
      lowerMessage.includes('500')
    ) {
      return 'high';
    }

    if (
      lowerMessage.includes('warning') ||
      lowerMessage.includes('deprecated')
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Assess severity of network errors
   */
  private assessNetworkErrorSeverity(url: string, status?: number): DetectedError['severity'] {
    // Critical for authentication and core API endpoints
    if (url.includes('/api/auth') || url.includes('/api/session')) {
      return 'critical';
    }

    // High for 404s and 5xx errors
    if (status === 404 || (status && status >= 500)) {
      return 'high';
    }

    // High for core API endpoints
    if (url.includes('/api/') && (status && status >= 400)) {
      return 'high';
    }

    // Medium for client errors on non-critical endpoints
    if (status && status >= 400 && status < 500) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Capture screenshot for error documentation
   */
  private async captureScreenshot(errorId: string): Promise<string> {
    const screenshotPath = `./test-data/error-reports/screenshot-${errorId}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  /**
   * Capture DOM snapshot for debugging
   */
  private async captureDOMSnapshot(): Promise<string> {
    return await this.page.content();
  }

  /**
   * Get browser information
   */
  private async getBrowserInfo(): Promise<BrowserInfo> {
    const viewport = this.page.viewportSize() || { width: 0, height: 0 };
    
    return {
      name: this.context.browser()?.browserType().name() || 'unknown',
      version: this.context.browser()?.version() || 'unknown',
      platform: process.platform,
      viewport
    };
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set current user context for error tracking
   */
  setUserContext(role: string, mockUser: string): void {
    this.currentUserRole = role;
    this.currentMockUser = mockUser;
  }

  /**
   * Add reproduction step
   */
  addReproductionStep(step: string): void {
    this.reproductionSteps.push(`${new Date().toISOString()}: ${step}`);
  }

  /**
   * Clear reproduction steps
   */
  clearReproductionSteps(): void {
    this.reproductionSteps = [];
  }

  /**
   * Get all detected errors
   */
  getErrors(): DetectedError[] {
    return [...this.errors];
  }

  /**
   * Get errors categorized by severity
   */
  getCategorizedErrors(): ErrorCategories {
    return {
      critical: this.errors.filter(e => e.severity === 'critical'),
      high: this.errors.filter(e => e.severity === 'high'),
      medium: this.errors.filter(e => e.severity === 'medium'),
      low: this.errors.filter(e => e.severity === 'low')
    };
  }

  /**
   * Get error count by severity
   */
  getErrorSummary(): { total: number; critical: number; high: number; medium: number; low: number } {
    const categorized = this.getCategorizedErrors();
    return {
      total: this.errors.length,
      critical: categorized.critical.length,
      high: categorized.high.length,
      medium: categorized.medium.length,
      low: categorized.low.length
    };
  }

  /**
   * Clear all detected errors
   */
  clearErrors(): void {
    this.errors = [];
    this.consoleMessages = [];
    this.networkRequests = [];
  }

  /**
   * Get error statistics by type
   */
  getErrorStatsByType(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    
    this.errors.forEach(error => {
      stats[error.type] = (stats[error.type] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Get component-specific error summary
   */
  getComponentErrorSummary(): {
    totalComponentErrors: number;
    importErrors: number;
    renderErrors: number;
    propsErrors: number;
    lifecycleErrors: number;
    commonComponents: string[];
  } {
    const componentErrors = this.errors.filter(e => e.type === 'component');
    const importErrors = this.errors.filter(e => e.type === 'import');
    
    const componentCounts: { [key: string]: number } = {};
    
    componentErrors.forEach(error => {
      const componentName = error.componentInfo?.componentName || 'unknown';
      componentCounts[componentName] = (componentCounts[componentName] || 0) + 1;
    });
    
    const commonComponents = Object.entries(componentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);

    return {
      totalComponentErrors: componentErrors.length,
      importErrors: importErrors.length,
      renderErrors: componentErrors.filter(e => e.componentInfo?.errorType === 'render').length,
      propsErrors: componentErrors.filter(e => e.componentInfo?.errorType === 'props').length,
      lifecycleErrors: componentErrors.filter(e => e.componentInfo?.errorType === 'lifecycle').length,
      commonComponents
    };
  }

  /**
   * Get API integration error summary
   */
  getApiErrorSummary(): {
    totalApiErrors: number;
    integrationFailures: number;
    statusCodeBreakdown: { [code: number]: number };
    commonEndpoints: string[];
  } {
    const apiErrors = this.errors.filter(e => e.type === 'api');
    const statusCodes: { [code: number]: number } = {};
    const endpointCounts: { [endpoint: string]: number } = {};
    
    apiErrors.forEach(error => {
      const statusCode = error.apiError?.statusCode || 0;
      const endpoint = error.apiError?.endpoint || 'unknown';
      
      statusCodes[statusCode] = (statusCodes[statusCode] || 0) + 1;
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    });
    
    const commonEndpoints = Object.entries(endpointCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([endpoint]) => endpoint);

    return {
      totalApiErrors: apiErrors.length,
      integrationFailures: apiErrors.filter(e => e.apiError?.integrationFailure).length,
      statusCodeBreakdown: statusCodes,
      commonEndpoints
    };
  }

  /**
   * Check if any critical or high severity errors were detected
   */
  hasCriticalErrors(): boolean {
    return this.errors.some(error => error.severity === 'critical' || error.severity === 'high');
  }
}