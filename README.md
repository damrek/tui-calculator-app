# TUI Calculator App

A terminal calculator built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs) and TypeScript. It covers the four basic operations plus a free expression mode with live results, five languages, and four color themes — all without leaving the keyboard.

## Features

- Four operation modes: sum, subtract, multiply, divide
- Free expression mode (`3 + 5 * 2`) with parentheses, evaluated live as you type — no need to press "continue"
- Editable input with a visible cursor — move with ←/→, insert or backspace at any position
- Smart input validation (input masking) — invalid entries like `1.2.3`, `5-`, or doubled signs are rejected as you type
- Division by zero handled gracefully with an error message instead of a crash
- History of the last 5 operations, shown inline below the result and persisted across sessions in `~/.calculator/history.json` — clear it anytime from the menu
- Press Enter to save an operation to the history and stay on the screen, ready for the next one (Esc goes back to the menu)
- Copy the full expression (`5 + 3 = 8`) to the clipboard
- Five languages and four themes, both persisted across sessions

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| ↑ / ↓ | Navigate the menu or a selector |
| ← / → | Move the input cursor |
| Enter | Confirm a choice / save to history |
| Esc | Go back / cancel |
| Ctrl+Y | Copy the result to the clipboard |
| Ctrl+L | Open the language selector |
| Ctrl+T | Open the theme selector |
| Ctrl+C | Quit |

The footer of every screen shows the two selector shortcuts: `Ctrl+L` for language, `Ctrl+T` for theme.

## Languages

English (default), Español, Français, Deutsch, Italiano.

Press **Ctrl+L** anywhere to open the language selector. Use ↑/↓ to choose, Enter to confirm, Esc to cancel. Your choice is saved to `~/.calculator/config.json` and persists across sessions.

## Themes

Press **Ctrl+T** anywhere to open the theme selector. The chosen theme is stored next to the language in `~/.calculator/config.json`.

| Theme | Look |
| --- | --- |
| Ocean (default) | Cyan borders with green highlights |
| Forest | Green borders with bright green highlights |
| Sunset | Magenta borders with yellow highlights |
| Mono | Grayscale borders with white highlights |

> **Note**: On Linux, copying to the clipboard requires `xclip`, `xsel`, or `wl-copy` to be installed. If none is present, the app shows a "Copy failed" notice instead of crashing.

## Screenshots

<img width="478" height="258" alt="tui-calculator1" src="https://github.com/user-attachments/assets/0d3f25bf-59be-4e64-a120-3e686ea13f77" />
<img width="478" height="258" alt="tui-calculator2" src="https://github.com/user-attachments/assets/53616c73-ee5f-4ca4-a6ff-a362b041f6c6" />

## Getting Started

**Requirements**: Node.js 18+ (currently developed on Node 24). Building standalone binaries additionally requires [Bun](https://bun.sh).

```bash
npm install
npm run dev   # runs the app directly from source — no build needed
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Run the app from source |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled app from `dist/` (build first) |
| `npm run lint` | Run ESLint on `src/` |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with a coverage report |
| `npm run dist` | Build and compile standalone binaries for Linux, Windows, and macOS |

Tests use [Vitest](https://vitest.dev) with happy-dom and live in the `__tests__/` directories next to the code they cover (`src/utils/`, `src/hooks/`, `src/components/`, `src/locales/`).

## Project Structure

```
src/
├── App.tsx                   # Main application component (rendering only)
├── index.tsx                 # Entry point (renders App)
├── components/
│   ├── LanguageSelector.tsx  # Language selector modal overlay
│   ├── ThemeSelector.tsx     # Theme selector modal overlay
│   └── __tests__/            # Component tests
├── hooks/
│   ├── useAppInput.ts        # App state, input handling, history
│   ├── useLanguage.ts        # Language state, Ctrl+L handler, selector logic
│   ├── useTheme.ts           # Theme state, Ctrl+T handler, selector logic
│   └── __tests__/            # Hook tests
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
    ├── history.ts            # History entries, FIFO append, and persistence (~/.calculator/history.json)
    ├── clipboard.ts          # Clipboard wrapper (clipboardy)
    ├── keystrokes.ts         # Splits batched stdin chunks into single keystrokes
    └── __tests__/            # Logic tests (calculator, expression, validation,
                              # history, config, clipboard, keystrokes, themes)
```

## Development

Code style, React/Ink patterns, testing conventions, and commit guidelines live in [AGENTS.md](AGENTS.md). The project uses Husky with lint-staged, so every commit runs ESLint and Prettier on staged files automatically.

## Distribution (Bun)

With [Bun](https://bun.sh) installed:

```bash
npm run dist          # Build all binaries (Linux, Windows, macOS)
npm run build:linux   # Linux x64
npm run build:win     # Windows x64
npm run build:mac     # macOS ARM
```

Binaries are created in `dist/`: `calculator-linux`, `calculator.exe`, and `calculator-macos`. They are portable, standalone executables — no installation required.

## Dependencies

- **Production**: ink, react, react-dom, react-devtools-core, expr-eval, clipboardy
- **Dev**: typescript, tsx, eslint, prettier, vitest, happy-dom, @testing-library/react, husky, lint-staged
