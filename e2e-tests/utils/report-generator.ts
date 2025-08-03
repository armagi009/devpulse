import { Page, BrowserContext } from '@playwright/test';
import { DetectedError, ErrorCategories } from './error-detector';
import { ErrorReport, ErrorReporter, FixSuggestion, CoverageReport } from './error-reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Comprehensive Error Report Generation System
 * 
 * This module extends existing HTML reporting with categorized error reports,
 * role-specific error summaries, error pattern analysis, and automated fix
 * suggestion generation.
 * 
 * Requirements: 2.5, 5.3, 5.4
 */

export interface ComprehensiveReport extends ErrorReport {
  errorPatterns: ErrorPattern[];
  roleComparison: RoleComparisonReport;
  prioritizedActionItems: ActionItem[];
  executiveSummary: ExecutiveSummary;
}

export interface ErrorPattern {
  id: string;
  pattern: string;
  frequency: number;
  affectedRoles: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  commonCause: string;
  suggestedFix: string;
  relatedErrors: string[];
}

export interface RoleComparisonReport {
  totalRoles: number;
  roleErrorCounts: { [role: string]: number };
  sharedIssues: string[];
  roleSpecificIssues: { [role: string]: string[] };
  mostProblematicRole: string;
  leastProblematicRole: string;
}

export interface ActionItem {
  id: string;
  priority: number;
  title: string;
  description: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  estimatedEffort: 'low' | 'medium' | 'high';
  affectedUsers: string[];
  relatedErrors: string[];
  actionSteps: string[];
  assignedTo?: string;
  dueDate?: Date;
}

export interface ExecutiveSummary {
  overallHealth: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
  totalIssuesFound: number;
  criticalIssuesCount: number;
  estimatedFixTime: string;
  topPriorities: string[];
  riskAssessment: string;
  recommendations: string[];
}

export class ComprehensiveReportGenerator {
  private reportDirectory: string;
  private templateDirectory: string;

  constructor(
    private page: Page,
    private context: BrowserContext,
    baseReportPath: string = './test-data/error-reports'
  ) {
    this.reportDirectory = baseReportPath;
    this.templateDirectory = path.join(baseReportPath, 'templates');
    this.ensureDirectoriesExist();
  }

