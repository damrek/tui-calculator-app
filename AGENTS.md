# AGENTS.md — Developer Guidelines

Guidelines for AI agents and contributors working in this codebase. For a user-facing overview, see [README.md](README.md).

## Project Overview

A **TUI (Terminal User Interface) Calculator App** built with:

- **Framework**: Ink (React for CLIs) v6, React 19
- **Language**: TypeScript (strict, ESM — `"type": "module"`)
- **Target**: Node.js 18+ terminal applications (currently developed on Node 24)
- **Operations**: sum, subtract, multiply, divide, plus a free expression mode (`3 + 5 * 2`) backed by `expr-eval`
- **Extras**: five locales (en, es, fr, de, it), four themes, persistent config in `~/.calculator/config.json`, clipboard via `clipboardy`

---

## Commands

### Build & Run

```bash
npm run dev     # Run from source via tsx — no build needed
npm run build   # Compile TypeScript to dist/
npm run start   # Run the compiled app from dist/ (build first)
```

### Linting & Formatting

```bash
npm run lint    # Run ESLint on src/
npm run format  # Format code with Prettier
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
2. External libraries (ink, expr-eval, clipboardy)
3. Internal imports
4. Type definitions

---

## Naming Conventions

### Files

- PascalCase for components: `App.tsx`, `LanguageSelector.tsx`
- camelCase for hooks and utilities: `useAppInput.ts`, `calculator.ts`
- Test files mirror the source name: `useAppInput.test.ts`

### Variables & Functions

- camelCase: `goToMenu`, `calculateAndShowResult`
- PascalCase for React components: `App`, `Menu`
- Interfaces: PascalCase with descriptive names: `AppState`, `KeyInput`

### Constants

- UPPER_SNAKE_CASE for true constants (e.g. `MAX_HISTORY`)
- camelCase for configuration objects

---

## TypeScript Guidelines

### Interfaces vs Types

Use `interface` for object shapes and state. Use `type` for unions, primitives, and aliases.

```typescript
// Good
interface AppState {
  screen: Screen;
  selectedIndex: number;
  error?: string;
}

type Screen = 'menu' | 'input-sum' | 'input-sub' | 'input-mul' | 'input-div' | 'input-expression';
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
  result?: number; // optional
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
useInput((input, key: KeyInput) => {
  if (key.escape) {
    goBack();
    return;
  }
  setState((s: AppState) => ({ ...s, /* update */ }));
});
```

### Batched Keystrokes (gotcha)

Ink delivers a whole stdin chunk as a single `useInput` event when it contains no escape sequence — so `input` can hold several code points at once (fast typing or a paste). Always split it with `splitKeystrokes` from `src/utils/keystrokes.ts` before applying char-by-char semantics. It filters nothing; invalid characters are rejected by the per-character validation that already exists.

### Box and Text Components

- Use `Box` for layout containers
- Use `Text` for all visible content
- Apply styling via props: `bold`, `color`, `dimColor`

```typescript
<Box flexDirection="column" borderStyle="round" padding={1}>
  <Text bold color={colors.title}>Title</Text>
  <Text dimColor>Instructions</Text>
