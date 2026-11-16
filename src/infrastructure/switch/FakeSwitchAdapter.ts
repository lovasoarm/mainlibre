import type { SwitchPort } from '../../core/ports/ports';

export class FakeSwitchAdapter implements SwitchPort {
  private callback: (() => void) | null = null;
  start(onPress: () => void): void { this.callback = onPress; }
  stop(): void { this.callback = null; }
  press(): void { this.callback?.(); }
}
