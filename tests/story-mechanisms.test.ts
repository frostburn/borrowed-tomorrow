import {describe,it,expect} from 'vitest';
import {readFileSync,statSync} from 'node:fs';
import {MECHANISM_FRAMES,MECHANISM_SHEETS,mechanismAssets,mechanismTexture,liveMechanismPiece,harborFerryPosition,mechanismPoseForPiece} from '../src/content/story-mechanisms';
import {sceneArt,visibleSceneArt} from '../src/content/scene-art';
import {MAPS} from '../src/content/maps';
import * as four from '../src/content/chapter-four/scenes';
import * as five from '../src/content/chapter-five/scenes';
import * as watch from '../src/content/chapter-five/dawnwatch-scenes';
import * as ward from '../src/content/chapter-five/windmere-scenes';
import * as two from '../src/content/chapter-two/scenes';
import * as seven from '../src/content/chapter-seven/scenes';

describe('native story mechanisms',()=>{
 for(const [name,d]of Object.entries(MECHANISM_SHEETS))it(`${name} loads with its real map at native dimensions`,()=>{
  const asset=mechanismAssets(d.map).find(a=>a.key===mechanismTexture(name as keyof typeof MECHANISM_SHEETS))!;
  const svg=readFileSync('public/'+asset.url,'utf8');expect(svg).toContain(`width="${d.width*MECHANISM_FRAMES}" height="${d.height}"`);
  expect(statSync('public/'+asset.url).size).toBeLessThan(128*1024);
  expect(sceneArt(MAPS[d.map].tiles!)!.some(p=>p.key===d.target)).toBe(true);
 });
 it('stages explicit effects at their actual narrated actions',()=>{
  for(const [scene,effect]of [[two.freePrisoners(),'coach-open'],[four.openGate(),'harbor-open'],[four.cable(),'cable-release'],[five.water(),'cooling-open'],[five.release(),'forge-release'],[watch.release(),'watch-release'],[ward.lift(),'water-wheel'],[ward.release(),'ward-release'],[seven.seasonsFree(),'season-open']]as const){
   expect(scene.lines.filter(l=>l.shot?.mechanism===effect)).toHaveLength(1);
  }
 });
 it('keeps the narrated season gate in exactly one saved pose without changing traversal data',()=>{
  const map=MAPS.seasonstreet.tiles!,gate=(open:boolean)=>visibleSceneArt(map,{flags:open?{seasonsFreed:true}:{}})!.filter(p=>p.key.startsWith('scene-mechanism-season-gate-')).map(p=>p.key);
  expect(gate(false)).toEqual(['scene-mechanism-season-gate-closed']);expect(gate(true)).toEqual(['scene-mechanism-season-gate-open']);
  for(const layer of map.layers.filter(l=>l.name.startsWith('season-return-gate-')))expect(layer.data).toBeUndefined();
 });
 it('shares saved terminal poses with Maps review',()=>{
  expect(mechanismPoseForPiece('scene-two-prop-coast-prison-coach',{})?.frame).toBe(0);
  expect(mechanismPoseForPiece('scene-two-prop-coast-prison-coach',{prisonersFreed:true})?.frame).toBe(16);
  expect(mechanismPoseForPiece('scene-five-watch-anchor',{dawnwatchFreed:true})?.frame).toBe(16);
  expect(mechanismPoseForPiece('scene-five-mirrorward-floor',{})).toBeUndefined();
 });
 it('takes the ferry around the quay before returning to the lower mooring',()=>{
  const from={x:1170,y:228};expect(harborFerryPosition(0,from)).toEqual(from);expect(harborFerryPosition(1,from)).toEqual({x:36,y:768});
  for(let i=0;i<=100;i++){const p=i/100,pos=harborFerryPosition(p,from);expect(pos.y===228||pos.x>=1536||pos.y===768).toBe(true);}
 });
 it('preserves separately animated return-light images in the floor cache',()=>{
  for(const [map,key]of [['anchorforge','scene-five-gantry-signal'],['signalwall','scene-five-watch-return-line'],['mirrorward','scene-five-gallery-light']]as const){
   expect(liveMechanismPiece(key)).toBe(true);expect(sceneArt(MAPS[map].tiles!)!.some(p=>p.key===key)).toBe(true);
  }
  expect(liveMechanismPiece('scene-five-anchorforge-floor')).toBe(false);
 });
});
