import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { createKeyboardGroups } from '../../../core/domain/keyboardLayout';
import type { EventBus } from '../../../core/engines/EventBus';
import type { ScanEngine } from '../../../core/engines/ScanEngine';
import { useServices } from '../../../shared/hooks/services-context';
import { useScanSnapshot } from '../../../shared/hooks/useScanSnapshot';

function useKeyboardScanGroups(scanEngine: ScanEngine): void {
  useEffect(() => {
    if (scanEngine.getOwner() !== 'lab' && scanEngine.getSnapshot().phase === 'IDLE') {
      scanEngine.setGroups(createKeyboardGroups(), 'rows', 'keyboard');
    }
  }, [scanEngine]);
}

function useKeyboardIntentSubscription(
  eventBus: EventBus,
  insert: (value: string) => void,
  backspace: () => void,
  clear: () => void,
): void {
  useEffect(() => eventBus.subscribe((event) => {
    if (event.type !== 'INTENT' || event.intent.type !== 'SELECT' || !event.intent.targetId) return;
    const targetId = event.intent.targetId;
    if (!targetId.startsWith('key:')) return;
    const key = targetId.slice(4);
    if (key === 'SPACE') insert(' ');
    else if (key === 'BACKSPACE') backspace();
    else if (key === 'CLEAR') clear();
    else insert(key);
  }), [backspace, clear, eventBus, insert]);
}

function useVoiceTextSubscription(
  eventBus: EventBus,
  textRef: MutableRefObject<string>,
  commitText: (next: string, activation: boolean) => void,
): void {
  useEffect(() => eventBus.subscribe((event) => {
    if (event.type !== 'TEXT_CHANGED' || event.source !== 'voice') return;
    const spokenText = event.text.trim();
    const separator = textRef.current.length > 0 ? ' ' : '';
    commitText(`${textRef.current}${separator}${spokenText}`, false);
  }), [commitText, eventBus, textRef]);
}

export function useKeyboardViewModel() {
  const { eventBus, clock, scanEngine } = useServices();
  const snapshot = useScanSnapshot();
  const [text, setText] = useState('');
  const textRef = useRef('');
  const commitText = useCallback((next: string, activation: boolean) => {
    textRef.current = next;
    setText(next);
    eventBus.publish({ type: 'TEXT_CHANGED', text: next, source: 'keyboard', activation, occurredAt: clock.now() });
  }, [clock, eventBus]);
  const insert = useCallback((valueToAdd: string) => {
    commitText(`${textRef.current}${valueToAdd.toLocaleLowerCase('fr-FR')}`, true);
  }, [commitText]);
  const backspace = useCallback(() => commitText(textRef.current.slice(0, -1), true), [commitText]);
  const clear = useCallback(() => commitText('', false), [commitText]);

  useKeyboardScanGroups(scanEngine);
  useKeyboardIntentSubscription(eventBus, insert, backspace, clear);
  useVoiceTextSubscription(eventBus, textRef, commitText);
  return { text, insert, backspace, clear, snapshot, isLabSession: scanEngine.getOwner() === 'lab' };
}
