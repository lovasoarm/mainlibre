import type { IntentSource, ScanGroup, ScanOwner, ScanSnapshot } from '../domain/types';
import type { ClockPort } from '../ports/ports';
import type { EventBus } from './EventBus';

const EMPTY: ScanSnapshot = {
  phase: 'IDLE', mode: 'rows', activeGroupIndex: 0, activeTargetIndex: 0,
  activeGroupId: null, activeTargetId: null, cycleCount: 0, paused: false,
};

export class ScanEngine {
  private groups: ScanGroup[] = [];
  private state: ScanSnapshot = { ...EMPTY };
  private timer: unknown = null;
  private intervalMs = 1800;
  private firstItemDelayMs = 2400;
  private pauseAfterCycles = 3;
  private autoPause = true;
  private owner: ScanOwner | null = null;
  private phaseBeforePause: ScanSnapshot['phase'] | null = null;
  private readonly listeners = new Set<(state: ScanSnapshot) => void>();

  constructor(private readonly bus: EventBus, private readonly clock: ClockPort) {}

  configure(options: { intervalMs: number; firstItemDelayMs: number; pauseAfterCycles: number; autoPause: boolean }): void {
    this.intervalMs = Math.max(400, options.intervalMs);
    this.firstItemDelayMs = Math.max(0, options.firstItemDelayMs);
    this.pauseAfterCycles = Math.max(1, options.pauseAfterCycles);
    this.autoPause = options.autoPause;
    if (this.state.phase !== 'IDLE' && !this.state.paused) this.schedule(this.intervalMs);
  }

  setGroups(groups: ScanGroup[], mode: 'rows' | 'flat' = 'rows', owner: ScanOwner = 'navigation'): void {
    this.clearTimer();
    this.phaseBeforePause = null;
    this.owner = owner;
    this.groups = groups.filter((group) => group.targetIds.length > 0);
    const firstGroup = this.groups[0];
    this.commit({
      ...EMPTY,
      mode,
      activeGroupId: firstGroup?.id ?? null,
      activeTargetId: firstGroup?.targetIds[0] ?? null,
    });
  }

  start(): void {
    if (!this.groups.length || this.state.phase === 'PAUSED') return;
    const phase = this.state.mode === 'rows' ? 'GROUPS' : 'ITEMS';
    this.commit({ ...this.state, phase, paused: false });
    this.schedule(this.intervalMs);
  }

  stop(): void {
    this.clearTimer();
    this.phaseBeforePause = null;
    this.owner = null;
    this.commit({ ...this.state, phase: 'IDLE', paused: false });
  }

  getOwner(): ScanOwner | null { return this.owner; }

  pause(): void {
    if (this.state.phase === 'IDLE' || this.state.phase === 'PAUSED') return;
    this.clearTimer();
    this.phaseBeforePause = this.state.phase;
    this.commit({ ...this.state, phase: 'PAUSED', paused: true });
  }

  resume(): void {
    if (this.state.phase !== 'PAUSED') return;
    const phase = this.phaseBeforePause ?? (this.state.mode === 'rows' ? 'GROUPS' : 'ITEMS');
    this.phaseBeforePause = null;
    this.commit({ ...this.state, phase, paused: false });
    this.schedule(this.intervalMs);
  }

  next(): void {
    this.move(1);
  }

  previous(): void {
    this.move(-1);
  }

  activate(source: IntentSource = 'switch'): void {
    if (this.state.phase === 'IDLE') {
      this.start();
      return;
    }
    if (this.state.phase === 'PAUSED') { this.resume(); return; }
    if (this.state.phase === 'GROUPS') {
      const group = this.groups[this.state.activeGroupIndex];
      if (!group) return;
      this.commit({ ...this.state, phase: 'ITEMS', activeGroupId: group.id, activeTargetIndex: 0, activeTargetId: group.targetIds[0] ?? null });
      this.schedule(this.firstItemDelayMs);
      return;
    }
    if (this.state.phase === 'ITEMS' && this.state.activeTargetId) {
      const selectedTargetId = this.state.activeTargetId;
      this.bus.publish({ type: 'INTENT', intent: { type: 'SELECT', targetId: selectedTargetId }, source, occurredAt: this.clock.now() });
      if (this.state.phase !== 'ITEMS' || this.state.activeTargetId !== selectedTargetId) return;
      this.commit({ ...this.state, phase: 'ACTIVATED' });
      this.schedule(this.intervalMs);
      return;
    }
    if (this.state.phase === 'ACTIVATED') this.commit({ ...this.state, phase: 'ITEMS' });
  }

