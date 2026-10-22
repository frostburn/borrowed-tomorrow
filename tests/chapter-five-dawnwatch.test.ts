import { expect,it } from 'vitest';
import { anchorCheckpoint,dawnwatchCheckpoint } from './support/anchors';
import { awardVictory,createBattle,enemyTurn,cast,active } from '../src/rules/combat';
import { decodeSave,remember,type GameState } from '../src/rules/state';
import { equipItem,ownedCopies } from '../src/rules/inventory';
import { arrival,MAPS,visiblePeople,walkable,worldPath } from '../src/content/maps';
import { interactChapterFive,resumeChapterFive } from '../src/content/chapter-five/interactions';
import { objective } from '../src/content/chapter-five/story';
import type { Dialogue } from '../src/content/dialogue';
import type { StoryHost } from '../src/content/chapter-one/interactions';
import * as scenes from '../src/content/chapter-five/dawnwatch-scenes';
import { orderShields,prepareDawnwatch,COMMANDER_ID,SPOTTER_ID } from '../src/rules/dawnwatch';
import { distance,key,offset } from '../src/rules/hex';
function host(s:GameState){
 let read:Dialogue|undefined,encounter='',toast='';
 const h:StoryHost={state:s,talk:d=>{read=d;},commit:(f,e)=>{s.flags[f]=true;if(e)remember(s,e);},refresh(){},save(){},travel:(map,x,y)=>{s.location={map,x,y};resumeChapterFive(h);},battle:id=>{encounter=id;},shop(){},boundary(){},toast:t=>{toast=t;},endingMusic(){}};
 return {h,read:()=>read!,finish:()=>read!.done!(),choose:(i:number)=>read!.choices![i].action(),win:()=>{const b=createBattle(encounter,s);b.result='victory';awardVictory(b,s);},encounter:()=>encounter,toast:()=>toast};
}
for(const first of ['mortar','repeater'])for(const hammerplain of [false,true])it(`Dawnwatch ${first} first, ${hammerplain?'after':'before'} Hammerplain: local actions, changed town and manual loot`,()=>{
 const s=anchorCheckpoint(hammerplain?'fleetSighted':'firstFlightSeen'),v=host(s),formation=['nell','petra','celia']as const;s.activeParty=[...formation];
 interactChapterFive(v.h,'ship-chart');expect(v.read().choices![1].disabled).toBeUndefined();v.choose(1);expect(v.read().scene!.id).toBe('five-dawn-arrival');expect(s.flags.dawnwatchSeen).toBeUndefined();v.finish();
 interactChapterFive(v.h,'dawn-gate');expect(s.flags.shelterOpened).toBeUndefined();v.finish();expect(visiblePeople(MAPS.dawnwatch,s).some(p=>p.id==='shelter-family')).toBe(true);expect(visiblePeople(MAPS.dawnwatch,s).some(p=>p.id==='lower-family')).toBe(false);
 interactChapterFive(v.h,'dawn-barracks');v.finish();interactChapterFive(v.h,'watch-wall');expect(v.toast()).toContain('both');
 for(const gun of [first,first==='mortar'?'repeater':'mortar']){
  interactChapterFive(v.h,`watch-${gun}`);v.choose(0);expect(v.encounter()).toBe(`dawn-${gun}-${gun===first?'first':'last'}`);v.win();const xp=s.xp;v.win();expect(s.xp).toBe(xp);expect(decodeSave(JSON.stringify(s))).toEqual(s);
 }
 interactChapterFive(v.h,'watch-coat');v.choose(0);expect(ownedCopies(s.inventory,'field-coat')).toBe(1);interactChapterFive(v.h,'watch-coat');expect(ownedCopies(s.inventory,'field-coat')).toBe(1);
 interactChapterFive(v.h,'watch-wall');v.finish();interactChapterFive(v.h,'wall-commander');v.choose(0);v.win();expect(ownedCopies(s.inventory,'shield-brace')).toBe(1);expect(s.inventory.characters.petra.fitting).toBe('saber-hilt');expect(equipItem(s.inventory,'petra','shield-brace')).toBe(true);
 interactChapterFive(v.h,'wall-anchor');expect(s.flags.dawnwatchFreed).toBeUndefined();v.finish();interactChapterFive(v.h,'wall-barracks');interactChapterFive(v.h,'watch-town');expect(v.read().scene!.id).toBe('five-dawn-freed');v.finish();
 interactChapterFive(v.h,'dawn-ship');if(!hammerplain){expect(v.read().scene!.id).toBe('five-fleet');expect(v.read().lines.map(l=>l.text).join(' ')).not.toContain('fitters');v.finish();}
 expect(s.flags).toMatchObject({dawnwatchFreed:true,dawnwatchComplete:true,fleetSighted:true,tomasRescued:true});expect(!!s.flags.hammerplainComplete).toBe(hammerplain);expect(s.activeParty).toEqual(formation);expect(s.boundary).toBeNull();expect(s.flags.chapterFiveComplete).toBeUndefined();expect(s.flags.emperorOfferSeen).toBeUndefined();expect(objective(s)).toContain(hammerplain?'observation cabin':'Hammerplain');expect(decodeSave(JSON.stringify(s))).toEqual(s);
 if(hammerplain){interactChapterFive(v.h,'ship-cabin');expect(v.read().scene!.id).toBe('five-emperor-offer');const saved=JSON.stringify(s);resumeChapterFive(v.h);expect(JSON.stringify(s)).toBe(saved);v.finish();expect(v.read().scene!.id).toBe('five-emperor-told');expect(s.flags.emperorOfferSeen).toBe(true);v.finish();expect(s.flags.emperorOfferTold).toBe(true);expect(decodeSave(JSON.stringify(s))).toEqual(s);expect(objective(s)).toContain('Acts I–II complete');}
});
it('preserves partial Dawnwatch progress when leaving for Hammerplain, and old Act I saves remain valid',()=>{
 const s=dawnwatchCheckpoint('mortarWon'),v=host(s);s.party[1].hp=17;s.party[1].focus=1;s.playSeconds=1723;const kept=structuredClone(s);
 interactChapterFive(v.h,'watch-town');interactChapterFive(v.h,'dawn-ship');interactChapterFive(v.h,'ship-chart');v.choose(0);v.finish();
 expect(s.flags.mortarWon).toBe(true);expect(s.flags.repeaterWon).toBeUndefined();expect(s.party).toEqual(kept.party);expect(s.inventory).toEqual(kept.inventory);expect(s.activeParty).toEqual(kept.activeParty);expect(s.playSeconds).toBe(1723);
 expect(decodeSave(JSON.stringify(anchorCheckpoint('fleetSighted'))).flags.dawnwatchSeen).toBeUndefined();
 const reverse=dawnwatchCheckpoint('dawnwatchComplete');reverse.flags.fleetSighted=true;Object.assign(reverse.flags,anchorCheckpoint('hammerplainComplete').flags);reverse.location=arrival('airship','start');expect(decodeSave(JSON.stringify(reverse)).flags.dawnwatchComplete).toBe(true);expect(objective(reverse)).toContain('observation cabin');
});
it('rejects an early wall, one-gun commander, early offer and fleet without a completed region',()=>{
 const s=anchorCheckpoint('firstFlightSeen');for(const bad of [{...s,location:arrival('signalwall','start')},{...s,location:arrival('watchbarracks','start')},{...s,location:arrival('observation','start')},{...s,flags:{...s.flags,fleetSighted:true}},{...s,flags:{...s.flags,emperorOfferSeen:true}}])expect(()=>decodeSave(JSON.stringify(bad))).toThrow();
 const one=dawnwatchCheckpoint('mortarWon');one.flags.aurelSeen=true;expect(()=>decodeSave(JSON.stringify(one))).toThrow('Both gun positions');
});
it('all Dawnwatch scene actors, projected memories and movement endpoints have connected floor',()=>{
 const scripts={dawnwatch:[scenes.arrivalScene(),scenes.shelter(),scenes.town()],watchbarracks:[scenes.guns()],signalwall:[scenes.commander(),scenes.release()],observation:[scenes.emperorOffer()],airship:[scenes.emperorTold()]};
 for(const [id,ss]of Object.entries(scripts))for(const d of ss){const map=MAPS[id as keyof typeof MAPS],start=arrival(map.id,'start');
  for(const p of [...d.scene!.actors.map(a=>a.at),...d.lines.flatMap(l=>Object.values(l.shot?.actors??{}).flatMap(a=>[a?.at,a?.to].filter(Boolean)))]){expect(walkable(map,p!.x,p!.y),`${d.scene!.id} ${p!.x},${p!.y}`).toBe(true);expect(p!.x===start.x&&p!.y===start.y||worldPath(map,start,p!).length>0).toBe(true);}
  expect(d.lines.some(l=>l.who==='The Benefactor')).toBe(false);
  if(id==='observation')expect(d.scene!.actors.filter(a=>a.id!=='nell').every(a=>a.projection)).toBe(true);else expect(['nell','orrin','kit','petra','celia'].every(id=>d.scene!.actors.some(a=>a.id===id))).toBe(true);
 }
});
for(const mortar of [false,true])it(`${mortar?'mortar':'repeater'} support warnings stay fixed, obey Taunt/Dazzle and stop with the spotter`,()=>{
 const b=createBattle(mortar?'dawn-repeater-first':'dawn-mortar-first',anchorCheckpoint('firstFlightSeen')),spotter=b.units.find(u=>u.id===SPOTTER_ID)!,p=b.units[0];
 const warning=structuredClone(spotter.intent);p.hex=offset(6,6);prepareDawnwatch(b);expect(spotter.intent).toEqual(warning);expect(warning!.cells).toHaveLength(7);
 spotter.tauntedBy=p.id;prepareDawnwatch(b);expect(spotter.intent!.cells).toEqual([p.hex]);spotter.dazzledAttacks=3;b.queue=[spotter.id,p.id];const hp=p.hp;enemyTurn(b);expect(p.hp).toBeLessThan(hp);expect(p.hp).toBeGreaterThan(hp-20);expect(spotter.dazzledAttacks).toBe(2);
 const last=createBattle(mortar?'dawn-repeater-last':'dawn-mortar-last',anchorCheckpoint('firstFlightSeen'));expect(last.units.some(u=>u.intent)).toBe(false);
 spotter.hp=0;prepareDawnwatch(b);expect(b.units.filter(u=>u.hp>0).some(u=>u.intent)).toBe(false);
});
it('Aurel advances living shields legally, braces them once and loses the order while Taunted',()=>{
 const b=createBattle('dawn-commander',anchorCheckpoint('firstFlightSeen')),commander=b.units.find(u=>u.id===COMMANDER_ID)!,guards=b.units.filter(u=>u.kind==='dawn-shield');b.queue=[commander.id,...guards.map(u=>u.id),'nell'];
 const before=guards.map(u=>({...u.hex}));orderShields(b,commander);for(const [i,g]of guards.entries()){expect(distance(before[i],g.hex)).toBeLessThanOrEqual(1);expect(b.obstacles.has(key(g.hex))).toBe(false);expect(b.units.filter(u=>u.hp>0&&key(u.hex)===key(g.hex))).toHaveLength(1);expect(g.guard).toBe(6);}
 commander.tauntedBy='nell';guards.forEach(u=>{u.guard=0;});const stopped=guards.map(u=>({...u.hex}));orderShields(b,commander);expect(guards.map(u=>u.hex)).toEqual(stopped);expect(guards.map(u=>u.guard)).toEqual([0,0]);
 // His main action still attacks the forced target using the ordinary combat rules.
 const nell=b.units[0];nell.hex=offset(5,3);const hp=nell.hp;enemyTurn(b);expect(nell.hp).toBeLessThan(hp);expect(active(b)?.id).not.toBe(COMMANDER_ID);
});
it('a spotter uses the normal attack shape once, and Dazzle remains a three-attack effect',()=>{
 const b=createBattle('dawn-repeater-first',anchorCheckpoint('firstFlightSeen')),s=b.units.find(u=>u.id===SPOTTER_ID)!,nell=b.units[0];b.queue=[nell.id,s.id];nell.hex=offset(4,1);s.hex=offset(7,1);expect(cast(b,nell,'dazzle',s.hex)).toBe(true);expect(s.dazzledAttacks).toBe(3);
});
