import { describe, expect, it, vi } from 'vitest';
import { EventBus } from './EventBus';

describe('EventBus', () => {
  it('notifie les abonnés et permet le désabonnement', () => {
    const bus = new EventBus();
    const listener = vi.fn();
    const unsubscribe = bus.subscribe(listener);
    bus.publish({ type: 'TEXT_CHANGED', text: 'bonjour', source: 'keyboard', activation: true, occurredAt: 1 });
    unsubscribe();
    bus.publish({ type: 'TEXT_CHANGED', text: 'salut', source: 'keyboard', activation: true, occurredAt: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ text: 'bonjour' }));
  });
});
