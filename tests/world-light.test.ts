import { describe, expect, it } from 'vitest';
import { castShadows, shadowProjection, lightPixels, lampStrength, stationLight, sceneLight, NIGHT_AMBIENT, type WorldLight } from '../src/game/world-light';
import { CHAPTER_ONE_MAPS, CHAPTER_ONE_BATTLES } from '../src/content/chapter-one/maps';
import { CHAPTER_TWO_MAPS, CHAPTER_TWO_BATTLES } from '../src/content/chapter-two/maps';
import { CHAPTER_THREE_MAPS, CHAPTER_THREE_BATTLES } from '../src/content/chapter-three/maps';
import { CHAPTER_FOUR_MAPS, CHAPTER_FOUR_BATTLES } from '../src/content/chapter-four/maps';
import { CHAPTER_FIVE_MAPS, CHAPTER_FIVE_BATTLES } from '../src/content/chapter-five/maps';
import { CHAPTER_SIX_MAPS,CHAPTER_SIX_BATTLES } from '../src/content/chapter-six/maps';
import { CHAPTER_SEVEN_MAPS,CHAPTER_SEVEN_BATTLES } from '../src/content/chapter-seven/maps';
import { visibleSceneArt } from '../src/content/scene-art';
import { properties } from '../src/content/tilemaps';
import { actorPlanes } from '../src/game/actor-planes';

