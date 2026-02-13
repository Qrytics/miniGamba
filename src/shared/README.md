# miniGamba - Shared Code

This directory contains code shared between main and renderer processes.

## Structure

```
shared/
├── types/              # TypeScript type definitions
│   ├── game.types.ts
│   ├── user.types.ts
│   ├── achievement.types.ts
│   └── settings.types.ts
├── constants/          # Shared constants
│   ├── games.ts
│   ├── achievements.ts
│   └── cosmetics.ts
└── utils/              # Shared utilities
    ├── validation.ts
    └── calculations.ts
```

## Types

TypeScript type definitions ensure type safety across the application:
- **game.types.ts**: Game-related types and interfaces
- **user.types.ts**: User data and settings types
- **achievement.types.ts**: Achievement types
- **settings.types.ts**: Settings configuration types

## Constants

Application-wide constants that never change:
- Game names, icons, min/max bets
- Achievement definitions
- Cosmetic item definitions

## Utils

Pure utility functions with no side effects:
- **validation.ts**: Input validation, bet validation, JSON validation
- **calculations.ts**: XP calculations, win rate, multipliers, formatting

## Best Practices

- Keep shared code pure (no side effects)
- Use TypeScript for type safety
- Document all functions
- Write unit tests for utilities
- Never import Electron APIs in shared code
