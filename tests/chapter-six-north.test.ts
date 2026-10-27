import {fireBossDirect} from './support/boss';
import { expect,it } from 'vitest';
import { readFileSync,statSync } from 'node:fs';
import { chapterSixNorthStart,chapterSixDragonStart } from '../src/dev/canonical-saves';
import { interactChapterSix,resumeChapterSix } from '../src/content/chapter-six/interactions';
import * as scenes from '../src/content/chapter-six/north/scenes';
import * as desertScenes from '../src/content/chapter-six/scenes';
import * as jungleScenes from '../src/content/chapter-six/jungle/scenes';
import { completeRiverTreatment } from '../src/content/chapter-six/jungle/recovery';
import { arrival,MAPS,walkable,worldPath,visibleObjects } from '../src/content/maps';
import { sceneAssets } from '../src/content/scene-art';
import { decodeSave } from '../src/rules/save';
import { maxHp,remember,type GameState } from '../src/rules/state';
import { ITEMS,equipItem,ownedCopies } from '../src/rules/inventory';
import { heroAvailable } from '../src/rules/availability';
import { active,awardVictory,cast,createBattle,defend,enemyTurn,move,movement,pushDestination,shape,targets } from '../src/rules/combat';
import { prepareWinterDragon,winterDragon,winterDragonAfterAttack,brokenIce } from '../src/rules/winter-dragon';
import { occupiedHexes } from '../src/rules/footprint';
import { cells,distance,inside,key,offset } from '../src/rules/hex';
import type { StoryHost } from '../src/content/story-host';
import type { Dialogue } from '../src/content/dialogue';
import { northCheckpoint,northOrder } from './support/north';
import { desertCheckpoint } from './support/desert';
import { jungleCheckpoint } from './support/jungle';
import { ARRANGEMENTS,scoreBar,scoreLength,scorePosition,scoreMeter,type MusicMode } from '../src/game/score';
import { ORWELL_NINE,MYNA_SEVEN } from '../src/game/score-north';
import { isPercussion,pitchSteps } from '../src/game/tuning';
import { hasExpression,hasRubato,performanceBar } from '../src/game/score-performance';
function journey(s:GameState=chapterSixNorthStart()){
 let d:Dialogue|undefined,encounter='';
 const valid=()=>expect(decodeSave(JSON.stringify(s))).toEqual(s);
 const h:StoryHost={state:s,talk:read=>{d=read;},commit:(f,e)=>{s.flags[f]=true;if(e)remember(s,e);valid();},refresh(){},save:valid,travel:(map,x,y)=>{s.location={map,x,y};valid();resumeChapterSix(h);},battle:id=>{encounter=id;},shop(){},boundary(){throw new Error('The inner capital remains ahead');},toast(){},async checkpoint(){return true;},endingMusic(){}};
 const flush=()=>{for(let i=0;d?.done&&i<10;i++){const read=d;d=undefined;read.done!();}};
 const act=(id:string)=>{d=undefined;interactChapterSix(h,id);flush();};
 const choose=(i:number)=>{const read=d;d=undefined;read!.choices![i].action();flush();};
 const win=()=>{const b=createBattle(encounter,s);b.result='victory';awardVictory(b,s);resumeChapterSix(h);flush();valid();};
 const expedition=()=>{resumeChapterSix(h);flush();act('harbor-watch');act('north-watch');choose(0);win();act('north-windlass');act('watch-glacier');act('north-log');act('north-hunters');choose(0);win();act('glacier-shrine');act('shrine-rest');choose(0);act('north-dragon');choose(0);win();act('north-release');act('shrine-home');act('harbor-ship');};
 return {s,h,read:()=>d!,flush,act,choose,win,expedition,valid};
}
for(const well of [false,true])for(const desertFirst of [false,true])it(`completes Skeld ${desertFirst?'after':'before'} Namar with Nell ${well?'well':'ill'}, retaining gear and formation`,()=>{
 const s=chapterSixNorthStart(well);
 if(desertFirst){const desert=desertCheckpoint('desertReported');s.flags={...s.flags,...desert.flags};s.location=arrival('bellharbor','start');}
 const formation=[...s.activeParty],gear=structuredClone(s.inventory.characters),nell=structuredClone(s.party[0]);
 const j=journey(s);j.expedition();
 expect(s.flags.northSealBroken).toBe(true);expect(s.flags.northReturned).toBe(true);expect(s.flags.northReported).toBe(true);
 expect(s.flags.capitalOpened).toBe(desertFirst?true:undefined);expect(s.chapter).toBe('chapter-six');expect(s.boundary).toBeNull();expect(s.flags.chapterSixComplete).toBeUndefined();
 expect(s.activeParty).toEqual(formation);expect(s.inventory.characters).toEqual(gear);expect(s.flags.nellIll).toBe(true);expect(s.flags.nellRecovered).toBe(well?true:undefined);
 if(!well)expect(s.party[0]).toEqual(nell);
 expect(ownedCopies(s.inventory,'stormlining-coat')).toBe(1);expect(ownedCopies(s.inventory,'ice-valve')).toBe(1);expect(ownedCopies(s.inventory,'pact-guard')).toBe(1);
 j.act('six-chart');expect(j.read().choices![1].disabled).toBeFalsy();j.choose(1);expect(s.location.map).toBe('bellharbor');j.valid();
});
it('north-first then desert opens the bridge and reaches a real safe allied landing, with all foreign return routes',()=>{
 const s=desertCheckpoint('desertReleaseReady'),north=northCheckpoint('northReported');s.flags={...north.flags,...s.flags};s.location=arrival('namar','return');
 const j=journey(s);resumeChapterSix(j.h);j.flush();j.act('namar-ship');expect(s.flags.capitalOpened).toBe(true);j.act('six-capital-open');expect(s.location.map).toBe('capitalquay');expect(s.flags.capitalQuaySeen).toBe(true);
 j.act('capital-inner');expect(s.location.map).toBe('stillcity');expect(s.flags.capitalStreetSeen).toBe(true);j.act('city-quay');j.act('capital-return');j.act('six-chart');expect(j.read().choices!.filter(c=>!c.disabled)).toHaveLength(5);j.valid();
});
it('a mid-expedition river cure preserves every northern checkpoint and changes only subsequent scenes and availability',()=>{
 const j=journey(northCheckpoint('northLogRead')),s=j.s,previous=structuredClone(s);Object.assign(s.flags,jungleCheckpoint('rainhouseWon').flags);s.location=arrival('rainhouse','stand');
 expect(completeRiverTreatment(s)).toBe(true);for(const flag of northOrder.slice(0,6))expect(s.flags[flag]).toBe(true);
 expect(s.activeParty).toEqual(previous.activeParty);expect(s.inventory.characters).toEqual(previous.inventory.characters);expect(s.party[0].hp).toBe(maxHp('nell',s));expect(heroAvailable(s,'nell')).toBe(true);
 s.location=arrival('glacier','wreck');j.act('north-hunters');j.choose(0);j.win();j.act('glacier-shrine');
 expect(scenes.shrine(s).scene!.actors.some(a=>a.id==='nell')).toBe(true);expect(scenes.shrine(s).lines.some(l=>l.who==='Nell')).toBe(true);j.valid();
});
it('never stages an ill Nell in the expedition; recovered reserve Nell participates in every northern scene',()=>{
 for(const well of [false,true]){
  const s=chapterSixNorthStart(well);s.activeParty=['kit'];
  for(const d of [scenes.arrival(s),scenes.watch(s),scenes.gate(s),scenes.wrecks(s),scenes.shrine(s),scenes.release(s),scenes.returned(s),scenes.quay(s)]){
   expect(d.scene!.actors.some(a=>a.id==='nell')).toBe(well);
   if(well)expect(d.lines.some(l=>l.who==='Nell'),d.scene!.id).toBe(true);
  }
  expect(scenes.home(s).scene!.actors.find(a=>a.id==='nell')?.face==='nell-bed').toBe(!well);
 }
});
it('reports actual seal states in the desert, river and mooring after north-first and both released',()=>{
 for(const both of [false,true]){
  const s=northCheckpoint('northReported',true);s.flags.desertSealBroken=both;
  for(const d of [desertScenes.publicBreak(s),desertScenes.home(s),jungleScenes.home(s)])expect(d.lines.map(l=>l.text).join(' ')).not.toMatch(/northern seal is still holding|still standing on the northern|northern kingdom still hold/);
 }
});
it('physical windlass and seal commits are resumable; victory alone grants neither release',()=>{
 const j=journey(northCheckpoint('northWatchWon'));interactChapterSix(j.h,'north-windlass');expect(j.s.flags.northPassOpened).toBeUndefined();expect(decodeSave(JSON.stringify(j.s))).toEqual(j.s);j.flush();expect(j.s.flags.northPassOpened).toBe(true);
 const k=journey(northCheckpoint('winterDragonWon'));interactChapterSix(k.h,'north-release');expect(k.s.flags.northSealBroken).toBeUndefined();k.flush();expect(k.s.flags.northSealBroken).toBe(true);
 const after=structuredClone(k.s);k.act('north-release');expect(k.s).toEqual(after);
});
it('rewards are ordinary bag loot and optional relief stores can be taken only once',()=>{
 const j=journey(northCheckpoint('northLogRead')),s=j.s;j.act('glacier-cache');j.choose(0);j.win();j.act('glacier-cache');expect(ownedCopies(s.inventory,'winter-sight')).toBe(1);expect(equipItem(s.inventory,'kit','winter-sight')).toBe(true);expect(s.inventory.characters.kit.fitting).toBe('winter-sight');
});
for(const well of [false,true])it(`canonical northern starts and every authored checkpoint round-trip ${well?'well':'ill'}`,()=>{
 for(const s of [chapterSixNorthStart(well),chapterSixDragonStart(well),...northOrder.map(f=>northCheckpoint(f,well))])expect(decodeSave(JSON.stringify(s))).toEqual(s);
 const s=chapterSixDragonStart(well);expect(s.flags.winterDragonWon).toBeUndefined();expect(s.flags.northSealBroken).toBeUndefined();expect(s.flags.desertSeen).toBeUndefined();expect(s.flags.nellRecovered).toBe(well?true:undefined);
});
it('rejects premature northern maps, missing progress and a capital opened with only one release',()=>{
 const s=chapterSixNorthStart();
 for(const map of ['frostwatch','glacier','wintershrine','capitalquay']as const)expect(()=>decodeSave(JSON.stringify({...s,location:arrival(map,'start')}))).toThrow();
 for(const f of northOrder.slice(1)){const invalid=chapterSixNorthStart();invalid.flags[f]=true;expect(()=>decodeSave(JSON.stringify(invalid)),f).toThrow();}
 const north=northCheckpoint('northReported');north.flags.capitalOpened=true;expect(()=>decodeSave(JSON.stringify(north))).toThrow('Both foreign');
});
it('all northern scenes, interactions and arrivals have connected floor and bounded native SVGs',()=>{
 const s=chapterSixNorthStart(true),groups={bellharbor:[scenes.arrival(s),scenes.returned(s)],frostwatch:[scenes.watch(s),scenes.gate(s)],glacier:[scenes.wrecks(s)],wintershrine:[scenes.shrine(s),scenes.release(s)],outermooring:[scenes.home(s),scenes.opened(s)],capitalquay:[scenes.quay(s)]};
 for(const [id,dialogs]of Object.entries(groups)){
  const map=MAPS[id as keyof typeof MAPS],start=arrival(map.id,'start'),flags={...s.flags,northWatchSeen:true,northPassOpened:true,capitalOpened:true};
  for(const d of dialogs)for(const a of d.scene!.actors){expect(walkable(map,a.at.x,a.at.y,{flags}),`${id} ${a.id} ${a.at.x},${a.at.y}`).toBe(true);expect(worldPath(map,start,a.at,{flags}).length>0||a.at.x===start.x&&a.at.y===start.y).toBe(true);}
  for(const o of map.objects){const approaches=[o,{x:o.x-1,y:o.y},{x:o.x+1,y:o.y},{x:o.x,y:o.y-1},{x:o.x,y:o.y+1}];expect(approaches.some(p=>walkable(map,p.x,p.y,{flags})&&(worldPath(map,start,p,{flags}).length>0||p.x===start.x&&p.y===start.y)),`${id} ${o.id}`).toBe(true);}
  for(const a of sceneAssets(map.tiles!)){expect(statSync('public/'+a.url).size).toBeLessThan(128*1024);expect(readFileSync('public/'+a.url,'utf8')).not.toContain('<image');}
 }
 expect(worldPath(MAPS.frostwatch,arrival('frostwatch','start'),{x:51,y:21},{flags:{northWatchSeen:true}})).toEqual([]);
 expect(worldPath(MAPS.frostwatch,arrival('frostwatch','start'),{x:51,y:21},{flags:{northWatchSeen:true,northPassOpened:true}}).length).toBeGreaterThan(0);
 expect(walkable(MAPS.frostwatch,49,22,{flags:{}})).toBe(false);expect(walkable(MAPS.frostwatch,49,22,{flags:{northWatchSeen:true}})).toBe(false);expect(walkable(MAPS.frostwatch,49,22,{flags:{northWatchSeen:true,northPassOpened:true}})).toBe(true);
 expect(visibleObjects(MAPS.outermooring,{...s,flags:{...s.flags,capitalOpened:true}}).some(o=>o.id==='six-capital')).toBe(false);
});
function dragon(){const b=createBattle('winter-dragon',chapterSixDragonStart()),u=winterDragon(b)!;return {b,u};}
it('the dragon occupies eleven valid contacts and each area damages it once; anchored body resists pushes',()=>{
 const {b,u}=dragon();expect(occupiedHexes(u)).toHaveLength(11);expect(new Set(occupiedHexes(u).map(key)).size).toBe(11);expect(occupiedHexes(u).every(inside)).toBe(true);
 const hero=b.units[0];expect(targets(b,hero,'burst',offset(5,2)).filter(v=>v.id===u.id)).toHaveLength(1);expect(pushDestination(b,hero,u)).toBeUndefined();expect(move(b,u,offset(4,1))).toBeNull();
 for(const count of [1,2,3]){const s=chapterSixDragonStart();s.activeParty=s.activeParty.slice(0,count);const battle=createBattle('winter-dragon',s);expect(battle.units.filter(v=>v.side==='party')).toHaveLength(count);}
});
it('dragon warnings stay fixed during a round; taunt redirects the fired shelf and ice instead of leaving unseen hazards',()=>{
 const {b,u}=dragon();const before=structuredClone(u.intent);b.units[0].hex=offset(0,6);prepareWinterDragon(b);expect(u.intent).toEqual(before);
 b.round=2;prepareWinterDragon(b);const west=structuredClone(u.intent!.cells);const petra=b.units.find(v=>v.id==='petra')!;u.tauntedBy=petra.id;prepareWinterDragon(b);expect(u.intent!.cells).toEqual(occupiedHexes(petra));winterDragonAfterAttack(b,u.intent!.cells);expect(b.winterIce).toEqual(occupiedHexes(petra));expect(west.some(h=>brokenIce(b,h))).toBe(false);
});
it('inhalation pulls survivors one legal hex toward the mouth, never through obstacles, occupants, the body or the board edge',()=>{
 const {b,u}=dragon(),heroes=b.units.filter(v=>v.side==='party');
 heroes[0].hex=offset(5,5);const before={...heroes[0].hex};winterDragonAfterAttack(b,u.intent!.cells);expect(distance(before,heroes[0].hex)).toBe(1);expect(distance(heroes[0].hex,offset(5,2))).toBeLessThan(distance(before,offset(5,2)));
 heroes[0].hex=offset(5,5);for(const h of cells())if(distance(h,heroes[0].hex)===1)b.obstacles.add(key(h));winterDragonAfterAttack(b,u.intent!.cells);expect(heroes[0].hex).toEqual(offset(5,5));
 for(const h of heroes.flatMap(v=>occupiedHexes(v))){expect(inside(h)).toBe(true);expect(occupiedHexes(u).some(p=>key(p)===key(h))).toBe(false);}
});
it('shattered ice costs movement and cold damage, stays traversable, and clears on victory',()=>{
 const {b,u}=dragon(),hero=b.units[0];hero.hex=offset(3,5);b.winterIce=[offset(3,4)];b.queue=[hero.id,u.id];expect(movement(b,hero).get(key(offset(3,4)))?.cost).toBe(2);b.queue=[hero.id];hero.hex=offset(3,4);const hp=hero.hp;defend(b);expect(hero.hp).toBe(hp-6);
 u.hp=0;b.queue=[hero.id];defend(b);expect(b.result).toBe('victory');expect(b.winterIce).toEqual([]);
});
it('the actual cast applies a pull and shelf before round rollover, while normal guard and three-attack dazzle reduce damage',()=>{
 const {b,u}=dragon(),hero=b.units[0];b.queue=[u.id];hero.hex=offset(5,5);hero.guard=10;u.dazzledAttacks=3;fireBossDirect(b);const hp=hero.hp;expect(enemyTurn(b)).toBe('judgment');expect(hp-hero.hp).toBeLessThan(15);expect(u.dazzledAttacks).toBe(1);expect(b.round).toBe(2);expect(hero.hex).not.toEqual(offset(5,5));
 b.round=2;prepareWinterDragon(b);b.queue=[u.id];const shelf=structuredClone(u.intent!.cells);expect(cast(b,u,'judgment',u.hex)).toBe(true);expect(b.round).toBe(3);expect(b.winterIce).toEqual(shelf);expect(shape(b,u,'judgment',u.hex)).not.toEqual(shelf);expect(active(b)?.side).toBe('party');
});
const modes:MusicMode[]=['bellharbor','frostwatch','glacier','wintershrine','north-battle','winter-dragon'];
it('Orwell and Myna are exact planned 31-EDO collections',()=>{
 const pc=(p:string)=>(pitchSteps(p as never)%31+31)%31;
 expect(ORWELL_NINE.map(pc)).toEqual([0,4,7,11,14,18,21,25,28]);expect(MYNA_SEVEN.map(pc)).toEqual([0,7,8,15,16,23,24]);
});
for(const mode of modes)it(`${mode} has a complete developed form, finite notes, exact scale pitches and expressive holds`,()=>{
 const count=scoreLength(mode),allowed=new Set((mode==='glacier'?MYNA_SEVEN:ORWELL_NINE).map(p=>(pitchSteps(p)%31+31)%31));expect(count).toBe(mode==='winter-dragon'?34:32);expect(hasExpression(mode)).toBe(true);
 let expression=false;const bars=[];
 for(let i=0;i<count;i++){
  const notes=scoreBar(mode,i);bars.push(JSON.stringify(notes));expect(notes.length>0||Array.from({length:i},(_,j)=>scoreBar(mode,j).some(n=>j*ARRANGEMENTS[mode].beats+n.beat+n.duration>i*ARRANGEMENTS[mode].beats)).some(Boolean)).toBe(true);
  for(const n of notes){expect(Number.isFinite(n.beat+n.duration+n.velocity+n.pan)).toBe(true);expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(ARRANGEMENTS[mode].beats);expect(n.duration).toBeGreaterThan(0);if(!isPercussion(n.instrument))expect(allowed.has((pitchSteps(n.pitch)%31+31)%31),`${mode} ${i} ${n.pitch}`).toBe(true);if(n.expression?.vibrato)expression=true;}
  expect(performanceBar(mode,i).notes.every(n=>Number.isFinite(n.seconds+n.time))).toBe(true);
 }
 expect(new Set(bars).size).toBeGreaterThan(mode==='glacier'||mode==='wintershrine'?20:24);expect(expression).toBe(true);
});
it('the dragon intro is one-shot and northern rubato stays out of battle pulses',()=>{
 expect(scoreMeter('winter-dragon')).toBe('5/4');expect(scorePosition('winter-dragon',34)).toBe(2);expect(scoreBar('winter-dragon',34)).toEqual(scoreBar('winter-dragon',2));expect(scoreBar('winter-dragon',0)).not.toEqual(scoreBar('winter-dragon',34));expect(hasRubato('bellharbor')).toBe(true);expect(hasRubato('wintershrine')).toBe(true);expect(hasRubato('winter-dragon')).toBe(false);
});

it('northern equipment offers trade-offs against the other open expeditions regardless of visit order',()=>{
 for(const [north,other]of [['stormlining-coat','sunmesh-coat'],['ice-valve','fine-expansion-ring'],['pact-guard','solar-guard'],['winter-sight','river-sight']]as const){
  const a=ITEMS[north].bonuses,b=ITEMS[other].bonuses,stats=['attack','armor','speed']as const;
  expect(stats.some(k=>a[k]>b[k]),north).toBe(true);expect(stats.some(k=>a[k]<b[k]),north).toBe(true);
 }
});
