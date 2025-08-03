import { Page, BrowserContext } from '@playwright/test';
import { DetectedError, BrowserInfo } from './error-detector';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Error Reproduction Documentation System
 * 
 * This module creates detailed reproduction steps for each detected error,
 * includes browser information, screen resolution, and mock user context,
 * and generates prioritized error lists based on user impact and frequency.
 * 
 * Requirements: 5.1, 5.2, 5.5
 */

export interface ReproductionDocument {
  errorId: string;
  title: string;
  summary: string;
  environment: EnvironmentContext;
  reproductionSteps: DetailedStep[];
  expectedBehavior: string;
  actualBehavior: string;
  workarounds: string[];
  debuggingTips: string[];
  relatedIssues: string[];
  priority: ErrorPriority;
  impact: UserImpact;
  frequency: FrequencyData;
  assignmentSuggestion: AssignmentSuggestion;
}

export interface EnvironmentContext {
  browserInfo: BrowserInfo;
  screenResolution: { width: number; height: number };
  mockUserContext: MockUserContext;
  applicationState: ApplicationState;
  networkConditions: NetworkConditions;
  timestamp: Date;
}

export interface MockUserContext {
  userId: string;
  userName: string;
  userRole: string;
  permissions: string[];
  teamId?: string;
  organizationId?: string;
}

export interface ApplicationState {
  url: string;
  pageTitle: string;
  navigationPath: string[];
  dataState: any;
  sessionState: any;
  localStorageState: any;
}

export interface NetworkConditions {
  online: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export interface DetailedStep {
  stepNumber: number;
  action: string;
  details: string;
  expectedResult: string;
  actualResult?: string;
  screenshot?: string;
  domState?: string;
  networkActivity?: NetworkActivity[];
  timing: StepTiming;
}

export interface NetworkActivity {
  url: string;
  method: string;
  status: number;
  timing: number;
  headers: Record<string, string>;
  payload?: any;
  response?: any;
}

export interface StepTiming {
  startTime: Date;
  endTime: Date;
  duration: number;
}

export interface ErrorPriority {
  level: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  reasoning: string;
  factors: PriorityFactor[];
}

export interface PriorityFactor {
  factor: string;
  weight: number;
  description: string;
}

export interface UserImpact {
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'trivial';
  affectedUserRoles: string[];
  affectedFeatures: string[];
  businessImpact: string;
  userExperienceImpact: string;
  estimatedAffectedUsers: number;
}

export interface FrequencyData {
  occurrenceCount: number;
  timeWindow: string;
  pattern: 'constant' | 'intermittent' | 'rare' | 'one-time';
  triggers: string[];
  conditions: string[];
}

export interface AssignmentSuggestion {
  recommendedAssignee: string;
  skillsRequired: string[];
  estimatedEffort: string;
  dependencies: string[];
  suggestedApproach: string;
}

export interface PrioritizedErrorList {
  totalErrors: number;
  priorityDistribution: { [priority: string]: number };
  errors: PrioritizedError[];
  recommendations: string[];
  nextActions: string[];
}

export interface PrioritizedError {
  errorId: string;
  title: string;
  priority: ErrorPriority;
  impact: UserImpact;
  frequency: FrequencyData;
  estimatedFixTime: string;
  dependencies: string[];
  reproductionComplexity: 'simple' | 'moderate' | 'complex';
}

export class ErrorReproductionDocumenter {
  private documentDirectory: string;
  private screenshotDirectory: string;
  private reproductionSteps: DetailedStep[] = [];
  private currentStepNumber: number = 1;

  constructor(
    private page: Page,
    private context: BrowserContext,
    baseDocumentPath: string = './test-data/error-reports/reproduction-docs'
  ) {
    this.documentDirectory = baseDocumentPath;
    this.screenshotDirectory = path.join(baseDocumentPath, 'screenshots');
    this.ensureDirectoriesExist();
  }

