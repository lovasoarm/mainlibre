import type { UserSettings } from '../domain/types';

export interface StoragePort {
  read(key: string): string | null;
  write(key: string, value: string): void;
}

export interface ClockPort {
  now(): number;
  setTimeout(callback: () => void, delayMs: number): unknown;
  clearTimeout(handle: unknown): void;
}

export type SpeechErrorCode =
  | 'unsupported'
  | 'localUnavailable'
  | 'notAllowed'
  | 'serviceNotAllowed'
  | 'noSpeech'
  | 'network'
  | 'languageNotSupported'
  | 'recognitionFailed'
  | 'unknown';

export interface SpeechState {
  listening: boolean;
  transcript: string;
  error: SpeechErrorCode | null;
  supported: boolean;
  localAvailable: boolean | null;
}

export interface SpeechPort {
  getSupport(): { supported: boolean; localAvailable: boolean | null };
  start(onState: (state: SpeechState) => void, onPhrase: (phrase: string) => void): void;
  stop(): void;
}

export interface FacePose {
  x: number;
  y: number;
  inferenceMs?: number;
}

export type FaceTrackerErrorCode =
  | 'unsupported'
  | 'cameraPermission'
  | 'cameraUnavailable'
  | 'modelUnavailable'
  | 'trackingFailed'
  | 'workerFailed'
  | 'timeout'
  | 'unknown';

export interface FaceTrackerPort {
  start(onPose: (pose: FacePose | null) => void, onStream: (stream: unknown) => void, onError: (code: FaceTrackerErrorCode) => void): Promise<void>;
  stop(): void;
}

export interface SwitchPort {
  start(onPress: () => void): void;
  stop(): void;
}

export interface DownloadPort {
  save(filename: string, content: string, mimeType: string): void;
}

export interface ThemePort {
  apply(settings: UserSettings): void;
  subscribeReducedMotion(callback: (reduced: boolean) => void): () => void;
}

export function isFaceTrackerErrorCode(value: string): value is FaceTrackerErrorCode {
  return ['unsupported', 'cameraPermission', 'cameraUnavailable', 'modelUnavailable', 'trackingFailed', 'workerFailed', 'timeout', 'unknown'].includes(value);
}
