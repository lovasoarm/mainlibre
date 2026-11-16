import { useKeyboardViewModel } from '../model/useKeyboardViewModel';
import { KEY_COMMANDS, KEY_ROWS } from '../model/keyboardLayout';
import { Page } from '../../../shared/ui/Page';
import { Panel } from '../../../shared/ui/Panel';
import { Button } from '../../../shared/ui/Button';
import { fr } from '../../../shared/i18n/fr';
import styles from './KeyboardScreen.module.css';
import { useServices } from '../../../shared/hooks/services-context';

function PhaseDescription({ phase, targetId }: { phase: string; targetId: string | null }) {
  const phaseText = fr.keyboard.phases[phase as keyof typeof fr.keyboard.phases] ?? fr.keyboard.phases.IDLE;
  return <p>{fr.keyboard.phase} <strong>{phaseText}</strong>. {fr.keyboard.target} <strong>{targetId?.replace('key:', '') ?? fr.keyboard.noTarget}</strong>.</p>;
}

function KeyboardLetterRow({ row, rowIndex, activeGroupId, activeTargetId, insert }: { row: readonly string[]; rowIndex: number; activeGroupId: string | null; activeTargetId: string | null; insert: (letter: string) => void }) {
  const rowId = `row-${rowIndex}`;
  const activeRow = activeGroupId === rowId;
  return <div className={`${styles.keyRow} ${activeRow ? styles.activeRow : ''}`}>
    <span className={styles.rowLabel}>{fr.keyboard.rowLabel} {rowIndex + 1}</span>
    {row.map((letter) => {
      const active = activeTargetId === `key:${letter}`;
      return <Button key={letter} className={active ? styles.activeKey : ''} size="large" tone={active ? 'primary' : 'secondary'} aria-pressed={active} data-scan-target onClick={() => insert(letter)}>{letter}</Button>;
    })}
  </div>;
}

function KeyboardCommandRow({ activeGroupId, activeTargetId, insert, backspace, clear }: { activeGroupId: string | null; activeTargetId: string | null; insert: (value: string) => void; backspace: () => void; clear: () => void }) {
  const activeRow = activeGroupId === 'row-commands';
  return <div className={`${styles.keyRow} ${activeRow ? styles.activeRow : ''}`}>
    <span className={styles.rowLabel}>{fr.keyboard.commands}</span>
    {KEY_COMMANDS.map((command) => <CommandKey key={command.id} command={command} active={activeTargetId === command.id} insert={insert} backspace={backspace} clear={clear} />)}
  </div>;
}

function CommandKey({ command, active, insert, backspace, clear }: { command: (typeof KEY_COMMANDS)[number]; active: boolean; insert: (value: string) => void; backspace: () => void; clear: () => void }) {
  const actions: Record<string, () => void> = { 'key:SPACE': () => insert(' '), 'key:BACKSPACE': backspace, 'key:CLEAR': clear };
  const action = actions[command.id] ?? (() => insert(command.id.slice(4)));
  return <Button className={active ? styles.activeKey : ''} size="large" tone={active ? 'primary' : 'secondary'} aria-pressed={active} data-scan-target onClick={action}>{command.label}</Button>;
}


function LabCancelRow({ active, activeGroup }: { active: boolean; activeGroup: boolean }) {
  const { eventBus, clock } = useServices();
  return <div className={`${styles.keyRow} ${activeGroup ? styles.activeRow : ''}`}>
    <Button className={active ? styles.activeKey : ''} tone={active ? 'primary' : 'danger'} data-scan-target aria-pressed={active} onClick={() => eventBus.publish({ type: 'INTENT', intent: { type: 'SELECT', targetId: 'lab:cancel' }, source: 'ui', occurredAt: clock.now() })}>{fr.keyboard.cancelLab}</Button>
  </div>;
}

export function KeyboardScreen() {
  const { text, insert, backspace, clear, snapshot, isLabSession } = useKeyboardViewModel();
  return <Page title={fr.keyboard.title} description={fr.keyboard.description}>
    <Panel title={fr.keyboard.textTitle}><div className={styles.output} role="status" aria-live="polite" aria-atomic="true">{text || fr.keyboard.textPlaceholder}</div></Panel>
    <Panel title={fr.keyboard.scanTitle}>
      <PhaseDescription phase={snapshot.phase} targetId={snapshot.activeTargetId} />
      <p>{fr.keyboard.instruction}</p>
      <div className={styles.keyboard}>
        {KEY_ROWS.map((row, index) => <KeyboardLetterRow key={`row-${index}`} row={row} rowIndex={index} activeGroupId={snapshot.phase === 'GROUPS' ? snapshot.activeGroupId : null} activeTargetId={snapshot.phase === 'ITEMS' ? snapshot.activeTargetId : null} insert={insert} />)}
        <KeyboardCommandRow activeGroupId={snapshot.phase === 'GROUPS' ? snapshot.activeGroupId : null} activeTargetId={snapshot.phase === 'ITEMS' ? snapshot.activeTargetId : null} insert={insert} backspace={backspace} clear={clear} />
        {isLabSession && <LabCancelRow active={snapshot.phase === 'ITEMS' && snapshot.activeTargetId === 'lab:cancel'} activeGroup={snapshot.phase === 'GROUPS' && snapshot.activeGroupId === 'lab-controls'} />}
      </div>
    </Panel>
  </Page>;
}