  /**
   * Create detailed reproduction documentation for an error
   */
  async createReproductionDocument(error: DetectedError): Promise<ReproductionDocument> {
    const environment = await this.captureEnvironmentContext(error);
    const reproductionSteps = await this.generateDetailedSteps(error);
    const priority = this.calculateErrorPriority(error);
    const impact = this.assessUserImpact(error);
    const frequency = this.analyzeFrequency(error);
    const assignmentSuggestion = this.generateAssignmentSuggestion(error, priority, impact);

    const document: ReproductionDocument = {
      errorId: error.id,
      title: this.generateErrorTitle(error),
      summary: this.generateErrorSummary(error),
      environment,
      reproductionSteps,
      expectedBehavior: this.determineExpectedBehavior(error),
      actualBehavior: error.message,
      workarounds: this.identifyWorkarounds(error),
      debuggingTips: this.generateDebuggingTips(error),
      relatedIssues: this.findRelatedIssues(error),
      priority,
      impact,
      frequency,
      assignmentSuggestion
    };

    await this.saveReproductionDocument(document);
    return document;
  }  
/**
   * Generate prioritized error list based on user impact and frequency
   */
  async generatePrioritizedErrorList(errors: DetectedError[]): Promise<PrioritizedErrorList> {
    const prioritizedErrors: PrioritizedError[] = [];
    const priorityDistribution: { [priority: string]: number } = {
      'P0': 0, 'P1': 0, 'P2': 0, 'P3': 0, 'P4': 0
    };

    for (const error of errors) {
      const priority = this.calculateErrorPriority(error);
      const impact = this.assessUserImpact(error);
      const frequency = this.analyzeFrequency(error);
      
      priorityDistribution[priority.level]++;

      const prioritizedError: PrioritizedError = {
        errorId: error.id,
        title: this.generateErrorTitle(error),
        priority,
        impact,
        frequency,
        estimatedFixTime: this.estimateFixTime(error, priority, impact),
        dependencies: this.identifyDependencies(error),
        reproductionComplexity: this.assessReproductionComplexity(error)
      };

      prioritizedErrors.push(prioritizedError);
    }

    // Sort by priority level and impact
    prioritizedErrors.sort((a, b) => {
      const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3, 'P4': 4 };
      const aPriority = priorityOrder[a.priority.level];
      const bPriority = priorityOrder[b.priority.level];
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      const impactOrder = { 'blocker': 0, 'critical': 1, 'major': 2, 'minor': 3, 'trivial': 4 };
      return impactOrder[a.impact.severity] - impactOrder[b.impact.severity];
    });

    const recommendations = this.generatePriorityRecommendations(prioritizedErrors);
    const nextActions = this.generateNextActions(prioritizedErrors);

    const prioritizedList: PrioritizedErrorList = {
      totalErrors: errors.length,
      priorityDistribution,
      errors: prioritizedErrors,
      recommendations,
      nextActions
    };

    await this.savePrioritizedErrorList(prioritizedList);
    return prioritizedList;
  }

  /**
   * Capture comprehensive environment context
   */
  private async captureEnvironmentContext(error: DetectedError): Promise<EnvironmentContext> {
    const screenResolution = this.page.viewportSize() || { width: 1280, height: 720 };
    const mockUserContext = await this.extractMockUserContext(error);
    const applicationState = await this.captureApplicationState();
    const networkConditions = await this.captureNetworkConditions();

    return {
      browserInfo: error.browserInfo,
      screenResolution,
      mockUserContext,
      applicationState,
      networkConditions,
      timestamp: error.timestamp
    };
  }

