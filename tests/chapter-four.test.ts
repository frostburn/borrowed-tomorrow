import { expect,it } from 'vitest';
import { beginChapterFour,decodeSave,partyLeader,setActive,remember,type GameState } from '../src/rules/state';
import { equipItem,ownedCopies,receiveItem } from '../src/rules/inventory';
import { awardVictory,createBattle } from '../src/rules/combat';
import { interactChapterFour,resumeChapterFour } from '../src/content/chapter-four/interactions';
import { MAPS,walkable } from '../src/content/maps';
import type { Dialogue } from '../src/content/dialogue';
import type { StoryHost } from '../src/content/chapter-one/interactions';
import { brokenCheckpoint,palaceCheckpoint } from './support/progress';
import * as scenes from '../src/content/chapter-four/scenes';
function host(state:GameState){
 let dialogue:Dialogue|undefined,encounter='';
 const h:StoryHost={state,talk:d=>{dialogue=d;},commit:(f,e)=>{state.flags[f]=true;if(e)remember(state,e);},refresh(){},save(){},travel:(map,x,y)=>{state.location={map,x,y};resumeChapterFour(h);},battle:id=>{encounter=id;},shop(){},boundary(){},toast(){},endingMusic(){}};
 return {h,read:()=>dialogue!,finish:()=>dialogue!.done!(),choice:(i:number)=>dialogue!.choices![i].action(),win:()=>{const b=createBattle(encounter,state);b.result='victory';awardVictory(b,state);},encounter:()=>encounter};
}
it('continues the current departure and retains the chosen formation, health and equipment',()=>{
 const old=palaceCheckpoint('chapterThreeComplete');old.activeParty=['nell','petra','kit'];old.party[1].hp=17;old.party[1].focus=2;old.playSeconds=2115;
 receiveItem(old.inventory,'baffled-nozzle');equipItem(old.inventory,'orrin','baffled-nozzle');
 const s=decodeSave(JSON.stringify(old));
 expect(s).toEqual(old);expect(beginChapterFour(s)).toBe(true);expect(s.activeParty).toEqual(['nell']);expect(s.reunionParty).toEqual(old.activeParty);
 for(const key of ['party','inventory','coins','bandages','xp','playSeconds','flags','journal'] as const)expect(s[key]).toEqual(old[key]);
 expect(beginChapterFour(s)).toBe(false);expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
for(const flooded of [false,true])it(`reunites through the ${flooded?'flooded floor':'dry walk'} and preserves the rescue into Chapter Five`,()=>{
 const s=brokenCheckpoint('brokenMorning');s.reunionParty=['nell','petra','kit'];const j=host(s);
 interactChapterFour(j.h,'refuge-tomas');j.choice(0);j.finish();expect(s.activeParty).toEqual(['orrin','kit']);expect(partyLeader(s)).toBe('orrin');
 expect(setActive(s,'nell',true)).toBe(false);expect(setActive(s,'kit',false)).toBe(false);expect(decodeSave(JSON.stringify(s))).toEqual(s);
 interactChapterFour(j.h,'works-approach');j.choice(flooded?1:0);expect(j.encounter()).toBe(flooded?'works-wet':'works-dry');j.win();
 expect(equipItem(s.inventory,'orrin','return-valve')).toBe(true);const fitted=structuredClone(s.inventory);
 interactChapterFour(j.h,'works-evacuate');j.finish();expect(s.activeParty).toEqual(['petra']);expect(s.party.some(h=>h.id==='celia')).toBe(false);
 const interrupted=decodeSave(JSON.stringify(s));expect(interrupted.flags.worksEvacuated).toBe(true);expect(interrupted.inventory).toEqual(fitted);
 j.finish();expect(s.flags.celiaJoined).toBe(true);expect(s.activeParty).toEqual(['petra','celia']);expect(decodeSave(JSON.stringify(s))).toEqual(s);
 interactChapterFour(j.h,'sanctuary-patrol');j.win();resumeChapterFour(j.h);expect(partyLeader(s)).toBe('celia');expect(equipItem(s.inventory,'petra','rescue-coat')).toBe(true);
 interactChapterFour(j.h,'sanctuary-seal');j.finish();expect(s.location.map).toBe('refuge');expect(decodeSave(JSON.stringify(s))).toEqual(s);
 j.finish();expect(s.activeParty).toEqual(['nell','petra','kit']);expect(s.reunionParty).toBeNull();expect(s.party).toHaveLength(5);
 j.h.travel('sanctuary',32,32);j.finish();interactChapterFour(j.h,'sanctuary-warden');j.win();
 interactChapterFour(j.h,'sanctuary-record');j.finish();expect(s.flags.anchorsKnown).toBe(true);expect(s.flags.tomasRescued).toBe(true);
 j.h.travel('refuge',31,24);interactChapterFour(j.h,'refuge-tomas');j.choice(1);expect(s.boundary).toBeNull();
 interactChapterFour(j.h,'refuge-tomas');j.choice(0);expect(s.boundary).toBe('chapter-five:anchors');expect(s.flags.chapterFourComplete).toBe(true);expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
it('keeps each interrupted viewpoint and the permanent recruitment valid',()=>{
 for(const checkpoint of ['brokenMorning','worksStarted','worksArrival','worksRouteSet','worksGateWon','worksEvacuated','celiaJoined','roadGuardWon','sealLead','sealSeen','partyReunited','sanctuaryEntered','sanctuaryWardenWon','anchorsKnown','chapterFourComplete'] as const){
  const s=brokenCheckpoint(checkpoint);expect(decodeSave(JSON.stringify(s))).toEqual(s);
  const j=host(s);resumeChapterFour(j.h);expect(s.party.filter(h=>h.id==='celia')).toHaveLength(s.flags.celiaJoined?1:0);
 }
});
it('leaves the survey patrol optional and awards every fitting once for manual equipment',()=>{
 const s=brokenCheckpoint('worksArrival'),j=host(s);interactChapterFour(j.h,'works-cart');j.choice(1);expect(s.flags.worksStoresWon).toBeUndefined();
 interactChapterFour(j.h,'works-cart');j.choice(0);j.win();const xp=s.xp;j.win();expect(s.xp).toBe(xp);expect(ownedCopies(s.inventory,'folding-sight')).toBe(1);expect(s.inventory.characters.kit.fitting).toBeNull();
 const full=brokenCheckpoint('partyReunited'),k=host(full);interactChapterFour(k.h,'sanctuary-chest');k.finish();interactChapterFour(k.h,'sanctuary-chest');expect(ownedCopies(full.inventory,'field-clasp')).toBe(1);expect(full.inventory.characters.celia.fitting).toBeNull();expect(equipItem(full.inventory,'celia','field-clasp')).toBe(true);
});
it('rejects absent fighters, lost reunion formations and early knowledge',()=>{
 const s=brokenCheckpoint('worksArrival');
 for(const bad of [{...s,activeParty:['nell','orrin']},{...s,reunionParty:null},{...s,location:{map:'refuge',x:31,y:22}}, {...s,flags:{...s.flags,anchorsKnown:true}}, {...s,chapter:'chapter-three'}])expect(()=>decodeSave(JSON.stringify(bad))).toThrow();
});
it('stages every actor on connected floor and keeps the Benefactor silent',()=>{
 const scripts={refuge:[scenes.morning(),scenes.reunion(),scenes.decision()],breakwater:[scenes.works(),scenes.worksEscape()],sanctuary:[scenes.road(),scenes.seal(),scenes.threshold(),scenes.record()]};
 for(const [map,ss] of Object.entries(scripts))for(const d of ss){
  const points=[...d.scene!.actors.map(a=>a.at),...d.lines.flatMap(l=>Object.values(l.shot?.actors??{}).flatMap(a=>[a?.at,a?.to].filter(Boolean)))];
  for(const p of points)expect(walkable(MAPS[map as keyof typeof MAPS],p!.x,p!.y),`${d.scene!.id}: ${p!.x},${p!.y}`).toBe(true);
  expect(d.lines.some(l=>l.who==='The Benefactor')).toBe(false);
 }
});
