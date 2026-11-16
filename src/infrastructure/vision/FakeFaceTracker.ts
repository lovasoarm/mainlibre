import type { FacePose, FaceTrackerPort } from '../../core/ports/ports';

export class FakeFaceTracker implements FaceTrackerPort {
  private onPose: ((pose: FacePose | null) => void) | null = null;

  async start(onPose: (pose: FacePose | null) => void): Promise<void> {
    this.onPose = onPose;
  }

  emit(pose: FacePose | null): void {
    this.onPose?.(pose);
  }

  stop(): void {
    this.onPose = null;
  }
}
