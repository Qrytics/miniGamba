/**
 * Test Runner with Bug Reporting
 * Runs all tests and generates a comprehensive bug report
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { BugReporter } from './bug-report';

async function runTests(): Promise<void> {
  console.log('🧪 Starting test suite...\n');

  const resultsPath = path.join(__dirname, 'reports/results.json');
  
  // Ensure reports directory exists
  const reportsDir = path.dirname(resultsPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  try {
    // Run Playwright tests with JSON reporter
    console.log('Running Playwright tests...\n');
    execSync('npx playwright test --reporter=json --reporter=list', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
  } catch (error: any) {
    // Playwright exits with non-zero code on test failures, which is expected
    console.log('\n⚠️  Some tests may have failed (this is normal)\n');
  }

  // Parse test results and generate reports
  if (fs.existsSync(resultsPath)) {
    console.log('📊 Generating bug reports...\n');
    
    const reporter = new BugReporter();
    const bugReports = BugReporter.fromPlaywrightResults(resultsPath);
    
    if (bugReports.length > 0) {
      reporter.addReports(bugReports);

      // Generate all report formats
      const markdownReport = reporter.generateReport();
      const jsonReport = reporter.generateJSON();
      const summaryReport = reporter.generateSummary();

      console.log('✅ Bug Reports Generated:\n');
      console.log(`   📄 Markdown: ${path.relative(process.cwd(), markdownReport)}`);
      console.log(`   📋 JSON: ${path.relative(process.cwd(), jsonReport)}`);
      console.log(`   📝 Summary: ${path.relative(process.cwd(), summaryReport)}\n`);

      // Print summary to console
      const summary = fs.readFileSync(summaryReport, 'utf-8');
      console.log(summary);
    } else {
      console.log('⚠️  No test results found in Playwright output\n');
    }
  } else {
    console.log(`⚠️  Results file not found: ${resultsPath}`);
    console.log('   Make sure Playwright tests ran successfully\n');
  }
}

runTests().catch((error) => {
  console.error('❌ Error running tests:', error);
  process.exit(1);
});
