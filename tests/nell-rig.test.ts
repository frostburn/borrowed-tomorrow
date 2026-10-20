import { project } from '../src/art/actor-space';
import { expect, it } from 'vitest';
import { nellAttackPose, nellPose } from '../src/art/nell-actor';
import { NELL_PROPORTIONS } from '../src/art/rig-proportions';
import { REFERENCE_FRAMES } from '../src/art/walk-cycle';
import { walkFrameDistance, WALK_STRIDE_DISTANCE } from '../src/content/actor-motion';

it('Nell retains the reference foot contacts and rigid limbs after retargeting',()=>{
  expect(nellPose(1)).toEqual(nellPose(0));
  for(let i=0;i<240;i++){
    const pose=nellPose(i/240);
    for(const side of ['left','right'] as const){
      const {hip,knee,ankle,foot}=pose[side],arm=pose.arms[side];
      expect(Math.min(foot.heel.z,foot.toe.z)).toBeGreaterThanOrEqual(-1e-10);
      expect(hip.z).toBeLessThan(20);
      for(const [a,b,length] of [[hip,knee,NELL_PROPORTIONS.legLength],[knee,ankle,NELL_PROPORTIONS.legLength],[arm.shoulder,arm.elbow,NELL_PROPORTIONS.upperArmLength],[arm.elbow,arm.wrist,NELL_PROPORTIONS.forearmLength]] as const){
        expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeCloseTo(length,9);
      }
    }
    expect(pose.weapon?.grip).toEqual(pose.arms.right.grip);expect(pose.weapon?.hand).toBe('right');
  }
});

it('Nell playback cancels planted-foot travel using her authored stride distance',()=>{
  expect(WALK_STRIDE_DISTANCE.nell).toBe(NELL_PROPORTIONS.strideDistance);expect(walkFrameDistance('nell')*REFERENCE_FRAMES).toBe(NELL_PROPORTIONS.strideDistance);
  expect(walkFrameDistance('orrin')).toBe(10);
  for(let frame=0;frame<6;frame++){
    const pose=nellPose(frame/6),travel=frame*walkFrameDistance('nell');
    for(const side of ['left','right'] as const){
      const leg=pose[side];if(!leg.planted)continue;
      const contact=leg.foot.contact==='toe'?leg.foot.toe:leg.foot.heel;
      const other=nellPose((frame+.1)/6)[side],later=other.foot.contact==='toe'?other.foot.toe:other.foot.heel;
      expect(contact.y+travel).toBeCloseTo(later.y+travel+.1*walkFrameDistance('nell'),9);
    }
  }
});


it('Nell braces on the same flat feet and thrusts her right-hand lantern forward with rigid bones',()=>{
  const windup=nellAttackPose('windup'),contact=nellAttackPose('contact');
  for(const pose of [windup,contact]){
    for(const side of ['left','right'] as const){
      const {hip,knee,ankle,foot}=pose[side],arm=pose.arms[side];
      expect(foot.contact).toBe('sole');expect(foot.heel.z).toBe(0);expect(foot.toe.z).toBe(0);
      expect(pose[side].planted).toBe(true);expect(foot).toEqual(windup[side].foot);
      for(const [a,b,length] of [[hip,knee,NELL_PROPORTIONS.legLength],[knee,ankle,NELL_PROPORTIONS.legLength],[arm.shoulder,arm.elbow,NELL_PROPORTIONS.upperArmLength],[arm.elbow,arm.wrist,NELL_PROPORTIONS.forearmLength]] as const)
        expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeCloseTo(length,9);
    }
    expect(pose.weapon?.hand).toBe('right');expect(pose.weapon?.grip).toEqual(pose.arms.right.grip);
    expect(pose.weapon!.grip.x).toBeGreaterThan(0);
  }
  expect(windup.arms.right.grip.y).toBeLessThan(0);expect(contact.arms.right.grip.y).toBeGreaterThan(0);
  expect(project(contact.arms.right.grip,'left').x).toBeLessThan(project(windup.arms.right.grip,'left').x);
  expect(project(contact.arms.right.grip,'right').x).toBeGreaterThan(project(windup.arms.right.grip,'right').x);
});
