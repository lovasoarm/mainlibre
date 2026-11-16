import { describe, expect, it, vi } from 'vitest';
import { EventBus } from './EventBus';
import { ScanEngine } from './ScanEngine';
import { FakeClock } from '../../test/FakeClock';

describe('ScanEngine : parcours et intents', () => {
  it('parcourt les groupes puis les éléments et publie la cible sélectionnée', () => {
    const clock = new FakeClock();
    const bus = new EventBus();
    const engine = new ScanEngine(bus, clock);
    const listener = vi.fn();
    bus.subscribe(listener);
    engine.configure({ intervalMs: 1000, firstItemDelayMs: 500, pauseAfterCycles: 4, autoPause: false });
    engine.setGroups([{ id: 'row-1', targetIds: ['a', 'b'] }, { id: 'row-2', targetIds: ['c'] }], 'rows');
    engine.start();
    expect(engine.getSnapshot().activeGroupId).toBe('row-1');
    engine.activate();
    expect(engine.getSnapshot().activeTargetId).toBe('a');
    clock.advance(500);
    expect(engine.getSnapshot().activeTargetId).toBe('b');
    engine.activate();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      type: 'INTENT', intent: { type: 'SELECT', targetId: 'b' }, source: 'switch',
    }));
    engine.dispose();
  });

});

describe('ScanEngine : contrôle séquentiel', () => {
  it('permet au pilotage vocal de passer à la cible suivante et précédente', () => {
    const clock = new FakeClock();
    const engine = new ScanEngine(new EventBus(), clock);
    engine.configure({ intervalMs: 800, firstItemDelayMs: 400, pauseAfterCycles: 4, autoPause: false });
    engine.setGroups([{ id: 'actions', targetIds: ['call', 'help', 'light'] }], 'flat');
    engine.start();
    engine.next();
    expect(engine.getSnapshot().activeTargetId).toBe('help');
    engine.previous();
    expect(engine.getSnapshot().activeTargetId).toBe('call');
    engine.dispose();
  });

});

describe('ScanEngine : pauses et reprise', () => {
  it('respecte les pauses automatiques et le mode plat', () => {
    const clock = new FakeClock();
    const engine = new ScanEngine(new EventBus(), clock);
    engine.configure({ intervalMs: 400, firstItemDelayMs: 0, pauseAfterCycles: 1, autoPause: true });
    engine.setGroups([{ id: 'actions', targetIds: ['call', 'help'] }], 'flat');
    engine.start();
    clock.advance(400);
    expect(engine.getSnapshot().activeTargetId).toBe('help');
    clock.advance(400);
    expect(engine.getSnapshot().phase).toBe('PAUSED');
    engine.resume();
    expect(engine.getSnapshot().phase).toBe('ITEMS');
    engine.dispose();
  });

});

describe('ScanEngine : pause manuelle', () => {
  it('reprend la phase éléments après une pause manuelle du scanning par lignes', () => {
    const clock = new FakeClock();
    const engine = new ScanEngine(new EventBus(), clock);
    engine.configure({ intervalMs: 1000, firstItemDelayMs: 300, pauseAfterCycles: 8, autoPause: false });
    engine.setGroups([{ id: 'row-1', targetIds: ['a', 'b'] }], 'rows');
    expect(engine.getSnapshot().phase).toBe('IDLE');
    engine.start();
    engine.activate();
    expect(engine.getSnapshot().phase).toBe('ITEMS');
    engine.pause();
    expect(engine.getSnapshot().phase).toBe('PAUSED');
    engine.resume();
    expect(engine.getSnapshot().phase).toBe('ITEMS');
    expect(engine.getSnapshot().activeTargetId).toBe('a');
    engine.dispose();
  });

});

describe('ScanEngine : cycle lignes et éléments', () => {
  it('revient au balayage des groupes après un cycle de touches', () => {
    const clock = new FakeClock();
    const engine = new ScanEngine(new EventBus(), clock);
    engine.configure({ intervalMs: 500, firstItemDelayMs: 500, pauseAfterCycles: 8, autoPause: false });
    engine.setGroups([{ id: 'row-1', targetIds: ['a', 'b'] }, { id: 'row-2', targetIds: ['c'] }], 'rows');
    engine.start();
    engine.activate();
    expect(engine.getSnapshot().activeTargetId).toBe('a');
    clock.advance(500);
    expect(engine.getSnapshot().activeTargetId).toBe('b');
    clock.advance(500);
    expect(engine.getSnapshot().phase).toBe('GROUPS');
    expect(engine.getSnapshot().activeTargetId).toBeNull();
    engine.next();
    expect(engine.getSnapshot().activeGroupId).toBe('row-2');
    engine.activate();
    expect(engine.getSnapshot().activeTargetId).toBe('c');
    engine.dispose();
  });

});

describe('ScanEngine : reconfiguration pendant un événement', () => {
  it('ne remplace pas une nouvelle configuration pendant la publication d’une sélection', () => {
    const bus = new EventBus();
    const engine = new ScanEngine(bus, new FakeClock());
    engine.setGroups([{ id: 'old', targetIds: ['nav:/keyboard'] }], 'flat', 'lab');
    bus.subscribe((event) => {
      if (event.type === 'INTENT' && event.intent.type === 'SELECT') {
        engine.setGroups([{ id: 'keyboard-row', targetIds: ['key:A'] }], 'rows', 'lab');
        engine.start();
      }
    });
    engine.start();
    engine.activate();
    expect(engine.getSnapshot().phase).toBe('GROUPS');
    expect(engine.getSnapshot().activeGroupId).toBe('keyboard-row');
    engine.dispose();
  });

});

describe('ScanEngine : stabilité du snapshot', () => {
  it('conserve la référence du snapshot tant que le moteur ne change pas', () => {
    const engine = new ScanEngine(new EventBus(), new FakeClock());
    expect(engine.getSnapshot()).toBe(engine.getSnapshot());
    engine.setGroups([{ id: 'row-1', targetIds: ['a'] }], 'rows');
    expect(engine.getSnapshot()).toBe(engine.getSnapshot());
    engine.dispose();
  });
});
