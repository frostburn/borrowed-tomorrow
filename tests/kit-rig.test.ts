import { ACTOR_DIRECTIONS } from '../src/content/actors';
import { expect, it } from 'vitest';
import { kitAttackPose, kitPose } from '../src/art/kit-actor';
import { armToGrip, weaponPoint } from '../src/art/reference-rig';
import { KIT_PROPORTIONS } from '../src/art/rig-proportions';
import { STANCE_FRACTION } from '../src/art/walk-cycle';
import { WALK_FRAMES, WALK_STRIDE_DISTANCE, walkFrameDistance } from '../src/content/actor-motion';

function rigid(pose:ReturnType<typeof kitPose>){
  for(const side of ['left','right'] as const){
    const leg=pose[side],arm=pose.arms[side];
    for(const [a,b,length] of [[leg.hip,leg.knee,KIT_PROPORTIONS.legLength],[leg.knee,leg.ankle,KIT_PROPORTIONS.legLength],[arm.shoulder,arm.elbow,KIT_PROPORTIONS.upperArmLength],[arm.elbow,arm.wrist,KIT_PROPORTIONS.forearmLength]] as const)
      expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeCloseTo(length,9);
    expect(Math.min(leg.foot.heel.z,leg.foot.toe.z)).toBeGreaterThanOrEqual(-1e-10);
  }
  expect(pose.weapon?.kind).toBe('crossbow');expect(pose.weapon?.hand).toBe('right');
  expect(pose.weapon?.grip).toEqual(pose.arms.right.grip);expect(pose.weapon!.grip.x).toBeGreaterThan(0);
  expect(pose.satchel.anchor.x).toBeLessThan(0);
}

it('Kit keeps rigid compact limbs, grounded support, a right-hand bow and a left-hip satchel throughout his gait',()=>{
  expect(kitPose(1)).toEqual(kitPose(0));
  for(const direction of ACTOR_DIRECTIONS)for(let i=0;i<120;i++){
    const pose=kitPose(i/120,KIT_PROPORTIONS,direction);rigid(pose);expect(pose.left.planted||pose.right.planted).toBe(true);
  }
});

it('Kit runtime travel cancels heel/toe movement during support',()=>{
  expect(WALK_STRIDE_DISTANCE.kit).toBe(KIT_PROPORTIONS.strideDistance);
  expect(walkFrameDistance('kit')*WALK_FRAMES).toBe(KIT_PROPORTIONS.strideDistance);
  for(const direction of ACTOR_DIRECTIONS)for(const side of ['left','right'] as const)for(let i=0;i<120;i++){
    const phase=i/120,leg=kitPose(phase,KIT_PROPORTIONS,direction)[side],next=kitPose(phase+.0001,KIT_PROPORTIONS,direction)[side];
    if(!leg.planted||leg.phase+.0001>=STANCE_FRACTION||leg.foot.contact!==next.foot.contact)continue;
    for(const key of ['heel','toe'] as const){
      if(leg.foot[key].z>1e-10||next.foot[key].z>1e-10)continue;
      expect(leg.foot[key].y+phase*26).toBeCloseTo(next.foot[key].y+(phase+.0001)*26,9);
    }
  }
});

it('Kit raises and fires the bow with cross-body support and two fixed feet',()=>{
  const windup=kitAttackPose('windup'),contact=kitAttackPose('contact');
  for(const pose of [windup,contact]){
    rigid(pose);
    for(const side of ['left','right'] as const){
      expect(pose[side].foot).toEqual(windup[side].foot);
      expect(pose[side].foot.contact).toBe('sole');expect(pose[side].planted).toBe(true);
      expect(pose[side].foot.heel.z).toBe(0);expect(pose[side].foot.toe.z).toBe(0);
    }
    expect(pose.arms.left.grip.x).toBeGreaterThan(0);expect(pose.arms.left.shoulder.x).toBeLessThan(0);
    expect(Math.hypot(pose.arms.left.grip.x-pose.arms.right.grip.x,pose.arms.left.grip.y-pose.arms.right.grip.y,pose.arms.left.grip.z-pose.arms.right.grip.z)).toBeLessThan(6);
  }
  expect(contact.arms.right.grip.z).toBeGreaterThan(windup.arms.right.grip.z);
  const tip=weaponPoint(contact.weapon!,16,0);expect(tip.y).toBeGreaterThan(contact.weapon!.grip.y);expect(tip.z).toBe(contact.weapon!.grip.z);
  expect(()=>armToGrip({x:-9,y:0,z:40},{x:20,y:10,z:30},KIT_PROPORTIONS)).toThrow('Arms cannot reach');
});
