import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../domain/profiles';
import { FakeStorage } from '../../infrastructure/storage/FakeStorage';
import { SettingsService } from './SettingsService';

describe('SettingsService', () => {
  it('applique le preset Alessia par défaut et persiste les changements', () => {
    const storage = new FakeStorage();
    const settings = new SettingsService(storage);
    expect(settings.get()).toEqual(DEFAULT_SETTINGS);
    settings.update({ dwellMs: 2400, targetSizePx: 80 });
    expect(new SettingsService(storage).get()).toMatchObject({ dwellMs: 2400, targetSizePx: 80 });
  });

  it('rejette un schéma local incomplet ou hors limites', () => {
    const storage = new FakeStorage();
    storage.write('mainlibre.settings.v1', JSON.stringify({ ...DEFAULT_SETTINGS, headGain: 500 }));
    expect(new SettingsService(storage).get()).toEqual(DEFAULT_SETTINGS);
  });
});
