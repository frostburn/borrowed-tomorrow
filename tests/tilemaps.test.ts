import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { CHAPTER_ONE_MAPS, CHAPTER_ONE_BATTLES } from '../src/content/chapter-one/maps';
import { arrival, MAPS, restorePoint, stage, walkable, worldPath } from '../src/content/maps';
import { gridPoint, layerVisible, mapPoints, TILESET, tileWalkable } from '../src/content/tilemaps';
import { cells, toPixel } from '../src/rules/hex';
import { decodeSave, newGame } from '../src/rules/state';
import { checkpoint } from './support/progress';

it('Chapter One uses complete native layers and bounded image pages',()=>{
  let next=1;
  for(const page of TILESET.pages){
    const png=readFileSync(`public/${page.url}`);
    expect(png.length).toBeLessThanOrEqual(65536);
    expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([page.imagewidth,page.imageheight]);
    expect(Math.max(page.imagewidth,page.imageheight)).toBeLessThanOrEqual(192);
    expect(page.firstgid).toBe(next);next+=page.tilecount;
    const source=JSON.parse(readFileSync(`assets/tiles/pages/${page.name}.json`,'utf8'));
    expect(source.tiles.map((t:{id:number})=>({...t,id:t.id+page.firstgid-1}))).toEqual(TILESET.tiles.slice(page.firstgid-1,next-1));
  }
  expect(next-1).toBe(TILESET.tilecount);
  for(const data of [...Object.values(CHAPTER_ONE_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_ONE_BATTLES)]){
    expect([data.tilewidth,data.tileheight]).toEqual([24,24]);expect(data.tilesets).toEqual(TILESET.pages.map(({firstgid,source})=>({firstgid,source})));
    expect(data.layers.some(l=>l.type==='imagelayer')).toBe(false);
    for(const l of data.layers.filter(l=>l.type==='tilelayer')){
      expect(l.data).toHaveLength(data.width*data.height);
      expect(l.data!.every(id=>Number.isInteger(id)&&id>=0&&id<=TILESET.tilecount),l.name).toBe(true);
    }
  }
});

it('all map-owned arrivals and scene casts stand on connected floors',()=>{
  for(const map of Object.values(CHAPTER_ONE_MAPS)){
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
  expect(worldPath(village,{x:15,y:18},{x:58,y:18}).length).toBeGreaterThan(40);
  expect(walkable(pass,38,14)).toBe(true);expect(walkable(pass,39,14)).toBe(false);
  expect(walkable(pass,12,18)).toBe(false);
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
  // The release changes the water itself, rather than painting an unrelated overlay.
  expect(tileWalkable(village,25,15,before)).toBe(true);expect(tileWalkable(village,25,15,after)).toBe(false);
});

it('each Chapter One arena keeps every tactical cell on open ground',()=>{
  for(const [id,map] of Object.entries(CHAPTER_ONE_BATTLES))for(const h of cells()){
    const p=toPixel(h);expect(tileWalkable(map,Math.floor(p.x/24),Math.floor(p.y/24)),`${id}: ${h.q},${h.r}`).toBe(true);
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
  for(const [id,point] of [['station',{x:10,y:5}],['yard',{x:25,y:7}],['tunnel',{x:40,y:14}]] as const){
    expect(walkable(MAPS[id],point.x,point.y)).toBe(false);
    const p=restorePoint(MAPS[id],point,state)!;expect(walkable(MAPS[id],p.x,p.y,state)).toBe(true);
  }
});
