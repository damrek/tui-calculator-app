/**
 * Ink delivers a whole stdin chunk as a single `useInput` event when the chunk
 * contains no escape sequence, so `input` can hold several code points at once
 * (fast typing, or a clipboard paste). This splits such a chunk back into one
 * entry per code point so the app can apply char-by-char semantics.
 *
 * It deliberately filters nothing: invalid characters are rejected by the
 * per-character validation that already exists in the app.
 *
 * `Array.from` is used instead of `split('')` so surrogate pairs stay intact.
 */
export const splitKeystrokes = (chunk: string): string[] => Array.from(chunk);
