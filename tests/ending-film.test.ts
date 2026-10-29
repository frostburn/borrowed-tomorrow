import {expect,it} from 'vitest';
import {GOOD_ENDING_DURATION,GOOD_ENDING_SHOTS,BAD_ENDING_DURATION,BAD_ENDING_SHOTS,BAD_ENDING_CUES,ENDING_FILMS,endingFrame,endingShotStart,endingCreditTime,canPlayGoodEnding,canPlayBadEnding} from '../src/content/ending-film';
import {paintCreditsStillLife} from '../src/game/credits';
import {paintEndingFilm} from '../src/game/ending-art';
import {newGame} from '../src/rules/state';
import {interactChapterSeven} from '../src/content/chapter-seven/interactions';
import {interactCapital} from '../src/content/chapter-six/capital/interactions';
import type {StoryHost} from '../src/content/story-host';
import {ENDING_CREDITS,ENDING_CREDITS_START,ENDING_CREDITS_END,ENDING_CREDIT_PAGE,endingCreditPage} from '../src/content/credits';
import {badEndingBlocking,BAD_ENDING_CAST,BAD_ENDING_LANTERN} from '../src/game/ending-bad';
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

it('gives the bad ending one continuous shot and the identical full credit interval',()=>{
 expect(BAD_ENDING_DURATION).toBe(72000);expect(BAD_ENDING_SHOTS).toHaveLength(1);expect(BAD_ENDING_DURATION).toBeLessThan(GOOD_ENDING_DURATION);
 for(let i=0;i<BAD_ENDING_SHOTS.length;i++){
  const start=endingShotStart(i,'bad'),shot=BAD_ENDING_SHOTS[i];
  expect(endingFrame(start,'bad')).toMatchObject({index:i,shot,time:0});
  expect(endingFrame(start+shot.duration-1,'bad').shot.id).toBe(shot.id);
 }
 expect(endingFrame(BAD_ENDING_DURATION,'bad')).toMatchObject({index:0,progress:1,ended:true});
 expect(endingFrame(NaN,'bad')).toMatchObject({index:0,time:0});
 expect(endingShotStart(99,'bad')).toBe(0);
 for(const kind of ['good','bad'] as const){
  const film=ENDING_FILMS[kind],creditLength=ENDING_CREDITS_END-ENDING_CREDITS_START;
  expect(endingCreditTime(film.creditStart,kind)).toBe(ENDING_CREDITS_START);
  expect(endingCreditTime(film.creditStart+creditLength,kind)).toBe(ENDING_CREDITS_END);
  expect(film.creditStart+creditLength).toBeLessThan(film.shots[film.creditShot]!.duration);
  for(let i=0;i<ENDING_CREDITS.length;i++)expect(endingCreditPage(endingCreditTime(film.creditStart+i*ENDING_CREDIT_PAGE+1,kind))).toBe(i);
 }
});

