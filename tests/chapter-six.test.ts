import {fireBossDirect} from './support/boss';
import { expect,it } from 'vitest';
import { readFileSync } from 'node:fs';
import { chapterSixStart } from '../src/dev/canonical-saves';
import { beginChapterSix,SIXTH_CHAPTER,remember,restoreParty,level } from '../src/rules/state';
import { decodeSave } from '../src/rules/save';
import { equipItem,ownedCopies } from '../src/rules/inventory';
import { resumeChapterSix,interactChapterSix } from '../src/content/chapter-six/interactions';
import * as scenes from '../src/content/chapter-six/scenes';
import { CHAPTER_SIX_MAPS,CHAPTER_SIX_BATTLES } from '../src/content/chapter-six/maps';
import { arrival,MAPS,walkable,worldPath,visiblePeople } from '../src/content/maps';
import { sceneAssets } from '../src/content/scene-art';
import type { StoryHost } from '../src/content/story-host';
import type { Dialogue } from '../src/content/dialogue';
import { active,awardVictory,cast,createBattle,damage,defend,enemyTurn,pushDestination,shape,targets } from '../src/rules/combat';
import { prepareSerpent,serpentHead,serpentCoils,leaveSunGlass } from '../src/rules/sun-serpent';
import { occupiedHexes } from '../src/rules/footprint';
import { offset,cells,key,toPixel } from '../src/rules/hex';
import { ARRANGEMENTS,scoreBar,scoreLength,scorePosition,scoreMeter,type MusicMode,type Note } from '../src/game/score';
import { pitchSteps,isBass,isPercussion } from '../src/game/tuning';
import { hasExpression,hasRubato,performanceBar } from '../src/game/score-performance';
import { desertCheckpoint } from './support/desert';
function visit(s=chapterSixStart()){
 let read:Dialogue|undefined,battle='';
 const validate=()=>expect(decodeSave(JSON.stringify(s))).toEqual(s);
 const h:StoryHost={state:s,talk:d=>{read=d;},commit:(f,e)=>{s.flags[f]=true;if(e)remember(s,e);validate();},refresh(){},save:validate,travel:(map,x,y)=>{s.location={map,x,y};validate();resumeChapterSix(h);},battle:id=>{battle=id;},shop(){restoreParty(s);},boundary(){throw new Error('Namar is not the chapter ending');},toast(){},async checkpoint(){return true;},endingMusic(){}};
 const flush=()=>{for(let i=0;read?.done&&i<8;i++){const d=read;read=undefined;d.done!();}};
 const act=(id:string)=>{read=undefined;interactChapterSix(h,id);flush();};
 const choose=(i:number)=>{const d=read;read=undefined;d!.choices![i].action();flush();};
 const win=()=>{const b=createBattle(battle,s);b.result='victory';awardVictory(b,s);resumeChapterSix(h);flush();validate();};
 return {s,h,read:()=>read!,flush,act,choose,win};
}
function climb(water=false){
 const v=visit();resumeChapterSix(v.h);v.flush();v.act('six-chart');v.choose(0);v.act('namar-palace');v.act('palace-audience');v.act('palace-route');v.choose(water?1:0);v.win();v.act('palace-roofs');return v;
}
it('records the foreign routes and medical referral together before saving the completed briefing',()=>{
 const v=visit(),snapshots:ReturnType<typeof chapterSixStart>[]=[],commit=v.h.commit;
 v.h.commit=(flag,entry)=>{commit(flag,entry);snapshots.push(structuredClone(v.s));};
 resumeChapterSix(v.h);v.flush();
 expect(snapshots.filter(s=>s.flags.sixRoutesKnown)).toHaveLength(1);
 for(const s of snapshots.filter(s=>s.flags.sixRoutesKnown)){expect(s.flags.jungleLeadKnown).toBe(true);expect(s.journal).toEqual(expect.arrayContaining(['sixRoutesKnown','jungleLeadKnown']));}
});
it('the palace bar blocks its actual doorway during the seizure and reopens after the postal escape',()=>{
 const map=MAPS.sunpalace;
 expect(walkable(map,31,33)).toBe(true);expect(walkable(map,31,33,{flags:{palaceCoup:true}})).toBe(false);expect(walkable(map,31,33,{flags:{palaceCoup:true,palaceEscaped:true}})).toBe(true);
});
it('only reports the optional letter as dispatched after the player actually posts it, including on reload',()=>{
 for(const posted of [false,true]){
  const v=visit(desertCheckpoint('desertReleaseReady'));
  if(posted)v.act('namar-post');
  const restored=visit(decodeSave(JSON.stringify(v.s)));resumeChapterSix(restored.h);
  const exchange=restored.read().lines.map(l=>l.text).join(' ');
  expect(exchange.includes('Nell’s letter is on its way')).toBe(posted);
  expect(exchange.includes('Bring Nell’s letter before you sail')).toBe(!posted);
  restored.flush();restored.s.location=arrival('outermooring','namar');resumeChapterSix(restored.h);
  expect(restored.read().lines.some(l=>l.text.includes('Your letter’s on its way'))).toBe(posted);
  restored.flush();restored.act('six-nell');
  expect(restored.read().lines[0].text.includes('sorting table')).toBe(!posted);
  expect(restored.s.flags.desertMailSent).toBe(posted?true:undefined);
 }
});
for(const water of [false,true])it(`completes the ${water?'service channel':'gallery'} route, public western seal and return without healing Nell or granting Chapter Six completion`,()=>{
 const v=climb(water),s=v.s,gear=structuredClone(s.inventory.characters),formation=[...s.activeParty];
 expect(s.flags.palaceWaterRoute).toBe(water);expect(ownedCopies(s.inventory,'sunmesh-coat')).toBe(1);
 v.act('roof-guard');v.choose(0);v.win();v.act('roof-chest');v.act('roof-chest');expect(ownedCopies(s.inventory,'sunstone-focus')).toBe(1);
 v.act('roof-observatory');v.act('sun-serpent');v.choose(0);v.win();v.act('desert-release');
 expect(s.location.map).toBe('namar');expect(s.flags.desertSealBroken).toBe(true);expect(s.flags.desertReleaseReady).toBe(true);
 v.act('namar-post');v.act('namar-post');expect(ownedCopies(s.inventory,'courier-harness')).toBe(1);expect(equipItem(s.inventory,'celia','sunstone-focus')).toBe(true);
 v.act('namar-ship');expect(s.flags.desertReported).toBe(true);expect(s.chapter).toBe('chapter-six');expect(s.boundary).toBeNull();expect(s.flags.chapterSixComplete).toBeUndefined();
 expect(s.flags.nellIll).toBe(true);expect(s.flags.nellRecovered).toBeUndefined();expect(s.party[0]).toEqual({id:'nell',hp:1,focus:0});expect(s.activeParty).toEqual(formation);expect(s.inventory.characters.nell).toEqual(gear.nell);
 expect(s.flags.tomasRescued).toBe(true);expect(s.flags.albanDestroyed).toBe(true);expect(level(s)).toBe(12);
 expect(ownedCopies(s.inventory,'solar-guard')).toBe(1);expect(ownedCopies(s.inventory,'fine-expansion-ring')).toBe(1);
 v.act('six-chart');expect(v.read().choices![1].disabled).toBeFalsy();expect(v.read().choices![2].disabled).toBeFalsy();v.choose(0);expect(s.location.map).toBe('namar');
});
it('enters only the real Chapter Five departure and preserves every resource, formation and loadout',()=>{
 const s=chapterSixStart();expect(s.xp).toBe(3270);expect(s.activeParty).toEqual(['kit','orrin','petra']);
 s.chapter='chapter-five';s.location=arrival('airship','start');s.boundary=SIXTH_CHAPTER;s.party[1].hp=19;s.party[1].focus=1;s.playSeconds=991;
 const before=structuredClone(s);expect(beginChapterSix(s)).toBe(true);for(const k of ['party','activeParty','inventory','flags','xp','coins','bandages','journal','playSeconds']as const)expect(s[k]).toEqual(before[k]);
 expect(decodeSave(JSON.stringify(s))).toEqual(s);expect(beginChapterSix(s)).toBe(false);restoreParty(s);expect(s.party[0].hp).toBe(1);
 const fresh=chapterSixStart();expect(fresh.flags.capitalSealed).toBeUndefined();expect(fresh.inventory.characters.nell.fitting).toBe('opal-reflector');
});
it('scene interruption replays the court and public break, committing the actual action only on completion or skip',()=>{
 const v=visit();resumeChapterSix(v.h);expect(v.s.flags.capitalSealed).toBeUndefined();v.flush();v.act('six-chart');v.choose(0);v.act('namar-palace');
 interactChapterSix(v.h,'palace-audience');const before=JSON.stringify(v.s);expect(v.s.flags.palaceCoup).toBeUndefined();interactChapterSix(v.h,'palace-audience');expect(JSON.stringify(v.s)).toBe(before);v.flush();expect(v.s.flags.palaceCoup).toBe(true);
 const w=climb();w.act('roof-guard');w.choose(0);w.win();w.act('roof-observatory');w.act('sun-serpent');w.choose(0);w.win();
 // Pause after physically lifting the band, before the public break completes.
 w.h.travel=(map,x,y)=>{w.s.location={map,x,y};resumeChapterSix(w.h);};interactChapterSix(w.h,'desert-release');w.read().done!();
 expect(w.s.flags.desertReleaseReady).toBe(true);expect(w.s.flags.desertSealBroken).toBeUndefined();expect(decodeSave(JSON.stringify(w.s))).toEqual(w.s);resumeChapterSix(w.h);expect(w.read().scene?.id).toBe('six-public');w.flush();expect(w.s.flags.desertSealBroken).toBe(true);
});
it('rejects invented progress, premature maps, wrong departures and missing route choices',()=>{
 const s=chapterSixStart();
 for(const bad of [{...s,location:arrival('namar','start')},{...s,boundary:SIXTH_CHAPTER},{...s,flags:{...s.flags,desertSealBroken:true}},{...s,flags:{...s.flags,chapterFiveComplete:false}}])expect(()=>decodeSave(JSON.stringify(bad))).toThrow();
 const v=climb();delete v.s.flags.palaceWaterRoute;expect(()=>decodeSave(JSON.stringify(v.s))).toThrow('route');
});
it('new scenery, controls and every scene movement share connected Tiled floor and bounded native SVGs',()=>{
 const scripts={outermooring:[scenes.sealed(),scenes.briefing(),scenes.letter(),scenes.home()],namar:[scenes.city(),scenes.publicBreak()],sunpalace:[scenes.court(),scenes.escaped()],skywalk:[scenes.roofs()],observatory:[scenes.serpent(),scenes.release()]};
 for(const [id,scripts_]of Object.entries(scripts)){
  const map=CHAPTER_SIX_MAPS[id as keyof typeof CHAPTER_SIX_MAPS],start=arrival(map.id,'start');
  for(const d of scripts_)for(const p of [...d.scene!.actors.map(a=>a.at),...d.lines.flatMap(l=>Object.values(l.shot?.actors??{}).flatMap(a=>[a?.at,a?.to].filter(Boolean)))]){
   expect(walkable(map,p!.x,p!.y),`${d.scene!.id} ${p!.x},${p!.y}`).toBe(true);expect(p!.x===start.x&&p!.y===start.y||worldPath(map,start,p!).length>0).toBe(true);
  }
  for(const a of sceneAssets(map.tiles!)){const source=readFileSync(`public/${a.url}`,'utf8');expect(source).not.toContain('<image');expect(Buffer.byteLength(source)).toBeLessThanOrEqual(131072);}
 }
 for(const map of Object.values(CHAPTER_SIX_BATTLES))for(const h of cells()){const p=toPixel(h);expect(map.layers.some(l=>l.name==='Walking surfaces'&&l.data?.[Math.floor(p.y/24)*map.width+Math.floor(p.x/24)])).toBe(true);}
 const city=MAPS.namar;expect(visiblePeople(city,{flags:{}}).length).toBeGreaterThan(1);expect(visiblePeople(city,{flags:{palaceCoup:true}}).length).toBeLessThan(visiblePeople(city,{flags:{}}).length);
});
const serpent=()=>createBattle('sun-serpent',chapterSixStart());
it('the three-contact head is always damageable; loose coils alternate and their loss removes armor',()=>{
 const b=serpent(),head=serpentHead(b)!,[west,east]=serpentCoils(b),hero=b.units[0];
 expect(occupiedHexes(head)).toHaveLength(3);expect(head.armor).toBe(7);expect(damage(hero,head,'quickshot')).toBeGreaterThan(0);expect(west.sealed).toBe(false);expect(east.sealed).toBe(true);expect(b.queue).not.toContain(west.id);
 const warning=structuredClone(head.intent);hero.hex=offset(10,6);prepareSerpent(b);expect(head.intent).toEqual(warning);
 b.round++;prepareSerpent(b);expect(west.sealed).toBe(true);expect(east.sealed).toBe(false);west.hp=0;prepareSerpent(b);expect(head.armor).toBe(4);expect(east.sealed).toBe(false);
 east.hp=0;prepareSerpent(b);expect(head.armor).toBe(1);expect(pushDestination(b,hero,head)).toBeUndefined();
});
it('glass comes from the actual breath, reflects only in the next announcement and disappears with its coil',()=>{
 const b=serpent(),head=serpentHead(b)!;leaveSunGlass(b,[offset(3,4)]);b.round++;prepareSerpent(b);
 expect(head.intent!.name).toContain('reflections');const reflected=key(offset(1,6));expect(shape(b,head,'judgment',head.hex).some(h=>key(h)===reflected)).toBe(true);
 serpentCoils(b)[0].hp=0;prepareSerpent(b);expect(shape(b,head,'judgment',head.hex).some(h=>key(h)===reflected)).toBe(false);
 b.round++;prepareSerpent(b);expect(head.intent!.name).not.toContain('reflections');
 const c=serpent(),h=serpentHead(c)!,hero=c.units[0];h.tauntedBy=hero.id;prepareSerpent(c);c.queue=[h.id,hero.id];fireBossDirect(c);expect(enemyTurn(c)).toBe('judgment');expect(c.sunGlass!.cells).toEqual([hero.hex]);
});
it('areas hit one whole head, Taunt redirects all lanes, Dazzle/guard work and head death ends the encounter',()=>{
 const b=serpent(),head=serpentHead(b)!,hero=b.units[0];hero.hex=offset(5,4);b.queue=[hero.id,head.id];hero.abilities.push('burst');
 expect(targets(b,hero,'burst',offset(5,2)).filter(u=>u.id===head.id)).toHaveLength(1);const hp=head.hp,expected=damage(hero,head,'burst');expect(cast(b,hero,'burst',offset(5,2))).toBe(true);expect(head.hp).toBe(hp-expected);
 head.tauntedBy=hero.id;head.dazzledAttacks=3;hero.guard=10;prepareSerpent(b);expect(shape(b,head,'judgment',head.hex)).toEqual([hero.hex]);b.queue=[head.id,hero.id];fireBossDirect(b);const before=hero.hp,breath=damage(head,hero,'judgment');enemyTurn(b);expect(head.dazzledAttacks).toBe(1);expect(before-hero.hp).toBe(breath);
 const c=serpent(),h=serpentHead(c)!;h.hp=0;c.queue=[c.units[0].id,h.id];defend(c);expect(c.result).toBe('victory');expect(serpentCoils(c).every(u=>u.hp===0)).toBe(true);
});
it('all available companion formations can enter without Nell, including a solo courier',()=>{
 for(const ids of [['kit'],['orrin','celia'],['petra','kit','celia']]as const){const s=chapterSixStart();s.activeParty=[...ids];const b=createBattle('sun-serpent',s);expect(b.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(ids);expect(active(b)).toBeDefined();}
});
it('desert scores keep exact neutral thirds, distinct regional cues, expression and a one-shot 6/8 boss opening',()=>{
 expect(pitchSteps('Ed4')-pitchSteps('C4')).toBe(9);expect(pitchSteps('Bd4')-pitchSteps('G4')).toBe(9);
 const modes:MusicMode[]=['outermooring','namar','sunpalace','skywalk','observatory','desert-battle','sun-serpent'];
 for(const mode of modes){
  expect(hasExpression(mode)).toBe(true);let half=0;
  for(let bar=0;bar<scoreLength(mode);bar++)for(const n of scoreBar(mode,bar)){
   expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(ARRANGEMENTS[mode].beats);expect(n.duration).toBeGreaterThan(0);expect(Number.isFinite(pitchSteps(n.pitch))).toBe(true);if(n.pitch.includes('d'))half++;
  }
  expect(half).toBeGreaterThan(0);
 }
 expect(hasRubato('sunpalace')).toBe(true);expect(scoreMeter('sun-serpent')).toBe('6/8');expect(scoreLength('sun-serpent')).toBe(34);expect(scorePosition('sun-serpent',34)).toBe(2);expect(scoreBar('sun-serpent',34)).toEqual(scoreBar('sun-serpent',2));
 expect(scoreBar('namar',0)).not.toEqual(scoreBar('desert-battle',0));expect(scoreBar('skywalk',0).some(n=>n.instrument==='lute')).toBe(true);expect(performanceBar('sunpalace',7).notes.some(n=>!!n.expression?.vibrato)).toBe(true);
});
it('the desert tunes have complete individual forms with breathing space and no overlapping main melody',()=>{
 const forms=[];
 for(const mode of ['outermooring','namar','sunpalace','skywalk','observatory','desert-battle','sun-serpent']as const){
  const intro=ARRANGEMENTS[mode].introBars??0,beats=ARRANGEMENTS[mode].beats,line:Note[]=[];
  for(let bar=0;bar<32;bar++){
   const notes=scoreBar(mode,bar+intro);
   line.push(...notes.filter(n=>!isBass(n.instrument)&&!isPercussion(n.instrument)&&n.instrument!=='timpani'&&n.velocity>=.13).map(n=>({...n,beat:n.beat+bar*beats})));
  }
  line.sort((a,b)=>a.beat-b.beat);
  for(let k=1;k<line.length;k++)expect(line[k-1].beat+line[k-1].duration,`${mode}: ${line[k-1].pitch} -> ${line[k].pitch}`).toBeLessThanOrEqual(line[k].beat);
  expect(line.some((n,k)=>k>0&&n.beat>line[k-1].beat+line[k-1].duration+.25),mode).toBe(true);
  // Compare pitch, rhythm and duration independently of orchestration.
  const first=line.filter(n=>n.beat<16*beats).map(n=>[n.beat,pitchSteps(n.pitch),n.duration]);
  const second=line.filter(n=>n.beat>=16*beats).map(n=>[n.beat-16*beats,pitchSteps(n.pitch),n.duration]);
  expect(second,mode).not.toEqual(first);forms.push(JSON.stringify([...first,...second]));
 }
 expect(new Set(forms).size).toBe(7);
});
it('quiet desert harmonies hold through their rests, while both battle rhythms keep their downbeats through the middle',()=>{
 for(const mode of ['sunpalace','outermooring','observatory']as const){
  const beats=ARRANGEMENTS[mode].beats;
  for(let bar=0;bar<32;bar+=2){
   const bass=scoreBar(mode,bar).filter(n=>isBass(n.instrument));
   expect(bass).toHaveLength(1);expect(bass[0].duration).toBeGreaterThan(beats);
   expect(scoreBar(mode,bar+1).some(n=>isBass(n.instrument))).toBe(false);
  }
 }
 for(const mode of ['desert-battle','sun-serpent']as const){
  const intro=ARRANGEMENTS[mode].introBars??0;
  for(let bar=0;bar<32;bar++)expect(scoreBar(mode,bar+intro).filter(n=>n.instrument==='kick').map(n=>n.beat)).toEqual(mode==='sun-serpent'?[0,1.5]:[0,2]);
 }
 expect(['F4','Ad4','C5'].every(pitch=>Array.from({length:32},(_,bar)=>scoreBar('sunpalace',bar)).flat().some(n=>n.pitch===pitch))).toBe(true);
});

it('keeps the Namar court exit in Namar before and after the serpent, without entering the imperial capital',()=>{
 for(const flag of ['palaceCoup','palaceEscaped','desertSealBroken']as const){
  const s=desertCheckpoint(flag);s.location=arrival('sunpalace','start');const v=visit(s);v.act('palace-city');
  expect(s.location.map).toBe(flag==='palaceCoup'?'sunpalace':'namar');
  expect(s.flags.capitalStreetSeen).toBeUndefined();expect(decodeSave(JSON.stringify(s))).toEqual(s);
 }
});
