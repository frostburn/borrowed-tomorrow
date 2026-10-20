import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';
import { CHAPTER_ONE_MAPS, CHAPTER_ONE_BATTLES } from '../src/content/chapter-one/maps';
import { CHAPTER_TWO_MAPS, CHAPTER_TWO_BATTLES } from '../src/content/chapter-two/maps';
import { arrival, MAPS, restorePoint, stage, walkable, worldPath } from '../src/content/maps';
import { gridPoint, layerVisible, mapPoints, tilePages, TILESET, tileWalkable } from '../src/content/tilemaps';
import { cells, toPixel } from '../src/rules/hex';
import { decodeSave, newGame } from '../src/rules/state';
import { coastCheckpoint, checkpoint } from './support/progress';

const worlds={...CHAPTER_ONE_MAPS,...CHAPTER_TWO_MAPS},battles={...CHAPTER_ONE_BATTLES,...CHAPTER_TWO_BATTLES};

it('converted chapters use complete native layers and bounded image pages',()=>{
  expect(readdirSync('public/art/chapter-one').filter(p=>/\.(png|webp)$/.test(p)).sort()).toEqual(TILESET.pages.map(p=>p.url.split('/').at(-1)!).sort());
  let next=1;
  for(const page of TILESET.pages){
    const image=readFileSync(`public/${page.url}`);
    expect(image.length).toBeLessThanOrEqual(131072);
    let dimensions:number[];
    if(page.url.endsWith('.png')){
      expect(image.subarray(1,4).toString('ascii')).toBe('PNG');dimensions=[image.readUInt32BE(16),image.readUInt32BE(20)];
    }else{
      expect(image.toString('ascii',0,4)).toBe('RIFF');expect(image.toString('ascii',8,12)).toBe('WEBP');
      expect(image.readUInt32LE(4)+8).toBe(image.length);
      const bits=image.readUInt32LE(21);expect(image.toString('ascii',12,16)).toBe('VP8L');
      dimensions=[1+(bits&0x3fff),1+((bits>>>14)&0x3fff)];
    }
    expect(dimensions).toEqual([page.imagewidth,page.imageheight]);
    expect(Math.max(page.imagewidth,page.imageheight)).toBeLessThanOrEqual(192);
    expect(page.firstgid).toBe(next);next+=page.tilecount;
    const source=JSON.parse(readFileSync(`assets/tiles/pages/${page.name}.json`,'utf8'));
    expect(source.tiles.map((t:{id:number})=>({...t,id:t.id+page.firstgid-1}))).toEqual(TILESET.tiles.slice(page.firstgid-1,next-1));
  }
  expect(next-1).toBe(TILESET.tilecount);
  for(const data of [...Object.values(worlds).map(m=>m.tiles!),...Object.values(battles)]){
    expect([data.tilewidth,data.tileheight]).toEqual([24,24]);expect(data.tilesets).toEqual(TILESET.pages.map(({firstgid,source})=>({firstgid,source})));
    expect(data.layers.some(l=>l.type==='imagelayer')).toBe(false);
    for(const l of data.layers.filter(l=>l.type==='tilelayer')){
      expect(l.data).toHaveLength(data.width*data.height);
      expect(l.data!.every(id=>Number.isInteger(id)&&id>=0&&id<=TILESET.tilecount),l.name).toBe(true);
    }
  }
});

it('all map-owned arrivals and scene casts stand on connected floors',()=>{
  for(const map of Object.values(worlds)){
    const points=mapPoints(map.tiles!,'Arrivals');const start=gridPoint(points[0]);
    for(const point of points){
      const p=arrival(map.id,point.name);expect(walkable(map,p.x,p.y),`${map.id}:${point.name}`).toBe(true);
      expect(p.x===start.x&&p.y===start.y||worldPath(map,start,p).length>0).toBe(true);
    }
    for(const group of map.tiles!.layers.filter(l=>l.name.startsWith('Scene:'))){
      for(const actor of stage(map.id,group.name.slice(6)))expect(walkable(map,actor.at.x,actor.at.y),`${group.name}:${actor.id}`).toBe(true);
    }
  }
});

it('bridge floors override river tiles while the banks and pass drop stay blocked',()=>{
  const village=MAPS.rillbridge,pass=MAPS.tunnel;
  expect(walkable(village,23,10)).toBe(false);
  expect(walkable(village,23,18)).toBe(true);
  expect(walkable(village,23,17)).toBe(false);
  expect(walkable(village,23,19)).toBe(false);
  expect(worldPath(village,{x:15,y:18},{x:58,y:18}).length).toBeGreaterThan(40);
  expect(walkable(pass,38,14)).toBe(true);expect(walkable(pass,39,14)).toBe(false);
  expect(walkable(pass,12,18)).toBe(false);
});

it('through tracks reach both map edges and remain on a supported railway shelf',()=>{
  const rail=TILESET.tiles.find(t=>t.type==='rail-h')!.id+1;
  for(const [id,rows] of [['station',[6,8]],['yard',[8,11]],['rillbridge',[14]],['tunnel',[10,12]],['coast',[13,31]],['cinderbank',[13,25]]] as const){
    const map=MAPS[id].tiles!,fittings=map.layers.find(l=>l.name==='Railway fittings')!;
    for(const row of rows)for(let x=0;x<map.width;x++){
      expect(fittings.data![row*map.width+x],`${id}: track ${x},${row}`).toBe(rail);
      const under=map.layers.slice(0,map.layers.indexOf(fittings)).some(l=>{
        const gid=l.data?.[row*map.width+x];return gid&&!/^(void|water-)/.test(TILESET.tiles[gid-1].type);
      });
      expect(under,`${id}: support ${x},${row}`).toBe(true);
    }
  }
});

