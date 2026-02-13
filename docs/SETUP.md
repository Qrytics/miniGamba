# miniGamba - Setup Guide

Complete guide for setting up and running the miniGamba development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Qrytics/miniGamba.git
cd miniGamba
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Electron
- React
- TypeScript
- ESLint
- Prettier
- And all other dependencies

### 3. Environment Setup

No environment variables are required for basic setup. All data is stored locally.

## Development

### Running in Development Mode

```bash
npm run dev
```

This will:
- Start the Electron app
- Enable hot reloading for renderer processes
- Open developer tools automatically
- Watch for file changes

### Building for Production

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Bundle renderer processes
- Create production builds in the `dist/` directory

### Running Tests

```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Linting and Formatting

Check for linting errors:
```bash
npm run lint
```

Auto-fix linting errors:
```bash
npm run lint:fix
```

Format code with Prettier:
```bash
npm run format
```

Type checking:
```bash
npm run type-check
```

## Project Structure

```
miniGamba/
├── src/
│   ├── main/          # Main process (Electron backend)
│   ├── renderer/      # Renderer processes (UI)
│   ├── shared/        # Shared code
│   └── preload/       # Preload scripts
├── assets/            # Static assets
├── tests/             # Test files
├── docs/              # Documentation
└── scripts/           # Build scripts
```

See [File Architecture](../productReqDoc.md#23-file-architecture) for detailed structure.

## Configuration Files

### package.json
Project metadata and dependencies

### tsconfig.json
TypeScript compiler configuration

### .eslintrc.js
ESLint linting rules

### .prettierrc
Prettier formatting rules

### .gitignore
Files to exclude from Git

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit files in the `src/` directory. The app will hot-reload in development mode.

### 3. Test Your Changes

```bash
npm run lint
npm run type-check
npm test
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "Description of your changes"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

## Common Issues

### Issue: npm install fails

**Solution:** 
- Ensure Node.js v18+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules/` and `package-lock.json`, then run `npm install` again

### Issue: Electron won't start

**Solution:**
- Check if all dependencies are installed: `npm install`
- Rebuild native modules: `npm rebuild`
- Check console for error messages

### Issue: TypeScript errors

**Solution:**
- Run type checking: `npm run type-check`
- Ensure all types are properly imported
- Check `tsconfig.json` for correct paths

### Issue: Hot reload not working

**Solution:**
- Restart the development server
- Check if file watchers are working
- Increase file watcher limit (on Linux)

## Next Steps

### TODO: Implementation Checklist

The following features need to be implemented:

#### Phase 1: Core Foundation
- [ ] Implement database connection (SQLite)
- [ ] Set up user data management
- [ ] Implement settings persistence
- [ ] Create basic UI layouts

#### Phase 2: Game Implementation
- [ ] Implement Slot Machine game UI and logic
- [ ] Implement Blackjack game UI and logic
- [ ] Implement Coin Flip game UI and logic
- [ ] Implement remaining games

#### Phase 3: Features
- [ ] Game detection service
- [ ] Activity tracking (video watching, idle time)
- [ ] Achievement system
- [ ] Leaderboard P2P sync
- [ ] Cosmetics system

#### Phase 4: Polish
- [ ] Animations and transitions
- [ ] Sound effects
- [ ] Themes and customization
- [ ] Performance optimization

#### Phase 5: Testing & Deployment
- [ ] Write comprehensive tests
- [ ] Set up CI/CD pipeline
- [ ] Create installers for Windows/Mac/Linux
- [ ] Create user documentation

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Product Requirements](../productReqDoc.md)

## Getting Help

- Check existing documentation in `docs/`
- Review TODO comments in code files
- Check GitHub issues
- Read inline code comments

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines (TODO).

---

**Note:** This project is currently in the boilerplate setup phase. Many features have TODO comments indicating where implementation is needed. Start with Phase 1 of the implementation checklist above.
