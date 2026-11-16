import { useServices } from '../../../shared/hooks/services-context';

export function useHubViewModel() {
  const { actionRegistry } = useServices();
  return { actions: actionRegistry.list(), dispatch: (actionId: string) => actionRegistry.request(actionId, 'ui') };
}