it('reveals the cast then the lantern through framing before departure, rain and credits',()=>{
 const projected=(time:number,x:number,y:number)=>{
  const camera=badEndingBlocking(time);return {x:x*camera.zoom+camera.offsetX,y:y*camera.zoom+camera.offsetY};
 };
 for(const actor of BAD_ENDING_CAST)expect(projected(0,actor.x+24*actor.scale,250).x).toBeLessThan(0);
 // Orrin is already inside the shot while the broken lantern is still outside it.
 expect(projected(8000,286,245).x).toBeGreaterThan(0);
 expect(projected(8000,BAD_ENDING_LANTERN.x,BAD_ENDING_LANTERN.y).x).toBeLessThan(0);
 expect(projected(10000,BAD_ENDING_LANTERN.x,BAD_ENDING_LANTERN.y).x).toBeGreaterThan(0);
 const reveal=badEndingBlocking(BAD_ENDING_CUES.pullbackEnd);
 expect(reveal.zoom).toBe(1);expect(reveal.offsetX).toBe(0);expect(reveal.offsetY).toBe(0);
 expect(reveal.train).toBe(0);expect(reveal.rain).toBe(0);
 for(const actor of BAD_ENDING_CAST){const feet=projected(BAD_ENDING_CUES.pullbackEnd,actor.x,279-actor.x/32);expect(feet.x).toBeGreaterThan(0);expect(feet.y).toBeLessThan(288);}
 expect(BAD_ENDING_CUES.pullbackEnd).toBeLessThan(BAD_ENDING_CUES.trainStart);
 expect(badEndingBlocking(BAD_ENDING_CUES.trainEnd).train).toBeGreaterThan(554); // last coach has cleared x=0
 expect(badEndingBlocking(BAD_ENDING_CUES.trainEnd).rain).toBe(1);
 const flash=badEndingBlocking((BAD_ENDING_CUES.lightningStart+BAD_ENDING_CUES.lightningEnd)/2);
 expect(flash.lightning).toBeCloseTo(1);expect(flash.rain).toBe(0);
 expect(BAD_ENDING_CUES.lightningEnd).toBeLessThan(BAD_ENDING_CUES.rainStart);
 expect(BAD_ENDING_CUES.rainStart).toBeLessThan(BAD_ENDING_CUES.trainEnd);
 expect(badEndingBlocking(16500,true).lightning).toBe(0);
 expect(badEndingBlocking(BAD_ENDING_CUES.rainFull).rain).toBe(1);
 expect(ENDING_FILMS.bad.creditStart).toBeGreaterThan(BAD_ENDING_CUES.rainStart);
 expect(BAD_ENDING_CUES.captionStart).toBeGreaterThan(ENDING_FILMS.bad.creditStart+ENDING_CREDITS_END-ENDING_CREDITS_START);
 expect(badEndingBlocking(0,true)).toEqual(badEndingBlocking(70000,true));
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

it('exposes bad-ending replay only after Nell’s loss and the completed station aftermath',()=>{
 const s=newGame();expect(canPlayBadEnding(s)).toBe(false);
 s.flags.nellLost=s.flags.emptySeatSeen=true;expect(canPlayBadEnding(s)).toBe(false);
 s.flags.lightbearerEnding=true;expect(canPlayBadEnding(s)).toBe(true);expect(canPlayGoodEnding(s)).toBe(false);
 for(const flag of ['nellRecovered','chapterSevenComplete']){s.flags[flag]=true;expect(canPlayBadEnding(s)).toBe(false);delete s.flags[flag];}
});

it('saves completion before playback and leaves headless hosts on the existing boundary path',()=>{
 for(const film of [false,true]){
  const s=newGame();s.flags.realSeaSeen=true;const order:string[]=[];
  const host={state:s,refresh:()=>order.push('refresh'),save:()=>{expect(s.flags.chapterSevenComplete).toBe(true);order.push('save');},boundary:()=>order.push('boundary'),...(film?{endingFilm:()=>order.push('film')}:{})} as unknown as StoryHost;
  interactChapterSeven(host,'sea-ending');expect(order).toEqual(['refresh','save',film?'film':'boundary']);
 }
});

it('saves the Lightbearer outcome before its film and preserves the headless ending',()=>{
 for(const film of [false,true]){
  const s=newGame();s.location={map:'laststation',x:22,y:15};s.flags.nellLost=s.flags.emptySeatSeen=true;
  const order:string[]=[];
  const host={state:s,save:()=>{expect(s.flags.lightbearerEnding).toBe(true);expect(s.boundary).toBeNull();order.push('save');},boundary:()=>order.push('boundary'),...(film?{endingFilm:(kind:string)=>order.push('film:'+kind)}:{})} as unknown as StoryHost;
  interactCapital(host,'last-ending');expect(order).toEqual(['save',film?'film:bad':'boundary']);
  expect(s.flags.chapterSixComplete).toBeUndefined();expect(s.flags.chapterSevenComplete).toBeUndefined();
 }
});

it('paints finite vector geometry in wide and narrow views without mutating the timeline',()=>{
 const original=JSON.stringify(ENDING_FILMS);let calls=0;
 const ctx=new Proxy({canvas:{width:1008,height:480}} as unknown as CanvasRenderingContext2D,{
  get:(target,key)=>(key==='createLinearGradient'||key==='createRadialGradient')?()=>({addColorStop(){}}):key in target?Reflect.get(target,key):(...args:unknown[])=>{calls++;for(const value of args)if(typeof value==='number')expect(Number.isFinite(value)).toBe(true);},
  set:(target,key,value)=>Reflect.set(target,key,value),
 });
 for(const width of [1008,368])for(const reduced of [false,true]){
  ctx.canvas.width=width;paintCreditsStillLife(ctx);
  for(const kind of ['good','bad'] as const)for(let i=0;i<ENDING_FILMS[kind].shots.length;i++)for(const offset of [0,400,3000,ENDING_FILMS[kind].shots[i].duration/2,ENDING_FILMS[kind].shots[i].duration-1])paintEndingFilm(ctx,endingShotStart(i,kind)+offset,reduced,kind);
 }
 expect(calls).toBeGreaterThan(10000);expect(JSON.stringify(ENDING_FILMS)).toBe(original);
});
