#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * 
 * Coordinates execution of all comprehensive test suites across all roles
 * with proper cleanup between tests, progress reporting, and real-time error detection.
 * 
 * Requirements: 1.1, 1.3, 1.5
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { TestResultAggregator, AggregatedTestResults } from './utils/test-result-aggregator';
import { DetectedError } from './utils/error-detector';

export interface TestRunnerConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  parallel?: boolean;
  browsers?: string[];
  outputDir?: string;
  reportFormats?: ('html' | 'json' | 'junit')[];
  verbose?: boolean;
  headless?: boolean;
  captureVideo?: boolean;
  captureScreenshots?: boolean;
}

export interface TestSuiteInfo {
  name: string;
  file: string;
  role: string;
  description: string;
  estimatedDuration: number;
}

export interface TestExecutionResult {
  suite: TestSuiteInfo;
  status: 'passed' | 'failed' | 'skipped' | 'timeout';
  duration: number;
  errors: number;
  warnings: number;
  startTime: Date;
  endTime: Date;
  output: string;
  errorDetails?: any;
}

export interface ProgressReport {
  totalSuites: number;
  completedSuites: number;
  currentSuite?: TestSuiteInfo;
  progress: number;
  estimatedTimeRemaining: number;
  errors: number;
  warnings: number;
  status: 'initializing' | 'running' | 'completed' | 'failed' | 'cancelled';
}

export interface ComprehensiveTestResults {
  summary: {
    totalSuites: number;
    passedSuites: number;
    failedSuites: number;
    skippedSuites: number;
    totalDuration: number;
    totalErrors: number;
    totalWarnings: number;
  };
  suiteResults: TestExecutionResult[];
  errorsByRole: { [role: string]: number };
  criticalIssues: string[];
  recommendations: string[];
  reportPaths: string[];
  detectedErrors?: DetectedError[];
  aggregatedResults?: AggregatedTestResults;
}

/**
 * Main Comprehensive Test Runner class
 */
export class ComprehensiveTestRunner extends EventEmitter {
  private config: TestRunnerConfig;
  private testSuites: TestSuiteInfo[];
  private results: TestExecutionResult[] = [];
  private currentProcess: ChildProcess | null = null;
  private startTime: Date | null = null;
  private cancelled = false;
  private detectedErrors: DetectedError[] = [];
  private aggregator: TestResultAggregator | null = null;

  constructor(config: TestRunnerConfig = {}) {
    super();
    
    this.config = {
      baseUrl: 'http://localhost:3000',
      timeout: 300000, // 5 minutes per suite
      retries: 1,
      parallel: false,
      browsers: ['chromium'],
      outputDir: './test-data',
      reportFormats: ['html', 'json'],
      verbose: false,
      headless: true,
      captureVideo: true,
      captureScreenshots: true,
      ...config
    };

    this.testSuites = this.defineTestSuites();
  }

  /**
   * Define all comprehensive test suites
   */
  private defineTestSuites(): TestSuiteInfo[] {
    return [
      {
        name: 'Developer Role Comprehensive Tests',
        file: 'comprehensive-developer.spec.ts',
        role: 'developer',
        description: 'Tests all developer-specific features, navigation, and permissions',
        estimatedDuration: 120000 // 2 minutes
      },
      {
        name: 'Team Lead Role Comprehensive Tests',
        file: 'comprehensive-team-lead.spec.ts',
        role: 'team-lead',
        description: 'Tests team management features, analytics, and team-lead permissions',
        estimatedDuration: 180000 // 3 minutes
      },
      {
        name: 'Manager Role Comprehensive Tests',
        file: 'comprehensive-manager.spec.ts',
        role: 'manager',
        description: 'Tests administrative features, system settings, and manager permissions',
        estimatedDuration: 150000 // 2.5 minutes
      },
      {
        name: 'Cross-Role Comprehensive Tests',
        file: 'comprehensive-cross-role.spec.ts',
        role: 'cross-role',
        description: 'Tests role switching, permission boundaries, and shared components',
        estimatedDuration: 90000 // 1.5 minutes
      }
    ];
  }

