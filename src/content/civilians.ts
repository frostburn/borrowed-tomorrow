/** Silent background roles, deliberately separate from named scene characters. */
export const CIVILIANS = {
  'civilian-dockhand': { name: 'Dock worker' },
  'civilian-traveler': { name: 'Traveler' },
  'civilian-family': { name: 'Parent and child' },
  'civilian-patient': { name: 'Ward patient' },
} as const;
export type CivilianSprite = keyof typeof CIVILIANS;
export const CIVILIAN_SPRITES = Object.keys(CIVILIANS) as CivilianSprite[];
