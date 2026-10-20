import { expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { ACTOR_DIRECTIONS } from '../src/content/actors';
import { ANKLE_HEIGHT, LEG_LENGTH, referenceFrame, referencePose, STANCE_FRACTION, STRIDE_DISTANCE } from '../src/art/walk-cycle';
import { project } from '../src/art/actor-space';
import { renderLayers } from '../src/art/layered-sprite';
import { referenceLayers } from '../src/dev/reference-actor';

it('the walk keeps both bone lengths fixed, clears the floor and always has support',()=>{
  for(let i=0;i<240;i++){
    const pose=referencePose(i/240);expect(pose.left.planted||pose.right.planted).toBe(true);
    for(const side of ['left','right'] as const){
      const {hip,knee,ankle}=pose[side];
      for(const [a,b] of [[hip,knee],[knee,ankle]])expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeCloseTo(LEG_LENGTH,10);
      expect(ankle.z).toBeGreaterThanOrEqual(ANKLE_HEIGHT-1e-10);
    }
  }
});

it('a planted foot remains fixed in world space throughout support, including cycle wrap',()=>{
  for(const [side,start,contact] of [['left',0,12],['right',.5,32]] as const){
    for(let i=0;i<=120;i++){
      const phase=start+STANCE_FRACTION*i/120,foot=referencePose(phase)[side];
      expect(foot.planted).toBe(true);
      expect(phase*STRIDE_DISTANCE+foot.ankle.y).toBeCloseTo(contact,10);
      expect(foot.ankle.z-ANKLE_HEIGHT).toBeCloseTo(0,10);
    }
  }
});

it('the opposite leg swings with a forward knee and the complete pose closes exactly',()=>{
  expect(referencePose(1)).toEqual(referencePose(0));
  for(const [frame,side] of [[2,'right'],[5,'left']] as const){
    const leg=referenceFrame(frame)[side];expect(leg.planted).toBe(false);
    expect(leg.ankle.z-ANKLE_HEIGHT).toBeGreaterThan(5);
    expect(leg.knee.y).toBeGreaterThan(leg.ankle.y);
  }
  const first=referenceFrame(0),opposite=referenceFrame(3);
  expect(first.left.ankle.y).toBe(opposite.right.ankle.y);
  expect(first.right.ankle.y).toBe(opposite.left.ankle.y);
});

it('anatomical right stays left in front, right in back, near in right profile and far in left profile',()=>{
  const pose=referenceFrame(0),left=pose.left.hip,right=pose.right.hip;
  expect(project(right,'front').x).toBeLessThan(project(left,'front').x);
  expect(project(right,'back').x).toBeGreaterThan(project(left,'back').x);
  expect(project(right,'right').depth).toBeGreaterThan(project(left,'right').depth);
  expect(project(right,'left').depth).toBeLessThan(project(left,'left').depth);
});

it('all views rasterize six distinct native poses with clean alpha, editable layers and a stable head',()=>{
  for(const direction of ACTOR_DIRECTIONS){
    const hashes=[];
    for(let frame=0;frame<6;frame++){
      const layers=referenceLayers(referenceFrame(frame)),pixels=renderLayers(layers,direction);
      expect(pixels).toHaveLength(80*80*4);hashes.push(createHash('sha256').update(pixels).digest('hex'));
      const alpha=pixels.filter((_,i)=>i%4===3);expect(new Set(alpha)).toEqual(new Set([0,255]));
      for(let i=0;i<80;i++)for(const pixel of [i,79*80+i,i*80,i*80+79])expect(pixels[pixel*4+3]).toBe(0);
      expect(renderLayers(layers,direction,new Set()).some(n=>n!==0)).toBe(false);
    }
    expect(new Set(hashes).size).toBe(6);
    const head=(frame:number)=>renderLayers(referenceLayers(referenceFrame(frame)),direction,new Set(['head']));
    expect(head(0)).toEqual(head(3));expect(head(1)).toEqual(head(2));
  }
});
