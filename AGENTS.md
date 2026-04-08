# AGENTS.md

## Cursor Cloud specific instructions

### Overview

miniGamba is a single Electron desktop app (no backend services, no Docker, no external databases). All data is stored locally via SQLite (`better-sqlite3`). The app has two windows: a Dashboard and an Overlay, both React-based.

### Prerequisites

- Node.js v20+ required (v18 is NOT supported due to `better-sqlite3` v12).
- `build-essential` and `python3` must be available on Linux for native module compilation.

### Key commands

All standard commands are in `package.json` scripts:

| Task | Command |
|---|---|
| Dev mode | `npm run dev` |
| Lint | `npm run lint` |
| Type check | `npm run type-check` |
| Unit tests | `npm test` |
| E2E tests | `npm run test:e2e` |

### Non-obvious notes

- The app runs on `DISPLAY :1` (Xvfb) in this environment. Electron launches correctly under Xvfb with no extra flags needed.
- `npm run dev` runs `electron-forge start`, which bundles with Webpack and launches Electron. The dashboard dev server is on `http://localhost:3000` and the webpack output on `http://localhost:9000`.
- dbus errors in the console (`Failed to connect to the bus`) are expected and harmless in the headless environment.
- GPU process errors (`Exiting GPU process due to errors during initialization`) are also expected under Xvfb — the app falls back to software rendering.
- ESLint reports pre-existing warnings/errors in the codebase (mostly `@typescript-eslint/no-explicit-any`). These are not regressions.
- `npm test` uses `--passWithNoTests` so it exits 0 even when no test files are found; there are currently no Jest unit test files.
- Playwright E2E tests require the app to not already be running (they launch their own Electron instance).
- The Overlay window is launched from the Dashboard via the "Launch Overlay" button in the Games section.
