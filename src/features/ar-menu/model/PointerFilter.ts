import type { FacePose } from '../../../core/ports/ports';

export interface PointerPosition { x: number; y: number; }

export class PointerFilter {
  private neutral: PointerPosition = { x: 0.5, y: 0.5 };
  private previous: PointerPosition = { x: 0.5, y: 0.5 };

  constructor(private gain: number, private readonly deadZone: number, private readonly smoothing: number) {}

  setGain(gain: number): void { this.gain = gain; }

  calibrate(pose: FacePose): void {
    this.neutral = { x: 1 - pose.x, y: pose.y };
    this.previous = { x: 0.5, y: 0.5 };
  }

  filter(pose: FacePose): PointerPosition {
    const raw = { x: 1 - pose.x, y: pose.y };
    const deltaX = Math.abs(raw.x - this.neutral.x) < this.deadZone ? 0 : raw.x - this.neutral.x;
    const deltaY = Math.abs(raw.y - this.neutral.y) < this.deadZone ? 0 : raw.y - this.neutral.y;
    const target = { x: clamp(0.5 + deltaX * this.gain), y: clamp(0.5 + deltaY * this.gain) };
    this.previous = {
      x: this.previous.x + (target.x - this.previous.x) * this.smoothing,
      y: this.previous.y + (target.y - this.previous.y) * this.smoothing,
    };
    return { ...this.previous };
  }
}

function clamp(value: number): number { return Math.min(1, Math.max(0, value)); }
