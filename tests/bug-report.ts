/**
 * Bug Report Generator
 * Collects test results and generates comprehensive bug reports
 */

import fs from 'fs';
import path from 'path';

export interface BugReport {
  timestamp: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  errorStack?: string;
  screenshot?: string;
  consoleErrors?: string[];
  consoleWarnings?: string[];
  networkErrors?: NetworkError[];
  performanceMetrics?: PerformanceMetrics;
  description: string;
  duration?: number;
  steps?: TestStep[];
  environment?: {
    platform: string;
    electronVersion?: string;
    nodeVersion: string;
  };
}

export interface NetworkError {
  url: string;
  status?: number;
  statusText?: string;
  error?: string;
  timestamp: string;
}

export interface PerformanceMetrics {
  loadTime?: number;
  renderTime?: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
  };
}

export interface TestStep {
  action: string;
  timestamp: string;
  success: boolean;
  details?: string;
}

export class BugReporter {
  private reports: BugReport[] = [];
  private outputDir: string;
  private screenshotsDir: string;

  constructor(outputDir: string = './tests/bug-reports') {
    this.outputDir = outputDir;
    this.screenshotsDir = path.join(outputDir, '../screenshots');
    
    // Clean up old reports before creating new ones
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      for (const file of files) {
        const filePath = path.join(outputDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          // Ignore errors during cleanup
        }
      }
    }
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  addReport(report: BugReport): void {
    // Add environment info if not present
    if (!report.environment) {
      report.environment = {
        platform: process.platform,
        nodeVersion: process.version,
      };
    }
    this.reports.push(report);
  }

  addReports(reports: BugReport[]): void {
    reports.forEach(report => this.addReport(report));
  }

  generateReport(): string {
    const timestamp = new Date().toISOString();
    const reportFile = path.join(this.outputDir, `bug-report-${timestamp.replace(/[:.]/g, '-')}.md`);

    let markdown = `# Bug Report - ${new Date().toLocaleString()}\n\n`;
    markdown += `Generated: ${timestamp}\n\n`;
    markdown += `---\n\n`;

    const failed = this.reports.filter(r => r.status === 'failed');
    const passed = this.reports.filter(r => r.status === 'passed');

    markdown += `## Summary\n\n`;
    markdown += `- **Total Tests**: ${this.reports.length}\n`;
    markdown += `- **Passed**: ${passed.length}\n`;
    markdown += `- **Failed**: ${failed.length}\n`;
    markdown += `- **Skipped**: ${this.reports.filter(r => r.status === 'skipped').length}\n\n`;

    if (failed.length > 0) {
      markdown += `## Failed Tests\n\n`;
      failed.forEach((report, index) => {
        markdown += `### ${index + 1}. ${report.testName}\n\n`;
        markdown += `**Status**: ❌ Failed\n\n`;
        markdown += `**Description**: ${report.description}\n\n`;
        
        if (report.duration) {
          markdown += `**Duration**: ${report.duration}ms\n\n`;
        }

        if (report.error) {
          markdown += `**Error**:\n\`\`\`\n${report.error}\n\`\`\`\n\n`;
        }

        if (report.errorStack) {
          markdown += `**Stack Trace**:\n\`\`\`\n${report.errorStack}\n\`\`\`\n\n`;
        }

        if (report.screenshot) {
          const screenshotPath = path.relative(this.outputDir, report.screenshot);
          markdown += `**Screenshot**: ![Screenshot](${screenshotPath})\n`;
          markdown += `\n*Full path: \`${report.screenshot}\`*\n\n`;
        }

        if (report.consoleErrors && report.consoleErrors.length > 0) {
          markdown += `**Console Errors** (${report.consoleErrors.length}):\n\`\`\`\n${report.consoleErrors.join('\n')}\n\`\`\`\n\n`;
        }

        if (report.consoleWarnings && report.consoleWarnings.length > 0) {
          markdown += `**Console Warnings** (${report.consoleWarnings.length}):\n\`\`\`\n${report.consoleWarnings.join('\n')}\n\`\`\`\n\n`;
        }

        if (report.networkErrors && report.networkErrors.length > 0) {
          markdown += `**Network Errors** (${report.networkErrors.length}):\n`;
          report.networkErrors.forEach((netError, i) => {
            markdown += `${i + 1}. **${netError.url}**\n`;
            if (netError.status) {
              markdown += `   - Status: ${netError.status} ${netError.statusText || ''}\n`;
            }
            if (netError.error) {
              markdown += `   - Error: ${netError.error}\n`;
            }
            markdown += `   - Time: ${netError.timestamp}\n\n`;
          });
        }

        if (report.performanceMetrics) {
          markdown += `**Performance Metrics**:\n`;
          if (report.performanceMetrics.loadTime) {
            markdown += `- Load Time: ${report.performanceMetrics.loadTime}ms\n`;
          }
          if (report.performanceMetrics.renderTime) {
            markdown += `- Render Time: ${report.performanceMetrics.renderTime}ms\n`;
          }
          if (report.performanceMetrics.memoryUsage) {
            markdown += `- Memory: ${(report.performanceMetrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(report.performanceMetrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB\n`;
          }
          markdown += `\n`;
        }

        if (report.steps && report.steps.length > 0) {
          markdown += `**Test Steps**:\n`;
          report.steps.forEach((step, i) => {
            const icon = step.success ? '✅' : '❌';
            markdown += `${i + 1}. ${icon} ${step.action}\n`;
            if (step.details) {
              markdown += `   ${step.details}\n`;
            }
          });
          markdown += `\n`;
        }

        if (report.environment) {
          markdown += `**Environment**:\n`;
          markdown += `- Platform: ${report.environment.platform}\n`;
          if (report.environment.electronVersion) {
            markdown += `- Electron: ${report.environment.electronVersion}\n`;
          }
          markdown += `- Node: ${report.environment.nodeVersion}\n\n`;
        }

        markdown += `---\n\n`;
      });
    }

    if (passed.length > 0) {
      markdown += `## Passed Tests\n\n`;
      passed.forEach((report) => {
        markdown += `- ✅ ${report.testName}\n`;
      });
      markdown += `\n`;
    }

    fs.writeFileSync(reportFile, markdown);
    return reportFile;
  }

