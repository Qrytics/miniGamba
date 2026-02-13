/**
 * Analyze Test Data and E2E Results for Bugs
 * 1. Scans test-data / test-data-worker folders for DB, logs, cache issues
 * 2. Reads Playwright results (tests/reports/results.json) for failed tests
 * 3. Scans tests/test-results for error-context.md and failure screenshots
 * Run with: node tests/analyze-test-data.js
 */

const fs = require('fs');
const path = require('path');

function collectPlaywrightFailures(baseDir) {
  const bugs = [];
  const testsDir = path.join(baseDir, 'tests');
  const reportsDir = path.join(testsDir, 'reports');
  const testResultsDir = path.join(testsDir, 'test-results');
  const jsonPath = path.join(reportsDir, 'results.json');

  if (!fs.existsSync(jsonPath)) {
    return bugs;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  } catch (e) {
    return bugs;
  }

  function walk(suites, parentTitle = '') {
    if (!Array.isArray(suites)) return;
    for (const suite of suites) {
      const title = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
      if (suite.specs) {
        for (const spec of suite.specs) {
          if (!spec.tests) continue;
          for (const test of spec.tests) {
            const result = test.results && test.results.find(r => r.status === 'failed');
            if (!result) continue;
            const testName = [title, spec.title, test.title].filter(Boolean).join(' - ');
            let screenshot = null;
            if (result.attachments) {
              const att = result.attachments.find(a => a.name === 'screenshot' || (a.path && a.path.endsWith('.png')));
              if (att && att.path) screenshot = att.path;
            }
            bugs.push({
              type: 'e2e_failure',
              folder: 'Playwright',
              file: testName,
              content: (result.error && result.error.message) ? result.error.message : 'Test failed',
              stack: result.error && result.error.stack,
              screenshot,
            });
          }
        }
      }
      if (suite.suites) walk(suite.suites, title);
    }
  }

  if (data.suites) walk(data.suites);

  // Also collect error-context.md from test-results
  function findErrorContexts(dir) {
    const out = [];
    if (!fs.existsSync(dir)) return out;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        out.push(...findErrorContexts(full));
      } else if (e.name === 'error-context.md') {
        out.push(full);
      }
    }
    return out;
  }

  for (const ctxPath of findErrorContexts(testResultsDir)) {
    const dir = path.dirname(ctxPath);
    const dirName = path.basename(dir);
    let content = '';
    try {
      content = fs.readFileSync(ctxPath, 'utf-8');
    } catch (_) {}
    const screenshots = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    const testName = dirName.replace(/^tests-.*?-/, '').replace(/-/g, ' ');
    if (!bugs.some(b => b.type === 'e2e_failure' && b.file.includes(testName))) {
      bugs.push({
        type: 'e2e_failure',
        folder: 'test-results',
        file: dirName,
        content: content.substring(0, 800),
        screenshot: screenshots.length ? path.join(dir, screenshots[0]) : null,
      });
    }
  }

  return bugs;
}

function analyzeTestData() {
  console.log('🔍 Analyzing test data and E2E results for bugs...\n');

  const baseDir = path.join(__dirname, '..');
  const testDataDir = path.join(baseDir, 'test-data');
  const bugs = [];

  // --- 1. Playwright failures (always run so we pick up all observed test bugs) ---
  const e2eBugs = collectPlaywrightFailures(baseDir);
  if (e2eBugs.length > 0) {
    console.log(`📋 E2E failures: ${e2eBugs.length} (from tests/reports/results.json + test-results)\n`);
    bugs.push(...e2eBugs);
  } else {
    console.log('📋 E2E: No failed tests in Playwright results.\n');
  }

  // --- 2. Test-data folders (worker DBs, logs, cache) ---
  const folders = [];

  if (fs.existsSync(testDataDir)) {
    const entries = fs.readdirSync(testDataDir);
    for (const entry of entries) {
      if (/^worker-/.test(entry)) {
        folders.push({
          name: entry,
          path: path.join(testDataDir, entry),
          location: 'test-data/'
        });
      }
    }
  }

  if (fs.existsSync(baseDir)) {
    const entries = fs.readdirSync(baseDir);
    for (const entry of entries) {
      if (/^test-data-worker-/.test(entry)) {
        const fullPath = path.join(baseDir, entry);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            folders.push({
              name: entry,
              path: fullPath,
              location: 'root/'
            });
          }
        } catch (error) {}
      }
    }
  }

  if (folders.length > 0) {
    console.log(`Found ${folders.length} test data folder(s):\n`);
    for (const folder of folders) {
      console.log(`📁 Analyzing: ${folder.location}${folder.name}`);
      const bugsInFolder = analyzeFolder(folder.path, folder.name);
      if (bugsInFolder.length > 0) {
        bugs.push(...bugsInFolder.map(b => ({ ...b, folder: folder.name })));
      }
      const dbFiles = findFiles(folder.path, /\.db$/);
      if (dbFiles.length > 0) {
        console.log(`   📊 Database: ${dbFiles.length} file(s) found`);
      }
      const logFiles = findFiles(folder.path, /\.log$/i);
      if (logFiles.length > 0) {
        console.log(`   📝 Logs: ${logFiles.length} file(s) found`);
      }
      console.log('');
    }
  } else {
    console.log('📁 No test-data folders found (run test:e2e to create worker data).\n');
  }

  // Generate bug report when we have any issues (E2E or test-data)
  if (bugs.length > 0) {
    const bugReportsDir = path.join(__dirname, 'bug-reports');
    if (!fs.existsSync(bugReportsDir)) {
      fs.mkdirSync(bugReportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(bugReportsDir, `test-data-analysis-${timestamp}.md`);
    
    let report = `# Test & Data Analysis - ${new Date().toLocaleString()}\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    const e2eCount = bugs.filter(b => b.type === 'e2e_failure').length;
    report += `- **Test data folders analyzed**: ${folders.length}\n`;
    report += `- **E2E failures**: ${e2eCount}\n`;
    report += `- **Total issues**: ${bugs.length}\n\n`;
    report += `---\n\n`;
    
    bugs.forEach((bug, i) => {
      report += `## ${i + 1}. ${bug.type}${bug.folder ? ` (${bug.folder})` : ''}\n\n`;
      report += `**Location**: \`${bug.file || bug.folder || '—'}\`\n\n`;
      if (bug.content) {
        report += `**Details**:\n\`\`\`\n${bug.content}\n\`\`\`\n\n`;
      }
      if (bug.stack && bug.stack !== bug.content) {
        report += `**Stack**:\n\`\`\`\n${bug.stack.substring(0, 1200)}\n\`\`\`\n\n`;
      }
      if (bug.screenshot && fs.existsSync(bug.screenshot)) {
        const base = path.basename(bug.screenshot);
        const name = `screenshot-${i + 1}-${base}`;
        const dest = path.join(bugReportsDir, name);
        try {
          fs.copyFileSync(bug.screenshot, dest);
          report += `**Screenshot**: ![screenshot](${name})\n\n`;
        } catch (_) {}
      }
      report += `---\n\n`;
    });
    
    fs.writeFileSync(reportPath, report);
    
    console.log(`\n✅ Analysis complete! Found ${bugs.length} issue(s).`);
    console.log(`📄 Report saved: ${path.relative(baseDir, reportPath)}\n`);
  } else {
    console.log(`\n✅ Analysis complete! No issues found (E2E + test data).\n`);
  }
}

