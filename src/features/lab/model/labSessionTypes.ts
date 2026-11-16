import type { LabEntry } from '../../../core/domain/types';
import type { SimulationCondition, LabTaskId } from './labDefinitions';

export interface LabSession {
  taskId: LabTaskId;
  condition: SimulationCondition;
  startedAt: number;
  elapsedMs: number;
  errors: number;
  activations: number;
  currentText: string;
  completed: boolean;
}

export interface LabState {
  condition: SimulationCondition;
  taskId: LabTaskId;
  session: LabSession | null;
  answers: number[];
  journal: LabEntry[];
  savedMessage: string;
}