const lamp={x:100,y:100,height:108,radius:235,strength:1.15};
const rig:WorldLight={ambient:NIGHT_AMBIENT,lamps:[lamp]};
it('keeps locomotive lights at the smokebox end when a siding has both directions',()=>{
 for(const [id,map] of [['yard',CHAPTER_ONE_MAPS.yard],['coast',CHAPTER_TWO_MAPS.coast],['northglass',CHAPTER_THREE_MAPS.northglass]] as const){
  const pieces=visibleSceneArt(map.tiles!,{flags:{}})!,light=sceneLight(id,pieces)!;
  const engines=pieces.filter(p=>/\/engine(?:-right)?\.svg$/.test(p.url));
  expect(engines.length).toBeGreaterThan(0);
  for(const engine of engines){
   const dx=engine.url.endsWith('/engine-right.svg')?247:41;
   expect(light.lamps.some(l=>l.x===engine.x+dx&&l.y===engine.y+179&&l.height===80)).toBe(true);
   expect(light.lamps.some(l=>l.x===engine.x+288-dx&&l.y===engine.y+179&&l.height===80)).toBe(false);
  }
 }
});
// ImageData's data layout is available in Node without introducing a DOM shim.
const pixels=(values:number[])=>({data:new Uint8ClampedArray(values),width:values.length/4,height:1,colorSpace:'srgb'}) as ImageData;
describe('world-space actor lighting',()=>{
  it('covers every campaign world and battle floor',()=>{
    for(const map of [...Object.values(CHAPTER_ONE_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_ONE_BATTLES),...Object.values(CHAPTER_TWO_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_TWO_BATTLES),...Object.values(CHAPTER_THREE_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_THREE_BATTLES),...Object.values(CHAPTER_FOUR_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_FOUR_BATTLES),...Object.values(CHAPTER_FIVE_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_FIVE_BATTLES),...Object.values(CHAPTER_SIX_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_SIX_BATTLES),...Object.values(CHAPTER_SEVEN_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_SEVEN_BATTLES)]){
      const rig=sceneLight(String(properties(map).sceneArt),visibleSceneArt(map,{flags:{}})??[])!;
      expect(rig.ambient).toHaveLength(3);expect(rig.lamps.length).toBeGreaterThan(0);
      for(const light of rig.lamps){expect(light.radius).toBeGreaterThan(0);expect(light.height).toBeGreaterThan(58);}
    }
    expect(sceneLight('unregistered-scene',[])).toBeUndefined();
  });
  it('keeps ferry illumination and its spill in the same story visibility layer',()=>{
    const map=CHAPTER_FOUR_MAPS.breakwater.tiles!;
    for(const opened of [false,true]){
      const pieces=visibleSceneArt(map,{flags:{harborOpened:opened}})!;
      const rig=sceneLight('breakwater',pieces)!;
      const moored=opened?'harbor-ferry-in':'harbor-ferry-out',gone=opened?'harbor-ferry-out':'harbor-ferry-in';
      expect(pieces.some(p=>p.url.endsWith(`/${moored}.svg`))).toBe(true);
      expect(pieces.some(p=>p.url.endsWith(`/${gone}.svg`))).toBe(false);
      expect(rig.lamps.filter(l=>l.x===1306&&l.y===402)).toHaveLength(1);
      expect(rig.lamps.some(l=>l.x===172&&l.y===942)).toBe(false);
      const ferry=pieces.find(p=>p.url.endsWith(`/${moored}.svg`))!;
      expect(pieces.some(p=>p.layerId===ferry.layerId&&p.url.includes('/light-'))).toBe(true);
    }
  });
  it('keeps Chapter Five cinematic pieces live and removes disconnected anchor light',()=>{
    const airfield=CHAPTER_FIVE_MAPS.airfield.tiles!,launch=visibleSceneArt(airfield,{flags:{}})!.find(p=>p.key==='scene-five-survey-ship')!;
    expect(properties(airfield.layers.find(l=>l.id===launch.layerId)!).live).toBe(true);
    const shelter=visibleSceneArt(CHAPTER_FIVE_MAPS.dawnwatch.tiles!,{flags:{}})!;
    expect(shelter.find(p=>p.key==='scene-five-shelter-bar')!.depth).toBeGreaterThan(shelter.find(p=>p.key==='scene-five-shelter-front')!.depth);
    const deck=CHAPTER_FIVE_MAPS.flagship.tiles!;
    for(const piece of visibleSceneArt(deck,{flags:{}})!.filter(p=>p.key.startsWith('scene-five-flagship-')&&!p.key.endsWith('-launch')))
      expect(properties(deck.layers.find(l=>l.id===piece.layerId)!).live).toBe(true);
    for(const [id,flag,x,y]of [['anchorforge','hammerplainFreed',782,500],['signalwall','dawnwatchFreed',782,510],['mirrorward','windmereFreed',813,510]]as const){
      const map=CHAPTER_FIVE_MAPS[id].tiles!;
      for(const freed of [false,true]){
        const rig=sceneLight(id,visibleSceneArt(map,{flags:{[flag]:freed}})!)!;
        expect(rig.lamps.some(l=>l.x===x&&l.y===y)).toBe(!freed);
      }
    }
    expect(sceneLight('flagship-battle',[])?.lamps.length).toBeGreaterThan(0);
  });
  it('keeps Chapter Six moving floor pieces live and released seal light in its own flag layer',()=>{
    for(const [id,key]of [['outermooring','mooring-city-life'],['canopy','canopy-launch']]as const){
      const map=CHAPTER_SIX_MAPS[id].tiles!,piece=visibleSceneArt(map,{flags:{}})!.find(p=>p.key==='scene-six-'+key)!;
      expect(properties(map.layers.find(l=>l.id===piece.layerId)!).live).toBe(true);
    }
    const map=CHAPTER_SIX_MAPS.observatory.tiles!;
    for(const released of [false,true]){
      const pieces=visibleSceneArt(map,{flags:{desertSealBroken:released}})!,rig=sceneLight('observatory',pieces)!;
      expect(rig.lamps.some(l=>l.x===768&&l.y===510)).toBe(released);
      const seal=pieces.find(p=>p.key==='scene-six-observatory-released');
      expect(Boolean(seal)).toBe(released);
      if(seal)expect(pieces.some(p=>p.layerId===seal.layerId&&p.url.includes('/light-'))).toBe(true);
    }
    for(const id of ['rainhouse','lastpalace','crown'])expect(sceneLight(id,[])!.shadowOpacity).toBe(.035);
    for(const id of ['lastmorning','laststation']as const)expect(sceneLight(id,visibleSceneArt(CHAPTER_SIX_MAPS[id].tiles!,{flags:{}})!)!.lamps.length).toBeGreaterThan(1);
  });
  it('registers the conduit windows, crystal and feed console at their real anchors',()=>{
    const gallery=sceneLight('relayhall',visibleSceneArt(CHAPTER_THREE_MAPS.relayhall.tiles!,{flags:{}})??[])!;
    expect(gallery.lamps.filter(l=>l.beam)).toHaveLength(0);
    for(const id of ['relayhall','conduit','battle-palace-stores','battle-works-warden','conduit-regulator']){
      const indoor=sceneLight(id,[])!;expect(Math.min(...indoor.ambient)).toBeGreaterThanOrEqual(.85);
      expect(indoor.shadowOpacity).toBe(.035);
    }
    expect(castShadows(gallery,840,323).reduce((a,s)=>a+s.alpha,0)).toBeLessThanOrEqual(.035001);
    const exterior=sceneLight('northglass',visibleSceneArt(CHAPTER_THREE_MAPS.northglass.tiles!,{flags:{}})??[])!;
    expect(exterior.lamps.some(l=>l.beam)).toBe(true);expect(exterior.shadowOpacity).toBeUndefined();
    for(const map of [CHAPTER_THREE_MAPS.relayhall,CHAPTER_THREE_MAPS.conduit]){
      const pieces=visibleSceneArt(map.tiles!,{flags:{}})!;
      expect(pieces.some(p=>p.url.endsWith('/conduit-work-light.svg'))).toBe(true);
      expect(pieces.some(p=>p.url.endsWith('/lamp.svg'))).toBe(false);
    }
    const chamber=sceneLight('conduit',visibleSceneArt(CHAPTER_THREE_MAPS.conduit.tiles!,{flags:{}})??[])!;
    expect(chamber.lamps.some(l=>l.x===780&&l.y===444&&l.height===170)).toBe(true);
    expect(chamber.lamps.some(l=>l.x===1128&&l.y===450&&l.height===70)).toBe(true);
    expect(sceneLight('conduit-regulator',[])!.lamps).toHaveLength(3);
  });
  it('shares ward window/stove sources and removes the Cinderbank collector glow at victory',()=>{
    const ward=CHAPTER_TWO_MAPS.infirmary.tiles!,village=CHAPTER_TWO_MAPS.cinderbank.tiles!;
    const hospital=sceneLight('infirmary',visibleSceneArt(ward,{flags:{}})??[])!;
    expect(hospital.lamps.filter(l=>l.beam)).toHaveLength(10);
    expect(hospital.lamps.some(l=>l.x===946&&l.y===535)).toBe(true);
    const rig=(won:boolean)=>sceneLight('cinderbank',visibleSceneArt(village,{flags:{coastCollectorWon:won}})??[])!;
    expect(rig(false).lamps.some(l=>l.x===924&&l.y===423)).toBe(true);
    expect(rig(true).lamps.some(l=>l.x===924&&l.y===423)).toBe(false);
    expect(rig(true).lamps.some(l=>l.beam)).toBe(true);
  });
  it('removes the collector light with its working casing and retains the village windows',()=>{
    const map=CHAPTER_ONE_MAPS.rillbridge.tiles!;
    const rig=(released:boolean)=>sceneLight('rillbridge',visibleSceneArt(map,{flags:{villageFreed:released}})??[])!;
    expect(rig(false).lamps.some(l=>l.x===1404&&l.y===399)).toBe(true);
    expect(rig(true).lamps.some(l=>l.x===1404&&l.y===399)).toBe(false);
    expect(rig(true).lamps.some(l=>l.beam)).toBe(true);
  });
  it('casts window shadows inside the painted beams, with no light behind the house',()=>{
    const windows=stationLight([{x:120,y:48,url:'/station-house.svg'}]);
    expect(windows.lamps).toHaveLength(3);
    expect(castShadows(windows,204,283)[0]?.light.beam).toBeDefined();
    expect(castShadows(windows,204,283)[0]!.dy).toBeGreaterThan(0);
    expect(castShadows(windows,204,240)[0]).toBeUndefined();
    expect(castShadows(windows,260,283)[0]).toBeUndefined();
  });
  it('fills the entrance and arrest staging with festival warmth with restrained overlapping shadows',()=>{
    const festival=stationLight([{x:456,y:192,url:'/bunting.svg'}]);
    for(const [x,y] of [[516,403],[492,307],[636,331],[780,283]]){
      expect(festival.lamps.reduce((sum,l)=>sum+lampStrength(l,x,y),0)).toBeGreaterThan(.2);
      expect(castShadows(festival,x,y).length).toBeLessThanOrEqual(3);
    }
  });
  it('retains several sources while bounding count and cumulative darkness',()=>{
    const crowded={...rig,lamps:Array.from({length:8},(_,i)=>({...lamp,x:60+i*12}))};
    const shadows=castShadows(crowded,100,140);
    expect(shadows).toHaveLength(3);
    expect(shadows.reduce((sum,s)=>sum+s.alpha,0)).toBeLessThanOrEqual(.450001);
    expect(new Set(shadows.map(s=>s.dx)).size).toBe(3);
  });
  it('preserves native dimensions, exact alpha and the source when shading',()=>{
    const source=pixels([150,100,80,255,80,90,100,117,0,0,0,0]),before=source.data.slice(),output=pixels(Array(12).fill(0));
    lightPixels(source,output,rig,150,130,1,60);
    expect([...output.data].filter((_,i)=>i%4===3)).toEqual([255,117,0]);
    expect(source.data).toEqual(before);expect(output.data.length).toBe(source.data.length);
    expect([...output.data.slice(8)]).toEqual([0,0,0,0]);
  });
  it('warms and brightens a nearby actor, returns to cool ambient beyond the radius',()=>{
    const source=pixels([140,140,140,255]),near=pixels([0,0,0,0]),far=pixels([0,0,0,0]);
    lightPixels(source,near,rig,115,115,0,60);lightPixels(source,far,rig,600,600,0,60);
    expect([...far.data]).toEqual([87,98,123,255]);
    expect(near.data[0]).toBeGreaterThan(far.data[0]+20);
    expect(near.data[0]/near.data[2]).toBeGreaterThan(far.data[0]/far.data[2]);
    expect(lampStrength(lamp,600,600)).toBe(0);
  });
  it('casts away from the lamp on both sides, stays bounded and fades out',()=>{
    expect(castShadows(rig,60,140)[0]!.dx).toBeLessThan(0);
    expect(castShadows(rig,140,140)[0]!.dx).toBeGreaterThan(0);
    expect(castShadows(rig,100,170)[0]!.dy).toBeGreaterThan(0);
    expect(castShadows(rig,600,600)[0]).toBeUndefined();
    const low={...rig,lamps:[{...lamp,height:40}]};
    expect(Math.abs(castShadows(low,140,140)[0]!.dx)).toBeLessThanOrEqual(105);
  });
});

