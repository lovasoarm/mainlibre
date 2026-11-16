import type { AppEvent } from '../domain/types';

export type EventListener = (event: AppEvent) => void;

export class EventBus {
  private readonly listeners = new Set<EventListener>();

  publish(event: AppEvent): void {
    for (const listener of this.listeners) listener(event);
  }

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
