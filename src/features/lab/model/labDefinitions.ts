import { fr } from '../../../shared/i18n/fr';

export type SimulationCondition = 'hand-attached' | 'gloves' | 'voice-only' | 'single-switch';
export type LabTaskId = 'write-hello' | 'call' | 'help' | 'light';

export const CONDITIONS: { id: SimulationCondition; label: string; instruction: string }[] = [
  { id: 'hand-attached', ...fr.lab.conditions['hand-attached'] },
  { id: 'gloves', ...fr.lab.conditions.gloves },
  { id: 'voice-only', ...fr.lab.conditions['voice-only'] },
  { id: 'single-switch', ...fr.lab.conditions['single-switch'] },
];

export const TASKS: { id: LabTaskId; label: string; expected: string }[] = [
  { id: 'write-hello', ...fr.lab.tasks['write-hello'] },
  { id: 'call', ...fr.lab.tasks.call },
  { id: 'help', ...fr.lab.tasks.help },
  { id: 'light', ...fr.lab.tasks.light },
];

export const SUS_QUESTIONS = fr.lab.susQuestions;

export function calculateSus(answers: number[]): number | null {
  if (answers.length !== 10 || answers.some((value) => !Number.isInteger(value) || value < 1 || value > 5)) return null;
  const sum = answers.reduce((total, answer, index) => total + (index % 2 === 0 ? answer - 1 : 5 - answer), 0);
  return sum * 2.5;
}
