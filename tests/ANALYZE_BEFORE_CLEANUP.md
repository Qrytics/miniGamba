# Test Data Analysis - Important!

## What Happened

The test data folders were deleted before analysis. Going forward, the cleanup script will **analyze before deleting**.

## How It Works Now

### Automatic Analysis During Cleanup
When you run `npm run test:cleanup`, it will:
1. ✅ **Analyze** each test-data folder for bugs
2. ✅ **Generate a bug report** if issues are found
3. ✅ **Then** clean up the folders

### Manual Analysis
You can also analyze test data without cleaning:
```bash
npm run test:analyze
```

## What Gets Analyzed

The analysis checks for:
- **Empty database files** (0 bytes)
- **Unusually small databases** (< 1KB)
- **Database read errors**
- **Error logs** (files containing "error", "fail", "exception", "crash")
- **Corrupted files**

## Bug Reports

Bug reports are saved to:
- `tests/bug-reports/test-data-bugs-{timestamp}.md` (during cleanup)
- `tests/bug-reports/test-data-analysis-{timestamp}.md` (manual analysis)

## Next Steps

1. **Run tests** to generate new test data:
   ```bash
   npm run test:e2e
   ```

2. **Analyze the test data** (without cleaning):
   ```bash
   npm run test:analyze
   ```

3. **Or let cleanup analyze automatically**:
   ```bash
   npm run test:cleanup
   ```

## Recovery

Unfortunately, the deleted folders cannot be recovered from here. However:
- Future test runs will generate new test data
- The analysis will happen automatically before cleanup
- Bug reports will be preserved even after cleanup