</Box>
```

### Theming

Never hardcode a color in a component. Read the active palette instead:

- `useTheme()` returns `colors` (`border`, `title`, `selected`, `success`, `danger`, `warning`) plus the selected theme name.
- Child components accept the palette as a `colors: ThemeColors` prop; `App` is the only place that calls `useTheme()`.
- Palettes live in `src/utils/themes.ts` (`themeNames`, `themeColors`, `isThemeName`, `getThemeColors`). Adding a theme means one entry in `themeNames`, one palette in `themeColors`, and one label per locale file under `themeSelector.themes`.
- Hotkeys are owned by `App` (Ctrl+L language, Ctrl+T theme) so only one overlay can be open at a time; the hooks expose `openSelector` and take `{ enableHotkey: false }`.

### i18n

All user-facing strings go through the `t()` helper from `src/locales/index.ts`. Never hardcode UI text. Adding a locale means one JSON file in `src/locales/` plus registering it in the loader.

---

## Error Handling

### Division by Zero

A division by zero sets an error message in the state (localized via `t()`) instead of a numeric result. The `result` field stays `undefined` in that case. Never throw from calculation code — render the error.

### Keyboard Input

- Always provide escape routes (e.g. Esc to go back)
- Handle all key types explicitly rather than using `any`

### State Management

- Use functional updates: `setState(s => ({ ...s, ... }))`
- Initialize all state properties explicitly

### Clipboard

Clipboard access goes through `copyToClipboard` in `src/utils/clipboard.ts`, which returns `boolean` and never throws — a missing clipboard tool (Linux without `xclip`/`xsel`/`wl-copy`) shows a failure notice instead of crashing.

### Process Exit

- Use `process.exit(0)` for a clean exit
- Consider using `unmount()` if using Ink's render

---

## File Structure

```
src/
├── App.tsx                   # Main application component (rendering only)
├── index.tsx                 # Entry point (renders App)
├── components/
│   ├── LanguageSelector.tsx  # Language selector modal overlay
│   ├── ThemeSelector.tsx     # Theme selector modal overlay
│   └── __tests__/            # Component tests (selectors)
├── hooks/
│   ├── useAppInput.ts        # App state, input handling, history (appendHistory)
│   ├── useLanguage.ts        # Language state, Ctrl+L handler, selector logic
│   ├── useTheme.ts           # Theme state, Ctrl+T handler, selector logic
│   └── __tests__/            # Hook tests (useAppInput, useLanguage, useTheme)
├── locales/
│   ├── index.ts              # Translation loader and t() helper
│   ├── en.json               # English (default)
│   ├── es.json               # Spanish
│   ├── fr.json               # French
│   ├── de.json               # German
│   ├── it.json               # Italian
│   └── __tests__/            # Locale tests
└── utils/
    ├── calculator.ts         # Calculation logic (calculate, parseInput, Operation)
    ├── expression.ts         # Expression evaluation (expr-eval) and input validation
    ├── themes.ts             # Theme names and color palettes
    ├── config.ts             # Config read/write (~/.calculator/config.json)
    ├── clipboard.ts          # Clipboard wrapper (copyToClipboard, never throws)
    ├── keystrokes.ts         # splitKeystrokes — splits batched stdin chunks
    └── __tests__/            # Logic tests (calculator, expression, validation,
                              # history, config, clipboard, keystrokes, themes)
```

---

## Testing

### Framework

This project uses **Vitest** with **happy-dom** for DOM simulation and `@testing-library/react` for hook/component tests.

### Commands

```bash
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage  # Run with coverage report
```

### Test Structure

- Logic tests: `src/utils/__tests__/` — calculator, expression, validation, history, config, clipboard, keystrokes, themes
- Hook tests: `src/hooks/__tests__/` — useAppInput, useLanguage, useTheme
- Component tests: `src/components/__tests__/` — LanguageSelector, ThemeSelector
- Locale tests: `src/locales/__tests__/`
- Test files follow the pattern `*.test.ts` / `*.test.tsx`, mirroring the source name
- Run a single test: `npm run test -- --testNamePattern=pattern`

### Adding New Tests

1. Create test files in the matching `__tests__/` directory
2. Use pure functions when possible (avoid React/Ink dependencies)
3. Import from `src/utils/` for logic that can be tested in isolation
4. For hooks using Ink's `useInput`, `vi.mock('ink', ...)` to capture the input handler; for config I/O, `vi.mock('fs', ...)`

### Example

```typescript
import { calculate, parseInput } from '../calculator';

describe('calculate', () => {
  it('should sum two numbers', () => {
    expect(calculate(2, 3, 'sum')).toEqual({ result: 5 });
  });
});
```

---

## Git Conventions

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb: "Add feature", "Fix bug", "Update config"

### Pre-commit

Always run `npm run lint` and `npm run format` before committing, or let the pre-commit hook handle it automatically.

---

## Dependencies

- **Production**: ink, react, react-dom, react-devtools-core, expr-eval, clipboardy
- **Dev**: typescript, tsx, eslint (+ typescript-eslint, react, react-hooks plugins), prettier, vitest, happy-dom, @testing-library/react, husky, lint-staged

---

## Distribution (Bun)

### Create Standalone Binaries

```bash
# Requires Bun installed: curl -fsSL https://bun.sh/install | bash
npm run dist          # Build all binaries (Linux, Windows, macOS)
npm run build:linux   # Linux x64
npm run build:win     # Windows x64
npm run build:mac     # macOS ARM
```

### Output

Binaries are created in `dist/`:

- `calculator-linux` — Linux executable
- `calculator.exe` — Windows executable
- `calculator-macos` — macOS executable (ARM)

These are portable, standalone executables (no installation required).
