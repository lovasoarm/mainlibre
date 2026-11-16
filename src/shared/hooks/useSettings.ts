import { useCallback, useSyncExternalStore } from 'react';
import type { UserSettings } from '../../core/domain/types';
import { useServices } from './services-context';

export function useSettings() {
  const { settings } = useServices();
  const value = useSyncExternalStore(settings.subscribe, settings.getSnapshot, settings.getSnapshot);
  const update = useCallback((partial: Partial<UserSettings>) => settings.update(partial), [settings]);
  const reset = useCallback(() => settings.reset(), [settings]);
  return { value, update, reset };
}
