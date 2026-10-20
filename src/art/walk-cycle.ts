import type { Point3 } from './actor-space';
export type LegSide = 'left' | 'right';
export const REFERENCE_FRAMES = 6;
export const REFERENCE_FRAME_MS = 120;
export const STRIDE_DISTANCE = 40;
export const STANCE_FRACTION = .6;
export const LEG_LENGTH = 15;
export const ANKLE_HEIGHT = 3;
export const LEG_COLORS = {left:0x62b9ba,right:0xe5a45b} as const;
export interface LegPose { hip:Point3;knee:Point3;ankle:Point3;planted:boolean;phase:number }
export interface WalkPose { phase:number;hipHeight:number;left:LegPose;right:LegPose }
const wrap=(phase:number)=>phase-Math.floor(phase);

function leg(side:LegSide,phase:number,hipHeight:number):LegPose {
  const t=wrap(phase),planted=t<=STANCE_FRACTION+1e-10;
  const swing=(t-STANCE_FRACTION)/(1-STANCE_FRACTION);
  // During support, local foot travel exactly cancels forward root travel.
  // The eased return happens only while that foot is above the ground.
  const ease=swing*swing*(3-2*swing);
  const y=planted?12-STRIDE_DISTANCE*t:-12+24*ease;
  const z=ANKLE_HEIGHT+(planted?0:6*Math.sin(Math.PI*swing));
  const x=side==='right'?4:-4,hip={x,y:0,z:hipHeight},ankle={x,y,z};
  const dy=y,dz=z-hipHeight,d=Math.hypot(dy,dz);
  const bend=Math.sqrt(Math.max(0,LEG_LENGTH**2-d*d/4));
  // Choose the forward-bending knee solution in the anatomical sagittal plane.
  const knee={x,y:dy/2-dz/d*bend,z:(hipHeight+z)/2+dy/d*bend};
  return {hip,knee,ankle,planted,phase:t};
}

export function referencePose(phase:number):WalkPose {
  phase=wrap(phase);
  // Stay low during double support, rise over the planted leg, then settle at
  // the next contact. This straightens support without stretching either bone.
  const half=phase% .5,doubleSupport=STANCE_FRACTION-.5,support=(half-doubleSupport)/(.5-doubleSupport);
  const hipHeight=30.3+(support>0?2.4*Math.sin(Math.PI*support):0);
  return {phase,hipHeight,left:leg('left',phase,hipHeight),right:leg('right',phase+.5,hipHeight)};
}

export const referenceFrame=(frame:number)=>referencePose(frame/REFERENCE_FRAMES);
