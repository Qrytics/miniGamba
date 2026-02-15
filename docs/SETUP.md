# miniGamba - Setup Guide

Complete guide for setting up and running the miniGamba development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

1. **Node.js** - Version **20.x LTS** recommended
   - [Download from nodejs.org](https://nodejs.org/)
   - **Recommended:** Node.js v20.x LTS for best compatibility
   - **Supported:** Node.js v20.x, v22.x, v23.x, v24.x, v25.x
   - **Note:** better-sqlite3 v12.0.0 officially supports Node.js v20.x, v22.x, v23.x, v24.x, v25.x
   - **Important:** Node.js v18 is NOT supported. Please upgrade to v20 or higher.
   - Check your version: `node --version`
   - If you need to manage multiple Node versions, consider using [nvm](https://github.com/nvm-sh/nvm)

2. **npm** (v9 or higher) - Comes automatically with Node.js
   - Check your version: `npm --version`

3. **Git** - Required for cloning the repository
   - [Download from git-scm.com](https://git-scm.com/)
   - Check installation: `git --version`

### Build Tools (Required for native dependencies)

miniGamba uses `better-sqlite3`, which requires native compilation. You MUST have build tools installed:

#### Windows

You have two options:

**Installation Steps:**
1. Download [Visual Studio Build Tools 2022](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. Run the installer
3. Select "Desktop development with C++"
4. Install (this will take several GB of space)

**Note:** The `windows-build-tools` npm package is deprecated and should not be used.

#### macOS

Install Xcode Command Line Tools:
```bash
xcode-select --install
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install build-essential python3
```

#### Linux (Fedora/RHEL/CentOS)

```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install python3
```

### Optional but Recommended

- **Code Editor** - [Visual Studio Code](https://code.visualstudio.com/) recommended with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features

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

### Issue: `npm install` fails with compilation errors

**Symptoms:**
- Errors mentioning "node-gyp", "MSBuild", or "python"
- "better-sqlite3" build failures
- "No module named 'distutils'" on Linux

**Solution:**

1. **Ensure build tools are installed** (see Prerequisites above)
   - Windows: Visual Studio Build Tools with C++ development tools
   - macOS: Xcode Command Line Tools
   - Linux: build-essential package

2. **Check Node.js version:**
   ```bash
   node --version
   ```
   - **Required:** Node.js v20 or higher (v18 is NOT supported)
   - If you have Node.js v18, upgrade to v20 LTS
   - Recommended: Use Node.js v20 LTS for best compatibility

3. **Clean installation:**
   ```bash
   # Delete existing installations
   rm -rf node_modules package-lock.json
   # Or on Windows:
   # rmdir /s node_modules
   # del package-lock.json
   
   # Fresh install
   npm install
   ```

4. **Python issues:** Node-gyp requires Python 3.x
   - Windows: Install Python 3.x from [python.org](https://www.python.org/)
   - Make sure Python is in your PATH
   - Verify: `python --version` or `python3 --version`

### Issue: "better-sqlite3" won't compile

**Solution:**

1. **Windows-specific:**
   - Open PowerShell or Command Prompt **as Administrator**
   - Make sure Visual Studio Build Tools are properly installed
   - Check that you selected "Desktop development with C++" during installation
   - Try: `npm rebuild better-sqlite3`

2. **All platforms:**
   ```bash
   # Rebuild just better-sqlite3
   npm rebuild better-sqlite3
   
   # Or rebuild all native modules
   npm rebuild
   ```

3. **If still failing on Windows:**
   - Ensure Visual Studio Build Tools 2022 (or 2019) is installed
   - Check Windows SDK is installed
   - Restart your computer after installing build tools

### Issue: Node.js version conflicts

**Problem:** You have an unsupported Node.js version

**Solution 1: Upgrade to Node.js v20 LTS (Recommended)**

Using nvm (Node Version Manager):
```bash
# Install nvm first from: https://github.com/nvm-sh/nvm

# Install Node.js v20
nvm install 20

# Use Node.js v20
nvm use 20

# Verify
node --version  # Should show v20.x.x

# Now install dependencies
npm install
```

**Important:** Node.js v18 is NOT supported by better-sqlite3 v12. You must use v20 or higher.

### Issue: Electron won't start

**Solution:**
- Check if all dependencies are installed: `npm list --depth=0`
- Look for any "UNMET DEPENDENCY" errors
- Check console for error messages
- Try: `npm run type-check` to identify TypeScript issues
- Make sure you're in the project directory
- Try cleaning and reinstalling:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Issue: Hot reload not working

**Solution:**
- Restart the development server
- Check if file watchers are working
- On Linux, increase file watcher limit:
  ```bash
  echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p
  ```

### Issue: TypeScript errors

**Solution:**
- Run type checking: `npm run type-check`
- Make sure all type definitions are installed
- Check `tsconfig.json` for correct paths
- Try: `npm install @types/node @types/react @types/react-dom`

### Issue: Port already in use

**Solution:**
- Close any other instances of the app
- Kill processes using the port:
  - Windows: `netstat -ano | findstr :PORT` then `taskkill /PID <pid> /F`
  - macOS/Linux: `lsof -ti:PORT | xargs kill`
- Or change the port in webpack config files

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
