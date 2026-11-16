import { useScanSnapshot } from '../../../shared/hooks/useScanSnapshot';
import { Page } from '../../../shared/ui/Page';
import { Panel } from '../../../shared/ui/Panel';
import { fr } from '../../../shared/i18n/fr';

export function ScanScreen() {
  const snapshot = useScanSnapshot();
  return <Page title={fr.scan.title} description={fr.scan.description}>
    <Panel title={fr.scan.controlTitle}>
      <p>{fr.scan.instruction}</p>
      <p>{fr.scan.highlight}</p>
      <p role="status" aria-live="polite">{fr.scan.status} {snapshot.phase}. {fr.scan.target} {snapshot.activeTargetId ?? fr.keyboard.noTarget}. {fr.scan.cycles} {snapshot.cycleCount}.</p>
    </Panel>
    <Panel title={fr.scan.settingsTitle}><p>{fr.scan.settingsDescription}</p></Panel>
  </Page>;
}