it('turns broad highlight planes toward the light without changing the silhouette',()=>{
  const data=new Uint8ClampedArray(20*20*4);for(let i=0;i<data.length;i+=4)data.set([140,110,80,255],i);
  const source={data,width:20,height:20,colorSpace:'srgb'} as ImageData;
  const shade=(x:number)=>{const output={...source,data:new Uint8ClampedArray(data.length)};lightPixels(source,output,{ambient:NIGHT_AMBIENT,lamps:[{x,y:200,height:108,radius:300,strength:2}]},100,130,10,20);return output.data;};
  const left=shade(20),right=shade(180),a=(10*20+2)*4,b=(10*20+17)*4;
  expect(left[a]).toBeGreaterThan(left[b]+10);expect(right[b]).toBeGreaterThan(right[a]+10);
  const flipped={...source,data:new Uint8ClampedArray(data.length)};
  lightPixels(source,flipped,{ambient:NIGHT_AMBIENT,lamps:[{x:20,y:200,height:108,radius:300,strength:2}]},100,130,10,20,-1,1);
  // Mirroring the source must also mirror its surface directions, rather than
  // putting the brightest facet on the side away from the real light.
  expect(flipped.data[b]).toBeGreaterThan(flipped.data[a]+10);
  for(let i=3;i<data.length;i+=4){expect(left[i]).toBe(255);expect(right[i]).toBe(255);}
});

