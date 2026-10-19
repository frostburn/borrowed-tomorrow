import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { CHAPTER_ONE_MAPS, CHAPTER_ONE_BATTLES } from '../src/content/chapter-one/maps';
import { arrival, MAPS, stage, walkable, worldPath } from '../src/content/maps';
import { gridPoint, layerVisible, mapPoints, TILESET, tileWalkable } from '../src/content/tilemaps';
import { cells, toPixel } from '../src/rules/hex';
import { newGame } from '../src/rules/state';
import { checkpoint } from './support/progress';

it('Chapter One consists of complete native tile layers referencing one real atlas',()=>{
  const png=readFileSync('public/art/chapter-one-tiles.png');
  expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([TILESET.imagewidth,TILESET.imageheight]);
  for(const data of [...Object.values(CHAPTER_ONE_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_ONE_BATTLES)]){
    expect([data.tilewidth,data.tileheight]).toEqual([24,24]);expect(data.tilesets).toHaveLength(1);
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
