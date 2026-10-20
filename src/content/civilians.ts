/** Silent background roles, deliberately separate from named scene characters. */
export const CIVILIANS = {
  'civilian-dockhand': { name: 'Dock worker' },
  'civilian-traveler': { name: 'Traveler' },
  'civilian-family': { name: 'Parent and child' },
  'civilian-patient': { name: 'Ward patient' },
  'civilian-dockhand-rust': { name: 'Dock worker / rust' },
  'civilian-traveler-blue': { name: 'Traveler / blue' },
  'civilian-family-blue': { name: 'Parent and child / blue' },
  'civilian-family-plum': { name: 'Parent and child / plum' },
  'civilian-patient-green': { name: 'Ward patient / green' },
} as const;
export type CivilianSprite = keyof typeof CIVILIANS;
export const CIVILIAN_SPRITES = Object.keys(CIVILIANS) as CivilianSprite[];
