import { expect, it } from 'vitest';
import { nellPose, NELL_LEG_LENGTH } from '../src/art/nell-actor';
import { referenceRig, FOREARM_LENGTH, UPPER_ARM_LENGTH } from '../src/art/reference-rig';
import { REFERENCE_FRAMES, STRIDE_DISTANCE } from '../src/art/walk-cycle';
import { walkFrameDistance, WALK_STRIDE_DISTANCE } from '../src/content/actor-motion';

it('Nell retains the reference foot contacts and rigid limbs after retargeting',()=>{
  expect(nellPose(1)).toEqual(nellPose(0));
  for(let i=0;i<240;i++){
    const pose=nellPose(i/240),reference=referenceRig(i/240,'lantern');
    for(const side of ['left','right'] as const){
      const {hip,knee,ankle,foot}=pose[side],arm=pose.arms[side];
      expect(foot).toEqual(reference[side].foot);
      for(const [a,b,length] of [[hip,knee,NELL_LEG_LENGTH],[knee,ankle,NELL_LEG_LENGTH],[arm.shoulder,arm.elbow,UPPER_ARM_LENGTH],[arm.elbow,arm.wrist,FOREARM_LENGTH]] as const){
        expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeCloseTo(length,9);
      }
    }
    expect(pose.weapon?.grip).toEqual(pose.arms.right.grip);expect(pose.weapon?.hand).toBe('right');
  }
});

it('Nell playback cancels planted-foot travel using her authored stride distance',()=>{
  expect(WALK_STRIDE_DISTANCE.nell).toBe(STRIDE_DISTANCE);expect(walkFrameDistance('nell')*REFERENCE_FRAMES).toBe(STRIDE_DISTANCE);
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
