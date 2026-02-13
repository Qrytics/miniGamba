# miniGamba - Main Process

This directory contains the main Electron process code for miniGamba.

## Structure

```
main/
├── index.ts              # Main entry point
├── windows/              # Window management
│   ├── dashboard.ts      # Dashboard window controller
│   └── overlay.ts        # Overlay window controller
├── services/             # Backend services
│   ├── data/            # Data management
│   ├── game-detection/  # Game detection system
│   ├── activity-tracking/ # Activity tracking
│   └── leaderboard/     # Leaderboard (TODO)
├── ipc/                 # IPC handlers
│   ├── game-handlers.ts
│   ├── settings-handlers.ts
│   └── data-handlers.ts
└── utils/               # Utility functions
```

## Responsibilities

The main process handles:
- Native OS integration
- Window creation and management
- System-level operations (file system, process monitoring)
- Database operations
- Background services
- IPC communication with renderer processes

## Key Components

### Windows
- **Dashboard**: Main application window for management
- **Overlay**: Always-on-top gaming window

### Services
- **Data Management**: Database, user data, game history, achievements
- **Game Detection**: Monitors running processes to detect games
- **Activity Tracking**: Tracks video watching and idle time
- **Leaderboard**: P2P synchronization (TODO)

### IPC Handlers
Secure communication bridge between main and renderer processes for:
- Game operations
- Settings management
- Data import/export

## TODO
- Implement database connection
- Set up game detection monitoring
- Implement activity tracking
- Set up hotkey system
- Implement leaderboard P2P sync
