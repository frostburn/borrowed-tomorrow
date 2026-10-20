import type { Point3 } from './actor-space';
import { referencePose, REFERENCE_FRAMES, type LegSide, type WalkPose } from './walk-cycle';

export const REFERENCE_WEAPONS = ['none','lantern','lance'] as const;
export type ReferenceWeapon = typeof REFERENCE_WEAPONS[number];
export const UPPER_ARM_LENGTH = 9;
export const FOREARM_LENGTH = 8;
export interface ArmPose { shoulder:Point3;elbow:Point3;wrist:Point3;grip:Point3 }
export interface WeaponPose { kind:Exclude<ReferenceWeapon,'none'>;hand:'right';grip:Point3;pitch:number }
export interface ReferencePose extends WalkPose { arms:Record<LegSide,ArmPose>;weapon:WeaponPose|null }

function arm(side:LegSide,pose:WalkPose,weapon:ReferenceWeapon):ArmPose {
  const right=side==='right',holding=right&&weapon!=='none',cycle=pose.phase*2*Math.PI,swing=Math.cos(cycle);
  const x=right?10:-10,shoulder={x,y:0,z:pose.hipHeight+14};
  const grip={x,y:holding?(weapon==='lantern'?4+swing:6+.6*swing):(right?1:-1)*5.5*swing,
    z:pose.hipHeight+(holding?(weapon==='lantern'?-.5:3): -2)};
  const wrist={...grip,z:grip.z+1.6};
  const dy=wrist.y,dz=wrist.z-shoulder.z,d=Math.hypot(dy,dz);
  const along=(UPPER_ARM_LENGTH**2-FOREARM_LENGTH**2+d*d)/(2*d),bend=Math.sqrt(UPPER_ARM_LENGTH**2-along*along);
  // Elbows bend back; the forearm reaches forward to the wrist. Both bones stay rigid.
  const elbow={x,y:along*dy/d+bend*dz/d,z:shoulder.z+along*dz/d-bend*dy/d};
  return {shoulder,elbow,wrist,grip};
}

/** Attach arms to the accepted walk without changing its legs, feet or body rise. */
export function referenceRig(phase:number,weapon:ReferenceWeapon='none'):ReferencePose {
  const pose=referencePose(phase),arms={left:arm('left',pose,weapon),right:arm('right',pose,weapon)};
  const pitch=(weapon==='lantern'?5*Math.sin(pose.phase*2*Math.PI):-24+2*Math.sin(pose.phase*2*Math.PI))*Math.PI/180;
  return {...pose,arms,weapon:weapon==='none'?null:{kind:weapon,hand:'right',grip:arms.right.grip,pitch}};
}
export const referenceRigFrame=(frame:number,weapon:ReferenceWeapon='none')=>referenceRig(frame/REFERENCE_FRAMES,weapon);

/** Weapon-local origin is the right hand's grip, shared by every view and mesh. */
export function weaponPoint(weapon:WeaponPose,y:number,z:number,x=0):Point3 {
  const c=Math.cos(weapon.pitch),s=Math.sin(weapon.pitch),p=weapon.grip;
  return {x:p.x+x,y:p.y+y*c-z*s,z:p.z+y*s+z*c};
}
