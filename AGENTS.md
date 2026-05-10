# AGENTS.md - Developer Guidelines

This document provides guidelines for AI agents working in this codebase.

## Project Overview

This is a **TUI (Terminal User Interface) Calculator App** built with:
- **Framework**: Ink (React for CLIs)
- **Language**: TypeScript
- **Target**: Node.js terminal applications
- **Operations**: sum, subtract, multiply, divide

---

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

### Pre-commit Hooks
The project uses Husky with lint-staged. On every `git commit`:
- ESLint runs on staged `.ts` and `.tsx` files
- Prettier formats staged files
- If either fails, the commit is blocked

---

## Code Style Guidelines

### TypeScript Configuration
- Target: ES2020
- JSX: react
- Strict mode: enabled
- Module resolution: bundler

### Formatting (Prettier)
- **Semicolons**: Yes
- **Single quotes**: Yes
- **Tab width**: 2 spaces
- **Trailing commas**: es5 style

Run `npm run format` before committing.

### ESLint Rules
- React JSX scope: disabled (use JSX without importing React)
- No unused variables (errors)
- TypeScript recommended rules enabled
- React hooks rules enabled

---

## Import Conventions

### Ink/React Imports
```typescript
// React core
import React, { useState } from 'react';

// Ink hooks
import { useInput } from 'ink';

// Ink components
import { Box, Text } from 'ink';
```

### Order
1. React imports
2. External libraries (ink)
3. Internal imports (if any)
4. Type definitions

---

## Naming Conventions

### Files
- PascalCase for components: `App.tsx`, `Calculator.tsx`
- PascalCase for types: `AppState.ts`, `KeyInput.ts`

### Variables & Functions
- camelCase: `goToMenu`, `calculateAndShowResult`
- PascalCase for React components: `App`, `Menu`
- Interfaces: PascalCase with descriptive names: `AppState`, `KeyInput`

### Constants
- UPPER_SNAKE_CASE for true constants
- camelCase for configuration objects

---

## TypeScript Guidelines

### Interfaces vs Types
- Use `interface` for object shapes and state
- Use `type` for unions, primitives, and aliases

```typescript
// Good
interface AppState {
  screen: Screen;
  selectedIndex: number;
  error?: string;
}

type Screen = 'menu' | 'input-sum' | 'input-sub' | 'input-mul' | 'input-div' | 'result';
```

### Avoid `any`
Never use `any`. Define proper interfaces:

```typescript
// Bad
useInput((input: string, key: any) => {});

// Good
interface KeyInput {
  upArrow: boolean;
  downArrow: boolean;
  return: boolean;
}
useInput((input: string, key: KeyInput) => {});
```

### Optional Properties
Use `?` for optional properties:
```typescript
interface AppState {
  result?: number;  // optional
}
```

---

## React/Ink Patterns

### Component Structure
```typescript
import React, { useState } from 'react';
import { useInput, Box, Text } from 'ink';

const App: React.FC = () => {
  // State
  const [state, setState] = useState<AppState>({...});

  // Event handlers
  const handleAction = () => {};

  // Render helpers
  const renderContent = () => <Box>...</Box>;

  // Input handling
  useInput((input, key) => {
    // Handle keyboard input
  });

  return <Box>{renderContent()}</Box>;
};

export default App;
```

### useInput Hook
- Always use for keyboard input in Ink
- Handle all key types explicitly
- Use functional state updates to avoid stale closures

```typescript
useInput((input: string, key: KeyInput) => {
  if (key.escape) {
    goBack();
    return;
  }
  setState((s: AppState) => ({ ...s, /* update */ }));
});
```

### Box and Text Components
- Use `Box` for layout containers
- Use `Text` for all visible content
- Apply styling via props: `bold`, `color`, `dimColor`

```typescript
<Box flexDirection="column" borderStyle="round" padding={1}>
  <Text bold color="cyan">Title</Text>
  <Text dimColor>Instructions</Text>
</Box>
```

---

## Error Handling

### Division by Zero
When the user performs a division by zero, the app sets `error: 'Error: division by zero'` in the state (instead of a numeric result). The `result` field is `undefined` in this case.

### Keyboard Input
- Always provide escape routes (e.g., Esc to go back)
- Handle all key types explicitly rather than using `any`

### State Management
- Use functional updates: `setState(s => ({ ...s, ... }))`
- Initialize all state properties explicitly

### Process Exit
- Use `process.exit(0)` for clean exit
- Consider using `unmount()` if using Ink's render

---

## File Structure

```
src/
├── App.tsx              # Main application component (rendering only)
├── index.tsx            # Entry point (renders App)
└── hooks/
    └── useAppInput.ts   # Custom hook with state and input handling
```

---

## Testing

This project does not currently have tests. When adding tests:
- Use a testing framework compatible with React/Ink
- Place tests in `__tests__/` or alongside source files
- Run single test: use framework's CLI (e.g., `jest --testPathPattern=name`)

---

## Git Conventions

### Commit Messages
- Use clear, descriptive commit messages
- Start with verb: "Add feature", "Fix bug", "Update config"

### Pre-commit
Always run `npm run lint` and `npm run format` before committing, or let the pre-commit hook handle it automatically.

---

## Additional Notes

### Node Version
- Designed for Node.js 18+
- Current development: Node 24

### Dependencies
- **Production**: ink, react, react-dom, react-devtools-core
- **Dev**: typescript, eslint, prettier, husky, lint-staged

---

## Distribution (Bun)

### Create Standalone Binaries
```bash
# Requires Bun installed: curl -fsSL https://bun.sh/install | bash
npm run dist    # Build all binaries (Linux, Windows, macOS)
npm run build:linux   # Linux x64
npm run build:win     # Windows x64
npm run build:mac     # macOS ARM
```

### Output
Binaries are created in `dist/`:
- `calculator-linux` - Linux executable
- `calculator.exe` - Windows executable
- `calculator-macos` - macOS executable (ARM)

These are portable, standalone executables (no installation required).
