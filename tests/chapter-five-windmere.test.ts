import {fireBossDirect} from './support/boss';
import { expect,it } from 'vitest';
import { anchorCheckpoint,windmereCheckpoint,windmereOrder } from './support/anchors';
import { active,awardVictory,cast,createBattle,damage,defend,enemyTurn,shape,targets } from '../src/rules/combat';
import { remember, type GameState } from '../src/rules/state';
import { decodeSave } from '../src/rules/save';
import { equipItem,ownedCopies } from '../src/rules/inventory';
import { arrival,MAPS,visiblePeople,walkable,worldPath } from '../src/content/maps';
import { interactChapterFive,resumeChapterFive } from '../src/content/chapter-five/interactions';
import { objective } from '../src/content/chapter-five/story';
import { completedAnchors } from '../src/content/chapter-five/progress';
import type { Dialogue } from '../src/content/dialogue';
import type { StoryHost } from '../src/content/story-host';
import * as scenes from '../src/content/chapter-five/windmere-scenes';
import { prepareWard,wardMirrors,wardUnit } from '../src/rules/ward';
import { offset } from '../src/rules/hex';
import { occupiedHexes } from '../src/rules/footprint';
import {visibleSceneArt} from '../src/content/scene-art';

it('stages the dispensary introduction in front of the lift with dialogue above the cast',()=>{
 const s=windmereCheckpoint('windmereSeen'),v=visit(s);s.location=arrival('dispensary','start');resumeChapterFive(v.h);
 const d=v.read();expect(d.scene).toMatchObject({id:'five-wind-dispensary',dialoguePosition:'top'});
 const platform=visibleSceneArt(MAPS.dispensary.tiles!,s)!.find(p=>p.key==='scene-five-water-platform')!;
 for(const actor of d.scene!.actors){
  expect(walkable(MAPS.dispensary,actor.at.x,actor.at.y,s),actor.id).toBe(true);
  expect((actor.at.y+.5)*24+7,`${actor.id} must sort in front of the platform`).toBeGreaterThan(platform.depth);
 }
 expect(d.lines[0].shot?.focus).toEqual({x:31,y:29});
 expect(scenes.lift().scene?.dialoguePosition).toBeUndefined();
 expect(s.flags.dispensarySeen).toBeFalsy();const before=structuredClone(s);
 v.finish();expect(s.flags.dispensarySeen).toBe(true);expect(s.party).toEqual(before.party);expect(s.inventory).toEqual(before.inventory);
});
function visit(s:GameState){
 let read:Dialogue|undefined,encounter='',toast='';
 const h:StoryHost={state:s,talk:d=>{read=d;},commit:(f,e)=>{s.flags[f]=true;if(e)remember(s,e);},refresh(){},save(){},travel:(map,x,y)=>{s.location={map,x,y};resumeChapterFive(h);},battle:id=>{encounter=id;},shop(){},boundary(){},toast:t=>{toast=t;},async checkpoint(){return true;},endingMusic(){}};
 const finish=()=>{const d=read;read=undefined;d?.done?.();};
 const flush=()=>{for(let i=0;read?.done&&i<6;i++)finish();};
 const interact=(id:string)=>interactChapterFive(h,id);
 const win=(id:string)=>{interact(id);read!.choices![0].action();const b=createBattle(encounter,s);b.result='victory';awardVictory(b,s);expect(decodeSave(JSON.stringify(s))).toEqual(s);};
 const go=(id:string)=>{interact(id);flush();};
 return {h,read:()=>read!,finish,flush,interact,win,go,toast:()=>toast};
}
function complete(v:ReturnType<typeof visit>,region:string){
 v.interact('ship-chart');v.read().choices![['hammerplain','dawnwatch','windmere'].indexOf(region)].action();v.flush();
 if(region==='windmere'){
  v.go('wind-dispensary');v.win('wind-lift-guard');v.go('wind-lift-wheel');v.go('wind-ward');v.go('wind-transfer');v.go('wind-mirrorward');v.win('wind-gallery-guard');v.win('wind-engine');v.go('wind-anchor');v.go('wind-gallery-return');v.go('wind-ship');
 }else if(region==='hammerplain'){
  v.go('hammer-cooling');v.interact('cooling-route');v.read().choices![0].action();const b=createBattle('hammer-lift',v.h.state);b.result='victory';awardVictory(b,v.h.state);v.go('cooling-wheel');v.go('cooling-forge');v.win('forge-carrier');v.go('forge-anchor');v.go('forge-cooling');v.go('cooling-return');v.go('hammer-ship');
 }else{
  v.go('dawn-gate');v.go('dawn-barracks');v.win('watch-mortar');v.win('watch-repeater');v.go('watch-wall');v.win('wall-commander');v.go('wall-anchor');v.go('wall-barracks');v.go('watch-town');v.go('dawn-ship');
 }
}
for(const order of [['windmere','hammerplain','dawnwatch'],['windmere','dawnwatch','hammerplain'],['hammerplain','windmere','dawnwatch'],['dawnwatch','windmere','hammerplain'],['hammerplain','dawnwatch','windmere'],['dawnwatch','hammerplain','windmere']])it(`all three anchors in order ${order.join(' → ')}; one fleet, offer and alliance, manual equipment`,()=>{
 const s=anchorCheckpoint('firstFlightSeen');s.activeParty=['nell','celia','petra'];const v=visit(s),formation=[...s.activeParty];
 for(const [i,region]of order.entries()){
  complete(v,region);expect(completedAnchors(s)).toBe(i+1);expect(s.flags.fleetSighted).toBe(true);expect(decodeSave(JSON.stringify(s))).toEqual(s);
  if(i===0){expect(s.journal.filter(j=>j==='fleetSighted')).toHaveLength(1);if(region==='windmere')expect(s.journal).toContain('windmereComplete');}
  if(i===1){expect(objective(s)).toContain('observation cabin');v.go('ship-cabin');expect(s.flags.emperorOfferTold).toBe(true);}
 }
 expect(s.journal.filter(j=>j==='fleetSighted')).toHaveLength(1);expect(s.journal.filter(j=>j==='emperorOfferSeen')).toHaveLength(1);expect(s.journal.filter(j=>j==='allAnchorsSeen')).toHaveLength(1);
 expect(s.flags).toMatchObject({windmereFreed:true,windmereComplete:true,allAnchorsSeen:true,tomasRescued:true});expect(s.flags.chapterFiveComplete).toBeUndefined();expect(s.boundary).toBeNull();expect(s.activeParty).toEqual(formation);expect(objective(s)).toContain('capital approach');
 expect(ownedCopies(s.inventory,'ward-focus')).toBe(1);expect(s.inventory.characters.celia.fitting).toBeNull();expect(equipItem(s.inventory,'celia','ward-focus')).toBe(true);
 v.interact('ship-chart');expect(v.read().choices![3].disabled).toBe(false);v.read().choices![2].action();expect(s.location.map).toBe('windmere');expect(v.read().scene?.id).not.toBe('five-wind-arrival');
});
it('preserves partial hospital progress, true resources, optional lamp and every atomic save checkpoint',()=>{
 for(const f of windmereOrder)expect(decodeSave(JSON.stringify(windmereCheckpoint(f)))).toEqual(windmereCheckpoint(f));
 const s=windmereCheckpoint('waterLiftOpened'),v=visit(s);s.party[2].hp=17;s.party[2].focus=1;s.playSeconds=1911;const kept=structuredClone(s);
 v.interact('wind-reflector');v.read().choices![1].action();expect(s.flags.windReflectorTaken).toBeUndefined();v.interact('wind-reflector');v.read().choices![0].action();v.interact('wind-reflector');expect(ownedCopies(s.inventory,'opal-reflector')).toBe(1);expect(s.inventory.characters.nell.fitting).toBe('sun-prism');
 v.go('wind-ward');v.go('wind-ship');v.interact('ship-chart');v.read().choices![0].action();v.flush();expect(s.flags.waterLiftOpened).toBe(true);expect(s.party).toEqual(kept.party);expect(s.playSeconds).toBe(1911);expect(s.flags.patientsTransferred).toBeUndefined();
 const t=windmereCheckpoint('waterLiftOpened');t.location=arrival('windmere','transfer');const w=visit(t);w.interact('wind-transfer');const before=JSON.stringify(t);resumeChapterFive(w.h);expect(JSON.stringify(t)).toBe(before);w.finish();expect(t.flags.patientsTransferred).toBe(true);expect(visiblePeople(MAPS.windmere,t).some(p=>p.id==='ward-patient')).toBe(true);expect(visiblePeople(MAPS.windmere,t).some(p=>p.id==='waiting-patient')).toBe(false);
});
it('rejects unprepared treatment-gallery saves and any incomplete regional or alliance checkpoint',()=>{
 const s=anchorCheckpoint('firstFlightSeen');
 for(const bad of [{...s,location:arrival('dispensary','start')},{...s,location:arrival('mirrorward','start')},{...s,flags:{...s.flags,wardEngineWon:true}},{...s,flags:{...s.flags,allAnchorsSeen:true}},{...s,flags:{...s.flags,windmereComplete:true}}])expect(()=>decodeSave(JSON.stringify(bad))).toThrow();
 const v=visit(s);v.interact('wind-mirrorward');expect(v.toast()).toContain('patients');v.interact('wind-engine');expect(v.toast()).toContain('bridge');v.interact('wind-anchor');expect(v.toast()).toContain('Stop the engine');
});
it('stages the full roster and staff on connected hospital floor and preserves the silent, ambiguous fragment',()=>{
 const scripts={windmere:[scenes.hospital(),scenes.transfer(),scenes.night()],dispensary:[scenes.dispensary(),scenes.lift()],mirrorward:[scenes.mirrors(),scenes.release()],airship:[scenes.alliance()]};
 for(const [id,ss]of Object.entries(scripts))for(const d of ss){const map=MAPS[id as keyof typeof MAPS],start=arrival(map.id,'start');
  for(const p of [...d.scene!.actors.map(a=>a.at),...d.lines.flatMap(l=>Object.values(l.shot?.actors??{}).flatMap(a=>[a?.at,a?.to].filter(Boolean)))]){expect(walkable(map,p!.x,p!.y),`${d.scene!.id} ${p!.x},${p!.y}`).toBe(true);expect(p!.x===start.x&&p!.y===start.y||worldPath(map,start,p!).length>0).toBe(true);}
  expect(['nell','orrin','kit','petra','celia'].every(id=>d.scene!.actors.some(a=>a.id===id))).toBe(true);expect(d.lines.some(l=>l.who==='The Benefactor')).toBe(false);
 }
});
const battle=()=>createBattle('wind-engine',anchorCheckpoint('firstFlightSeen'));
it('the three-contact core seals; passive fixed projections never take a turn or retaliate',()=>{
 const b=battle(),core=wardUnit(b)!,mirrors=wardMirrors(b);expect(occupiedHexes(core)).toHaveLength(3);expect(core.anchored).toBe(true);expect(core.sealed).toBe(true);expect(mirrors.every(m=>!b.queue.includes(m.id))).toBe(true);
 const hero=active(b)!;expect(damage(hero,core,'strike')).toBe(0);hero.hex=offset(2,4);b.queue=[hero.id,core.id];const hp=hero.hp;expect(cast(b,hero,'strike',mirrors[0].hex)).toBe(true);expect(hero.hp).toBe(hp);expect(mirrors[0].retaliated).toBe(false);
});
it('only the lit projection interrupts this round, and a new surviving mirror reseals the core next round',()=>{
 const b=battle(),core=wardUnit(b)!,mirrors=wardMirrors(b),warning=structuredClone(core.intent);
 b.units[0].hex=offset(10,6);prepareWard(b);expect(core.intent).toEqual(warning);
 const lit=mirrors.find(m=>m.id===core.intent!.via)!,other=mirrors.find(m=>m!==lit)!;other.hp=0;prepareWard(b);expect(core.sealed).toBe(true);expect(core.intent!.cells.length).toBeGreaterThan(0);
 other.hp=70;lit.hp=0;core.tauntedBy=b.units[0].id;prepareWard(b);expect(core.sealed).toBe(false);expect(core.intent!.cells).toEqual([]);
 b.queue=[core.id,b.units[0].id];expect(enemyTurn(b)).toBeUndefined();expect(active(b)?.id).not.toBe(core.id);expect(core.intent!.cells).toEqual([]);
 b.round++;prepareWard(b);expect(core.sealed).toBe(true);expect(core.intent!.via).toBe(other.id);other.hp=0;prepareWard(b);expect(core.sealed).toBe(false);b.round++;prepareWard(b);expect(core.intent!.via).toBeUndefined();expect(core.sealed).toBe(false);expect(core.intent!.power).toBe(14);expect(core.intent!.cells.length).toBeGreaterThan(0);
});
it('areas hit a whole core once, Taunt redirects the announced beam, Dazzle and guard apply, core death ends projections',()=>{
 const b=battle(),core=wardUnit(b)!,hero=b.units[0];wardMirrors(b).forEach(m=>{m.hp=0;});prepareWard(b);hero.hex=offset(5,4);b.queue=[hero.id,core.id];
 expect(targets(b,hero,'burst',offset(5,2)).filter(u=>u.id===core.id)).toHaveLength(1);const hp=core.hp,expected=damage(hero,core,'burst');expect(cast(b,hero,'burst',offset(5,2))).toBe(true);expect(core.hp).toBe(hp-expected);
 core.tauntedBy=hero.id;core.dazzledAttacks=3;hero.guard=10;b.round++;prepareWard(b);expect(shape(b,core,'refraction',core.hex)).toEqual([hero.hex]);const before=hero.hp;b.queue=[core.id,hero.id];fireBossDirect(b);expect(enemyTurn(b)).toBe('refraction');expect(core.dazzledAttacks).toBe(1);expect(before-hero.hp).toBeLessThan(14);
 const c=battle(),boss=wardUnit(c)!,attacker=c.units[0];boss.hp=0;c.queue=[attacker.id,boss.id];defend(c);expect(c.result).toBe('victory');expect(wardMirrors(c).every(m=>m.hp===0)).toBe(true);
});
it('a deferred Emperor offer remains available after all three anchors without repeating the alliance scene',()=>{
 const s=windmereCheckpoint('windmereComplete','both');s.location=arrival('airship','start');const v=visit(s);resumeChapterFive(v.h);v.flush();expect(s.flags.allAnchorsSeen).toBe(true);expect(s.flags.emperorOfferSeen).toBeUndefined();v.go('ship-cabin');expect(s.flags.emperorOfferSeen).toBe(true);expect(s.flags.emperorOfferTold).toBe(true);expect(s.journal.filter(j=>j==='allAnchorsSeen')).toHaveLength(1);expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
