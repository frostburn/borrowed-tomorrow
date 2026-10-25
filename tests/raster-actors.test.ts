import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {RASTER_ACTORS,actorArtUrl,rasterActorDimensions} from '../src/content/actor-art-skin';
import {artPath} from '../src/content/art-assets';
import {PLAYABLE_ACTORS} from '../src/content/actors';
import {MOTION_PAGES} from '../src/content/actor-motion';
import {NPC_SPRITES,CHARACTERS} from '../src/content/characters';
import {CIVILIAN_SPRITES} from '../src/content/civilians';
import {ENEMY_VARIANT_ACTORS} from '../src/content/enemy-variants';
import {COMPANION_POSES,EMPEROR_WALK} from '../src/content/cinematic-art';
import report from '../assets/raster-actors/conversion.json';

it('covers the whole cast, every directional motion page and the cinematic poses',()=>{
  for(const id of [...PLAYABLE_ACTORS,...NPC_SPRITES,...CIVILIAN_SPRITES,...ENEMY_VARIANT_ACTORS,'master','clerk','hound','crow','guardian','inspector','herald','glasswing']){
    expect(artPath(id,'raster'),id).toMatch(/^art\/raster-actors\/.+\.png$/);
    expect(artPath(id,'vector'),id).toMatch(/^art\/vector\/.+\.svg$/);
  }
  for(const page of MOTION_PAGES){
    const native=RASTER_ACTORS[`art/vector/${page.asset}.svg`];
    expect([native.width,native.height]).toEqual([160,Math.ceil(page.frames/2)*80]);
  }
  for(const id of [...COMPANION_POSES,...EMPEROR_WALK,'emperor-reach','nell-ill','nell-faint','nell-bed','kit-carry','petra-carry','alban-command']){
    expect(actorArtUrl(`art/vector/${id}.svg`),id).toMatch(/\.png$/);
  }
  for(const c of Object.values(CHARACTERS))expect(artPath(c.portrait,'raster')).toBe(artPath(c.portrait,'vector'));
});

it('ships small indexed transparent PNGs with exact integer logical expansion and audited bytes',()=>{
  expect(report.assets.length).toBe(Object.keys(RASTER_ACTORS).length);
  for(const asset of report.assets){
    const vector=`art/vector/${asset.source}`,entry=RASTER_ACTORS[vector],bytes=readFileSync(`public/${entry.url}`);
    expect([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],entry.url).toEqual([entry.width/2,entry.height/2]);
    expect(bytes[25],entry.url).toBe(3); // indexed PNG, alpha through tRNS
    expect(bytes.includes(Buffer.from('tRNS')),entry.url).toBe(true);
    expect(bytes.length,entry.url).toBeLessThanOrEqual(131072);
    expect(bytes.length).toBe(asset.bytes);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
    expect(rasterActorDimensions(`https://example.test/game/${entry.url}`)).toEqual(entry);
    expect(actorArtUrl(`/game/${vector}`)).toBe(`/game/${entry.url}`);
    expect(actorArtUrl(vector,'vector')).toBe(vector);
  }
});
