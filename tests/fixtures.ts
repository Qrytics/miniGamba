/**
 * Playwright fixtures for Electron tests
 * Provides worker-aware test context
 */

import { test as base } from '@playwright/test';
import { launchApp, TestContext, cleanupTestData } from './setup';

// Extend base test with Electron app fixture
export const test = base.extend<{ testContext: TestContext }>({
  testContext: async ({ }, use, testInfo) => {
    // Use worker index for isolation
    const workerIndex = testInfo.workerIndex;
    const context = await launchApp(workerIndex);
    
    // Use the context
    await use(context);
    
    // Cleanup after test
    await context.app.close();
  },
});

export { expect } from '@playwright/test';