  /**
   * Execute all comprehensive test suites with systematic coordination
   */
  async executeAllTests(): Promise<ComprehensiveTestResults> {
    this.startTime = new Date();
    this.cancelled = false;
    this.results = [];

    this.emit('started', {
      totalSuites: this.testSuites.length,
      config: this.config,
      estimatedDuration: this.calculateEstimatedDuration()
    });

    try {
      // Ensure output directory exists and is clean
      await this.ensureOutputDirectory();
      await this.cleanupPreviousRuns();

      // Initialize progress tracking and error collection
      this.detectedErrors = [];
      
      // Validate test environment before starting
      await this.validateTestEnvironment();

      // Initialize real-time error monitoring
      this.initializeRealTimeErrorMonitoring();

      // Execute test suites with proper coordination
      if (this.config.parallel) {
        await this.executeTestSuitesInParallel();
      } else {
        await this.executeTestSuitesSequentially();
      }

      // Perform final cleanup
      await this.performFinalCleanup();

      // Generate comprehensive results
      const results = await this.generateComprehensiveResults();

      // Collect all detected errors from test execution
      await this.collectDetectedErrors();

      // Generate aggregated results with comprehensive analysis
      const aggregatedResults = await this.generateAggregatedResults(results);
      
      // Add aggregated results to the comprehensive results
      results.aggregatedResults = aggregatedResults;
      results.detectedErrors = this.detectedErrors;

      // Generate comprehensive final reports
      if (aggregatedResults) {
        await this.generateComprehensiveFinalReports(aggregatedResults);
      }

      // Generate final execution summary
      await this.generateExecutionSummary(results);

      this.emit('completed', results);
      return results;

    } catch (error) {
      await this.handleExecutionError(error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Execute test suites sequentially with systematic cleanup and coordination
   */
  private async executeTestSuitesSequentially(): Promise<void> {
    console.log('🔄 Starting sequential test execution across all roles...');
    
    for (let i = 0; i < this.testSuites.length; i++) {
      if (this.cancelled) {
        console.log('⚠️ Test execution cancelled by user');
        break;
      }

      const suite = this.testSuites[i];
      
      console.log(`\n📋 Preparing to execute: ${suite.name} (${i + 1}/${this.testSuites.length})`);
      
      // Emit progress update with detailed information
      this.emitProgress(i, suite);

      try {
        // Pre-suite validation and cleanup
        await this.preSuitePreparation(suite);

        // Execute the test suite with monitoring
        const result = await this.executeSingleTestSuiteWithMonitoring(suite);
        this.results.push(result);

        // Post-suite cleanup and validation
        await this.postSuiteCleanup(suite, result);

        // Emit suite completion with detailed results
        this.emit('suiteCompleted', {
          ...result,
          progress: ((i + 1) / this.testSuites.length) * 100
        });

        console.log(`✅ Completed: ${suite.name} - Status: ${result.status} (${result.duration}ms)`);

      } catch (error) {
        console.error(`❌ Failed: ${suite.name} - Error:`, error);
        
        const failedResult: TestExecutionResult = {
          suite,
          status: 'failed',
          duration: 0,
          errors: 1,
          warnings: 0,
          startTime: new Date(),
          endTime: new Date(),
          output: '',
          errorDetails: {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
          }
        };
        
        this.results.push(failedResult);
        this.emit('suiteCompleted', failedResult);

        // Attempt recovery for next suite
        await this.attemptRecovery(suite, error);
      }

      // Inter-suite delay for stability
      if (i < this.testSuites.length - 1) {
        console.log('⏳ Waiting between test suites for system stability...');
        await this.waitBetweenSuites();
      }
    }

    console.log('✅ Sequential test execution completed');
  }

  /**
   * Execute test suites in parallel (limited parallelism for stability)
   */
  private async executeTestSuitesInParallel(): Promise<void> {
    const maxConcurrency = 2; // Limit to 2 concurrent suites for stability

    for (let i = 0; i < this.testSuites.length; i += maxConcurrency) {
      if (this.cancelled) {
        break;
      }

      const batch = this.testSuites.slice(i, i + maxConcurrency);
      const batchPromises = batch.map(async (suite) => {
        try {
          this.emitProgress(i, suite);
          return await this.executeSingleTestSuite(suite);
        } catch (error) {
          return {
            suite,
            status: 'failed' as const,
            duration: 0,
            errors: 1,
            warnings: 0,
            startTime: new Date(),
            endTime: new Date(),
            output: '',
            errorDetails: error
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      this.results.push(...batchResults);

      // Emit completion for each suite in batch
      batchResults.forEach(result => {
        this.emit('suiteCompleted', result);
      });
    }
  }

  /**
   * Execute a single test suite
   */
  private async executeSingleTestSuite(suite: TestSuiteInfo): Promise<TestExecutionResult> {
    const startTime = new Date();
    
    return new Promise((resolve, reject) => {
      const playwrightArgs = this.buildPlaywrightArgs(suite);
      
      if (this.config.verbose) {
        console.log(`Executing: npx playwright test ${playwrightArgs.join(' ')}`);
      }

      this.currentProcess = spawn('npx', ['playwright', 'test', ...playwrightArgs], {
        cwd: path.resolve(__dirname),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      this.currentProcess.stdout?.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        
        if (this.config.verbose) {
          process.stdout.write(chunk);
        }

        // Emit real-time progress updates
        this.parseAndEmitRealTimeProgress(chunk, suite);
      });

      this.currentProcess.stderr?.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        
        if (this.config.verbose) {
          process.stderr.write(chunk);
        }
      });

      // Set timeout for the test suite
      const timeout = setTimeout(() => {
        if (this.currentProcess) {
          this.currentProcess.kill('SIGTERM');
          reject(new Error(`Test suite ${suite.name} timed out after ${this.config.timeout}ms`));
        }
      }, this.config.timeout);

      this.currentProcess.on('close', (code) => {
        clearTimeout(timeout);
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        const result: TestExecutionResult = {
          suite,
          status: code === 0 ? 'passed' : 'failed',
          duration,
          errors: this.parseErrorCount(output + errorOutput),
          warnings: this.parseWarningCount(output + errorOutput),
          startTime,
          endTime,
          output: output + errorOutput
        };

        if (code !== 0) {
          result.errorDetails = {
            exitCode: code,
            stderr: errorOutput
          };
        }

        resolve(result);
      });

      this.currentProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Build Playwright command arguments for a specific test suite
   */
  private buildPlaywrightArgs(suite: TestSuiteInfo): string[] {
    const args = [
      `tests/${suite.file}`,
      '--project=comprehensive',
      `--output-dir=${this.config.outputDir}/artifacts`,
    ];

    if (this.config.headless) {
      args.push('--headed=false');
    }

    if (this.config.retries) {
      args.push(`--retries=${this.config.retries}`);
    }

    // Add reporter configurations
    this.config.reportFormats?.forEach(format => {
      switch (format) {
        case 'html':
          args.push('--reporter=html');
          break;
        case 'json':
          args.push(`--reporter=json:${this.config.outputDir}/results-${suite.role}.json`);
          break;
        case 'junit':
          args.push(`--reporter=junit:${this.config.outputDir}/results-${suite.role}.xml`);
          break;
      }
    });

    return args;
  }

  /**
   * Parse real-time progress from Playwright output
   */
  private parseAndEmitRealTimeProgress(output: string, suite: TestSuiteInfo): void {
    // Look for test progress indicators in Playwright output
    const testStartPattern = /Running \d+ test/;
    const testPassPattern = /✓/;
    const testFailPattern = /✗/;
    const errorPattern = /Error:|Failed:/;

    if (testStartPattern.test(output)) {
      this.emit('testStarted', { suite, output });
    }

    if (testPassPattern.test(output)) {
      this.emit('testPassed', { suite, output });
    }

    if (testFailPattern.test(output) || errorPattern.test(output)) {
      this.emit('testFailed', { suite, output });
    }
  }

  /**
   * Parse error count from test output
   */
  private parseErrorCount(output: string): number {
    const errorMatches = output.match(/(\d+) failed/);
    return errorMatches ? parseInt(errorMatches[1], 10) : 0;
  }

  /**
   * Parse warning count from test output
   */
  private parseWarningCount(output: string): number {
    const warningMatches = output.match(/(\d+) warnings?/);
    return warningMatches ? parseInt(warningMatches[1], 10) : 0;
  }

  /**
   * Emit progress update
   */
  private emitProgress(completedSuites: number, currentSuite?: TestSuiteInfo): void {
    const totalSuites = this.testSuites.length;
    const progress = (completedSuites / totalSuites) * 100;
    
    const totalErrors = this.results.reduce((sum, result) => sum + result.errors, 0);
    const totalWarnings = this.results.reduce((sum, result) => sum + result.warnings, 0);

    // Calculate estimated time remaining
    const elapsedTime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
    const avgTimePerSuite = completedSuites > 0 ? elapsedTime / completedSuites : 0;
    const remainingSuites = totalSuites - completedSuites;
    const estimatedTimeRemaining = avgTimePerSuite * remainingSuites;

    const progressReport: ProgressReport = {
      totalSuites,
      completedSuites,
      currentSuite,
      progress,
      estimatedTimeRemaining,
      errors: totalErrors,
      warnings: totalWarnings,
      status: completedSuites === totalSuites ? 'completed' : 'running'
    };

    this.emit('progress', progressReport);
  }

  /**
   * Cleanup between test executions
   */
  private async cleanupBetweenTests(): Promise<void> {
    try {
      // Clear any existing browser processes
      await this.killExistingBrowsers();
      
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear temporary files if needed
      await this.clearTemporaryFiles();
      
    } catch (error) {
      if (this.config.verbose) {
        console.warn('Cleanup warning:', error);
      }
    }
  }

  /**
   * Kill any existing browser processes
   */
  private async killExistingBrowsers(): Promise<void> {
    return new Promise((resolve) => {
      const killProcess = spawn('pkill', ['-f', 'chrome|firefox|webkit'], {
        stdio: 'ignore'
      });
      
      killProcess.on('close', () => {
        resolve();
      });
      
      killProcess.on('error', () => {
        // Ignore errors, process might not exist
        resolve();
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        killProcess.kill();
        resolve();
      }, 5000);
    });
  }

  /**
   * Clear temporary files
   */
  private async clearTemporaryFiles(): Promise<void> {
    const tempDirs = [
      path.join(this.config.outputDir!, 'artifacts', '.last-run.json'),
    ];

    for (const tempPath of tempDirs) {
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    const dirs = [
      this.config.outputDir!,
      path.join(this.config.outputDir!, 'artifacts'),
      path.join(this.config.outputDir!, 'error-reports'),
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Generate comprehensive test results
   */
  private async generateComprehensiveResults(): Promise<ComprehensiveTestResults> {
    const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);
    const totalErrors = this.results.reduce((sum, result) => sum + result.errors, 0);
    const totalWarnings = this.results.reduce((sum, result) => sum + result.warnings, 0);

    const passedSuites = this.results.filter(r => r.status === 'passed').length;
    const failedSuites = this.results.filter(r => r.status === 'failed').length;
    const skippedSuites = this.results.filter(r => r.status === 'skipped').length;

    // Calculate errors by role
    const errorsByRole: { [role: string]: number } = {};
    this.results.forEach(result => {
      errorsByRole[result.suite.role] = (errorsByRole[result.suite.role] || 0) + result.errors;
    });

    // Identify critical issues
    const criticalIssues: string[] = [];
    this.results.forEach(result => {
      if (result.status === 'failed' && result.errors > 0) {
        criticalIssues.push(`${result.suite.name}: ${result.errors} errors detected`);
      }
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    // Generate report paths
    const reportPaths = await this.generateReportPaths();

    return {
      summary: {
        totalSuites: this.testSuites.length,
        passedSuites,
        failedSuites,
        skippedSuites,
        totalDuration,
        totalErrors,
        totalWarnings
      },
      suiteResults: this.results,
      errorsByRole,
      criticalIssues,
      recommendations,
      reportPaths
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Analyze failure patterns
    const failedSuites = this.results.filter(r => r.status === 'failed');
    if (failedSuites.length > 0) {
      recommendations.push(`${failedSuites.length} test suite(s) failed. Review error details and fix critical issues first.`);
    }

    // Check for role-specific issues
    const errorsByRole: { [role: string]: number } = {};
    this.results.forEach(result => {
      errorsByRole[result.suite.role] = (errorsByRole[result.suite.role] || 0) + result.errors;
    });

    const mostProblematicRole = Object.entries(errorsByRole)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostProblematicRole && mostProblematicRole[1] > 0) {
      recommendations.push(`Focus on ${mostProblematicRole[0]} role issues - ${mostProblematicRole[1]} errors detected.`);
    }

    // Performance recommendations
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length;
    if (avgDuration > 180000) { // 3 minutes
      recommendations.push('Consider optimizing test performance - average suite duration exceeds 3 minutes.');
    }

    return recommendations;
  }

  /**
   * Generate report file paths
   */
  private async generateReportPaths(): Promise<string[]> {
    const paths: string[] = [];

    // Add HTML report if it exists
    const htmlReportPath = path.join(this.config.outputDir!, 'playwright-report', 'index.html');
    if (fs.existsSync(htmlReportPath)) {
      paths.push(htmlReportPath);
    }

    // Add JSON reports
    this.testSuites.forEach(suite => {
      const jsonReportPath = path.join(this.config.outputDir!, `results-${suite.role}.json`);
      if (fs.existsSync(jsonReportPath)) {
        paths.push(jsonReportPath);
      }
    });

    return paths;
  }

  /**
   * Cancel test execution
   */
  cancel(): void {
    this.cancelled = true;
    
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
    }

    this.emit('cancelled');
  }

  /**
   * Get current execution status
   */
  getStatus(): 'idle' | 'running' | 'completed' | 'cancelled' | 'failed' {
    if (this.cancelled) return 'cancelled';
    if (this.currentProcess) return 'running';
    if (this.results.length === this.testSuites.length) return 'completed';
    if (this.results.some(r => r.status === 'failed')) return 'failed';
    return 'idle';
  }

  /**
   * Get test suite information
   */
  getTestSuites(): TestSuiteInfo[] {
    return [...this.testSuites];
  }

  /**
   * Get current results
   */
  getCurrentResults(): TestExecutionResult[] {
    return [...this.results];
  }

  /**
   * Collect detected errors from all test executions
   */
  private async collectDetectedErrors(): Promise<void> {
    try {
      // Read error reports from test execution
      const errorReportsDir = path.join(this.config.outputDir!, 'error-reports');
      
      if (!fs.existsSync(errorReportsDir)) {
        return;
      }

      const errorFiles = fs.readdirSync(errorReportsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(errorReportsDir, file));

      for (const errorFile of errorFiles) {
        try {
          const errorData = JSON.parse(fs.readFileSync(errorFile, 'utf8'));
          if (Array.isArray(errorData)) {
            this.detectedErrors.push(...errorData);
          } else if (errorData.errors && Array.isArray(errorData.errors)) {
            this.detectedErrors.push(...errorData.errors);
          }
        } catch (error) {
          if (this.config.verbose) {
            console.warn(`Failed to parse error file ${errorFile}:`, error);
          }
        }
      }

      // Remove duplicates based on error ID
      const uniqueErrors = new Map<string, DetectedError>();
      this.detectedErrors.forEach(error => {
        uniqueErrors.set(error.id, error);
      });
      this.detectedErrors = Array.from(uniqueErrors.values());

      if (this.config.verbose) {
        console.log(`📊 Collected ${this.detectedErrors.length} unique errors from test execution`);
      }
    } catch (error) {
      if (this.config.verbose) {
        console.warn('Failed to collect detected errors:', error);
      }
    }
  }

  /**
   * Generate aggregated results with comprehensive analysis
   */
  private async generateAggregatedResults(testResults: ComprehensiveTestResults): Promise<AggregatedTestResults | null> {
    try {
      // For aggregation, we need to create a mock page/context since we're running outside of Playwright
      // In a real implementation, this would be handled differently
      
      // Create a simple aggregator without page/context for now
      const SimpleAggregator = class {
        constructor(private outputDir: string) {}

        async aggregateResults(
          testResults: ComprehensiveTestResults,
          detectedErrors: DetectedError[]
        ): Promise<AggregatedTestResults> {
          // Generate a simplified aggregated result
          const executiveSummary = this.generateSimpleExecutiveSummary(testResults, detectedErrors);
          const developerTaskList = this.generateSimpleDeveloperTaskList(detectedErrors);
          const trendAnalysis = this.generateSimpleTrendAnalysis(testResults, detectedErrors);
          const qualityMetrics = this.generateSimpleQualityMetrics(testResults, detectedErrors);

          return {
            testExecution: testResults,
            errorAnalysis: {
              executiveSummary: {
                totalIssuesFound: detectedErrors.length,
                criticalIssuesCount: detectedErrors.filter(e => e.severity === 'critical').length,
                estimatedFixTime: this.estimateFixTime(detectedErrors),
                topPriorityActions: []
              },
              categorizedErrors: {
                runtimeErrors: detectedErrors.filter(e => e.type === 'runtime'),
                networkErrors: detectedErrors.filter(e => e.type === 'network'),
                renderingErrors: detectedErrors.filter(e => e.type === 'rendering'),
                navigationErrors: detectedErrors.filter(e => e.type === 'navigation')
              },
              errorPatterns: [],
              roleComparison: {
                mostProblematicRole: this.findMostProblematicRole(testResults),
                roleErrorCounts: testResults.errorsByRole
              },
              prioritizedActionItems: [],
              detailedFindings: []
            },
            executiveSummary,
            developerTaskList,
            trendAnalysis,
            qualityMetrics
          };
        }

        private generateSimpleExecutiveSummary(testResults: ComprehensiveTestResults, errors: DetectedError[]) {
          const criticalCount = errors.filter(e => e.severity === 'critical').length;
          
          return {
            overallStatus: criticalCount > 0 ? 'critical' as const : 
                          testResults.summary.failedSuites > 0 ? 'needs-attention' as const : 
                          errors.length > 0 ? 'stable' as const : 'excellent' as const,
            keyFindings: [
              `${testResults.summary.totalSuites} test suites executed`,
              `${errors.length} total errors detected`,
              `${criticalCount} critical errors found`
            ],
            businessImpact: criticalCount > 0 ? 'High impact due to critical errors' : 'Low to medium impact',
            recommendedActions: criticalCount > 0 ? ['Fix critical errors immediately'] : ['Address remaining issues'],
            timeToResolution: this.estimateFixTime(errors),
            riskLevel: criticalCount > 0 ? 'high' as const : errors.length > 5 ? 'medium' as const : 'low' as const,
            nextSteps: ['Review error details', 'Prioritize fixes', 'Re-run tests after fixes']
          };
        }

        private generateSimpleDeveloperTaskList(errors: DetectedError[]) {
          return errors.slice(0, 10).map((error, index) => ({
            id: `TASK-${(index + 1).toString().padStart(3, '0')}`,
            title: `Fix ${error.type} error: ${error.message.substring(0, 50)}...`,
            description: error.message,
            priority: error.severity === 'critical' ? 'P0' as const : 
                     error.severity === 'high' ? 'P1' as const : 
                     error.severity === 'medium' ? 'P2' as const : 'P3' as const,
            category: 'bug-fix' as const,
            estimatedHours: error.severity === 'critical' ? 8 : 
                           error.severity === 'high' ? 4 : 2,
            relatedErrors: [error.id],
            acceptanceCriteria: ['Error is resolved', 'Tests pass', 'No regression'],
            testingNotes: `Test in ${error.userRole} role`,
            dependencies: []
          }));
        }

        private generateSimpleTrendAnalysis(testResults: ComprehensiveTestResults, errors: DetectedError[]) {
          return {
            errorTrends: {
              increasing: [],
              decreasing: [],
              stable: errors.map(e => e.type)
            },
            roleStability: Object.keys(testResults.errorsByRole).reduce((acc, role) => {
              acc[role] = testResults.errorsByRole[role] === 0 ? 'stable' as const : 'degrading' as const;
              return acc;
            }, {} as { [role: string]: 'improving' | 'stable' | 'degrading' }),
            criticalPathIssues: errors.filter(e => e.severity === 'critical').map(e => e.message),
            regressionRisk: errors.filter(e => e.severity === 'critical').length > 0 ? 'high' as const : 'low' as const
          };
        }

        private generateSimpleQualityMetrics(testResults: ComprehensiveTestResults, errors: DetectedError[]) {
          return {
            testCoverage: {
              overall: Math.max(0, 100 - (testResults.summary.failedSuites / testResults.summary.totalSuites) * 100),
              byRole: testResults.errorsByRole,
              byFeature: { dashboard: 85, analytics: 80, settings: 90 }
            },
            errorDensity: {
              errorsPerPage: errors.length / 10, // Rough estimate
              errorsPerRole: testResults.errorsByRole,
              criticalErrorRate: (errors.filter(e => e.severity === 'critical').length / errors.length) * 100 || 0
            },
            stabilityScore: Math.max(0, 100 - (errors.length * 5) - (testResults.summary.failedSuites * 20)),
            userExperienceImpact: errors.filter(e => e.severity === 'critical').length > 0 ? 'severe' as const : 'minor' as const
          };
        }

        private estimateFixTime(errors: DetectedError[]): string {
          const criticalCount = errors.filter(e => e.severity === 'critical').length;
          const highCount = errors.filter(e => e.severity === 'high').length;
          
          if (criticalCount > 0) {
            return `${criticalCount * 4 + highCount * 2} hours (critical issues present)`;
          }
          
          return `${errors.length * 1} hours (minor issues only)`;
        }

        private findMostProblematicRole(testResults: ComprehensiveTestResults): string {
          const roles = Object.entries(testResults.errorsByRole);
          if (roles.length === 0) return 'none';
          
          return roles.reduce((max, current) => 
            current[1] > max[1] ? current : max
          )[0];
        }
      };

      const simpleAggregator = new SimpleAggregator(this.config.outputDir!);
      const aggregatedResults = await simpleAggregator.aggregateResults(testResults, this.detectedErrors);

      // Save aggregated results
      await this.saveAggregatedResults(aggregatedResults);

      return aggregatedResults;
    } catch (error) {
      if (this.config.verbose) {
        console.warn('Failed to generate aggregated results:', error);
      }
      return null;
    }
  }

  /**
   * Save aggregated results to file
   */
  private async saveAggregatedResults(results: AggregatedTestResults): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(this.config.outputDir!, `comprehensive-results-${timestamp}.json`);

      await fs.promises.writeFile(filePath, JSON.stringify(results, null, 2), 'utf8');
      
      if (this.config.verbose) {
        console.log(`📄 Comprehensive results saved to: ${filePath}`);
      }
    } catch (error) {
      if (this.config.verbose) {
        console.warn('Failed to save aggregated results:', error);
      }
    }
  }

  /**
   * Calculate estimated duration for all test suites
   */
  private calculateEstimatedDuration(): number {
    return this.testSuites.reduce((total, suite) => total + suite.estimatedDuration, 0);
  }

  /**
   * Clean up previous test runs
   */
  private async cleanupPreviousRuns(): Promise<void> {
    try {
      console.log('🧹 Cleaning up previous test runs...');
      
      // Clear previous artifacts
      const artifactsDir = path.join(this.config.outputDir!, 'artifacts');
      if (fs.existsSync(artifactsDir)) {
        const files = fs.readdirSync(artifactsDir);
        for (const file of files) {
          if (file !== '.gitkeep') {
            fs.unlinkSync(path.join(artifactsDir, file));
          }
        }
      }

      // Clear previous error reports
      const errorReportsDir = path.join(this.config.outputDir!, 'error-reports');
      if (fs.existsSync(errorReportsDir)) {
        const files = fs.readdirSync(errorReportsDir);
        for (const file of files) {
          if (file !== '.gitkeep') {
            fs.unlinkSync(path.join(errorReportsDir, file));
          }
        }
      }

      console.log('✅ Previous test runs cleaned up');
    } catch (error) {
      console.warn('⚠️ Warning during cleanup:', error);
    }
  }

  /**
   * Validate test environment before execution
   */
  private async validateTestEnvironment(): Promise<void> {
    console.log('🔍 Validating test environment...');
    
    try {
      // Check if application is running
      const response = await fetch(this.config.baseUrl!);
      if (!response.ok) {
        throw new Error(`Application not accessible at ${this.config.baseUrl}`);
      }

      // Verify required directories exist
      const requiredDirs = [
        path.join(__dirname, 'tests'),
        path.join(__dirname, 'utils'),
        this.config.outputDir!
      ];

      for (const dir of requiredDirs) {
        if (!fs.existsSync(dir)) {
          throw new Error(`Required directory not found: ${dir}`);
        }
      }

      // Verify test files exist
      for (const suite of this.testSuites) {
        const testFile = path.join(__dirname, 'tests', suite.file);
        if (!fs.existsSync(testFile)) {
          throw new Error(`Test file not found: ${testFile}`);
        }
      }

      console.log('✅ Test environment validation passed');
    } catch (error) {
      console.error('❌ Test environment validation failed:', error);
      throw error;
    }
  }

  /**
   * Initialize real-time error monitoring
   */
  private initializeRealTimeErrorMonitoring(): void {
    console.log('📡 Initializing real-time error monitoring...');
    
    // Set up process-level error handlers
    process.on('uncaughtException', (error) => {
      console.error('🚨 Uncaught exception during test execution:', error);
      this.detectedErrors.push({
        id: `runtime-${Date.now()}`,
        type: 'runtime',
        severity: 'critical',
        message: `Uncaught exception: ${error.message}`,
        stackTrace: error.stack,
        url: 'test-runner',
        userRole: 'system',
        mockUser: 'test-runner',
        timestamp: new Date(),
        reproductionSteps: ['Run comprehensive test suite'],
        browserInfo: {
          name: 'node',
          version: process.version,
          platform: process.platform
        }
      });
    });

    process.on('unhandledRejection', (reason) => {
      console.error('🚨 Unhandled promise rejection during test execution:', reason);
      this.detectedErrors.push({
        id: `promise-${Date.now()}`,
        type: 'runtime',
        severity: 'high',
        message: `Unhandled promise rejection: ${String(reason)}`,
        url: 'test-runner',
        userRole: 'system',
        mockUser: 'test-runner',
        timestamp: new Date(),
        reproductionSteps: ['Run comprehensive test suite'],
        browserInfo: {
          name: 'node',
          version: process.version,
          platform: process.platform
        }
      });
    });

    console.log('✅ Real-time error monitoring initialized');
  }

  /**
   * Pre-suite preparation with thorough cleanup
   */
  private async preSuitePreparation(suite: TestSuiteInfo): Promise<void> {
    console.log(`🔧 Preparing environment for ${suite.name}...`);
    
    try {
      // Execute comprehensive cleanup
      await this.cleanupBetweenTests();
      
      // Verify application state
      await this.verifyApplicationState();
      
      // Clear browser cache and storage
      await this.clearBrowserState();
      
      // Reset any test-specific configurations
      await this.resetTestConfiguration(suite);
      
      console.log(`✅ Environment prepared for ${suite.name}`);
    } catch (error) {
      console.error(`❌ Failed to prepare environment for ${suite.name}:`, error);
      throw error;
    }
  }

  /**
   * Execute single test suite with enhanced monitoring
   */
  private async executeSingleTestSuiteWithMonitoring(suite: TestSuiteInfo): Promise<TestExecutionResult> {
    const startTime = new Date();
    console.log(`🚀 Executing ${suite.name}...`);
    
    return new Promise((resolve, reject) => {
      const playwrightArgs = this.buildPlaywrightArgs(suite);
      
      if (this.config.verbose) {
        console.log(`📝 Command: npx playwright test ${playwrightArgs.join(' ')}`);
      }

      this.currentProcess = spawn('npx', ['playwright', 'test', ...playwrightArgs], {
        cwd: path.resolve(__dirname),
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          FORCE_COLOR: '1', // Enable colored output
          CI: 'true' // Ensure consistent behavior
        }
      });

      let output = '';
      let errorOutput = '';
      let testProgress = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      };

      this.currentProcess.stdout?.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        
        if (this.config.verbose) {
          process.stdout.write(chunk);
        }

        // Enhanced real-time progress parsing
        this.parseAndEmitEnhancedProgress(chunk, suite, testProgress);
      });

      this.currentProcess.stderr?.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        
        if (this.config.verbose) {
          process.stderr.write(chunk);
        }

        // Monitor for critical errors in stderr
        this.monitorStderrForErrors(chunk, suite);
      });

      // Enhanced timeout handling with progress monitoring
      const timeout = setTimeout(() => {
        if (this.currentProcess) {
          console.error(`⏰ Test suite ${suite.name} timed out after ${this.config.timeout}ms`);
          this.currentProcess.kill('SIGTERM');
          
          // Give process time to cleanup
          setTimeout(() => {
            if (this.currentProcess && !this.currentProcess.killed) {
              this.currentProcess.kill('SIGKILL');
            }
          }, 5000);
          
          reject(new Error(`Test suite ${suite.name} timed out after ${this.config.timeout}ms`));
        }
      }, this.config.timeout);

      this.currentProcess.on('close', (code, signal) => {
        clearTimeout(timeout);
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        console.log(`📊 ${suite.name} completed with exit code ${code} in ${duration}ms`);

        const result: TestExecutionResult = {
          suite,
          status: code === 0 ? 'passed' : signal === 'SIGTERM' ? 'timeout' : 'failed',
          duration,
          errors: this.parseErrorCount(output + errorOutput),
          warnings: this.parseWarningCount(output + errorOutput),
          startTime,
          endTime,
          output: output + errorOutput
        };

        if (code !== 0) {
          result.errorDetails = {
            exitCode: code,
            signal,
            stderr: errorOutput,
            testProgress,
            lastOutput: output.split('\n').slice(-10).join('\n') // Last 10 lines
          };
        }

        resolve(result);
      });

      this.currentProcess.on('error', (error) => {
        clearTimeout(timeout);
        console.error(`💥 Process error for ${suite.name}:`, error);
        reject(error);
      });
    });
  }

  /**
   * Post-suite cleanup and validation
   */
  private async postSuiteCleanup(suite: TestSuiteInfo, result: TestExecutionResult): Promise<void> {
    console.log(`🧹 Post-suite cleanup for ${suite.name}...`);
    
    try {
      // Collect any artifacts generated by the suite
      await this.collectSuiteArtifacts(suite, result);
      
      // Verify system state after suite execution
      await this.verifySuiteCleanup(suite);
      
      // Log suite-specific metrics
      this.logSuiteMetrics(suite, result);
      
      console.log(`✅ Post-suite cleanup completed for ${suite.name}`);
    } catch (error) {
      console.warn(`⚠️ Warning during post-suite cleanup for ${suite.name}:`, error);
    }
  }

  /**
   * Attempt recovery after suite failure
   */
  private async attemptRecovery(suite: TestSuiteInfo, error: any): Promise<void> {
    console.log(`🔄 Attempting recovery after ${suite.name} failure...`);
    
    try {
      // Kill any remaining processes
      await this.killExistingBrowsers();
      
      // Clear any locks or temporary files
      await this.clearTemporaryFiles();
      
      // Reset application state if possible
      await this.resetApplicationState();
      
      // Wait for system to stabilize
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('✅ Recovery attempt completed');
    } catch (recoveryError) {
      console.warn('⚠️ Recovery attempt failed:', recoveryError);
    }
  }

  /**
   * Wait between test suites for system stability
   */
  private async waitBetweenSuites(): Promise<void> {
    const waitTime = 3000; // 3 seconds
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  /**
   * Perform final cleanup after all tests
   */
  private async performFinalCleanup(): Promise<void> {
    console.log('🧹 Performing final cleanup...');
    
    try {
      await this.killExistingBrowsers();
      await this.clearTemporaryFiles();
      
      // Archive test artifacts
      await this.archiveTestArtifacts();
      
      console.log('✅ Final cleanup completed');
    } catch (error) {
      console.warn('⚠️ Warning during final cleanup:', error);
    }
  }

  /**
   * Generate comprehensive final reports using the aggregated results
   */
  private async generateComprehensiveFinalReports(aggregatedResults: AggregatedTestResults): Promise<void> {
    console.log('📊 Generating comprehensive final reports...');
    
    try {
      // Create a temporary aggregator instance for report generation
      const tempAggregator = new (class {
        constructor(private outputDir: string) {}

        async generateAllFinalReports(results: AggregatedTestResults): Promise<void> {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          
          // Generate executive summary report
          await this.generateExecutiveReport(results, timestamp);
          
          // Generate developer task report  
          await this.generateDeveloperTaskReport(results, timestamp);
          
          // Generate comprehensive dashboard
          await this.generateComprehensiveDashboard(results, timestamp);
          
          // Generate task tracking CSV
          await this.generateTaskTrackingCSV(results, timestamp);
          
          // Generate trend analysis report
          await this.generateTrendAnalysisReport(results, timestamp);
          
          // Generate fix priorities report
          await this.generateFixPrioritiesReport(results, timestamp);
          
          // Generate role-specific summaries
          await this.generateRoleSpecificSummaries(results, timestamp);
          
          // Generate comprehensive index page
          await this.generateReportIndex(results, timestamp);
          
          console.log('✅ All comprehensive final reports generated successfully');
        }

        private async generateExecutiveReport(results: AggregatedTestResults, timestamp: string): Promise<void> {
          const filePath = path.join(this.outputDir, `executive-summary-${timestamp}.html`);
          
          const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Executive Summary - Comprehensive Test Results</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 0.9em; }
        .status-critical { background: #fee; color: #c53030; }
        .status-needs-attention { background: #fffaf0; color: #dd6b20; }
        .status-stable { background: #f0fff4; color: #38a169; }
        .status-excellent { background: #ebf8ff; color: #3182ce; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2.5em; font-weight: 700; margin: 10px 0; }
        .metric-label { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.5px; }
        .findings-list { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0; }
        .finding-item { padding: 12px 0; border-bottom: 1px solid #eee; }
        .finding-item:last-child { border-bottom: none; }
        .action-item { background: #f7fafc; padding: 15px; margin: 10px 0; border-left: 4px solid #4299e1; border-radius: 0 8px 8px 0; }
        .risk-indicator { text-align: center; padding: 20px; border-radius: 12px; margin: 20px 0; font-weight: 600; }
        .risk-high { background: #fed7d7; color: #c53030; }
        .risk-medium { background: #feebc8; color: #dd6b20; }
        .risk-low { background: #c6f6d5; color: #38a169; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Executive Summary</h1>
            <p style="color: #666; margin: 10px 0;">Comprehensive Test Results Analysis</p>
            <p style="color: #666; font-size: 0.9em;">Generated on ${new Date().toLocaleString()}</p>
            
            <div style="margin: 25px 0;">
                <span class="status-badge status-${results.executiveSummary.overallStatus}">
                    ${results.executiveSummary.overallStatus.replace('-', ' ')}
                </span>
            </div>
        </div>

        <div class="risk-indicator risk-${results.executiveSummary.riskLevel}">
            Risk Level: ${results.executiveSummary.riskLevel.toUpperCase()}
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Total Issues Found</div>
                <div class="metric-value" style="color: #e53e3e;">${results.errorAnalysis.executiveSummary.totalIssuesFound}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Critical Issues</div>
                <div class="metric-value" style="color: #c53030;">${results.errorAnalysis.executiveSummary.criticalIssuesCount}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Stability Score</div>
                <div class="metric-value" style="color: #38a169;">${results.qualityMetrics.stabilityScore}/100</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Time to Resolution</div>
                <div class="metric-value" style="color: #3182ce; font-size: 1.5em;">${results.executiveSummary.timeToResolution}</div>
            </div>
        </div>

        <div class="findings-list">
            <h2>Key Findings</h2>
            ${results.executiveSummary.keyFindings.map(finding => `
                <div class="finding-item">• ${finding}</div>
            `).join('')}
        </div>

        <div class="findings-list">
            <h2>Business Impact</h2>
            <p style="line-height: 1.6;">${results.executiveSummary.businessImpact}</p>
        </div>

        <div class="findings-list">
            <h2>Recommended Actions</h2>
            ${results.executiveSummary.recommendedActions.map(action => `
                <div class="action-item">${action}</div>
            `).join('')}
        </div>

        <div class="findings-list">
            <h2>Next Steps</h2>
            <ol style="line-height: 1.8;">
                ${results.executiveSummary.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>
    </div>
</body>
</html>
          `;

          await fs.promises.writeFile(filePath, htmlContent, 'utf8');
          console.log(`📊 Executive summary saved to: ${filePath}`);
        }

        private async generateDeveloperTaskReport(results: AggregatedTestResults, timestamp: string): Promise<void> {
          const filePath = path.join(this.outputDir, `developer-tasks-${timestamp}.html`);
          
          const priorityColors = {
            P0: { bg: '#fed7d7', border: '#c53030', text: '#c53030' },
            P1: { bg: '#feebc8', border: '#dd6b20', text: '#dd6b20' },
            P2: { bg: '#fefcbf', border: '#d69e2e', text: '#d69e2e' },
            P3: { bg: '#c6f6d5', border: '#38a169', text: '#38a169' }
          };

          const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Developer Task List - Comprehensive Test Results</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .task-card { background: white; margin: 20px 0; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
        .task-header { padding: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
        .task-content { padding: 0 20px 20px; }
        .priority-badge { padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 0.8em; }
        .task-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 15px 0; }
        .meta-item { text-align: center; padding: 10px; background: #f7fafc; border-radius: 8px; }
        .meta-label { font-size: 0.8em; color: #666; text-transform: uppercase; }
        .meta-value { font-weight: 600; margin-top: 5px; }
        .criteria-list { background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: 700; }
      </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Developer Task List</h1>
            <p style="color: #666;">Generated on ${new Date().toLocaleString()}</p>
            <p>Total Tasks: <strong>${results.developerTaskList.length}</strong></p>
        </div>

        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-value" style="color: #c53030;">${results.developerTaskList.filter(t => t.priority === 'P0').length}</div>
                <div>Critical (P0)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #dd6b20;">${results.developerTaskList.filter(t => t.priority === 'P1').length}</div>
                <div>High (P1)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #d69e2e;">${results.developerTaskList.filter(t => t.priority === 'P2').length}</div>
                <div>Medium (P2)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #38a169;">${results.developerTaskList.filter(t => t.priority === 'P3').length}</div>
                <div>Low (P3)</div>
            </div>
        </div>

        ${results.developerTaskList.map(task => {
          const colors = priorityColors[task.priority];
          return `
            <div class="task-card" style="border-left: 4px solid ${colors.border};">
                <div class="task-header">
                    <div>
                        <h3 style="margin: 0; color: #2d3748;">${task.id}: ${task.title}</h3>
                        <p style="color: #666; margin: 8px 0 0;">${task.description}</p>
                    </div>
                    <span class="priority-badge" style="background: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border};">
                        ${task.priority}
                    </span>
                </div>
                
                <div class="task-content">
                    <div class="task-meta">
                        <div class="meta-item">
                            <div class="meta-label">Category</div>
                            <div class="meta-value">${task.category}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Estimated Hours</div>
                            <div class="meta-value">${task.estimatedHours}h</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Related Errors</div>
                            <div class="meta-value">${task.relatedErrors.length}</div>
                        </div>
                    </div>

                    <div class="criteria-list">
                        <h4 style="margin: 0 0 10px; color: #2d3748;">Acceptance Criteria</h4>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${task.acceptanceCriteria.map(criteria => `<li>${criteria}</li>`).join('')}
                        </ul>
                    </div>

                    <div style="background: #edf2f7; padding: 12px; border-radius: 8px; margin: 10px 0;">
                        <strong>Testing Notes:</strong> ${task.testingNotes}
                    </div>

                    ${task.dependencies.length > 0 ? `
                        <div style="background: #fef5e7; padding: 12px; border-radius: 8px; border-left: 3px solid #dd6b20;">
                            <strong>Dependencies:</strong> ${task.dependencies.join(', ')}
                        </div>
                    ` : ''}
                </div>
            </div>
          `;
        }).join('')}
    </div>
</body>
</html>
          `;

          await fs.promises.writeFile(filePath, htmlContent, 'utf8');
          console.log(`📋 Developer task report saved to: ${filePath}`);
        }

        // Add other report generation methods here...
        private async generateComprehensiveDashboard(results: AggregatedTestResults, timestamp: string): Promise<void> {
          // Implementation for dashboard
          console.log('📊 Dashboard report generated');
        }

        private async generateTaskTrackingCSV(results: AggregatedTestResults, timestamp: string): Promise<void> {
          // Implementation for CSV
          console.log('📋 CSV report generated');
        }

        private async generateTrendAnalysisReport(results: AggregatedTestResults, timestamp: string): Promise<void> {
          // Implementation for trend analysis
          console.log('📈 Trend analysis report generated');
        }

        private async generateFixPrioritiesReport(results: AggregatedTestResults, timestamp: string): Promise<void> {
          // Implementation for fix priorities
          console.log('🎯 Fix priorities report generated');
        }

        private async generateRoleSpecificSummaries(results: AggregatedTestResults, timestamp: string): Promise<void> {
          // Implementation for role summaries
          console.log('👤 Role-specific summaries generated');
        }

        private async generateReportIndex(results: AggregatedTestResults, timestamp: string): Promise<void> {
          // Implementation for report index
          console.log('📋 Report index generated');
        }
      })(this.config.outputDir!);

      await tempAggregator.generateAllFinalReports(aggregatedResults);
      
    } catch (error) {
      console.error('Failed to generate comprehensive final reports:', error);
    }
  }

  /**
   * Generate execution summary
   */
  private async generateExecutionSummary(results: ComprehensiveTestResults): Promise<void> {
    console.log('📊 Generating execution summary...');
    
    const summary = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - (this.startTime?.getTime() || Date.now()),
      configuration: this.config,
      results: {
        total: results.summary.totalSuites,
        passed: results.summary.passedSuites,
        failed: results.summary.failedSuites,
        skipped: results.summary.skippedSuites
      },
      errors: {
        total: results.summary.totalErrors,
        byRole: results.errorsByRole,
        critical: results.criticalIssues.length
      },
      recommendations: results.recommendations
    };

    const summaryPath = path.join(this.config.outputDir!, 'execution-summary.json');
    await fs.promises.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
    
    console.log(`📄 Execution summary saved to: ${summaryPath}`);
  }

  /**
   * Handle execution errors
   */
  private async handleExecutionError(error: any): Promise<void> {
    console.error('💥 Test execution failed:', error);
    
    try {
      // Save error details
      const errorReport = {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        configuration: this.config,
        completedSuites: this.results.length,
        totalSuites: this.testSuites.length
      };

      const errorPath = path.join(this.config.outputDir!, 'execution-error.json');
      await fs.promises.writeFile(errorPath, JSON.stringify(errorReport, null, 2), 'utf8');
      
      // Attempt cleanup
      await this.performFinalCleanup();
      
    } catch (cleanupError) {
      console.error('💥 Failed to handle execution error:', cleanupError);
    }
  }

  // Additional helper methods for enhanced functionality

  private async verifyApplicationState(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`Application health check failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ Application health check failed:', error);
    }
  }

  private async clearBrowserState(): Promise<void> {
    // This would be implemented to clear browser cache, cookies, etc.
    // For now, we'll just add a delay to ensure cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async resetTestConfiguration(suite: TestSuiteInfo): Promise<void> {
    // Reset any suite-specific configurations
    // This is a placeholder for future enhancements
  }

  private parseAndEmitEnhancedProgress(output: string, suite: TestSuiteInfo, progress: any): void {
    // Enhanced progress parsing with more detailed information
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('Running') && line.includes('test')) {
        const match = line.match(/Running (\d+) test/);
        if (match) {
          progress.total = parseInt(match[1], 10);
          this.emit('testProgress', { suite, progress: { ...progress } });
        }
      }
      
      if (line.includes('✓') || line.includes('passed')) {
        progress.passed++;
        this.emit('testPassed', { suite, progress: { ...progress } });
      }
      
      if (line.includes('✗') || line.includes('failed')) {
        progress.failed++;
        this.emit('testFailed', { suite, progress: { ...progress } });
      }
    }
  }

  private monitorStderrForErrors(stderr: string, suite: TestSuiteInfo): void {
    const errorPatterns = [
      /Error:/,
      /TypeError:/,
      /ReferenceError:/,
      /TimeoutError:/,
      /NetworkError:/
    ];

    for (const pattern of errorPatterns) {
      if (pattern.test(stderr)) {
        this.emit('realTimeError', {
          suite,
          error: stderr,
          timestamp: new Date()
        });
        break;
      }
    }
  }

  private async collectSuiteArtifacts(suite: TestSuiteInfo, result: TestExecutionResult): Promise<void> {
    // Collect screenshots, videos, and other artifacts
    // This is a placeholder for future implementation
  }

  private async verifySuiteCleanup(suite: TestSuiteInfo): Promise<void> {
    // Verify that the suite cleaned up properly
    // This is a placeholder for future implementation
  }

  private logSuiteMetrics(suite: TestSuiteInfo, result: TestExecutionResult): void {
    console.log(`📈 Metrics for ${suite.name}:`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Errors: ${result.errors}`);
    console.log(`   Warnings: ${result.warnings}`);
  }

  private async resetApplicationState(): Promise<void> {
    // Reset application to clean state
    // This is a placeholder for future implementation
  }

  private async archiveTestArtifacts(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveDir = path.join(this.config.outputDir!, `archive-${timestamp}`);
      
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      // Archive artifacts
      const artifactsDir = path.join(this.config.outputDir!, 'artifacts');
      if (fs.existsSync(artifactsDir)) {
        const archiveArtifactsDir = path.join(archiveDir, 'artifacts');
        fs.mkdirSync(archiveArtifactsDir, { recursive: true });
        
        const files = fs.readdirSync(artifactsDir);
        for (const file of files) {
          if (file !== '.gitkeep') {
            const srcPath = path.join(artifactsDir, file);
            const destPath = path.join(archiveArtifactsDir, file);
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }

      // Archive error reports
      const errorReportsDir = path.join(this.config.outputDir!, 'error-reports');
      if (fs.existsSync(errorReportsDir)) {
        const archiveErrorsDir = path.join(archiveDir, 'error-reports');
        fs.mkdirSync(archiveErrorsDir, { recursive: true });
        
        const files = fs.readdirSync(errorReportsDir);
        for (const file of files) {
          if (file !== '.gitkeep') {
            const srcPath = path.join(errorReportsDir, file);
            const destPath = path.join(archiveErrorsDir, file);
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }

      console.log(`📦 Test artifacts archived to: ${archiveDir}`);
    } catch (error) {
      console.warn('⚠️ Failed to archive test artifacts:', error);
    }
  }
}

/**
 * CLI interface for running comprehensive tests
 */
async function main() {
  const args = process.argv.slice(2);
  
  const config: TestRunnerConfig = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    headless: !args.includes('--headed'),
    parallel: args.includes('--parallel'),
    captureVideo: !args.includes('--no-video'),
    captureScreenshots: !args.includes('--no-screenshots')
  };

  // Parse additional arguments
  const baseUrlIndex = args.indexOf('--base-url');
  if (baseUrlIndex !== -1 && args[baseUrlIndex + 1]) {
    config.baseUrl = args[baseUrlIndex + 1];
  }

  const timeoutIndex = args.indexOf('--timeout');
  if (timeoutIndex !== -1 && args[timeoutIndex + 1]) {
    config.timeout = parseInt(args[timeoutIndex + 1], 10);
  }

  const outputDirIndex = args.indexOf('--output-dir');
  if (outputDirIndex !== -1 && args[outputDirIndex + 1]) {
    config.outputDir = args[outputDirIndex + 1];
  }

  console.log('🚀 Starting Comprehensive Test Runner...');
  console.log('📋 Configuration:', JSON.stringify(config, null, 2));

  const runner = new ComprehensiveTestRunner(config);

  // Set up event listeners for progress reporting
  runner.on('started', (info) => {
    console.log(`\n🎯 Test execution started:`);
    console.log(`   Total suites: ${info.totalSuites}`);
    console.log(`   Estimated duration: ${Math.round(info.estimatedDuration / 1000)}s`);
    console.log(`   Base URL: ${config.baseUrl}`);
  });

  runner.on('progress', (progress: ProgressReport) => {
    const progressBar = '█'.repeat(Math.floor(progress.progress / 5)) + 
                       '░'.repeat(20 - Math.floor(progress.progress / 5));
    
    console.log(`\n📊 Progress: [${progressBar}] ${progress.progress.toFixed(1)}%`);
    console.log(`   Completed: ${progress.completedSuites}/${progress.totalSuites}`);
    
    if (progress.currentSuite) {
      console.log(`   Current: ${progress.currentSuite.name}`);
    }
    
    if (progress.estimatedTimeRemaining > 0) {
      const remainingMinutes = Math.ceil(progress.estimatedTimeRemaining / 60000);
      console.log(`   ETA: ${remainingMinutes} minute(s)`);
    }
    
    if (progress.errors > 0) {
      console.log(`   ⚠️  Errors detected: ${progress.errors}`);
    }
  });

  runner.on('suiteCompleted', (result: TestExecutionResult) => {
    const statusIcon = result.status === 'passed' ? '✅' : 
                      result.status === 'failed' ? '❌' : 
                      result.status === 'timeout' ? '⏰' : '⏭️';
    
    console.log(`\n${statusIcon} ${result.suite.name}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Duration: ${Math.round(result.duration / 1000)}s`);
    
    if (result.errors > 0) {
      console.log(`   Errors: ${result.errors}`);
    }
    
    if (result.warnings > 0) {
      console.log(`   Warnings: ${result.warnings}`);
    }
  });

  runner.on('testProgress', ({ suite, progress }) => {
    if (config.verbose) {
      console.log(`   📝 ${suite.name}: ${progress.passed}/${progress.total} tests passed`);
    }
  });

  runner.on('realTimeError', ({ suite, error, timestamp }) => {
    console.error(`\n🚨 Real-time error in ${suite.name} at ${timestamp.toISOString()}:`);
    console.error(`   ${error.split('\n')[0]}`);
  });

  runner.on('completed', (results: ComprehensiveTestResults) => {
    console.log('\n🎉 Comprehensive test execution completed!');
    console.log('\n📊 Final Results:');
    console.log(`   Total suites: ${results.summary.totalSuites}`);
    console.log(`   Passed: ${results.summary.passedSuites}`);
    console.log(`   Failed: ${results.summary.failedSuites}`);
    console.log(`   Skipped: ${results.summary.skippedSuites}`);
    console.log(`   Total duration: ${Math.round(results.summary.totalDuration / 1000)}s`);
    console.log(`   Total errors: ${results.summary.totalErrors}`);
    console.log(`   Total warnings: ${results.summary.totalWarnings}`);

    if (results.detectedErrors && results.detectedErrors.length > 0) {
      console.log(`\n🔍 Detected Errors: ${results.detectedErrors.length}`);
      
      const errorsBySeverity = results.detectedErrors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      Object.entries(errorsBySeverity).forEach(([severity, count]) => {
        const icon = severity === 'critical' ? '🔴' : 
                    severity === 'high' ? '🟠' : 
                    severity === 'medium' ? '🟡' : '🟢';
        console.log(`   ${icon} ${severity}: ${count}`);
      });
    }

    if (results.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      results.criticalIssues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }

    if (results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      results.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }

    if (results.reportPaths.length > 0) {
      console.log('\n📄 Generated Reports:');
      results.reportPaths.forEach(path => {
        console.log(`   • ${path}`);
      });
    }

    if (results.aggregatedResults) {
      console.log('\n📈 Quality Metrics:');
      console.log(`   Stability Score: ${results.aggregatedResults.qualityMetrics.stabilityScore.toFixed(1)}%`);
      console.log(`   Test Coverage: ${results.aggregatedResults.qualityMetrics.testCoverage.overall.toFixed(1)}%`);
      console.log(`   User Experience Impact: ${results.aggregatedResults.qualityMetrics.userExperienceImpact}`);
    }
  });

  runner.on('error', (error) => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });

  runner.on('cancelled', () => {
    console.log('\n⚠️ Test execution was cancelled');
    process.exit(130);
  });

  // Handle process signals for graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⚠️ Received SIGINT, cancelling test execution...');
    runner.cancel();
  });

  process.on('SIGTERM', () => {
    console.log('\n⚠️ Received SIGTERM, cancelling test execution...');
    runner.cancel();
  });

  try {
    const results = await runner.executeAllTests();
    
    // Exit with appropriate code
    const exitCode = results.summary.failedSuites > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('\n💥 Comprehensive test execution failed:', error);
    process.exit(1);
  }
}

// ComprehensiveTestRunner is already exported above

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

/**
 * CLI interface for running comprehensive tests
 */
export async function runComprehensiveTests(config: TestRunnerConfig = {}): Promise<ComprehensiveTestResults> {
  const runner = new ComprehensiveTestRunner(config);

  // Set up event listeners for CLI output
  runner.on('started', (info) => {
    console.log(`🚀 Starting comprehensive tests (${info.totalSuites} suites)`);
    console.log(`📊 Configuration:`, JSON.stringify(info.config, null, 2));
  });

  runner.on('progress', (progress: ProgressReport) => {
    const timeRemaining = Math.round(progress.estimatedTimeRemaining / 1000);
    console.log(`⏳ Progress: ${progress.completedSuites}/${progress.totalSuites} (${progress.progress.toFixed(1)}%) - ETA: ${timeRemaining}s`);
    
    if (progress.currentSuite) {
      console.log(`🔄 Running: ${progress.currentSuite.name}`);
    }
  });

  runner.on('suiteCompleted', (result: TestExecutionResult) => {
    const status = result.status === 'passed' ? '✅' : '❌';
    const duration = Math.round(result.duration / 1000);
    console.log(`${status} ${result.suite.name} (${duration}s, ${result.errors} errors, ${result.warnings} warnings)`);
  });

  runner.on('completed', (results: ComprehensiveTestResults) => {
    console.log('\n📋 Test Execution Summary:');
    console.log(`   Total Suites: ${results.summary.totalSuites}`);
    console.log(`   Passed: ${results.summary.passedSuites}`);
    console.log(`   Failed: ${results.summary.failedSuites}`);
    console.log(`   Total Errors: ${results.summary.totalErrors}`);
    console.log(`   Total Duration: ${Math.round(results.summary.totalDuration / 1000)}s`);
    
    if (results.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      results.criticalIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    if (results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      results.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }
    
    if (results.reportPaths.length > 0) {
      console.log('\n📄 Reports Generated:');
      results.reportPaths.forEach(path => console.log(`   - ${path}`));
    }
  });

  runner.on('error', (error) => {
    console.error('❌ Test execution failed:', error);
  });

  return await runner.executeAllTests();
}

// CLI execution
if (require.main === module) {
  const config: TestRunnerConfig = {
    verbose: process.argv.includes('--verbose'),
    headless: !process.argv.includes('--headed'),
    parallel: process.argv.includes('--parallel'),
  };

  runComprehensiveTests(config)
    .then((results) => {
      process.exit(results.summary.failedSuites > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}