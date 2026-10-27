import {test,expect} from '@playwright/test';

const bosses=['five-furnace','dawn-commander','wind-engine','flagship','sun-serpent','rain-warden','winter-dragon','emperor','lightbearer','harvest-battle','hospice-battle','seasons-battle','benefactor','hollow-sun','unborrowed']as const;
// Detailed full-form audio work is deliberately outside the small @ci set.
for(const mode of bosses)test(`late boss ${mode}: complete form and loop seam retain headroom and smooth samples`,async({page},testInfo)=>{
 test.setTimeout(120000);
 await page.route('**/offline-boss-review',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Boss score render</title>'}));
 await page.goto('/offline-boss-review');
 const result=await page.evaluate(async mode=>{
  // @ts-expect-error Render the exact live arrangement and shared performance clock.
  const {ARRANGEMENTS,scoreLength}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Actual live rack, including the square bass and envelopes.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Preserve dynamics, note holds and intro/loop mapping.
  const {performanceBar,scoreTime}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  const rate=22050,a=ARRANGEMENTS[mode],bars=scoreLength(mode)+2,sections=[];
  for(let start=0;start<bars;start+=4){
   const take=Math.min(4,bars-start),first=Math.max(0,start-4),reference=scoreTime(mode,first*a.beats),begin=scoreTime(mode,start*a.beats)-reference,end=scoreTime(mode,(start+take)*a.beats)-reference;
   const c=new OfflineAudioContext(2,Math.ceil((end+3)*rate),rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
   for(let bar=first;bar<start+take+1;bar++)for(const n of performanceBar(mode,bar).notes)synth.note(n.instrument,n.pitch,.03+scoreTime(mode,bar*a.beats)-reference+n.time,n.seconds,n.velocity,n.pan,n.expression);
   const audio=await c.startRendering();let peak=0,sum=0,jump=0,count=0;
   for(let ch=0;ch<2;ch++){const d=audio.getChannelData(ch);for(let i=Math.ceil((.03+begin)*rate);i<Math.floor((.03+end)*rate);i++){const v=d[i];if(!Number.isFinite(v))throw Error('Non-finite audio');peak=Math.max(peak,Math.abs(v));sum+=v*v;jump=Math.max(jump,Math.abs(v-d[i-1]));count++;}}
   sections.push({start,peak,jump,rms:Math.sqrt(sum/count)});
  }
  return {mode,sections};
 },mode);
 await testInfo.attach('boss-full-form-levels',{body:JSON.stringify(result,null,2),contentType:'application/json'});
 for(const s of result.sections){expect(s.peak,JSON.stringify(s)).toBeLessThan(.9);expect(s.jump,JSON.stringify(s)).toBeLessThan(.25);expect(s.rms,JSON.stringify(s)).toBeGreaterThan(.005);}
});
