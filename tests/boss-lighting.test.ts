import {afterEach,expect,it,vi} from 'vitest';
import type Phaser from 'phaser';
import type {Battle,Encounter,Unit} from '../src/rules/combat';
import {offset,hexVertices,toPixel} from '../src/rules/hex';
import {focusExposure,lampStrength,lightPixels} from '../src/game/world-light';
import {BossLighting} from '../src/game/boss-lighting';
import {ENCOUNTERS,encounterChapter} from '../src/content/encounters';
let reduced=false;
afterEach(()=>{vi.unstubAllGlobals();reduced=false;});
function fixture(boss:NonNullable<Encounter['boss']>='benefactor',form:0|1|2=0,definition?:Encounter){
 vi.stubGlobal('window',{matchMedia:()=>({matches:reduced})});
 const time={now:0},battle={}as Battle,encounter=definition??Object.values(ENCOUNTERS).find(e=>e.boss===boss&&(boss!=='benefactor'||e.benefactorForm===form))!;
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
 lighting.attack('source',[offset(4,5)],400,950);time.now=400;expect(lighting.sample().lamps[0].strength).toBeGreaterThan(rest+.5);
 const redrawn=fixture('dragon');redrawn.time.now=400;redrawn.lighting.attack('source',[offset(4,5)],400,950,400);
 expect(redrawn.lighting.sample().lamps[0].strength).toBe(lighting.sample().lamps[0].strength);
 time.now=950;expect(lighting.sample().lamps[0].strength).toBeLessThan(rest+.25);
});
it('uses scene time between inputs and settles immediately for reduced motion or extinguished sources',()=>{
 const {lighting,time}=fixture();const first=lighting.sample();time.now=2000;expect(lighting.sample()).not.toBe(first);
 reduced=true;const still=lighting.sample();time.now=7000;lighting.attack('source',[offset(4,5)],400,900);expect(lighting.sample()).toBe(still);expect(lighting.animating).toBe(false);
 lighting.bind({id:'source'}as Unit,{active:true,x:460,y:280,displayHeight:280}as Phaser.GameObjects.Image,0);
 expect(lighting.sample().lamps).toHaveLength(4);expect(lighting.sample().ambient).toEqual([.8,.82,.84]);
});

it('fills the party area with broad diffuse front light, rather than a dark wash',()=>{
 const rig=fixture('benefactor',2).lighting.sample();
 for(const h of [offset(1,5),offset(5,5),offset(9,6)]){
  const p=toPixel(h),fill=rig.lamps.filter(l=>l.fill===.9);
  expect(fill).toHaveLength(2);expect(fill.every(l=>l.y>280&&l.radius>=1000)).toBe(true);
  expect(fill.reduce((sum,l)=>sum+lampStrength(l,p.x,p.y),0)).toBeGreaterThan(.30);
  const source={data:new Uint8ClampedArray([140,110,80,255]),width:1,height:1}as ImageData;
  const lit={...source,data:new Uint8ClampedArray(4)};lightPixels(source,lit,rig,p.x,p.y+9,0,20);
  expect(lit.data[0]).toBeGreaterThanOrEqual(126);expect(lit.data[1]).toBeGreaterThanOrEqual(99);expect(lit.data[2]).toBeGreaterThanOrEqual(72);
 }
});
it('focuses actual fired cells through wind-up/contact and releases after recovery, including a redraw',()=>{
 const {lighting,time}=fixture(),cells=[offset(2,5),offset(3,5)],original=cells.map(h=>hexVertices(h));
 lighting.attack('source',cells,400,950);expect(lighting.sample().focus).toBeUndefined();
 cells[0].q+=5; // Capture the fired cells; the next round may replace intent/aim.
 time.now=200;const gathering=lighting.sample().focus!;expect(gathering.polygons).toEqual(original);expect(gathering.strength).toBeGreaterThan(.5);
 time.now=400;const contact=lighting.sample().focus!;expect(contact.strength).toBe(.72);
 const target=toPixel(offset(2,5)),safe=toPixel(offset(4,5));
 expect(focusExposure(contact,target.x,target.y+9)).toBe(1);expect(focusExposure(contact,safe.x,safe.y+9)).toBeLessThan(.51);
 const redrawn=fixture();redrawn.time.now=400;redrawn.lighting.attack('source',[offset(2,5),offset(3,5)],400,950,400);
 expect(redrawn.lighting.sample().focus).toEqual(contact);
 time.now=800;expect(lighting.sample().focus!.strength).toBeLessThan(gathering.strength);
 time.now=950;expect(lighting.sample().focus).toBeUndefined();
});
it('never spotlights a disabled source, a non-boss, empty affected area or reduced motion',()=>{
 const {lighting,time}=fixture();lighting.attack('minion',[offset(2,5)],400,950);time.now=300;expect(lighting.sample().focus).toBeUndefined();
 lighting.attack('source',[],400,950);time.now=600;expect(lighting.sample().focus).toBeUndefined();
 lighting.attack('source',[offset(2,5)],400,950);time.now=900;expect(lighting.sample().focus).toBeDefined();
 reduced=true;expect(lighting.sample().focus).toBeUndefined();
 reduced=false;lighting.bind({id:'source'}as Unit,{active:true,x:460,y:280,displayHeight:280}as Phaser.GameObjects.Image,0);
 expect(lighting.sample().focus).toBeUndefined();
});

