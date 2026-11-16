import { useCallback } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import type { ClockPort } from '../../../core/ports/ports';
import type { FacePose } from '../../../core/ports/ports';
import type { DwellSelector } from './DwellSelector';
import type { PointerFilter } from './PointerFilter';
import { mapPointToCoverVideo } from './videoCoordinates';

interface PoseHandlerOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  cursorRef: MutableRefObject<HTMLDivElement | null>;
  menuRef: MutableRefObject<HTMLDivElement | null>;
  calibrated: MutableRefObject<boolean>;
  lastPose: MutableRefObject<FacePose | null>;
  lastMetricsAt: MutableRefObject<number>;
  filter: PointerFilter;
  dwell: DwellSelector;
  clock: ClockPort;
  setInferenceMs: (value: number) => void;
}

export function useArPoseHandler(options: PoseHandlerOptions) {
  return useCallback((pose: FacePose | null) => {
    if (!pose) return clearPose(options);
    options.lastPose.current = pose;
    updateInference(options, pose);
    const point = options.filter.filter(pose);
    const screenPoint = toVideoPoint(options.videoRef.current, point);
    moveCursor(options.cursorRef.current, screenPoint);
    applyParallax(options.menuRef.current, point);
    if (options.calibrated.current) options.dwell.update(findDwellTarget(screenPoint.x, screenPoint.y));
  }, [options]);
}

function clearPose(options: PoseHandlerOptions): void {
  options.dwell.update(null);
  if (options.cursorRef.current) options.cursorRef.current.style.visibility = 'hidden';
}

function updateInference(options: PoseHandlerOptions, pose: FacePose): void {
  if (pose.inferenceMs === undefined || options.clock.now() - options.lastMetricsAt.current < 1000) return;
  options.lastMetricsAt.current = options.clock.now();
  options.setInferenceMs(Math.round(pose.inferenceMs * 10) / 10);
}

function toVideoPoint(video: HTMLVideoElement | null, point: { x: number; y: number }): { x: number; y: number } {
  if (!video) return { x: point.x * window.innerWidth, y: point.y * window.innerHeight };
  const bounds = video.getBoundingClientRect();
  return mapPointToCoverVideo(point, {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
    intrinsicWidth: video.videoWidth,
    intrinsicHeight: video.videoHeight,
  });
}

function moveCursor(cursor: HTMLDivElement | null, point: { x: number; y: number }): void {
  if (!cursor) return;
  cursor.style.visibility = 'visible';
  cursor.style.left = `${point.x}px`;
  cursor.style.top = `${point.y}px`;
}

function applyParallax(menu: HTMLDivElement | null, point: { x: number; y: number }): void {
  if (!menu || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rotateX = (0.5 - point.y) * 8;
  const rotateY = (point.x - 0.5) * 8;
  menu.style.transform = `translate(-50%, -50%) perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function findDwellTarget(x: number, y: number): string | null {
  const element = document.elementFromPoint(x, y);
  return element?.closest<HTMLElement>('[data-dwell-target]')?.dataset['dwellTarget'] ?? null;
}
