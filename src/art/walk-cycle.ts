import type { Point3 } from './actor-space';
export type LegSide = 'left' | 'right';
export const REFERENCE_FRAMES = 6;
export const REFERENCE_FRAME_MS = 120;
export const STRIDE_DISTANCE = 40;
export const STANCE_FRACTION = .6;
export const LEG_LENGTH = 15;
export const ANKLE_HEIGHT = 3;
export const FOOT_HEEL = -4;
export const FOOT_TOE = 8;
export const LEG_COLORS = {left:0x62b9ba,right:0xe5a45b} as const;
export interface FootPose { origin:Point3;pitch:number;heel:Point3;toe:Point3;contact:'heel'|'sole'|'toe'|'air' }
export interface LegPose { hip:Point3;knee:Point3;ankle:Point3;foot:FootPose;planted:boolean;phase:number }
export interface WalkPose { phase:number;hipHeight:number;left:LegPose;right:LegPose }
const wrap=(phase:number)=>phase-Math.floor(phase);
const ease=(t:number)=>t*t*(3-2*t);
const radians=(degrees:number)=>degrees*Math.PI/180;

/** Foot-local y runs heel to toe; z is height above the sole. Positive pitch lifts the toes. */
export function footPoint(foot:Pick<FootPose,'origin'|'pitch'>,y:number,z:number):Point3 {
  const {origin,pitch}=foot,c=Math.cos(pitch),s=Math.sin(pitch);
  return {x:origin.x,y:origin.y+y*c-z*s,z:origin.z+y*s+z*c};
}

function leg(side:LegSide,phase:number,hipHeight:number):LegPose {
  const t=wrap(phase),planted=t<=STANCE_FRACTION+1e-10;
  const swing=(t-STANCE_FRACTION)/(1-STANCE_FRACTION);
  const heelStrike=radians(20),toeOff=radians(-38);
  const pitch=planted?(t<.12?heelStrike*(1-ease(t/.12)):t>.36?toeOff*ease((t-.36)/.24):0)
    :toeOff+(heelStrike-toeOff)*ease(Math.min(1,swing/.65));
  const contact:FootPose['contact']=!planted?'air':pitch>0?'heel':pitch<0?'toe':'sole';
  // The footprint stays fixed in world space. Roll around its heel on landing,
  // then around its toe at push-off; the ankle follows the shoe, never slides it.
  const base=planted?12-STRIDE_DISTANCE*t:-12+24*ease(swing);
  const pivot=pitch>=0?FOOT_HEEL:FOOT_TOE,x=side==='right'?4:-4;
  const origin={x,y:base+pivot*(1-Math.cos(pitch)),z:-pivot*Math.sin(pitch)+(planted?0:6*Math.sin(Math.PI*swing))};
  const transform={origin,pitch};
  const foot:FootPose={...transform,heel:footPoint(transform,FOOT_HEEL,0),toe:footPoint(transform,FOOT_TOE,0),contact};
  const hip={x,y:0,z:hipHeight},ankle=footPoint(foot,0,ANKLE_HEIGHT);
  const dy=ankle.y,dz=ankle.z-hipHeight,d=Math.hypot(dy,dz);
  const bend=Math.sqrt(Math.max(0,LEG_LENGTH**2-d*d/4));
  // Choose the forward-bending knee solution in the anatomical sagittal plane.
  const knee={x,y:dy/2-dz/d*bend,z:(hipHeight+ankle.z)/2+dy/d*bend};
  return {hip,knee,ankle,foot,planted,phase:t};
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
