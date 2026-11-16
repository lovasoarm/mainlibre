import { describe, expect, it } from 'vitest';
import { ACTIONS } from '../../../core/domain/actions';
import { VoiceMatcher, normalizeSpeech } from './VoiceMatcher';

describe('VoiceMatcher', () => {
  it('normalise les accents et la casse', () => {
    expect(normalizeSpeech('  J’AI besoin D’AIDE ! ')).toBe('j ai besoin d aide');
  });

  it('reconnaît une commande exacte et un synonyme, sans accepter du texte vide', () => {
    const matcher = new VoiceMatcher();
    expect(matcher.match('Allumer la lumière', ACTIONS)).toBe('light');
    expect(matcher.match('téléphoner', ACTIONS)).toBe('call');
    expect(matcher.match('   ', ACTIONS)).toBeNull();
  });
});
