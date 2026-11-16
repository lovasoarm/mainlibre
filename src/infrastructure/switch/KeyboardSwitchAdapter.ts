import type { SwitchPort } from '../../core/ports/ports';

export class KeyboardSwitchAdapter implements SwitchPort {
  private active = false;
  private onPress: (() => void) | null = null;
  private readonly handleKey = (event: KeyboardEvent): void => {
    if (!this.active || event.repeat || (event.code !== 'Space' && event.key !== 'Enter')) return;
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"], [data-switch-control]')) return;
    event.preventDefault();
    event.stopPropagation();
    this.onPress?.();
  };

  start(onPress: () => void): void {
    if (this.active) return;
    this.active = true;
    this.onPress = onPress;
    window.addEventListener('keydown', this.handleKey, true);
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    this.onPress = null;
    window.removeEventListener('keydown', this.handleKey, true);
  }
}
