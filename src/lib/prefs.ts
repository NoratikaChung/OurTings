import { useCallback, useState } from 'react';
import type { Theme, UserId, ViewMode } from '../types';

export interface UserPrefs {
  visible: Record<UserId, boolean>;
  view: ViewMode;
}

export const DEFAULT_PREFS: UserPrefs = { visible: { nora: true, anant: true }, view: 'month' };

const KEY = {
  user: 'ourtings:user',
  theme: 'ourtings:theme',
  prefs: (user: UserId) => `ourtings:prefs:${user}`,
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function useStored<T>(key: string, initial: () => T) {
  const [value, setValue] = useState<T>(() => load(key, initial()));
  const set = useCallback(
    (next: T) => {
      setValue(next);
      if (next === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(next));
    },
    [key],
  );
  return [value, set] as const;
}

export const useCurrentUser = () => useStored<UserId | null>(KEY.user, () => null);

/** Hollow Knight (dark) is the first-open default; a choice made on the device is remembered. */
export const useTheme = () => useStored<Theme>(KEY.theme, () => 'dark');

/** Calendar toggles and last view, remembered per user on this device. */
export function useUserPrefs(user: UserId) {
  const [prefs, setPrefs] = useStored<UserPrefs>(KEY.prefs(user), () => DEFAULT_PREFS);
  return [{ ...DEFAULT_PREFS, ...prefs }, setPrefs] as const;
}
