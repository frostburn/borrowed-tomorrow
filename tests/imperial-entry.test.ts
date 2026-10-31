import {expect,it} from 'vitest';
import {readFileSync,statSync} from 'node:fs';
import {IMPERIAL_ENTRY_ASSETS,IMPERIAL_CLOSE_MS,IMPERIAL_UNFOLD_MS,IMPERIAL_WALK_MS,imperialEntryPose} from '../src/content/imperial-entry';
import {cinematicAssets,EMPEROR_WALK} from '../src/content/cinematic-art';
import {resumeChapterSix} from '../src/content/chapter-six/interactions';
import {imperialEntryCheckpoint} from './support/imperial-entry';
import {decodeSave} from '../src/rules/save';
import {MAPS} from '../src/content/maps';
import {visibleSceneArt} from '../src/content/scene-art';
import type {StoryHost} from '../src/content/story-host';
import type {Dialogue} from '../src/content/dialogue';

it('closes around the human before revealing the giant likeness and settles at the existing crown anchors',()=>{
 const open=imperialEntryPose(0),closed=imperialEntryPose(IMPERIAL_CLOSE_MS),end=imperialEntryPose(IMPERIAL_CLOSE_MS+IMPERIAL_UNFOLD_MS);
 expect(open).toMatchObject({closed:0,growth:0,scale:.5,plateGap:84,humanAlpha:1,faceAlpha:0,supportAlpha:0});
 expect(closed).toMatchObject({closed:1,growth:0,scale:.5,plateGap:0,humanAlpha:0,faceAlpha:0});
 expect(end).toMatchObject({closed:1,growth:1,scale:1,y:504,plateGap:0,armAngle:0,humanAlpha:0,faceAlpha:1,supportAlpha:1,supportSpread:238,supportY:509});
 const pieces=visibleSceneArt(MAPS.crown.tiles!,{flags:{}})!,body=pieces.find(p=>p.key==='scene-six-crown-vessel')!,supports=['west','east'].map(side=>pieces.find(p=>p.key===`scene-six-crown-${side}-support`)!);
 expect(body.x+body.width/2).toBe(780);expect(body.y+body.height).toBe(end.y);
 expect(supports.map(p=>p.x+p.width/2)).toEqual([end.supportCenter-end.supportSpread,end.supportCenter+end.supportSpread]);
 expect(supports.map(p=>p.y+p.height)).toEqual([end.supportY,end.supportY]);
 expect(imperialEntryPose(-100)).toEqual(open);expect(imperialEntryPose(100000)).toEqual(end);
 let scale=0,gap=Infinity;
 for(let t=0;t<=3600;t+=50){const p=imperialEntryPose(t);expect(p.scale).toBeGreaterThanOrEqual(scale);expect(p.plateGap).toBeLessThanOrEqual(gap);if(p.faceAlpha)expect(p.humanAlpha).toBe(0);scale=p.scale;gap=p.plateGap;}
});

it('loads the native entry pieces and human walk with crown restores, within the image budget',()=>{
 const assets=cinematicAssets('crown');
 for(const key of EMPEROR_WALK)expect(assets.some(a=>a.key===key)).toBe(true);
 expect(IMPERIAL_ENTRY_ASSETS).toHaveLength(8);
 for(const asset of IMPERIAL_ENTRY_ASSETS){
  expect(assets).toContainEqual(asset);const path=`public/${asset.url}`,svg=readFileSync(path,'utf8');
  expect(statSync(path).size).toBeLessThan(128*1024);expect(svg).toContain('width="528" height="280"');expect(svg).not.toMatch(/data:image|<image\b/);
 }
});

for(const recovered of [false,true])it(`stages the human Emperor before battle with Nell ${recovered?'recovered':'aboard'}, committing only on completion`,()=>{
 const s=imperialEntryCheckpoint(recovered),before=structuredClone(s);let d:Dialogue|undefined;
 const host={state:s,talk:(dialogue:Dialogue)=>{d=dialogue;},commit:(flag:string)=>{s.flags[flag]=true;}}as unknown as StoryHost;
 resumeChapterSix(host);expect(s).toEqual(before);expect(d?.scene?.id).toBe('six-imperial-vessel');expect(d?.scene?.dialoguePosition??'bottom').toBe('bottom');
 expect(d?.scene?.actors.find(a=>a.id==='emperor')?.at).toEqual({x:36,y:19});expect(d?.scene?.actors.some(a=>a.id==='nell')).toBe(recovered);
 expect(d?.lines.slice(0,3).map(l=>[l.shot?.effect,l.shot?.duration])).toEqual([['imperial-enter',IMPERIAL_WALK_MS],['imperial-close',IMPERIAL_CLOSE_MS],['imperial-unfold',IMPERIAL_UNFOLD_MS]]);
 const entrance=d!.lines[0].shot!,vessel=d!.lines[2].shot!,reply=d!.lines.find(l=>l.who==='Celia')!.shot!;
 expect(vessel.focus!.y).toBeLessThan(entrance.focus!.y);expect(reply.focus!.y).toBeGreaterThan(28);expect(reply.cut).toBeUndefined();expect(reply.duration).toBe(1400);
 expect(d?.lines.every(l=>!l.shot?.music)).toBe(true);expect(d?.lines.some(l=>l.who==='The Emperor')).toBe(true);
 d!.done!();expect(s).toEqual({...before,flags:{...before.flags,emperorSeen:true}});expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
