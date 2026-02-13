# miniGamba - Renderer Processes

This directory contains the renderer process code (UI) for miniGamba.

## Structure

```
renderer/
├── dashboard/           # Dashboard window
│   ├── index.html      # HTML entry point
│   ├── index.ts        # TypeScript entry point
│   ├── components/     # React components
│   ├── styles/         # CSS styles
│   ├── hooks/          # Custom React hooks
│   └── state/          # State management
└── overlay/            # Overlay window
    ├── index.html      # HTML entry point
    ├── index.ts        # TypeScript entry point
    ├── components/     # React components
    ├── game-logic/     # Game logic (separate from UI)
    ├── styles/         # CSS styles
    ├── hooks/          # Custom React hooks
    └── state/          # State management
```

## Dashboard

The dashboard is the main application window where users:
- Manage their account
- View statistics and leaderboards
- Customize settings
- View achievements
- Access all features

## Overlay

The overlay is an always-on-top window where users:
- Play mini-games
- See coin balance
- Quick access to games during other activities

## Game Logic

Game logic is separated from UI components for:
- Better testing
- Code reusability
- Cleaner separation of concerns

Each game extends the `GameEngine` base class which provides:
- Common betting logic
- Win/loss tracking
- Payout calculation
- State management

## TODO
- Implement React components for all pages
- Set up state management (Redux/Zustand)
- Create game UI components
- Add animations and transitions
- Implement routing for dashboard
- Create custom hooks for data fetching
