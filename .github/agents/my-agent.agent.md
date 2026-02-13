# 🎰 miniGamba — Copilot Agent Instructions

You are an expert developer working on **miniGamba**, a lightweight desktop overlay companion app built with **Electron**, **TypeScript**, and **React**. The app runs alongside games and other desktop activities, providing a suite of fake-credit mini-casino games, idle progression, and social leaderboard features. **No real money is ever involved.**

---

## Project Overview

miniGamba is a two-window Electron application:

1. **Dashboard Window** — A normal desktop window for settings, leaderboard, customization, achievements, coin wallet, stats, and game history.
2. **Overlay Window** — A small, always-on-top, transparent overlay that floats over other applications where users play mini-games (slots, blackjack, coin flip, etc.).

The app uses fake credits (coins) exclusively. Core philosophy: **no real money, no ads, no data harvesting, lightweight, fun first.**

---

## Tech Stack

- **Runtime:** Electron (multi-process: main + renderer)
- **Language:** TypeScript (strict mode, throughout the entire codebase)
- **Frontend:** React (renderer process)
- **Styling:** CSS (custom, per-window stylesheets)
- **Database:** SQLite (planned, via abstraction layer)
- **IPC:** Electron IPC with context isolation and preload scripts
- **Linting:** ESLint
- **Formatting:** Prettier (single quotes, trailing commas, 100 char print width, 2-space indent)
- **Package Manager:** npm

---

## Project Architecture

```
miniGamba/
├── src/
│   ├── main/              # Electron main process (backend)
│   │   ├── index.ts       # App entry point, window lifecycle
│   │   ├── windows/       # Window controllers (dashboard, overlay)
│   │   ├── services/      # Backend services
│   │   │   ├── data/      # Database, user data, game history
│   │   │   ├── games/     # Game engine classes (all 10 games)
│   │   │   ├── game-detection/  # Process monitoring, game detection
│   │   │   ├── activity-tracking/ # Video/idle/passive earning tracking
│   │   │   └── leaderboard/     # P2P sync, friend codes
│   │   ├── ipc/           # IPC handlers (game, settings, data channels)
│   │   └── utils/         # Logger, hotkeys, crypto utilities
│   ├── renderer/          # Electron renderer process (frontend)
│   │   ├── dashboard/     # Dashboard window UI (React app, HTML, CSS)
│   │   └── overlay/       # Overlay window UI (React app, HTML, CSS)
│   ├── shared/            # Code shared between main & renderer
│   │   ├── types/         # TypeScript interfaces (game, user, achievement, settings)
│   │   ├── constants/     # Game configs, achievement definitions, cosmetics
│   │   └── utils/         # Validation, calculations
│   └── preload/           # Preload scripts for secure IPC bridge
├── assets/                # Static assets (images, sounds, fonts)
├── docs/                  # Documentation (SETUP.md, ARCHITECTURE.md)
├── tests/                 # Test files
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
├── productReqDoc.md       # Full product requirements document
├── PROJECT_SUMMARY.md     # Project setup status & next steps
└── README.md              # Project overview & feature spec
```

### Key Architectural Patterns

- **Electron multi-process**: Main process handles business logic, data, and services. Renderer process handles UI via React. Communication is through IPC with preload scripts.
- **Context isolation**: `nodeIntegration: false`, `contextIsolation: true`. All main↔renderer communication goes through preload-exposed APIs.
- **Abstract game engine**: All 10 mini-games extend a base `GameEngine` class with a consistent betting interface, state management, payout calculation, and win/loss tracking.
- **Service layer**: Backend services are organized by domain (data, games, game-detection, activity-tracking, leaderboard).
- **Shared types**: All TypeScript interfaces and constants live in `src/shared/` and are imported by both main and renderer processes.

---

## Mini-Games (10 Total)

Each game is a class in `src/main/services/games/` extending the base `GameEngine`:

1. **Slot Machine** — 3-reel spinner with themed reels, hold & respin feature
2. **Blackjack (Mini)** — Single-hand vs dealer, double down feature
3. **Coin Flip** — Heads/tails, martingale mode toggle
4. **Higher or Lower** — Card streak game with cash-out mechanic
5. **Mine Sweeper** — 5x5 crash-style grid, configurable mine count, lucky reveal
6. **Scratch Cards** — Tiered cards (Bronze/Silver/Gold/Diamond), cosmetic drops
7. **Wheel of Fortune** — Prize wheel with daily free spin, loaded wheel feature
8. **Mini Derby** — 4-racer betting with exacta bet option
9. **Dice Roll** — Two-dice guessing with loaded dice power-up
10. **Mini Poker (3-Card)** — 3-card poker vs dealer with peek feature

