import { describe,it,expect } from 'vitest';
import { readFileSync,statSync } from 'node:fs';
import { CHAPTER_ONE_MAPS,CHAPTER_ONE_BATTLES } from '../src/content/chapter-one/maps';
import { CHAPTER_TWO_MAPS,CHAPTER_TWO_BATTLES } from '../src/content/chapter-two/maps';
import { CHAPTER_THREE_MAPS,CHAPTER_THREE_BATTLES } from '../src/content/chapter-three/maps';
import { CHAPTER_FOUR_MAPS,CHAPTER_FOUR_BATTLES } from '../src/content/chapter-four/maps';
import { sceneArt,visibleSceneArt,SCENE_ASSETS } from '../src/content/scene-art';
import { properties,tilePages } from '../src/content/tilemaps';

describe('traced SVG scenes',()=>{
 it('keeps the green conduit architecture separate from the royal marble originals',()=>{
  const pieces=Object.values(CHAPTER_THREE_MAPS).flatMap(m=>sceneArt(m.tiles!)??[]);
  for(const name of ['conduit-dome','conduit-factory-wing','conduit-medical-pavilion','conduit-controls','conduit-vessel']){
   expect(pieces.some(p=>p.key===`scenery-${name}`)).toBe(true);
  }
  expect(pieces.some(p=>p.url.includes('royal-palace'))).toBe(false);
  const dome=readFileSync('public/art/vector/scenery/conduit-dome.svg','utf8');
  expect(dome).toContain('#3f6159');expect(dome).toContain('#bf995b');expect(dome).not.toContain('Royal white marble');
  for(const name of ['royal-palace-front','royal-palace-wing'])expect(readFileSync(`public/art/vector/scenery/${name}.svg`,'utf8')).toContain('#dfe6e0');
 });
 it('covers every painted story layer with self-contained, correctly sized vector sources',()=>{
  for(const map of [...Object.values(CHAPTER_ONE_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_ONE_BATTLES),...Object.values(CHAPTER_TWO_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_TWO_BATTLES),...Object.values(CHAPTER_THREE_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_THREE_BATTLES),...Object.values(CHAPTER_FOUR_MAPS).map(m=>m.tiles!),...Object.values(CHAPTER_FOUR_BATTLES)]){
   const pieces=sceneArt(map)!;expect(pieces.length).toBeGreaterThan(0);expect(tilePages(map)).toEqual([]);
   for(const layer of map.layers.filter(l=>l.data?.some(Boolean)))expect(pieces.some(p=>p.layerId===layer.id)).toBe(true);
   for(const p of pieces){
    const svg=readFileSync(`public/${p.url}`,'utf8');expect(svg).toContain(`width="${p.width}" height="${p.height}"`);
    expect(svg).not.toMatch(/<image\b|data:|<script\b|<foreignObject\b|(?:href|src)\s*=\s*["'](?!#)/i);
    expect(statSync(`public/${p.url}`).size).toBeLessThanOrEqual(131072);
    const sorted=properties(map.layers.find(l=>l.id===p.layerId)!).sort;
    expect(p.url.includes('/light-')?p.depth===-950:sorted?p.depth>=0:p.depth<0).toBe(true);
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
 });
});
