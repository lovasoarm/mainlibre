import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { VoiceController } from '../model/VoiceController';
import { useServices } from '../../../shared/hooks/services-context';

const VoiceContext = createContext<VoiceController | null>(null);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const { speech, eventBus, actionRegistry, clock } = useServices();
  const controller = useMemo(() => new VoiceController(speech, eventBus, actionRegistry, clock), [speech, eventBus, actionRegistry, clock]);
  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event) => {
      if (event.type === 'LAB_MODE_CHANGED' && event.mode === 'single-switch') controller.stop();
    });
    return () => { unsubscribe(); controller.stop(); };
  }, [controller, eventBus]);
  return <VoiceContext.Provider value={controller}>{children}</VoiceContext.Provider>;
}

export function useVoiceController() {
  const controller = useContext(VoiceContext);
  if (!controller) throw new Error('VoiceProvider manquant.');
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  return { controller, state };
}
