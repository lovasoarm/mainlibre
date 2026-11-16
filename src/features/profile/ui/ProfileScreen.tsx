import { Page } from '../../../shared/ui/Page';
import { Panel } from '../../../shared/ui/Panel';
import { Button } from '../../../shared/ui/Button';
import { useSettings } from '../../../shared/hooks/useSettings';
import { fr } from '../../../shared/i18n/fr';
import styles from './ProfileScreen.module.css';

export function ProfileScreen() {
  const { value, update, reset } = useSettings();
  const labels = fr.profile;
  return <Page title={labels.title} description={labels.description}>
    <Panel title={labels.panelTitle}>
      <p>{labels.introduction}</p>
      <ProfileSliders value={value} update={update} />
      <div className={styles.checks}>
        <label><input type="checkbox" checked={value.contrast === 'high'} onChange={(event) => update({ contrast: event.target.checked ? 'high' : 'normal' })} /> {labels.highContrast}</label>
        <label><input type="checkbox" checked={value.scanAutoPause} onChange={(event) => update({ scanAutoPause: event.target.checked })} /> {labels.autoPause}</label>
      </div>
      <div className={styles.actions}><Button onClick={reset}>{labels.restore}</Button><span role="status" aria-live="polite">{labels.saved}</span></div>
    </Panel>
  </Page>;
}

function ProfileSliders({ value, update }: { value: ReturnType<typeof useSettings>['value']; update: ReturnType<typeof useSettings>['update'] }) {
  const labels = fr.profile;
  return <div className={styles.grid}>
    <label>{labels.targetSize} : {value.targetSizePx} px<input type="range" min="48" max="88" step="4" value={value.targetSizePx} onChange={(event) => update({ targetSizePx: Number(event.target.value) })} /></label>
    <label>{labels.scanSpeed} : {value.scanIntervalMs} ms<input type="range" min="700" max="4000" step="100" value={value.scanIntervalMs} onChange={(event) => update({ scanIntervalMs: Number(event.target.value) })} /></label>
    <label>{labels.firstDelay} : {value.firstItemDelayMs} ms<input type="range" min="0" max="5000" step="100" value={value.firstItemDelayMs} onChange={(event) => update({ firstItemDelayMs: Number(event.target.value) })} /></label>
    <label>{labels.pauseAfter} {value.pauseAfterCycles} {labels.cycles}<input type="range" min="1" max="8" value={value.pauseAfterCycles} onChange={(event) => update({ pauseAfterCycles: Number(event.target.value) })} /></label>
    <label>{labels.dwell} : {value.dwellMs} ms<input type="range" min="800" max="4000" step="100" value={value.dwellMs} onChange={(event) => update({ dwellMs: Number(event.target.value) })} /></label>
    <label>{labels.headGain} : {value.headGain.toFixed(2)}<input type="range" min="0.5" max="2.5" step="0.05" value={value.headGain} onChange={(event) => update({ headGain: Number(event.target.value) })} /></label>
  </div>;
}
