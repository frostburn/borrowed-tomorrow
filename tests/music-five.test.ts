import { expect,it } from 'vitest';
import { ARRANGEMENTS,scoreBar,scoreLength,type Note,type MusicMode } from '../src/game/score';
import { pitchFrequency } from '../src/game/tuning';
it('Act I has bounded, varied 32-bar scores with rests and a separate foundry battle family',()=>{
 for(const mode of ['airship','airfield','hammerplain','coolingworks','anchorforge','five-battle','five-furnace']as MusicMode[]){
  const a=ARRANGEMENTS[mode],line:Note[]=[];expect(scoreLength(mode)).toBe(32);
  for(let i=0;i<32;i++)for(const n of scoreBar(mode,i)){
   expect(Number.isFinite(pitchFrequency(n.pitch))).toBe(true);expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(a.beats);expect(n.duration).toBeGreaterThan(0);expect(n.velocity).toBeLessThan(.3);
   if(n.instrument===a.lead&&n.velocity>=.09)line.push({...n,beat:n.beat+i*4});
  }
  for(let i=1;i<line.length;i++)expect(line[i-1].beat+line[i-1].duration).toBeLessThanOrEqual(line[i].beat);
  expect(line.some((n,i)=>i&&line[i-1].beat+line[i-1].duration<n.beat)).toBe(true);
  expect(scoreBar(mode,32)).toEqual(scoreBar(mode,0));expect(scoreBar(mode,-1)).toEqual(scoreBar(mode,31));expect(scoreBar(mode,16)).not.toEqual(scoreBar(mode,0));
 }
 expect(scoreBar('five-furnace',0).some(n=>n.instrument==='brass')).toBe(true);expect(scoreBar('five-furnace',0).some(n=>n.instrument==='timpani')).toBe(true);
 expect(scoreBar('airship',0).some(n=>['kick','snare','hat'].includes(n.instrument))).toBe(false);
});
