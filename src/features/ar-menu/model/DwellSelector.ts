import type { ClockPort } from '../../../core/ports/ports';

export class DwellSelector {
  private targetId: string | null = null;
  private timer: unknown = null;
  private readonly listeners = new Set<(targetId: string | null) => void>();

  constructor(private readonly clock: ClockPort, private readonly durationMs: number, private readonly onSelect: (targetId: string) => void) {}

  update(targetId: string | null): void {
    if (targetId === this.targetId) return;
    this.clearTimer();
    this.targetId = targetId;
    this.notify();
    if (!targetId) return;
    const scheduledTarget = targetId;
    this.timer = this.clock.setTimeout(() => {
      this.timer = null;
      if (this.targetId === scheduledTarget) this.onSelect(scheduledTarget);
    }, this.durationMs);
  }

  getTarget(): string | null { return this.targetId; }

  subscribe(listener: (targetId: string | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispose(): void { this.clearTimer(); this.targetId = null; this.listeners.clear(); }

  private clearTimer(): void { if (this.timer !== null) this.clock.clearTimeout(this.timer); this.timer = null; }
  private notify(): void { for (const listener of this.listeners) listener(this.targetId); }
}
