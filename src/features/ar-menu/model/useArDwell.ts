import { useEffect, useMemo, useState } from 'react';
import type { ClockPort } from '../../../core/ports/ports';
import type { EventBus } from '../../../core/engines/EventBus';
import { DwellSelector } from './DwellSelector';

export function useArDwell(clock: ClockPort, dwellMs: number, eventBus: EventBus) {
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const dwell = useMemo(() => new DwellSelector(clock, dwellMs, (targetId) => {
    eventBus.publish({ type: 'INTENT', intent: { type: 'SELECT', targetId }, source: 'head', occurredAt: clock.now() });
  }), [clock, dwellMs, eventBus]);
  useEffect(() => dwell.subscribe(setActiveTarget), [dwell]);
  useEffect(() => () => dwell.dispose(), [dwell]);
  return { dwell, activeTarget };
}
