# miniGamba - Documentation

This directory contains project documentation. All docs are in **Markdown**; there are no PDFs in the repo.

## Documentation Index

See **[DOCUMENTATION.md](DOCUMENTATION.md)** for the full list of documentation files and how to **generate PDFs** from Markdown (Pandoc, VS Code, or browser Print to PDF).

## Docs in This Folder

| File | Description |
|------|-------------|
| [SETUP.md](SETUP.md) | Install, run, build, test, E2E, analyze |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, main/renderer/shared, IPC, stack |
| [DOCUMENTATION.md](DOCUMENTATION.md) | Index of all docs + PDF generation |
| [README.md](README.md) | This file |

## Root-Level Docs

- **README.md** – Project overview, games, economy, features
- **IMPLEMENTATION_STATUS.md** – What’s done (backend, games, UI, build)
- **TESTING_GUIDE.md** – E2E, test:analyze, stopping tests
- **tests/README.md** – Testing pipeline, analyze, single-worker run

## Currently Implemented

- Core: SQLite, user data, settings, game history, achievements, daily tasks, hourly bonus, investments
- All 10 games with UI and logic
- Dashboard and overlay with Balatro-inspired UI, angular/edged panels, pixel-style icons
- E2E tests; `npm run test:analyze` for E2E + test-data bugs
