import {expect,it} from 'vitest';
import {GOOD_ENDING_DURATION,GOOD_ENDING_SHOTS,endingFrame,endingShotStart,canPlayGoodEnding} from '../src/content/ending-film';
import {paintGoodEnding} from '../src/game/ending-art';
import {newGame} from '../src/rules/state';
import {interactChapterSeven} from '../src/content/chapter-seven/interactions';
import type {StoryHost} from '../src/content/story-host';

it('cuts at exact shot boundaries, clamps review positions and ends after the final image',()=>{
 expect(GOOD_ENDING_DURATION).toBe(44000);
 for(let i=0;i<GOOD_ENDING_SHOTS.length;i++){
  const start=endingShotStart(i),shot=GOOD_ENDING_SHOTS[i];
  expect(endingFrame(start).shot.id).toBe(shot.id);expect(endingFrame(start).progress).toBe(0);
  expect(endingFrame(start+shot.duration-1).shot.id).toBe(shot.id);
 }
 expect(endingFrame(GOOD_ENDING_DURATION)).toMatchObject({index:3,progress:1,ended:true});
 expect(endingFrame(-1)).toMatchObject({index:0,time:0});
 expect(endingFrame(NaN)).toMatchObject({index:0,time:0});
 expect(endingShotStart(99)).toBe(endingShotStart(3));
});

it('only exposes campaign replay for a recovered, completed real-sea ending',()=>{
 const s=newGame();expect(canPlayGoodEnding(s)).toBe(false);
 s.flags.chapterSevenComplete=s.flags.nellRecovered=s.flags.realSeaSeen=true;
 expect(canPlayGoodEnding(s)).toBe(true);
 for(const flag of ['nellLost','lightbearerEnding']){s.flags[flag]=true;expect(canPlayGoodEnding(s)).toBe(false);s.flags[flag]=false;}
 s.flags.realSeaSeen=false;expect(canPlayGoodEnding(s)).toBe(false);
});

it('saves completion before playback and leaves headless hosts on the existing boundary path',()=>{
 for(const film of [false,true]){
  const s=newGame();s.flags.realSeaSeen=true;const order:string[]=[];
  const host={state:s,refresh:()=>order.push('refresh'),save:()=>{expect(s.flags.chapterSevenComplete).toBe(true);order.push('save');},boundary:()=>order.push('boundary'),...(film?{endingFilm:()=>order.push('film')}:{})} as unknown as StoryHost;
  interactChapterSeven(host,'sea-ending');expect(order).toEqual(['refresh','save',film?'film':'boundary']);
 }
});

it('paints finite vector geometry in wide and narrow views without mutating the timeline',()=>{
 const original=JSON.stringify(GOOD_ENDING_SHOTS);let calls=0;
 const ctx=new Proxy({canvas:{width:1008,height:480}} as unknown as CanvasRenderingContext2D,{
  get:(target,key)=>key in target?Reflect.get(target,key):(...args:unknown[])=>{calls++;for(const value of args)if(typeof value==='number')expect(Number.isFinite(value)).toBe(true);},
  set:(target,key,value)=>Reflect.set(target,key,value),
 });
 for(const width of [1008,368])for(const reduced of [false,true]){
  ctx.canvas.width=width;
  for(let i=0;i<4;i++)for(const offset of [0,400,3000,GOOD_ENDING_SHOTS[i].duration-1])paintGoodEnding(ctx,endingShotStart(i)+offset,reduced);
 }
 expect(calls).toBeGreaterThan(10000);expect(JSON.stringify(GOOD_ENDING_SHOTS)).toBe(original);
});
