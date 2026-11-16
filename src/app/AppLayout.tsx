import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { VoiceToggle } from '../features/voice';
import { ScanToolbar } from '../features/scan-nav';
import { useServices } from '../shared/hooks/services-context';
import { useLabController } from '../features/lab';
import { Button } from '../shared/ui/Button';
import { useScanSnapshot } from '../shared/hooks/useScanSnapshot';
import { fr } from '../shared/i18n/fr';
import styles from './AppLayout.module.css';

const NAV = fr.navigation.items;

function ActionAnnouncer() {
  const { eventBus } = useServices();
  const [message, setMessage] = useState('');
  useEffect(() => eventBus.subscribe((event) => {
    if (event.type === 'ACTION_TRIGGERED') setMessage(`${fr.navigation.actionAnnouncement} ${event.label}.`);
  }), [eventBus]);
  return <p className={styles.announcement} role="status" aria-live="polite">{message}</p>;
}

function Brand({ restricted }: { restricted: boolean }) {
  const content = <><span aria-hidden="true">ML</span><span>{fr.common.appName}<small>{fr.navigation.brandSubtitle}</small></span></>;
  return restricted ? <div className={styles.brand}>{content}</div> : <Link to="/" className={styles.brand}>{content}</Link>;
}

function PrimaryNavigation({ visible, activeTargetId, selecting }: { visible: boolean; activeTargetId: string | null; selecting: boolean }) {
  if (!visible) return null;
  return <nav aria-label={fr.navigation.brandSubtitle} className={styles.nav}>
    {NAV.map((item) => {
      const active = selecting && activeTargetId === `nav:${item.to}`;
      return <NavLink key={item.to} to={item.to} {...('end' in item ? { end: item.end } : {})} data-scan-active={active ? 'true' : 'false'} className={({ isActive }) => isActive ? styles.active : ''}>{item.label}</NavLink>;
    })}
  </nav>;
}

export function AppLayout() {
  const { eventBus } = useServices();
  const labController = useLabController();
  const location = useLocation();
  const scan = useScanSnapshot();
  const [labMode, setLabMode] = useState<'none' | 'mixed' | 'voice-only' | 'single-switch'>('none');
  useEffect(() => eventBus.subscribe((event) => { if (event.type === 'LAB_MODE_CHANGED') setLabMode(event.mode); }), [eventBus]);
  const restricted = labMode === 'voice-only' || labMode === 'single-switch';
  return <>
    <a className="skipLink" href="#main-content">{fr.common.skipToMain}</a>
    <header className={styles.header}>
      <div className={styles.topline}><Brand restricted={restricted} /><div className={styles.modes}>
        {labMode !== 'single-switch' && <VoiceToggle />}
        {restricted && <Button tone="danger" data-switch-control onClick={labController.cancel}>{fr.navigation.quitSimulation}</Button>}
      </div></div>
      <PrimaryNavigation visible={!restricted} activeTargetId={scan.activeTargetId} selecting={scan.phase === 'ITEMS'} />
      {!restricted && <ScanToolbar mode={location.pathname === '/keyboard' ? 'keyboard' : location.pathname === '/' ? 'hub' : 'navigation'} />}
    </header>
    <ActionAnnouncer /><Outlet /><footer className={styles.footer}>{fr.common.footer}</footer>
  </>;
}