it('preserves pale material colours even at attack contact, with darker ground around the source',()=>{
 for(const boss of ['furnace','ward','flagship','dragon','serpent','emperor','lightbearer','benefactor']as const){
  const {lighting,time}=fixture(boss);lighting.attack('source',[offset(4,5)],400,950);time.now=400;
  const rig=lighting.sample(),source={data:new Uint8ClampedArray([200,220,240,255]),width:1,height:1}as ImageData,output={...source,data:new Uint8ClampedArray(4)};
  lightPixels(source,output,rig,460,280,0,120);
  for(let c=0;c<3;c++){expect(output.data[c]).toBeLessThanOrEqual(Math.round(source.data[c]*1.04));expect(output.data[c]).toBeLessThan(255);expect(rig.groundAmbient![c]).toBeLessThan(rig.ambient[c]-.1);}
  expect(output.data[3]).toBe(255);
  expect(rig.lamps.filter(l=>l.fill===.9).every(l=>(l.spill??1)<.2)).toBe(true);
 }
});
it('lights the Lightbearer from her right-hand lantern and dims it with the actual shutter pose',()=>{
 const {lighting,image}=fixture('lightbearer');const open=lighting.sample(),lamp=open.lamps[0];
 expect(open.environmentShade).toBeGreaterThan(.2);expect(Math.max(...open.groundAmbient!)).toBeLessThan(.45);
 expect(Math.abs(lamp.x-image.x+27)).toBeLessThanOrEqual(1);expect(lamp.height).toBe(97);
 expect(lamp.color![0]).toBeGreaterThan(lamp.color![2]);
 expect(open.flares).toEqual([{x:lamp.x,y:Math.round((lamp.y-lamp.height)/2)*2,strength:lamp.strength}]);
 Object.assign(image,{texture:{key:'lightbearer-resist'}});const closed=lighting.sample();
 expect(closed.lamps[0].height).toBe(118);expect(closed.lamps[0].strength).toBeLessThan(lamp.strength*.2);
 expect(closed.flares).toEqual([]);
 expect(closed.lamps[1]).toEqual(open.lamps[1]); // Front fill still makes the party readable.
 Object.assign(image,{texture:{key:'lightbearer-idle'}});expect(lighting.sample().lamps[0]).toEqual(lamp);
 expect(fixture('emperor').lighting.sample().environmentShade).toBeUndefined();
 expect(fixture('emperor').lighting.sample().flares).toEqual([]);
 lighting.bind({id:'source'}as Unit,image,0);expect(lighting.sample().flares).toEqual([]);
});

it('ramps attack darkness by the encounter chapter, including dev copies and later reprises',()=>{
 for(const [id,chapter,peak]of [['hammer-carrier',5,.36],['wind-engine',5,.36],['alban-flagship',5,.36],['winter-dragon',6,.54],['sun-serpent',6,.54],['lightbearer',6,.54],['imperial-vessel',6,.54],['domain-furnace',7,.72],['domain-ward',7,.72],['domain-dragon',7,.72],['benefactor-body',7,.72],['benefactor-sun',7,.72],['benefactor-heart',7,.72]]as const){
  const source=ENCOUNTERS[id];
  for(const encounter of [source,{...source,id:'dev-'+id}]){
   expect(encounterChapter(encounter)).toBe(chapter);
   const {lighting,time}=fixture(source.boss!,source.benefactorForm??0,encounter);
   const idle=lighting.sample();expect(idle.focus).toBeUndefined();
   lighting.attack('source',[offset(4,5)],400,950);time.now=400;
   const focus=lighting.sample().focus!;expect(focus.strength).toBeCloseTo(peak);
   const target=toPixel(offset(4,5)),safe=toPixel(offset(7,5));expect(focusExposure(focus,target.x,target.y)).toBe(1);expect(focusExposure(focus,safe.x,safe.y)).toBeCloseTo(1-peak*.7);
   const redraw=fixture(source.boss!,source.benefactorForm??0,encounter);redraw.time.now=400;redraw.lighting.attack('source',[offset(4,5)],400,950,400);expect(redraw.lighting.sample().focus).toEqual(focus);
   time.now=950;expect(lighting.sample().focus).toBeUndefined();expect(lighting.sample().ambient).toEqual(idle.ambient);
  }
 }
 expect(encounterChapter(ENCOUNTERS.captain)).toBe(1);expect(encounterChapter(ENCOUNTERS['sanctuary-warden'])).toBe(4);
 expect(encounterChapter({id:'unknown'})).toBeUndefined();
});
