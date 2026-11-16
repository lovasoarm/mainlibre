import type { UserSettings } from '../../../core/domain/types';
import type { AppServices } from '../../../shared/hooks/services-context';
import { createKeyboardGroups } from '../../../core/domain/keyboardLayout';
import type { SimulationCondition } from './labDefinitions';
import type { LabSession } from './labSessionTypes';

export class LabConditionCoordinator {
  constructor(private readonly services: AppServices) {}

  applySettings(condition: SimulationCondition, original: UserSettings): void {
    this.services.settings.update({
      targetSizePx: condition === 'gloves' ? 80 : original.targetSizePx,
      scanIntervalMs: condition === 'hand-attached' ? 2400 : original.scanIntervalMs,
    });
  }

  start(session: LabSession): void {
    if (session.condition !== 'single-switch') return;
    this.configureScan();
    if (session.taskId === 'write-hello') {
      this.services.scanEngine.setGroups([{ id: 'lab-open-keyboard', targetIds: ['nav:/keyboard'] }], 'flat', 'lab');
    } else {
      this.services.scanEngine.setGroups(this.actionGroups(), 'flat', 'lab');
    }
    this.services.scanEngine.start();
    this.services.switchInput.start(() => this.services.scanEngine.activate());
  }

  openKeyboard(): void {
    this.services.scanEngine.setGroups([...createKeyboardGroups(), { id: 'lab-controls', targetIds: ['lab:cancel'] }], 'rows', 'lab');
    this.services.scanEngine.start();
  }

  stop(): void {
    this.services.switchInput.stop();
    this.services.scanEngine.stop();
  }

  getMode(condition: SimulationCondition): 'mixed' | 'voice-only' | 'single-switch' {
    if (condition === 'voice-only') return 'voice-only';
    if (condition === 'single-switch') return 'single-switch';
    return 'mixed';
  }

  private actionGroups() {
    const targetIds = this.services.actionRegistry.list()
      .filter((action) => action.id === 'call' || action.id === 'help' || action.id === 'light')
      .map((action) => action.id);
    return [{ id: 'lab-actions', targetIds: [...targetIds, 'lab:cancel'] }];
  }

  private configureScan(): void {
    const settings = this.services.settings.get();
    this.services.scanEngine.configure({
      intervalMs: settings.scanIntervalMs,
      firstItemDelayMs: settings.firstItemDelayMs,
      pauseAfterCycles: settings.pauseAfterCycles,
      autoPause: settings.scanAutoPause,
    });
  }
}
