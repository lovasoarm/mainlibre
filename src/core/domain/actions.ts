import type { ActionDefinition } from './types';

export const ACTIONS: ActionDefinition[] = [
  { id: 'keyboard', label: 'Ouvrir le clavier', phrases: ['ouvrir le clavier', 'clavier', 'saisir un message'], icon: '⌨', route: '/keyboard' },
  { id: 'call', label: 'Appeler', phrases: ['appeler', 'téléphoner', 'lancer un appel'], icon: '☎' },
  { id: 'help', label: "J'ai besoin d'aide", phrases: ["j'ai besoin d'aide", 'aide', 'au secours'], icon: '!' },
  { id: 'light', label: 'Allumer la lumière', phrases: ['allumer la lumière', 'lumière', 'éclairage'], icon: '☼' },
  { id: 'home', label: 'Accueil', phrases: ['accueil', 'retour accueil', 'maison'], icon: '⌂', route: '/' },
  { id: 'lab', label: 'Ouvrir le laboratoire', phrases: ['ouvrir le labo', 'laboratoire', 'tests'], icon: '◎', route: '/lab' },
];
