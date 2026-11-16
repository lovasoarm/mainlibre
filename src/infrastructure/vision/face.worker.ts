import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceTrackerErrorCode } from '../../core/ports/ports';

interface WorkerInput {
  type: string;
  modelPath?: string;
  wasmBasePath?: string;
  bitmap?: ImageBitmap;
  timestamp?: number;
}

interface WorkerScope {
  onmessage: ((event: MessageEvent<WorkerInput>) => void) | null;
  postMessage(message: unknown): void;
}

type VisionFileset = Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;
type MediaPipeWorkerGlobal = typeof globalThis & {
  ModuleFactory?: unknown;
  Module?: unknown;
};

const workerScope = self as unknown as WorkerScope;
const mediaPipeGlobal = globalThis as MediaPipeWorkerGlobal;
const DEFAULT_WASM_BASE_PATH = '/models/wasm';
let landmarker: FaceLandmarker | null = null;
let lastTimestamp = 0;

/**
 * FilesetResolver returns a fileset that includes wasmLoaderPath. In a module
 * Worker, Tasks Vision tries to dynamically import that path. Vite serves the
 * loader from /public as a static asset, so the generated ?import request is
 * not a valid module request. Fetch the trusted local loader and evaluate its
 * Emscripten glue in the Worker global instead, then remove wasmLoaderPath so
 * Tasks Vision reuses the installed global ModuleFactory instead of importing
 * the loader a second time.
 */
async function resolveWasmRuntime(
  wasmBasePath: string,
): Promise<{ fileset: VisionFileset; loaderSource: string }> {
  const fileset = await FilesetResolver.forVisionTasks(wasmBasePath);
  const loaderPath = fileset.wasmLoaderPath;
  const response = await fetch(loaderPath);

  if (!response.ok) {
    throw new Error(`Chargement du loader WASM impossible (${response.status}) : ${loaderPath}`);
  }

  const loaderSource = await response.text();
  if (!loaderSource.trim()) {
    throw new Error(`Le loader WASM est vide : ${loaderPath}`);
  }

  if (!Reflect.deleteProperty(fileset, 'wasmLoaderPath')) {
    throw new Error('Impossible de désactiver le second chargement du loader WASM.');
  }

  return { fileset, loaderSource };
}

function installWasmFactory(loaderSource: string): void {
  mediaPipeGlobal.ModuleFactory = undefined;
  mediaPipeGlobal.Module = undefined;

  // eslint-disable-next-line no-eval -- trusted local Emscripten glue must run in the Worker global scope
  (0, eval)(loaderSource);

  if (!mediaPipeGlobal.ModuleFactory) {
    throw new Error('Le loader WASM MediaPipe n’a pas exposé ModuleFactory.');
  }
}

function postError(error: unknown, errorCode: FaceTrackerErrorCode): void {
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error('[MainLibre][MediaPipe] Erreur réelle :', detail, error);
  workerScope.postMessage({ type: 'error', errorCode, detail });
}

function disposeLandmarker(): void {
  landmarker?.close();
  landmarker = null;
  lastTimestamp = 0;
}

async function createWithDelegate(
  fileset: VisionFileset,
  loaderSource: string,
  modelAssetPath: string,
  delegate: 'GPU' | 'CPU',
): Promise<FaceLandmarker> {
  installWasmFactory(loaderSource);
  return FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath, delegate },
    runningMode: 'VIDEO',
    numFaces: 1,
  });
}

async function initializeLandmarker(message: WorkerInput): Promise<void> {
  try {
    const wasmBasePath = (message.wasmBasePath ?? DEFAULT_WASM_BASE_PATH).replace(/\/+$/, '');
    const { fileset, loaderSource } = await resolveWasmRuntime(wasmBasePath);
    const modelPath = message.modelPath ?? '/models/face_landmarker.task';

    try {
      landmarker = await createWithDelegate(fileset, loaderSource, modelPath, 'GPU');
    } catch (gpuError) {
      console.warn('[MainLibre][MediaPipe] GPU indisponible, tentative CPU.', gpuError);
      landmarker = await createWithDelegate(fileset, loaderSource, modelPath, 'CPU');
    }

    console.info('[MainLibre][MediaPipe] FaceLandmarker prêt.');
    workerScope.postMessage({ type: 'ready' });
  } catch (error) {
    postError(error, 'modelUnavailable');
  }
}

function sendPose(bitmap: ImageBitmap, timestamp: number): void {
  if (!landmarker) return;
  const safeTimestamp = Math.max(timestamp, lastTimestamp + 1);
  lastTimestamp = safeTimestamp;
  const startedAt = performance.now();
  const result = landmarker.detectForVideo(bitmap, safeTimestamp);
  const inferenceMs = performance.now() - startedAt;
  const nose = result.faceLandmarks[0]?.[1];
  workerScope.postMessage({
    type: 'pose',
    pose: nose ? { x: nose.x, y: nose.y, inferenceMs } : null,
  });
}

function processFrame(message: WorkerInput): void {
  const bitmap = message.bitmap;
  if (!bitmap) return;
  try {
    sendPose(bitmap, message.timestamp ?? performance.now());
  } catch (error) {
    postError(error, 'trackingFailed');
  } finally {
    bitmap.close();
  }
}

async function handleWorkerMessage(event: MessageEvent<WorkerInput>): Promise<void> {
  const message = event.data;
  if (message.type === 'dispose') disposeLandmarker();
  else if (message.type === 'init') await initializeLandmarker(message);
  else if (message.type === 'frame') processFrame(message);
}

workerScope.onmessage = (event) => {
  void handleWorkerMessage(event);
};
