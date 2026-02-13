# Bug Reports Location

## Where to Find Bug Reports

After running tests, bug reports are generated in:

**📁 `tests/bug-reports/`**

This directory contains:

1. **`bug-report-*.md`** - Human-readable Markdown report with screenshots
2. **`bug-report-*.json`** - Machine-readable JSON report  
3. **`summary-*.txt`** - Quick summary text file

## How to Generate Reports

### Option 1: After Running Tests
```bash
npm run test:e2e
npm run test:bugs
```

### Option 2: From Existing Test Results
If you've already run tests, just generate reports:
```bash
npm run test:bugs
```

This will scan `test-results/` and `tests/reports/` directories and create comprehensive bug reports.

## What to Share with AI Assistant

When asking for help fixing bugs, share:

1. **The Markdown report** (`bug-report-*.md`) - This is the most useful
2. **Or the JSON report** (`bug-report-*.json`) - If you prefer structured data
3. **Or just paste the summary** from the console output

The reports include:
- ✅ Test names and descriptions
- ❌ Error messages and stack traces
- 📸 Screenshots of failures
- 🔍 Console errors
- 📊 Performance metrics
- 🌍 Environment information

## Quick Check

To see if you have any bug reports:
```bash
ls tests/bug-reports/
```

Or on Windows:
```powershell
Get-ChildItem tests\bug-reports\
```
