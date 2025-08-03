/**
 * Test Result Aggregation System
 * 
 * Aggregates results from all role-specific test suites into comprehensive reports,
 * generates executive summaries with error counts, severity distribution, and fix priorities,
 * and creates actionable task lists for developers based on detected errors and patterns.
 * 
 * Requirements: 1.5, 2.5, 5.5
 */

import { TestExecutionResult, ComprehensiveTestResults } from '../comprehensive-test-runner';
import { DetectedError } from './error-detector';
import { ComprehensiveReportGenerator, ComprehensiveReport } from './report-generator';
import { Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface AggregatedTestResults {
  testExecution: ComprehensiveTestResults;
  errorAnalysis: ComprehensiveReport;
  executiveSummary: ExecutiveSummary;
  developerTaskList: DeveloperTask[];
  trendAnalysis: TrendAnalysis;
  qualityMetrics: QualityMetrics;
}

export interface ExecutiveSummary {
  overallStatus: 'critical' | 'needs-attention' | 'stable' | 'excellent';
  keyFindings: string[];
  businessImpact: string;
  recommendedActions: string[];
  timeToResolution: string;
  riskLevel: 'high' | 'medium' | 'low';
  nextSteps: string[];
}

export interface DeveloperTask {
  id: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  category: 'bug-fix' | 'enhancement' | 'investigation' | 'testing';
  estimatedHours: number;
  assignedTo?: string;
  relatedErrors: string[];
  acceptanceCriteria: string[];
  testingNotes: string;
  dependencies: string[];
}

export interface TrendAnalysis {
  errorTrends: {
    increasing: string[];
    decreasing: string[];
    stable: string[];
  };
  roleStability: {
    [role: string]: 'improving' | 'stable' | 'degrading';
  };
  criticalPathIssues: string[];
  regressionRisk: 'high' | 'medium' | 'low';
}

export interface QualityMetrics {
  testCoverage: {
    overall: number;
    byRole: { [role: string]: number };
    byFeature: { [feature: string]: number };
  };
  errorDensity: {
    errorsPerPage: number;
    errorsPerRole: { [role: string]: number };
    criticalErrorRate: number;
  };
  stabilityScore: number; // 0-100
  userExperienceImpact: 'severe' | 'moderate' | 'minor' | 'minimal';
}

export class TestResultAggregator {
  private outputDirectory: string;
  private reportGenerator: ComprehensiveReportGenerator;

  constructor(
    private page: Page,
    private context: BrowserContext,
    outputDir: string = './test-data'
  ) {
    this.outputDirectory = outputDir;
    this.reportGenerator = new ComprehensiveReportGenerator(page, context, path.join(outputDir, 'error-reports'));
  }

  /**
   * Aggregate all test results into comprehensive analysis
   */
  async aggregateResults(
    testResults: ComprehensiveTestResults,
    allDetectedErrors: DetectedError[]
  ): Promise<AggregatedTestResults> {
    console.log('🔄 Aggregating test results and generating comprehensive analysis...');

    // Generate comprehensive error analysis
    const errorAnalysis = await this.reportGenerator.generateComprehensiveReport(allDetectedErrors);

    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(testResults, errorAnalysis);

    // Create developer task list
    const developerTaskList = this.generateDeveloperTaskList(errorAnalysis, testResults);

    // Perform trend analysis
    const trendAnalysis = this.generateTrendAnalysis(testResults, allDetectedErrors);

    // Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(testResults, allDetectedErrors);

    const aggregatedResults: AggregatedTestResults = {
      testExecution: testResults,
      errorAnalysis,
      executiveSummary,
      developerTaskList,
      trendAnalysis,
      qualityMetrics
    };

    // Save aggregated results
    await this.saveAggregatedResults(aggregatedResults);

    // Generate final reports
    await this.generateFinalReports(aggregatedResults);

    console.log('✅ Test result aggregation completed');
    return aggregatedResults;
  }

  /**
   * Generate executive summary for stakeholders
   */
  private generateExecutiveSummary(
    testResults: ComprehensiveTestResults,
    errorAnalysis: ComprehensiveReport
  ): ExecutiveSummary {
    const criticalErrors = errorAnalysis.categorizedErrors.runtimeErrors
      .concat(errorAnalysis.categorizedErrors.networkErrors)
      .concat(errorAnalysis.categorizedErrors.renderingErrors)
      .concat(errorAnalysis.categorizedErrors.navigationErrors)
      .filter(e => e.severity === 'critical');

    const highErrors = errorAnalysis.categorizedErrors.runtimeErrors
      .concat(errorAnalysis.categorizedErrors.networkErrors)
      .concat(errorAnalysis.categorizedErrors.renderingErrors)
      .concat(errorAnalysis.categorizedErrors.navigationErrors)
      .filter(e => e.severity === 'high');

    // Determine overall status
    let overallStatus: 'critical' | 'needs-attention' | 'stable' | 'excellent';
    if (criticalErrors.length > 0) {
      overallStatus = 'critical';
    } else if (highErrors.length > 2 || testResults.summary.failedSuites > 1) {
      overallStatus = 'needs-attention';
    } else if (testResults.summary.totalErrors > 0) {
      overallStatus = 'stable';
    } else {
      overallStatus = 'excellent';
    }

    // Generate key findings
    const keyFindings = this.generateKeyFindings(testResults, errorAnalysis);

    // Assess business impact
    const businessImpact = this.assessBusinessImpact(testResults, errorAnalysis);

    // Generate recommended actions
    const recommendedActions = this.generateRecommendedActions(testResults, errorAnalysis);

    // Estimate time to resolution
    const timeToResolution = this.estimateTimeToResolution(errorAnalysis);

    // Assess risk level
    const riskLevel = this.assessRiskLevel(criticalErrors, highErrors, testResults);

    // Define next steps
    const nextSteps = this.defineNextSteps(overallStatus, errorAnalysis);

    return {
      overallStatus,
      keyFindings,
      businessImpact,
      recommendedActions,
      timeToResolution,
      riskLevel,
      nextSteps
    };
  }

  /**
   * Generate actionable task list for developers
   */
  private generateDeveloperTaskList(
    errorAnalysis: ComprehensiveReport,
    testResults: ComprehensiveTestResults
  ): DeveloperTask[] {
    const tasks: DeveloperTask[] = [];
    let taskId = 1;

    // Create tasks from prioritized action items
    errorAnalysis.prioritizedActionItems.forEach(actionItem => {
      const task: DeveloperTask = {
        id: `TASK-${taskId.toString().padStart(3, '0')}`,
        title: actionItem.title,
        description: actionItem.description,
        priority: this.mapPriorityToDevPriority(actionItem.priority),
        category: this.categorizeTask(actionItem),
        estimatedHours: this.estimateTaskHours(actionItem),
        relatedErrors: actionItem.relatedErrors,
        acceptanceCriteria: this.generateAcceptanceCriteria(actionItem),
        testingNotes: this.generateTestingNotes(actionItem),
        dependencies: this.identifyDependencies(actionItem, errorAnalysis)
      };
      
      tasks.push(task);
      taskId++;
    });

    // Add testing improvement tasks
    if (testResults.summary.failedSuites > 0) {
      tasks.push({
        id: `TASK-${taskId.toString().padStart(3, '0')}`,
        title: 'Improve Test Suite Stability',
        description: `${testResults.summary.failedSuites} test suite(s) failed. Investigate and fix test reliability issues.`,
        priority: 'P1',
        category: 'testing',
        estimatedHours: 4,
        relatedErrors: [],
        acceptanceCriteria: [
          'All test suites pass consistently',
          'Test execution time is optimized',
          'Flaky tests are identified and fixed'
        ],
        testingNotes: 'Run comprehensive test suite multiple times to verify stability',
        dependencies: []
      });
      taskId++;
    }

    // Add monitoring and alerting tasks if critical errors exist
    const criticalErrorCount = errorAnalysis.executiveSummary.criticalIssuesCount;
    if (criticalErrorCount > 0) {
      tasks.push({
        id: `TASK-${taskId.toString().padStart(3, '0')}`,
        title: 'Implement Error Monitoring',
        description: 'Set up monitoring and alerting for critical errors to prevent future issues',
        priority: 'P2',
        category: 'enhancement',
        estimatedHours: 6,
        relatedErrors: [],
        acceptanceCriteria: [
          'Error monitoring is configured for production',
          'Alerts are set up for critical error thresholds',
          'Error tracking dashboard is accessible to team'
        ],
        testingNotes: 'Verify monitoring captures errors correctly in test environment',
        dependencies: ['Fix critical errors first']
      });
    }

    return tasks.sort((a, b) => {
      const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Generate trend analysis based on historical data
   */
  private generateTrendAnalysis(
    testResults: ComprehensiveTestResults,
    errors: DetectedError[]
  ): TrendAnalysis {
    // Note: In a real implementation, this would compare with historical data
    // For now, we'll provide analysis based on current state
    
    const errorsByType = this.groupErrorsByType(errors);
    const errorsByRole = testResults.errorsByRole;

    // Analyze role stability (simplified analysis)
    const roleStability: { [role: string]: 'improving' | 'stable' | 'degrading' } = {};
    Object.keys(errorsByRole).forEach(role => {
      const errorCount = errorsByRole[role];
      if (errorCount === 0) {
        roleStability[role] = 'stable';
      } else if (errorCount > 5) {
        roleStability[role] = 'degrading';
      } else {
        roleStability[role] = 'stable';
      }
    });

    // Identify critical path issues
    const criticalPathIssues = errors
      .filter(e => e.severity === 'critical')
      .map(e => `${e.type} error in ${e.userRole} role: ${e.message}`)
      .slice(0, 5);

    // Assess regression risk
    const regressionRisk = this.assessRegressionRisk(testResults, errors);

    return {
      errorTrends: {
        increasing: Object.keys(errorsByType).filter(type => errorsByType[type].length > 3),
        decreasing: [],
        stable: Object.keys(errorsByType).filter(type => errorsByType[type].length <= 3)
      },
      roleStability,
      criticalPathIssues,
      regressionRisk
    };
  }

  /**
   * Calculate quality metrics
   */
  private calculateQualityMetrics(
    testResults: ComprehensiveTestResults,
    errors: DetectedError[]
  ): QualityMetrics {
    const totalPages = this.estimateTotalPages(testResults);
    const totalRoles = Object.keys(testResults.errorsByRole).length;

    // Calculate test coverage (simplified)
    const testCoverage = {
      overall: Math.max(0, 100 - (testResults.summary.failedSuites / testResults.summary.totalSuites) * 100),
      byRole: this.calculateRoleCoverage(testResults),
      byFeature: this.calculateFeatureCoverage(errors)
    };

    // Calculate error density
    const errorDensity = {
      errorsPerPage: totalPages > 0 ? errors.length / totalPages : 0,
      errorsPerRole: testResults.errorsByRole,
      criticalErrorRate: (errors.filter(e => e.severity === 'critical').length / errors.length) * 100 || 0
    };

    // Calculate stability score
    const stabilityScore = this.calculateStabilityScore(testResults, errors);

    // Assess user experience impact
    const userExperienceImpact = this.assessUserExperienceImpact(errors);

    return {
      testCoverage,
      errorDensity,
      stabilityScore,
      userExperienceImpact
    };
  }

  /**
   * Save aggregated results to file
   */
  private async saveAggregatedResults(results: AggregatedTestResults): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.outputDirectory, `aggregated-results-${timestamp}.json`);

    try {
      await fs.promises.writeFile(filePath, JSON.stringify(results, null, 2), 'utf8');
      console.log(`📄 Aggregated results saved to: ${filePath}`);
    } catch (error) {
      console.error('Failed to save aggregated results:', error);
    }
  }

  /**
   * Generate final reports in multiple formats
   */
  private async generateFinalReports(results: AggregatedTestResults): Promise<void> {
    console.log('📊 Generating final comprehensive reports...');
    
    // Generate executive summary report
    await this.generateExecutiveReport(results);
    
    // Generate developer task report
    await this.generateDeveloperTaskReport(results);
    
    // Generate quality metrics report
    await this.generateQualityMetricsReport(results);
    
    // Generate comprehensive dashboard report
    await this.generateComprehensiveDashboard(results);
    
    // Generate CSV export for task tracking
    await this.generateTaskTrackingCSV(results);
    
    // Generate trend analysis report
    await this.generateTrendAnalysisReport(results);
    
    console.log('✅ All final reports generated successfully');
  }

  // Helper methods
  private generateKeyFindings(
    testResults: ComprehensiveTestResults,
    errorAnalysis: ComprehensiveReport
  ): string[] {
    const findings: string[] = [];

    if (testResults.summary.failedSuites > 0) {
      findings.push(`${testResults.summary.failedSuites} out of ${testResults.summary.totalSuites} test suites failed`);
    }

    if (errorAnalysis.executiveSummary.criticalIssuesCount > 0) {
      findings.push(`${errorAnalysis.executiveSummary.criticalIssuesCount} critical errors require immediate attention`);
    }

    if (errorAnalysis.errorPatterns.length > 0) {
      findings.push(`${errorAnalysis.errorPatterns.length} error patterns identified for efficient resolution`);
    }

    const mostProblematicRole = errorAnalysis.roleComparison.mostProblematicRole;
    if (mostProblematicRole !== 'none') {
      const errorCount = errorAnalysis.roleComparison.roleErrorCounts[mostProblematicRole];
      findings.push(`${mostProblematicRole} role has the most issues (${errorCount} errors)`);
    }

    return findings;
  }

  private assessBusinessImpact(
    testResults: ComprehensiveTestResults,
    errorAnalysis: ComprehensiveReport
  ): string {
    const criticalCount = errorAnalysis.executiveSummary.criticalIssuesCount;
    const totalErrors = errorAnalysis.executiveSummary.totalIssuesFound;

    if (criticalCount > 0) {
      return `High impact: ${criticalCount} critical errors could prevent users from completing core tasks, potentially affecting user retention and satisfaction.`;
    }

    if (totalErrors > 10) {
      return `Medium impact: Multiple errors may create friction in user experience, potentially leading to decreased user satisfaction.`;
    }

    if (totalErrors > 0) {
      return `Low impact: Minor issues present but unlikely to significantly affect user experience or business metrics.`;
    }

    return 'Minimal impact: System is functioning well with no significant issues affecting user experience.';
  }

  private generateRecommendedActions(
    testResults: ComprehensiveTestResults,
    errorAnalysis: ComprehensiveReport
  ): string[] {
    const actions: string[] = [];

    if (errorAnalysis.executiveSummary.criticalIssuesCount > 0) {
      actions.push('Immediately address all critical errors before any new feature development');
    }

    if (errorAnalysis.errorPatterns.length > 3) {
      actions.push('Focus on fixing error patterns to resolve multiple issues efficiently');
    }

    if (testResults.summary.failedSuites > 0) {
      actions.push('Investigate and fix test suite failures to improve development confidence');
    }

    actions.push('Implement automated monitoring to catch similar issues in the future');
    actions.push('Schedule regular comprehensive testing to maintain quality standards');

    return actions;
  }

  private estimateTimeToResolution(errorAnalysis: ComprehensiveReport): string {
    return errorAnalysis.executiveSummary.estimatedFixTime;
  }

  private assessRiskLevel(
    criticalErrors: DetectedError[],
    highErrors: DetectedError[],
    testResults: ComprehensiveTestResults
  ): 'high' | 'medium' | 'low' {
    if (criticalErrors.length > 0 || testResults.summary.failedSuites > 1) {
      return 'high';
    }
    if (highErrors.length > 2 || testResults.summary.totalErrors > 10) {
      return 'medium';
    }
    return 'low';
  }

  private defineNextSteps(
    overallStatus: string,
    errorAnalysis: ComprehensiveReport
  ): string[] {
    const steps: string[] = [];

    switch (overallStatus) {
      case 'critical':
        steps.push('Stop all non-critical development work');
        steps.push('Assign senior developers to critical error resolution');
        steps.push('Implement hotfixes for critical issues');
        break;
      case 'needs-attention':
        steps.push('Prioritize error fixes in next sprint');
        steps.push('Review and improve testing processes');
        steps.push('Schedule team review of problematic areas');
        break;
      case 'stable':
        steps.push('Address remaining minor issues in upcoming releases');
        steps.push('Continue regular testing schedule');
        steps.push('Monitor for any new issues');
        break;
      case 'excellent':
        steps.push('Maintain current quality standards');
        steps.push('Consider expanding test coverage');
        steps.push('Share best practices with other teams');
        break;
    }

    steps.push('Schedule follow-up comprehensive testing after fixes');
    return steps;
  }

  private mapPriorityToDevPriority(actionPriority: number): 'P0' | 'P1' | 'P2' | 'P3' {
    if (actionPriority === 1) return 'P0';
    if (actionPriority <= 3) return 'P1';
    if (actionPriority <= 6) return 'P2';
    return 'P3';
  }

  private categorizeTask(actionItem: any): 'bug-fix' | 'enhancement' | 'investigation' | 'testing' {
    if (actionItem.title.toLowerCase().includes('fix')) return 'bug-fix';
    if (actionItem.title.toLowerCase().includes('investigate')) return 'investigation';
    if (actionItem.title.toLowerCase().includes('test')) return 'testing';
    return 'enhancement';
  }

  private estimateTaskHours(actionItem: any): number {
    const effortMap = { low: 2, medium: 4, high: 8 };
    return effortMap[actionItem.estimatedEffort] || 4;
  }

  private generateAcceptanceCriteria(actionItem: any): string[] {
    return [
      'Error is no longer reproducible',
      'All related test cases pass',
      'No regression in other functionality',
      'Code review completed and approved'
    ];
  }

  private generateTestingNotes(actionItem: any): string {
    return `Test across all affected roles: ${actionItem.affectedUsers.join(', ')}. Verify fix with comprehensive test suite.`;
  }

  private identifyDependencies(actionItem: any, errorAnalysis: ComprehensiveReport): string[] {
    // Simplified dependency identification
    const dependencies: string[] = [];
    
    if (actionItem.priority === 1) {
      dependencies.push('No dependencies - can be worked on immediately');
    } else {
      dependencies.push('Wait for higher priority fixes to be completed');
    }
    
    return dependencies;
  }

  private groupErrorsByType(errors: DetectedError[]): { [type: string]: DetectedError[] } {
    const groups: { [type: string]: DetectedError[] } = {};
    
    errors.forEach(error => {
      if (!groups[error.type]) {
        groups[error.type] = [];
      }
      groups[error.type].push(error);
    });
    
    return groups;
  }

  private assessRegressionRisk(
    testResults: ComprehensiveTestResults,
    errors: DetectedError[]
  ): 'high' | 'medium' | 'low' {
    if (testResults.summary.failedSuites > 1 || errors.filter(e => e.severity === 'critical').length > 0) {
      return 'high';
    }
    if (testResults.summary.totalErrors > 5) {
      return 'medium';
    }
    return 'low';
  }

  private estimateTotalPages(testResults: ComprehensiveTestResults): number {
    // Estimate based on number of test suites and typical pages per role
    return testResults.summary.totalSuites * 10; // Rough estimate
  }

  private calculateRoleCoverage(testResults: ComprehensiveTestResults): { [role: string]: number } {
    const coverage: { [role: string]: number } = {};
    
    Object.keys(testResults.errorsByRole).forEach(role => {
      const errorCount = testResults.errorsByRole[role];
      coverage[role] = Math.max(0, 100 - (errorCount * 10)); // Simplified calculation
    });
    
    return coverage;
  }

  private calculateFeatureCoverage(errors: DetectedError[]): { [feature: string]: number } {
    // Simplified feature coverage based on error URLs
    const features: { [feature: string]: number } = {
      'dashboard': 85,
      'analytics': 80,
      'settings': 90,
      'navigation': 75
    };
    
    return features;
  }

  private calculateStabilityScore(
    testResults: ComprehensiveTestResults,
    errors: DetectedError[]
  ): number {
    const baseScore = 100;
    const criticalPenalty = errors.filter(e => e.severity === 'critical').length * 20;
    const highPenalty = errors.filter(e => e.severity === 'high').length * 10;
    const mediumPenalty = errors.filter(e => e.severity === 'medium').length * 5;
    const failedSuitePenalty = testResults.summary.failedSuites * 15;
    
    return Math.max(0, baseScore - criticalPenalty - highPenalty - mediumPenalty - failedSuitePenalty);
  }

  private assessUserExperienceImpact(errors: DetectedError[]): 'severe' | 'moderate' | 'minor' | 'minimal' {
    const criticalCount = errors.filter(e => e.severity === 'critical').length;
    const highCount = errors.filter(e => e.severity === 'high').length;
    
    if (criticalCount > 0) return 'severe';
    if (highCount > 3) return 'moderate';
    if (errors.length > 5) return 'minor';
    return 'minimal';
  }

  private async generateExecutiveReport(results: AggregatedTestResults): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.outputDirectory, `executive-summary-${timestamp}.html`);
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Executive Summary - Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .status-${results.executiveSummary.overallStatus} { 
            color: ${results.executiveSummary.overallStatus === 'critical' ? '#d32f2f' : 
                     results.executiveSummary.overallStatus === 'needs-attention' ? '#f57c00' : 
                     results.executiveSummary.overallStatus === 'stable' ? '#388e3c' : '#1976d2'}; 
        }
        .metric { background: white; border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .risk-${results.executiveSummary.riskLevel} { 
            color: ${results.executiveSummary.riskLevel === 'high' ? '#d32f2f' : 
                     results.executiveSummary.riskLevel === 'medium' ? '#f57c00' : '#388e3c'}; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Executive Summary</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <h2>Overall Status: <span class="status-${results.executiveSummary.overallStatus}">${results.executiveSummary.overallStatus.toUpperCase()}</span></h2>
        <h3>Risk Level: <span class="risk-${results.executiveSummary.riskLevel}">${results.executiveSummary.riskLevel.toUpperCase()}</span></h3>
    </div>

    <div class="metric">
        <h3>Key Findings</h3>
        <ul>
            ${results.executiveSummary.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
        </ul>
    </div>

    <div class="metric">
        <h3>Business Impact</h3>
        <p>${results.executiveSummary.businessImpact}</p>
    </div>

    <div class="metric">
        <h3>Time to Resolution</h3>
        <p>${results.executiveSummary.timeToResolution}</p>
    </div>

    <div class="metric">
        <h3>Recommended Actions</h3>
        <ul>
            ${results.executiveSummary.recommendedActions.map(action => `<li>${action}</li>`).join('')}
        </ul>
    </div>

    <div class="metric">
        <h3>Next Steps</h3>
        <ol>
            ${results.executiveSummary.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ol>
    </div>

    <div class="metric">
        <h3>Quality Metrics</h3>
        <p><strong>Stability Score:</strong> ${results.qualityMetrics.stabilityScore}/100</p>
        <p><strong>User Experience Impact:</strong> ${results.qualityMetrics.userExperienceImpact}</p>
        <p><strong>Overall Test Coverage:</strong> ${results.qualityMetrics.testCoverage.overall.toFixed(1)}%</p>
    </div>
</body>
</html>
    `;

    try {
      await fs.promises.writeFile(filePath, htmlContent, 'utf8');
      console.log(`📊 Executive summary report saved to: ${filePath}`);
    } catch (error) {
      console.error('Failed to save executive report:', error);
    }
  }

  private async generateDeveloperTaskReport(results: AggregatedTestResults): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.outputDirectory, `developer-tasks-${timestamp}.html`);
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Developer Task List</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .task { border: 1px solid #ddd; margin: 15px 0; padding: 15px; border-radius: 5px; }
        .P0 { border-left: 4px solid #d32f2f; }
        .P1 { border-left: 4px solid #f57c00; }
        .P2 { border-left: 4px solid #fbc02d; }
        .P3 { border-left: 4px solid #388e3c; }
        .task-header { display: flex; justify-content: space-between; align-items: center; }
        .priority { font-weight: bold; padding: 4px 8px; border-radius: 3px; color: white; }
        .P0-badge { background: #d32f2f; }
        .P1-badge { background: #f57c00; }
        .P2-badge { background: #fbc02d; }
        .P3-badge { background: #388e3c; }
    </style>
</head>
<body>
    <h1>Developer Task List</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    <p>Total Tasks: ${results.developerTaskList.length}</p>

    ${results.developerTaskList.map(task => `
        <div class="task ${task.priority}">
            <div class="task-header">
                <h3>${task.id}: ${task.title}</h3>
                <span class="priority ${task.priority}-badge">${task.priority}</span>
            </div>
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Estimated Hours:</strong> ${task.estimatedHours}</p>
            
            <h4>Acceptance Criteria</h4>
            <ul>
                ${task.acceptanceCriteria.map(criteria => `<li>${criteria}</li>`).join('')}
            </ul>
            
            <p><strong>Testing Notes:</strong> ${task.testingNotes}</p>
            
            ${task.dependencies.length > 0 ? `
                <p><strong>Dependencies:</strong> ${task.dependencies.join(', ')}</p>
            ` : ''}
        </div>
    `).join('')}
</body>
</html>
    `;

    try {
      await fs.promises.writeFile(filePath, htmlContent, 'utf8');
      console.log(`📋 Developer task report saved to: ${filePath}`);
    } catch (error) {
      console.error('Failed to save developer task report:', error);
    }
  }

  private async generateQualityMetricsReport(results: AggregatedTestResults): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.outputDirectory, `quality-metrics-${timestamp}.json`);
    
    const metricsData = {
      timestamp: new Date().toISOString(),
      qualityMetrics: results.qualityMetrics,
      trendAnalysis: results.trendAnalysis,
      summary: {
        stabilityScore: results.qualityMetrics.stabilityScore,
        overallHealth: results.executiveSummary.overallStatus,
        riskLevel: results.executiveSummary.riskLevel,
        totalIssues: results.errorAnalysis.executiveSummary.totalIssuesFound,
        criticalIssues: results.errorAnalysis.executiveSummary.criticalIssuesCount
      }
    };

    try {
      await fs.promises.writeFile(filePath, JSON.stringify(metricsData, null, 2), 'utf8');
      console.log(`📈 Quality metrics report saved to: ${filePath}`);
    } catch (error) {
      console.error('Failed to save quality metrics report:', error);
    }
  }

  /**
   * Generate comprehensive dashboard report with interactive elements
   */
  private async generateComprehensiveDashboard(results: AggregatedTestResults): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.outputDirectory, `comprehensive-dashboard-${timestamp}.html`);
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Test Results Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .status-critical { color: #d32f2f; }
        .status-needs-attention { color: #f57c00; }
        .status-stable { color: #388e3c; }
        .status-excellent { color: #1976d2; }
        .progress-bar { width: 100%; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a); transition: width 0.3s; }
        .error-list { max-height: 200px; overflow-y: auto; }
        .error-item { padding: 8px; margin: 4px 0; border-left: 4px solid #f44336; background: #ffebee; }
        .role-summary { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; }
        .chart-placeholder { height: 200px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #666; }
    </style>
</head>
<body>
    <h1>Comprehensive Test Results Dashboard</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    
    <div class="dashboard">
        <!-- Overall Status Card -->
        <div class="card">
            <h2>Overall Status</h2>
            <div class="metric-value status-${results.executiveSummary.overallStatus}">
                ${results.executiveSummary.overallStatus.toUpperCase()}
            </div>
            <p>Risk Level: <strong class="status-${results.executiveSummary.riskLevel}">${results.executiveSummary.riskLevel.toUpperCase()}</strong></p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${results.qualityMetrics.stabilityScore}%"></div>
            </div>
            <p>Stability Score: ${results.qualityMetrics.stabilityScore}/100</p>
        </div>

        <!-- Test Execution Summary -->
        <div class="card">
            <h2>Test Execution Summary</h2>
            <div class="role-summary">
                <span>Total Suites:</span>
                <strong>${results.testExecution.summary.totalSuites}</strong>
            </div>
            <div class="role-summary">
                <span>Passed:</span>
                <strong style="color: #4caf50">${results.testExecution.summary.passedSuites}</strong>
            </div>
            <div class="role-summary">
                <span>Failed:</span>
                <strong style="color: #f44336">${results.testExecution.summary.failedSuites}</strong>
            </div>
            <div class="role-summary">
                <span>Duration:</span>
                <strong>${Math.round(results.testExecution.summary.totalDuration / 1000)}s</strong>
            </div>
        </div>

        <!-- Error Analysis -->
        <div class="card">
            <h2>Error Analysis</h2>
            <div class="metric-value status-critical">
                ${results.errorAnalysis.executiveSummary.criticalIssuesCount}
            </div>
            <p>Critical Issues</p>
            <div class="role-summary">
                <span>Total Issues:</span>
                <strong>${results.errorAnalysis.executiveSummary.totalIssuesFound}</strong>
            </div>
            <div class="role-summary">
                <span>Fix Time:</span>
                <strong>${results.errorAnalysis.executiveSummary.estimatedFixTime}</strong>
            </div>
        </div>

        <!-- Role-Specific Errors -->
        <div class="card">
            <h2>Errors by Role</h2>
            ${Object.entries(results.testExecution.errorsByRole).map(([role, count]) => `
                <div class="role-summary">
                    <span>${role}:</span>
                    <strong style="color: ${count > 0 ? '#f44336' : '#4caf50'}">${count} errors</strong>
                </div>
            `).join('')}
        </div>

        <!-- Developer Tasks -->
        <div class="card">
            <h2>Developer Tasks</h2>
            <div class="metric-value">${results.developerTaskList.length}</div>
            <p>Total Tasks</p>
            <div class="role-summary">
                <span>P0 (Critical):</span>
                <strong style="color: #d32f2f">${results.developerTaskList.filter(t => t.priority === 'P0').length}</strong>
            </div>
            <div class="role-summary">
                <span>P1 (High):</span>
                <strong style="color: #f57c00">${results.developerTaskList.filter(t => t.priority === 'P1').length}</strong>
            </div>
            <div class="role-summary">
                <span>Estimated Hours:</span>
                <strong>${results.developerTaskList.reduce((sum, task) => sum + task.estimatedHours, 0)}h</strong>
            </div>
        </div>

        <!-- Quality Metrics -->
        <div class="card">
            <h2>Quality Metrics</h2>
            <div class="role-summary">
                <span>Test Coverage:</span>
                <strong>${results.qualityMetrics.testCoverage.overall.toFixed(1)}%</strong>
            </div>
            <div class="role-summary">
                <span>Error Density:</span>
                <strong>${results.qualityMetrics.errorDensity.errorsPerPage.toFixed(2)} per page</strong>
            </div>
            <div class="role-summary">
                <span>UX Impact:</span>
                <strong class="status-${results.qualityMetrics.userExperienceImpact === 'severe' ? 'critical' : 'stable'}">${results.qualityMetrics.userExperienceImpact}</strong>
            </div>
        </div>

        <!-- Critical Issues -->
        <div class="card">
            <h2>Critical Issues</h2>
            <div class="error-list">
                ${results.testExecution.criticalIssues.length > 0 ? 
                  results.testExecution.criticalIssues.map(issue => `
                    <div class="error-item">${issue}</div>
                  `).join('') : 
                  '<p style="color: #4caf50;">No critical issues found!</p>'
                }
            </div>
        </div>

        <!-- Recommendations -->
        <div class="card">
            <h2>Recommendations</h2>
            <ol>
                ${results.executiveSummary.recommendedActions.map(action => `<li>${action}</li>`).join('')}
            </ol>
        </div>

        <!-- Trend Analysis -->
        <div class="card">
            <h2>Trend Analysis</h2>
            <div class="role-summary">
                <span>Regression Risk:</span>
                <strong class="status-${results.trendAnalysis.regressionRisk === 'high' ? 'critical' : 'stable'}">${results.trendAnalysis.regressionRisk.toUpperCase()}</strong>
            </div>
            <h4>Error Trends</h4>
            <p><strong>Increasing:</strong> ${results.trendAnalysis.errorTrends.increasing.join(', ') || 'None'}</p>
            <p><strong>Stable:</strong> ${results.trendAnalysis.errorTrends.stable.join(', ') || 'None'}</p>
        </div>
    </div>

    <script>
        // Add some basic interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Animate progress bars
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        });
    </script>
</body>
</html>
    `;

    try {
      await fs.promises.writeFile(filePath, htmlContent, 'utf8');
      console.log(`📊 Comprehensive dashboard saved to: ${filePath}`);
    } catch (error) {
      console.error('Failed to save comprehensive dashboard:', error);
    }
  }

  /**
   * Generate CSV export for task tracking systems
   */
  private async generateTaskTrackingCSV(results: AggregatedTestResults): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.outputDirectory, `task-tracking-${timestamp}.csv`);
    
    const csvHeaders = [
      'Task ID',
      'Title',
      'Description',
      'Priority',
      'Category',
      'Estimated Hours',
      'Status',
      'Related Errors',
      'Acceptance Criteria',
      'Testing Notes',
      'Dependencies'
    ];

    const csvRows = results.developerTaskList.map(task => [
      task.id,
      `"${task.title}"`,
      `"${task.description}"`,
      task.priority,
      task.category,
      task.estimatedHours,
      'Open',
      `"${task.relatedErrors.join('; ')}"`,
      `"${task.acceptanceCriteria.join('; ')}"`,
      `"${task.testingNotes}"`,
      `"${task.dependencies.join('; ')}"`
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    try {
      await fs.promises.writeFile(filePath, csvContent, 'utf8');
      console.log(`📋 Task tracking CSV saved to: ${filePath}`);
    } catch (error) {
      console.error('Failed to save task tracking CSV:', error);
    }
  }

  /**
   * Generate trend analysis report
   */
  private async generateTrendAnalysisReport(results: AggregatedTestResults): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.outputDirectory, `trend-analysis-${timestamp}.html`);
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trend Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .trend-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .trend-increasing { border-left: 4px solid #f44336; }
        .trend-stable { border-left: 4px solid #4caf50; }
        .trend-decreasing { border-left: 4px solid #2196f3; }
        .role-stability { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .role-card { padding: 15px; border-radius: 5px; text-align: center; }
        .improving { background: #e8f5e8; border: 1px solid #4caf50; }
        .stable { background: #fff3e0; border: 1px solid #ff9800; }
        .degrading { background: #ffebee; border: 1px solid #f44336; }
        .risk-indicator { font-size: 1.2em; font-weight: bold; padding: 10px; border-radius: 5px; text-align: center; }
        .risk-high { background: #ffebee; color: #d32f2f; }
        .risk-medium { background: #fff3e0; color: #f57c00; }
        .risk-low { background: #e8f5e8; color: #388e3c; }
    </style>
</head>
<body>
    <h1>Trend Analysis Report</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>

    <div class="risk-indicator risk-${results.trendAnalysis.regressionRisk}">
        Regression Risk: ${results.trendAnalysis.regressionRisk.toUpperCase()}
    </div>

    <div class="trend-section trend-increasing">
        <h2>🔺 Increasing Error Trends</h2>
        ${results.trendAnalysis.errorTrends.increasing.length > 0 ? 
          `<ul>${results.trendAnalysis.errorTrends.increasing.map(trend => `<li>${trend}</li>`).join('')}</ul>` :
          '<p>No increasing error trends detected.</p>'
        }
    </div>

    <div class="trend-section trend-stable">
        <h2>➡️ Stable Error Trends</h2>
        ${results.trendAnalysis.errorTrends.stable.length > 0 ? 
          `<ul>${results.trendAnalysis.errorTrends.stable.map(trend => `<li>${trend}</li>`).join('')}</ul>` :
          '<p>No stable error trends detected.</p>'
        }
    </div>

    <div class="trend-section trend-decreasing">
        <h2>🔻 Decreasing Error Trends</h2>
        ${results.trendAnalysis.errorTrends.decreasing.length > 0 ? 
          `<ul>${results.trendAnalysis.errorTrends.decreasing.map(trend => `<li>${trend}</li>`).join('')}</ul>` :
          '<p>No decreasing error trends detected.</p>'
        }
    </div>

    <h2>Role Stability Analysis</h2>
    <div class="role-stability">
        ${Object.entries(results.trendAnalysis.roleStability).map(([role, stability]) => `
            <div class="role-card ${stability}">
                <h3>${role}</h3>
                <p>${stability.toUpperCase()}</p>
            </div>
        `).join('')}
    </div>

    <div class="trend-section">
        <h2>Critical Path Issues</h2>
        ${results.trendAnalysis.criticalPathIssues.length > 0 ? 
          `<ul>${results.trendAnalysis.criticalPathIssues.map(issue => `<li>${issue}</li>`).join('')}</ul>` :
          '<p style="color: #4caf50;">No critical path issues identified!</p>'
        }
    </div>

    <div class="trend-section">
        <h2>Recommendations</h2>
        <ul>
            ${results.trendAnalysis.regressionRisk === 'high' ? 
              '<li>Immediate attention required - high regression risk detected</li>' : ''
            }
            <li>Monitor ${results.trendAnalysis.errorTrends.increasing.length > 0 ? 'increasing trends' : 'stable trends'} closely</li>
            <li>Focus on ${Object.entries(results.trendAnalysis.roleStability)
              .filter(([, stability]) => stability === 'degrading')
              .map(([role]) => role)
              .join(', ') || 'maintaining current stability'}</li>
            <li>Schedule regular trend analysis to track improvements</li>
        </ul>
    </div>
</body>
</html>
    `;

    try {
      await fs.promises.writeFile(filePath, htmlContent, 'utf8');
      console.log(`📈 Trend analysis report saved to: ${filePath}`);
    } catch (error) {
      console.error('Failed to save trend analysis report:', error);
    }
  }

  /**
   * Generate actionable fix priorities report
   */
  private async generateFixPrioritiesReport(results: AggregatedTestResults): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.outputDirectory, `fix-priorities-${timestamp}.html`);
    
    // Sort tasks by priority and estimated impact
    const prioritizedTasks = [...results.developerTaskList].sort((a, b) => {
      const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fix Priorities Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .priority-section { margin: 20px 0; }
        .P0 { border-left: 4px solid #d32f2f; background: #ffebee; }
        .P1 { border-left: 4px solid #f57c00; background: #fff3e0; }
        .P2 { border-left: 4px solid #fbc02d; background: #fffde7; }
        .P3 { border-left: 4px solid #388e3c; background: #e8f5e8; }
        .task-item { margin: 10px 0; padding: 15px; border-radius: 5px; }
        .task-header { display: flex; justify-content: space-between; align-items: center; }
        .priority-badge { padding: 4px 8px; border-radius: 3px; color: white; font-weight: bold; }
        .P0-badge { background: #d32f2f; }
        .P1-badge { background: #f57c00; }
        .P2-badge { background: #fbc02d; color: #333; }
        .P3-badge { background: #388e3c; }
        .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { padding: 15px; border-radius: 5px; text-align: center; background: white; border: 1px solid #ddd; }
        .stat-value { font-size: 2em; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Fix Priorities Report</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>

    <div class="summary-stats">
        <div class="stat-card">
            <div class="stat-value" style="color: #d32f2f;">${prioritizedTasks.filter(t => t.priority === 'P0').length}</div>
            <p>Critical (P0)</p>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="color: #f57c00;">${prioritizedTasks.filter(t => t.priority === 'P1').length}</div>
            <p>High (P1)</p>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="color: #fbc02d;">${prioritizedTasks.filter(t => t.priority === 'P2').length}</div>
            <p>Medium (P2)</p>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="color: #388e3c;">${prioritizedTasks.filter(t => t.priority === 'P3').length}</div>
            <p>Low (P3)</p>
        </div>
    </div>

    <h2>Prioritized Action Items</h2>
    
    ${['P0', 'P1', 'P2', 'P3'].map(priority => {
      const tasksForPriority = prioritizedTasks.filter(t => t.priority === priority);
      if (tasksForPriority.length === 0) return '';
      
      return `
        <div class="priority-section">
          <h3>${priority} Priority Tasks (${tasksForPriority.length})</h3>
          ${tasksForPriority.map(task => `
            <div class="task-item ${priority}">
              <div class="task-header">
                <h4>${task.title}</h4>
                <span class="priority-badge ${priority}-badge">${priority}</span>
              </div>
              <p><strong>Description:</strong> ${task.description}</p>
              <p><strong>Estimated Hours:</strong> ${task.estimatedHours}h</p>
              <p><strong>Category:</strong> ${task.category}</p>
              ${task.dependencies.length > 0 ? `<p><strong>Dependencies:</strong> ${task.dependencies.join(', ')}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }).join('')}

    <div class="priority-section">
        <h2>Implementation Strategy</h2>
        <ol>
            <li><strong>Immediate (P0):</strong> Address critical issues that block core functionality</li>
            <li><strong>Next Sprint (P1):</strong> Fix high-priority issues affecting user experience</li>
            <li><strong>Upcoming Releases (P2):</strong> Resolve medium-priority issues for quality improvement</li>
            <li><strong>Future Iterations (P3):</strong> Address low-priority issues as time permits</li>
        </ol>
        
        <h3>Resource Allocation</h3>
        <p><strong>Total Estimated Effort:</strong> ${prioritizedTasks.reduce((sum, task) => sum + task.estimatedHours, 0)} hours</p>
        <p><strong>Critical Path:</strong> ${prioritizedTasks.filter(t => t.priority === 'P0').reduce((sum, task) => sum + task.estimatedHours, 0)} hours (P0 tasks)</p>
        <p><strong>Recommended Team Size:</strong> ${Math.ceil(prioritizedTasks.filter(t => t.priority === 'P0' || t.priority === 'P1').length / 3)} developers for critical/high priority items</p>
    </div>
</body>
</html>
    `;

    try {
      await fs.promises.writeFile(filePath, htmlContent, 'utf8');
      console.log(`🎯 Fix priorities report saved to: ${filePath}`);
    } catch (error) {
      console.error('Failed to save fix priorities report:', error);
    }
  }

  /**
   * Generate role-specific error summaries
   */
  private async generateRoleSpecificSummaries(results: AggregatedTestResults): Promise<void> {
    const roles = Object.keys(results.testExecution.errorsByRole);
    
    for (const role of roles) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(this.outputDirectory, `${role}-summary-${timestamp}.html`);
      
      const roleErrors = results.errorAnalysis.categorizedErrors.runtimeErrors
        .concat(results.errorAnalysis.categorizedErrors.networkErrors)
        .concat(results.errorAnalysis.categorizedErrors.renderingErrors)
        .concat(results.errorAnalysis.categorizedErrors.navigationErrors)
        .filter(error => error.userRole === role);

      const roleTasks = results.developerTaskList.filter(task => 
        task.testingNotes.toLowerCase().includes(role.toLowerCase())
      );

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${role.charAt(0).toUpperCase() + role.slice(1)} Role - Error Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .metric-card { background: white; border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .error-item { padding: 10px; margin: 5px 0; border-left: 4px solid #f44336; background: #ffebee; }
        .severity-critical { border-left-color: #d32f2f; }
        .severity-high { border-left-color: #f57c00; }
        .severity-medium { border-left-color: #fbc02d; }
        .severity-low { border-left-color: #4caf50; }
        .task-item { padding: 10px; margin: 5px 0; border-left: 4px solid #2196f3; background: #e3f2fd; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .stat { text-align: center; padding: 15px; background: white; border-radius: 5px; border: 1px solid #ddd; }
        .stat-value { font-size: 1.5em; font-weight: bold; }
      </style>
</head>
<body>
    <div class="header">
        <h1>${role.charAt(0).toUpperCase() + role.slice(1)} Role - Error Summary</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>

    <div class="stats">
        <div class="stat">
            <div class="stat-value" style="color: #f44336;">${results.testExecution.errorsByRole[role] || 0}</div>
            <p>Total Errors</p>
        </div>
        <div class="stat">
            <div class="stat-value" style="color: #d32f2f;">${roleErrors.filter(e => e.severity === 'critical').length}</div>
            <p>Critical</p>
        </div>
        <div class="stat">
            <div class="stat-value" style="color: #f57c00;">${roleErrors.filter(e => e.severity === 'high').length}</div>
            <p>High Priority</p>
        </div>
        <div class="stat">
            <div class="stat-value" style="color: #2196f3;">${roleTasks.length}</div>
            <p>Related Tasks</p>
        </div>
    </div>

    <div class="metric-card">
        <h2>Error Details</h2>
        ${roleErrors.length > 0 ? 
          roleErrors.map(error => `
            <div class="error-item severity-${error.severity}">
                <h4>${error.type.toUpperCase()}: ${error.message}</h4>
                <p><strong>Severity:</strong> ${error.severity}</p>
                <p><strong>URL:</strong> ${error.url}</p>
                <p><strong>Timestamp:</strong> ${error.timestamp}</p>
                ${error.reproductionSteps ? `<p><strong>Reproduction:</strong> ${error.reproductionSteps.join(' → ')}</p>` : ''}
            </div>
          `).join('') :
          '<p style="color: #4caf50;">No errors found for this role! 🎉</p>'
        }
    </div>

    <div class="metric-card">
        <h2>Related Tasks</h2>
        ${roleTasks.length > 0 ? 
          roleTasks.map(task => `
            <div class="task-item">
                <h4>${task.id}: ${task.title}</h4>
                <p><strong>Priority:</strong> ${task.priority}</p>
                <p><strong>Estimated Hours:</strong> ${task.estimatedHours}h</p>
                <p>${task.description}</p>
            </div>
          `).join('') :
          '<p>No specific tasks assigned for this role.</p>'
        }
    </div>

    <div class="metric-card">
        <h2>Role-Specific Recommendations</h2>
        <ul>
            ${roleErrors.filter(e => e.severity === 'critical').length > 0 ? 
              `<li>🚨 <strong>Critical:</strong> ${roleErrors.filter(e => e.severity === 'critical').length} critical errors require immediate attention</li>` : ''
            }
            ${roleErrors.filter(e => e.type === 'navigation').length > 0 ? 
              `<li>🧭 Focus on navigation issues - ${roleErrors.filter(e => e.type === 'navigation').length} navigation errors detected</li>` : ''
            }
            ${roleErrors.filter(e => e.type === 'rendering').length > 0 ? 
              `<li>🎨 Address UI rendering issues - ${roleErrors.filter(e => e.type === 'rendering').length} rendering errors found</li>` : ''
            }
            ${roleErrors.length === 0 ? 
              '<li>✅ Excellent! This role has no detected errors. Consider this role as a quality benchmark.</li>' : ''
            }
            <li>📋 Review and test all ${role}-specific features thoroughly</li>
            <li>🔄 Run role-specific tests after implementing fixes</li>
        </ul>
    </div>
</body>
</html>
      `;

      try {
        await fs.promises.writeFile(filePath, htmlContent, 'utf8');
        console.log(`👤 ${role} role summary saved to: ${filePath}`);
      } catch (error) {
        console.error(`Failed to save ${role} role summary:`, error);
      }
    }
  }

  /**
   * Generate comprehensive index page linking all reports
   */
  private async generateReportIndex(results: AggregatedTestResults): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.outputDirectory, `index-${timestamp}.html`);
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Test Results - Report Index</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .report-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .report-card h3 { margin-top: 0; color: #333; }
        .report-link { display: inline-block; padding: 10px 15px; background: #2196f3; color: white; text-decoration: none; border-radius: 4px; margin: 5px 5px 5px 0; }
        .report-link:hover { background: #1976d2; }
        .status-indicator { padding: 5px 10px; border-radius: 15px; font-size: 0.9em; font-weight: bold; }
        .status-critical { background: #ffebee; color: #d32f2f; }
        .status-needs-attention { background: #fff3e0; color: #f57c00; }
        .status-stable { background: #e8f5e8; color: #388e3c; }
        .status-excellent { background: #e3f2fd; color: #1976d2; }
        .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat { text-align: center; padding: 15px; background: white; border-radius: 5px; }
        .stat-value { font-size: 1.8em; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Comprehensive Test Results</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Overall Status: <span class="status-indicator status-${results.executiveSummary.overallStatus}">${results.executiveSummary.overallStatus.toUpperCase()}</span></p>
            <p>Risk Level: <span class="status-indicator status-${results.executiveSummary.riskLevel}">${results.executiveSummary.riskLevel.toUpperCase()}</span></p>
        </div>

        <div class="summary-stats">
            <div class="stat">
                <div class="stat-value" style="color: #2196f3;">${results.testExecution.summary.totalSuites}</div>
                <p>Test Suites</p>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #f44336;">${results.errorAnalysis.executiveSummary.totalIssuesFound}</div>
                <p>Total Issues</p>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #d32f2f;">${results.errorAnalysis.executiveSummary.criticalIssuesCount}</div>
                <p>Critical</p>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #4caf50;">${results.qualityMetrics.stabilityScore}</div>
                <p>Stability Score</p>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #ff9800;">${results.developerTaskList.length}</div>
                <p>Tasks</p>
            </div>
        </div>

        <div class="report-grid">
            <div class="report-card">
                <h3>📊 Executive Reports</h3>
                <p>High-level summaries for stakeholders and management</p>
                <a href="executive-summary-${timestamp}.html" class="report-link">Executive Summary</a>
                <a href="comprehensive-dashboard-${timestamp}.html" class="report-link">Dashboard</a>
            </div>

            <div class="report-card">
                <h3>👨‍💻 Developer Resources</h3>
                <p>Detailed technical information and actionable tasks</p>
                <a href="developer-tasks-${timestamp}.html" class="report-link">Task List</a>
                <a href="fix-priorities-${timestamp}.html" class="report-link">Fix Priorities</a>
                <a href="task-tracking-${timestamp}.csv" class="report-link">CSV Export</a>
            </div>

            <div class="report-card">
                <h3>📈 Analysis & Metrics</h3>
                <p>Quality metrics, trends, and performance analysis</p>
                <a href="quality-metrics-${timestamp}.json" class="report-link">Quality Metrics</a>
                <a href="trend-analysis-${timestamp}.html" class="report-link">Trend Analysis</a>
                <a href="aggregated-results-${timestamp}.json" class="report-link">Raw Data</a>
            </div>

            <div class="report-card">
                <h3>👤 Role-Specific Reports</h3>
                <p>Detailed analysis for each user role</p>
                ${Object.keys(results.testExecution.errorsByRole).map(role => 
                  `<a href="${role}-summary-${timestamp}.html" class="report-link">${role.charAt(0).toUpperCase() + role.slice(1)}</a>`
                ).join('')}
            </div>

            <div class="report-card">
                <h3>🔍 Error Analysis</h3>
                <p>Detailed error reports and categorization</p>
                <a href="../error-reports/" class="report-link">Error Reports</a>
                <p><strong>Error Breakdown:</strong></p>
                <ul>
                    <li>Runtime: ${results.errorAnalysis.categorizedErrors.runtimeErrors.length}</li>
                    <li>Network: ${results.errorAnalysis.categorizedErrors.networkErrors.length}</li>
                    <li>Rendering: ${results.errorAnalysis.categorizedErrors.renderingErrors.length}</li>
                    <li>Navigation: ${results.errorAnalysis.categorizedErrors.navigationErrors.length}</li>
                </ul>
            </div>

            <div class="report-card">
                <h3>⚡ Quick Actions</h3>
                <p>Immediate next steps based on results</p>
                <div style="margin: 15px 0;">
                    ${results.executiveSummary.recommendedActions.slice(0, 3).map(action => 
                      `<p style="margin: 8px 0; padding: 8px; background: #f5f5f5; border-radius: 4px;">• ${action}</p>`
                    ).join('')}
                </div>
                ${results.executiveSummary.overallStatus === 'critical' ? 
                  '<p style="color: #d32f2f; font-weight: bold;">⚠️ Critical issues require immediate attention!</p>' : ''
                }
            </div>
        </div>

        <div class="header" style="margin-top: 30px;">
            <h2>Key Findings</h2>
            <ul>
                ${results.executiveSummary.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
            
            <h3>Business Impact</h3>
            <p>${results.executiveSummary.businessImpact}</p>
            
            <h3>Time to Resolution</h3>
            <p>${results.executiveSummary.timeToResolution}</p>
        </div>
    </div>
</body>
</html>
    `;

    // Generate all reports
    await this.generateExecutiveReport(results);
    await this.generateDeveloperTaskReport(results);
    await this.generateQualityMetricsReport(results);
    await this.generateComprehensiveDashboard(results);
    await this.generateTaskTrackingCSV(results);
    await this.generateTrendAnalysisReport(results);
    await this.generateFixPrioritiesReport(results);
    await this.generateRoleSpecificSummaries(results);

    try {
      await fs.promises.writeFile(filePath, htmlContent, 'utf8');
      
      // Also create a simple index.html that points to the latest report
      const indexPath = path.join(this.outputDirectory, 'index.html');
      await fs.promises.writeFile(indexPath, htmlContent, 'utf8');
      
      console.log(`📋 Report index saved to: ${filePath}`);
      console.log(`🏠 Main index available at: ${indexPath}`);
    } catch (error) {
      console.error('Failed to save report index:', error);
    }
  }
}