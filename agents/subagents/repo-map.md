# miniGamba Repo Map (Agent Quick Reference)

## Top-level
- `src/main/` — Electron main process, windows, IPC handlers, backend services.
- `src/preload/` — secure renderer ↔ main API bridge.
- `src/renderer/` — frontend UI code (Dashboard + Overlay + shared renderer components).
- `src/shared/` — shared constants, types, and utilities.
- `docs/` — architecture/setup/project documentation.
- `tests/` — Playwright and related test utilities.

## Frontend surfaces
- `src/renderer/dashboard/components/App.tsx` — dashboard shell and routing-by-state.
- `src/renderer/dashboard/pages/` — all dashboard pages.
- `src/renderer/dashboard/styles/` — dashboard styling.
- `src/renderer/overlay/components/OverlayApp.tsx` — overlay shell/tabs/game selection.
- `src/renderer/overlay/components/games/` — game UIs.
- `src/renderer/overlay/components/lol/` — compact live LoL panel.
- `src/renderer/overlay/styles/` — overlay styling.

## Design system references
- `src/renderer/styles/balatro-design.css` — shared design tokens.
- `src/renderer/components/PixelIcon.tsx` — shared icon component.

## Backend data/services references
- `src/main/services/data/` — user data, database, achievements, history.
- `src/main/services/games/` — hourly bonus, daily tasks, investments.
- `src/main/services/lol/` — LCU/live client integrations.
- `src/main/ipc/` — renderer-exposed handler surface.
