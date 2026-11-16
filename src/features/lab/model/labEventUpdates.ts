import type { AppEvent } from '../../../core/domain/types';
import type { LabSession } from './labSessionTypes';

export interface LabProgress {
  session: LabSession;
  complete: boolean;
}

export function progressFromEvent(session: LabSession, event: AppEvent): LabProgress | null {
  if (event.type === 'ACTION_TRIGGERED' && session.taskId !== 'write-hello') {
    const updated = updateLabAction(session, event.actionId);
    return { session: updated, complete: event.actionId === session.taskId };
  }
  if (event.type === 'TEXT_CHANGED' && session.taskId === 'write-hello') {
    const updated = updateLabText(session, event.text, event.activation);
    return { session: updated, complete: updated.currentText.trim().toLocaleLowerCase('fr-FR') === 'bonjour' };
  }
  return null;
}

function updateLabAction(session: LabSession, actionId: string): LabSession {
  return {
    ...session,
    activations: session.activations + 1,
    errors: session.errors + Number(actionId !== session.taskId),
  };
}

function updateLabText(session: LabSession, text: string, activation: boolean): LabSession {
  const normalized = text.trim().toLocaleLowerCase('fr-FR');
  const wrongLength = normalized.length >= 'bonjour'.length && normalized !== 'bonjour';
  const addedError = wrongLength && session.currentText.length < normalized.length;
  return {
    ...session,
    currentText: text,
    activations: session.activations + Number(activation),
    errors: session.errors + Number(addedError),
  };
}

export function isKeyboardOpenSelection(event: AppEvent, session: LabSession): boolean {
  return session.condition === 'single-switch'
    && session.taskId === 'write-hello'
    && event.type === 'INTENT'
    && event.intent.type === 'SELECT'
    && event.intent.targetId === 'nav:/keyboard';
}
