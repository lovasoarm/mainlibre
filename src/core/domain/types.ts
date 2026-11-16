export type Intent =
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'SELECT'; targetId?: string }
  | { type: 'BACK' }
  | { type: 'HOME' }
  | { type: 'OPEN'; route: string }
  | { type: 'TRIGGER_ACTION'; actionId: string };

export type IntentSource = 'voice' | 'switch' | 'head' | 'ui' | 'system';
export type AppEvent =
  | { type: 'INTENT'; intent: Intent; source: IntentSource; occurredAt: number }
  | { type: 'ACTION_TRIGGERED'; actionId: string; label: string; occurredAt: number }
  | { type: 'TEXT_CHANGED'; text: string; source: 'keyboard' | 'voice'; activation: boolean; occurredAt: number }
  | { type: 'SCAN_CHANGED'; snapshot: ScanSnapshot; occurredAt: number }
  | { type: 'LAB_MODE_CHANGED'; mode: 'none' | 'mixed' | 'voice-only' | 'single-switch'; occurredAt: number }
  | { type: 'LAB_TASK_COMPLETED'; taskId: string; occurredAt: number };

export interface ScanGroup {
  id: string;
  targetIds: string[];
}

export type ScanPhase = 'IDLE' | 'GROUPS' | 'ITEMS' | 'ACTIVATED' | 'PAUSED';
export type ScanOwner = 'navigation' | 'keyboard' | 'lab';
export interface ScanSnapshot {
  phase: ScanPhase;
  mode: 'rows' | 'flat';
  activeGroupIndex: number;
  activeTargetIndex: number;
  activeGroupId: string | null;
  activeTargetId: string | null;
  cycleCount: number;
  paused: boolean;
}

export interface ActionDefinition {
  id: string;
  label: string;
  phrases: string[];
  icon: string;
  route?: string;
}

export interface UserSettings {
  schemaVersion: 1;
  profileId: string;
  targetSizePx: number;
  scanIntervalMs: number;
  firstItemDelayMs: number;
  pauseAfterCycles: number;
  dwellMs: number;
  contrast: 'normal' | 'high';
  scanAutoPause: boolean;
  headGain: number;
}

export interface LabEntry {
  id: string;
  taskId: string;
  condition: string;
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  errors: number;
  activations: number;
  susScore: number;
}
