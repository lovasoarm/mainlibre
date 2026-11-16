import type { CSSProperties } from 'react';
import type { ActionDefinition } from '../../../core/domain/types';
import { useArViewModel } from '../model/useArViewModel';
import { useServices } from '../../../shared/hooks/services-context';
import { useScanSnapshot } from '../../../shared/hooks/useScanSnapshot';
import { Page } from '../../../shared/ui/Page';
import { Panel } from '../../../shared/ui/Panel';
import { Button } from '../../../shared/ui/Button';
import { StatusMessage } from '../../../shared/ui/StatusMessage';
import { fr } from '../../../shared/i18n/fr';
import styles from './ArMenuScreen.module.css';

const MENU_ACTION_IDS = ['call', 'help', 'light', 'keyboard'];

function TrackingControls({ ar }: { ar: ReturnType<typeof useArViewModel> }) {
  const text = fr.ar;
  return <Panel title={text.controlTitle}>
    <div className={styles.controls}>
      <Button tone="primary" onClick={ar.startCamera} disabled={ar.tracking || ar.starting}>{text.startCamera}</Button>
      <Button onClick={ar.startMouse} disabled={ar.tracking || ar.starting}>{text.mouseMode}</Button>
      <Button onClick={ar.calibrate} disabled={!ar.tracking || ar.starting}>{text.calibrate}</Button>
      <Button onClick={ar.stop} disabled={!ar.tracking && !ar.starting}>{text.stop}</Button>
    </div>
    <TrackingStatus ar={ar} />
  </Panel>;
}

function TrackingStatus({ ar }: { ar: ReturnType<typeof useArViewModel> }) {
  const text = fr.ar;
  return <>
    <p role="status" aria-live="polite">{text.mode} {ar.mode ?? text.stopped} · {text.state} {ar.starting ? text.starting : ar.tracking ? text.active : text.inactive} · {text.calibration} {ar.calibrated ? text.calibrated : text.required}{ar.inferenceMs !== null ? ` · ${text.inference} ${ar.inferenceMs} ms` : ''}</p>
    {ar.error && <StatusMessage tone="warning">{ar.error}</StatusMessage>}
    {!ar.calibrated && ar.tracking && <StatusMessage tone="info">{text.calibrationHint}</StatusMessage>}
  </>;
}

function ArStage({ ar, actions }: { ar: ReturnType<typeof useArViewModel>; actions: ActionDefinition[] }) {
  const scan = useScanSnapshot();
  const actionRegistry = useServices().actionRegistry;
  return <div className={styles.stage}>
    <video ref={ar.videoRef} className={styles.video} autoPlay muted playsInline aria-label={fr.ar.cameraPreview} />
    {!ar.mode && <div className={styles.videoFallback} aria-hidden="true">{fr.ar.videoFallback}</div>}
    <div ref={ar.cursorRef} className={styles.cursor} aria-hidden="true" />
    <section ref={ar.menuRef} className={styles.menu} aria-label={fr.ar.menuLabel}>
      {actions.map((action) => <button key={action.id} type="button" data-dwell-target={action.id} data-scan-target data-active={ar.activeTarget === action.id || scan.activeTargetId === action.id} className={`${styles.menuButton} ${ar.activeTarget === action.id ? styles.dwellActive : ''} ${scan.activeTargetId === action.id ? styles.scanActive : ''}`} style={{ '--dwell-ms': `${ar.dwellMs}ms` } as CSSProperties} onClick={() => actionRegistry.request(action.id, 'ui')}>
        <span aria-hidden="true">{action.icon}</span><strong>{action.label}</strong>{ar.activeTarget === action.id && <small>{fr.ar.dwellHint}</small>}
      </button>)}
    </section>
  </div>;
}

function DwellInstructions() {
  return <Panel title={fr.ar.dwellTitle}>
    <ol>{fr.ar.dwellSteps.map((step) => <li key={step}>{step}</li>)}</ol>
    <p>{fr.ar.menuDescription}</p>
  </Panel>;
}

export function ArMenuScreen() {
  const ar = useArViewModel();
  const { actionRegistry } = useServices();
  const actions = MENU_ACTION_IDS.map((id) => actionRegistry.get(id)).filter((action): action is ActionDefinition => action !== undefined);
  return <Page title={fr.ar.title} description={fr.ar.description}>
    <TrackingControls ar={ar} /><ArStage ar={ar} actions={actions} /><DwellInstructions />
  </Page>;
}
