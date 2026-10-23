import { expect,it } from 'vitest';
import { beginChapterThree, recruit, remember, setActive, type GameState } from '../src/rules/state';
import { decodeSave } from '../src/rules/save';
import { awardVictory,createBattle } from '../src/rules/combat';
import { equipItem,equipmentBonuses,ownedCopies } from '../src/rules/inventory';
import { interactChapterThree,resumeChapterThree } from '../src/content/chapter-three/interactions';
import type { StoryHost } from '../src/content/story-host';
import type { Dialogue } from '../src/content/dialogue';
import { MAPS,walkable } from '../src/content/maps';
import { coastCheckpoint,palaceCheckpoint } from './support/progress';
import * as scenes from '../src/content/chapter-three/scenes';
function host(state:GameState){
 let dialogue:Dialogue|undefined,encounter='';
 const h:StoryHost={state,talk:d=>{dialogue=d;},commit:(f,e)=>{state.flags[f]=true;if(e)remember(state,e);},refresh(){},save(){},travel:(map,x,y)=>{state.location={map,x,y};},battle:id=>{encounter=id;},shop(){},boundary(){},toast(){},endingMusic(){}};
 return {h,finish:()=>dialogue!.done!(),read:()=>dialogue!,win:()=>{const b=createBattle(encounter,state);b.result='victory';awardVictory(b,state);},encounter:()=>encounter};
}
it('continues the current capital departure without changing gear, health or the raid choice',()=>{
 const source=coastCheckpoint('chapterTwoComplete');source.party[0].hp=29;source.playSeconds=1234;
 const s=decodeSave(JSON.stringify(source)),before=structuredClone(s);
 expect(beginChapterThree(s)).toBe(true);expect(s).toMatchObject({...before,chapter:'chapter-three',boundary:null,location:{map:'northglass',x:32,y:31}});
 expect(beginChapterThree(s)).toBe(false);expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
it('recruits Petra only after her refusal and the custody battle, retaining a three-fighter formation',()=>{
 const s=palaceCheckpoint('capitalSeen'),j=host(s);interactChapterThree(j.h,'capital-petra');expect(s.flags.capitalConfronted).toBeUndefined();j.finish();j.win();
 resumeChapterThree(j.h);expect(s.party).toHaveLength(3);j.finish();expect(s.party).toHaveLength(4);expect(s.activeParty).toHaveLength(3);expect(s.flags.petraJoined).toBe(true);
 expect(equipItem(s.inventory,'petra','saber-hilt')).toBe(true);expect(setActive(s,'orrin',false)).toBe(true);expect(setActive(s,'petra',true)).toBe(true);
 expect(createBattle('works-warden',s).units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['nell','kit','petra']);
 expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
for(const pressure of [false,true])it(`rescues Tomas permanently and finishes via ${pressure?'pressure walk':'ground plates'}`,()=>{
 const s=palaceCheckpoint('petraJoined'),j=host(s);j.h.travel('relayhall',31,32);resumeChapterThree(j.h);j.finish();j.win();
 expect(s.flags.tomasRescued).toBeUndefined();interactChapterThree(j.h,'works-tomas');j.finish();expect(s.flags.tomasRescued).toBe(true);
 interactChapterThree(j.h,'works-plan');j.read().choices![pressure?1:0].action();expect(s.flags.pressureRoute).toBe(pressure);
 interactChapterThree(j.h,'works-depths');resumeChapterThree(j.h);j.finish();interactChapterThree(j.h,'heart-regulator');expect(j.encounter()).toBe(pressure?'heart-pressure':'heart-feeds');j.win();
 expect(equipItem(s.inventory,'nell','silver-reflector')).toBe(true);expect(equipItem(s.inventory,'kit','insulated-coat')).toBe(true);expect(equipmentBonuses(s.inventory).kit.armor).toBe(2);
 interactChapterThree(j.h,'heart-release');expect(s.flags.emperorMerged).toBeUndefined();j.finish();expect(s.flags.tomasRescued).toBe(true);expect(s.location.map).toBe('northglass');
 interactChapterThree(j.h,'capital-departure');j.finish();expect(s.boundary).toBe('chapter-four:broken-world');expect(s.flags.tomasRescued).toBe(true);expect(s.party.some(h=>h.id==='celia')).toBe(false);expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
it('offers usable loot once, leaves it in the bag and preserves the optional stores choice',()=>{
 const s=palaceCheckpoint('worksSeen'),j=host(s);interactChapterThree(j.h,'capital-cache');j.finish();interactChapterThree(j.h,'capital-cache');expect(ownedCopies(s.inventory,'baffled-nozzle')).toBe(1);expect(s.inventory.characters.orrin.fitting).toBeNull();expect(equipItem(s.inventory,'orrin','baffled-nozzle')).toBe(true);
 interactChapterThree(j.h,'works-locker');j.read().choices![1].action();expect(s.flags.palaceStoresWon).toBeUndefined();
 interactChapterThree(j.h,'works-locker');j.read().choices![0].action();j.win();const xp=s.xp;j.win();expect(s.xp).toBe(xp);expect(ownedCopies(s.inventory,'ratchet-sight')).toBe(1);expect(equipItem(s.inventory,'kit','ratchet-sight')).toBe(true);
});
it('rejects crossed chapters, early Petra and an intake route without a recorded choice',()=>{
 const s=palaceCheckpoint('capitalSeen');const early=structuredClone(s);recruit(early,'petra');
 for(const bad of [early,{...s,chapter:'chapter-two'}, {...s,boundary:'chapter-four:broken-world'}, {...palaceCheckpoint('intakePlanned'),flags:{...palaceCheckpoint('intakePlanned').flags,pressureRoute:undefined}}])expect(()=>decodeSave(JSON.stringify(bad))).toThrow();
});
it('every staged actor and destination has walkable footing; Celia and the god never speak',()=>{
 const entries={northglass:[scenes.arrival(),scenes.refusal(),scenes.defection(),scenes.departure()],relayhall:[scenes.gallery(),scenes.rescue()],conduit:[scenes.heart(),scenes.rupture()]};
 for(const [map,ss] of Object.entries(entries))for(const script of ss){
  const ps=[...script.scene!.actors.map(a=>a.at),...script.lines.flatMap(l=>Object.values(l.shot?.actors??{}).flatMap(d=>[d?.at,d?.to].filter(Boolean)))];
  for(const p of ps)expect(walkable(MAPS[map as keyof typeof MAPS],p!.x,p!.y),`${script.scene!.id}: ${p!.x},${p!.y}`).toBe(true);
  expect(script.lines.some(l=>['Celia','The Benefactor'].includes(l.who))).toBe(false);
 }
});
