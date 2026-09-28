export const explorations = [
  { id: 'editorial', number: '01', name: 'Editorial', description: 'Paper, expressive type, and a simple project index.', color: '#efede5' },
  { id: 'workbench', number: '02', name: 'Workbench', description: 'Warm colors, tactile objects, and a personal feel.', color: '#f3e5d7' },
  { id: 'signal', number: '03', name: 'Signal', description: 'Dark surfaces, sharp contrast, and one tool in focus.', color: '#171b19' },
] as const;

export type ExplorationId = typeof explorations[number]['id'];
