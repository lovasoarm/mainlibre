import type { UserSettings } from './types';

export const Alessia_PROFILE: UserSettings = {
  schemaVersion: 1,
  profileId: 'Alessia',
  targetSizePx: 64,
  scanIntervalMs: 1800,
  firstItemDelayMs: 2400,
  pauseAfterCycles: 3,
  dwellMs: 1800,
  contrast: 'high',
  scanAutoPause: true,
  headGain: 1.25,
};

export const DEFAULT_SETTINGS: UserSettings = Alessia_PROFILE;
