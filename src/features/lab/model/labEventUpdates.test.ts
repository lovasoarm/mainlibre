import { describe, expect, it } from 'vitest';
import { isKeyboardOpenSelection, progressFromEvent } from './labEventUpdates';
import type { LabSession } from './labSessionTypes';

const session: LabSession = {
  taskId: 'write-hello', condition: 'single-switch', startedAt: 0,
  elapsedMs: 0, errors: 0, activations: 0, currentText: '', completed: false,
};

describe('labEventUpdates', () => {
  it('reconnaît la sélection du clavier dans la condition switch', () => {
    expect(isKeyboardOpenSelection({
      type: 'INTENT', intent: { type: 'SELECT', targetId: 'nav:/keyboard' }, source: 'switch', occurredAt: 1,
    }, session)).toBe(true);
  });

  it('compte les erreurs d’action sans terminer une mauvaise tâche', () => {
    const actionSession = { ...session, taskId: 'call' as const };
    const progress = progressFromEvent(actionSession, {
      type: 'ACTION_TRIGGERED', actionId: 'help', label: 'Aide', occurredAt: 1,
    });
    expect(progress?.complete).toBe(false);
    expect(progress?.session.errors).toBe(1);
    expect(progress?.session.activations).toBe(1);
  });

  it('termine la tâche de saisie uniquement sur le texte attendu', () => {
    const progress = progressFromEvent(session, {
      type: 'TEXT_CHANGED', text: 'bonjour', source: 'keyboard', activation: true, occurredAt: 1,
    });
    expect(progress?.complete).toBe(true);
    expect(progress?.session.activations).toBe(1);
  });
});
