import { useEffect } from 'react';
import { useServices } from '../../../shared/hooks/services-context';
import { useScanSnapshot } from '../../../shared/hooks/useScanSnapshot';
import { useSettings } from '../../../shared/hooks/useSettings';
import { createKeyboardGroups } from '../../../core/domain/keyboardLayout';
import type { ActionDefinition } from '../../../core/domain/types';

const NAV_TARGETS = ['/', '/voice', '/scan', '/keyboard', '/ar', '/lab', '/profile'].map((path) => `nav:${path}`);

export function useScanNavViewModel(mode: 'navigation' | 'keyboard' | 'hub' = 'navigation') {
  const { scanEngine, switchInput, actionRegistry } = useServices();
  const { value } = useSettings();
  const snapshot = useScanSnapshot();
  useEffect(() => {
    scanEngine.configure({ intervalMs: value.scanIntervalMs, firstItemDelayMs: value.firstItemDelayMs, pauseAfterCycles: value.pauseAfterCycles, autoPause: value.scanAutoPause });
  }, [scanEngine, value.scanIntervalMs, value.firstItemDelayMs, value.pauseAfterCycles, value.scanAutoPause]);
  useEffect(() => {
    if (scanEngine.getOwner() === 'lab') return;
    const current = scanEngine.getSnapshot();
    if (current.phase !== 'IDLE') {
      const wasPaused = current.phase === 'PAUSED';
      scanEngine.setGroups(getGroups(mode, actionRegistry.list()), mode === 'keyboard' ? 'rows' : 'flat', getOwner(mode));
      scanEngine.start();
      if (wasPaused) scanEngine.pause();
      return;
    }
    scanEngine.setGroups(getGroups(mode, actionRegistry.list()), mode === 'keyboard' ? 'rows' : 'flat', getOwner(mode));
  }, [actionRegistry, mode, scanEngine]);
  const start = () => {
    scanEngine.setGroups(getGroups(mode, actionRegistry.list()), mode === 'keyboard' ? 'rows' : 'flat', getOwner(mode));
    scanEngine.start();
    switchInput.start(() => scanEngine.activate());
  };
  const stop = () => { switchInput.stop(); scanEngine.stop(); };
  const togglePause = () => snapshot.paused ? scanEngine.resume() : scanEngine.pause();
  return { snapshot, start, stop, togglePause, isRunning: snapshot.phase !== 'IDLE', navTargets: NAV_TARGETS };
}

function getGroups(mode: 'navigation' | 'keyboard' | 'hub', actionList: ActionDefinition[]) {
  if (mode === 'keyboard') return createKeyboardGroups();
  const actionTargets = actionList.filter((action) => !action.route).map((action) => action.id);
  return [{ id: 'global-navigation', targetIds: [...NAV_TARGETS, ...actionTargets] }];
}

function getOwner(mode: 'navigation' | 'keyboard' | 'hub') {
  return mode === 'keyboard' ? 'keyboard' as const : 'navigation' as const;
}
