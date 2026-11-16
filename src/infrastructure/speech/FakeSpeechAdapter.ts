import type { SpeechPort, SpeechState } from '../../core/ports/ports';

export class FakeSpeechAdapter implements SpeechPort {
  private phrase: ((value: string) => void) | null = null;
  getSupport(): { supported: boolean; localAvailable: boolean | null } { return { supported: true, localAvailable: true }; }
  start(onState: (state: SpeechState) => void, onPhrase: (phrase: string) => void): void {
    this.phrase = onPhrase;
    onState({ supported: true, localAvailable: true, listening: true, transcript: '', error: null });
  }
  stop(): void { this.phrase = null; }
  say(value: string): void { this.phrase?.(value); }
}
