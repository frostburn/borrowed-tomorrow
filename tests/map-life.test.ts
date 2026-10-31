import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {lifePaused,lifeStep,sceneryAngle,sceneryPose,swayingScenery,movingScenery,steamSources,cloudLife,waterLife,snowLife} from '../src/content/map-life';
import {MAPS} from '../src/content/maps';
import {sceneArt,visibleSceneArt} from '../src/content/scene-art';

describe('ambient scenery respects collection and authored geometry',()=>{
 it('attaches foundry exhaust to the visible, transformed chimney caps',()=>{
  const piece=sceneArt(MAPS.hammerplain.tiles!)!.find(p=>p.url.endsWith('/casting-hall.svg'))!;
  const svg=readFileSync(`public/${piece.url}`,'utf8');
  const caps=[...svg.matchAll(/<polygon points="([^"]+)" fill="#8c8973"/g)].map(m=>m[1].split(' ').map(p=>p.split(',').map(Number)));
  const inside=(x:number,y:number,points:number[][])=>{
   let hit=false;
   for(let i=0,j=points.length-1;i<points.length;j=i++){
    const [a,b]=points[i],[c,d]=points[j];
    if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;
   }
   return hit;
  };
  const sources=steamSources([piece]);expect(sources).toHaveLength(caps.length);
  for(const source of sources){
   expect(source.y).toBeGreaterThanOrEqual(piece.y);
   expect(caps.some(cap=>inside(source.x-piece.x,source.y-piece.y+1,cap))).toBe(true);
  }
 });
 it('keeps collected water and vegetation still until the local release',()=>{
  for(const [map,flag]of [['rillbridge','villageFreed'],['cinderbank','coastCollectorWon'],['refuge','sanctuaryWardenWon'],['breakwater','sanctuaryWardenWon'],['sanctuary','sanctuaryWardenWon'],['stillcity','capitalStreetFreed'],['takenwater','takenPeopleFreed'],['firstfield','harvestFreed'],['quietward','wardPeopleFreed'],['seasonstreet','seasonsFreed']]){
   expect(lifePaused(map,{})).toBe(true);expect(lifePaused(map,{[flag]:true})).toBe(false);
  }
  expect(lifePaused('station',{})).toBe(false);
 });
 it('moves only foliage, with a planted pivot and a bounded canopy displacement',()=>{
  for(const url of ['art/vector/scenery/fir.svg','art/vector/chapter-six/jungle-near-tree.svg','art/vector/scenery/palm.svg','art/vector/scenes/station/canopy.svg'])expect(swayingScenery({url})).toBe(true);
  for(const url of ['art/vector/chapter-four/refuge-still-water.svg','art/vector/scenery/canopy-house.svg','art/vector/scenery/footbridge.svg'])expect(swayingScenery({url})).toBe(false);
  const tree={url:'art/vector/scenery/fir.svg',x:70,y:20,height:190};
  expect(sceneryAngle(tree)).toBe(0);
  const poses=Array.from({length:100},(_,i)=>sceneryAngle(tree,i*120));
  expect(new Set(poses).size).toBeGreaterThan(20);expect(Math.max(...poses.map(a=>Math.abs(a)*tree.height))).toBeLessThanOrEqual(3);
  expect(sceneryAngle({...tree,url:'house.svg'},4000)).toBe(0);
  expect(sceneryAngle(tree,1234)).toBe(sceneryAngle(tree,1290));
  expect(lifeStep(1234)).toBe(1200);
 });
 it('moves native background boats slowly while the berth, walking ship and mechanisms stay fixed',()=>{
  const boats=sceneArt(MAPS.coast.tiles!)!.filter(p=>p.motion);
  expect(boats).toHaveLength(4);
  const frozen={dx:0,dy:0,rotation:0};
  for(const boat of boats){
   expect(movingScenery(boat)).toBe(true);expect(sceneryPose(boat)).toEqual(frozen);
   for(let time=0;time<240000;time+=120){
    const a=sceneryPose(boat,time),b=sceneryPose(boat,time+120);
    expect(Math.abs(a.dx)).toBeLessThanOrEqual(48);expect(a.dy).toBe(0);expect(Math.abs(a.dx%2)).toBe(0);
    expect(Math.abs(b.dx-a.dx)).toBeLessThanOrEqual(2);
   }
  }
  const ferry=sceneArt(MAPS.breakwater.tiles!)!.find(p=>p.url.endsWith('/harbor-ferry-in.svg'))!;
  for(let time=0;time<40000;time+=120){const pose=sceneryPose(ferry,time);expect(pose.dx).toBe(0);expect(Math.abs(pose.dy)).toBeLessThanOrEqual(2);}
  for(const map of ['airfield','dawnwatch','windmere','canopy']as const)for(const piece of sceneArt(MAPS[map].tiles!)!.filter(p=>/survey|gangway|boarding|canopy-launch/.test(p.url)))expect(movingScenery(piece),piece.url).toBe(false);
  const hanging=sceneArt(MAPS.hollowsill.tiles!)!.find(p=>p.motion)!;
  expect(sceneryPose(hanging,4000,{})).toEqual(frozen);expect(sceneryPose(hanging,4000,{takenPeopleFreed:true})).not.toEqual(frozen);
 });
 it('gives all chapters local motion sources and keeps fleet visibility on its story layers',()=>{
  for(const map of ['station','coast','northglass','breakwater','airship','bellharbor','hollowsill']as const){
   const pieces=sceneArt(MAPS[map].tiles!)!;
   expect(pieces.some(movingScenery)||steamSources(pieces).length>0||!!cloudLife(map)||!!waterLife(map)||snowLife(map),map).toBe(true);
  }
  const boat=(flags:Record<string,boolean>)=>visibleSceneArt(MAPS.airship.tiles!,{flags})!.filter(p=>p.motion);
  expect(boat({})).toHaveLength(0);
  const stages:Record<string,boolean>[]=[{fleetSighted:true},{fleetSighted:true,emperorOfferTold:true},{fleetSighted:true,emperorOfferTold:true,allAnchorsSeen:true}];
  for(const flags of stages)expect(boat(flags)).toHaveLength(1);
  const blockade=boat({fleetSighted:true,emperorOfferTold:true,allAnchorsSeen:true})[0];
  const sky=visibleSceneArt(MAPS.airship.tiles!,{flags:{allAnchorsSeen:true}})!.find(p=>p.key==='scene-five-ship-blockade-sky')!;
  expect(sky.motion).toBeUndefined();expect(sky.layerId).toBe(blockade.layerId);
 });
});
