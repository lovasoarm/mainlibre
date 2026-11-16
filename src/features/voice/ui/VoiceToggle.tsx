import { Link } from 'react-router-dom';
import { Button } from '../../../shared/ui/Button';
import { fr } from '../../../shared/i18n/fr';
import { useVoiceController } from './VoiceProvider';
import styles from './VoiceToggle.module.css';

export function VoiceToggle() {
  const { controller, state } = useVoiceController();
  return <div className={styles.voiceToggle}>
    <Button size="normal" tone={state.listening ? 'primary' : 'secondary'} onClick={() => state.listening ? controller.stop() : controller.start()} data-switch-control aria-pressed={state.listening}>
      {state.listening ? fr.voice.toggleOn : fr.voice.toggleOff}
    </Button>
    <Link to="/voice" data-switch-control aria-label={fr.voice.viewCommands}>{fr.voice.commandsLink}</Link>
  </div>;
}