  /**
   * Extract mock user context from error
   */
  private async extractMockUserContext(error: DetectedError): Promise<MockUserContext> {
    // Extract user context from page or error data
    const userContext = await this.page.evaluate(() => {
      // Try to get user context from various sources
      const sessionStorage = window.sessionStorage;
      const localStorage = window.localStorage;
      
      // Check for user data in session storage
      const sessionUser = sessionStorage.getItem('mockUser') || sessionStorage.getItem('user');
      if (sessionUser) {
        try {
          return JSON.parse(sessionUser);
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Check for user data in local storage
      const localUser = localStorage.getItem('mockUser') || localStorage.getItem('user');
      if (localUser) {
        try {
          return JSON.parse(localUser);
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Check for user data in global variables
      if ((window as any).mockUser) {
        return (window as any).mockUser;
      }
      
      return null;
    });

    return {
      userId: userContext?.id || error.mockUser,
      userName: userContext?.name || error.mockUser,
      userRole: error.userRole,
      permissions: userContext?.permissions || [],
      teamId: userContext?.teamId,
      organizationId: userContext?.organizationId
    };
  }

  /**
   * Capture current application state
   */
  private async captureApplicationState(): Promise<ApplicationState> {
    const url = this.page.url();
    const pageTitle = await this.page.title();
    
    const stateData = await this.page.evaluate(() => {
      return {
        navigationPath: (window as any).navigationHistory || [],
        dataState: (window as any).appState || {},
        sessionState: Object.fromEntries(
          Object.keys(sessionStorage).map(key => [key, sessionStorage.getItem(key)])
        ),
        localStorageState: Object.fromEntries(
          Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])
        )
      };
    });

    return {
      url,
      pageTitle,
      navigationPath: stateData.navigationPath,
      dataState: stateData.dataState,
      sessionState: stateData.sessionState,
      localStorageState: stateData.localStorageState
    };
  }

  /**
   * Capture network conditions
   */
  private async captureNetworkConditions(): Promise<NetworkConditions> {
    const networkInfo = await this.page.evaluate(() => {
      const nav = navigator as any;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
      
      return {
        online: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0
      };
    });

    return networkInfo;
  }

  /**
   * Generate detailed reproduction steps
   */
  private async generateDetailedSteps(error: DetectedError): Promise<DetailedStep[]> {
    const steps: DetailedStep[] = [];
    
    // Convert basic reproduction steps to detailed steps
    for (let i = 0; i < error.reproductionSteps.length; i++) {
      const basicStep = error.reproductionSteps[i];
      const stepNumber = i + 1;
      
      const detailedStep: DetailedStep = {
        stepNumber,
        action: this.extractActionFromStep(basicStep),
        details: this.expandStepDetails(basicStep, error),
        expectedResult: this.determineExpectedResult(basicStep, stepNumber),
        screenshot: await this.captureStepScreenshot(error.id, stepNumber),
        timing: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 0
        }
      };

      steps.push(detailedStep);
    }

    // Add final error occurrence step
    steps.push({
      stepNumber: steps.length + 1,
      action: 'Error Occurrence',
      details: `Error "${error.message}" occurs at this point`,
      expectedResult: 'Normal operation should continue',
      actualResult: error.message,
      timing: {
        startTime: error.timestamp,
        endTime: error.timestamp,
        duration: 0
      }
    });

    return steps;
  }

  /**
   * Calculate error priority based on multiple factors
   */
  private calculateErrorPriority(error: DetectedError): ErrorPriority {
    const factors: PriorityFactor[] = [];
    let totalWeight = 0;

    // Severity factor
    const severityWeights = { critical: 40, high: 30, medium: 20, low: 10 };
    const severityWeight = severityWeights[error.severity];
    factors.push({
      factor: 'Severity',
      weight: severityWeight,
      description: `Error severity is ${error.severity}`
    });
    totalWeight += severityWeight;

    // Error type factor
    const typeWeights = { runtime: 30, network: 25, rendering: 15, navigation: 10 };
    const typeWeight = typeWeights[error.type];
    factors.push({
      factor: 'Error Type',
      weight: typeWeight,
      description: `${error.type} errors affect core functionality`
    });
    totalWeight += typeWeight;

    // User role impact factor
    const roleWeights = { manager: 25, 'team-lead': 20, developer: 15 };
    const roleWeight = roleWeights[error.userRole as keyof typeof roleWeights] || 10;
    factors.push({
      factor: 'User Role Impact',
      weight: roleWeight,
      description: `Affects ${error.userRole} role functionality`
    });
    totalWeight += roleWeight;

    // URL criticality factor
    let urlWeight = 10;
    if (error.url.includes('/dashboard')) urlWeight = 25;
    else if (error.url.includes('/auth')) urlWeight = 30;
    else if (error.url.includes('/api')) urlWeight = 20;
    
    factors.push({
      factor: 'URL Criticality',
      weight: urlWeight,
      description: `Error occurs on ${this.categorizeURL(error.url)} page`
    });
    totalWeight += urlWeight;

    // Determine priority level
    let level: ErrorPriority['level'];
    let reasoning: string;

    if (totalWeight >= 90) {
      level = 'P0';
      reasoning = 'Critical blocker requiring immediate attention';
    } else if (totalWeight >= 70) {
      level = 'P1';
      reasoning = 'High priority issue affecting core functionality';
    } else if (totalWeight >= 50) {
      level = 'P2';
      reasoning = 'Medium priority issue requiring timely resolution';
    } else if (totalWeight >= 30) {
      level = 'P3';
      reasoning = 'Low priority issue for future resolution';
    } else {
      level = 'P4';
      reasoning = 'Minor issue with minimal impact';
    }

    return { level, reasoning, factors };
  }

  /**
   * Assess user impact of the error
   */
  private assessUserImpact(error: DetectedError): UserImpact {
    let severity: UserImpact['severity'];
    let businessImpact: string;
    let userExperienceImpact: string;
    let estimatedAffectedUsers: number;

    // Determine severity based on error characteristics
    if (error.severity === 'critical' && error.type === 'runtime') {
      severity = 'blocker';
      businessImpact = 'Prevents users from completing core tasks';
      userExperienceImpact = 'Application becomes unusable';
      estimatedAffectedUsers = 100;
    } else if (error.severity === 'critical' || (error.severity === 'high' && error.type === 'network')) {
      severity = 'critical';
      businessImpact = 'Significantly impacts user productivity';
      userExperienceImpact = 'Major disruption to user workflow';
      estimatedAffectedUsers = 75;
    } else if (error.severity === 'high' || error.type === 'runtime') {
      severity = 'major';
      businessImpact = 'Reduces user efficiency';
      userExperienceImpact = 'Noticeable impact on user experience';
      estimatedAffectedUsers = 50;
    } else if (error.severity === 'medium') {
      severity = 'minor';
      businessImpact = 'Minor impact on user tasks';
      userExperienceImpact = 'Slight inconvenience to users';
      estimatedAffectedUsers = 25;
    } else {
      severity = 'trivial';
      businessImpact = 'Minimal business impact';
      userExperienceImpact = 'Barely noticeable to users';
      estimatedAffectedUsers = 10;
    }

    const affectedFeatures = this.identifyAffectedFeatures(error);

    return {
      severity,
      affectedUserRoles: [error.userRole],
      affectedFeatures,
      businessImpact,
      userExperienceImpact,
      estimatedAffectedUsers
    };
  }  /**

   * Analyze error frequency patterns
   */
  private analyzeFrequency(error: DetectedError): FrequencyData {
    // In a real implementation, this would analyze historical data
    // For now, we'll make reasonable assumptions based on error characteristics
    
    let pattern: FrequencyData['pattern'];
    let occurrenceCount: number;
    let triggers: string[];
    let conditions: string[];

    if (error.severity === 'critical' && error.type === 'runtime') {
      pattern = 'constant';
      occurrenceCount = 10;
      triggers = ['Page load', 'User interaction', 'Data fetch'];
      conditions = ['Specific user role', 'Certain data states'];
    } else if (error.type === 'network') {
      pattern = 'intermittent';
      occurrenceCount = 5;
      triggers = ['Network requests', 'API calls', 'Data synchronization'];
      conditions = ['Network connectivity', 'Server availability'];
    } else if (error.type === 'rendering') {
      pattern = 'rare';
      occurrenceCount = 2;
      triggers = ['Specific screen sizes', 'Browser variations', 'CSS loading'];
      conditions = ['Browser type', 'Screen resolution', 'CSS cache'];
    } else {
      pattern = 'one-time';
      occurrenceCount = 1;
      triggers = ['Specific user action', 'Edge case scenario'];
      conditions = ['Unique circumstances', 'Rare data combination'];
    }

    return {
      occurrenceCount,
      timeWindow: '24 hours',
      pattern,
      triggers,
      conditions
    };
  }

  /**
   * Generate assignment suggestion for the error
   */
  private generateAssignmentSuggestion(
    error: DetectedError,
    priority: ErrorPriority,
    impact: UserImpact
  ): AssignmentSuggestion {
    let recommendedAssignee: string;
    let skillsRequired: string[];
    let suggestedApproach: string;
    let dependencies: string[];

    if (error.type === 'runtime') {
      recommendedAssignee = 'Frontend Developer';
      skillsRequired = ['JavaScript/TypeScript', 'React', 'Debugging'];
      suggestedApproach = 'Debug JavaScript code, add error handling, implement defensive programming';
      dependencies = ['Access to development environment', 'Error reproduction steps'];
    } else if (error.type === 'network') {
      recommendedAssignee = 'Full-Stack Developer';
      skillsRequired = ['API Development', 'Network Debugging', 'Backend Systems'];
      suggestedApproach = 'Investigate API endpoints, check server logs, implement retry logic';
      dependencies = ['Server access', 'API documentation', 'Network monitoring tools'];
    } else if (error.type === 'rendering') {
      recommendedAssignee = 'UI/UX Developer';
      skillsRequired = ['CSS', 'Responsive Design', 'Browser Compatibility'];
      suggestedApproach = 'Fix CSS issues, test across browsers, optimize rendering performance';
      dependencies = ['Design specifications', 'Browser testing tools'];
    } else {
      recommendedAssignee = 'Frontend Developer';
      skillsRequired = ['Navigation Systems', 'Routing', 'User Experience'];
      suggestedApproach = 'Fix navigation logic, update routing configuration, improve UX flow';
      dependencies = ['Navigation requirements', 'User flow documentation'];
    }

    const estimatedEffort = this.calculateEstimatedEffort(error, priority, impact);

    return {
      recommendedAssignee,
      skillsRequired,
      estimatedEffort,
      dependencies,
      suggestedApproach
    };
  }

  /**
   * Helper methods for document generation
   */
  private generateErrorTitle(error: DetectedError): string {
    const typePrefix = error.type.charAt(0).toUpperCase() + error.type.slice(1);
    const severityPrefix = error.severity.toUpperCase();
    const shortMessage = error.message.length > 50 ? 
      error.message.substring(0, 50) + '...' : 
      error.message;
    
    return `[${severityPrefix}] ${typePrefix}: ${shortMessage}`;
  }

  private generateErrorSummary(error: DetectedError): string {
    return `A ${error.severity} ${error.type} error occurred for ${error.userRole} role user "${error.mockUser}" on ${error.url}. The error "${error.message}" prevents normal operation and requires investigation.`;
  }

  private determineExpectedBehavior(error: DetectedError): string {
    if (error.type === 'runtime') {
      return 'The application should execute JavaScript code without errors and handle edge cases gracefully.';
    } else if (error.type === 'network') {
      return 'Network requests should complete successfully or fail gracefully with appropriate error handling.';
    } else if (error.type === 'rendering') {
      return 'The page should render correctly with all visual elements displayed properly.';
    } else {
      return 'Navigation should work smoothly without errors or broken links.';
    }
  }

  private identifyWorkarounds(error: DetectedError): string[] {
    const workarounds: string[] = [];
    
    if (error.type === 'runtime') {
      workarounds.push('Refresh the page to reset application state');
      workarounds.push('Try using a different browser or incognito mode');
      workarounds.push('Clear browser cache and cookies');
    } else if (error.type === 'network') {
      workarounds.push('Check internet connection and retry');
      workarounds.push('Wait a few minutes and try again');
      workarounds.push('Use a different network connection');
    } else if (error.type === 'rendering') {
      workarounds.push('Try a different screen resolution');
      workarounds.push('Use a different browser');
      workarounds.push('Disable browser extensions');
    } else {
      workarounds.push('Use browser back button and try alternative navigation');
      workarounds.push('Access the feature through a different menu path');
      workarounds.push('Refresh the page and retry navigation');
    }
    
    return workarounds;
  }

  private generateDebuggingTips(error: DetectedError): string[] {
    const tips: string[] = [];
    
    tips.push('Open browser developer tools to see console errors');
    tips.push('Check the Network tab for failed requests');
    tips.push('Examine the Elements tab for DOM issues');
    
    if (error.stackTrace) {
      tips.push('Review the stack trace to identify the error source');
      tips.push('Look for the first occurrence in your application code');
    }
    
    if (error.type === 'network') {
      tips.push('Check server logs for corresponding backend errors');
      tips.push('Verify API endpoint configuration and availability');
    }
    
    if (error.type === 'rendering') {
      tips.push('Check CSS styles and layout properties');
      tips.push('Verify image paths and resource availability');
    }
    
    return tips;
  }

  private findRelatedIssues(error: DetectedError): string[] {
    // In a real implementation, this would search for similar errors
    // For now, return placeholder related issues
    return [
      `Similar ${error.type} errors in the same component`,
      `Other errors affecting ${error.userRole} role`,
      `Errors on the same page: ${error.url}`
    ];
  }

  private extractActionFromStep(step: string): string {
    // Extract the main action from a reproduction step
    const actionPatterns = [
      /click on (.+)/i,
      /navigate to (.+)/i,
      /enter (.+)/i,
      /select (.+)/i,
      /scroll to (.+)/i
    ];
    
    for (const pattern of actionPatterns) {
      const match = step.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return step.split(':')[0] || step;
  }

  private expandStepDetails(step: string, error: DetectedError): string {
    return `${step}\n\nContext: User "${error.mockUser}" with role "${error.userRole}" performing this action on ${error.url}`;
  }

  private determineExpectedResult(step: string, stepNumber: number): string {
    if (step.toLowerCase().includes('click')) {
      return 'Element should respond to click and perform expected action';
    } else if (step.toLowerCase().includes('navigate')) {
      return 'Page should load successfully without errors';
    } else if (step.toLowerCase().includes('enter') || step.toLowerCase().includes('input')) {
      return 'Input should be accepted and validated properly';
    } else {
      return `Step ${stepNumber} should complete successfully`;
    }
  }

  private async captureStepScreenshot(errorId: string, stepNumber: number): Promise<string> {
    try {
      const filename = `step-${stepNumber}-${errorId}.png`;
      const screenshotPath = path.join(this.screenshotDirectory, filename);
      await this.page.screenshot({ path: screenshotPath });
      return screenshotPath;
    } catch (error) {
      console.warn(`Failed to capture screenshot for step ${stepNumber}:`, error);
      return '';
    }
  }

  private categorizeURL(url: string): string {
    if (url.includes('/dashboard')) return 'dashboard';
    if (url.includes('/auth')) return 'authentication';
    if (url.includes('/api')) return 'API';
    if (url.includes('/settings')) return 'settings';
    if (url.includes('/profile')) return 'profile';
    return 'general';
  }

  private identifyAffectedFeatures(error: DetectedError): string[] {
    const features: string[] = [];
    const url = error.url.toLowerCase();
    
    if (url.includes('/dashboard')) features.push('Dashboard');
    if (url.includes('/analytics')) features.push('Analytics');
    if (url.includes('/team')) features.push('Team Management');
    if (url.includes('/settings')) features.push('Settings');
    if (url.includes('/profile')) features.push('User Profile');
    if (url.includes('/auth')) features.push('Authentication');
    
    if (features.length === 0) {
      features.push('Core Application');
    }
    
    return features;
  }

  private calculateEstimatedEffort(
    error: DetectedError,
    priority: ErrorPriority,
    impact: UserImpact
  ): string {
    let baseHours = 2;
    
    // Adjust based on error type
    if (error.type === 'runtime') baseHours = 4;
    else if (error.type === 'network') baseHours = 6;
    else if (error.type === 'rendering') baseHours = 3;
    
    // Adjust based on severity
    if (error.severity === 'critical') baseHours *= 1.5;
    else if (error.severity === 'low') baseHours *= 0.5;
    
    // Adjust based on priority
    if (priority.level === 'P0') baseHours *= 2;
    else if (priority.level === 'P4') baseHours *= 0.5;
    
    if (baseHours <= 4) return `${Math.ceil(baseHours)} hours`;
    if (baseHours <= 16) return `${Math.ceil(baseHours / 8)} days`;
    return `${Math.ceil(baseHours / 40)} weeks`;
  }

  private estimateFixTime(
    error: DetectedError,
    priority: ErrorPriority,
    impact: UserImpact
  ): string {
    return this.calculateEstimatedEffort(error, priority, impact);
  }

  private identifyDependencies(error: DetectedError): string[] {
    const dependencies: string[] = [];
    
    if (error.type === 'network') {
      dependencies.push('Backend API fixes');
      dependencies.push('Database schema updates');
    }
    
    if (error.type === 'rendering') {
      dependencies.push('Design system updates');
      dependencies.push('CSS framework changes');
    }
    
    if (error.severity === 'critical') {
      dependencies.push('Code review approval');
      dependencies.push('QA testing');
    }
    
    return dependencies;
  }

  private assessReproductionComplexity(error: DetectedError): 'simple' | 'moderate' | 'complex' {
    if (error.reproductionSteps.length <= 3 && error.type !== 'network') {
      return 'simple';
    } else if (error.reproductionSteps.length <= 6 || error.type === 'rendering') {
      return 'moderate';
    } else {
      return 'complex';
    }
  }

  private generatePriorityRecommendations(errors: PrioritizedError[]): string[] {
    const recommendations: string[] = [];
    
    const p0Count = errors.filter(e => e.priority.level === 'P0').length;
    const p1Count = errors.filter(e => e.priority.level === 'P1').length;
    
    if (p0Count > 0) {
      recommendations.push(`Address ${p0Count} P0 blocker issues immediately before any other work`);
    }
    
    if (p1Count > 3) {
      recommendations.push(`High volume of P1 issues (${p1Count}) indicates systemic problems requiring architectural review`);
    }
    
    const complexErrors = errors.filter(e => e.reproductionComplexity === 'complex').length;
    if (complexErrors > 2) {
      recommendations.push(`${complexErrors} complex errors may require additional investigation time`);
    }
    
    recommendations.push('Focus on errors affecting multiple user roles first');
    recommendations.push('Consider grouping related errors for batch fixing');
    
    return recommendations;
  }

  private generateNextActions(errors: PrioritizedError[]): string[] {
    const actions: string[] = [];
    
    const topErrors = errors.slice(0, 5);
    
    actions.push('Review and assign top 5 priority errors to appropriate team members');
    actions.push('Set up daily standup to track progress on critical errors');
    actions.push('Create error monitoring dashboard for ongoing tracking');
    
    if (topErrors.some(e => e.priority.level === 'P0')) {
      actions.push('Establish war room for P0 blocker resolution');
    }
    
    actions.push('Schedule retrospective to identify root causes and prevention strategies');
    
    return actions;
  }
  /**

   * Save reproduction document to file
   */
  private async saveReproductionDocument(document: ReproductionDocument): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `reproduction-${document.errorId}-${timestamp}.json`;
    const filePath = path.join(this.documentDirectory, filename);
    
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(document, null, 2), 'utf8');
      console.log(`Reproduction document saved to: ${filePath}`);
      
      // Also save as markdown for better readability
      const markdownPath = path.join(this.documentDirectory, `reproduction-${document.errorId}-${timestamp}.md`);
      const markdownContent = this.generateMarkdownDocument(document);
      await fs.promises.writeFile(markdownPath, markdownContent, 'utf8');
      console.log(`Markdown reproduction document saved to: ${markdownPath}`);
    } catch (error) {
      console.error('Failed to save reproduction document:', error);
    }
  }

  /**
   * Save prioritized error list to file
   */
  private async savePrioritizedErrorList(list: PrioritizedErrorList): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `prioritized-errors-${timestamp}.json`;
    const filePath = path.join(this.documentDirectory, filename);
    
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(list, null, 2), 'utf8');
      console.log(`Prioritized error list saved to: ${filePath}`);
      
      // Also save as markdown for better readability
      const markdownPath = path.join(this.documentDirectory, `prioritized-errors-${timestamp}.md`);
      const markdownContent = this.generatePriorityListMarkdown(list);
      await fs.promises.writeFile(markdownPath, markdownContent, 'utf8');
      console.log(`Markdown prioritized error list saved to: ${markdownPath}`);
    } catch (error) {
      console.error('Failed to save prioritized error list:', error);
    }
  }

  /**
   * Generate markdown document for reproduction steps
   */
  private generateMarkdownDocument(document: ReproductionDocument): string {
    return `# Error Reproduction Document

## ${document.title}

**Error ID:** ${document.errorId}  
**Priority:** ${document.priority.level} - ${document.priority.reasoning}  
**Impact:** ${document.impact.severity} (affects ${document.impact.estimatedAffectedUsers}% of users)  
**Frequency:** ${document.frequency.pattern} (${document.frequency.occurrenceCount} occurrences)

## Summary

${document.summary}

## Environment Context

### Browser Information
- **Browser:** ${document.environment.browserInfo.name} ${document.environment.browserInfo.version}
- **Platform:** ${document.environment.browserInfo.platform}
- **Screen Resolution:** ${document.environment.screenResolution.width}x${document.environment.screenResolution.height}
- **Viewport:** ${document.environment.browserInfo.viewport.width}x${document.environment.browserInfo.viewport.height}

### Mock User Context
- **User ID:** ${document.environment.mockUserContext.userId}
- **User Name:** ${document.environment.mockUserContext.userName}
- **User Role:** ${document.environment.mockUserContext.userRole}
- **Permissions:** ${document.environment.mockUserContext.permissions.join(', ')}
${document.environment.mockUserContext.teamId ? `- **Team ID:** ${document.environment.mockUserContext.teamId}` : ''}
${document.environment.mockUserContext.organizationId ? `- **Organization ID:** ${document.environment.mockUserContext.organizationId}` : ''}

### Application State
- **URL:** ${document.environment.applicationState.url}
- **Page Title:** ${document.environment.applicationState.pageTitle}
- **Navigation Path:** ${document.environment.applicationState.navigationPath.join(' → ')}

### Network Conditions
- **Online:** ${document.environment.networkConditions.online}
- **Connection Type:** ${document.environment.networkConditions.connectionType}
- **Effective Type:** ${document.environment.networkConditions.effectiveType}
- **Downlink:** ${document.environment.networkConditions.downlink} Mbps
- **RTT:** ${document.environment.networkConditions.rtt} ms

## Reproduction Steps

${document.reproductionSteps.map(step => `
### Step ${step.stepNumber}: ${step.action}

**Details:** ${step.details}

**Expected Result:** ${step.expectedResult}
${step.actualResult ? `**Actual Result:** ${step.actualResult}` : ''}
${step.screenshot ? `**Screenshot:** ${step.screenshot}` : ''}
${step.domState ? `**DOM State:** ${step.domState}` : ''}

**Timing:** ${step.timing.duration}ms
${step.networkActivity && step.networkActivity.length > 0 ? `
**Network Activity:**
${step.networkActivity.map(activity => `- ${activity.method} ${activity.url} (${activity.status}) - ${activity.timing}ms`).join('\n')}
` : ''}
`).join('')}

## Expected vs Actual Behavior

### Expected Behavior
${document.expectedBehavior}

### Actual Behavior
${document.actualBehavior}

## Priority Analysis

**Priority Level:** ${document.priority.level}  
**Reasoning:** ${document.priority.reasoning}

### Priority Factors
${document.priority.factors.map(factor => `- **${factor.factor}:** ${factor.weight} points - ${factor.description}`).join('\n')}

## Impact Assessment

**Severity:** ${document.impact.severity}  
**Business Impact:** ${document.impact.businessImpact}  
**User Experience Impact:** ${document.impact.userExperienceImpact}  
**Estimated Affected Users:** ${document.impact.estimatedAffectedUsers}%

### Affected Areas
- **User Roles:** ${document.impact.affectedUserRoles.join(', ')}
- **Features:** ${document.impact.affectedFeatures.join(', ')}

## Frequency Analysis

**Pattern:** ${document.frequency.pattern}  
**Occurrence Count:** ${document.frequency.occurrenceCount} in ${document.frequency.timeWindow}

### Triggers
${document.frequency.triggers.map(trigger => `- ${trigger}`).join('\n')}

### Conditions
${document.frequency.conditions.map(condition => `- ${condition}`).join('\n')}

## Assignment Suggestion

**Recommended Assignee:** ${document.assignmentSuggestion.recommendedAssignee}  
**Estimated Effort:** ${document.assignmentSuggestion.estimatedEffort}

### Required Skills
${document.assignmentSuggestion.skillsRequired.map(skill => `- ${skill}`).join('\n')}

### Dependencies
${document.assignmentSuggestion.dependencies.map(dep => `- ${dep}`).join('\n')}

### Suggested Approach
${document.assignmentSuggestion.suggestedApproach}

## Workarounds

${document.workarounds.map(workaround => `- ${workaround}`).join('\n')}

## Debugging Tips

${document.debuggingTips.map(tip => `- ${tip}`).join('\n')}

## Related Issues

${document.relatedIssues.map(issue => `- ${issue}`).join('\n')}

---
*Generated on ${document.environment.timestamp.toLocaleString()}*
`;
  }

  /**
   * Generate markdown for prioritized error list
   */
  private generatePriorityListMarkdown(list: PrioritizedErrorList): string {
    return `# Prioritized Error List

**Total Errors:** ${list.totalErrors}  
**Generated:** ${new Date().toLocaleString()}

## Priority Distribution

${Object.entries(list.priorityDistribution).map(([priority, count]) => `- **${priority}:** ${count} errors`).join('\n')}

## Recommendations

${list.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Actions

${list.nextActions.map(action => `- ${action}`).join('\n')}

## Error Details

${list.errors.map((error, index) => `
### ${index + 1}. ${error.title}

**Error ID:** ${error.errorId}  
**Priority:** ${error.priority.level} - ${error.priority.reasoning}  
**Impact:** ${error.impact.severity}  
**Frequency:** ${error.frequency.pattern} (${error.frequency.occurrenceCount} occurrences)  
**Estimated Fix Time:** ${error.estimatedFixTime}  
**Reproduction Complexity:** ${error.reproductionComplexity}

**Affected Users:** ${error.impact.affectedUserRoles.join(', ')}  
**Affected Features:** ${error.impact.affectedFeatures.join(', ')}

${error.dependencies.length > 0 ? `**Dependencies:** ${error.dependencies.join(', ')}` : ''}

---
`).join('')}

## Summary Statistics

- **P0 Blockers:** ${list.priorityDistribution.P0} (require immediate attention)
- **P1 Critical:** ${list.priorityDistribution.P1} (high priority)
- **P2 Major:** ${list.priorityDistribution.P2} (medium priority)
- **P3 Minor:** ${list.priorityDistribution.P3} (low priority)
- **P4 Trivial:** ${list.priorityDistribution.P4} (minimal priority)

### Complexity Breakdown
- **Simple:** ${list.errors.filter(e => e.reproductionComplexity === 'simple').length} errors
- **Moderate:** ${list.errors.filter(e => e.reproductionComplexity === 'moderate').length} errors
- **Complex:** ${list.errors.filter(e => e.reproductionComplexity === 'complex').length} errors

### Impact Breakdown
- **Blocker:** ${list.errors.filter(e => e.impact.severity === 'blocker').length} errors
- **Critical:** ${list.errors.filter(e => e.impact.severity === 'critical').length} errors
- **Major:** ${list.errors.filter(e => e.impact.severity === 'major').length} errors
- **Minor:** ${list.errors.filter(e => e.impact.severity === 'minor').length} errors
- **Trivial:** ${list.errors.filter(e => e.impact.severity === 'trivial').length} errors
`;
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectoriesExist(): void {
    const directories = [this.documentDirectory, this.screenshotDirectory];
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
}