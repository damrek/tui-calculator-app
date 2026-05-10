# TUI Calculator App

A Terminal User Interface (TUI) Calculator application built with Ink (React for CLIs) and TypeScript.

## Features

- Interactive terminal-based calculator interface
- Built with React-like components using Ink
- TypeScript for type safety
- Multiple calculation modes (sum, subtract, multiply, divide)
- Division by zero error handling
- Clean, responsive terminal UI

## Project Structure

```
src/
├── App.tsx              # Main application component (rendering only)
├── index.tsx            # Entry point (renders App)
└── hooks/
    └── useAppInput.ts   # Custom hook with state and input handling
```

## Commands

### Build & Run
```bash
npm run build     # Compile TypeScript to dist/
npm run start     # Run the compiled app
npm run dev       # Build and run in one command
```

### Linting & Formatting
```bash
npm run lint      # Run ESLint on src/
npm run format    # Format code with Prettier
```

### Testing
```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run with coverage report
```

Tests are located in `src/utils/__tests__/` and use Vitest with happy-dom.

### Distribution (Bun)
```bash
npm run dist      # Build all binaries (Linux, Windows, macOS)
npm run build:linux   # Linux x64
npm run build:win     # Windows x64
npm run build:mac     # macOS ARM
```

Binaries are created in `dist/`:
- `calculator-linux` - Linux executable
- `calculator.exe` - Windows executable
- `calculator-macos` - macOS executable (ARM)

These are portable, standalone executables (no installation required).

## Development Guidelines

### TypeScript Configuration
- Target: ES2020
- JSX: react
- Strict mode: enabled
- Module resolution: bundler

### Formatting (Prettier)
- Semicolons: Yes
- Single quotes: Yes
- Tab width: 2 spaces
- Trailing commas: es5 style

Run `npm run format` before committing.

### ESLint Rules
- React JSX scope: disabled (use JSX without importing React)
- No unused variables (errors)
- TypeScript recommended rules enabled
- React hooks rules enabled

### Import Conventions
1. React imports
2. External libraries (ink)
3. Internal imports (if any)
4. Type definitions

### Naming Conventions
- Files: PascalCase for components (`App.tsx`, `Calculator.tsx`)
- Variables & Functions: camelCase (`goToMenu`, `calculateAndShowResult`)
- Components: PascalCase (`App`, `Menu`)
- Interfaces: PascalCase with descriptive names (`AppState`, `KeyInput`)
- Constants: UPPER_SNAKE_CASE for true constants, camelCase for configuration objects

## Pre-commit Hooks

The project uses Husky with lint-staged. On every `git commit`:
- ESLint runs on staged `.ts` and `.tsx` files
- Prettier formats staged files
- If either fails, the commit is blocked

Always run `npm run lint` and `npm run format` before committing, or let the pre-commit hook handle it automatically.

## Node Version

- Designed for Node.js 18+
- Current development: Node 24

## Dependencies

### Production
- ink
- react
- react-dom
- react-devtools-core

### Dev Dependencies
- typescript
- eslint
- prettier
- husky
- lint-staged