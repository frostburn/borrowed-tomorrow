/** Silent background roles, deliberately separate from named scene characters. */
export const CIVILIANS = {
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

const layouts={
  dockhand:{width:128,height:128,bounds:[38,14,89,118]},
  traveler:{width:137,height:133,bounds:[37,20,95,119]},
  family:{width:136,height:127,bounds:[34,15,103,117]},
  patient:{width:128,height:128,bounds:[45,16,84,116]},
} as const;
export const CIVILIAN_HEIGHT=63;
/** Full-resolution art, uniformly scaled around the actual soles rather than its canvas. */
export function civilianPresentation(sprite:string){
  if(!Object.hasOwn(CIVILIANS,sprite))return undefined;
  const role=CIVILIANS[sprite as CivilianSprite].role,layout=layouts[role];
  const [left,top,right,bottom]=layout.bounds;
  return {...layout,scale:CIVILIAN_HEIGHT/(bottom-top),originX:(left+right)/2/layout.width,originY:bottom/layout.height};
}
