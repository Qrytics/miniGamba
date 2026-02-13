/**
 * Cleanup script for test data directories
 * Run this to clean up worker-specific test databases
 * JavaScript version - no compilation needed
 * 
 * NOTE: This script will ANALYZE test data for bugs BEFORE cleaning up
 */

const fs = require('fs');
const path = require('path');

// Analyze test data folder for bugs before cleanup
function analyzeFolder(folderPath, folderName) {
  const issues = [];
  
  // Check database files
  const dbFiles = findFiles(folderPath, /\.db$/);
  for (const dbFile of dbFiles) {
    try {
      const stats = fs.statSync(dbFile);
      if (stats.size === 0) {
        issues.push({
          type: 'empty_database',
          file: path.basename(dbFile),
          message: 'Database file is empty (0 bytes) - may indicate initialization failure'
        });
      } else if (stats.size < 1024) {
        issues.push({
          type: 'small_database',
          file: path.basename(dbFile),
          message: `Database file is unusually small (${stats.size} bytes) - may be corrupted`
        });
      }
      
      // Check SQLite header
      try {
        const fd = fs.openSync(dbFile, 'r');
        const buffer = Buffer.alloc(16);
        fs.readSync(fd, buffer, 0, 16, 0);
        fs.closeSync(fd);
        const header = buffer.toString('utf8', 0, 16);
        if (!header.startsWith('SQLite format')) {
          issues.push({
            type: 'invalid_database_format',
            file: path.basename(dbFile),
            message: 'Database file does not appear to be a valid SQLite database'
          });
        }
      } catch (headerError) {
        // Could not check header
      }
    } catch (error) {
      issues.push({
        type: 'database_error',
        file: path.basename(dbFile),
        message: `Could not read database: ${error.message}`
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
        issues.push({
          type: 'error_log',
          file: path.basename(logFile),
          message: `Found ${errorLines.length} error line(s)`,
          sample: errorLines.slice(0, 5).join('\n')
        });
      }
    } catch (error) {
      // Could not read log
    }
  }
  
  // Check for corrupted cache
  const cacheDirs = ['Cache', 'GPUCache', 'DawnCache'];
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
        if (emptyFiles.length > 10) {
          issues.push({
            type: 'corrupted_cache',
            file: `${cacheDir}/`,
            message: `Found ${emptyFiles.length} empty cache files - may indicate cache corruption`
          });
        }
      } catch (error) {
        // Could not analyze cache
      }
    }
  }
  
  return issues;
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

// Clean up test data directories
function cleanup() {
  console.log('🔍 Analyzing test data before cleanup...\n');
  
  const allIssues = [];
  // Check new location first (test-data/worker-*)
  const testDataDir = path.join(__dirname, '..', 'test-data');
  let cleaned = 0;
  
  // Analyze and clean up new location (test-data/worker-*)
  if (fs.existsSync(testDataDir)) {
    const entries = fs.readdirSync(testDataDir);
    const pattern = /^worker-/;
    
    for (const entry of entries) {
      if (pattern.test(entry)) {
        const fullPath = path.join(testDataDir, entry);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            // ANALYZE BEFORE CLEANUP
            console.log(`  Analyzing: test-data/${entry}...`);
            const issues = analyzeFolder(fullPath, entry);
            if (issues.length > 0) {
              allIssues.push({ folder: `test-data/${entry}`, issues });
              console.log(`    ⚠️  Found ${issues.length} issue(s)`);
            }
            
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log(`✓ Cleaned up: test-data/${entry}`);
            cleaned++;
          }
        } catch (error) {
          console.warn(`⚠ Could not clean up test-data/${entry}:`, error.message);
        }
      }
    }
    
    // Remove test-data directory if empty
    try {
      const remaining = fs.readdirSync(testDataDir);
      if (remaining.length === 0) {
        fs.rmdirSync(testDataDir);
        console.log('✓ Removed empty test-data directory');
      }
    } catch (error) {
      // Ignore if directory not empty or can't be removed
    }
  }
  
  // Analyze and clean up old location (test-data-worker-* in root) for backwards compatibility
  const baseDir = path.join(__dirname, '..');
  const oldPattern = /^test-data-worker-/;
  
  if (fs.existsSync(baseDir)) {
    const entries = fs.readdirSync(baseDir);
    
    for (const entry of entries) {
      if (oldPattern.test(entry)) {
        const fullPath = path.join(baseDir, entry);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            // ANALYZE BEFORE CLEANUP
            console.log(`  Analyzing: ${entry}...`);
            const issues = analyzeFolder(fullPath, entry);
            if (issues.length > 0) {
              allIssues.push({ folder: entry, issues });
              console.log(`    ⚠️  Found ${issues.length} issue(s)`);
            }
            
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log(`✓ Cleaned up (old location): ${entry}`);
            cleaned++;
          }
        } catch (error) {
          console.warn(`⚠ Could not clean up ${entry}:`, error.message);
        }
      }
    }
  }
  
  // Generate bug report if issues found
  if (allIssues.length > 0) {
    const bugReportsDir = path.join(__dirname, 'bug-reports');
    if (!fs.existsSync(bugReportsDir)) {
      fs.mkdirSync(bugReportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(bugReportsDir, `test-data-bugs-${timestamp}.md`);
    
    let report = `# Test Data Bug Analysis - ${new Date().toLocaleString()}\n\n`;
    report += `Generated during cleanup: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- **Folders Analyzed**: ${cleaned}\n`;
    report += `- **Folders with Issues**: ${allIssues.length}\n`;
    report += `- **Total Issues**: ${allIssues.reduce((sum, f) => sum + f.issues.length, 0)}\n\n`;
    report += `---\n\n`;
    
    allIssues.forEach((folderData, i) => {
      report += `## ${i + 1}. ${folderData.folder}\n\n`;
      folderData.issues.forEach((issue, j) => {
        report += `### Issue ${j + 1}: ${issue.type}\n\n`;
        report += `**File**: \`${issue.file}\`\n\n`;
        report += `**Message**: ${issue.message}\n\n`;
        if (issue.sample) {
          report += `**Sample**:\n\`\`\`\n${issue.sample}\n\`\`\`\n\n`;
        }
        report += `---\n\n`;
      });
    });
    
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Bug report saved: ${path.relative(baseDir, reportPath)}`);
  }
  
  if (cleaned === 0) {
    console.log('\nNo test data directories found to clean.');
  } else {
    console.log(`\n✅ Cleaned up ${cleaned} test data directory/directories.`);
    if (allIssues.length > 0) {
      console.log(`⚠️  Found issues in ${allIssues.length} folder(s) - see bug report above.`);
    }
  }
}

if (require.main === module) {
  cleanup();
}

module.exports = { cleanup };