  /**
   * Generate comprehensive error report with enhanced analysis
   */
  async generateComprehensiveReport(
    errors: DetectedError[],
    testCoverage?: CoverageReport
  ): Promise<ComprehensiveReport> {
    // Generate base error report using existing ErrorReporter
    const errorReporter = new ErrorReporter(this.page, this.context, this.reportDirectory);
    const baseReport = await errorReporter.generateErrorReport(errors, testCoverage);

    // Generate enhanced analysis
    const errorPatterns = this.analyzeErrorPatterns(errors);
    const roleComparison = this.generateRoleComparison(errors);
    const prioritizedActionItems = this.generateActionItems(errors, errorPatterns);
    const executiveSummary = this.generateExecutiveSummary(errors, errorPatterns, roleComparison);

    const comprehensiveReport: ComprehensiveReport = {
      ...baseReport,
      errorPatterns,
      roleComparison,
      prioritizedActionItems,
      executiveSummary
    };

    // Save comprehensive report
    await this.saveComprehensiveReport(comprehensiveReport);
    
    // Generate enhanced HTML report
    await this.generateEnhancedHTMLReport(comprehensiveReport);

    return comprehensiveReport;
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectoriesExist(): void {
    const directories = [this.reportDirectory, this.templateDirectory];
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Save comprehensive report to JSON file
   */
  private async saveComprehensiveReport(report: ComprehensiveReport): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(this.reportDirectory, `comprehensive-report-${timestamp}.json`);
    
    try {
      await fs.promises.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8');
      console.log(`Comprehensive report saved to: ${jsonPath}`);
    } catch (error) {
      console.error('Failed to save comprehensive report:', error);
    }
  }

  /**
   * Analyze error patterns to identify common issues and trends
   */
  private analyzeErrorPatterns(errors: DetectedError[]): ErrorPattern[] {
    const patterns: ErrorPattern[] = [];
    const errorGroups = new Map<string, DetectedError[]>();

    // Group errors by similar characteristics
    errors.forEach(error => {
      const key = this.generatePatternKey(error);
      if (!errorGroups.has(key)) {
        errorGroups.set(key, []);
      }
      errorGroups.get(key)!.push(error);
    });

    // Convert groups to patterns
    let patternId = 1;
    errorGroups.forEach((groupErrors, patternKey) => {
      if (groupErrors.length > 1) { // Only create patterns for recurring issues
        const pattern: ErrorPattern = {
          id: `pattern-${patternId++}`,
          pattern: patternKey,
          frequency: groupErrors.length,
          affectedRoles: [...new Set(groupErrors.map(e => e.userRole))],
          severity: this.determinePatterSeverity(groupErrors),
          description: this.generatePatternDescription(groupErrors),
          commonCause: this.identifyCommonCause(groupErrors),
          suggestedFix: this.generatePatternFix(groupErrors),
          relatedErrors: groupErrors.map(e => e.id)
        };
        patterns.push(pattern);
      }
    });

    // Sort patterns by frequency and severity
    return patterns.sort((a, b) => {
      const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aWeight = severityWeight[a.severity] * a.frequency;
      const bWeight = severityWeight[b.severity] * b.frequency;
      return bWeight - aWeight;
    });
  }

  /**
   * Generate role comparison analysis
   */
  private generateRoleComparison(errors: DetectedError[]): RoleComparisonReport {
    const roleErrorCounts: { [role: string]: number } = {};
    const roleSpecificIssues: { [role: string]: string[] } = {};
    const errorsByRole = new Map<string, DetectedError[]>();

    // Group errors by role
    errors.forEach(error => {
      const role = error.userRole;
      roleErrorCounts[role] = (roleErrorCounts[role] || 0) + 1;
      
      if (!errorsByRole.has(role)) {
        errorsByRole.set(role, []);
      }
      errorsByRole.get(role)!.push(error);
    });

    // Identify role-specific vs shared issues
    const allErrorTypes = new Set(errors.map(e => e.type));
    const sharedIssues: string[] = [];

    allErrorTypes.forEach(errorType => {
      const rolesWithThisError = new Set(
        errors.filter(e => e.type === errorType).map(e => e.userRole)
      );
      
      if (rolesWithThisError.size > 1) {
        sharedIssues.push(errorType);
      } else {
        const role = Array.from(rolesWithThisError)[0];
        if (!roleSpecificIssues[role]) {
          roleSpecificIssues[role] = [];
        }
        roleSpecificIssues[role].push(errorType);
      }
    });

    // Find most and least problematic roles
    const sortedRoles = Object.entries(roleErrorCounts)
      .sort(([,a], [,b]) => b - a);
    
    const mostProblematicRole = sortedRoles[0]?.[0] || 'none';
    const leastProblematicRole = sortedRoles[sortedRoles.length - 1]?.[0] || 'none';

    return {
      totalRoles: Object.keys(roleErrorCounts).length,
      roleErrorCounts,
      sharedIssues,
      roleSpecificIssues,
      mostProblematicRole,
      leastProblematicRole
    };
  }

  /**
   * Generate prioritized action items for developers
   */
  private generateActionItems(errors: DetectedError[], patterns: ErrorPattern[]): ActionItem[] {
    const actionItems: ActionItem[] = [];
    let itemId = 1;

    // Create action items from error patterns
    patterns.forEach(pattern => {
      const relatedErrors = errors.filter(e => pattern.relatedErrors.includes(e.id));
      const affectedUsers = [...new Set(relatedErrors.map(e => e.userRole))];
      
      const actionItem: ActionItem = {
        id: `action-${itemId++}`,
        priority: this.calculateActionPriority(pattern, relatedErrors),
        title: `Fix ${pattern.description}`,
        description: `Address ${pattern.frequency} occurrences of ${pattern.pattern} affecting ${affectedUsers.join(', ')} roles`,
        estimatedImpact: this.estimateImpact(pattern, relatedErrors),
        estimatedEffort: this.estimateEffort(pattern, relatedErrors),
        affectedUsers,
        relatedErrors: pattern.relatedErrors,
        actionSteps: this.generateActionSteps(pattern, relatedErrors)
      };
      
      actionItems.push(actionItem);
    });

    // Create action items for critical individual errors not covered by patterns
    const patternErrorIds = new Set(patterns.flatMap(p => p.relatedErrors));
    const uncoveredCriticalErrors = errors.filter(
      e => e.severity === 'critical' && !patternErrorIds.has(e.id)
    );

    uncoveredCriticalErrors.forEach(error => {
      const actionItem: ActionItem = {
        id: `action-${itemId++}`,
        priority: 1, // Critical errors get highest priority
        title: `Fix critical error: ${error.message}`,
        description: `Address critical error in ${error.userRole} role: ${error.message}`,
        estimatedImpact: 'high',
        estimatedEffort: 'medium',
        affectedUsers: [error.userRole],
        relatedErrors: [error.id],
        actionSteps: this.generateCriticalErrorSteps(error)
      };
      
      actionItems.push(actionItem);
    });

    // Sort by priority
    return actionItems.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate executive summary with overall health assessment
   */
  private generateExecutiveSummary(
    errors: DetectedError[],
    patterns: ErrorPattern[],
    roleComparison: RoleComparisonReport
  ): ExecutiveSummary {
    const criticalErrors = errors.filter(e => e.severity === 'critical');
    const highErrors = errors.filter(e => e.severity === 'high');
    
    // Calculate overall health
    const overallHealth = this.calculateOverallHealth(errors);
    
    // Estimate fix time
    const estimatedFixTime = this.estimateOverallFixTime(errors, patterns);
    
    // Generate top priorities
    const topPriorities = this.generateTopPriorities(errors, patterns, roleComparison);
    
    // Risk assessment
    const riskAssessment = this.generateRiskAssessment(errors, patterns);
    
    // Recommendations
    const recommendations = this.generateRecommendations(errors, patterns, roleComparison);

    return {
      overallHealth,
      totalIssuesFound: errors.length,
      criticalIssuesCount: criticalErrors.length,
      estimatedFixTime,
      topPriorities,
      riskAssessment,
      recommendations
    };
  }

  /**
   * Generate enhanced HTML report with comprehensive analysis
   */
  private async generateEnhancedHTMLReport(report: ComprehensiveReport): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlPath = path.join(this.reportDirectory, `comprehensive-report-${timestamp}.html`);
    
    const htmlContent = this.generateHTMLContent(report);
    
    try {
      await fs.promises.writeFile(htmlPath, htmlContent, 'utf8');
      console.log(`Enhanced HTML report saved to: ${htmlPath}`);
      return htmlPath;
    } catch (error) {
      console.error('Failed to save HTML report:', error);
      throw error;
    }
  }

  // Helper methods for pattern analysis
  private generatePatternKey(error: DetectedError): string {
    // Create a key that groups similar errors together
    const urlPattern = error.url.replace(/\/\d+/g, '/:id').replace(/\?.*/, '');
    return `${error.type}-${urlPattern}-${error.severity}`;
  }

  private determinePatterSeverity(errors: DetectedError[]): 'critical' | 'high' | 'medium' | 'low' {
    const severities = errors.map(e => e.severity);
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }

  private generatePatternDescription(errors: DetectedError[]): string {
    const errorType = errors[0].type;
    const commonUrl = this.findCommonUrlPattern(errors);
    return `${errorType} errors on ${commonUrl}`;
  }

  private identifyCommonCause(errors: DetectedError[]): string {
    const firstError = errors[0];
    switch (firstError.type) {
      case 'network':
        return 'API endpoint or network connectivity issues';
      case 'runtime':
        return 'JavaScript execution errors or missing dependencies';
      case 'rendering':
        return 'UI component rendering or CSS loading issues';
      case 'navigation':
        return 'Routing or permission-related navigation problems';
      default:
        return 'Unknown cause - requires investigation';
    }
  }

  private generatePatternFix(errors: DetectedError[]): string {
    const firstError = errors[0];
    switch (firstError.type) {
      case 'network':
        return 'Check API endpoint implementation and error handling';
      case 'runtime':
        return 'Review JavaScript code and fix syntax/logic errors';
      case 'rendering':
        return 'Verify component props and CSS dependencies';
      case 'navigation':
        return 'Check route definitions and permission middleware';
      default:
        return 'Investigate error details and stack traces';
    }
  }

  private findCommonUrlPattern(errors: DetectedError[]): string {
    const urls = errors.map(e => e.url);
    if (urls.length === 1) return urls[0];
    
    // Find common path segments
    const pathSegments = urls.map(url => url.split('/'));
    const commonSegments: string[] = [];
    
    const minLength = Math.min(...pathSegments.map(p => p.length));
    for (let i = 0; i < minLength; i++) {
      const segment = pathSegments[0][i];
      if (pathSegments.every(p => p[i] === segment)) {
        commonSegments.push(segment);
      } else {
        break;
      }
    }
    
    return commonSegments.join('/') || 'multiple pages';
  }

  private calculateActionPriority(pattern: ErrorPattern, errors: DetectedError[]): number {
    const severityWeight = { critical: 1, high: 2, medium: 3, low: 4 };
    const frequencyWeight = Math.max(1, 5 - pattern.frequency);
    const roleWeight = Math.max(1, 4 - pattern.affectedRoles.length);
    
    return severityWeight[pattern.severity] + frequencyWeight + roleWeight;
  }

  private estimateImpact(pattern: ErrorPattern, errors: DetectedError[]): 'high' | 'medium' | 'low' {
    if (pattern.severity === 'critical' || pattern.affectedRoles.length > 2) return 'high';
    if (pattern.severity === 'high' || pattern.frequency > 3) return 'medium';
    return 'low';
  }

  private estimateEffort(pattern: ErrorPattern, errors: DetectedError[]): 'low' | 'medium' | 'high' {
    if (pattern.frequency > 5 || pattern.affectedRoles.length > 2) return 'high';
    if (pattern.severity === 'critical' || pattern.frequency > 2) return 'medium';
    return 'low';
  }

  private generateActionSteps(pattern: ErrorPattern, errors: DetectedError[]): string[] {
    const steps = [
      `Investigate ${pattern.frequency} occurrences of ${pattern.pattern}`,
      `Review error details and stack traces`,
      `${pattern.suggestedFix}`,
      `Test fix across all affected roles: ${pattern.affectedRoles.join(', ')}`,
      'Verify resolution with comprehensive test suite'
    ];
    
    return steps;
  }

  private generateCriticalErrorSteps(error: DetectedError): string[] {
    return [
      `Investigate critical error: ${error.message}`,
      `Review stack trace: ${error.stackTrace || 'No stack trace available'}`,
      `Test reproduction steps in ${error.userRole} role`,
      'Implement fix and verify resolution',
      'Run comprehensive tests to ensure no regression'
    ];
  }

  private calculateOverallHealth(errors: DetectedError[]): 'critical' | 'poor' | 'fair' | 'good' | 'excellent' {
    const criticalCount = errors.filter(e => e.severity === 'critical').length;
    const highCount = errors.filter(e => e.severity === 'high').length;
    const totalErrors = errors.length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 3 || totalErrors > 10) return 'poor';
    if (highCount > 1 || totalErrors > 5) return 'fair';
    if (totalErrors > 0) return 'good';
    return 'excellent';
  }

