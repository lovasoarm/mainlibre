import type { Intent } from '../../../core/domain/types';
import type { ClockPort, SpeechPort, SpeechState } from '../../../core/ports/ports';
import type { EventBus } from '../../../core/engines/EventBus';
import type { ActionRegistry } from '../../../core/engines/ActionRegistry';
import { VoiceMatcher, normalizeSpeech } from './VoiceMatcher';

export class VoiceController {
  private state: SpeechState;
  private readonly listeners = new Set<() => void>();
  private readonly matcher = new VoiceMatcher();

  constructor(
    private readonly speech: SpeechPort,
    private readonly bus: EventBus,
    private readonly actions: ActionRegistry,
    private readonly clock: ClockPort,
  ) {
    const support = speech.getSupport();
    this.state = { supported: support.supported, localAvailable: support.localAvailable, listening: false, transcript: '', error: null };
  }

  getSnapshot = (): SpeechState => this.state;
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };

  start(): void {
    this.speech.start((state) => this.commit(state), (phrase) => this.handlePhrase(phrase));
  }

  stop(): void { this.speech.stop(); }

  private handlePhrase(phrase: string): void {
    const actionId = this.matcher.match(phrase, this.actions.list());
    if (actionId) {
      this.actions.request(actionId, 'voice');
      return;
    }
    const normalized = normalizeSpeech(phrase);
    const intents: Record<string, Intent> = {
      suivant: { type: 'NEXT' }, precedent: { type: 'PREVIOUS' }, selectionner: { type: 'SELECT' },
      valider: { type: 'SELECT' }, retour: { type: 'BACK' }, quitter: { type: 'BACK' },
      accueil: { type: 'HOME' },
    };
    const intent = intents[normalized];
    if (intent) {
      this.bus.publish({ type: 'INTENT', intent, source: 'voice', occurredAt: this.clock.now() });
      return;
    }
    this.bus.publish({ type: 'TEXT_CHANGED', text: phrase.trim(), source: 'voice', activation: true, occurredAt: this.clock.now() });
    this.commit({ ...this.state, transcript: phrase.trim(), error: null });
  }

  private commit(next: SpeechState): void {
    this.state = { ...next };
    for (const listener of this.listeners) listener();
  }
}
