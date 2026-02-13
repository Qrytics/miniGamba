/**
 * Cleanup script for test data directories
 * Run this to clean up worker-specific test databases
 * JavaScript version - no compilation needed
 */

const fs = require('fs');
const path = require('path');

// Clean up test data directories
function cleanup() {
  const baseDir = path.join(__dirname, '..');
  const pattern = /^test-data-worker-/;
  
  if (!fs.existsSync(baseDir)) {
    console.log('Base directory does not exist.');
    return;
  }
  
  const entries = fs.readdirSync(baseDir);
  let cleaned = 0;
  
  for (const entry of entries) {
    if (pattern.test(entry)) {
      const fullPath = path.join(baseDir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`✓ Cleaned up: ${entry}`);
          cleaned++;
        }
      } catch (error) {
        console.warn(`⚠ Could not clean up ${entry}:`, error.message);
      }
    }
  }
  
  if (cleaned === 0) {
    console.log('No test data directories found to clean.');
  } else {
    console.log(`\n✅ Cleaned up ${cleaned} test data directory/directories.`);
  }
}

if (require.main === module) {
  cleanup();
}

module.exports = { cleanup };
