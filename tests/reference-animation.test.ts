import { NELL_PROPORTIONS, REFERENCE_PROPORTIONS } from '../src/art/rig-proportions';
import { expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { ACTOR_DIRECTIONS } from '../src/content/actors';
import { ANKLE_HEIGHT, FOOT_HEEL, FOOT_TOE, LEG_LENGTH, referenceFrame as walkFrame, STANCE_FRACTION, STRIDE_DISTANCE } from '../src/art/walk-cycle';
import { FOREARM_LENGTH, referenceRigFrame as referenceFrame, referenceRig as referencePose, REFERENCE_WEAPONS, UPPER_ARM_LENGTH, weaponPoint } from '../src/art/reference-rig';
import { project } from '../src/art/actor-space';
import { renderLayers } from '../src/art/layered-sprite';
import { REFERENCE_ARM_LAYERS, REFERENCE_LAYERS, referenceLayers } from '../src/dev/reference-actor';

it('the walk keeps both bone lengths fixed, clears the floor and always has support',()=>{
  for(let i=0;i<240;i++){
    const pose=referencePose(i/240);expect(pose.left.planted||pose.right.planted).toBe(true);
    for(const side of ['left','right'] as const){
      const {hip,knee,ankle,foot}=pose[side];
      for(const [a,b] of [[hip,knee],[knee,ankle]])expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeCloseTo(LEG_LENGTH,10);
      for(const point of [foot.heel,foot.toe])expect(point.z).toBeGreaterThanOrEqual(-1e-10);
    }
    for(const layer of referenceLayers(pose))for(const vertex of layer.vertices)expect(vertex.z).toBeGreaterThanOrEqual(-1e-10);
  }
  for(const [phase,side] of [[.3,'left'],[.8,'right']] as const){
    const {hip,ankle}=referencePose(phase)[side];
    expect(Math.hypot(hip.x-ankle.x,hip.y-ankle.y,hip.z-ankle.z)).toBeGreaterThan(LEG_LENGTH*1.95);
  }
});

it('heel, sole and toe contacts stay fixed in world space as the ankle rolls, including cycle wrap',()=>{
  for(const [side,start,origin] of [['left',0,12],['right',.5,32]] as const){
    for(let i=0;i<=120;i++){
      const phase=start+STANCE_FRACTION*i/120,leg=referencePose(phase)[side],{foot}=leg;
      expect(leg.planted).toBe(true);
      for(const [point,offset] of [[foot.heel,FOOT_HEEL],[foot.toe,FOOT_TOE]] as const){
        if(point.z>1e-10)continue;
        expect(phase*STRIDE_DISTANCE+point.y).toBeCloseTo(origin+offset,10);
      }
      expect(Math.min(foot.heel.z,foot.toe.z)).toBeCloseTo(0,10);
    }
  }
});

it('shaped shoes land heel first, settle flat, push off the toe and clear both ends in swing',()=>{
  const landing=referencePose(0).left,support=referencePose(.25).left,push=referencePose(.5).left,swing=referencePose(.8).left;
  expect(landing.foot.contact).toBe('heel');expect(landing.foot.toe.z).toBeGreaterThan(3);
  expect(support.foot.contact).toBe('sole');expect(support.ankle.z).toBe(ANKLE_HEIGHT);
  expect(push.foot.contact).toBe('toe');expect(push.foot.heel.z).toBeGreaterThan(4);
  expect(swing.foot.contact).toBe('air');expect(Math.min(swing.foot.heel.z,swing.foot.toe.z)).toBeGreaterThan(5);
  for(let i=0;i<240;i++)for(const side of ['left','right'] as const){
    const {foot}=referencePose(i/240)[side];
    expect(Math.hypot(foot.toe.y-foot.heel.y,foot.toe.z-foot.heel.z)).toBeCloseTo(12,10);
    expect(foot.toe.y).toBeGreaterThan(foot.heel.y);
  }
  const parts=referenceLayers(referencePose(.25)).filter(layer=>layer.id==='left-foot');
  expect(new Set(parts.flatMap(layer=>layer.faces.map(face=>face.color))).size).toBe(2);
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

it.each(REFERENCE_WEAPONS)('%s loadout rasterizes every view with clean alpha, editable layers and a stable head',(weapon)=>{
  for(const direction of ACTOR_DIRECTIONS){
    const hashes=[];
    for(let frame=0;frame<6;frame++){
      const layers=referenceLayers(referenceFrame(frame,weapon)),pixels=renderLayers(layers,direction);
      expect(pixels).toHaveLength(80*80*4);hashes.push(createHash('sha256').update(pixels).digest('hex'));
      const alpha=pixels.filter((_,i)=>i%4===3);expect(new Set(alpha)).toEqual(new Set([0,255]));
      const border=Array.from({length:80},(_,i)=>[i,79*80+i,i*80,i*80+79]).flat();
      expect(border.every(pixel=>pixels[pixel*4+3]===0),`${direction} frame ${frame}: clear border`).toBe(true);
      expect(renderLayers(layers,direction,new Set()).some(n=>n!==0)).toBe(false);
    }
    expect(new Set(hashes).size).toBe(6);
    const head=(frame:number)=>Buffer.from(renderLayers(referenceLayers(referenceFrame(frame,weapon)),direction,new Set(['head'])));
    for(let i=0;i<3;i++)expect(head(i).equals(head(i+3)),`${direction} frame ${i}: stable head pixels`).toBe(true);
  }
});

it('both arm bones stay rigid and weapons stay attached to the anatomical right hand through the whole cycle',()=>{
  for(const weapon of REFERENCE_WEAPONS){
    expect(referencePose(1,weapon)).toEqual(referencePose(0,weapon));
    for(let i=0;i<120;i++){
      const pose=referencePose(i/120,weapon);
      for(const side of ['left','right'] as const){
        const {shoulder,elbow,wrist,grip}=pose.arms[side];
        expect(Math.hypot(shoulder.y-elbow.y,shoulder.z-elbow.z)).toBeCloseTo(UPPER_ARM_LENGTH,10);
        expect(Math.hypot(elbow.y-wrist.y,elbow.z-wrist.z)).toBeCloseTo(FOREARM_LENGTH,10);
        expect(grip.x*(side==='right'?1:-1)).toBeGreaterThan(0);
      }
      if(weapon==='none')expect(pose.weapon).toBeNull();
      else{
        expect(pose.weapon?.hand).toBe('right');expect(pose.weapon?.grip).toEqual(pose.arms.right.grip);
        expect(weaponPoint(pose.weapon!,0,0)).toEqual(pose.arms.right.grip);
        for(const vertex of referenceLayers(pose).filter(layer=>layer.id==='right-weapon').flatMap(layer=>layer.vertices))expect(vertex.x).toBeGreaterThan(0);
      }
    }
    for(let i=0;i<6;i++){
      const pose=referenceFrame(i,weapon),walk=walkFrame(i);
      expect(pose.left).toEqual(walk.left);expect(pose.right).toEqual(walk.right);expect(pose.hipHeight).toBe(walk.hipHeight);
    }
  }
});

it('right-hand grip depth and screen side are anatomical while the left arm counter-swings',()=>{
  for(const weapon of REFERENCE_WEAPONS)for(let i=0;i<6;i++){
    const pose=referenceFrame(i,weapon),left=pose.arms.left.grip,right=pose.arms.right.grip;
    expect(project(right,'front').x).toBeLessThan(40);expect(project(right,'back').x).toBeGreaterThan(40);
    // Compare at the same forward position and height to isolate the near/far side.
    const opposite={...right,x:left.x};
    expect(project(right,'right').depth).toBeGreaterThan(project(opposite,'right').depth);
    expect(project(right,'left').depth).toBeLessThan(project(opposite,'left').depth);
  }
  expect(referenceFrame(0).arms.left.grip.y).toBeLessThan(0);expect(referenceFrame(3).arms.left.grip.y).toBeGreaterThan(0);
  for(const weapon of ['lantern','lance'] as const){
    const carry=Array.from({length:6},(_,i)=>referenceFrame(i,weapon).arms.right.grip.y);
    expect(Math.max(...carry)-Math.min(...carry)).toBeLessThan(3);
  }
});

it('arms and weapon layers isolate cleanly and hiding them preserves the armless reference',()=>{
  const body=new Set(REFERENCE_LAYERS.filter(id=>!REFERENCE_ARM_LAYERS.some(arm=>arm===id)));
  for(let i=0;i<6;i++)for(const direction of ACTOR_DIRECTIONS){
    const base=Buffer.from(renderLayers(referenceLayers(referenceFrame(i)),direction,body));
    for(const weapon of ['lantern','lance'] as const){
      const layers=referenceLayers(referenceFrame(i,weapon));
      expect(Buffer.from(renderLayers(layers,direction,body)).equals(base),`${direction} frame ${i}: ${weapon} preserves body pixels`).toBe(true);
      for(const id of REFERENCE_ARM_LAYERS)expect(renderLayers(layers,direction,new Set([id])).some(n=>n!==0)).toBe(id!=='left-weapon');
    }
  }
});


it('configurable proportions keep rigid bones and planted contacts across compact and tall presets',()=>{
  for(const config of [REFERENCE_PROPORTIONS,NELL_PROPORTIONS,{...NELL_PROPORTIONS,hipHeight:18,legLength:10,strideDistance:26,upperArmLength:8}]){
    for(let i=0;i<120;i++)for(const weapon of REFERENCE_WEAPONS){
      const phase=i/120,pose=referencePose(phase,weapon,config);
      expect(pose.left.planted||pose.right.planted).toBe(true);
      for(const side of ['left','right'] as const){
        const leg=pose[side],arm=pose.arms[side];
        for(const [a,b,length] of [[leg.hip,leg.knee,config.legLength],[leg.knee,leg.ankle,config.legLength],[arm.shoulder,arm.elbow,config.upperArmLength],[arm.elbow,arm.wrist,config.forearmLength]] as const)
          expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeCloseTo(length,9);
        expect(Math.min(leg.foot.heel.z,leg.foot.toe.z)).toBeGreaterThanOrEqual(-1e-10);
        if(leg.planted&&leg.phase+.0001<STANCE_FRACTION){
          const mark=leg.foot.contact==='toe'?leg.foot.toe:leg.foot.heel;
          const next=referencePose(phase+.0001,weapon,config)[side].foot;
          const after=leg.foot.contact==='toe'?next.toe:next.heel;
          if(next.contact===leg.foot.contact)expect(mark.y+phase*config.strideDistance).toBeCloseTo(after.y+(phase+.0001)*config.strideDistance,8);
        }
      }
      expect(pose.weapon?.grip??null).toEqual(weapon==='none'?null:pose.arms.right.grip);
    }
    expect(referencePose(1,'lantern',config)).toEqual(referencePose(0,'lantern',config));
  }
  expect(()=>referencePose(0,'lantern',{...NELL_PROPORTIONS,legLength:5})).toThrow(/Legs cannot reach/);
});
