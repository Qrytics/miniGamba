# Testing Pipeline Setup Guide

This guide explains how to set up and run automated testing for the miniGamba Electron app.

## Quick Start

### 1. Install Dependencies

```bash
npm install --save-dev @playwright/test playwright
npx playwright install
```

### 2. Build the App First

Before running tests, make sure the app builds:

```bash
npm run dev
# Wait for it to build, then stop it (Ctrl+C)
```

### 3. Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with one worker (easy to stop with Ctrl+C)
npm run test:e2e:single

# Run tests with interactive UI
npm run test:e2e:ui

# Run tests and view HTML report
npm run test:e2e:report
```

### 4. Stopping Tests

- In the terminal where tests are running, press **Ctrl+C** once to stop Playwright and exit.
- If it does not stop, press **Ctrl+C** again.
- Using `npm run test:e2e:single` (one worker) makes stopping faster.

## Analyzing Bugs (test:analyze)

After running E2E tests, run:

```bash
npm run test:analyze
```

This:

1. **E2E failures** – Reads `tests/reports/results.json` and `tests/test-results/` (error-context.md, screenshots) and includes every failed test.
2. **Test data issues** – Scans `test-data/worker-*` for empty/invalid DBs, error logs, cache issues.

A single report is written to `tests/bug-reports/` with all issues. See `tests/README.md` for details.

## How It Works

1. **Playwright** launches the Electron app and drives the UI.
2. **Tests** interact with the UI (buttons, text, etc.). The UI uses **pixel-style icons** instead of emojis; tests should target visible text (e.g. "Coin Flip", "Heads", "CASH OUT") or `data-testid` where added.
3. **Screenshots** are captured on failure.
4. **Bug reports** are generated under `tests/bug-reports/` (Markdown + JSON). `npm run test:analyze` produces a combined analysis report there as well.

## Viewing Results

### HTML Report (Recommended)
```bash
npx playwright show-report tests/reports
```

### Bug Reports and Analysis
Check `tests/bug-reports/` for:
- `test-data-analysis-*.md` – Combined E2E + test-data analysis (from `npm run test:analyze`)
- `bug-report-*.md` / `bug-report-*.json` – From `npm run test:bugs` (Playwright failures)

### Screenshots
Screenshots for failures are under `tests/test-results/` and may be copied into `tests/bug-reports/` by the analyzer.

## Adding New Tests

1. Create a new test file in `tests/` (e.g., `tests/overlay.test.ts`)
2. Use the helpers from `tests/setup.ts`:
   ```typescript
   import { launchApp, takeScreenshot, waitForElement } from './setup';
   ```
3. Run your new test:
   ```bash
   npx playwright test tests/overlay.test.ts
   ```

## For AI Assistant Testing

When you want me to test the app:

1. Run: `npm run test:e2e:report`
2. Share the bug report files from `tests/bug-reports/`
3. I'll analyze them and suggest fixes

Or simply run tests and share any console output/errors you see!