  private estimateOverallFixTime(errors: DetectedError[], patterns: ErrorPattern[]): string {
    let totalHours = 0;
    
    // Estimate time based on error severity and frequency
    errors.forEach(error => {
      switch (error.severity) {
        case 'critical': totalHours += 4; break;
        case 'high': totalHours += 2; break;
        case 'medium': totalHours += 1; break;
        case 'low': totalHours += 0.5; break;
      }
    });

    // Reduce time for patterns (fixing one pattern fixes multiple errors)
    patterns.forEach(pattern => {
      const patternSavings = (pattern.frequency - 1) * 0.5;
      totalHours = Math.max(0, totalHours - patternSavings);
    });

    if (totalHours < 1) return '< 1 hour';
    if (totalHours < 8) return `${Math.ceil(totalHours)} hours`;
    if (totalHours < 40) return `${Math.ceil(totalHours / 8)} days`;
    return `${Math.ceil(totalHours / 40)} weeks`;
  }

  private generateTopPriorities(
    errors: DetectedError[],
    patterns: ErrorPattern[],
    roleComparison: RoleComparisonReport
  ): string[] {
    const priorities: string[] = [];

    // Critical errors first
    const criticalErrors = errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      priorities.push(`Fix ${criticalErrors.length} critical error(s) immediately`);
    }

