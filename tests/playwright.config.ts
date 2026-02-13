/**
 * Playwright Configuration for Electron Testing
 */

import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as os from 'os';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // Enable parallel execution with proper isolation
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Use multiple workers but with proper isolation
  // Use 50% of CPU cores, but cap at 4 to avoid overwhelming the system
  workers: process.env.CI ? 2 : Math.min(4, Math.max(2, Math.floor(os.cpus().length * 0.5))),
  reporter: [
    ['html', { outputFolder: 'tests/reports' }],
    ['json', { outputFile: 'tests/reports/results.json' }],
    ['list'],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'electron',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  outputDir: 'tests/test-results',
  // Global setup/teardown for cleanup
  globalSetup: undefined,
  globalTeardown: undefined,
});
