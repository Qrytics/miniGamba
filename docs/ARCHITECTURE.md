# miniGamba - Architecture Overview

Technical architecture documentation for the miniGamba application.

## System Overview

miniGamba is built using the **Electron** framework, which allows building cross-platform desktop applications with web technologies (HTML, CSS, JavaScript/TypeScript).

### Technology Stack

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Desktop Framework:** Electron
- **Styling:** CSS with Balatro-inspired design tokens (`src/renderer/styles/balatro-design.css`); angular/edged panels (no border-radius); pixel-style icons via shared `PixelIcon` component
- **State Management:** Local React state (useState/useEffect)
- **Database:** SQLite (better-sqlite3)
- **Build Tool:** Webpack (via Electron Forge)
- **Package Manager:** npm

## Architecture Layers

### 1. Main Process (Backend)

The main process runs in Node.js and has full access to system APIs.

**Location:** `src/main/`

**Responsibilities:**
- Window management (Dashboard, Overlay)
- Database operations
- File system access
- Native OS integration
- Background services
- IPC communication hub

**Key Components:**

```
main/
├── index.ts              # Entry point
├── windows/              # Window controllers
├── services/             # Background services
│   ├── data/            # Database & user data
│   ├── game-detection/  # Process monitoring
│   ├── activity-tracking/  # Passive earning
│   └── leaderboard/     # P2P sync
├── ipc/                 # IPC handlers
└── utils/               # Utilities
```

### 2. Renderer Processes (Frontend)

Renderer processes run in Chromium and display the UI.

**Location:** `src/renderer/`

**Two Windows:**

#### Dashboard Window
- Main application interface
- Full-featured management UI
- Settings, stats, achievements, leaderboard
- React-based single-page application

#### Overlay Window
- Always-on-top gaming window
- Lightweight, transparent
- Mini-game UI
- React-based

**Key Components:**

```
renderer/
├── components/          # Shared (e.g. PixelIcon)
├── styles/             # Shared design tokens (balatro-design.css)
├── dashboard/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   └── styles/         # Dashboard CSS
└── overlay/
    ├── components/     # OverlayApp, game components
    ├── game-logic/     # Game engines (slot, blackjack, etc.)
    └── styles/         # Overlay CSS
```

### 3. Shared Layer

Code shared between main and renderer processes.

**Location:** `src/shared/`

**Contents:**
- TypeScript type definitions
- Constants
- Pure utility functions
- No Electron-specific code

### 4. Preload Scripts

Secure bridge between main and renderer processes.

**Location:** `src/preload/`

**Purpose:**
- Expose safe IPC methods to renderer
- Enforce security (context isolation)
- Type-safe API definitions

## Data Flow

### IPC Communication

```
Renderer Process
    ↓ (via preload API)
IPC Channel
    ↓
Main Process Handler
    ↓
Service Layer
    ↓
Database
```

**Example Flow: Starting a Game**

1. User clicks "Start Game" in overlay (renderer)
2. Overlay calls `electronAPI.startGame(type, bet)`
3. Preload script forwards to IPC: `ipcRenderer.invoke('game:start')`
4. Main process handler receives: `ipcMain.handle('game:start')`
5. Handler validates bet, updates database
6. Handler returns result to renderer
7. Overlay updates UI with result

## Game Architecture

### Game Engine Pattern

All games extend the `GameEngine` base class:

```typescript
abstract class GameEngine {
  abstract init(): void;
  abstract calculatePayout(): number;
  abstract getState(): any;
  abstract reset(): void;
  
  start(bet: number): void;
  end(): { result, payout };
}
```

**Benefits:**
- Consistent interface
- Shared betting logic
- Easy to test
- Reusable patterns

### Game Logic Separation

Game logic is **separate** from UI components:

```
game-logic/          # Pure TypeScript classes
  ├── base/
  │   └── GameEngine.ts
  ├── slot-machine.ts
  ├── blackjack.ts
  └── ...

components/games/    # React UI components
  ├── SlotMachine/
  │   └── SlotMachine.tsx
  ├── Blackjack/
  │   └── Blackjack.tsx
  └── ...
```

**Benefits:**
- Testable game logic
- UI can change independently
- Logic can be reused
- Clear separation of concerns

## Services Architecture

### Background Services

Services run in the main process and handle system-level tasks.

#### Data Services
- **database.ts:** Database abstraction layer
- **user-data.ts:** User state management
- **game-history.ts:** Game history tracking
- **achievements.ts:** Achievement checking

#### Detection Services
- **process-monitor.ts:** Detects running games
- **supported-games.ts:** Game definitions

#### Tracking Services
- **video-tracker.ts:** Detects video watching
- **idle-tracker.ts:** Detects idle time

#### Social Services
- **p2p-sync.ts:** P2P leaderboard sync
- **friend-codes.ts:** Friend code system

## State Management

### Dashboard State
- User data (coins, level, XP)
- Settings
- Achievements
- Leaderboard data
- Game history

### Overlay State
- Current game
- Game state
- Coins (synchronized with main)
- Overlay settings

**TODO:** Implement state management with Redux or Zustand

## Security Considerations

### Context Isolation
- Renderer processes run in isolated context
- No direct access to Node.js APIs
- All communication via IPC

### Preload Scripts
- Expose only necessary APIs
- Validate all inputs
- Type-safe interfaces

### Data Storage
- Encrypt sensitive data
- Validate JSON imports
- Backup user data

## Performance Considerations

### Overlay Performance
- Lightweight design
- Minimal DOM updates
- Efficient rendering
- Low CPU/RAM usage

### Main Process
- Async operations
- Non-blocking services
- Efficient database queries

### Build Optimization
- Code splitting
- Tree shaking
- Minification
- Asset optimization

## Future Enhancements

### Potential Additions
- Mobile companion app
- Discord integration
- Stream overlay mode
- Tournament system
- Seasonal events

### Scalability
- Plugin system for custom games
- Theme marketplace
- Community features

## Development Patterns

### File Organization
- Group by feature
- Colocation of related files
- Clear naming conventions

### Code Style
- TypeScript strict mode
- ESLint for consistency
- Prettier for formatting
- Comprehensive comments

### Testing Strategy
- Unit tests for game logic
- Integration tests for services
- E2E tests for user flows

## Build Process

### Development Build
1. TypeScript compilation (watch mode)
2. Webpack bundling (hot reload)
3. Electron launch

### Production Build
1. TypeScript compilation
2. Webpack optimization
3. Asset processing
4. Electron packaging
5. Installer creation

## Deployment

### Platforms
- Windows (primary)
- macOS (future)
- Linux (future)

### Distribution
- GitHub Releases
- Auto-update system (TODO)
- Portable versions

---

This architecture provides a solid foundation for building a performant, maintainable, and extensible desktop application.
