import { expect,it } from 'vitest';
import { chapterFiveFinaleStart } from '../src/dev/canonical-saves';
import { decodeSave,maxHp,remember,SIXTH_CHAPTER } from '../src/rules/state';
import { active,awardVictory,cast,createBattle,damage,defend,enemyTurn,targets } from '../src/rules/combat';
import { equipmentBonuses,ownedCopies } from '../src/rules/inventory';
import { offset } from '../src/rules/hex';
import { occupiedHexes } from '../src/rules/footprint';
import { flagshipPart,prepareFlagship } from '../src/rules/flagship';
import { MAPS,arrival,walkable,worldPath } from '../src/content/maps';
import { visibleSceneArt } from '../src/content/scene-art';
import { interactChapterFive,resumeChapterFive } from '../src/content/chapter-five/interactions';
import { objective } from '../src/content/chapter-five/story';
import type { StoryHost } from '../src/content/chapter-one/interactions';
import type { Dialogue } from '../src/content/dialogue';
import * as scenes from '../src/content/chapter-five/finale-scenes';

function visit(s=chapterFiveFinaleStart()){
 let dialogue:Dialogue|undefined,encounter='',departures=0;
 const h:StoryHost={state:s,talk:d=>{dialogue=d;},commit:(f,e)=>{s.flags[f]=true;if(e)remember(s,e);expect(decodeSave(JSON.stringify(s))).toEqual(s);},travel:(map,x,y)=>{s.location={map,x,y};resumeChapterFive(h);},battle:id=>{encounter=id;},boundary:()=>{departures++;},refresh(){},save(){},shop(){},toast(){},endingMusic(){}};
 const finish=()=>{const d=dialogue;dialogue=undefined;d?.done?.();};
 const interact=(id:string)=>interactChapterFive(h,id);
 const launch=()=>{interact('ship-chart');dialogue!.choices![3].action();dialogue!.choices![0].action();};
 return {s,h,finish,interact,launch,read:()=>dialogue!,encounter:()=>encounter,departures:()=>departures};
}
it('authors a fresh canonical Acts I–III completion with earned builds, supplies and a ready chart',()=>{
 const s=chapterFiveFinaleStart();
 expect(decodeSave(JSON.stringify(s))).toEqual(s);expect(s.xp).toBe(2740);expect(s.bandages).toBe(12);expect(s.party).toHaveLength(5);
 expect(s.flags).toMatchObject({hammerplainComplete:true,dawnwatchComplete:true,windmereComplete:true,allAnchorsSeen:true,emperorOfferSeen:true,emperorOfferTold:true,tomasRescued:true});
 expect(s.flags.flagshipApproachSeen).toBeUndefined();expect(s.flags.flagshipWon).toBeUndefined();expect(s.flags.chapterFiveComplete).toBeUndefined();expect(s.boundary).toBeNull();expect(s.location).toEqual(arrival('airship','start'));
 expect(s.party.every(p=>p.hp===maxHp(p.id,s)&&p.focus===6)).toBe(true);
 expect(s.activeParty).toEqual(['nell','orrin','petra']);expect(s.inventory.characters.orrin.fitting).toBe('forge-valve');expect(s.inventory.characters.celia.fitting).toBe('ward-focus');expect(ownedCopies(s.inventory,'shield-brace')).toBe(1);
 const v=visit(s);resumeChapterFive(v.h);expect(v.read()).toBeUndefined();v.interact('ship-chart');expect(v.read().choices![3].disabled).toBe(false);
 s.flags.flagshipWon=true;s.inventory.bag['fleet-sight']=3;expect(chapterFiveFinaleStart().inventory.bag['fleet-sight']).toBeUndefined();
});
it('runs approach, normal rewards, surrender, evacuation and an atomic Chapter Six departure',()=>{
 const v=visit(),s=v.s;s.activeParty=['nell','kit','celia'];s.party[1].hp=23;s.party[1].focus=1;s.playSeconds=7200;const before=structuredClone(s);
 v.interact('ship-chart');v.read().choices![3].action();v.read().choices![1].action();expect(s).toEqual(before);
 v.launch();expect(v.read().scene?.id).toBe('five-flagship-approach');expect(s.flags.flagshipApproachSeen).toBeUndefined();v.finish();expect(v.encounter()).toBe('alban-flagship');
 for(const k of ['party','activeParty','inventory','bandages','coins','xp','playSeconds']as const)expect(s[k]).toEqual(before[k]);
 const b=createBattle(v.encounter(),s);b.result='victory';awardVictory(b,s);const won=structuredClone(s);awardVictory(b,s);expect(s).toEqual(won);
 expect(s.xp).toBe(before.xp+360);expect(s.coins).toBe(before.coins+240);expect(ownedCopies(s.inventory,'fleet-sight')).toBe(1);expect(s.inventory.characters.kit.fitting).toBe('courier-sight');
 resumeChapterFive(v.h);expect(s.location.map).toBe('flagship');expect(v.read().scene?.id).toBe('five-alban-surrender');expect(s.flags.albanCaptured).toBeUndefined();v.finish();expect(s.flags.albanCaptured).toBe(true);
 v.interact('flagship-evacuate');expect(v.read().scene?.id).toBe('five-flagship-evacuation');expect(s.flags.flagshipEvacuated).toBeUndefined();v.finish();expect(s.location.map).toBe('airship');expect(v.read().scene?.id).toBe('five-capital-departure');expect(s.flags.chapterFiveComplete).toBeUndefined();expect(s.boundary).toBeNull();v.finish();
 expect(s.flags.chapterFiveComplete).toBe(true);expect(s.boundary).toBe(SIXTH_CHAPTER);expect(v.departures()).toBe(1);expect(decodeSave(JSON.stringify(s))).toEqual(s);
 expect(s.activeParty).toEqual(before.activeParty);expect(s.party).toEqual(won.party);expect(s.playSeconds).toBe(before.playSeconds);expect(s.inventory).toEqual(won.inventory);expect(s.bandages).toBe(won.bandages);
 expect(objective(s)).toContain('Chapter Five complete');expect(s.journal.filter(j=>j==='albanCaptured')).toHaveLength(1);
 v.interact('ship-chart');v.read().choices![0].action();expect(s.location.map).toBe('hammerplain');expect(s.flags.hammerplainComplete).toBe(true);
});
it('reloads each unfinished finale scene and preserves a post-battle checkpoint without fighting twice',()=>{
 const v=visit();v.launch();const pending=decodeSave(JSON.stringify(v.s)),again=visit(pending);resumeChapterFive(again.h);expect(again.read()).toBeUndefined();again.launch();expect(again.read().scene?.id).toBe('five-flagship-approach');again.finish();
 const b=createBattle(again.encounter(),pending);b.result='victory';awardVictory(b,pending);
 const captured=visit(decodeSave(JSON.stringify(pending)));resumeChapterFive(captured.h);expect(captured.read().scene?.id).toBe('five-alban-surrender');expect(captured.encounter()).toBe('');
 const replay=visit(decodeSave(JSON.stringify(captured.s)));resumeChapterFive(replay.h);expect(replay.read().scene?.id).toBe('five-alban-surrender');replay.finish();replay.interact('flagship-evacuate');
 const evacuation=visit(decodeSave(JSON.stringify(replay.s)));resumeChapterFive(evacuation.h);expect(evacuation.read()).toBeUndefined();evacuation.interact('flagship-evacuate');evacuation.finish();
 const departure=visit(decodeSave(JSON.stringify(evacuation.s)));resumeChapterFive(departure.h);expect(departure.read().scene?.id).toBe('five-capital-departure');departure.finish();const done=visit(decodeSave(JSON.stringify(departure.s)));resumeChapterFive(done.h);expect(done.read()).toBeUndefined();expect(done.s.boundary).toBe(SIXTH_CHAPTER);
});
it('rejects an early flagship or incomplete surrender/departure without changing existing saves',()=>{
 const ready=chapterFiveFinaleStart();
 for(const change of [{location:arrival('flagship','start')},{flags:{...ready.flags,flagshipWon:true}},{flags:{...ready.flags,albanCaptured:true}},{flags:{...ready.flags,flagshipEvacuated:true}},{flags:{...ready.flags,chapterFiveComplete:true}},{boundary:SIXTH_CHAPTER},{flags:{...ready.flags,emperorOfferTold:false,flagshipApproachSeen:true}}])expect(()=>decodeSave(JSON.stringify({...ready,...change}))).toThrow();
 const deferred=chapterFiveFinaleStart();delete deferred.flags.emperorOfferTold;delete deferred.flags.emperorOfferSeen;const v=visit(deferred);v.interact('ship-chart');expect(v.read().choices![3].disabled).toBe(true);expect(decodeSave(JSON.stringify(deferred))).toEqual(deferred);
});
it('uses real campaign HP, focus, loadouts and bandages for any chosen formation',()=>{
 for(const party of [['nell'],['nell','kit'],['nell','celia','petra']]as const){
  const s=chapterFiveFinaleStart();s.activeParty=[...party];s.bandages=3;s.party.forEach((h,i)=>{h.hp=11+i;h.focus=i;});
  const b=createBattle('alban-flagship',s),gear=equipmentBonuses(s.inventory);expect(b.bandages).toBe(3);
  expect(b.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(party);
  for(const u of b.units.filter(u=>u.side==='party')){const h=s.party.find(h=>h.id===u.id)!;expect(u.hp).toBe(h.hp);expect(u.focus).toBe(Math.min(6,h.focus+(active(b)?.id===u.id?1:0)));expect(u.armor).toBeGreaterThanOrEqual(gear[h.id].armor);}
 }
});
it('prepares campaign warnings, drops the shield on the second gun and ends on the bridge through generic combat',()=>{
 const b=createBattle('alban-flagship',chapterFiveFinaleStart()),hero=active(b)!,bridge=flagshipPart(b,'flagship-bridge'),port=flagshipPart(b,'flagship-port'),starboard=flagshipPart(b,'flagship-starboard');
 expect(port.intent?.round).toBe(1);expect(occupiedHexes(bridge)).toHaveLength(3);expect(bridge.sealed).toBe(true);
 hero.hex=offset(3,3);b.queue=[hero.id,port.id,starboard.id,bridge.id];port.hp=1;
 expect(targets(b,hero,'burst',port.hex).filter(u=>u.id===port.id)).toHaveLength(1);expect(cast(b,hero,'burst',port.hex)).toBe(true);expect(port.intent).toBeUndefined();expect(bridge.sealed).toBe(true);
 starboard.hp=0;prepareFlagship(b);expect(bridge.sealed).toBe(false);b.round++;prepareFlagship(b);expect(bridge.intent?.name).toBe('Emergency broadside');
 const victim=b.units.find(u=>u.side==='party')!;bridge.tauntedBy=victim.id;bridge.dazzledAttacks=3;prepareFlagship(b);expect(bridge.intent!.cells).toEqual([victim.hex]);b.queue=[bridge.id,hero.id];const hp=victim.hp,amount=damage(bridge,victim,'judgment');expect(enemyTurn(b)).toBe('judgment');expect(victim.hp).toBe(hp-amount);expect(bridge.dazzledAttacks).toBe(2);
 bridge.hp=0;b.queue=[hero.id,bridge.id];defend(b);expect(b.result).toBe('victory');expect(b.units.filter(u=>u.side==='enemy').every(u=>u.hp===0)).toBe(true);
});
it('keeps the full cast on connected deck floor and visibly clears the fleet after victory',()=>{
 for(const d of [scenes.approach(),scenes.surrender(),scenes.evacuation(),scenes.departure()]){
  const map=MAPS[d.scene!.id==='five-alban-surrender'||d.scene!.id==='five-flagship-evacuation'?'flagship':'airship'],start=arrival(map.id,'start');
  for(const p of [...d.scene!.actors.map(a=>a.at),...d.lines.flatMap(l=>Object.values(l.shot?.actors??{}).flatMap(a=>a?.to?[a.to]:[]))]){
   expect(walkable(map,p.x,p.y),`${d.scene!.id}: ${p.x},${p.y}`).toBe(true);expect(p.x===start.x&&p.y===start.y||worldPath(map,start,p).length>0).toBe(true);
  }
  expect(d.lines.some(l=>l.who==='The Benefactor')).toBe(false);
 }
 const s=chapterFiveFinaleStart(),pieces=()=>visibleSceneArt(MAPS.airship.tiles!,s)!.map(p=>p.key);expect(pieces()).toContain('scene-five-ship-blockade');expect(pieces()).not.toContain('scene-five-ship-open-crossing');s.flags.flagshipWon=true;expect(pieces()).not.toContain('scene-five-ship-blockade');expect(pieces()).toContain('scene-five-ship-open-crossing');
});
