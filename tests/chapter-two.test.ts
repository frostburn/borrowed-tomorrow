import { expect, it } from 'vitest';
import { beginChapterTwo, decodeSave, recruit, remember, setActive, THIRD_CHAPTER } from '../src/rules/state';
import { interactChapterTwo, resumeChapterTwo } from '../src/content/chapter-two/interactions';
import type { StoryHost } from '../src/content/chapter-one/interactions';
import type { Dialogue } from '../src/content/dialogue';
import { awardVictory, createBattle } from '../src/rules/combat';
import { MAPS, walkable } from '../src/content/maps';
import * as scenes from '../src/content/chapter-two/scenes';
import { coastCheckpoint, checkpoint } from './support/progress';
import { equipItem, ownedCopies, receiveItem } from '../src/rules/inventory';

function journey() {
  const state=checkpoint('chapterOneComplete'); beginChapterTwo(state);
  let dialogue: Dialogue | undefined, battle: string | undefined, boundaries=0;
  const host:StoryHost={state,talk:d=>{dialogue=d;},commit:(flag,entry)=>{state.flags[flag]=true;if(entry)remember(state,entry);},refresh(){},save(){},travel:(map,x,y)=>{state.location={map,x,y};},battle:id=>{battle=id;},shop(){},boundary(){boundaries++;},toast(){},endingMusic(){}};
  const finish=()=>{dialogue!.done!();};
  const win=()=>{const b=createBattle(battle!,state);b.result='victory';awardVictory(b,state);if(battle)remember(state,battle);};
  return {host,state,finish,read:()=>dialogue!,battle:()=>battle,win,boundaries:()=>boundaries};
}
function raid(diversion:boolean) {
  const j=journey(); resumeChapterTwo(j.host);j.finish();interactChapterTwo(j.host,'kit-contact');j.finish();
  interactChapterTwo(j.host,diversion?'signal-walk':'loading-gate');j.read().choices![0].action();j.finish();j.win();
  return j;
}
it('migrates an actual v6 departure without losing gear, choices, health or resources',()=>{
  const source=checkpoint('chapterOneComplete');source.flags.muralRead=true;source.party[0].hp=27;source.playSeconds=998;
  receiveItem(source.inventory,'work-coat',3);equipItem(source.inventory,'orrin','work-coat');
  const {activeParty:_,...old}=source, s=decodeSave(JSON.stringify({...old,version:6})), before=structuredClone(s);
  expect(s.activeParty).toEqual(['nell','orrin']);expect(beginChapterTwo(s)).toBe(true);
  expect(s).toMatchObject({...before,chapter:'chapter-two',boundary:null,location:{map:'coast',x:24,y:26}});
  expect(decodeSave(JSON.stringify(s))).toEqual(s);expect(beginChapterTwo(s)).toBe(false);
});
it('commits Kit only at scene completion and never duplicates recruitment',()=>{
  const j=journey();resumeChapterTwo(j.host);expect(j.state.flags.coastSeen).toBeUndefined();j.finish();
  interactChapterTwo(j.host,'kit-contact');expect(j.state.party).toHaveLength(2);j.finish();
  expect(j.state.activeParty).toEqual(['nell','orrin','kit']);expect(j.state.party).toHaveLength(3);
  recruit(j.state,'kit');expect(j.state.party).toHaveLength(3);expect(decodeSave(JSON.stringify(j.state))).toEqual(j.state);
  expect(createBattle('coast-loading',j.state).units.find(u=>u.id==='kit')).toMatchObject({name:'Kit',movement:4,speed:9,abilities:expect.arrayContaining(['quickshot','bolt','feint'])});
});
for(const diversion of [true,false])it(`raid ${diversion?'signals':'loading'} pays its reward once and opens the capital lead`,()=>{
  const j=raid(diversion);expect(j.battle()).toBe(diversion?'coast-signals':'coast-loading');
  expect(ownedCopies(j.state.inventory,'courier-sight')).toBe(1);const xp=j.state.xp;j.win();expect(j.state.xp).toBe(xp);
  interactChapterTwo(j.host,'prison-coach');expect(j.state.flags.prisonersFreed).toBeUndefined();j.finish();
  expect(j.state.journal).toContain('prisoners');expect(decodeSave(JSON.stringify(j.state))).toEqual(j.state);
});
it('keeps the ward as a safe stop and the traveling party at Nell, Orrin and Kit',()=>{
  const j=raid(true);interactChapterTwo(j.host,'prison-coach');j.finish();interactChapterTwo(j.host,'coast-ward');resumeChapterTwo(j.host);j.finish();
  expect(j.state.party.map(h=>h.id)).toEqual(['nell','orrin','kit']);expect(j.state.flags.celiaJoined).toBeUndefined();
  expect(setActive(j.state,'celia',true)).toBe(false);expect(setActive(j.state,'nell',false)).toBe(false);
  receiveItem(j.state.inventory,'work-coat');equipItem(j.state.inventory,'orrin','work-coat');
  const b=createBattle('coast-collector',j.state);expect(b.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['nell','orrin','kit']);
  b.result='victory';awardVictory(b,j.state);expect(j.state.inventory.characters.orrin.coat).toBe('work-coat');
  j.state.flags.settlementSeen=true;j.state.location={map:'cinderbank',x:27,y:22};
  expect(decodeSave(JSON.stringify(j.state))).toEqual(j.state);
});
it('migrates the former four-person v7 chapter without losing progress or equipped copies',()=>{
  const legacy=coastCheckpoint('chapterTwoComplete');recruit(legacy,'celia');legacy.activeParty=['nell','kit','celia'];
  legacy.party[0].hp=27;legacy.playSeconds=998;
  receiveItem(legacy.inventory,'medic-clasp');equipItem(legacy.inventory,'celia','medic-clasp');
  receiveItem(legacy.inventory,'work-coat');equipItem(legacy.inventory,'celia','work-coat');
  const restored=decodeSave(JSON.stringify({...legacy,version:7}));
  expect(restored.version).toBe(8);expect(restored.party).toEqual(legacy.party.filter(h=>h.id!=='celia'));
  expect(restored.activeParty).toEqual(['nell','kit','orrin']);expect(restored.flags.celiaJoined).toBeUndefined();
  for(const key of ['coins','bandages','xp','journal','boundary','playSeconds','location'] as const)expect(restored[key]).toEqual(legacy[key]);
  for(const item of ['medic-clasp','work-coat'] as const)expect(ownedCopies(restored.inventory,item)).toBe(ownedCopies(legacy.inventory,item));
  expect(restored.inventory.characters.celia).toEqual({fitting:null,coat:null});expect(restored.inventory.bag['medic-clasp']).toBe(1);
  expect(decodeSave(JSON.stringify(restored))).toEqual(restored);
});
it('defers Celia throughout the staged chapter and rejects premature recruitment in current saves',()=>{
  const entries=[scenes.arrival(),scenes.meetKit(),scenes.raid(true),scenes.raid(false),scenes.freePrisoners(),scenes.ward(),scenes.abandonment(),scenes.evacuation(),scenes.recapture(),scenes.departure()];
  expect(entries.flatMap(s=>s.scene!.actors).some(a=>a.id==='celia')).toBe(false);
  expect(entries.flatMap(s=>s.lines).some(l=>l.who==='Celia'||l.text.includes('Celia'))).toBe(false);
  const s=coastCheckpoint('wardSeen');recruit(s,'celia');expect(()=>decodeSave(JSON.stringify(s))).toThrow();
});
it('finishes the local rescue before the capital departure and replays interrupted scenes safely',()=>{
  const j=raid(false);interactChapterTwo(j.host,'prison-coach');j.finish();interactChapterTwo(j.host,'coast-ward');resumeChapterTwo(j.host);j.finish();
  interactChapterTwo(j.host,'ward-siding');resumeChapterTwo(j.host);j.finish();interactChapterTwo(j.host,'siding-alban');expect(j.battle()).toBe('coast-loading');
  interactChapterTwo(j.host,'siding-collector');j.win();interactChapterTwo(j.host,'siding-release');expect(j.state.flags.evacuationReady).toBeUndefined();
  const restored=decodeSave(JSON.stringify(j.state));expect(restored.flags.coastCollectorWon).toBe(true);j.finish();
  interactChapterTwo(j.host,'siding-release');expect(j.read().lines[0].text).toContain('families are aboard');
  interactChapterTwo(j.host,'siding-alban');j.finish();j.win();interactChapterTwo(j.host,'capital-engine');expect(j.state.boundary).toBeNull();j.finish();
  expect(j.state.boundary).toBe(THIRD_CHAPTER);expect(j.boundaries()).toBe(1);expect(j.state.journal).toContain('capitalDeparture');
  expect(j.state.party.map(h=>h.id)).toEqual(['nell','orrin','kit']);expect(decodeSave(JSON.stringify(j.state))).toEqual(j.state);
});
it('rejects impossible recruits, oversized active parties and crossed chapter boundaries',()=>{
  const s=journey().state;
  for(const bad of [ {...s,boundary:THIRD_CHAPTER}, {...s,flags:{...s.flags,kitJoined:true}}, {...s,chapter:'chapter-one'}, {...s,activeParty:['nell','orrin','kit','celia']}, {...s,location:{map:'infirmary',x:31,y:21}} ])expect(()=>decodeSave(JSON.stringify(bad))).toThrow();
});
it('every Chapter Two staged actor and move has solid, walkable footing',()=>{
  const scripts={coast:[scenes.arrival(),scenes.meetKit(),scenes.raid(true),scenes.raid(false),scenes.freePrisoners()],infirmary:[scenes.ward()],cinderbank:[scenes.abandonment(),scenes.evacuation(),scenes.recapture(),scenes.departure()]};
  for(const [id,entries] of Object.entries(scripts))for(const entry of entries){
    const points=[...entry.scene!.actors.map(a=>a.at),...entry.lines.flatMap(l=>Object.values(l.shot?.actors??{}).flatMap(d=>[d?.at,d?.to].filter(p=>!!p)))];
    for(const p of points)expect(walkable(MAPS[id as keyof typeof MAPS],p!.x,p!.y),`${entry.scene!.id}: ${p!.x},${p!.y}`).toBe(true);
  }
});
