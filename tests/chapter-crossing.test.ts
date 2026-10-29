import {expect,it} from 'vitest';
import {CROSSING_DURATION,CROSSING_FILMS,crossingDuration,crossingFrame,crossingShotStart,type CrossingKind} from '../src/content/crossing';

it('keeps the three-shot crossing short and reaches each cut exactly once',()=>{
 expect(CROSSING_DURATION).toBe(16000);
 expect(crossingFrame(4999).shot.id).toBe('pass');
 expect(crossingFrame(5000).shot.id).toBe('viaduct');
 expect(crossingFrame(11500).shot.id).toBe('exchange');
 expect(crossingFrame(15999).ended).toBe(false);
 expect(crossingFrame(16000).ended).toBe(true);
 expect([0,1,2].map(index=>crossingShotStart(index))).toEqual([0,5000,11500]);
 expect(crossingFrame(-1).time).toBe(0);expect(crossingFrame(NaN).time).toBe(0);
});

for(const kind of Object.keys(CROSSING_FILMS)as CrossingKind[])it(`${kind} crossing cuts and completes without consuming story state`,()=>{
 const film=CROSSING_FILMS[kind],duration=crossingDuration(kind);
 expect(duration).toBe(16000);expect(film.shots).toHaveLength(3);
 for(const [i,shot]of film.shots.entries()){
  const start=crossingShotStart(i,kind);expect(crossingFrame(start,kind)).toMatchObject({index:i,shot,time:0,ended:false});
  expect(crossingFrame(start+shot.duration-1,kind).index).toBe(i);
 }
 expect(crossingFrame(duration,kind)).toMatchObject({index:2,progress:1,ended:true});
 expect(crossingFrame(duration+100,kind)).toEqual(crossingFrame(duration,kind));
 expect(crossingShotStart(-1,kind)).toBe(0);expect(crossingShotStart(999,kind)).toBe(11500);
});
