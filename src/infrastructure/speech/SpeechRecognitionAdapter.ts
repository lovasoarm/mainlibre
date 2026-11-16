import type { SpeechErrorCode, SpeechPort, SpeechState } from '../../core/ports/ports';

type RecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type RecognitionResultEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type RecognitionErrorEvent = { error: string; message?: string };
type LocalAvailability = 'available' | 'unavailable' | 'downloadable' | 'downloading';
interface LocalAvailabilityOptions { langs: string[]; processLocally: true; }
interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  processLocally?: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
interface RecognitionConstructor {
  new (): RecognitionLike;
  available?: (options: LocalAvailabilityOptions) => Promise<LocalAvailability>;
  install?: (options: LocalAvailabilityOptions) => Promise<boolean>;
}
type SpeechWindow = Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };

const ERROR_CODES: Record<string, SpeechErrorCode> = {
  'not-allowed': 'notAllowed',
  'service-not-allowed': 'serviceNotAllowed',
  'no-speech': 'noSpeech',
  network: 'network',
  'language-not-supported': 'languageNotSupported',
};
const LOCAL_OPTIONS: LocalAvailabilityOptions = { langs: ['fr-FR'], processLocally: true };

export class SpeechRecognitionAdapter implements SpeechPort {
  private recognition: RecognitionLike | null = null;
  private active = false;
  private intentionalStop = false;
  private retryTimer: number | null = null;
  private retryDelay = 600;
  private generation = 0;
  private localAvailable: boolean | null = null;
  private state: SpeechState = { listening: false, transcript: '', error: null, supported: false, localAvailable: null };
  private onState: ((state: SpeechState) => void) | null = null;
  private onPhrase: ((phrase: string) => void) | null = null;

  getSupport(): { supported: boolean; localAvailable: boolean | null } {
    const Constructor = this.getConstructor();
    return { supported: Boolean(Constructor), localAvailable: null };
  }

  start(onState: (state: SpeechState) => void, onPhrase: (phrase: string) => void): void {
    if (this.active) return;
    this.onState = onState;
    this.onPhrase = onPhrase;
    this.intentionalStop = false;
    this.active = true;
    this.retryDelay = 600;
    this.generation += 1;
    void this.createAndStart(this.generation);
  }

  stop(): void {
    this.intentionalStop = true;
    this.active = false;
    this.generation += 1;
    if (this.retryTimer !== null) window.clearTimeout(this.retryTimer);
    this.retryTimer = null;
    try { this.recognition?.stop(); } catch (error) { console.warn('Arrêt vocal déjà effectué.', error); }
    this.recognition = null;
    this.commit({ ...this.state, listening: false });
  }

  private getConstructor(): RecognitionConstructor | undefined {
    const windowWithSpeech = window as SpeechWindow;
    return windowWithSpeech.SpeechRecognition ?? windowWithSpeech.webkitSpeechRecognition;
  }

  private async createAndStart(generation: number): Promise<void> {
    const Constructor = this.getConstructor();
    if (!Constructor) return this.handleUnsupported();
    try {
      this.localAvailable = await this.checkLocalAvailability(Constructor);
      if (!this.active || generation !== this.generation) return;
      if (this.localAvailable !== true) return this.handleLocalUnavailable();
      this.startRecognition(new Constructor());
    } catch {
      this.handleFailure();
    }
  }

  private handleUnsupported(): void {
    this.active = false;
    this.commit({ ...this.state, supported: false, listening: false, error: 'unsupported' });
  }

  private handleLocalUnavailable(): void {
    this.active = false;
    this.commit({
      ...this.state,
      supported: true,
      localAvailable: this.localAvailable,
      listening: false,
      error: 'localUnavailable',
    });
  }

  private startRecognition(recognition: RecognitionLike): void {
    this.recognition = recognition;
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.processLocally = true;
    this.commit({ ...this.state, supported: true, localAvailable: this.localAvailable, error: null });
    recognition.onstart = () => this.commit({ ...this.state, supported: true, listening: true, error: null });
    recognition.onresult = (event) => this.handleResults(event);
    recognition.onerror = (event) => this.handleError(event);
    recognition.onend = () => this.handleEnd();
    recognition.start();
  }

  private async checkLocalAvailability(Constructor: RecognitionConstructor): Promise<boolean | null> {
    if (!Constructor.available) return null;
    try {
      const availability = await Constructor.available(LOCAL_OPTIONS);
      if (availability === 'available') return true;
      if ((availability === 'downloadable' || availability === 'downloading') && Constructor.install) {
        return await Constructor.install(LOCAL_OPTIONS);
      }
      return false;
    } catch (error) {
      console.warn('Disponibilité de la reconnaissance locale non vérifiable.', error);
      return null;
    }
  }

  private handleResults(event: RecognitionResultEvent): void {
    const phrases: string[] = [];
    let transcript = '';
    for (let index = 0; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (!result) continue;
      transcript += `${result[0].transcript} `;
      if (index >= event.resultIndex && result.isFinal) phrases.push(result[0].transcript.trim());
    }
    this.commit({ ...this.state, transcript: transcript.trim(), error: null });
    for (const phrase of phrases) if (phrase) this.onPhrase?.(phrase);
  }

  private handleError(event: RecognitionErrorEvent): void {
    const code = ERROR_CODES[event.error] ?? 'unknown';
    this.commit({ ...this.state, listening: false, error: code });
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'language-not-supported') this.active = false;
  }

  private handleEnd(): void {
    if (!this.active || this.intentionalStop) return;
    const delay = this.retryDelay;
    this.retryDelay = Math.min(5000, this.retryDelay * 1.7);
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = null;
      if (this.active) void this.createAndStart(this.generation);
    }, delay);
  }

  private handleFailure(): void {
    this.active = false;
    this.commit({ ...this.state, listening: false, error: 'recognitionFailed' });
  }

  private commit(next: SpeechState): void {
    this.state = next;
    this.onState?.({ ...next });
  }
}
