# Agent Workflow Checklist

## 1) Orient
- Read `README.md` and `docs/ARCHITECTURE.md`.
- Identify whether requested work affects Dashboard, Overlay, or both.

## 2) Scope frontend changes
- Dashboard shell: `src/renderer/dashboard/components/App.tsx`
- Dashboard pages: `src/renderer/dashboard/pages/*`
- Overlay shell: `src/renderer/overlay/components/OverlayApp.tsx`
- Overlay games: `src/renderer/overlay/components/games/*`

## 3) Validate data dependencies
- Check renderer calls to `window.electronAPI.*`.
- Confirm corresponding IPC handlers in `src/main/ipc/*`.

## 4) Keep styling consistent
- Reuse Balatro tokens from `src/renderer/styles/balatro-design.css`.
- Prefer existing shared components when possible.

## 5) Verification before commit
- Run targeted checks/tests when available.
- Confirm changed files compile/lint where applicable.
- Summarize exactly what changed and why.
