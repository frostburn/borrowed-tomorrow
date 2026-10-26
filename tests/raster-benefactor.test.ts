import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {RASTER_ACTORS,actorAtlasPages,rasterActorDimensions} from '../src/content/actor-art-skin';
import {benefactorDomainArt,sceneArt} from '../src/content/scene-art';
import {BATTLE_MAPS} from '../src/content/battle-maps';
import audit from '../assets/raster-benefactor/conversion.json';
import breathing from '../assets/raster-benefactor/breathing.json';

it('body breathing has five distinct native paintings and an explicit closed cycle',()=>{
  expect(breathing.frames).toHaveLength(5);
  expect(breathing.cycle).toEqual([0,1,2,3,4,3,2,1]);
  const hashes=breathing.frames.map(frame=>{
    const b=readFileSync(`assets/raster-benefactor/${frame.source}`);
    expect([b.readUInt32BE(16),b.readUInt32BE(20)]).toEqual([180,144]);
    expect(b[25]).toBe(3);expect(b.length).toBeLessThanOrEqual(131072);
    return createHash('sha256').update(b).digest('hex');
  });
  expect(new Set(hashes).size).toBe(5);
});

it('all three final forms have complete bounded pages for the original twelve poses',()=>{
  expect(actorAtlasPages('benefactor')).toHaveLength(9);
  for(const form of ['','-sun','-heart']){
    const asset=RASTER_ACTORS[`art/vector/benefactor/benefactor${form}-motion.svg`];
    expect([asset.width,asset.height]).toEqual([720,1728]);
    expect(asset.pages).toHaveLength(3);
    expect(asset.pages!.map(p=>[p.x,p.y,p.width,p.height])).toEqual([[0,0,720,576],[0,576,720,576],[0,1152,720,576]]);
    for(const p of asset.pages!)expect(rasterActorDimensions(`https://example.test/game/${p.url}`)).toEqual(p);
  }
});

it('the painted exports fit the ordinary guard and recorded exact native pixels',()=>{
  expect(audit.assets).toHaveLength(11);
  for(const asset of audit.assets){
    const b=readFileSync(`public/${asset.url}`);
    expect([b.readUInt32BE(16),b.readUInt32BE(20)]).toEqual(asset.native);
    expect(b[25]).toBe(3);expect(b.length).toBe(asset.bytes);expect(b.length).toBeLessThanOrEqual(131072);
    expect(createHash('sha256').update(b).digest('hex')).toBe(asset.sha256);
  }
});

it('all three campaign arenas and map previews share the same exact painted floor bounds',()=>{
  const painted=benefactorDomainArt('raster');
  expect(painted.map(p=>[p.x,p.y,p.width,p.height,p.layerId])).toEqual([[0,0,512,480,1],[512,0,512,480,1]]);
  for(const form of ['body','sun','heart']as const){
    const map=BATTLE_MAPS[`benefactor-${form}`];
    expect(sceneArt(map,'raster')).toEqual(painted);
    expect(sceneArt(map,'vector')!.every(p=>p.url.endsWith('.svg'))).toBe(true);
  }
});
