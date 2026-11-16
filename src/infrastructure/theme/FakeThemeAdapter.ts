import type { ThemePort } from '../../core/ports/ports';
import type { UserSettings } from '../../core/domain/types';

export class FakeThemeAdapter implements ThemePort {
  settings: UserSettings | null = null;
  reducedMotion = false;
  private readonly listeners = new Set<(reduced: boolean) => void>();

  apply(settings: UserSettings): void {
    this.settings = { ...settings };
  }

  subscribeReducedMotion(callback: (reduced: boolean) => void): () => void {
    this.listeners.add(callback);
    callback(this.reducedMotion);
    return () => this.listeners.delete(callback);
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    for (const listener of this.listeners) listener(reduced);
  }
}
