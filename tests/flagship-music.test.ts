import { expect, it } from 'vitest';
import { ARRANGEMENTS, scoreBar, scoreLength, scoreMeter, scorePosition } from '../src/game/score';
import { pitchFrequency } from '../src/game/tuning';
import { FLAGSHIP_ENCOUNTER } from '../src/dev/flagship-battle';

it('starts with two intro bars, then repeats only the 32-bar 10/8 battle',()=>{
 expect(FLAGSHIP_ENCOUNTER.music).toBe('flagship');expect(scoreMeter('flagship')).toBe('10/8');
 expect(ARRANGEMENTS.flagship).toMatchObject({beats:5,bpm:132,introBars:2});expect(scoreLength('flagship')).toBe(34);
 expect([0,1,2,33,34,35,65,66].map(b=>scorePosition('flagship',b))).toEqual([0,1,2,33,2,3,33,2]);
 expect(scoreBar('flagship',34)).toEqual(scoreBar('flagship',2));expect(scoreBar('flagship',66)).toEqual(scoreBar('flagship',2));
 for(let b=2;b<100;b++)expect(scorePosition('flagship',b)).toBeGreaterThanOrEqual(2);
 expect(scoreBar('flagship',0)).not.toEqual(scoreBar('flagship',2));
 expect(scorePosition('infirmary',16)).toBe(0);expect(scoreMeter('infirmary')).toBe('3/4');expect(scoreMeter('coast')).toBe('4/4');
});
it('writes a single articulated lead with distinct answers, a string middle and a varied return',()=>{
 const lead=[];
 for(let bar=0;bar<34;bar++){
  const notes=scoreBar('flagship',bar);
  for(const n of notes){expect(pitchFrequency(n.pitch)).toBeGreaterThan(30);expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(5);expect(n.duration).toBeGreaterThan(0);expect(n.beat+n.duration).toBeLessThanOrEqual(5);expect(n.velocity).toBeLessThan(.3);}
  if(bar<2)continue;
  const voice=bar>=18&&bar<26?'strings':'brass';
  lead.push(...notes.filter(n=>n.instrument===voice&&n.velocity>.1).map(n=>({...n,beat:n.beat+(bar-2)*5})));
 }
 for(let i=1;i<lead.length;i++)expect(lead[i-1].beat+lead[i-1].duration).toBeLessThan(lead[i].beat);
 const phrase=(bar:number)=>Array.from({length:8},(_,i)=>scoreBar('flagship',bar+i).filter(n=>(n.instrument==='brass'||n.instrument==='strings')&&n.velocity>.1).map(n=>[n.beat,n.pitch,n.duration]));
 expect(phrase(2)).not.toEqual(phrase(10));expect(phrase(18)).not.toEqual(phrase(2));expect(phrase(26)).not.toEqual(phrase(2));
 expect(scoreBar('flagship',5).some(n=>n.pitch==='C#5')).toBe(true);expect(scoreBar('flagship',22).some(n=>n.pitch==='Ab5')).toBe(true);
});
it('shares a 2+2+3+3 pulse between bass and drums, with restrained phrase-ending fills',()=>{
 const opening=scoreBar('flagship',2),last=scoreBar('flagship',9);
 expect(opening.filter(n=>n.instrument==='round-bass').map(n=>n.beat)).toEqual([0,1,2,3.5]);
 expect(opening.filter(n=>n.instrument==='kick').map(n=>n.beat)).toEqual([0,2]);
 expect(opening.filter(n=>n.instrument==='snare').map(n=>n.beat)).toEqual([1,3.5]);
 expect(last.filter(n=>n.instrument==='snare').map(n=>n.beat)).toEqual([1,3.5,4,4.25,4.5,4.75]);
 expect(opening.some(n=>n.instrument==='timpani')).toBe(true);expect(opening.some(n=>n.instrument==='cymbal')).toBe(true);
 expect(scoreBar('flagship',3).some(n=>n.instrument==='cymbal')).toBe(false);
});
