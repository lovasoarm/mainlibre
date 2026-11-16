import { useSyncExternalStore } from 'react';
import { useLabController } from '../ui/LabProvider';
import { CONDITIONS, TASKS } from './labDefinitions';

export function useLabViewModel() {
  const controller = useLabController();
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  return {
    ...state,
    start: controller.start,
    setCondition: controller.setCondition,
    setTaskId: controller.setTaskId,
    setAnswer: controller.setAnswer,
    finishAndSave: controller.finishAndSave,
    cancel: controller.cancel,
    exportJSON: controller.exportJSON,
    exportCSV: controller.exportCSV,
    canSave: controller.canSave,
    conditions: CONDITIONS,
    tasks: TASKS,
  };
}