  getSnapshot(): ScanSnapshot { return this.state; }

  subscribe(listener: (state: ScanSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispose(): void { this.clearTimer(); this.listeners.clear(); }

  private move(direction: 1 | -1): void {
    if (this.state.phase === 'IDLE') {
      this.start();
      return;
    }
    if (this.state.phase === 'PAUSED') {
      this.resume();
      return;
    }
    if (this.state.phase === 'GROUPS') {
      const nextIndex = (this.state.activeGroupIndex + direction + this.groups.length) % this.groups.length;
      this.commit({ ...this.state, activeGroupIndex: nextIndex, activeGroupId: this.groups[nextIndex]?.id ?? null });
    } else {
      const group = this.currentGroup();
      if (!group) return;
      const nextIndex = (this.state.activeTargetIndex + direction + group.targetIds.length) % group.targetIds.length;
      this.commit({ ...this.state, phase: 'ITEMS', activeTargetIndex: nextIndex, activeTargetId: group.targetIds[nextIndex] ?? null });
    }
    this.schedule(this.intervalMs);
  }

  private tick(): void {
    if (this.state.phase === 'GROUPS') {
      const nextIndex = (this.state.activeGroupIndex + 1) % this.groups.length;
      const cycleCount = nextIndex === 0 ? this.state.cycleCount + 1 : this.state.cycleCount;
      this.commit({ ...this.state, activeGroupIndex: nextIndex, activeGroupId: this.groups[nextIndex]?.id ?? null, cycleCount });
      if (this.autoPause && cycleCount > 0 && cycleCount % this.pauseAfterCycles === 0) { this.pause(); return; }
    } else {
      const group = this.currentGroup();
      if (!group) return;
      const nextIndex = this.state.activeTargetIndex + 1;
      if (this.state.mode === 'rows' && nextIndex >= group.targetIds.length) {
        this.commit({ ...this.state, phase: 'GROUPS', activeTargetIndex: 0, activeTargetId: null });
        this.schedule(this.intervalMs);
        return;
      }
      const wrapped = nextIndex >= group.targetIds.length;
      const targetIndex = wrapped ? 0 : nextIndex;
      const cycleCount = this.state.mode === 'flat' && wrapped ? this.state.cycleCount + 1 : this.state.cycleCount;
      this.commit({ ...this.state, phase: 'ITEMS', activeTargetIndex: targetIndex, activeTargetId: group.targetIds[targetIndex] ?? null, cycleCount });
      if (this.autoPause && cycleCount > 0 && cycleCount % this.pauseAfterCycles === 0) { this.pause(); return; }
    }
    this.schedule(this.intervalMs);
  }

  private currentGroup(): ScanGroup | undefined {
    return this.groups.find((group) => group.id === this.state.activeGroupId) ?? this.groups[this.state.activeGroupIndex];
  }

  private schedule(delay: number): void {
    this.clearTimer();
    this.timer = this.clock.setTimeout(() => { this.timer = null; this.tick(); }, delay);
  }

  private clearTimer(): void {
    if (this.timer !== null) this.clock.clearTimeout(this.timer);
    this.timer = null;
  }

  private commit(next: ScanSnapshot): void {
    this.state = next;
    for (const listener of this.listeners) listener(this.getSnapshot());
    this.bus.publish({ type: 'SCAN_CHANGED', snapshot: this.getSnapshot(), occurredAt: this.clock.now() });
  }
}
