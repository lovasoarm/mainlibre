import type { ActionDefinition } from '../../../core/domain/types';

export function normalizeSpeech(value: string): string {
  return value.toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

export class VoiceMatcher {
  match(phrase: string, actions: ActionDefinition[]): string | null {
    const normalized = normalizeSpeech(phrase);
    if (!normalized) return null;
    let bestId: string | null = null;
    let bestScore = 0;
    for (const action of actions) {
      const candidates = [action.label, ...action.phrases];
      for (const candidate of candidates) {
        const command = normalizeSpeech(candidate);
        const score = normalized === command ? 1 : normalized.includes(command) || command.includes(normalized) ? 0.88 : tokenSimilarity(normalized, command);
        if (score > bestScore) { bestScore = score; bestId = action.id; }
      }
    }
    return bestScore >= 0.72 ? bestId : null;
  }
}

function tokenSimilarity(left: string, right: string): number {
  const leftTokens = new Set(left.split(' '));
  const rightTokens = new Set(right.split(' '));
  const overlap = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return overlap / Math.max(leftTokens.size, rightTokens.size, 1);
}
