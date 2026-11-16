import { describe, expect, it } from 'vitest';
import { ActionRegistry } from './ActionRegistry';
import { EventBus } from './EventBus';
import { FakeClock } from '../../test/FakeClock';

describe('ActionRegistry', () => {
  it('publie une intention avant de produire un événement métier', () => {
    const bus = new EventBus();
    const registry = new ActionRegistry(bus, new FakeClock());
    const events: string[] = [];
    bus.subscribe((event) => {
      if (event.type === 'INTENT' && event.intent.type === 'TRIGGER_ACTION') events.push('intent');
      if (event.type === 'ACTION_TRIGGERED') events.push('action');
    });

    expect(registry.request('help', 'ui')).toBe(true);
    expect(events).toEqual(['intent']);
    expect(registry.dispatch('help', 'ui')).toBe(true);
    expect(events).toEqual(['intent', 'action']);
    expect(registry.request('missing', 'ui')).toBe(false);
  });
});
