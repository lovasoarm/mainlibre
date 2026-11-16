import type { ClockPort } from '../core/ports/ports';

interface TimerEntry {
  id: number;
  dueAt: number;
  callback: () => void;
}

export class FakeClock implements ClockPort {
  private currentTime = 0;
  private nextId = 1;
  private readonly timers = new Map<number, TimerEntry>();

  now(): number { return this.currentTime; }

  setTimeout(callback: () => void, delayMs: number): number {
    const id = this.nextId;
    this.nextId += 1;
    this.timers.set(id, { id, dueAt: this.currentTime + Math.max(0, delayMs), callback });
    return id;
  }

  clearTimeout(handle: unknown): void {
    if (typeof handle === 'number') this.timers.delete(handle);
  }

  advance(milliseconds: number): void {
    const targetTime = this.currentTime + milliseconds;
    while (true) {
      const next = [...this.timers.values()]
        .filter((timer) => timer.dueAt <= targetTime)
        .sort((left, right) => left.dueAt - right.dueAt || left.id - right.id)[0];
      if (!next) break;
      this.currentTime = next.dueAt;
      this.timers.delete(next.id);
      next.callback();
    }
    this.currentTime = targetTime;
  }
}
