# Parallel Testing Setup

This document explains how parallel testing works with multiple workers.

## How It Works

### Worker Isolation
- Each Playwright worker runs in a separate Node.js process
- Each worker gets its own isolated Electron instance
- Each worker uses a separate database file to prevent conflicts

### Database Isolation
- Test databases are stored in `test-data-worker-{workerId}/` directories
- Each worker uses: `minigamba-worker-{workerId}.db`
- Worker ID is based on process PID (unique per worker process)

### Configuration
- **Workers**: Automatically set to 50% of CPU cores (capped at 4)
- **CI**: Uses 2 workers
- **Local**: Uses 2-4 workers depending on CPU count

## Running Tests

```bash
# Run with default workers (auto-detected)
npm run test:e2e

# Run with specific number of workers
npm run test:e2e:workers

# Or use Playwright directly
npx playwright test --workers=4
```

## Cleanup

After running tests, you can clean up test data directories:

```bash
npm run test:cleanup
```

Or manually delete `test-data-worker-*/` directories.

## Troubleshooting

### Spawn EPERM Errors
If you still get spawn errors:
1. Check Windows Defender/Antivirus isn't blocking Node.js
2. Try reducing workers: `npx playwright test --workers=1`
3. Run as administrator (if needed)

### Database Lock Errors
- Each worker has its own database, so locks shouldn't occur
- If you see lock errors, check that cleanup ran properly

## Performance

With 4 workers on a 8-core machine:
- **Before**: ~40 tests × 5s each = ~200s (sequential)
- **After**: ~40 tests ÷ 4 workers × 5s = ~50s (parallel)
- **Speedup**: ~4x faster!
