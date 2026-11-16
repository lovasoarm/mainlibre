import type { ThemePort } from '../../core/ports/ports';
import type { UserSettings } from '../../core/domain/types';

export class BrowserThemeAdapter implements ThemePort {
  apply(settings: UserSettings): void {
    const root = document.documentElement;
    root.dataset['contrast'] = settings.contrast;
    root.style.setProperty('--target-size', `${settings.targetSizePx}px`);
  }

  subscribeReducedMotion(callback: (reduced: boolean) => void): () => void {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const notify = () => {
      document.documentElement.dataset['motion'] = preference.matches ? 'reduced' : 'normal';
      callback(preference.matches);
    };
    notify();
    preference.addEventListener('change', notify);
    return () => preference.removeEventListener('change', notify);
  }
}
