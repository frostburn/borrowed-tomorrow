import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {hollowSunPolygons} from '../src/content/hollow-sun';

it('keeps the sky portal at the crossing, separate from the inner-domain boss staging',()=>{
 const background=(map:string)=>readFileSync(`public/art/vector/chapter-seven/${map}-back.svg`,'utf8');
 expect(background('hollowsill').match(/data-symbol="hollow-sun"/g)).toHaveLength(1);
 for(const map of ['firstfield','lastrefuge','sunthrone'])expect(background(map),map).not.toContain('data-symbol="hollow-sun"');
 expect(readFileSync('public/art/vector/chapter-seven/firstfield-ground.svg','utf8')).toContain('data-surface="carved"');
 expect(readFileSync('public/art/vector/chapter-seven/sunthrone-monument.svg','utf8')).toContain('id="halo"');
});

type Point={x:number;y:number};
function inside(point:Point,polygon:Point[]){
 let covered=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)covered=!covered;
 }
 return covered;
}
for(const aspect of [1,.42])it(`keeps one main rim opening and an empty aperture at aspect ${aspect}`,()=>{
 const x=340,y=170,r=100,sun=hollowSunPolygons(x,y,r,aspect);
 const covered=(p:Point)=>[...sun.bands,...sun.rays].some(poly=>inside(p,poly));
 expect(covered({x,y})).toBe(false);
 const ring=Array.from({length:720},(_,i)=>{
  const a=(i*.5+.17)*Math.PI/180;
  expect(covered({x:x+Math.cos(a)*55,y:y+Math.sin(a)*55*aspect})).toBe(false);
  return covered({x:x+Math.cos(a)*85,y:y+Math.sin(a)*85*aspect});
 });
 const gaps=ring.filter((on,i)=>!on&&ring[(i+ring.length-1)%ring.length]);
 expect(gaps).toHaveLength(1);
 expect(ring.filter(on=>!on).length).toBeGreaterThan(30);
 expect(ring.filter(on=>!on).length).toBeLessThan(60);
 const breakAngle=249*Math.PI/180;
 expect(covered({x:x+Math.cos(breakAngle)*104,y:y+Math.sin(breakAngle)*104*aspect})).toBe(false);
});
