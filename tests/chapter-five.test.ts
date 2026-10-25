import { expect,it } from 'vitest';
import { chapterFiveStart } from '../src/dev/canonical-saves';
import { beginChapterFive, FIFTH_CHAPTER, maxHp, remember, type GameState } from '../src/rules/state';
import { decodeSave } from '../src/rules/save';
import { awardVictory,createBattle } from '../src/rules/combat';
import { equipItem,ownedCopies } from '../src/rules/inventory';
import { interactChapterFive,resumeChapterFive } from '../src/content/chapter-five/interactions';
import type { Dialogue } from '../src/content/dialogue';
import type { StoryHost } from '../src/content/story-host';
import { arrival,MAPS,restorePoint,visiblePeople,walkable,worldPath } from '../src/content/maps';
import { objective } from '../src/content/chapter-five/story';
import { anchorCheckpoint } from './support/anchors';
import * as scenes from '../src/content/chapter-five/scenes';
import * as companions from '../src/content/chapter-five/companion-scenes';
function host(state:GameState){
 let dialogue:Dialogue|undefined,encounter='';
 const h:StoryHost={state,talk:d=>{dialogue=d;},commit:(f,e)=>{state.flags[f]=true;if(e)remember(state,e);},refresh(){},save(){},travel:(map,x,y)=>{state.location={map,x,y};resumeChapterFive(h);},battle:id=>{encounter=id;},shop(){},boundary(){},toast(){},async checkpoint(){return true;},endingMusic(){}};
 return {h,read:()=>dialogue!,finish:()=>dialogue!.done!(),choice:(i:number)=>dialogue!.choices![i].action(),win:()=>{const b=createBattle(encounter,state);b.result='victory';awardVictory(b,state);},encounter:()=>encounter};
}
it('continues the exact coast departure and gives dev mode an independent, fresh canonical start',()=>{
 const old=chapterFiveStart();old.chapter='chapter-four';old.boundary=FIFTH_CHAPTER;old.location=arrival('refuge','departure');old.activeParty=['nell','petra','celia'];old.party[1].hp=21;old.party[1].focus=1;old.playSeconds=6410;
 const s=decodeSave(JSON.stringify(old));expect(beginChapterFive(s)).toBe(true);
 for(const k of ['party','activeParty','inventory','xp','coins','bandages','playSeconds','flags','journal']as const)expect(s[k]).toEqual(old[k]);
 expect(beginChapterFive(s)).toBe(false);expect(decodeSave(JSON.stringify(s))).toEqual(s);
 const fresh=chapterFiveStart();expect(fresh.xp).toBe(1225);expect(fresh.party).toHaveLength(5);expect(fresh.flags.airfieldSeen).toBeUndefined();expect(fresh.flags.tomasRescued).toBe(true);expect(fresh.boundary).toBeNull();expect(fresh.inventory.characters.orrin.fitting).toBe('return-valve');
 s.inventory.bag['heat-coat']=4;expect(chapterFiveStart().inventory.bag['heat-coat']).toBeUndefined();
});
for(const flooded of [false,true])it(`frees Hammerplain by the ${flooded?'race walk':'freight lift'} with persistent, manual loot and independent future anchors`,()=>{
 const s=chapterFiveStart();s.activeParty=['nell','petra','celia'];const j=host(s),formation=[...s.activeParty];
 resumeChapterFive(j.h);expect(j.read().scene!.id).toBe('five-airfield');expect(s.flags.airfieldSeen).toBeUndefined();j.finish();
 interactChapterFive(j.h,'airfield-seizure');j.choice(0);j.win();interactChapterFive(j.h,'airfield-board');expect(j.read().scene!.id).toBe('five-launch');
 expect(s.flags.airshipOwned).toBeUndefined();expect(decodeSave(JSON.stringify(s))).toEqual(s);j.finish();expect(j.read().scene!.id).toBe('five-first-flight');j.finish();
 interactChapterFive(j.h,'ship-chart');expect(j.read().choices!.filter(c=>c.disabled)).toHaveLength(0);j.choice(0);expect(j.read().scene!.id).toBe('five-hammer');j.finish();
 interactChapterFive(j.h,'hammer-cooling');j.finish();interactChapterFive(j.h,'cooling-route');j.choice(flooded?1:0);expect(j.encounter()).toBe(flooded?'hammer-race':'hammer-lift');j.win();
 interactChapterFive(j.h,'cooling-wheel');j.finish();interactChapterFive(j.h,'cooling-forge');j.finish();
 interactChapterFive(j.h,'forge-carrier');j.choice(0);expect(j.encounter()).toBe('hammer-carrier');j.win();const xp=s.xp;j.win();expect(s.xp).toBe(xp);
 expect(ownedCopies(s.inventory,'forge-valve')).toBe(1);expect(s.inventory.characters.orrin.fitting).toBe('return-valve');expect(equipItem(s.inventory,'orrin','forge-valve')).toBe(true);expect(s.flags.hammerplainFreed).toBeUndefined();
 interactChapterFive(j.h,'forge-anchor');j.finish();interactChapterFive(j.h,'forge-cooling');interactChapterFive(j.h,'cooling-return');expect(j.read().scene!.id).toBe('five-workers');j.finish();
 interactChapterFive(j.h,'hammer-ship');expect(j.read().scene!.id).toBe('five-fleet');j.finish();
 expect(s.flags).toMatchObject({hammerplainComplete:true,hammerplainFreed:true,fleetSighted:true,forgeFlooded:flooded,tomasRescued:true});expect(s.flags.chapterFiveComplete).toBeUndefined();expect(s.flags.dawnwatchComplete).toBeUndefined();expect(s.flags.windmereComplete).toBeUndefined();expect(s.boundary).toBeNull();expect(s.activeParty).toEqual(formation);expect(objective(s)).toContain('Dawnwatch or Windmere');expect(decodeSave(JSON.stringify(s))).toEqual(s);
 interactChapterFive(j.h,'ship-chart');j.choice(0);expect(s.location.map).toBe('hammerplain');expect(s.flags.hammerplainFreed).toBe(true);
 interactChapterFive(j.h,'hammer-coat');j.choice(0);j.win();j.win();expect(ownedCopies(s.inventory,'heat-coat')).toBe(1);expect(s.inventory.characters.celia.coat).toBeNull();expect(equipItem(s.inventory,'celia','heat-coat')).toBe(true);
 expect(visiblePeople(MAPS.hammerplain,s).some(p=>p.id==='home-family')).toBe(true);expect(visiblePeople(MAPS.hammerplain,s).some(p=>p.id==='stopped-family')).toBe(false);
});
it('rejects early anchor and flight saves, missing route choices and mismatched recruits',()=>{
 const s=chapterFiveStart();
 for(const bad of [{...s,location:arrival('airship','start')},{...s,location:arrival('hammerplain','start')},{...s,flags:{...s.flags,furnaceWon:true}},{...s,flags:{...s.flags,airshipOwned:true}},{...s,flags:{...s.flags,celiaJoined:false}},{...s,boundary:FIFTH_CHAPTER},{...s,chapter:'chapter-four'}])expect(()=>decodeSave(JSON.stringify(bad))).toThrow();
 const flags={...s.flags,airfieldSeen:true,airfieldGuardWon:true,airshipOwned:true,firstFlightSeen:true,hammerplainSeen:true,coolingSeen:true,forgeRouteSet:true};expect(()=>decodeSave(JSON.stringify({...s,flags}))).toThrow('route is missing');
});
it('keeps interrupted scenes replayable without granting a ship, anchor or duplicate journal',()=>{
 const s=chapterFiveStart(),j=host(s);resumeChapterFive(j.h);const snapshot=JSON.stringify(s);resumeChapterFive(j.h);expect(JSON.stringify(s)).toBe(snapshot);j.finish();j.finish();expect(s.journal.filter(x=>x==='airfieldSeen')).toHaveLength(1);
 expect(s.flags.airshipOwned).toBeUndefined();expect(s.flags.hammerplainFreed).toBeUndefined();
});
it('stages all five companions and every movement on connected authored floor, with a silent god',()=>{
 const scripts={airfield:[scenes.airfield(),scenes.launch()],airship:[scenes.firstFlight(),scenes.fleet(),...[false,true].flatMap(done=>[companions.engineWatch(done),companions.shieldRoom(done),companions.putThingsDown(done)])],hammerplain:[scenes.hammerplain(),scenes.workers()],coolingworks:[scenes.cooling(),scenes.water()],anchorforge:[scenes.gantry(),scenes.release()]};
 for(const [id,ss]of Object.entries(scripts))for(const d of ss){
  const map=MAPS[id as keyof typeof MAPS],start=arrival(map.id,'start');
  expect(['nell','orrin','kit','petra','celia'].every(id=>d.scene!.actors.some(a=>a.id===id))).toBe(true);
  const points=[...d.scene!.actors.map(a=>a.at),...d.lines.flatMap(l=>Object.values(l.shot?.actors??{}).flatMap(a=>[a?.at,a?.to].filter(Boolean)))];
  for(const p of points){expect(walkable(map,p!.x,p!.y),`${d.scene!.id} ${p!.x},${p!.y}`).toBe(true);expect(p!.x===start.x&&p!.y===start.y||worldPath(map,start,p!).length>0,`${d.scene!.id} path`).toBe(true);}
  expect(d.lines.some(l=>l.who==='The Benefactor')).toBe(false);
 }
});

