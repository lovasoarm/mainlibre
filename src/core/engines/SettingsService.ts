import { DEFAULT_SETTINGS } from '../domain/profiles';
import type { UserSettings } from '../domain/types';
import type { StoragePort } from '../ports/ports';

const STORAGE_KEY = 'mainlibre.settings.v1';

function isSettings(value: unknown): value is UserSettings {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate['schemaVersion'] === 1 &&
    candidate['profileId'] === 'Alessia' &&
    isNumberInRange(candidate['targetSizePx'], 48, 96) &&
    isNumberInRange(candidate['scanIntervalMs'], 400, 6000) &&
    isNumberInRange(candidate['firstItemDelayMs'], 0, 5000) &&
    isNumberInRange(candidate['pauseAfterCycles'], 1, 10) &&
    isNumberInRange(candidate['dwellMs'], 800, 10000) &&
    (candidate['contrast'] === 'normal' || candidate['contrast'] === 'high') &&
    typeof candidate['scanAutoPause'] === 'boolean' &&
    isNumberInRange(candidate['headGain'], 0.5, 3)
  );
}

export class SettingsService {
  private current: UserSettings;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly storage: StoragePort) {
    this.current = this.load();
  }
  get(): UserSettings {
    return { ...this.current };
  }
  getSnapshot = (): UserSettings => this.current;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  update(partial: Partial<UserSettings>): UserSettings {
    this.current = { ...this.current, ...partial, schemaVersion: 1 };
    this.persist();
    return this.get();
  }

  reset(): UserSettings {
    this.current = { ...DEFAULT_SETTINGS };
    this.persist();
    return this.get();
  }

  private persist(): void {
    this.storage.write(STORAGE_KEY, JSON.stringify(this.current));
    for (const listener of this.listeners) listener();
  }

  private load(): UserSettings {
    const saved = this.storage.read(STORAGE_KEY);
    if (!saved) return { ...DEFAULT_SETTINGS };
    try {
      const parsed: unknown = JSON.parse(saved);
      return isSettings(parsed) ? { ...DEFAULT_SETTINGS, ...parsed } : { ...DEFAULT_SETTINGS };
    } catch (error) {
      console.warn('Réglages locaux illisibles : retour au preset par défaut.', error);
      return { ...DEFAULT_SETTINGS };
    }
  }
}

function isNumberInRange(value: unknown, minimum: number, maximum: number): value is number {
  return (
    typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum
  );
}
