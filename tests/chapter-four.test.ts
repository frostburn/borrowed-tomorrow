import { expect,it } from 'vitest';
import { beginChapterFour, setActive, remember, type GameState } from '../src/rules/state';
import { decodeSave } from '../src/rules/save';
import { equipItem,ownedCopies,receiveItem } from '../src/rules/inventory';
import { awardVictory,createBattle } from '../src/rules/combat';
import { interactChapterFour,resumeChapterFour } from '../src/content/chapter-four/interactions';
import { MAPS,walkable,worldPath,arrival,visiblePeople } from '../src/content/maps';
import type { Dialogue } from '../src/content/dialogue';
import type { StoryHost } from '../src/content/story-host';
import { brokenCheckpoint,brokenOrder,palaceCheckpoint } from './support/progress';
import * as scenes from '../src/content/chapter-four/scenes';
function host(state:GameState){
 let dialogue:Dialogue|undefined,encounter='';
 const h:StoryHost={state,talk:d=>{dialogue=d;},commit:(f,e)=>{state.flags[f]=true;if(e)remember(state,e);},refresh(){},save(){},travel:(map,x,y)=>{state.location={map,x,y};resumeChapterFour(h);},battle:id=>{encounter=id;},shop(){},boundary(){},toast(){},async checkpoint(){return true;},endingMusic(){}};
 return {h,read:()=>dialogue!,finish:()=>dialogue!.done!(),choice:(i:number)=>dialogue!.choices![i].action(),win:()=>{const b=createBattle(encounter,state);b.result='victory';awardVictory(b,state);},encounter:()=>encounter};
}
it('starts with the actual Chapter Three roster, formation, health and equipment intact',()=>{
 const old=palaceCheckpoint('chapterThreeComplete');old.activeParty=['nell','petra','kit'];old.party[1].hp=17;old.party[1].focus=2;old.playSeconds=2115;
 receiveItem(old.inventory,'baffled-nozzle');equipItem(old.inventory,'orrin','baffled-nozzle');
 // Real saved Chapter Three departures may still carry the removed null field.
 const s=decodeSave(JSON.stringify({...old,reunionParty:null}));expect(s).toEqual(old);
 expect(beginChapterFour(s)).toBe(true);expect(s.activeParty).toEqual(old.activeParty);
 for(const key of ['party','inventory','coins','bandages','xp','playSeconds','flags','journal'] as const)expect(s[key]).toEqual(old[key]);
 expect(beginChapterFour(s)).toBe(false);expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
for(const flooded of [false,true])it(`opens the harbor by the ${flooded?'pump floor':'chain walk'}, frees the coast and chooses the counterattack`,()=>{
 const s=brokenCheckpoint('refugeSeen');s.activeParty=['nell','petra','kit'];const j=host(s);
 interactChapterFour(j.h,'refuge-works');expect(j.read().scene!.id).toBe('four-harbor');
 const interrupted=decodeSave(JSON.stringify(s));expect(interrupted.party).toHaveLength(4);expect(interrupted.flags.celiaJoined).toBeUndefined();
 resumeChapterFour(j.h);j.finish();expect(s.party).toHaveLength(5);expect(s.activeParty).toEqual(['nell','petra','kit']);
 expect(setActive(s,'kit',false)).toBe(true);expect(setActive(s,'celia',true)).toBe(true);
 interactChapterFour(j.h,'works-approach');j.choice(flooded?1:0);expect(j.encounter()).toBe(flooded?'works-wet':'works-dry');j.win();
 expect(equipItem(s.inventory,'orrin','return-valve')).toBe(true);
 interactChapterFour(j.h,'works-wheel');j.finish();expect(s.flags.harborOpened).toBe(true);
 interactChapterFour(j.h,'works-sanctuary');expect(j.read().scene!.id).toBe('four-terrace');j.finish();
 interactChapterFour(j.h,'sanctuary-patrol');j.win();expect(equipItem(s.inventory,'celia','rescue-coat')).toBe(true);
 interactChapterFour(j.h,'sanctuary-cable');j.finish();expect(s.flags.signalCut).toBe(true);
 interactChapterFour(j.h,'sanctuary-warden');j.win();interactChapterFour(j.h,'sanctuary-record');j.finish();
 expect(s.flags.anchorsKnown).toBe(true);expect(s.flags.tomasRescued).toBe(true);
 interactChapterFour(j.h,'sanctuary-refuge');interactChapterFour(j.h,'refuge-tomas');j.choice(1);expect(s.boundary).toBeNull();expect(s.flags.seaWalkSeen).toBe(true);
 interactChapterFour(j.h,'refuge-tomas');expect(j.read().scene).toBeUndefined();j.choice(0);expect(s.boundary).toBe('chapter-five:anchors');expect(s.activeParty).toEqual(['nell','petra','celia']);expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
it('replays interrupted scenes without changing formations or duplicating Celia',()=>{
 for(const flag of brokenOrder){
  const s=brokenCheckpoint(flag),j=host(s);expect(decodeSave(JSON.stringify(s))).toEqual(s);
  const formation=[...s.activeParty];resumeChapterFour(j.h);expect(s.activeParty).toEqual(formation);
  expect(s.party.filter(h=>h.id==='celia')).toHaveLength(s.flags.celiaJoined?1:0);
 }
 const s=brokenCheckpoint('refugeSeen'),j=host(s);s.location=arrival('breakwater','refuge');resumeChapterFour(j.h);j.finish();j.finish();
 expect(s.party.filter(h=>h.id==='celia')).toHaveLength(1);expect(s.journal.filter(x=>x==='worksArrival')).toHaveLength(1);
});
it('keeps the survey patrol and field chest optional, with once-only manual equipment',()=>{
 const s=brokenCheckpoint('worksArrival'),j=host(s);interactChapterFour(j.h,'works-cart');j.choice(1);expect(s.flags.worksStoresWon).toBeUndefined();
 interactChapterFour(j.h,'works-cart');j.choice(0);j.win();const xp=s.xp;j.win();expect(s.xp).toBe(xp);expect(ownedCopies(s.inventory,'folding-sight')).toBe(1);expect(s.inventory.characters.kit.fitting).toBeNull();
 const full=brokenCheckpoint('sanctuaryEntered'),k=host(full);interactChapterFour(k.h,'sanctuary-chest');k.finish();interactChapterFour(k.h,'sanctuary-chest');expect(ownedCopies(full.inventory,'field-clasp')).toBe(1);expect(full.inventory.characters.celia.fitting).toBeNull();expect(equipItem(full.inventory,'celia','field-clasp')).toBe(true);
});
it('rejects early routes, absent companions and unearned knowledge',()=>{
 const s=brokenCheckpoint('worksArrival');
 for(const bad of [{...s,activeParty:['petra','celia']},{...s,party:s.party.filter(h=>h.id!=='celia')}, {...s,location:{map:'sanctuary',x:32,y:32}}, {...s,flags:{...s.flags,anchorsKnown:true}}, {...s,flags:{...s.flags,worksArrival:false}}, {...s,chapter:'chapter-three'}])expect(()=>decodeSave(JSON.stringify(bad))).toThrow();
});
it('stages every actor and move on connected floor, and leaves the god silent',()=>{
 const scripts={refuge:[scenes.home(),scenes.decision()],breakwater:[scenes.harbor(),scenes.openGate()],sanctuary:[scenes.terrace(),scenes.cable(),scenes.record()]};
 for(const [id,ss] of Object.entries(scripts))for(const d of ss){
  const map=MAPS[id as keyof typeof MAPS],start=arrival(map.id,id==='refuge'?'start':id==='breakwater'?'refuge':'harbor');
  const points=[...d.scene!.actors.map(a=>a.at),...d.lines.flatMap(l=>Object.values(l.shot?.actors??{}).flatMap(a=>[a?.at,a?.to].filter(Boolean)))];
  for(const p of points){expect(walkable(map,p!.x,p!.y),`${d.scene!.id}: ${p!.x},${p!.y}`).toBe(true);expect(p!.x===start.x&&p!.y===start.y||worldPath(map,start,p!).length>0).toBe(true);}
  expect(d.lines.some(l=>l.who==='The Benefactor')).toBe(false);
 }
 const before=visiblePeople(MAPS.breakwater,brokenCheckpoint('worksArrival')),after=visiblePeople(MAPS.refuge,brokenCheckpoint('harborOpened'));
 expect(before.some(p=>p.id==='ferry-injury')).toBe(true);expect(after.some(p=>p.id==='ferry-family')).toBe(true);
});

it('preserves solo and two-fighter formations when Celia joins, including replay',()=>{
 for(const formation of [['nell'],['nell','petra']] as const){
  const s=brokenCheckpoint('refugeSeen');s.activeParty=[...formation];s.location=arrival('breakwater','refuge');const j=host(s);
  resumeChapterFour(j.h);j.finish();j.finish();expect(s.activeParty).toEqual(formation);expect(s.party).toHaveLength(5);expect(decodeSave(JSON.stringify(s))).toEqual(s);
 }
});
it('keeps a full bandage bag saveable without charging for another bandage',()=>{
 const s=brokenCheckpoint('refugeSeen');s.bandages=999;const before=s.coins,j=host(s);
 interactChapterFour(j.h,'refuge-rest');j.choice(1);expect(s.bandages).toBe(999);expect(s.coins).toBe(before);expect(decodeSave(JSON.stringify(s))).toEqual(s);
});

it('routes the sanctuary exit through the gate and opens its actual stair only after the gate scene',()=>{
 const map=MAPS.breakwater,closed=brokenCheckpoint('worksArrival'),opened=brokenCheckpoint('harborOpened');
 const exit=map.objects.find(o=>o.id==='works-sanctuary')!;
 expect(worldPath(map,closed.location,exit,closed)).toHaveLength(0);
 const path=worldPath(map,opened.location,exit,opened);
 expect(path.length).toBeGreaterThan(0);
 expect(path.some(p=>p.y===18&&p.x>=40&&p.x<=48)).toBe(true);
 expect(walkable(map,38,18,opened)).toBe(false);expect(walkable(map,49,18,opened)).toBe(false);
 expect(path.every(p=>walkable(map,p.x,p.y,opened))).toBe(true);
});

it('keeps the railway clear of the refuge quay and connects both sanctuary departures',()=>{
 const s=brokenCheckpoint('sanctuaryEntered'),map=MAPS.sanctuary,start=arrival('sanctuary','harbor');
 for(let x=0;x<64;x++)expect(walkable(MAPS.refuge,x,35,s)).toBe(false);
 expect(worldPath(map,start,{x:32,y:41},s).length).toBeGreaterThan(0);
 for(const id of ['sanctuary-harbor','sanctuary-refuge']){
  const exit=map.objects.find(o=>o.id===id)!;expect(worldPath(map,start,exit,s).length).toBeGreaterThan(0);
 }
 const ferry=map.objects.find(o=>o.id==='sanctuary-refuge')!;
 expect(ferry.hitArea).toBeDefined();expect(ferry.x).toBeGreaterThan(ferry.hitArea!.x);
 expect(ferry.x).toBeLessThan(ferry.hitArea!.x+ferry.hitArea!.width);
});
