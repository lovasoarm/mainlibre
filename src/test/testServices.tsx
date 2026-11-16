import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { EventBus } from '../core/engines/EventBus';
import { ScanEngine } from '../core/engines/ScanEngine';
import { ActionRegistry } from '../core/engines/ActionRegistry';
import { SettingsService } from '../core/engines/SettingsService';
import type { AppServices } from '../shared/hooks/services-context';
import { ServicesProvider } from '../shared/hooks/services-context';
import { VoiceProvider } from '../features/voice';
import { LabProvider } from '../features/lab';
import { FakeClock } from './FakeClock';
import { FakeStorage } from '../infrastructure/storage/FakeStorage';
import { FakeSpeechAdapter } from '../infrastructure/speech/FakeSpeechAdapter';
import { FakeSwitchAdapter } from '../infrastructure/switch/FakeSwitchAdapter';
import { FakeFaceTracker } from '../infrastructure/vision/FakeFaceTracker';
import { FakeDownloadAdapter } from '../infrastructure/download/FakeDownloadAdapter';
import { FakeThemeAdapter } from '../infrastructure/theme/FakeThemeAdapter';

export function createTestServices(): AppServices {
  const clock = new FakeClock();
  const storage = new FakeStorage();
  const eventBus = new EventBus();
  const scanEngine = new ScanEngine(eventBus, clock);
  const actionRegistry = new ActionRegistry(eventBus, clock);
  const faceTracker = new FakeFaceTracker();
  return {
    clock,
    storage,
    eventBus,
    scanEngine,
    actionRegistry,
    settings: new SettingsService(storage),
    speech: new FakeSpeechAdapter(),
    switchInput: new FakeSwitchAdapter(),
    faceTracker,
    mouseTracker: faceTracker,
    download: new FakeDownloadAdapter(),
    theme: new FakeThemeAdapter(),
  };
}

export function renderWithServices(element: ReactElement) {
  const services = createTestServices();
  const result = render(
    <MemoryRouter>
      <ServicesProvider services={services}>
        <LabProvider>
          <VoiceProvider>{element}</VoiceProvider>
        </LabProvider>
      </ServicesProvider>
    </MemoryRouter>,
  );
  return { ...result, services };
}
