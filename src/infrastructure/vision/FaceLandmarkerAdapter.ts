import { isFaceTrackerErrorCode, type FacePose, type FaceTrackerErrorCode, type FaceTrackerPort } from '../../core/ports/ports';
import { FRAME_INTERVAL_MS, WORKER_READY_TIMEOUT_MS, type WorkerReply } from './faceWorkerProtocol';

export class FaceLandmarkerAdapter implements FaceTrackerPort {
  private stream: MediaStream | null = null;
  private worker: Worker | null = null;
  private video: HTMLVideoElement | null = null;
  private frameId = 0;
  private lastFrameAt = 0;
  private running = false;
  private starting = false;
  private frameInFlight = false;
  private onPose: ((pose: FacePose | null) => void) | null = null;
  private onError: ((code: FaceTrackerErrorCode) => void) | null = null;
  private resolveReady: (() => void) | null = null;
  private rejectReady: ((error: Error) => void) | null = null;
  private readinessTimer: number | null = null;
  private generation = 0;

  async start(
    onPose: (pose: FacePose | null) => void,
    onStream: (stream: unknown) => void,
    onError: (code: FaceTrackerErrorCode) => void,
  ): Promise<void> {
    if (this.running || this.starting) return;
    this.starting = true;
    const generation = ++this.generation;
    this.onPose = onPose;
    this.onError = onError;
    if (!this.isSupported()) {
      this.fail('unsupported');
      return;
    }
    await this.beginTracking(generation, onStream, onError);
  }

  private async beginTracking(
    generation: number,
    onStream: (stream: unknown) => void,
    onError: (code: FaceTrackerErrorCode) => void,
  ): Promise<void> {
    try {
      await this.openCamera(onStream);
      if (!this.isCurrent(generation)) return;
      await this.openWorker();
      if (!this.isCurrent(generation)) return;
      this.startFrameLoop();
    } catch (error) {
      if (generation !== this.generation) return;
      this.stop();
      onError(this.startupError(error));
    }
  }

  private isCurrent(generation: number): boolean {
    if (generation === this.generation) return true;
    this.stop();
    return false;
  }

  private isSupported(): boolean {
    return Boolean(navigator.mediaDevices?.getUserMedia) && typeof Worker !== 'undefined';
  }

  private async openCamera(onStream: (stream: unknown) => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    this.video = document.createElement('video');
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.srcObject = this.stream;
    await this.video.play();
    onStream(this.stream);
  }

  private async openWorker(): Promise<void> {
    const worker = new Worker(new URL('./face.worker.ts', import.meta.url), { type: 'module' });
    this.worker = worker;
    this.bindWorker();
    const ready = this.waitForWorker();
    worker.postMessage({ type: 'init', modelPath: '/models/face_landmarker.task' });
    await ready;
  }

  private startFrameLoop(): void {
    this.starting = false;
    this.running = true;
    this.lastFrameAt = 0;
    this.frameInFlight = false;
    this.frameId = requestAnimationFrame(this.processFrame);
  }

  private startupError(error: unknown): FaceTrackerErrorCode {
    if (error instanceof DOMException && ['NotAllowedError', 'SecurityError'].includes(error.name)) return 'cameraPermission';
    if (error instanceof DOMException && ['NotFoundError', 'NotReadableError', 'OverconstrainedError'].includes(error.name)) return 'cameraUnavailable';
    if (error instanceof Error && isFaceTrackerErrorCode(error.message)) return error.message;
    return 'modelUnavailable';
  }

  stop(): void {
    this.generation += 1;
    this.running = false;
    this.starting = false;
    this.frameInFlight = false;
    const cancelPendingStart = this.rejectReady;
    cancelPendingStart?.(new Error('Initialisation MediaPipe annulée.'));
    this.clearReadinessTimer();
    cancelAnimationFrame(this.frameId);
    this.worker?.postMessage({ type: 'dispose' });
    this.worker?.terminate();
    this.worker = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
    }
    this.video = null;
    this.resolveReady = null;
    this.rejectReady = null;
    this.onPose = null;
    this.onError = null;
  }

  private bindWorker(): void {
    if (!this.worker) return;
    this.worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      const reply = event.data;
      if (reply.type === 'ready') this.resolveReady?.();
      if (reply.type === 'pose') {
        this.frameInFlight = false;
        this.onPose?.(reply.pose ?? null);
      }
      if (reply.type === 'error') {
        this.frameInFlight = false;
        const code = reply.errorCode ?? 'trackingFailed';
        console.error('[MainLibre][RA] ERREUR DU WORKER MEDIAPIPE :', reply.detail ?? code);
        if (this.rejectReady) this.rejectReady(new Error(code));
        else this.fail(code);
      }
    };
    this.worker.onerror = (event: ErrorEvent) => {
      console.error('[MainLibre][RA] ERREUR WORKER :', {
        message: event.message,
        filename: event.filename,
        ligne: event.lineno,
        colonne: event.colno,
        erreur: event.error,
      });
      if (this.rejectReady) this.rejectReady(new Error('workerFailed'));
      else this.fail('workerFailed');
    };
    this.worker.onmessageerror = (event: MessageEvent) => {
      console.error('[MainLibre][RA] ERREUR MESSAGE WORKER :', event);
      if (this.rejectReady) this.rejectReady(new Error('workerFailed'));
      else this.fail('workerFailed');
    };
  }

  private waitForWorker(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.resolveReady = () => {
        this.clearReadinessTimer();
        this.resolveReady = null;
        this.rejectReady = null;
        resolve();
      };
      this.rejectReady = (error) => {
        this.clearReadinessTimer();
        this.resolveReady = null;
        this.rejectReady = null;
        reject(error);
      };
      this.readinessTimer = window.setTimeout(() => {
        this.rejectReady?.(new Error('timeout'));
      }, WORKER_READY_TIMEOUT_MS);
    });
  }

  private readonly processFrame = (now: number): void => {
    if (!this.running || !this.video || !this.worker) return;
    const canCapture = now - this.lastFrameAt >= FRAME_INTERVAL_MS;
    const hasFrame = this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
    if (canCapture && hasFrame && !this.frameInFlight) {
      this.lastFrameAt = now;
      this.frameInFlight = true;
      createImageBitmap(this.video).then((bitmap) => {
        if (!this.running) {
          bitmap.close();
          this.frameInFlight = false;
          return;
        }
        this.worker?.postMessage({ type: 'frame', bitmap, timestamp: now }, [bitmap]);
      }).catch(() => {
        this.fail('trackingFailed');
      });
    }
    this.frameId = requestAnimationFrame(this.processFrame);
  };

  private fail(code: FaceTrackerErrorCode): void {
    const onError = this.onError;
    this.stop();
    onError?.(code);
  }

  private clearReadinessTimer(): void {
    if (this.readinessTimer !== null) window.clearTimeout(this.readinessTimer);
    this.readinessTimer = null;
  }
}
