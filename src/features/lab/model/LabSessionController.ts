import type { AppEvent, LabEntry, UserSettings } from '../../../core/domain/types';
import type { LabSession, LabState } from './labSessionTypes';
import type { AppServices } from '../../../shared/hooks/services-context';
import { fr } from '../../../shared/i18n/fr';
import { calculateSus, type LabTaskId, type SimulationCondition } from './labDefinitions';
import { LabConditionCoordinator } from './LabConditionCoordinator';
import { LAB_JOURNAL_KEY, labJournalToCSV, readLabJournal } from './labJournal';
import { isKeyboardOpenSelection, progressFromEvent } from './labEventUpdates';

export class LabSessionController {
  private state: LabState;
  private readonly listeners = new Set<() => void>();
  private readonly conditions: LabConditionCoordinator;
  private unsubscribe: (() => void) | null = null;
  private timer: unknown = null;
  private originalSettings: UserSettings;
  private entrySequence = 0;

  constructor(private readonly services: AppServices) {
    this.originalSettings = services.settings.get();
    this.conditions = new LabConditionCoordinator(services);
    this.state = {
      condition: 'hand-attached',
      taskId: 'write-hello',
      session: null,
      answers: Array.from({ length: 10 }, () => 0),
      journal: readLabJournal(services.storage.read(LAB_JOURNAL_KEY)),
      savedMessage: '',
    };
  }

  getSnapshot = (): LabState => this.state;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  connect(): void {
    if (this.unsubscribe) return;
    this.unsubscribe = this.services.eventBus.subscribe((event) => this.handleEvent(event));
  }

  disconnect(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.stopTimer();
    if (!this.state.session) return;
    this.conditions.stop();
    this.services.settings.update(this.originalSettings);
    this.publishLabMode('none');
  }

  setCondition = (condition: SimulationCondition): void => {
    if (!this.state.session) this.commit({ ...this.state, condition });
  };

  setTaskId = (taskId: LabTaskId): void => {
    if (!this.state.session) this.commit({ ...this.state, taskId });
  };

  start = (): void => {
    if (this.state.session) return;
    this.stopTimer();
    this.conditions.stop();
    this.originalSettings = this.services.settings.get();
    const session = this.createSession();
    this.commit({ ...this.state, session, answers: Array.from({ length: 10 }, () => 0), savedMessage: '' });
    this.conditions.applySettings(session.condition, this.originalSettings);
    this.conditions.start(session);
    this.publishLabMode(this.conditions.getMode(session.condition));
    this.scheduleTick();
  };

  setAnswer = (index: number, value: number): void => {
    if (index < 0 || index >= 10 || !Number.isInteger(value) || value < 1 || value > 5) return;
    const answers = this.state.answers.map((answer, itemIndex) => itemIndex === index ? value : answer);
    this.commit({ ...this.state, answers });
  };

  cancel = (): void => {
    if (!this.state.session) return;
    this.stopTimer();
    this.conditions.stop();
    this.services.settings.update(this.originalSettings);
    this.commit({ ...this.state, session: null, savedMessage: fr.lab.cancelled });
    this.publishLabMode('none');
  };

  finishAndSave = (): void => {
    const session = this.state.session;
    const susScore = calculateSus(this.state.answers);
    if (!session?.completed || susScore === null) return;
    const entry = this.createEntry(session, susScore);
    const journal = [...this.state.journal, entry];
    this.services.storage.write(LAB_JOURNAL_KEY, JSON.stringify(journal));
    this.commit({ ...this.state, journal, session: null, savedMessage: `${fr.lab.saved} ${susScore}/100.` });
  };

  exportJSON = (): string => JSON.stringify(this.state.journal, null, 2);
  exportCSV = (): string => labJournalToCSV(this.state.journal);

  get canSave(): boolean {
    return Boolean(this.state.session?.completed && calculateSus(this.state.answers) !== null);
  }

  dispose(): void {
    this.disconnect();
    this.listeners.clear();
  }

  private createSession(): LabSession {
    return {
      taskId: this.state.taskId,
      condition: this.state.condition,
      startedAt: this.services.clock.now(),
      elapsedMs: 0,
      errors: 0,
      activations: 0,
      currentText: '',
      completed: false,
    };
  }

  private createEntry(session: LabSession, susScore: number): LabEntry {
    const finishedAt = this.services.clock.now();
    this.entrySequence += 1;
    return {
      id: `${finishedAt}-${session.taskId}-${this.entrySequence}`,
      taskId: session.taskId,
      condition: session.condition,
      startedAt: session.startedAt,
      finishedAt,
      durationMs: session.elapsedMs,
      errors: session.errors,
      activations: session.activations,
      susScore,
    };
  }

  private handleEvent(event: AppEvent): void {
    const session = this.state.session;
    if (!session || session.completed) return;
    if (isSessionCancelIntent(event)) {
      this.cancel();
      return;
    }
    if (isKeyboardOpenSelection(event, session)) {
      this.conditions.openKeyboard();
      this.updateSession({ ...session, activations: session.activations + 1 });
      return;
    }
    const progress = progressFromEvent(session, event);
    if (!progress) return;
    if (progress.complete) this.complete(progress.session);
    else this.updateSession(progress.session);
  }

  private complete(session: LabSession): void {
    const completed = { ...session, completed: true, elapsedMs: this.services.clock.now() - session.startedAt };
    this.updateSession(completed);
    this.stopTimer();
    this.conditions.stop();
    this.services.settings.update(this.originalSettings);
    this.publishLabMode('none');
    this.services.eventBus.publish({ type: 'LAB_TASK_COMPLETED', taskId: completed.taskId, occurredAt: this.services.clock.now() });
  }

  private updateSession(session: LabSession): void {
    this.commit({ ...this.state, session });
  }

  private publishLabMode(mode: 'none' | 'mixed' | 'voice-only' | 'single-switch'): void {
    this.services.eventBus.publish({ type: 'LAB_MODE_CHANGED', mode, occurredAt: this.services.clock.now() });
  }

  private scheduleTick(): void {
    this.timer = this.services.clock.setTimeout(() => {
      const session = this.state.session;
      if (!session || session.completed) return;
      this.updateSession({ ...session, elapsedMs: this.services.clock.now() - session.startedAt });
      this.scheduleTick();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer !== null) this.services.clock.clearTimeout(this.timer);
    this.timer = null;
  }

  private commit(next: LabState): void {
    this.state = next;
    for (const listener of this.listeners) listener();
  }
}

function isSessionCancelIntent(event: AppEvent): boolean {
  if (event.type !== 'INTENT') return false;
  if (event.intent.type === 'BACK' || event.intent.type === 'HOME') return true;
  return event.intent.type === 'SELECT' && event.intent.targetId === 'lab:cancel';
}