### Game Implementation Rules
- All games use **fake coins only** — never reference real money
- Games should be playable in **5–15 seconds**
- Each game must track: bet amount, result (win/loss), payout, timestamp
- Payout calculations must be mathematically sound and match the odds defined in the README
- Games unlock progressively via the player level system (Level 1–20)

---

## Coin Economy

The coin system has multiple earning vectors — not just gambling:

- **In-game earning**: Detect supported games, reward kills/assists/wins/objectives
- **Passive earning**: Activity detection (video watching, music, active window time, typing challenges)
- **Daily tasks/missions**: Rotating objectives with daily chest rewards
- **Hourly bonus**: Claimable every hour, stacks up to 3 hours
- **Coin milestones**: One-time bonuses at 1K/10K/100K/1M lifetime coins
- **Investments**: Idle mechanic with Safe/Moderate/Risky tiers and real-time returns

When implementing coin economy features, ensure:
- All coin amounts are integers (no fractional coins)
- Daily caps exist on passive earning to prevent AFK farming
- Investment returns are calculated based on real elapsed time
- Bankruptcy (0 coins) is a valid state — the player can recover via free spins and hourly bonuses

---

## Progression System

- **Player Level** (1–50): XP from games, daily tasks, achievements. Unlocks games and cosmetics at specific levels.
- **Prestige** (available at Level 30+): Resets level but keeps cosmetics/achievements. Grants +5% passive earn rate per prestige. Max prestige: 10.
- **Achievements**: 60+ achievements across categories (Gambling, Economy, Activity, Social, Customization, Secret). Each awards Achievement Points (AP).

---

## Leaderboard & Social

- **No accounts, no servers** — P2P via shareable friend codes (format: `GAMBA-XXXX-XXXX`)
- Stats sync via lightweight P2P, shared JSON, or LAN auto-discovery
- Categories: Total Coins, Current Balance, Biggest Win, Biggest Loss Streak, Achievement Score, Games Played, Game-Specific
- Social features: friend activity feed, emoji reactions, challenges, shame board

---

## Coding Standards

### TypeScript
- Use strict TypeScript throughout — no `any` types unless absolutely unavoidable (and document why)
- Define all interfaces in `src/shared/types/`
- Use enums for game types, achievement IDs, and settings keys
- Prefer `const` over `let`; never use `var`
- Use async/await over raw Promises
- All functions must have JSDoc comments with `@param` and `@returns` descriptions

### Formatting (Prettier)
- Single quotes
- Trailing commas (ES5)
- Print width: 100 characters
- Tab width: 2 spaces
- Semicolons: always

