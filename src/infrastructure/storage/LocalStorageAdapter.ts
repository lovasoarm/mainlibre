import type { StoragePort } from '../../core/ports/ports';

export class LocalStorageAdapter implements StoragePort {
  read(key: string): string | null {
    try { return window.localStorage.getItem(key); }
    catch (error) { console.warn('Stockage local indisponible en lecture.', error); return null; }
  }

  write(key: string, value: string): void {
    try { window.localStorage.setItem(key, value); }
    catch (error) { console.warn('Stockage local indisponible en écriture.', error); }
  }
}
