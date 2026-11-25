import { useEffect, useState } from 'react';

// Per-browser convenience only (the pasted team, last settings). Storage can be unavailable
// (private windows, blocked site data), so every access is guarded.

const full = (key: string) => `champions:${key}`;

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(full(key));
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** Returns whether the value was saved. */
export function writeStored(key: string, value: unknown): boolean {
  try { localStorage.setItem(full(key), JSON.stringify(value)); return true; } catch { return false; }
}

/** useState that persists to localStorage under `champions:<key>`; the third value is whether the last save worked. */
export function useStored<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() =>
    readStored(key, typeof initial === 'function' ? (initial as () => T)() : initial));
  const [saved, setSaved] = useState(true);
  useEffect(() => setSaved(writeStored(key, value)), [key, value]);
  return [value, setValue, saved] as const;
}
