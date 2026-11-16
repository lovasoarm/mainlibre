import { ACTIONS } from '../domain/actions';
import type { ActionDefinition, IntentSource } from '../domain/types';
import type { EventBus } from './EventBus';
import type { ClockPort } from '../ports/ports';

export class ActionRegistry {
  private readonly actions = new Map<string, ActionDefinition>(
    ACTIONS.map((action) => [action.id, action]),
  );

  constructor(
    private readonly bus: EventBus,
    private readonly clock: ClockPort,
  ) {}

  list(): ActionDefinition[] {
    return [...this.actions.values()];
  }

  get(actionId: string): ActionDefinition | undefined {
    return this.actions.get(actionId);
  }

  request(actionId: string, source: IntentSource = 'ui'): boolean {
    if (!this.actions.has(actionId)) return false;
    this.bus.publish({
      type: 'INTENT',
      intent: { type: 'TRIGGER_ACTION', actionId },
      source,
      occurredAt: this.clock.now(),
    });
    return true;
  }

  dispatch(actionId: string, source: IntentSource = 'ui'): boolean {
    const action = this.actions.get(actionId);
    if (!action) return false;
    const occurredAt = this.clock.now();
    this.bus.publish({ type: 'ACTION_TRIGGERED', actionId, label: action.label, occurredAt });
    if (action.route) {
      this.bus.publish({
        type: 'INTENT',
        intent: { type: 'OPEN', route: action.route },
        source,
        occurredAt,
      });
    }
    return true;
  }
}
