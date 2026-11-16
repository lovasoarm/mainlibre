import { useEffect } from 'react';
import { useServices } from '../shared/hooks/services-context';
import { useSettings } from '../shared/hooks/useSettings';

export function ThemeBridge() {
  const { theme } = useServices();
  const { value } = useSettings();
  useEffect(() => { theme.apply(value); }, [theme, value]);
  useEffect(() => theme.subscribeReducedMotion(() => undefined), [theme]);
  return null;
}
