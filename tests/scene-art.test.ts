import { describe,it,expect } from 'vitest';
import { readFileSync,statSync } from 'node:fs';
import { CHAPTER_ONE_MAPS,CHAPTER_ONE_BATTLES } from '../src/content/chapter-one/maps';
import { CHAPTER_TWO_MAPS,CHAPTER_TWO_BATTLES } from '../src/content/chapter-two/maps';
import { CHAPTER_THREE_MAPS,CHAPTER_THREE_BATTLES } from '../src/content/chapter-three/maps';
import { CHAPTER_FOUR_MAPS,CHAPTER_FOUR_BATTLES } from '../src/content/chapter-four/maps';
import { CHAPTER_FIVE_MAPS,CHAPTER_FIVE_BATTLES } from '../src/content/chapter-five/maps';
import { CHAPTER_SIX_MAPS,CHAPTER_SIX_BATTLES } from '../src/content/chapter-six/maps';
import { sceneArt,visibleSceneArt,SCENE_ASSETS } from '../src/content/scene-art';
import { properties,tilePages,mapPoints } from '../src/content/tilemaps';
import {createBattle} from '../src/rules/combat';
import {occupiedHexes} from '../src/rules/footprint';
import {toPixel} from '../src/rules/hex';
import {wardUnit} from '../src/rules/ward';
import {chapterFiveFinaleStart} from '../src/dev/canonical-saves';

