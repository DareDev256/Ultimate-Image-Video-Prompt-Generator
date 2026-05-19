'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  loadSettings,
  saveSettings,
  resetSettings,
  FACTORY_DEFAULTS,
  type UserSettings,
  type ModelDefaults,
} from '@/lib/user-settings';
import type { ModelType } from '@/context/WizardContext';

/**
 * React hook over `lib/user-settings`. Returns the merged effective defaults
 * (user override → factory) for every model, plus an updater that persists
 * to `localStorage`.
 */
export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>({ defaults: {} });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  const update = useCallback((model: ModelType, patch: Partial<ModelDefaults>) => {
    setSettings((prev) => {
      const merged: UserSettings = {
        ...prev,
        defaults: {
          ...prev.defaults,
          [model]: {
            ...FACTORY_DEFAULTS[model],
            ...prev.defaults[model],
            ...patch,
          },
        },
      };
      saveSettings(merged);
      return merged;
    });
  }, []);

  const reset = useCallback(() => {
    resetSettings();
    setSettings({ defaults: {} });
  }, []);

  /** Get effective defaults for a model (user override → factory). */
  const get = useCallback(
    <T extends ModelDefaults>(model: ModelType): T =>
      ({ ...FACTORY_DEFAULTS[model], ...settings.defaults[model] } as T),
    [settings]
  );

  return {
    hydrated,
    settings,
    get,
    update,
    reset,
  };
}
