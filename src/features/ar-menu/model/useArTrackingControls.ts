import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { isFaceTrackerErrorCode, type FacePose, type FaceTrackerErrorCode, type FaceTrackerPort } from '../../../core/ports/ports';
import { fr } from '../../../shared/i18n/fr';
import type { DwellSelector } from './DwellSelector';
import type { PointerFilter } from './PointerFilter';

interface TrackingRefs {
  videoRef: RefObject<HTMLVideoElement | null>;
  cursorRef: RefObject<HTMLDivElement | null>;
  lastPose: MutableRefObject<FacePose | null>;
  calibrated: MutableRefObject<boolean>;
}

interface TrackingOptions {
  faceTracker: FaceTrackerPort;
  mouseTracker: FaceTrackerPort;
  refs: TrackingRefs;
  filter: PointerFilter;
  dwell: DwellSelector;
  acceptPose: (pose: FacePose | null) => void;
  setInferenceMs: (value: number | null) => void;
}

export function useArTrackingControls(options: TrackingOptions) {
  const [mode, setMode] = useState<'camera' | 'mouse' | null>(null);
  const [tracking, setTracking] = useState(false);
  const [starting, setStarting] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [error, setError] = useState('');
  const lastRequest = useRef(0);
  const stop = useCallback(() => stopTracking(options, lastRequest, setMode, setTracking, setStarting, setCalibrated), [options]);
  const startCamera = useCallback(() => runCamera(options, lastRequest, setError, setMode, setTracking, setStarting, setCalibrated), [options]);
  const startMouse = useCallback(() => runMouse(options, lastRequest, setError, setMode, setTracking, setStarting, setCalibrated), [options]);
  const calibrate = useCallback(() => calibrateHead(options, setCalibrated, setError), [options]);
  useEffect(() => () => stop(), [stop]);
  return { mode, tracking, starting, calibrated, error, startCamera, startMouse, stop, calibrate };
}

async function runCamera(options: TrackingOptions, requestRef: MutableRefObject<number>, setError: (value: string) => void, setMode: (value: 'camera' | 'mouse' | null) => void, setTracking: (value: boolean) => void, setStarting: (value: boolean) => void, setCalibrated: (value: boolean) => void): Promise<void> {
  const requestId = prepareStart(options, requestRef, 'camera', setError, setMode, setTracking, setStarting, setCalibrated);
  let failed = false;
  try {
    await options.faceTracker.start(options.acceptPose, (stream) => showStream(options, requestRef, requestId, stream, setError), (code) => { failed = true; if (requestRef.current === requestId) { setError(faceError(code)); setTracking(false); setStarting(false); setMode(null); } });
    if (requestRef.current === requestId && !failed) setTracking(true);
  } catch (reason) {
    if (requestRef.current === requestId) { setMode(null); setError(reason instanceof Error && isFaceTrackerErrorCode(reason.message) ? fr.ar.errors[reason.message] : fr.ar.errors.headUnavailable); }
  } finally {
    if (requestRef.current === requestId) setStarting(false);
  }
  if (requestRef.current === requestId && failed) setMode(null);
}

async function runMouse(options: TrackingOptions, requestRef: MutableRefObject<number>, setError: (value: string) => void, setMode: (value: 'camera' | 'mouse' | null) => void, setTracking: (value: boolean) => void, setStarting: (value: boolean) => void, setCalibrated: (value: boolean) => void): Promise<void> {
  const requestId = prepareStart(options, requestRef, 'mouse', setError, setMode, setTracking, setStarting, setCalibrated);
  setCalibrated(true);
  options.refs.calibrated.current = true;
  options.filter.calibrate({ x: 0.5, y: 0.5 });
  try {
    await options.mouseTracker.start(options.acceptPose, () => undefined, (code) => { if (requestRef.current === requestId) setError(faceError(code)); });
    if (requestRef.current === requestId) setTracking(true);
  } catch (reason) {
    if (requestRef.current === requestId) { setMode(null); setError(reason instanceof Error && isFaceTrackerErrorCode(reason.message) ? fr.ar.errors[reason.message] : fr.ar.errors.mouseUnavailable); }
  } finally {
    if (requestRef.current === requestId) setStarting(false);
  }
}

function prepareStart(options: TrackingOptions, requestRef: MutableRefObject<number>, mode: 'camera' | 'mouse', setError: (value: string) => void, setMode: (value: 'camera' | 'mouse' | null) => void, setTracking: (value: boolean) => void, setStarting: (value: boolean) => void, setCalibrated: (value: boolean) => void): number {
  const requestId = ++requestRef.current;
  options.faceTracker.stop(); options.mouseTracker.stop();
  options.dwell.update(null); options.refs.calibrated.current = false; options.refs.lastPose.current = null;
  setError(''); setMode(mode); setTracking(false); setStarting(true); setCalibrated(false);
  return requestId;
}

function showStream(options: TrackingOptions, requestRef: MutableRefObject<number>, requestId: number, stream: unknown, setError: (value: string) => void): void {
  if (requestRef.current !== requestId) return;
  const video = options.refs.videoRef.current;
  if (!video) return;

  const mediaStream = stream as MediaStream;
  // The preview is muted and explicitly autoplay-enabled. In Firefox, calling
  // play() immediately after assigning srcObject can race the media metadata load.
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.srcObject = mediaStream;

  const playPreview = () => {
    if (requestRef.current !== requestId || video.srcObject !== mediaStream || !video.paused) return;
    void video.play().catch((reason: unknown) => {
      // Keep the browser's concrete reason available for diagnosis.
      console.warn('[MainLibre][RA] Impossible de lire l’aperçu vidéo :', reason);
      // Preview rendering is separate from the hidden video used for inference.
      // Keep the warning local to the preview; do not stop head tracking.
      if (requestRef.current === requestId && video.srcObject === mediaStream) {
        setError(fr.ar.errors.videoPreview);
      }
    });
  };

  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) playPreview();
  else video.addEventListener('loadedmetadata', playPreview, { once: true });
}

function stopTracking(options: TrackingOptions, requestRef: MutableRefObject<number>, setMode: (value: 'camera' | 'mouse' | null) => void, setTracking: (value: boolean) => void, setStarting: (value: boolean) => void, setCalibrated: (value: boolean) => void): void {
  requestRef.current += 1; options.faceTracker.stop(); options.mouseTracker.stop(); options.dwell.update(null);
  options.refs.calibrated.current = false; options.refs.lastPose.current = null; setMode(null); setTracking(false); setStarting(false); setCalibrated(false); options.setInferenceMs(null);
  if (options.refs.cursorRef.current) options.refs.cursorRef.current.style.visibility = 'hidden';
  if (options.refs.videoRef.current) options.refs.videoRef.current.srcObject = null;
}

function calibrateHead(options: TrackingOptions, setCalibrated: (value: boolean) => void, setError: (value: string) => void): void {
  const pose = options.refs.lastPose.current;
  if (!pose) { setError(fr.ar.errors.noPose); return; }
  options.filter.calibrate(pose); options.refs.calibrated.current = true; setCalibrated(true); setError('');
}

function faceError(code: FaceTrackerErrorCode): string {
  return fr.ar.errors[code];
}

