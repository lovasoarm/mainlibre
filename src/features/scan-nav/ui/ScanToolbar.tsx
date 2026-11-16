import { Link } from 'react-router-dom';
import { useScanNavViewModel } from '../model/useScanNavViewModel';
import { Button } from '../../../shared/ui/Button';
import { useServices } from '../../../shared/hooks/services-context';
import { fr } from '../../../shared/i18n/fr';
import styles from './ScanToolbar.module.css';

export function ScanToolbar({ mode = 'navigation' }: { mode?: 'navigation' | 'keyboard' | 'hub' }) {
  const { snapshot, start, stop, togglePause, isRunning } = useScanNavViewModel(mode);
  const { actionRegistry } = useServices();
  const activeTargetId = snapshot.activeTargetId ?? '';
  const path = activeTargetId.replace('nav:', '');
  const targetLabel = actionRegistry.get(activeTargetId)?.label ?? (path.startsWith('key:') ? `Clavier · ${path.slice(4)}` : fr.navigation.pathLabels[path as keyof typeof fr.navigation.pathLabels] ?? path);
  return <div className={styles.toolbar}>
    <div className={styles.status}><strong>{fr.scan.toolbarTitle}</strong><span role="status" aria-live="polite">{isRunning ? `${fr.scan.targetPrefix} ${targetLabel}` : fr.scan.stopped}</span></div>
    <ToolbarControls running={isRunning} paused={snapshot.paused} start={start} stop={stop} togglePause={togglePause} />
    <span className={styles.hint}>{fr.scan.hint}</span><Link className={styles.more} to="/scan">{fr.scan.settingsLink}</Link>
  </div>;
}

function ToolbarControls({ running, paused, start, stop, togglePause }: { running: boolean; paused: boolean; start: () => void; stop: () => void; togglePause: () => void }) {
  if (!running) return <Button data-switch-control size="normal" onClick={() => { start(); requestAnimationFrame(() => document.getElementById('main-content')?.focus()); }}>{fr.scan.activate}</Button>;
  return <><Button data-switch-control size="normal" tone="primary" onClick={togglePause}>{paused ? fr.scan.resume : fr.scan.pause}</Button><Button data-switch-control size="normal" onClick={stop}>{fr.scan.stop}</Button></>;
}
