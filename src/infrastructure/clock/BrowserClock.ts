import type { ClockPort } from '../../core/ports/ports';

export class BrowserClock implements ClockPort {
  now(): number { return Date.now(); }
  setTimeout(callback: () => void, delayMs: number): number { return window.setTimeout(callback, delayMs); }
  clearTimeout(handle: unknown): void { window.clearTimeout(handle as number); }
}
