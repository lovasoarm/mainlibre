import { useMemo, useState } from 'react';
import { APP_CONFIG } from '../../../shared/config/constants';
import { useServices } from '../../../shared/hooks/services-context';
import { useSettings } from '../../../shared/hooks/useSettings';
import { PointerFilter } from './PointerFilter';
import { useArDwell } from './useArDwell';
import { useArPoseHandler } from './useArPoseHandler';
import { useArRefs } from './useArRefs';
import { useArTrackingControls } from './useArTrackingControls';

export function useArViewModel() {
  const { faceTracker, mouseTracker, clock, eventBus } = useServices();
  const { value } = useSettings();
  const refs = useArRefs();
  const filter = useMemo(() => new PointerFilter(value.headGain, APP_CONFIG.headDeadZone, APP_CONFIG.pointerEma), [value.headGain]);
  const { dwell, activeTarget } = useArDwell(clock, value.dwellMs, eventBus);
  const [inferenceMs, setInferenceMs] = useState<number | null>(null);
  const poseOptions = useMemo(() => ({ ...refs, filter, dwell, clock, setInferenceMs }), [refs, filter, dwell, clock]);
  const acceptPose = useArPoseHandler(poseOptions);
  const trackingOptions = useMemo(() => ({ faceTracker, mouseTracker, refs, filter, dwell, acceptPose, setInferenceMs }), [faceTracker, mouseTracker, refs, filter, dwell, acceptPose]);
  const controls = useArTrackingControls(trackingOptions);
  return { ...refs, ...controls, activeTarget, inferenceMs, dwellMs: value.dwellMs };
}