describe('traced SVG scenes',()=>{
 it('centres the ward floor inlays on the actual native engine base in exploration and battle',()=>{
  const model=readFileSync('public/art/vector/chapter-five/ward-engine-battle.svg','utf8');
  const [,width,height]=model.match(/width="([\d.]+)" height="([\d.]+)"/)!;
  const [,cx,cy]=model.match(/<ellipse\b[^>]*cx="([\d.]+)"[^>]*cy="([\d.]+)"/)!;
  const core=wardUnit(createBattle('wind-engine',chapterFiveFinaleStart()))!;
  const anchor={x:Math.round(toPixel(core.hex).x),y:Math.round(Math.max(...occupiedHexes(core).map(h=>toPixel(h).y))+24)};
  const world=CHAPTER_FIVE_MAPS.mirrorward.tiles!,piece=sceneArt(world)!.find(p=>p.key==='scene-five-windmere-engine')!;
  for(const [tiles,expected]of [[CHAPTER_FIVE_BATTLES['wind-engine'],[anchor.x-Number(width)/2+Number(cx),anchor.y-Number(height)+Number(cy)]],[world,[piece.x+Number(cx),piece.y+Number(cy)]]]as const){
   const floor=sceneArt(tiles)!.find(p=>p.url.endsWith('-floor.svg'))!,svg=readFileSync(`public/${floor.url}`,'utf8');
   const [,x,y]=svg.match(/id="ward-floor-inlays" transform="translate\(([-\d.]+) ([-\d.]+)\)"/)!;
   expect([Number(x),Number(y)]).toEqual(expected);
  }
 });
 it('shows one full-sized furnace carrier on the gantry, with a clear approach and no duplicate scene miniature',()=>{
  const map=CHAPTER_FIVE_MAPS.anchorforge,body=visibleSceneArt(map.tiles!,{flags:{}})!.find(p=>p.key==='scene-five-gantry-carrier')!;
  expect(body.width).toBeGreaterThan(220);expect(body.height).toBeGreaterThan(168);
  const control=map.objects.find(o=>o.id==='forge-carrier')!;
  expect(control.sprite).toBeUndefined();expect((control.y+.5)*24).toBeGreaterThan(body.y+body.height);
  expect(mapPoints(map.tiles!,'Scene:five-gantry').some(o=>o.name==='furnaceCarrier')).toBe(false);
  expect(visibleSceneArt(map.tiles!,{flags:{furnaceWon:true}})!.some(p=>p.key===body.key)).toBe(false);
 });
 it('keeps the green conduit architecture separate from the royal marble originals',()=>{
  const pieces=Object.values(CHAPTER_THREE_MAPS).flatMap(m=>sceneArt(m.tiles!)??[]);
  for(const name of ['conduit-dome','conduit-factory-wing','conduit-medical-pavilion','conduit-controls','conduit-vessel']){
   expect(pieces.some(p=>p.url.endsWith(`/${name}.svg`))).toBe(true);
  }
  expect(pieces.some(p=>p.url.includes('royal-palace'))).toBe(false);
  const dome=readFileSync('public/art/vector/scenery/conduit-dome.svg','utf8');
  expect(dome).toContain('#3f6159');expect(dome).toContain('#bf995b');expect(dome).not.toContain('Royal white marble');
  for(const name of ['royal-palace-front','royal-palace-wing'])expect(readFileSync(`public/art/vector/scenery/${name}.svg`,'utf8')).toContain('#dfe6e0');
 });
 it('covers every painted story layer with self-contained, correctly sized vector sources',()=>{
  for(const map of [...Object.values(CHAPTER_ONE_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_ONE_BATTLES),...Object.values(CHAPTER_TWO_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_TWO_BATTLES),...Object.values(CHAPTER_THREE_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_THREE_BATTLES),...Object.values(CHAPTER_FOUR_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_FOUR_BATTLES),...Object.values(CHAPTER_FIVE_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_FIVE_BATTLES),...Object.values(CHAPTER_SIX_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_SIX_BATTLES)]){
   const pieces=sceneArt(map)!;expect(pieces.length).toBeGreaterThan(0);expect(tilePages(map)).toEqual([]);
   for(const layer of map.layers.filter(l=>l.data?.some(Boolean)))expect(pieces.some(p=>p.layerId===layer.id)).toBe(true);
   for(const p of pieces){
    const svg=readFileSync(`public/${p.url}`,'utf8');expect(svg).toContain(`width="${p.width}" height="${p.height}"`);
    expect(svg).not.toMatch(/<image\b|data:|<script\b|<foreignObject\b|(?:href|src)\s*=\s*["'](?!#)/i);
    expect(statSync(`public/${p.url}`).size).toBeLessThanOrEqual(131072);
    const sorted=properties(map.layers.find(l=>l.id===p.layerId)!).sort;
    expect(p.url.includes('/light-')?p.depth===-950:sorted?p.depth>=0:p.depth<0,`${p.key}: layer ${p.layerId}`).toBe(true);
   }
  }
  expect(new Set(SCENE_ASSETS.map(a=>a.key)).size).toBe(SCENE_ASSETS.length);
 });
 it('uses the same story visibility and layer isolation for whole props and floor planes',()=>{
  const station=CHAPTER_ONE_MAPS.station.tiles!,village=CHAPTER_ONE_MAPS.rillbridge.tiles!;
  expect(visibleSceneArt(station,{flags:{}})!.some(p=>p.key==='scenery-prison-coach')).toBe(true);
  expect(visibleSceneArt(station,{flags:{raidSeen:true}})!.some(p=>p.key==='scenery-prison-coach')).toBe(false);
  for(const raidSeen of [false,true])expect(visibleSceneArt(station,{flags:{raidSeen}})!.some(p=>p.url.endsWith('/bunting.svg'))).toBe(true);
  for(const released of [false,true]){
   const pieces=visibleSceneArt(village,{flags:{villageFreed:released}})!;
   expect(pieces.some(p=>p.url.endsWith('/collector-machine.svg'))).toBe(!released);
   expect(pieces.some(p=>p.url.endsWith('/collector-broken.svg'))).toBe(released);
  }
  const bridge=sceneArt(village)!.find(p=>p.url.endsWith('/footbridge.svg'))!,rail=sceneArt(village)!.find(p=>p.url.endsWith('/footbridge-front.svg'))!;
  expect(bridge.depth).toBeLessThan(0);expect(rail.depth).toBeGreaterThan(0);
  expect(visibleSceneArt(village,{flags:{}},new Set([bridge.layerId]))!.some(p=>p.key===bridge.key)).toBe(false);
  for(const map of [CHAPTER_THREE_MAPS.relayhall.tiles!,CHAPTER_THREE_MAPS.conduit.tiles!]){
   const light=map.layers.find(l=>properties(l).hiddenFlag==='extractionStopped')!;
   expect(visibleSceneArt(map,{flags:{}})!.some(p=>p.layerId===light.id)).toBe(true);
   expect(visibleSceneArt(map,{flags:{extractionStopped:true}})!.some(p=>p.layerId===light.id)).toBe(false);
  }
  const feeds=CHAPTER_THREE_MAPS.conduit.tiles!.layers.find(l=>l.id===17)!;
  expect(properties(feeds).live).toBe(true);
 });
});
