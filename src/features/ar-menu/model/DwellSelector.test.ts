import { describe, expect, it, vi } from 'vitest';
import { DwellSelector } from './DwellSelector';
import { FakeClock } from '../../../test/FakeClock';

describe('DwellSelector', () => {
  it('annule le dwell si la cible change avant le délai', () => {
    const clock = new FakeClock();
    const select = vi.fn();
    const dwell = new DwellSelector(clock, 1500, select);
    dwell.update('help');
    clock.advance(1200);
    dwell.update(null);
    clock.advance(400);
    expect(select).not.toHaveBeenCalled();
    dwell.dispose();
  });

  it('active une cible après la durée complète', () => {
    const clock = new FakeClock();
    const select = vi.fn();
    const dwell = new DwellSelector(clock, 1500, select);
    dwell.update('call');
    clock.advance(1499);
    expect(select).not.toHaveBeenCalled();
    clock.advance(1);
    expect(select).toHaveBeenCalledWith('call');
    dwell.dispose();
  });
});
