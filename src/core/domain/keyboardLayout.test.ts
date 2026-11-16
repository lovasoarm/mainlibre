import { describe, expect, it } from 'vitest';
import { createKeyboardGroups, KEY_ROWS } from './keyboardLayout';

describe('keyboard layout', () => {
  it('génère un groupe par ligne et conserve les lettres sans doublon', () => {
    const groups = createKeyboardGroups();
    const letters = groups.flatMap((group) => group.targetIds);
    expect(groups).toHaveLength(KEY_ROWS.length + 1);
    expect(letters).toHaveLength(new Set(letters).size);
    expect(groups[0]?.targetIds[0]).toBe('key:E');
    expect(groups.at(-1)?.targetIds).toEqual(['key:SPACE', 'key:BACKSPACE', 'key:CLEAR']);
  });
});