function analyzeFolder(folderPath, folderName) {
  const bugs = [];
  
  // Check database integrity (basic check)
  const dbFiles = findFiles(folderPath, /\.db$/);
  for (const dbFile of dbFiles) {
    try {
      const stats = fs.statSync(dbFile);
      if (stats.size === 0) {
        bugs.push({
          type: 'empty_database',
          file: path.relative(path.join(__dirname, '..'), dbFile),
          content: 'Database file is empty (0 bytes) - may indicate initialization failure'
        });
      } else if (stats.size < 1024) {
        bugs.push({
          type: 'small_database',
          file: path.relative(path.join(__dirname, '..'), dbFile),
          content: `Database file is unusually small (${stats.size} bytes) - may be corrupted or incomplete`
        });
      }
      
      // Try to read database file header to check if it's a valid SQLite file
      const fd = fs.openSync(dbFile, 'r');
      const buffer = Buffer.alloc(16);
      fs.readSync(fd, buffer, 0, 16, 0);
      fs.closeSync(fd);
      
      // SQLite files start with "SQLite format 3\000"
      const header = buffer.toString('utf8', 0, 16);
      if (!header.startsWith('SQLite format')) {
        bugs.push({
          type: 'invalid_database_format',
          file: path.relative(path.join(__dirname, '..'), dbFile),
          content: 'Database file does not appear to be a valid SQLite database'
        });
      }
    } catch (error) {
      bugs.push({
        type: 'database_read_error',
        file: path.relative(path.join(__dirname, '..'), dbFile),
        content: `Could not read database: ${error.message}`
      });
    }
  }
  
  // Check for error logs
  const logFiles = findFiles(folderPath, /\.log$/i);
  for (const logFile of logFiles) {
    try {
      const content = fs.readFileSync(logFile, 'utf-8');
      const errorLines = content.split('\n').filter(line => 
        /error|fail|exception|crash|warning.*error/i.test(line)
      );
      if (errorLines.length > 0) {
        bugs.push({
          type: 'error_log',
          file: path.relative(path.join(__dirname, '..'), logFile),
          content: `Found ${errorLines.length} error line(s):\n${errorLines.slice(0, 5).join('\n')}`
        });
      }
    } catch (error) {
      // Could not read log
    }
  }
  
  // Check for corrupted cache files
  const cacheDirs = ['Cache', 'GPUCache', 'DawnCache', 'Code Cache'];
  for (const cacheDir of cacheDirs) {
    const cachePath = path.join(folderPath, cacheDir);
    if (fs.existsSync(cachePath)) {
      try {
        const cacheFiles = findFiles(cachePath, /.*/);
        const emptyFiles = cacheFiles.filter(file => {
          try {
            return fs.statSync(file).size === 0;
          } catch {
            return false;
          }
        });
        if (emptyFiles.length > 0) {
          bugs.push({
            type: 'corrupted_cache',
            file: `${cacheDir}/`,
            content: `Found ${emptyFiles.length} empty cache file(s) in ${cacheDir}`
          });
        }
      } catch (error) {
        // Could not analyze cache
      }
    }
  }
  
  // Check Local Storage for issues
  const localStoragePath = path.join(folderPath, 'Local Storage', 'leveldb');
  if (fs.existsSync(localStoragePath)) {
    try {
      const lockFile = path.join(localStoragePath, 'LOCK');
      if (fs.existsSync(lockFile)) {
        const lockStats = fs.statSync(lockFile);
        // Lock files should be 0 bytes or very small
        if (lockStats.size > 100) {
          bugs.push({
            type: 'stale_lock_file',
            file: 'Local Storage/leveldb/LOCK',
            content: `Lock file is unusually large (${lockStats.size} bytes) - may indicate stale lock`
          });
        }
      }
    } catch (error) {
      // Could not check lock file
    }
  }
  
  return bugs;
}

function findFiles(dir, pattern) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findFiles(fullPath, pattern));
      } else if (pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Could not read directory
  }
  
  return files;
}

if (require.main === module) {
  analyzeTestData();
}

module.exports = { analyzeTestData };