    // Most frequent patterns
    const topPatterns = patterns.slice(0, 3);
    topPatterns.forEach(pattern => {
      priorities.push(`Address ${pattern.description} (${pattern.frequency} occurrences)`);
    });

    // Role-specific issues
    if (roleComparison.mostProblematicRole !== 'none') {
      const errorCount = roleComparison.roleErrorCounts[roleComparison.mostProblematicRole];
      priorities.push(`Focus on ${roleComparison.mostProblematicRole} role issues (${errorCount} errors)`);
    }

    return priorities.slice(0, 5); // Top 5 priorities
  }

  private generateRiskAssessment(errors: DetectedError[], patterns: ErrorPattern[]): string {
    const criticalCount = errors.filter(e => e.severity === 'critical').length;
    const highCount = errors.filter(e => e.severity === 'high').length;
    const totalErrors = errors.length;

    if (criticalCount > 0) {
      return `High risk: ${criticalCount} critical error(s) could prevent core functionality`;
    }
    
    if (highCount > 2) {
      return `Medium risk: ${highCount} high-severity errors may impact user experience`;
    }
    
    if (totalErrors > 5) {
      return `Low-medium risk: Multiple minor issues could accumulate to impact usability`;
    }
    
    if (totalErrors > 0) {
      return `Low risk: Minor issues present but unlikely to significantly impact users`;
    }
    
    return 'Minimal risk: No significant issues detected';
  }

  private generateRecommendations(
    errors: DetectedError[],
    patterns: ErrorPattern[],
    roleComparison: RoleComparisonReport
  ): string[] {
    const recommendations: string[] = [];

    // Error-based recommendations
    if (errors.some(e => e.severity === 'critical')) {
      recommendations.push('Prioritize critical error fixes before any new feature development');
    }

    if (patterns.length > 3) {
      recommendations.push('Focus on fixing error patterns to resolve multiple issues efficiently');
    }

    // Role-based recommendations
    if (roleComparison.sharedIssues.length > 0) {
      recommendations.push('Address shared issues first to improve experience across all roles');
    }

    if (Object.keys(roleComparison.roleErrorCounts).length > 1) {
      const mostProblematic = roleComparison.mostProblematicRole;
      recommendations.push(`Conduct focused testing on ${mostProblematic} role functionality`);
    }

    // Testing recommendations
    if (errors.length > 0) {
      recommendations.push('Implement automated regression tests for fixed issues');
      recommendations.push('Consider increasing test coverage in problematic areas');
    }

    return recommendations;
  }

  private generateHTMLContent(report: ComprehensiveReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .metric { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; }
        .critical { color: #d32f2f; }
        .high { color: #f57c00; }
        .medium { color: #fbc02d; }
        .low { color: #388e3c; }
        .section { margin-bottom: 30px; }
        .section h2 { border-bottom: 2px solid #333; padding-bottom: 10px; }
        .error-list { background: #f9f9f9; padding: 15px; border-radius: 5px; }
        .error-item { margin-bottom: 15px; padding: 10px; background: white; border-left: 4px solid #ddd; }
        .action-item { margin-bottom: 15px; padding: 15px; background: #f0f8ff; border-radius: 5px; }
        .priority-1 { border-left: 4px solid #d32f2f; }
        .priority-2 { border-left: 4px solid #f57c00; }
        .priority-3 { border-left: 4px solid #fbc02d; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f4f4f4; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Comprehensive Test Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Overall Health: <span class="${report.executiveSummary.overallHealth}">${report.executiveSummary.overallHealth.toUpperCase()}</span></p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Issues</h3>
            <div class="value">${report.executiveSummary.totalIssuesFound}</div>
        </div>
        <div class="metric">
            <h3>Critical Issues</h3>
            <div class="value critical">${report.executiveSummary.criticalIssuesCount}</div>
        </div>
        <div class="metric">
            <h3>Estimated Fix Time</h3>
            <div class="value">${report.executiveSummary.estimatedFixTime}</div>
        </div>
        <div class="metric">
            <h3>Affected Roles</h3>
            <div class="value">${report.roleComparison.totalRoles}</div>
        </div>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <p><strong>Risk Assessment:</strong> ${report.executiveSummary.riskAssessment}</p>
        
        <h3>Top Priorities</h3>
        <ul>
            ${report.executiveSummary.topPriorities.map(priority => `<li>${priority}</li>`).join('')}
        </ul>

        <h3>Recommendations</h3>
        <ul>
            ${report.executiveSummary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>Error Patterns</h2>
        ${report.errorPatterns.map(pattern => `
            <div class="error-item">
                <h4>${pattern.description} <span class="${pattern.severity}">(${pattern.severity.toUpperCase()})</span></h4>
                <p><strong>Frequency:</strong> ${pattern.frequency} occurrences</p>
                <p><strong>Affected Roles:</strong> ${pattern.affectedRoles.join(', ')}</p>
                <p><strong>Common Cause:</strong> ${pattern.commonCause}</p>
                <p><strong>Suggested Fix:</strong> ${pattern.suggestedFix}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Role Comparison</h2>
        <table>
            <thead>
                <tr>
                    <th>Role</th>
                    <th>Error Count</th>
                    <th>Specific Issues</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(report.roleComparison.roleErrorCounts).map(([role, count]) => `
                    <tr>
                        <td>${role}</td>
                        <td>${count}</td>
                        <td>${(report.roleComparison.roleSpecificIssues[role] || []).join(', ') || 'None'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h3>Shared Issues</h3>
        <p>${report.roleComparison.sharedIssues.join(', ') || 'None'}</p>
    </div>

    <div class="section">
        <h2>Prioritized Action Items</h2>
        ${report.prioritizedActionItems.map(item => `
            <div class="action-item priority-${item.priority}">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <p><strong>Impact:</strong> ${item.estimatedImpact} | <strong>Effort:</strong> ${item.estimatedEffort}</p>
                <p><strong>Affected Users:</strong> ${item.affectedUsers.join(', ')}</p>
                <h5>Action Steps:</h5>
                <ol>
                    ${item.actionSteps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Detailed Error Report</h2>
        <div class="error-list">
            ${report.categorizedErrors.runtimeErrors.map(error => `
                <div class="error-item">
                    <h4>Runtime Error: ${error.message}</h4>
                    <p><strong>URL:</strong> ${error.url}</p>
                    <p><strong>Role:</strong> ${error.userRole}</p>
                    <p><strong>Severity:</strong> <span class="${error.severity}">${error.severity}</span></p>
                    ${error.stackTrace ? `<p><strong>Stack Trace:</strong> <pre>${error.stackTrace}</pre></p>` : ''}
                </div>
            `).join('')}
            
            ${report.categorizedErrors.networkErrors.map(error => `
                <div class="error-item">
                    <h4>Network Error: ${error.message}</h4>
                    <p><strong>URL:</strong> ${error.url}</p>
                    <p><strong>Role:</strong> ${error.userRole}</p>
                    <p><strong>Severity:</strong> <span class="${error.severity}">${error.severity}</span></p>
                </div>
            `).join('')}
            
            ${report.categorizedErrors.renderingErrors.map(error => `
                <div class="error-item">
                    <h4>Rendering Error: ${error.message}</h4>
                    <p><strong>URL:</strong> ${error.url}</p>
                    <p><strong>Role:</strong> ${error.userRole}</p>
                    <p><strong>Severity:</strong> <span class="${error.severity}">${error.severity}</span></p>
                </div>
            `).join('')}
            
            ${report.categorizedErrors.navigationErrors.map(error => `
                <div class="error-item">
                    <h4>Navigation Error: ${error.message}</h4>
                    <p><strong>URL:</strong> ${error.url}</p>
                    <p><strong>Role:</strong> ${error.userRole}</p>
                    <p><strong>Severity:</strong> <span class="${error.severity}">${error.severity}</span></p>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;
  }
}