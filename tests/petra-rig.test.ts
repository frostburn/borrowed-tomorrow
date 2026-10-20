import { expect, it } from 'vitest';
import { petraPose, petraAttackPose } from '../src/art/petra-actor';
import { PETRA_PROPORTIONS } from '../src/art/rig-proportions';
import { project } from '../src/art/actor-space';
import { ACTOR_DIRECTIONS } from '../src/content/actors';
import { STANCE_FRACTION } from '../src/art/walk-cycle';
import { motionFrame, WALK_STRIDE_DISTANCE } from '../src/content/actor-motion';

function rigid(pose:ReturnType<typeof petraPose>){
  for(const side of ['left','right'] as const){
    const leg=pose[side],arm=pose.arms[side];
    for(const [a,b,length] of [[leg.hip,leg.knee,PETRA_PROPORTIONS.legLength],[leg.knee,leg.ankle,PETRA_PROPORTIONS.legLength],[arm.shoulder,arm.elbow,PETRA_PROPORTIONS.upperArmLength],[arm.elbow,arm.wrist,PETRA_PROPORTIONS.forearmLength]] as const)
      expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeCloseTo(length,9);
    expect(Math.min(leg.foot.heel.z,leg.foot.toe.z)).toBeGreaterThanOrEqual(-1e-10);
  }
  expect(pose.weapon?.kind).toBe('saber');expect(pose.weapon?.hand).toBe('right');expect(pose.weapon?.grip).toEqual(pose.arms.right.grip);
  expect(pose.shield?.hand).toBe('left');expect(pose.shield?.grip).toEqual(pose.arms.left.grip);
  expect(pose.arms.right.grip.x).toBeGreaterThan(0);expect(pose.arms.left.grip.x).toBeLessThan(0);
  expect(project(pose.arms.right.grip,'front').x).toBeLessThan(project(pose.arms.left.grip,'front').x);
  expect(project(pose.arms.right.grip,'back').x).toBeGreaterThan(project(pose.arms.left.grip,'back').x);
}

it('Petra keeps rigid limbs, a planted support foot and both anatomical weapon attachments throughout the gait',()=>{
  expect(petraPose(0)).toEqual(petraPose(1));
  expect(WALK_STRIDE_DISTANCE.petra).toBe(PETRA_PROPORTIONS.strideDistance);
  for(let i=0;i<120;i++){
    const pose=petraPose(i/120);rigid(pose);expect(pose.left.planted||pose.right.planted).toBe(true);
    const next=petraPose(i/120+.0001);
    for(const side of ['left','right'] as const){
      const leg=pose[side],after=next[side];
      if(!leg.planted||leg.phase+.0001>=STANCE_FRACTION||leg.foot.contact!==after.foot.contact)continue;
      for(const p of ['heel','toe'] as const)if(leg.foot[p].z<1e-10&&after.foot[p].z<1e-10)
        expect(leg.foot[p].y+i/120*24).toBeCloseTo(after.foot[p].y+(i/120+.0001)*24,9);
    }
  }
});

it('Petra braces on two unchanged feet for saber cuts and shield bashes',()=>{
  for(const attack of ['saber','bash'] as const){
    const windup=petraAttackPose('windup',attack),contact=petraAttackPose('contact',attack);
    for(const pose of [windup,contact]){
      rigid(pose);
      for(const side of ['left','right'] as const){expect(pose[side].foot).toEqual(windup[side].foot);expect(pose[side].foot.contact).toBe('sole');}
      for(const direction of ACTOR_DIRECTIONS)expect(Number.isFinite(project(pose.shield!.grip,direction).x)).toBe(true);
    }
    if(attack==='bash'){
      expect(contact.arms.left.grip.y).toBeGreaterThan(windup.arms.left.grip.y+6);
      expect(contact.arms.right.grip).toEqual(windup.arms.right.grip);
    }else expect(contact.arms.right.grip.y).toBeGreaterThan(windup.arms.right.grip.y+10);
  }
});

it('shield bash uses its own windup/contact frames and returns to idle on the shared timeline',()=>{
  expect([motionFrame('bash',0),motionFrame('bash',139),motionFrame('bash',140),motionFrame('bash',279),motionFrame('bash',280)]).toEqual([8,8,9,9,undefined]);
});
