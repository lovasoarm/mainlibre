import { useSyncExternalStore } from 'react';
import type { ScanSnapshot } from '../../core/domain/types';
import { useServices } from './services-context';

export function useScanSnapshot(): ScanSnapshot {
  const { scanEngine } = useServices();
  return useSyncExternalStore(
    (notify) => scanEngine.subscribe(() => notify()),
    () => scanEngine.getSnapshot(),
    () => scanEngine.getSnapshot(),
  );
}
