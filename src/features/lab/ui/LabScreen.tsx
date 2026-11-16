import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import type { LabSession } from '../model/labSessionTypes';
import type { SimulationCondition, LabTaskId } from '../model/labDefinitions';
import { useServices } from '../../../shared/hooks/services-context';
import { useScanSnapshot } from '../../../shared/hooks/useScanSnapshot';
import { Button } from '../../../shared/ui/Button';
import { Page } from '../../../shared/ui/Page';
import { Panel } from '../../../shared/ui/Panel';
import { StatusMessage } from '../../../shared/ui/StatusMessage';
import { fr } from '../../../shared/i18n/fr';
import { SUS_QUESTIONS } from '../model/labDefinitions';
import { useLabViewModel } from '../model/useLabViewModel';
import styles from './LabScreen.module.css';

const labText = fr.lab;
type LabViewModel = ReturnType<typeof useLabViewModel>;

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, '0')} s`;
}

function SessionMetrics({ session }: { session: LabSession }) {
  const labels = labText.metrics;
  const values = [[labels.time, formatTime(session.elapsedMs)], [labels.errors, String(session.errors)], [labels.activations, String(session.activations)], [labels.state, session.completed ? labels.completed : labels.inProgress]];
  return <div className={styles.metrics}>{values.map(([label, value]) => <div key={label}><strong>{label}</strong><span>{value}</span></div>)}</div>;
}

function SusQuestionnaire({ answers, setAnswer, onSave, canSave }: { answers: number[]; setAnswer: (index: number, value: number) => void; onSave: () => void; canSave: boolean }) {
  return <Panel title={labText.susTitle}>
    <p>{labText.susInstruction}</p>
    <div className={styles.susList}>{SUS_QUESTIONS.map((question, index) => <fieldset key={question} className={styles.susItem}>
      <legend>{index + 1}. {question}</legend>
      <div className={styles.scale}>{[1, 2, 3, 4, 5].map((score) => <label key={score}><input type="radio" name={`sus-${index}`} value={score} checked={answers[index] === score} onChange={() => setAnswer(index, score)} />{score}</label>)}</div>
    </fieldset>)}</div>
    <Button tone="primary" onClick={onSave} disabled={!canSave}>{labText.save}</Button>
  </Panel>;
}

function SessionSetup({ lab, session }: { lab: LabViewModel; session: LabSession | null }) {
  const instruction = lab.conditions.find((item) => item.id === lab.condition)?.instruction;
  return <Panel title={labText.prepareTitle}>
    <div className={styles.formGrid}>
      <label>{labText.condition}<select value={lab.condition} disabled={Boolean(session)} onChange={(event) => lab.setCondition(event.target.value as SimulationCondition)}>{lab.conditions.map((condition) => <option key={condition.id} value={condition.id}>{condition.label}</option>)}</select></label>
      <label>{labText.task}<select value={lab.taskId} disabled={Boolean(session)} onChange={(event) => lab.setTaskId(event.target.value as LabTaskId)}>{lab.tasks.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
    </div>
    <p className={styles.instruction}>{instruction}</p>
    <div className={styles.controls}><Button tone="primary" onClick={lab.start} disabled={Boolean(session)}>{labText.start}</Button></div>
  </Panel>;
}

function SessionInstructions({ session, activeTargetId, label }: { session: LabSession; activeTargetId: string | null; label: (id: string) => string | undefined }) {
  if (session.completed) return <StatusMessage tone="success">{labText.completed}</StatusMessage>;
  if (session.condition === 'voice-only') return <StatusMessage tone="info">{labText.voiceInstruction}</StatusMessage>;
  if (session.condition !== 'single-switch') return <p>{session.taskId === 'write-hello' ? <>{labText.openKeyboardBefore}<Link to="/keyboard">{labText.openKeyboard}</Link>{labText.typeBonjour}</> : null}</p>;
  if (session.taskId === 'write-hello') return <StatusMessage tone="info">{labText.selectKeyboard}</StatusMessage>;
  const target = activeTargetId === 'nav:/keyboard' ? labText.openKeyboardTarget : label(activeTargetId ?? '') ?? activeTargetId ?? labText.initializing;
  return <StatusMessage tone="info">{`${labText.scanTarget} ${target}. ${labText.scanInstruction}`}</StatusMessage>;
}

function SessionPanel({ lab, session, activeTargetId, label }: { lab: LabViewModel; session: LabSession; activeTargetId: string | null; label: (id: string) => string | undefined }) {
  const task = lab.tasks.find((item) => item.id === session.taskId);
  const restricted = session.condition === 'voice-only' || session.condition === 'single-switch';
  return <Panel title={labText.sessionTitle}>
    <SessionMetrics session={session} />
    {!session.completed && <Button tone="danger" data-switch-control onClick={lab.cancel}>{labText.cancel}</Button>}
    <p>{task?.label}</p><p><strong>{labText.expected}</strong> {task?.expected}</p>
    <SessionInstructions session={session} activeTargetId={activeTargetId} label={label} />
    {session.condition === 'single-switch' && !session.completed && <ScanChoiceList activeTargetId={activeTargetId} label={label} taskId={session.taskId} />}
    {session.taskId !== 'write-hello' && !session.completed && !restricted && <DirectActions activeTargetId={activeTargetId} />}
  </Panel>;
}

function ScanChoiceList({ activeTargetId, label, taskId }: { activeTargetId: string | null; label: (id: string) => string | undefined; taskId: LabTaskId }) {
  const { eventBus, clock, actionRegistry } = useServices();
  const choices = [...(taskId === 'write-hello' ? ['nav:/keyboard'] : ['call', 'help', 'light']), 'lab:cancel'];
  return <div className={styles.scanChoices} aria-label={labText.scanChoices}>{choices.map((id) => {
    const active = activeTargetId === id;
    const text = id === 'nav:/keyboard' ? labText.openKeyboardTargetLabel : id === 'lab:cancel' ? labText.cancel : label(id) ?? id;
    const activate = () => id === 'lab:cancel'
      ? eventBus.publish({ type: 'INTENT', intent: { type: 'SELECT', targetId: id }, source: 'ui', occurredAt: clock.now() })
      : actionRegistry.request(id, 'ui');
    return <Button key={id} data-scan-target className={active ? styles.scanChoiceActive : styles.scanChoice} tone={id === 'lab:cancel' ? 'danger' : active ? 'primary' : 'secondary'} aria-pressed={active} onClick={activate}>{text}</Button>;
  })}</div>;
}

function DirectActions({ activeTargetId }: { activeTargetId: string | null }) {
  const { actionRegistry } = useServices();
  return <div className={styles.controls}>{['call', 'help', 'light'].map((id) => <Button key={id} data-scan-target className={activeTargetId === id ? styles.scanChoiceActive : styles.scanChoice} onClick={() => actionRegistry.request(id, 'ui')}>{actionRegistry.get(id)?.label}</Button>)}</div>;
}

function JournalPanel({ lab }: { lab: LabViewModel }) {
  const { download } = useServices();
  const labels = labText.table;
  return <Panel title={labText.journalTitle}>
    <div className={styles.controls}>
      <Button onClick={() => download.save('mainlibre-sessions.json', lab.exportJSON(), 'application/json')}>{labText.exportJson}</Button>
      <Button onClick={() => download.save('mainlibre-sessions.csv', lab.exportCSV(), 'text/csv;charset=utf-8')}>{labText.exportCsv}</Button>
    </div>
    {lab.journal.length === 0 ? <p>{labText.noSessions}</p> : <div className={styles.tableWrap}><table>
      <thead><tr>{labels.map((label) => <th key={label}>{label}</th>)}</tr></thead>
      <tbody>{lab.journal.map((entry) => <tr key={entry.id}><td>{entry.condition}</td><td>{entry.taskId}</td><td>{formatTime(entry.durationMs)}</td><td>{entry.errors}</td><td>{entry.activations}</td><td>{entry.susScore}</td></tr>)}</tbody>
    </table></div>}
  </Panel>;
}

export function LabScreen() {
  const lab = useLabViewModel();
  const scan = useScanSnapshot();
  const { actionRegistry } = useServices();
  const session = lab.session;
  useEffect(() => { if (session?.condition === 'single-switch' && !session.completed) requestAnimationFrame(() => document.getElementById('main-content')?.focus()); }, [session?.startedAt, session?.condition, session?.completed]);
  return <Page title={labText.title} description={labText.description}>
    <SessionSetup lab={lab} session={session} />
    {session && <SessionPanel lab={lab} session={session} activeTargetId={scan.activeTargetId} label={(id) => actionRegistry.get(id)?.label} />}
    {session?.completed && <SusQuestionnaire answers={lab.answers} setAnswer={lab.setAnswer} onSave={lab.finishAndSave} canSave={lab.canSave} />}
    {lab.savedMessage && <StatusMessage tone="success" live>{lab.savedMessage}</StatusMessage>}
    <JournalPanel lab={lab} />
  </Page>;
}
