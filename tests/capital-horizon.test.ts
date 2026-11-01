import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {CAPITAL_SKY,CAPITAL_SKY_FOCUS,capitalHorizon} from '../src/content/capital-horizon';
import {hollowSunPolygons} from '../src/content/hollow-sun';
import {landing} from '../src/content/chapter-six/capital/scenes';
import {chapterSixFinaleStart} from '../src/dev/canonical-saves';

for(const [width,height,dialogue]of [[1008,480,184],[368,456,232],[359,456,232],[304,456,232]])it(`places the entire opening above the marble skyline and clear of dialogue at ${width}×${height}`,()=>{
 const sky=capitalHorizon(width),scrollX=(CAPITAL_SKY_FOCUS.x+.5)*24-width/2,scrollY=(CAPITAL_SKY_FOCUS.y+.5)*24+7-height/2;
 expect(scrollY).toBeGreaterThanOrEqual(-CAPITAL_SKY.height);
 for(const phase of [0,.5,1]){
  const sun=hollowSunPolygons(sky.x,sky.y,sky.radius*(105+phase*90)/195,sky.aspect);
  for(const p of [...sun.rays,...sun.bands,...sun.cracks].flat()){
   expect(p.y).toBeLessThan(80);expect(p.y).toBeGreaterThan(-CAPITAL_SKY.height);
   expect(p.x-scrollX).toBeGreaterThan(15);expect(p.x-scrollX).toBeLessThan(width-15);
   expect(p.y-scrollY).toBeGreaterThan(36);expect(p.y-scrollY).toBeLessThan(height-dialogue-8);
  }
 }
});

it('authors sky framing only for the landing reveal, with the existing sky colour and party pan back to the quay',()=>{
 const s=chapterSixFinaleStart(true),before=structuredClone(s),d=landing(s);
 expect(d.scene?.sky).toEqual(CAPITAL_SKY);expect(d.lines[0].shot?.focus).toEqual(CAPITAL_SKY_FOCUS);
 expect(d.lines[1].shot?.focus?.y).toBeGreaterThan(20);expect(s).toEqual(before);
 const background=readFileSync('public/art/vector/chapter-six/capitalquay-back.svg','utf8');
 expect(background).toContain(`fill="#${CAPITAL_SKY.color.toString(16)}"`);
 // The central marble roof starts at 61 + 19 × 1.1 = 81.9 world pixels.
 expect(background).toContain('translate(575 61) scale(1.1)');expect(background).toContain('191,19');
});
