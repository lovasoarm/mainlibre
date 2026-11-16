import type { LabEntry } from '../../../core/domain/types';

export const LAB_JOURNAL_KEY = 'mainlibre.lab-journal.v1';

function isLabEntry(value: unknown): value is LabEntry {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item['id'] === 'string'
    && typeof item['taskId'] === 'string'
    && typeof item['condition'] === 'string'
    && typeof item['startedAt'] === 'number'
    && typeof item['finishedAt'] === 'number'
    && typeof item['durationMs'] === 'number'
    && typeof item['errors'] === 'number'
    && typeof item['activations'] === 'number'
    && isFiniteNumber(item['startedAt'])
    && isFiniteNumber(item['finishedAt'])
    && isFiniteNumber(item['durationMs'])
    && isFiniteNumber(item['errors'])
    && isFiniteNumber(item['activations'])
    && isFiniteNumber(item['susScore'])
    && item['durationMs'] >= 0
    && item['errors'] >= 0
    && item['activations'] >= 0
    && item['susScore'] >= 0
    && item['susScore'] <= 100;
}

export function readLabJournal(raw: string | null): LabEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isLabEntry) : [];
  } catch (error) {
    console.warn('Journal du labo illisible : il sera réinitialisé.', error);
    return [];
  }
}

function csvCell(value: string | number): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function labJournalToCSV(entries: LabEntry[]): string {
  const header = 'id,task,condition,startedAt,finishedAt,durationMs,errors,activations,susScore';
  const rows = entries.map((entry) => [
    entry.id, entry.taskId, entry.condition, entry.startedAt, entry.finishedAt,
    entry.durationMs, entry.errors, entry.activations, entry.susScore,
  ].map(csvCell).join(','));
  return [header, ...rows].join('\n');
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
