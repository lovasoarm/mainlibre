import type { FacePose, FaceTrackerErrorCode } from '../../core/ports/ports';

export interface WorkerReply {
  type: 'ready' | 'pose' | 'error';
  pose?: FacePose | null;
  errorCode?: FaceTrackerErrorCode;
  detail?: string;
}

export const FRAME_INTERVAL_MS = 1000 / 30;
export const WORKER_READY_TIMEOUT_MS = 15000;
