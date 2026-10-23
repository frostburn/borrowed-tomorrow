import { expect,it } from 'vitest';
import { readFileSync } from 'node:fs';
import { chapterSixStart,chapterSixJungleStart,chapterSixRecoveredStart } from '../src/dev/canonical-saves';
import { interactChapterSix,resumeChapterSix } from '../src/content/chapter-six/interactions';
import * as jungle from '../src/content/chapter-six/jungle/scenes';
import * as desert from '../src/content/chapter-six/scenes';
import { completeRiverTreatment } from '../src/content/chapter-six/jungle/recovery';
import { arrival,MAPS,walkable,worldPath,visibleObjects } from '../src/content/maps';
import { sceneAssets } from '../src/content/scene-art';
import { decodeSave } from '../src/rules/save';
import { maxHp,remember,restoreParty,type GameState } from '../src/rules/state';
import { equipItem,ownedCopies } from '../src/rules/inventory';
import { heroAvailable } from '../src/rules/availability';
import { createBattle,awardVictory } from '../src/rules/combat';
import type { StoryHost } from '../src/content/story-host';
import type { Dialogue } from '../src/content/dialogue';
import { desertCheckpoint } from './support/desert';
import { jungleCheckpoint,jungleOrder } from './support/jungle';
import { ARRANGEMENTS,scoreBar,scoreLength,type MusicMode } from '../src/game/score';
import { SLENDRIC_FIVE,SLENDRIC_SIX } from '../src/game/score-jungle';
import { isPercussion,pitchSteps } from '../src/game/tuning';

