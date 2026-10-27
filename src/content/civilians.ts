/** Silent background roles, deliberately separate from named scene characters. */
export const CIVILIANS = {
  'supply-clerk': { name: 'Supply clerk', role: 'clerk' },
  'flagship-crew': { name:'Disarmed flagship crew',role:'marine' },
  'flagship-marine': { name:'Boarding marine',role:'marine' },
  'civilian-dockhand': { name: 'Dock worker', role:'dockhand' },
  'civilian-traveler': { name: 'Traveler', role:'traveler' },
  'civilian-family': { name: 'Parent and child', role:'family' },
  'civilian-patient': { name: 'Ward patient', role:'patient' },
  'civilian-dockhand-rust': { name: 'Dock worker / rust', role:'dockhand' },
  'civilian-traveler-blue': { name: 'Traveler / blue', role:'traveler' },
  'civilian-family-blue': { name: 'Parent and child / blue', role:'family' },
  'civilian-family-plum': { name: 'Parent and child / plum', role:'family' },
  'civilian-patient-green': { name: 'Ward patient / green', role:'patient' },
} as const;
export type CivilianSprite = keyof typeof CIVILIANS;
export const CIVILIAN_SPRITES = Object.keys(CIVILIANS) as CivilianSprite[];
