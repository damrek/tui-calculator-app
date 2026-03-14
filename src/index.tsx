import React from 'react';
import { render } from 'ink';
import App from './App';

const { unmount } = render(<App />);

process.on('SIGINT', () => {
  unmount();
  process.exit(0);
});

process.on('SIGTERM', () => {
  unmount();
  process.exit(0);
});