  generateJSON(): string {
    const timestamp = new Date().toISOString();
    const reportFile = path.join(this.outputDir, `bug-report-${timestamp.replace(/[:.]/g, '-')}.json`);

    const report = {
      timestamp,
      summary: {
        total: this.reports.length,
        passed: this.reports.filter(r => r.status === 'passed').length,
        failed: this.reports.filter(r => r.status === 'failed').length,
        skipped: this.reports.filter(r => r.status === 'skipped').length,
      },
      tests: this.reports,
    };

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    return reportFile;
  }

  /**
   * Generate a summary report for quick review
   */
  generateSummary(): string {
    const summaryFile = path.join(this.outputDir, `summary-${Date.now()}.txt`);
    
    const failed = this.reports.filter(r => r.status === 'failed');
    const passed = this.reports.filter(r => r.status === 'passed');
    const skipped = this.reports.filter(r => r.status === 'skipped');

    let summary = `=== Test Summary ===\n\n`;
    summary += `Total: ${this.reports.length}\n`;
    summary += `Passed: ${passed.length} ✅\n`;
    summary += `Failed: ${failed.length} ❌\n`;
    summary += `Skipped: ${skipped.length} ⏭️\n\n`;

    if (failed.length > 0) {
      summary += `=== Failed Tests ===\n\n`;
      failed.forEach((report, i) => {
        summary += `${i + 1}. ${report.testName}\n`;
        if (report.error) {
          summary += `   Error: ${report.error.substring(0, 100)}...\n`;
        }
        summary += `\n`;
      });
    }

    fs.writeFileSync(summaryFile, summary);
    return summaryFile;
  }

  /**
   * Parse Playwright test results JSON and convert to BugReports
   */
  static fromPlaywrightResults(resultsPath: string): BugReport[] {
    if (!fs.existsSync(resultsPath)) {
      return [];
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    const bugReports: BugReport[] = [];

    const traverseSuites = (suites: any[], parentTitle: string = '') => {
      suites.forEach((suite: any) => {
        const suiteTitle = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
        
        if (suite.specs) {
          suite.specs.forEach((spec: any) => {
            spec.tests?.forEach((test: any) => {
              const testResult = test.results?.[0];
              const report: BugReport = {
                timestamp: new Date().toISOString(),
                testName: `${suiteTitle} - ${spec.title} - ${test.title}`,
                status: testResult?.status === 'passed' ? 'passed' :
                       testResult?.status === 'skipped' ? 'skipped' : 'failed',
                error: testResult?.error?.message,
                errorStack: testResult?.error?.stack,
                duration: testResult?.duration,
                description: test.title,
                environment: {
                  platform: process.platform,
                  nodeVersion: process.version,
                },
              };

              // Extract attachments (screenshots, videos, etc.)
              testResult?.attachments?.forEach((attachment: any) => {
                if (attachment.name === 'screenshot' || attachment.path?.endsWith('.png')) {
                  report.screenshot = attachment.path;
                }
              });

              bugReports.push(report);
            });
          });
        }

        if (suite.suites) {
          traverseSuites(suite.suites, suiteTitle);
        }
      });
    };

    if (results.suites) {
      traverseSuites(results.suites);
    }

    return bugReports;
  }
}
