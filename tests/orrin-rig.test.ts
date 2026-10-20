import { expect, it } from 'vitest';
import { orrinPose } from '../src/art/orrin-actor';
import { ORRIN_PROPORTIONS } from '../src/art/rig-proportions';
import { STANCE_FRACTION } from '../src/art/walk-cycle';
import { walkFrameDistance, WALK_STRIDE_DISTANCE, WALK_FRAMES } from '../src/content/actor-motion';

it('Orrin keeps rigid stocky limbs, grounded support and a right-hand lance throughout the cycle',()=>{
  expect(orrinPose(1)).toEqual(orrinPose(0));
  for(let i=0;i<240;i++){
    const pose=orrinPose(i/240);
    expect(pose.left.planted||pose.right.planted).toBe(true);
    for(const side of ['left','right'] as const){
      const leg=pose[side],arm=pose.arms[side];
      for(const [a,b,length] of [[leg.hip,leg.knee,ORRIN_PROPORTIONS.legLength],[leg.knee,leg.ankle,ORRIN_PROPORTIONS.legLength],[arm.shoulder,arm.elbow,ORRIN_PROPORTIONS.upperArmLength],[arm.elbow,arm.wrist,ORRIN_PROPORTIONS.forearmLength]] as const)
        expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeCloseTo(length,9);
      expect(Math.min(leg.foot.heel.z,leg.foot.toe.z)).toBeGreaterThanOrEqual(-1e-10);
    }
    expect(pose.weapon?.kind).toBe('lance');expect(pose.weapon?.hand).toBe('right');
    expect(pose.weapon?.grip).toEqual(pose.arms.right.grip);expect(pose.arms.right.grip.x).toBeGreaterThan(0);
  }
});

it('Orrin runtime stride cancels planted-foot movement through heel and toe roll',()=>{
  expect(WALK_STRIDE_DISTANCE.orrin).toBe(ORRIN_PROPORTIONS.strideDistance);
  expect(walkFrameDistance('orrin')*WALK_FRAMES).toBe(ORRIN_PROPORTIONS.strideDistance);
  for(const side of ['left','right'] as const)for(let i=0;i<120;i++){
    const phase=i/120,leg=orrinPose(phase)[side],next=orrinPose(phase+.0001)[side];
    if(!leg.planted||leg.phase+.0001>=STANCE_FRACTION||leg.foot.contact!==next.foot.contact)continue;
    for(const key of ['heel','toe'] as const){
      if(leg.foot[key].z>1e-10||next.foot[key].z>1e-10)continue;
      expect(leg.foot[key].y+phase*ORRIN_PROPORTIONS.strideDistance).toBeCloseTo(next.foot[key].y+(phase+.0001)*ORRIN_PROPORTIONS.strideDistance,9);
    }
  }
});