function journey(s:GameState=chapterSixJungleStart()){
 let d:Dialogue|undefined,encounter='';
 const valid=()=>expect(decodeSave(JSON.stringify(s))).toEqual(s);
 const h:StoryHost={state:s,talk:read=>{d=read;},commit:(f,e)=>{s.flags[f]=true;if(e)remember(s,e);valid();},refresh(){},save:valid,travel:(map,x,y)=>{s.location={map,x,y};valid();resumeChapterSix(h);},battle:id=>{encounter=id;},shop(){restoreParty(s);},boundary(){throw new Error('The jungle grants no chapter ending');},toast(){},endingMusic(){}};
 const flush=()=>{for(let i=0;d?.done&&i<10;i++){const read=d;d=undefined;read.done!();}};
 const act=(id:string)=>{d=undefined;interactChapterSix(h,id);flush();};
 const choose=(i:number)=>{const read=d;d=undefined;read!.choices![i].action();flush();};
 const win=()=>{const b=createBattle(encounter,s);b.result='victory';awardVictory(b,s);resumeChapterSix(h);flush();valid();};
 const clear=()=>{resumeChapterSix(h);flush();act('river-canopy');act('river-cache');choose(0);win();act('river-patrol');choose(0);win();act('river-chain');act('canopy-rainhouse');act('rainhouse-guard');choose(0);win();};
 return {s,h,read:()=>d!,flush,act,choose,win,clear,valid};
}
it('Iria opens at the same chart as Namar and replays its own arrival without consuming desert progress',()=>{
 const j=journey(chapterSixStart());resumeChapterSix(j.h);j.flush();j.act('six-chart');expect(j.read().choices![2].disabled).toBeFalsy();j.choose(2);
 expect(j.s.location.map).toBe('riverhaven');expect(j.s.flags.riverSeen).toBe(true);expect(j.s.flags.desertSeen).toBeUndefined();
 expect(chapterSixJungleStart().flags.riverSeen).toBeUndefined();
});
for(const checkpoint of ['before','during','after']as const)it(`cures Nell ${checkpoint} Namar once, preserving the chosen formation, gear, resources and existing route`,()=>{
 const s=checkpoint==='before'?chapterSixJungleStart():desertCheckpoint(checkpoint==='during'?'palaceEscaped':'desertReported');
 s.location=arrival('riverhaven','start');s.activeParty=['celia','kit'];s.party.find(h=>h.id==='orrin')!.hp=29;s.party.find(h=>h.id==='celia')!.focus=1;s.playSeconds=738;
 const j=journey(s);j.clear();expect(s.flags.nellRecovered).toBeUndefined();expect(heroAvailable(s,'nell')).toBe(false);expect(s.party[0].hp).toBe(1);
 expect(equipItem(s.inventory,'celia','rainhouse-focus')).toBe(true);
 const before=structuredClone(s);j.act('river-treatment');j.choose(0);
 expect(s.flags.nellRecovered).toBe(true);expect(s.flags.riverCareArrived).toBe(true);expect(heroAvailable(s,'nell')).toBe(true);expect(s.party[0]).toEqual({id:'nell',hp:maxHp('nell',s),focus:6});
 for(const key of ['activeParty','coins','bandages','playSeconds']as const)expect(s[key]).toEqual(before[key]);
 expect(s.party.slice(1)).toEqual(before.party.slice(1));expect(s.inventory.characters).toEqual(before.inventory.characters);expect(s.xp).toBe(before.xp+120);
 expect(ownedCopies(s.inventory,'riverglass-reflector')).toBe(1);expect(ownedCopies(s.inventory,'reedweave-coat')).toBe(1);expect(ownedCopies(s.inventory,'river-sight')).toBe(1);
 for(const [flag,value]of Object.entries(before.flags))expect(s.flags[flag],flag).toBe(value);
 expect(completeRiverTreatment(s)).toBe(false);j.act('river-treatment');expect(s.xp).toBe(before.xp+120);
 j.act('rainhouse-tavi');expect(s.flags.riverThanksSeen).toBe(true);j.act('river-ship');expect(s.flags.riverReported).toBe(true);j.valid();
 expect(s.boundary).toBeNull();expect(s.flags.chapterSixComplete).toBeUndefined();expect(s.flags.desertSeen).toBe(checkpoint==='before'?undefined:true);expect(s.flags.desertSealBroken).toBe(checkpoint==='after'?true:undefined);
 if(checkpoint==='during'){j.act('six-chart');j.choose(0);j.act('namar-palace');expect(s.flags.palaceEscaped).toBe(true);expect(j.read()?.scene?.id).not.toBe('six-court');j.act('palace-roofs');expect(s.flags.desertAscentSeen).toBe(true);}
});
it('a recovered Nell participates throughout the desert and returns to the chart without an ill berth or borrowed medical report',()=>{
 const j=journey(chapterSixRecoveredStart()),s=j.s;
 const talks=[desert.city(s),desert.court(s),desert.escaped(s),desert.roofs(s),desert.serpent(s),desert.release(s),desert.publicBreak(s),desert.home(s)];
 for(const d of talks){expect(d.scene!.actors.find(a=>a.id==='nell')?.face).not.toBe('nell-ill');expect(d.scene!.actors.some(a=>a.id==='nell')).toBe(true);expect(d.lines.some(l=>l.who==='Nell')).toBe(true);}
 const mooring=visibleObjects(MAPS.outermooring,s);expect(mooring.some(o=>o.id==='six-nell')).toBe(false);expect(mooring.some(o=>o.id==='six-nell-ready')).toBe(true);
 expect(desert.home(s).lines.map(l=>l.text).join(' ')).not.toContain('tea');
 j.act('six-chart');j.choose(0);j.act('namar-palace');j.act('palace-audience');j.act('palace-route');j.choose(0);j.win();j.act('palace-roofs');j.act('roof-guard');j.choose(0);j.win();j.act('roof-observatory');j.act('sun-serpent');j.choose(0);j.win();j.act('desert-release');j.act('namar-ship');
 expect(s.flags.desertReported).toBe(true);expect(s.flags.nellRecovered).toBe(true);expect(s.activeParty).toEqual(['nell','kit','celia']);
});
it('rest, the terrace victory and an interrupted treatment leave Nell ill; only the completed or skipped scene cures her',()=>{
 const j=journey(jungleCheckpoint('rainhouseWon')),s=j.s;
 const base=structuredClone(s);restoreParty(s);expect(s.party[0].hp).toBe(1);expect(s.flags.nellRecovered).toBeUndefined();
 interactChapterSix(j.h,'river-treatment');j.read().choices![0].action();const scene=j.read();expect(scene.scene?.id).toBe('six-river-treatment');expect(s.flags.riverCareArrived).toBeUndefined();expect(s.flags.nellRecovered).toBeUndefined();
 const restored=decodeSave(JSON.stringify(s));expect(restored.flags.nellRecovered).toBeUndefined();expect(ownedCopies(restored.inventory,'riverglass-reflector')).toBe(0);
 expect(scene.done).toBeDefined();scene.done!();expect(s.flags.nellRecovered).toBe(true);expect(s.xp).toBe(base.xp+120);
 const reloaded=journey(decodeSave(JSON.stringify(s)));resumeChapterSix(reloaded.h);expect(reloaded.read().scene?.id).toBe('six-river-rest');reloaded.flush();reloaded.act('rainhouse-tavi');reloaded.act('river-ship');expect(reloaded.s.flags.riverReported).toBe(true);
});
it('accepts every real checkpoint and rejects invented recovery, missing treatment and premature jungle landings',()=>{
 for(const flag of jungleOrder){const s=jungleCheckpoint(flag);expect(decodeSave(JSON.stringify(s))).toEqual(s);}
 const s=chapterSixStart();for(const flags of [{nellRecovered:true},{riverCareArrived:true},{rainhouseWon:true},{riverSeen:true}])expect(()=>decodeSave(JSON.stringify({...s,flags:{...s.flags,...flags}}))).toThrow();
 expect(()=>decodeSave(JSON.stringify({...s,location:arrival('riverhaven','start')}))).toThrow();
 const half=jungleCheckpoint('rainhouseWon');half.flags.riverCareArrived=true;expect(()=>decodeSave(JSON.stringify(half))).toThrow('treatment');
 const ill=chapterSixRecoveredStart();delete ill.flags.riverCareArrived;expect(()=>decodeSave(JSON.stringify(ill))).toThrow();
});
it('native jungle scenes, approaches and actor movements share connected floor, with a real chain choke and clear launch depth',()=>{
 const scripts={riverhaven:[jungle.arrival(),jungle.thanks()],canopy:[jungle.crossing(),jungle.chain()],rainhouse:[jungle.rainhouse(),jungle.treatment(),jungle.rest()]};
 const s=chapterSixRecoveredStart();
 for(const [id,scenes]of Object.entries(scripts)){
  const map=MAPS[id as keyof typeof scripts],start=arrival(map.id,'start');
  for(const d of scenes)for(const p of [...d.scene!.actors.map(a=>a.at),...d.lines.flatMap(l=>Object.values(l.shot?.actors??{}).flatMap(a=>[a?.at,a?.to].filter(Boolean)))]){
   expect(walkable(map,p!.x,p!.y,s),`${d.scene!.id} ${p!.x},${p!.y}`).toBe(true);expect((p!.x===start.x&&p!.y===start.y)||worldPath(map,start,p!,s).length>0,`${d.scene!.id} connected`).toBe(true);
  }
  for(const o of visibleObjects(map,s))expect(worldPath(map,start,o,s).length>0,`${id}: ${o.id}`).toBe(true);
  for(const a of sceneAssets(map.tiles!)){const svg=readFileSync(`public/${a.url}`,'utf8');expect(svg).not.toContain('<image');expect(Buffer.byteLength(svg)).toBeLessThanOrEqual(131072);}
 }
 const map=MAPS.canopy,from={x:33,y:28},to={x:39,y:28};
 expect(worldPath(map,from,to,{flags:{riverCrossingSeen:true}})).toHaveLength(0);
 expect(worldPath(map,from,to,{flags:{riverCrossingSeen:true,riverChainOpen:true}}).length).toBeGreaterThan(0);
});
it('completed jungle controls leave no empty enemy or treatment interaction under the party',()=>{
 const s=chapterSixRecoveredStart();s.flags.riverCacheWon=true;
 for(const id of ['river-patrol','river-chain','river-cache'])expect(visibleObjects(MAPS.canopy,s).map(o=>o.id)).not.toContain(id);
 const floor=visibleObjects(MAPS.rainhouse,s).map(o=>o.id);expect(floor).not.toContain('rainhouse-guard');expect(floor).not.toContain('river-treatment');expect(floor).toEqual(expect.arrayContaining(['rainhouse-ines','rainhouse-tavi','rainhouse-rest']));
});
it('all jungle pitches and pitched percussion stay on their exact Slendric collection; drums form a substantial independent part',()=>{
 expect(SLENDRIC_FIVE.map(p=>pitchSteps(p)%31)).toEqual([0,6,12,18,24]);expect(SLENDRIC_SIX.map(p=>pitchSteps(p)%31)).toEqual([0,6,12,18,24,30]);
 const forms=[];
 for(const mode of ['riverhaven','canopy','rainhouse','rainhouse-rest','river-battle','rain-warden']as const){
  expect(scoreLength(mode)).toBe(32);const notes=Array.from({length:32},(_,bar)=>scoreBar(mode,bar).map(n=>({...n,absolute:bar*4+n.beat}))).flat();
  const classes=new Set((mode==='riverhaven'||mode==='rainhouse-rest'?SLENDRIC_FIVE:SLENDRIC_SIX).map(p=>pitchSteps(p)%31));
  for(const n of notes){expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(ARRANGEMENTS[mode].beats);expect(n.duration).toBeGreaterThan(0);if(!isPercussion(n.instrument))expect(classes.has((pitchSteps(n.pitch)%31+31)%31),`${mode} ${n.pitch}`).toBe(true);}
  expect(notes.some(n=>n.instrument==='wood')).toBe(true);expect(notes.filter(n=>n.instrument==='hand-drum').length).toBeGreaterThanOrEqual(64);expect(notes.filter(n=>n.instrument==='shaker').length).toBeGreaterThanOrEqual(64);
  expect(notes.filter(n=>n.instrument==='hand-drum').some(n=>n.velocity>=.073)).toBe(true);
  const line=notes.filter(n=>n.pan===-.18&&n.velocity>=.16&&!isPercussion(n.instrument));
  for(let i=1;i<line.length;i++)expect(line[i-1].absolute+line[i-1].duration,mode).toBeLessThanOrEqual(line[i].absolute);
  const first=line.filter(n=>n.absolute<64).map(n=>[n.absolute,n.pitch,n.duration]),second=line.filter(n=>n.absolute>=64).map(n=>[n.absolute-64,n.pitch,n.duration]);
  expect(first).not.toEqual(second);forms.push(JSON.stringify([...first,...second]));
 }
 expect(new Set(forms).size).toBe(6);
 const modes:MusicMode[]=['riverhaven','canopy','rainhouse','rainhouse-rest','river-battle','rain-warden'];for(const mode of modes)expect(scoreBar(mode,32)).toEqual(scoreBar(mode,0));
});