it('offers a reachable gantry rest that saves all five companions without spending or advancing anything',()=>{
 const s=anchorCheckpoint('forgeGantrySeen');s.activeParty=['nell','petra','celia'];
 for(const p of s.party){p.hp=1;p.focus=0;}
 const before=structuredClone(s),j=host(s);let saved='';j.h.save=()=>{saved=JSON.stringify(s);};
 const bench=MAPS.anchorforge.objects.find(o=>o.id==='forge-supply')!;
 expect(worldPath(MAPS.anchorforge,arrival('anchorforge','stand'),bench,s).length).toBeGreaterThan(0);
 interactChapterFive(j.h,'forge-supply');j.choice(0);
 expect(s.party.map(p=>[p.hp,p.focus])).toEqual(s.party.map(p=>[maxHp(p.id,s),6]));
 expect({...s,party:before.party}).toEqual(before);
 expect(decodeSave(saved)).toEqual(s);
});
it('keeps the boarding gangways reachable when docked hulls cover older regional saves',()=>{
 for(const [id,exit]of [['hammerplain','hammer-ship'],['dawnwatch','dawn-ship'],['windmere','wind-ship']]as const){
 const s=anchorCheckpoint('hammerplainSeen'),map=MAPS[id],old={x:8,y:30};
 expect(walkable(map,old.x,old.y,s)).toBe(false);
 const safe=restorePoint(map,old,s)!;
 expect(walkable(map,safe.x,safe.y,s)).toBe(true);
 const gangway=map.objects.find(o=>o.id===exit)!;
 expect(safe.x===gangway.x&&safe.y===gangway.y||worldPath(map,safe,gangway,s).length>0,id).toBe(true);
 expect(worldPath(map,arrival(id,'start'),gangway,s).length).toBeGreaterThan(0);
 }
});
