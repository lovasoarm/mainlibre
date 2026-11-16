import { Link } from 'react-router-dom';
import { useHubViewModel } from '../model/useHubViewModel';
import { Page } from '../../../shared/ui/Page';
import { Button } from '../../../shared/ui/Button';
import { Panel } from '../../../shared/ui/Panel';
import { useScanSnapshot } from '../../../shared/hooks/useScanSnapshot';
import { fr } from '../../../shared/i18n/fr';
import styles from './HubScreen.module.css';

export function HubScreen() {
  const { actions, dispatch } = useHubViewModel();
  const scan = useScanSnapshot();
  return <Page title={fr.common.appName} eyebrow={fr.hub.eyebrow} description={fr.hub.description}>
    <div className={styles.banner}><div><strong>{fr.hub.bannerTitle}</strong><p>{fr.hub.bannerDescription}</p></div><span aria-hidden="true">ML</span></div>
    <div className={styles.grid}>{fr.hub.modules.map((module) => <ModuleCard key={module.path} module={module} active={scan.phase === 'ITEMS' && scan.activeTargetId === `nav:${module.path}`} />)}</div>
    <Panel title={fr.hub.quickTitle}>
      <p>{fr.hub.quickDescription}</p>
      <div className={styles.actions}>{actions.filter((action) => ['call', 'help', 'light'].includes(action.id)).map((action) => {
        const active = scan.phase === 'ITEMS' && scan.activeTargetId === action.id;
        return <Button key={action.id} size="large" className={active ? styles.scanTarget : ''} data-scan-active={active ? 'true' : 'false'} data-scan-target onClick={() => dispatch(action.id)}>{action.icon} {action.label}</Button>;
      })}</div>
    </Panel>
  </Page>;
}

function ModuleCard({ module, active }: { module: (typeof fr.hub.modules)[number]; active: boolean }) {
  return <Link to={module.path} className={`${styles.moduleCard} ${active ? styles.scanTarget : ''}`} aria-current={active}>
    <span aria-hidden="true">{module.icon}</span><h2>{module.title}</h2><p>{module.description}</p><span className={styles.open}>{fr.hub.openFeature}</span>
  </Link>;
}
