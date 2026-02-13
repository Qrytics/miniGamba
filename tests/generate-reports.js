/**
 * Generate Bug Reports - JavaScript version (no compilation needed)
 * Run with: node tests/generate-reports.js
 * 
 * This script reads Playwright test results and generates comprehensive bug reports
 */

const fs = require('fs');
const path = require('path');

// Simple bug report generator
function generateReports() {
  console.log('🔍 Scanning test results...\n');

  const testResultsDir = path.join(__dirname, 'test-results');
  const reportsDir = path.join(__dirname, 'reports');
  const bugReportsDir = path.join(__dirname, 'bug-reports');
  
  // Clean up old bug reports before generating new ones
  if (fs.existsSync(bugReportsDir)) {
    console.log('🧹 Cleaning up old bug reports...\n');
    const files = fs.readdirSync(bugReportsDir);
    for (const file of files) {
      const filePath = path.join(bugReportsDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`   Deleted: ${file}`);
      } catch (err) {
        console.warn(`   Could not delete ${file}: ${err.message}`);
      }
    }
  }
  
  // Create bug-reports directory
  if (!fs.existsSync(bugReportsDir)) {
    fs.mkdirSync(bugReportsDir, { recursive: true });
  }

  const reports = [];

  // First, try to read Playwright JSON results
  const jsonResultsPath = path.join(reportsDir, 'results.json');
  if (fs.existsSync(jsonResultsPath)) {
    try {
      const jsonResults = JSON.parse(fs.readFileSync(jsonResultsPath, 'utf-8'));
      
      // Process failed tests from JSON
      if (jsonResults.suites) {
        function processSuite(suite) {
          if (suite.specs) {
            for (const spec of suite.specs) {
              if (spec.tests) {
                for (const test of spec.tests) {
                  if (test.results && test.results.some(r => r.status === 'failed')) {
                    const failedResult = test.results.find(r => r.status === 'failed');
                    const testName = `${spec.title} - ${test.title}`;
                    
                    // Find screenshots
                    let screenshot = null;
                    if (failedResult.attachments) {
                      const screenshotAttach = failedResult.attachments.find(a => 
                        a.name === 'screenshot' || a.path?.endsWith('.png')
                      );
                      if (screenshotAttach && screenshotAttach.path) {
                        screenshot = screenshotAttach.path;
                      }
                    }
                    
                    reports.push({
                      testName,
                      error: failedResult.error?.message || 'Test failed',
                      errorStack: failedResult.error?.stack || '',
                      screenshot,
                      fullError: JSON.stringify(failedResult.error, null, 2),
                    });
                  }
                }
              }
            }
          }
          if (suite.suites) {
            suite.suites.forEach(processSuite);
          }
        }
        
        jsonResults.suites.forEach(processSuite);
      }
    } catch (err) {
      console.warn(`⚠️  Could not parse JSON results: ${err.message}`);
    }
  }

  // Also check for error context files in test-results
  function findErrorFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findErrorFiles(fullPath));
      } else if (entry.name === 'error-context.md' || entry.name.endsWith('.png')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const errorFiles = findErrorFiles(testResultsDir);
  
  // Process error context files
  const processed = new Set();
  for (const errorFile of errorFiles) {
    if (errorFile.endsWith('.png')) continue; // Skip screenshots, we'll find them separately
    
    const dir = path.dirname(errorFile);
    const dirName = path.basename(dir);
    
    if (processed.has(dirName)) continue;
    processed.add(dirName);

    const content = fs.readFileSync(errorFile, 'utf-8');
    const screenshots = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    
    // Extract test name from directory
    const testName = dirName
      .replace(/tests-[^-]+-/, '')
      .replace(/-/g, ' ');

    // Only add if not already in reports (from JSON)
    if (!reports.some(r => r.testName.includes(testName))) {
      reports.push({
        testName,
        error: content.substring(0, 500),
        screenshot: screenshots.length > 0 ? path.join(dir, screenshots[0]) : null,
        fullError: content,
      });
    }
  }

  if (reports.length === 0) {
    console.log('✅ No failed tests found!\n');
    console.log('💡 Make sure you run tests first with: npm run test:e2e\n');
    return;
  }

  // Generate Markdown report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const mdReport = path.join(bugReportsDir, `bug-report-${timestamp}.md`);
  
  let markdown = `# Bug Report - ${new Date().toLocaleString()}\n\n`;
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total Failures**: ${reports.length}\n\n`;
  markdown += `---\n\n`;

  reports.forEach((report, i) => {
    markdown += `## ${i + 1}. ${report.testName}\n\n`;
    markdown += `**Status**: ❌ Failed\n\n`;
    
    if (report.error) {
      markdown += `**Error**:\n\`\`\`\n${report.error}\n\`\`\`\n\n`;
    }
    
    if (report.errorStack && report.errorStack !== report.error) {
      markdown += `**Stack Trace**:\n\`\`\`\n${report.errorStack.substring(0, 1000)}\n\`\`\`\n\n`;
    }
    
    if (report.screenshot && fs.existsSync(report.screenshot)) {
      // Copy screenshot to bug-reports directory
      const screenshotName = `screenshot-${i + 1}-${Date.now()}.png`;
      const screenshotDest = path.join(bugReportsDir, screenshotName);
      try {
        fs.copyFileSync(report.screenshot, screenshotDest);
        markdown += `**Screenshot**: ![Screenshot](${screenshotName})\n\n`;
      } catch (err) {
        console.warn(`Could not copy screenshot: ${err.message}`);
      }
    }
    
    markdown += `---\n\n`;
  });

  fs.writeFileSync(mdReport, markdown);

  // Generate JSON report
  const jsonReport = path.join(bugReportsDir, `bug-report-${timestamp}.json`);
  fs.writeFileSync(jsonReport, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { total: reports.length },
    tests: reports.map(r => ({
      testName: r.testName,
      status: 'failed',
      error: r.error,
      screenshot: r.screenshot,
    })),
  }, null, 2));

  console.log('✅ Bug Reports Generated:\n');
  console.log(`   📄 Markdown: ${path.relative(process.cwd(), mdReport)}`);
  console.log(`   📋 JSON: ${path.relative(process.cwd(), jsonReport)}\n`);
  
  console.log('📊 Summary:\n');
  reports.forEach((r, i) => {
    console.log(`   ${i + 1}. ❌ ${r.testName}`);
  });
  console.log('\n💡 Open the Markdown file to see full details!\n');
}

generateReports();
