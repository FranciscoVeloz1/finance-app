import { useCallback, useEffect, useState } from 'react';
import type { Preferences } from '../types/finance';

const STORAGE_KEY = 'finance-app:preferences:v1';

export const DEFAULT_PREFERENCES: Preferences = {
  density: 'comfortable',
  hideCancelledByDefault: false,
  hidePlannedByDefault: false,
  showTemporalClassifier: true,
  reducedMotion: false,
};

function readPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      return DEFAULT_PREFERENCES;
    }

    // Merge over defaults so a stored payload missing a newer key stays valid.
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    // Private browsing, quota or corrupted payload: fall back to defaults.
    return DEFAULT_PREFERENCES;
  }
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(readPreferences);

  const update = useCallback(<TKey extends keyof Preferences>(key: TKey, value: Preferences[TKey]) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Preferences are a convenience; a storage failure must not break the UI.
      }

      return next;
    });
  }, []);

  // The stylesheet reacts to this attribute, so the preference reaches every
  // animation without threading a prop through the tree.
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(preferences.reducedMotion);
  }, [preferences.reducedMotion]);

  return { preferences, update };
}
