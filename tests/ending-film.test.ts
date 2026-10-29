import {expect,it} from 'vitest';
import {GOOD_ENDING_DURATION,GOOD_ENDING_SHOTS,endingFrame,endingShotStart,canPlayGoodEnding} from '../src/content/ending-film';
import {paintGoodEnding} from '../src/game/ending-art';
import {newGame} from '../src/rules/state';
import {interactChapterSeven} from '../src/content/chapter-seven/interactions';
import type {StoryHost} from '../src/content/story-host';
import {ENDING_CREDITS,ENDING_CREDITS_START,ENDING_CREDITS_END,ENDING_CREDIT_PAGE,endingCreditPage} from '../src/content/credits';
import {SHORE_COMPANIONS,SHORE_HORIZON,shoreScaleAt,shoreBlocking} from '../src/game/ending-shore';

it('cuts at exact shot boundaries, clamps review positions and ends after the final image',()=>{
 expect(GOOD_ENDING_DURATION).toBe(90000);
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

it('lets the companions stand and leave the camera before the couple reaches the sunset credits',()=>{
 const opening=shoreBlocking(0),arrival=shoreBlocking(ENDING_CREDITS_START);
 expect(arrival.y).toBeLessThan(opening.y);expect(arrival.nellX).toBeGreaterThan(opening.nellX);
 expect(arrival.walk).toBeUndefined();expect(shoreBlocking(4000).walk).not.toBeUndefined();
 for(const companion of SHORE_COMPANIONS){
  expect((companion.rise+1.2)*1000).toBeLessThan(ENDING_CREDITS_START);
  // Even a conservative 100-unit standing head clears the bottom of the frame.
  expect(companion.y-100*companion.scale-arrival.cameraY).toBeGreaterThan(288);
 }
 expect(arrival.y-arrival.cameraY).toBeLessThan(288);
 expect(shoreBlocking(0).sunset).toBe(0);expect(shoreBlocking(ENDING_CREDITS_END).sunset).toBe(1);
 expect(shoreBlocking(0,true)).toEqual(shoreBlocking(50000,true));
});

it('gives every credit a readable reduced-motion page inside the roll interval',()=>{
 for(let i=0;i<ENDING_CREDITS.length;i++)expect(endingCreditPage(ENDING_CREDITS_START+i*ENDING_CREDIT_PAGE+1)).toBe(i);
 expect(endingCreditPage(-100)).toBe(0);expect(endingCreditPage(NaN)).toBe(0);
 expect(endingCreditPage(60000)).toBe(ENDING_CREDITS.length-1);
 expect(ENDING_CREDITS_END).toBeLessThan(GOOD_ENDING_SHOTS[3].duration);
});

it('projects stature, spacing and the picnic cast consistently as the couple recedes',()=>{
 const near=shoreBlocking(0),far=shoreBlocking(12000);
 expect(far.scale).toBeLessThan(near.scale*.5);
 expect(far.scale/near.scale).toBeCloseTo((far.y-SHORE_HORIZON)/(near.y-SHORE_HORIZON));
 expect((far.kitX-far.nellX)/(near.kitX-near.nellX)).toBeCloseTo(far.scale/near.scale);
 for(const companion of SHORE_COMPANIONS)expect(companion.scale).toBeCloseTo(shoreScaleAt(companion.y));
 // Moving the camera preserves projected height relative to the horizon.
 const heightRatio=(stage:ReturnType<typeof shoreBlocking>)=>100*stage.scale/((stage.y-stage.cameraY)-(SHORE_HORIZON-stage.cameraY));
 expect(heightRatio(far)).toBeCloseTo(heightRatio(near));
});

it('opens with the requested author/director billing and leaves tooling until last',()=>{
 expect(ENDING_CREDITS.slice(0,3)).toMatchObject([
  {role:'Borrowed Tomorrow',lines:[]},
  {role:'A game by',lines:['GPT-6.1 Sol']},
  {role:'Directed by',lines:['Lumi Pakkanen']},
 ]);
 expect(ENDING_CREDITS.find(credit=>credit.role==='Music')?.lines).toEqual(['GPT-6.1 Sol']);
 expect(ENDING_CREDITS.find(credit=>credit.role==='Additional musical passages')?.lines).toEqual(['Lumi Pakkanen']);
 for(const role of ['Combat system direction','Story concepts','Art direction','Playtesting'])expect(ENDING_CREDITS.find(credit=>credit.role===role)?.lines).toEqual(['Lumi Pakkanen']);
 expect(ENDING_CREDITS.find(credit=>credit.role==='Game design')?.lines).toContain('Lumi Pakkanen');
 const firstTool=ENDING_CREDITS.findIndex(credit=>'tooling' in credit);
 expect(firstTool).toBeGreaterThan(10);
 expect(ENDING_CREDITS.slice(firstTool).every(credit=>'tooling' in credit&&credit.tooling)).toBe(true);
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
  for(let i=0;i<4;i++)for(const offset of [0,400,3000,GOOD_ENDING_SHOTS[i].duration/2,GOOD_ENDING_SHOTS[i].duration-1])paintGoodEnding(ctx,endingShotStart(i)+offset,reduced);
 }
 expect(calls).toBeGreaterThan(10000);expect(JSON.stringify(GOOD_ENDING_SHOTS)).toBe(original);
});
