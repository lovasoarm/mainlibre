import { EventBus } from '../core/engines/EventBus';
import { ScanEngine } from '../core/engines/ScanEngine';
import { ActionRegistry } from '../core/engines/ActionRegistry';
import { SettingsService } from '../core/engines/SettingsService';
import type { AppServices } from '../shared/hooks/services-context';
import { BrowserClock } from '../infrastructure/clock/BrowserClock';
import { LocalStorageAdapter } from '../infrastructure/storage/LocalStorageAdapter';
import { KeyboardSwitchAdapter } from '../infrastructure/switch/KeyboardSwitchAdapter';
import { SpeechRecognitionAdapter } from '../infrastructure/speech/SpeechRecognitionAdapter';
import { FaceLandmarkerAdapter } from '../infrastructure/vision/FaceLandmarkerAdapter';
import { MouseFaceTracker } from '../infrastructure/vision/MouseFaceTracker';
import { BrowserDownloadAdapter } from '../infrastructure/download/BrowserDownloadAdapter';
import { BrowserThemeAdapter } from '../infrastructure/theme/BrowserThemeAdapter';

const clock = new BrowserClock();
const storage = new LocalStorageAdapter();
const eventBus = new EventBus();
const scanEngine = new ScanEngine(eventBus, clock);
const actionRegistry = new ActionRegistry(eventBus, clock);

export const services: AppServices = {
  clock,
  storage,
  eventBus,
  scanEngine,
  actionRegistry,
  settings: new SettingsService(storage),
  speech: new SpeechRecognitionAdapter(),
  switchInput: new KeyboardSwitchAdapter(),
  faceTracker: new FaceLandmarkerAdapter(),
  mouseTracker: new MouseFaceTracker(),
  download: new BrowserDownloadAdapter(),
  theme: new BrowserThemeAdapter(),
};
