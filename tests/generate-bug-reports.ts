/**
 * Generate Bug Reports from Existing Test Results
 * Parses test-results directory and generates comprehensive bug reports
 */

import fs from 'fs';
import path from 'path';
import { BugReporter, BugReport } from './bug-report';

function findTestResultFiles(testResultsDir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(testResultsDir)) {
    return files;
  }

  function traverseDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        traverseDir(fullPath);
      } else if (entry.name === 'error-context.md' || entry.name.endsWith('.png')) {
        files.push(fullPath);
      }
    }
  }

  traverseDir(testResultsDir);
  return files;
}

function parseErrorContext(errorContextPath: string): { error?: string; details?: string } {
  try {
    const content = fs.readFileSync(errorContextPath, 'utf-8');
    // Extract error information from the markdown file
    return {
      error: content.substring(0, 500), // First 500 chars as error summary
      details: content,
    };
  } catch {
    return {};
  }
}

function extractTestInfo(filePath: string): { testName: string; testFile: string } {
  // Extract test name from path like:
  // test-results/tests-games-Games-Functionality-should-launch-overlay-window/error-context.md
  const parts = filePath.split(path.sep);
  const dirName = parts[parts.length - 2] || '';
  
  // Parse directory name to extract test info
  const match = dirName.match(/tests-([^-]+)-(.+)/);
  if (match) {
    return {
      testFile: match[1],
      testName: match[2].replace(/-/g, ' '),
    };
  }
  
  return {
    testFile: 'unknown',
    testName: dirName.replace(/-/g, ' '),
  };
}

async function generateReports(): Promise<void> {
  console.log('🔍 Scanning test results...\n');

  const testResultsDir = path.join(__dirname, '../tests/test-results');
  const bugReportsDir = path.join(__dirname, 'bug-reports');
  const lastRunFile = path.join(testResultsDir, '.last-run.json');
  
  // Clean up old bug reports before generating new ones
  if (fs.existsSync(bugReportsDir)) {
    console.log('🧹 Cleaning up old bug reports...\n');
    const files = fs.readdirSync(bugReportsDir);
    for (const file of files) {
      const filePath = path.join(bugReportsDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`   Deleted: ${file}`);
      } catch (err: any) {
        console.warn(`   Could not delete ${file}: ${err.message}`);
      }
    }
    console.log('');
  }
  
  const reporter = new BugReporter();
  const bugReports: BugReport[] = [];

  // Read last run info
  let lastRun: any = {};
  if (fs.existsSync(lastRunFile)) {
    try {
      lastRun = JSON.parse(fs.readFileSync(lastRunFile, 'utf-8'));
    } catch (e) {
      console.log('⚠️  Could not parse .last-run.json\n');
    }
  }

  // Find all error context files
  const errorFiles = findTestResultFiles(testResultsDir).filter(f => f.endsWith('error-context.md'));
  
  console.log(`Found ${errorFiles.length} test failure(s)\n`);

  // Process each error file
  const processedTests = new Set<string>();
  
  for (const errorFile of errorFiles) {
    const testInfo = extractTestInfo(errorFile);
    const testKey = `${testInfo.testFile}-${testInfo.testName}`;
    
    if (processedTests.has(testKey)) {
      continue; // Skip duplicates
    }
    processedTests.add(testKey);

    const errorContext = parseErrorContext(errorFile);
    
    // Find associated screenshot if it exists
    const dir = path.dirname(errorFile);
    const screenshots = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    const screenshot = screenshots.length > 0 ? path.join(dir, screenshots[0]) : undefined;

    const report: BugReport = {
      timestamp: new Date(fs.statSync(errorFile).mtime).toISOString(),
      testName: `${testInfo.testFile} - ${testInfo.testName}`,
      status: 'failed',
      error: errorContext.error,
      screenshot: screenshot,
      description: `Test failed: ${testInfo.testName}`,
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    bugReports.push(report);
  }

  // Also check for Playwright JSON results if they exist
  const playwrightResultsPath = path.join(__dirname, 'reports/results.json');
  if (fs.existsSync(playwrightResultsPath)) {
    console.log('📋 Found Playwright JSON results, parsing...\n');
    const playwrightReports = BugReporter.fromPlaywrightResults(playwrightResultsPath);
    
    // Merge with existing reports (avoid duplicates)
    for (const pwReport of playwrightReports) {
      const exists = bugReports.some(r => r.testName === pwReport.testName);
      if (!exists) {
        bugReports.push(pwReport);
      }
    }
  }

  if (bugReports.length === 0) {
    console.log('✅ No failed tests found! All tests passed.\n');
    return;
  }

  // Add all reports to reporter
  reporter.addReports(bugReports);

  // Generate reports
  console.log('📊 Generating bug reports...\n');
  
  const markdownReport = reporter.generateReport();
  const jsonReport = reporter.generateJSON();
  const summaryReport = reporter.generateSummary();

  console.log('✅ Bug Reports Generated:\n');
  console.log(`   📄 Markdown: ${path.relative(process.cwd(), markdownReport)}`);
  console.log(`   📋 JSON: ${path.relative(process.cwd(), jsonReport)}`);
  console.log(`   📝 Summary: ${path.relative(process.cwd(), summaryReport)}\n`);

  // Print summary
  const summary = fs.readFileSync(summaryReport, 'utf-8');
  console.log(summary);
  
  console.log('\n💡 To view the full report, open:');
  console.log(`   ${markdownReport}\n`);
}

generateReports().catch((error) => {
  console.error('❌ Error generating reports:', error);
  process.exit(1);
});
