import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../shared/hooks/services-context';

export function IntentNavigation() {
  const navigate = useNavigate();
  const { eventBus, scanEngine, actionRegistry } = useServices();
  useEffect(() => eventBus.subscribe((event) => {
    if (event.type !== 'INTENT') return;
    const { intent, source } = event;
    if (intent.type === 'OPEN') navigate(intent.route);
    if (intent.type === 'BACK') navigate(-1);
    if (intent.type === 'HOME') navigate('/');
    if (intent.type === 'NEXT') scanEngine.next();
    if (intent.type === 'PREVIOUS') scanEngine.previous();
    if (intent.type === 'SELECT' && source === 'voice' && !intent.targetId) scanEngine.activate('voice');
    if (intent.type === 'SELECT' && intent.targetId?.startsWith('nav:')) navigate(intent.targetId.slice(4));
    if (intent.type === 'SELECT' && intent.targetId) {
      if (actionRegistry.get(intent.targetId)) actionRegistry.dispatch(intent.targetId, source);
    }
    if (intent.type === 'TRIGGER_ACTION') actionRegistry.dispatch(intent.actionId, source);
  }), [actionRegistry, eventBus, navigate, scanEngine]);
  return null;
}
