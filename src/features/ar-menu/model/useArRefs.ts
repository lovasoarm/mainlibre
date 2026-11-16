import { useMemo, useRef } from 'react';
import type { FacePose } from '../../../core/ports/ports';

export function useArRefs() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastPose = useRef<FacePose | null>(null);
  const calibrated = useRef(false);
  const lastMetricsAt = useRef(0);
  return useMemo(() => ({ videoRef, cursorRef, menuRef, lastPose, calibrated, lastMetricsAt }), [videoRef, cursorRef, menuRef, lastPose, calibrated, lastMetricsAt]);
}