it('festival and collector scenery follow the actual campaign flags',()=>{
  const festival=MAPS.station.tiles!.layers.find(l=>l.name==='Festival lanterns')!,cap=MAPS.station.tiles!.layers.find(l=>l.name==='After the arrest')!;
  expect(layerVisible(festival,newGame())).toBe(true);expect(layerVisible(cap,newGame())).toBe(false);
  expect(layerVisible(festival,checkpoint('raidSeen'))).toBe(false);expect(layerVisible(cap,checkpoint('raidSeen'))).toBe(true);
  const village=MAPS.rillbridge.tiles!,before=checkpoint('collectorDefeated'),after=checkpoint('villageFreed');
  for(const name of ['Collector working','Suspended drops and threads']){
    const layer=village.layers.find(l=>l.name===name)!;expect(layerVisible(layer,before)).toBe(true);expect(layerVisible(layer,after)).toBe(false);
  }
  expect(layerVisible(village.layers.find(l=>l.name==='Collector broken')!,after)).toBe(true);
  // The river remains water on both sides of the rescue; the bridge is the route.
  expect(tileWalkable(village,25,15,before)).toBe(false);expect(tileWalkable(village,25,15,after)).toBe(false);
});

it('each converted arena keeps every tactical cell on open ground',()=>{
  for(const [id,map] of Object.entries(battles))for(const h of cells()){
    const p=toPixel(h);expect(tileWalkable(map,Math.floor(p.x/24),Math.floor(p.y/24)),`${id}: ${h.q},${h.r}`).toBe(true);
  }
});

it('Chapter Two props block their feet, story layers change, and the painted coach door has a reachable approach',()=>{
  const coast=MAPS.coast,cinder=MAPS.cinderbank,before=coastCheckpoint('kitJoined'),after=coastCheckpoint('evacuationReady');
  expect(walkable(coast,24,13,before)).toBe(false);expect(walkable(coast,24,14,before)).toBe(true);
  expect(walkable(MAPS.infirmary,15,22,before)).toBe(false);expect(walkable(MAPS.infirmary,20,22,before)).toBe(true);
  expect(walkable(cinder,45,16,before)).toBe(false);expect(walkable(cinder,41,19,before)).toBe(true);
  expect(walkable(cinder,0,0,before)).toBe(false);expect(walkable(coast,0,20,before)).toBe(false);
  const door=coast.objects.find(o=>o.id==='prison-coach')!;
  expect(door.hitArea).toEqual({x:24,y:8,width:4,height:7});expect(worldPath(coast,{x:24,y:26},door,before).length).toBeGreaterThan(0);
  for(const [map,name,flag] of [[coast,'Loading barrier','trainRaidWon'],[cinder,'Collector working','evacuationReady'],[cinder,'Suspended drops and threads','evacuationReady']] as const){
    const layer=map.tiles!.layers.find(l=>l.name===name)!;
    expect(layerVisible(layer,{flags:{}})).toBe(true);expect(layerVisible(layer,{flags:{[flag]:true}})).toBe(false);
  }
  expect(layerVisible(cinder.tiles!.layers.find(l=>l.name==='Collector broken')!,after)).toBe(true);
  // A missing ward/crane page cannot prevent Chapter One from loading.
  const first=new Set(Object.values(CHAPTER_ONE_MAPS).flatMap(m=>tilePages(m.tiles!).map(p=>p.name)));
  expect(tilePages(coast.tiles!).some(p=>!first.has(p.name))).toBe(true);
});

it('Chapter Two restores covered current-save cells without changing progress, equipment or resources',()=>{
  const s=coastCheckpoint('evacuationReady');
  for(const [id,point] of [['coast',{x:24,y:13}],['infirmary',{x:15,y:22}],['cinderbank',{x:45,y:16}],['cinderbank',{x:63,y:41}]] as const){
    s.location={map:id,...point};const restored=decodeSave(JSON.stringify(s)),map=MAPS[id];
    const p=restorePoint(map,restored.location,restored)!;
    expect(walkable(map,p.x,p.y,restored)).toBe(true);
    const start=arrival(id,id==='coast'?'start':id==='infirmary'?'from-coast':'from-ward');
    expect(worldPath(map,start,p,restored).length>0||p.x===start.x&&p.y===start.y).toBe(true);
    expect(restored).toEqual(s);
  }
});

it('current-format saves survive cropped floors and newly covered cells',()=>{
  const state=checkpoint('collectorDefeated'),map=MAPS.rillbridge;
  for(const point of [{x:0,y:40},{x:31,y:40},{x:65,y:40},{x:44,y:8}]){
    state.location={map:'rillbridge',...point};const decoded=decodeSave(JSON.stringify(state));
    const restored=restorePoint(map,decoded.location,decoded)!;
    expect(walkable(map,restored.x,restored.y,decoded)).toBe(true);
    expect(worldPath(map,arrival('rillbridge','from-yard'),restored,decoded).length).toBeGreaterThan(0);
    expect(decoded).toEqual(state);
  }
  expect(restorePoint(map,{x:31,y:40},state)).toEqual({x:31,y:27});
  expect(restorePoint(map,{x:15,y:18},state)).toEqual({x:15,y:18});
  // Every converted map supplies its own safe arrival; no old-art coordinates.
  for(const [id,point] of [['station',{x:10,y:10}],['yard',{x:25,y:7}],['tunnel',{x:40,y:14}]] as const){
    expect(walkable(MAPS[id],point.x,point.y)).toBe(false);
    const p=restorePoint(MAPS[id],point,state)!;expect(walkable(MAPS[id],p.x,p.y,state)).toBe(true);
  }
});
