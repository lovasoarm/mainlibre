import { describe, expect, it } from 'vitest';
import { calculateSus } from './labDefinitions';

describe('calculateSus', () => {
  it('calcule 100 pour des réponses parfaitement orientées', () => {
    expect(calculateSus([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100);
  });

  it('ne calcule pas de score si une réponse manque ou sort de l’échelle', () => {
    expect(calculateSus([5, 1, 5, 1, 5, 1, 5, 1, 5])).toBeNull();
    expect(calculateSus([5, 1, 5, 1, 5, 1, 5, 1, 5, 6])).toBeNull();
  });
});
