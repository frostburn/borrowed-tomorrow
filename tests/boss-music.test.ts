import {expect,it} from 'vitest';
import {ARRANGEMENTS,scoreBar,scoreLength,type MusicMode} from '../src/game/score';
import {isPercussion} from '../src/game/tuning';

const pairs:readonly (readonly [MusicMode,MusicMode])[]=[
 ['five-furnace','five-battle'],['dawn-commander','dawn-battle'],['wind-engine','wind-battle'],['flagship','five-battle'],
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
   expect(notes.some(n=>n.instrument==='square-bass'),boss+':'+bar).toBe(true);
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
