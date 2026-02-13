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

**Unit tests (Jest):**
```bash
npm test
npm run test:watch
```

**E2E tests (Playwright):**
```bash
npm run test:e2e          # Full run
npm run test:e2e:single   # One worker (easier to stop with Ctrl+C)
npm run test:e2e:report   # Run then open HTML report
```

**Analyze test data and E2E results for bugs:**
```bash
npm run test:analyze      # Reads tests/reports/results.json + test-data folders
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

## Implemented Features (Current)

- **Core:** SQLite database, user data, settings, game history, achievements, daily tasks, hourly bonus, investments.
- **Games:** All 10 mini-games (Slots, Blackjack, Coin Flip, Hi/Lo, Mines, Scratch, Wheel, Derby, Dice, Poker) with UI and logic.
- **UI:** Dashboard and overlay with Balatro-inspired design; angular/edged panels; pixel-style icons (no emojis in UI).
- **E2E:** Playwright tests; `npm run test:analyze` for E2E failures + test-data issues; single-worker run for easy stop.
- **Build:** Electron Forge, Webpack, preload scripts, type-safe IPC.

See [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) and [docs/DOCUMENTATION.md](DOCUMENTATION.md) for full documentation index and PDF generation.

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

**Note:** Documentation is in Markdown. To generate PDFs, see [docs/DOCUMENTATION.md](DOCUMENTATION.md).
