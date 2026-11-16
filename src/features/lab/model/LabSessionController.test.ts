import { expect, it } from 'vitest';
import { createTestServices } from '../../../test/testServices';
import { LabSessionController } from './LabSessionController';

it('annule une condition restreinte, arrête le contacteur et restaure les réglages', () => {
  const services = createTestServices();
  const original = services.settings.get();
  const controller = new LabSessionController(services);
  controller.connect();
  controller.setCondition('single-switch');
  controller.setTaskId('call');
  controller.start();

  expect(services.scanEngine.getSnapshot().phase).toBe('ITEMS');
  controller.cancel();

  expect(controller.getSnapshot().session).toBeNull();
  expect(services.scanEngine.getSnapshot().phase).toBe('IDLE');
  expect(services.settings.get()).toEqual(original);
  controller.dispose();
});

it('ne calcule ni n’enregistre de SUS avant la complétion de la tâche et dix réponses', () => {
  const services = createTestServices();
  const controller = new LabSessionController(services);
  controller.connect();
  controller.setCondition('gloves');
  controller.setTaskId('call');
  controller.start();
  for (let index = 0; index < 10; index += 1) controller.setAnswer(index, 5);
  controller.finishAndSave();
  expect(controller.getSnapshot().journal).toHaveLength(0);
  controller.dispose();
});
