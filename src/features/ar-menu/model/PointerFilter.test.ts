import { describe, expect, it } from 'vitest';
import { PointerFilter } from './PointerFilter';

describe('PointerFilter', () => {
  it('calibre une pose neutre au centre et lisse les mouvements', () => {
    const filter = new PointerFilter(1, 0.01, 0.5);
    filter.calibrate({ x: 0.5, y: 0.5 });
    expect(filter.filter({ x: 0.5, y: 0.5 })).toEqual({ x: 0.5, y: 0.5 });
    const moved = filter.filter({ x: 0.3, y: 0.5 });
    expect(moved.x).toBeGreaterThan(0.5);
    expect(moved.x).toBeLessThan(1);
  });
});
