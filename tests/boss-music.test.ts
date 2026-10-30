import {expect,it} from 'vitest';
import {ARRANGEMENTS,scoreBar,scoreLength,type MusicMode} from '../src/game/score';
import {isPercussion} from '../src/game/tuning';
import {ENCOUNTERS} from '../src/content/encounters';
import * as sevenScenes from '../src/content/chapter-seven/scenes';
import * as capitalScenes from '../src/content/chapter-six/capital/scenes';
import {chapterSixCapitalStart} from '../src/dev/canonical-saves';

it('reserves boss themes for combat, including final introductions and transformations',()=>{
 const bossCues=new Set(Object.values(ENCOUNTERS).filter(e=>e.boss).map(e=>e.music));
 const scripts=[...Object.values(sevenScenes).map(make=>make()),...[false,true].flatMap(well=>Object.values(capitalScenes).map(make=>make(chapterSixCapitalStart(well))))];
 for(const d of scripts)for(const line of d.lines)if(line.shot?.music)expect(bossCues.has(line.shot.music),`${d.scene?.id}: ${line.shot.music}`).toBe(false);
 for(const id of ['benefactor-body','benefactor-sun','benefactor-heart','lightbearer']as const){
  expect(ARRANGEMENTS[ENCOUNTERS[id].music].introBars,id).toBe(2);
 }
 for(const make of [sevenScenes.god,sevenScenes.sun,sevenScenes.heart])expect(make().lines[0].shot?.music).toBe('sunthrone');
 expect(capitalScenes.manifestation(chapterSixCapitalStart()).lines[0].shot?.music).toBe('crown');
});

const pairs:readonly (readonly [MusicMode,MusicMode])[]=[
 ['five-furnace','five-battle'],['dawn-commander','dawn-battle'],['wind-engine','wind-battle'],
 ['sun-serpent','desert-battle'],['rain-warden','river-battle'],['winter-dragon','north-battle'],
 ['emperor','capital-battle'],['lightbearer','capital-battle'],
 ['harvest-battle','domain-battle'],['hospice-battle','domain-battle'],['seasons-battle','domain-battle'],
 ['benefactor','domain-battle'],['hollow-sun','domain-battle'],['unborrowed','domain-battle'],
];
it('late bosses sustain their low-end drive and have more drum attack weight than regional ordinary battles',()=>{
 const weight=(mode:MusicMode)=>{
  const intro=ARRANGEMENTS[mode].introBars??0;
  let energy=0;
  for(let bar=intro;bar<scoreLength(mode);bar++)for(const n of scoreBar(mode,bar))if(isPercussion(n.instrument)){
   const accent=n.expression?.dynamics?.[0][1]??1;energy+=(n.velocity*accent)**2;
  }
  return energy/((scoreLength(mode)-intro)*ARRANGEMENTS[mode].beats);
 };
 for(const [boss,ordinary]of pairs){
  expect(weight(boss),boss).toBeGreaterThan(weight(ordinary));
  for(let bar=ARRANGEMENTS[boss].introBars??0;bar<scoreLength(boss);bar++){
   const notes=scoreBar(boss,bar);
   expect(notes.some(n=>n.instrument===(boss==='dawn-commander'&&bar>=16?'round-bass':'square-bass')),boss+':'+bar).toBe(true);
   expect(notes.some(n=>n.instrument==='kick'&&n.beat===0),boss+':'+bar).toBe(true);
  }
 }
});

it('keeps regional drum language and the Lightbearer lament distinct',()=>{
 for(const mode of ['sun-serpent','rain-warden']as const)for(let bar=2;bar<32;bar++){
  expect(scoreBar(mode,bar).some(n=>n.instrument==='hand-drum')).toBe(true);
  expect(scoreBar(mode,bar).some(n=>n.instrument==='snare')).toBe(false);
 }
 expect(scoreBar('winter-dragon',2).filter(n=>n.instrument==='snare').map(n=>n.beat)).toEqual([2,4]);
 expect(scoreBar('emperor',2).filter(n=>n.instrument==='snare').map(n=>n.beat)).toEqual([1,2]);
 expect(scoreBar('lightbearer',2).filter(n=>n.instrument==='snare').map(n=>n.beat)).toEqual([2]);
 expect(scoreBar('lightbearer',2).find(n=>n.instrument==='bell')?.pitch).toBe('D5');
});
