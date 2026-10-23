import {it,expect} from 'vitest';
import {scoreBar,scoreLength,scorePosition,type MusicMode} from '../src/game/score';
import {pitchSteps,type Pitch} from '../src/game/tuning';

const line=(mode:MusicMode,bar:number)=>scoreBar(mode,bar).filter(n=>n.velocity>=.2&&['keys','reed','strings','brass'].includes(n.instrument));
it('Orrin trades four-bar hammer sentences with Nell’s unchanged festival melody',()=>{
 const taps=line('yard',0);expect(taps.map(n=>n.pitch)).toEqual(['A4','A4','Bb4','A4','E4']);
 const identity=(pitches:Pitch[])=>pitches.slice(1).map((p,i)=>pitchSteps(p)-pitchSteps(pitches[i]));
 const hammer=scoreBar('hammerplain',0).filter(n=>n.instrument==='keys'&&n.velocity>=.2);
 expect(identity(taps.map(n=>n.pitch))).toEqual(identity(hammer.map(n=>n.pitch)));
 for(let bar=0;bar<4;bar++)expect(line('yard',bar+4).map(n=>[n.beat,n.pitch,n.duration])).toEqual(line('station',bar).map(n=>[n.beat,n.pitch,n.duration]));
 for(let bar=12;bar<16;bar++)expect(line('yard',bar).map(n=>[n.beat,n.pitch,n.duration])).toEqual(line('station',bar).map(n=>[n.beat,n.pitch,n.duration]));
 for(const bar of [2,8,9]){
  const taps=line('yard',bar);expect(taps.slice(0,4).every(n=>n.pitch===taps[0].pitch)).toBe(true);
  expect(taps.map(n=>n.beat)).toEqual([0,.5,1.5,2,3]);
 }
});
it('Alban keeps sixteen bars before adding the flagship contour in a 4/4 extension',()=>{
 for(let bar=0;bar<16;bar++)expect(line('inspector',bar).map(n=>[n.beat,n.pitch,n.duration])).toEqual(line('station',bar).map(n=>[n.beat,n.pitch,n.duration]));
 expect(scoreBar('inspector',9).some(n=>n.instrument==='bell'&&n.beat===1.5&&n.duration===1.75)).toBe(true);
 expect(scoreLength('inspector')).toBe(24);expect(scorePosition('inspector',24)).toBe(0);
 expect(scoreBar('inspector',24)).toEqual(scoreBar('inspector',0));expect(scoreBar('inspector',-1)).toEqual(scoreBar('inspector',23));
 const early=line('inspector',16),later=scoreBar('flagship',2).filter(n=>n.instrument==='brass'&&n.velocity>=.2);
 const contour=(notes:typeof early)=>notes.slice(1).map((n,i)=>Math.sign(pitchSteps(n.pitch)-pitchSteps(notes[i].pitch)));
 expect(contour(early)).toEqual(contour(later));expect(early.map(n=>n.beat)).toEqual([0,1,2,3]);
 expect(early.map(n=>n.beat)).not.toEqual(later.map(n=>n.beat));
});
