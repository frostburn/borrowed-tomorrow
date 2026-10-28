import {afterEach,expect,it,vi} from 'vitest';
import type Phaser from 'phaser';
import type {Battle,Encounter,Unit} from '../src/rules/combat';
import {BossLighting} from '../src/game/boss-lighting';
let reduced=false;
afterEach(()=>{vi.unstubAllGlobals();reduced=false;});
function fixture(boss:NonNullable<Encounter['boss']>='benefactor',form:0|1|2=0){
 vi.stubGlobal('window',{matchMedia:()=>({matches:reduced})});
 const time={now:0},battle={}as Battle,encounter={boss,benefactorForm:form}as Encounter;
 const lighting=BossLighting.create({time}as Phaser.Scene,battle,encounter)!;
 const image={active:true,x:460,y:280,displayHeight:280}as Phaser.GameObjects.Image;
 if(lighting)lighting.bind({id:'source'}as Unit,image,100);
 return {lighting,time,image};
}
it('keeps earlier bosses on their authored lighting and gives the three god forms distinct fields',()=>{
 expect(fixture('conduit').lighting).toBeUndefined();
 const fields=[0,1,2].map(form=>fixture('benefactor',form as 0|1|2).lighting.sample());
 expect(new Set(fields.map(r=>JSON.stringify(r.ambient)))).toHaveProperty('size',3);
});
it('caches steady fields, tracks moving sources, charges at contact and resumes recovery after redraw',()=>{
 const {lighting,time,image}=fixture('dragon');
 const first=lighting.sample();expect(lighting.sample()).toBe(first);
 image.x+=24;expect(lighting.sample()).not.toBe(first);const rest=lighting.sample().lamps[0].strength;
 lighting.attack('source',400,950);time.now=400;expect(lighting.sample().lamps[0].strength).toBeGreaterThan(rest+.5);
 const redrawn=fixture('dragon');redrawn.time.now=400;redrawn.lighting.attack('source',400,950,400);
 expect(redrawn.lighting.sample().lamps[0].strength).toBe(lighting.sample().lamps[0].strength);
 time.now=950;expect(lighting.sample().lamps[0].strength).toBeLessThan(rest+.25);
});
it('uses scene time between inputs and settles immediately for reduced motion or extinguished sources',()=>{
 const {lighting,time}=fixture();const first=lighting.sample();time.now=2000;expect(lighting.sample()).not.toBe(first);
 reduced=true;const still=lighting.sample();time.now=7000;lighting.attack('source',400,900);expect(lighting.sample()).toBe(still);expect(lighting.animating).toBe(false);
 lighting.bind({id:'source'}as Unit,{active:true,x:460,y:280,displayHeight:280}as Phaser.GameObjects.Image,0);
 expect(lighting.sample().lamps).toHaveLength(2);expect(lighting.sample().ambient).toEqual([.8,.82,.84]);
});