### Naming Conventions
- **Files**: kebab-case (`game-engine.ts`, `slot-machine.ts`, `data-handlers.ts`)
- **Classes**: PascalCase (`GameEngine`, `SlotMachine`, `DatabaseService`)
- **Functions/methods**: camelCase (`calculatePayout`, `startGameDetection`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_BET_AMOUNT`, `DEFAULT_STARTING_COINS`)
- **Interfaces/Types**: PascalCase prefixed with context (`GameResult`, `UserProfile`, `AchievementConfig`)
- **IPC channels**: kebab-case strings (`'game:play-slot'`, `'settings:get-all'`, `'data:save-history'`)

### Code Organization
- One class per file
- Group imports: Node built-ins → Electron → third-party → local (with blank lines between groups)
- Keep game logic completely separate from UI — games are pure TypeScript classes in the main process
- All IPC handlers go in `src/main/ipc/`, grouped by domain (game, settings, data)
- Validation utilities live in `src/shared/utils/` and are used by both main and renderer

### Error Handling
- Never let errors crash the app silently — log all errors via the logger utility (`src/main/utils/logger.ts`)
- Game errors should gracefully return to a safe state (refund the bet if a game crashes mid-play)
- Database errors should be caught and surfaced to the user via IPC
- Use try/catch around all async operations

### Security
- Context isolation is mandatory — never disable it
- All renderer↔main communication must go through preload scripts
- Validate all user inputs (bet amounts, settings values) in both the renderer AND the main process
- Use the crypto utility for generating friend codes and any randomness-sensitive operations
- Never expose Node.js APIs directly to the renderer

---

## Working with TODO Comments

The codebase is full of `// TODO:` comments marking where implementation is needed. When implementing a feature:

1. Search for related `// TODO:` markers across all relevant files
2. Implement the full feature, removing the TODO comment when done
3. Ensure the implementation connects all the layers: game logic → IPC handler → preload bridge → React UI
4. Add or update corresponding TypeScript types in `src/shared/types/`
5. Add JSDoc documentation to all new code

---

## Implementation Phases (Priority Order)

When asked to implement features, follow this priority:

### Phase 1 — Core (Highest Priority)
- SQLite database setup and user data persistence
- Basic UI layouts for dashboard and overlay
- Wire up IPC handlers to services
- Implement at least 2 games end-to-end (Slot Machine + Coin Flip)

### Phase 2 — Game Development
- Implement remaining 8 game UIs and connect to game engines
- Add animations and sound effect hooks
- Test and balance payout odds

### Phase 3 — Feature Systems
- Game detection (process monitoring)
- Activity tracking (passive earning)
- Achievement checking system
- Leaderboard P2P networking

### Phase 4 — Polish
- Themes and cosmetics system
- Settings UI
- Statistics dashboard with graphs
- Full achievements UI

### Phase 5 — Release
- Testing and QA
- Performance optimization (ensure overlay doesn't impact game FPS)
- Build installers (Windows, macOS, Linux)
- User-facing documentation

---

## Key Reference Documents

When you need more context, refer to these files in the repo:

- **`README.md`** — Complete feature spec including all 10 game rules, coin economy details, achievement tables, progression system, and customization options
- **`productReqDoc.md`** — Full product requirements document with 17 sections covering every aspect of the app in detail
- **`PROJECT_SUMMARY.md`** — Current project status, what's been set up, and detailed next steps
- **`docs/ARCHITECTURE.md`** — Technical architecture overview (system design, component hierarchy, data flow, IPC, state management)
- **`docs/SETUP.md`** — Development environment setup instructions

---

## Common Tasks & How to Approach Them

### Adding a new mini-game
1. Create the game class in `src/main/services/games/` extending `GameEngine`
2. Define types in `src/shared/types/game.ts`
3. Add game constants/config in `src/shared/constants/games.ts`
4. Create IPC handlers in `src/main/ipc/game-handlers.ts`
5. Expose via preload script in `src/preload/`
6. Build React UI component in `src/renderer/overlay/`
7. Add achievement hooks for the new game

### Adding a new achievement
1. Define the achievement in `src/shared/constants/achievements.ts`
2. Add the check logic in `src/main/services/data/achievements.ts`
3. Hook the check into the relevant game or service events
4. Update the achievements UI component

### Adding a new setting
1. Add the setting type to `src/shared/types/settings.ts`
2. Add default value in constants
3. Create/update IPC handler in `src/main/ipc/settings-handlers.ts`
4. Expose through preload
5. Add UI control in dashboard settings component

### Modifying coin economy
1. Update relevant constants in `src/shared/constants/`
2. Modify the calculation logic in the appropriate service
3. Ensure the change is reflected in game history tracking
4. Test for edge cases: 0 coins, max bet, overflow

---

## Testing Guidelines

- Write unit tests for all game engine classes (pure logic, no Electron dependencies)
- Test payout calculations with known inputs/outputs
- Test edge cases: 0 coin balance, max bet, negative values, rapid successive plays
- Test IPC handlers with mocked Electron APIs
- Performance test the overlay to ensure it doesn't drop frames

---

## Things to NEVER Do

- ❌ Never introduce real-money transactions or references to real gambling
- ❌ Never disable context isolation or enable node integration in renderer
- ❌ Never use `any` type without documenting the reason
- ❌ Never store sensitive data unencrypted
- ❌ Never let the overlay block or interfere with the user's primary application
- ❌ Never make network requests without user consent (all data is local-first)
- ❌ Never break the existing game engine inheritance pattern — all games extend `GameEngine`
