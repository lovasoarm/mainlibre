import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { LabSessionController } from '../model/LabSessionController';
import { useServices } from '../../../shared/hooks/services-context';

const LabContext = createContext<LabSessionController | null>(null);

export function LabProvider({ children }: { children: ReactNode }) {
  const services = useServices();
  const controller = useMemo(() => new LabSessionController(services), [services]);
  useEffect(() => {
    controller.connect();
    return () => controller.dispose();
  }, [controller]);
  return <LabContext.Provider value={controller}>{children}</LabContext.Provider>;
}

export function useLabController(): LabSessionController {
  const controller = useContext(LabContext);
  if (!controller) throw new Error('LabProvider manquant.');
  return controller;
}
