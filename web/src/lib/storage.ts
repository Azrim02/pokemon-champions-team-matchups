import { useEffect, useState } from 'react';

// Per-browser convenience only (the pasted team, last settings). Storage can be unavailable
// (private windows, blocked site data), so every access is guarded.

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

/** useState that persists to localStorage under `champions:<key>`. */
export function useStored<T>(key: string, initial: T | (() => T)) {
  const full = `champions:${key}`;
  const [value, setValue] = useState<T>(() =>
    read(full, typeof initial === 'function' ? (initial as () => T)() : initial));
  useEffect(() => write(full, value), [full, value]);
  return [value, setValue] as const;
}