it('matches exhaustive lighting at radius/beam edges, including rotated and mirrored frames',()=>{
  // Preserve the original exhaustive shader as a pixel oracle for the fast
  // frame rejection path. It deliberately visits every source for every pixel.
  const w=18,h=22,data=new Uint8ClampedArray(w*h*4);
  for(let i=0;i<w*h;i++)data.set([110+i%50,75+i%25,80,i%7?255:0],i*4);
  const source={data,width:w,height:h,colorSpace:'srgb'} as ImageData,planes=actorPlanes(source);
  const lights:WorldLight={ambient:NIGHT_AMBIENT,lamps:[...[-100,18,45,100,900].flatMap(x=>[32,65,140].map(y=>({x,y,height:90,radius:125,strength:1.2}))),{x:35,y:60,height:80,radius:160,strength:.8,fill:.2,beam:{reach:70,width:8,spread:.38}}]};
  for(const [x,y,sx,sy,r]of [[28,90,1,1,0],[28,90,-1,1,0],[70,61,1.7,-1,.7],[31,130,-1.5,1.4,-.8],[33,59,1,1,0],[140,90,1,1,2.3],[600,600,1.2,-1,.5]]){
    const expected=new Uint8ClampedArray(data.length),actual={...source,data:new Uint8ClampedArray(data.length)},cos=Math.cos(r),sin=Math.sin(r);
    for(let i=0;i<data.length;i+=4){
      expected[i+3]=data[i+3];if(!data[i+3])continue;
      const dx=(i/4%w-9)*sx,dy=(Math.floor(i/4/w)-19)*sy,wx=x+dx*cos-dy*sin,height=Math.max(0,-dx*sin-dy*cos),at=i/4*3;
      const nx=planes[at]/100,ny=planes[at+1]/100,nz=planes[at+2]/100,normalX=nx*Math.sign(sx)*cos+ny*Math.sign(sy)*sin,normalY=ny*Math.sign(sy)*cos-nx*Math.sign(sx)*sin;
      let power=0,red=0,green=0,blue=0;
      for(const lamp of lights.lamps){
        const lx=lamp.x-wx,ly=lamp.height-height,lz=(lamp.y-y)*1.35,length=Math.max(1,Math.hypot(lx,ly,lz)),dot=(normalX*lx+normalY*ly+nz*lz)/length,p=lampStrength(lamp,wx,y,height);
        const band=dot>.55?1.08:dot>.05?.72:.30,fill=lamp.fill??0,response=p*(fill+(1-fill)*band),color=lamp.color??[1.12,.78,.38];
        power+=p;red+=response*color[0];green+=response*color[1];blue+=response*color[2];
      }
      const f=power?Math.min(.65,power)/power:0;
      expected[i]=data[i]*(lights.ambient[0]+f*red);expected[i+1]=data[i+1]*(lights.ambient[1]+f*green);expected[i+2]=data[i+2]*(lights.ambient[2]+f*blue);
    }
    lightPixels(source,actual,lights,x,y,9,19,sx,sy,r);
    expect(actual.data).toEqual(expected);
  }
});

it('projects a rounded actor with ground width under lateral lights, smoothly across the side-on angle',()=>{
  for(const sign of [-1,1]){
    const matrices=[-1,0,1].map(dy=>shadowProjection(sign*80,dy));
    for(const [a,b,c,d]of matrices){
      // A 20px torso still covers nine ground-depth pixels under side lighting.
      expect(Math.abs(b)*20).toBeGreaterThan(8.9);
      expect(Math.abs(a*d-b*c)*20*58).toBeGreaterThan(700);
      expect(c*-58).toBe(sign*80);
    }
    expect(Math.abs(matrices[0][1]-matrices[2][1])).toBeLessThan(.001);
  }
  expect(shadowProjection(0,0).every(Number.isFinite)).toBe(true);
});
