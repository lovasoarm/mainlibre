export const KEY_ROWS = [
  ['E', 'A', 'S', 'I', 'T', 'N', 'R', 'U'],
  ['O', 'L', 'D', 'C', 'M', 'P', 'V', 'G'],
  ['F', 'B', 'H', 'Q', 'J', 'X', 'Y', 'Z'],
  ['K', 'W', 'À', 'É', 'È', 'Ç', 'Ù', 'Ê'],
] as const;

export const KEY_COMMANDS = [
  { id: 'key:SPACE', label: 'Espace' },
  { id: 'key:BACKSPACE', label: 'Effacer un caractère' },
  { id: 'key:CLEAR', label: 'Tout effacer' },
] as const;

export function createKeyboardGroups(): { id: string; targetIds: string[] }[] {
  const letterGroups = KEY_ROWS.map((row, index) => ({
    id: `row-${index}`,
    targetIds: row.map((letter) => `key:${letter}`),
  }));
  return [
    ...letterGroups,
    { id: 'row-commands', targetIds: KEY_COMMANDS.map((command) => command.id) },
  ];
}
