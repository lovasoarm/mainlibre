import type { FacePose, FaceTrackerPort } from '../../core/ports/ports';

export class MouseFaceTracker implements FaceTrackerPort {
  private onPose: ((pose: FacePose | null) => void) | null = null;
  private readonly handleMove = (event: MouseEvent): void => {
    this.onPose?.({ x: 1 - event.clientX / window.innerWidth, y: event.clientY / window.innerHeight });
  };

  async start(onPose: (pose: FacePose | null) => void): Promise<void> {
    this.onPose = onPose;
    window.addEventListener('mousemove', this.handleMove);
  }

  stop(): void {
    window.removeEventListener('mousemove', this.handleMove);
    this.onPose = null;
  }
}
