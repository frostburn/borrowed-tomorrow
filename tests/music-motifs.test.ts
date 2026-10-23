import {it,expect} from 'vitest';
import {scoreBar,type MusicMode} from '../src/game/score';
import {pitchSteps,type Pitch} from '../src/game/tuning';

const line=(mode:MusicMode,bar:number)=>scoreBar(mode,bar).filter(n=>n.velocity>=.2&&['keys','reed','strings','brass'].includes(n.instrument));
it('Orrin trades four-bar hammer sentences with Nell’s unchanged festival melody',()=>{
 const taps=line('yard',0);expect(taps.map(n=>n.pitch)).toEqual(['A4','A4','Bb4','A4','E4']);
 const identity=(pitches:Pitch[])=>pitches.slice(1).map((p,i)=>pitchSteps(p)-pitchSteps(pitches[i]));
 const hammer=scoreBar('hammerplain',0).filter(n=>n.instrument==='keys'&&n.velocity>=.2);
 expect(identity(taps.map(n=>n.pitch))).toEqual(identity(hammer.map(n=>n.pitch)));
 for(let bar=0;bar<4;bar++)expect(line('yard',bar+4).map(n=>[n.beat,n.pitch,n.duration])).toEqual(line('station',bar).map(n=>[n.beat,n.pitch,n.duration]));
 for(let bar=12;bar<16;bar++)expect(line('yard',bar).map(n=>[n.beat,n.pitch,n.duration])).toEqual(line('station',bar).map(n=>[n.beat,n.pitch,n.duration]));
});
it('Alban keeps his opening but foreshadows the flagship contour in 4/4',()=>{
 expect(line('inspector',0).map(n=>n.pitch)).toEqual(line('station',0).map(n=>n.pitch));
 const early=line('inspector',8),later=scoreBar('flagship',2).filter(n=>n.instrument==='brass'&&n.velocity>=.2);
 const contour=(notes:typeof early)=>notes.slice(1).map((n,i)=>Math.sign(pitchSteps(n.pitch)-pitchSteps(notes[i].pitch)));
 expect(contour(early)).toEqual(contour(later));expect(early.map(n=>n.beat)).toEqual([0,1,2,3]);
 expect(early.map(n=>n.beat)).not.toEqual(later.map(n=>n.beat));
});
