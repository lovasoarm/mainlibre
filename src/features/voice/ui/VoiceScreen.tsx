import { useState } from 'react';
import type { SpeechState } from '../../../core/ports/ports';
import type { ActionDefinition } from '../../../core/domain/types';
import { useServices } from '../../../shared/hooks/services-context';
import { Button } from '../../../shared/ui/Button';
import { Page } from '../../../shared/ui/Page';
import { Panel } from '../../../shared/ui/Panel';
import { StatusMessage } from '../../../shared/ui/StatusMessage';
import { fr } from '../../../shared/i18n/fr';
import { useVoiceController } from './VoiceProvider';
import { useScanSnapshot } from '../../../shared/hooks/useScanSnapshot';
import styles from './VoiceScreen.module.css';

function RecognitionPanel({ state, start, stop }: { state: SpeechState; start: () => void; stop: () => void }) {
  const text = fr.voice;
  return <Panel title={text.statusTitle}>
    <p><strong>{state.listening ? text.listening : text.stopped}</strong></p>
    <p>{state.supported ? text.apiDetected : text.apiMissing}</p>
    {state.localAvailable === true && <StatusMessage tone="success">{text.localAccepted}</StatusMessage>}
    {state.localAvailable === false && <StatusMessage tone="warning">{text.localMissing}</StatusMessage>}
    {state.localAvailable === null && <StatusMessage tone="warning">{text.localUnknown}</StatusMessage>}
    {state.error && state.error !== 'localUnavailable' && <StatusMessage tone="error">{text.errors[state.error]}</StatusMessage>}
    <div className={styles.controls}>
      <Button tone="primary" onClick={start} disabled={!state.supported || state.listening}>{text.startListening}</Button>
      <Button onClick={stop} disabled={!state.listening}>{text.stopListening}</Button>
    </div>
  </Panel>;
}

function VoiceDemoPanel({ transcript, actions, request }: { transcript: string; actions: ActionDefinition[]; request: (id: string) => void }) {
  const [demoText, setDemoText] = useState('');
  const [result, setResult] = useState('');
  const testCommand = () => {
    const phrase = demoText.trim().toLocaleLowerCase('fr-FR');
    const match = actions.find((action) => action.phrases.some((candidate) => candidate.toLocaleLowerCase('fr-FR') === phrase) || action.label.toLocaleLowerCase('fr-FR') === phrase);
    if (match) { request(match.id); setResult(`${fr.voice.commandSent} ${match.label}.`); }
    else if (phrase) setResult(`${fr.voice.unrecognized} : ${demoText}`);
  };
  return <Panel title={fr.voice.transcriptTitle}>
    <p className={styles.transcript} aria-live="polite" aria-atomic="true">{transcript || fr.voice.transcriptPlaceholder}</p>
    <label className={styles.label} htmlFor="voice-demo">{fr.voice.demoLabel}</label>
    <div className={styles.controls}>
      <input id="voice-demo" value={demoText} onChange={(event) => setDemoText(event.target.value)} placeholder={fr.voice.demoPlaceholder} />
      <Button onClick={testCommand}>{fr.voice.testCommand}</Button>
    </div>
    {result && <p role="status">{result}</p>}
  </Panel>;
}

function CommandList({ actions }: { actions: ActionDefinition[] }) {
  const scan = useScanSnapshot();
  return <Panel title={fr.voice.commandsTitle}><ul className={styles.commandList}>
    {actions.map((action) => <li key={action.id} className={scan.activeTargetId === action.id ? styles.scanTarget : ''}><span aria-hidden="true">{action.icon}</span><div><strong>{action.label}</strong><small>{action.phrases.join(' · ')}</small></div></li>)}
    <li><span aria-hidden="true">→</span><div><strong>{fr.voice.navigation}</strong><small>{fr.voice.navigationPhrases}</small></div></li>
  </ul></Panel>;
}

export function VoiceScreen() {
  const { controller, state } = useVoiceController();
  const { actionRegistry } = useServices();
  const actions = actionRegistry.list();
  return <Page title={fr.voice.title} description={fr.voice.description}>
    <div className={styles.grid}>
      <RecognitionPanel state={state} start={() => controller.start()} stop={() => controller.stop()} />
      <VoiceDemoPanel transcript={state.transcript} actions={actions} request={(id) => actionRegistry.request(id, 'ui')} />
    </div>
    <CommandList actions={actions} />
  </Page>;
}
