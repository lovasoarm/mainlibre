import { createContext, useContext, type ReactNode } from 'react';
import type { EventBus } from '../../core/engines/EventBus';
import type { ScanEngine } from '../../core/engines/ScanEngine';
import type { ActionRegistry } from '../../core/engines/ActionRegistry';
import type { SettingsService } from '../../core/engines/SettingsService';
import type { SpeechPort, SwitchPort, FaceTrackerPort, ClockPort, StoragePort, DownloadPort, ThemePort } from '../../core/ports/ports';

export interface AppServices {
  eventBus: EventBus;
  scanEngine: ScanEngine;
  actionRegistry: ActionRegistry;
  settings: SettingsService;
  speech: SpeechPort;
  switchInput: SwitchPort;
  faceTracker: FaceTrackerPort;
  clock: ClockPort;
  storage: StoragePort;
  download: DownloadPort;
  mouseTracker: FaceTrackerPort;
  theme: ThemePort;
}

const ServicesContext = createContext<AppServices | null>(null);

export function ServicesProvider({ services, children }: { services: AppServices; children: ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): AppServices {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('ServicesProvider manquant dans la composition de MainLibre.');
  return services;
}
