# Testing Pipeline for miniGamba

This testing setup allows automated testing of the Electron app with bug reporting capabilities.

## Setup

1. Install dependencies:
```bash
npm install --save-dev @playwright/test playwright
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests:
```bash
npm run test:e2e
```

### Run tests with one worker (easy to stop; use when debugging):
```bash
npm run test:e2e:single
```

### Stopping tests
- **Stop immediately:** In the terminal where tests are running, press **Ctrl+C** once. Playwright will shut down workers and exit.
- **If it doesn’t stop:** Press **Ctrl+C** again to force exit.
- **To avoid waiting on many workers:** Use `npm run test:e2e:single` so only one worker runs; one Ctrl+C then stops the whole run.

### Run specific test file:
```bash
npx playwright test tests/dashboard.test.ts
```

### Run tests with UI mode (interactive):
```bash
npx playwright test --ui
```

### Run tests and generate report:
```bash
npm run test:e2e:report
```

## Test Structure

- `setup.ts` - Test utilities and helpers
- `dashboard.test.ts` - Dashboard window tests
- `games.test.ts` - Games functionality tests
- `bug-report.ts` - Bug reporting utilities
- `playwright.config.ts` - Playwright configuration

## Screenshots

Screenshots are automatically saved to `tests/screenshots/` when tests run.

## Bug Reports

Bug reports are generated in `tests/bug-reports/` in both Markdown and JSON formats.

## Analyzing Bugs (test:analyze)

`npm run test:analyze` scans **all** observed sources for issues and writes a single report to `tests/bug-reports/`:

1. **E2E test failures** – Reads `tests/reports/results.json` (Playwright JSON reporter) and any `error-context.md` (and screenshots) under `tests/test-results/`, so every failed test is included.
2. **Test data issues** – Scans `test-data/worker-*` (and root `test-data-worker-*`) for empty/small/invalid DBs, error logs, corrupted cache, and stale locks.

Run after tests to get one combined report:

```bash
npm run test:e2e
npm run test:analyze
```

## Viewing Results

After running tests, open the HTML report:
```bash
npx playwright show-report tests/reports
```
