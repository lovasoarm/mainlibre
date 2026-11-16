import { describe, expect, it } from 'vitest';
import { createTestServices } from '../../../test/testServices';
import { LabConditionCoordinator } from './LabConditionCoordinator';

describe('LabConditionCoordinator', () => {
  it('ouvre le clavier par une cible switch puis passe au balayage lignes/éléments', () => {
    const services = createTestServices();
    const coordinator = new LabConditionCoordinator(services);
    coordinator.start({
      taskId: 'write-hello', condition: 'single-switch', startedAt: 0,
      elapsedMs: 0, errors: 0, activations: 0, currentText: '', completed: false,
    });
    expect(services.scanEngine.getSnapshot().mode).toBe('flat');
    expect(services.scanEngine.getSnapshot().activeTargetId).toBe('nav:/keyboard');
    coordinator.openKeyboard();
    expect(services.scanEngine.getSnapshot().mode).toBe('rows');
    expect(services.scanEngine.getSnapshot().phase).toBe('GROUPS');
    expect(services.scanEngine.getSnapshot().activeGroupId).toBe('row-0');
    coordinator.stop();
  });

  it('expose les actions simulées dans le groupe mono-bouton', () => {
    const services = createTestServices();
    const coordinator = new LabConditionCoordinator(services);
    coordinator.start({
      taskId: 'help', condition: 'single-switch', startedAt: 0,
      elapsedMs: 0, errors: 0, activations: 0, currentText: '', completed: false,
    });
    expect(services.scanEngine.getSnapshot().activeTargetId).toBe('call');
    coordinator.stop();
  });
});
