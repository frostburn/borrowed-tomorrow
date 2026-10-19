import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { CHARACTERS, portraitAsset } from '../src/content/characters';
import { SAY } from '../src/content/dialogue';
import { ACTOR_DIRECTIONS, actorAsset, facingAsset, PLAYABLE_ACTORS } from '../src/content/actors';
import { COMPANION_IDS } from '../src/rules/party';

it('every named character has a distinct native sprite and portrait',()=>{
  const sprites:string[]=[],portraits:string[]=[];
  for(const character of Object.values(CHARACTERS))for(const [kind,size] of [['sprite',80],['portrait',128]] as const){
    const bytes=readFileSync(new URL(`../public/art/${character[kind]}.png`,import.meta.url));
    expect([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],`${character.name} ${kind}`).toEqual([size,size]);
    (kind==='sprite'?sprites:portraits).push(createHash('sha256').update(bytes).digest('hex'));
  }
  expect(new Set(sprites).size).toBe(Object.keys(CHARACTERS).length);
  expect(new Set(portraits).size).toBe(Object.keys(CHARACTERS).length);
});

it('named dialogue automatically resolves the matching portrait, including legacy aliases',()=>{
  for(const character of Object.values(CHARACTERS))expect(SAY(character.name,'A line of dialogue.').portrait).toBe(character.portrait);
  expect(SAY('Stationmaster','A line.').portrait).toBe('portrait-master');
  expect(SAY('A voice','A line.').portrait).toBeUndefined();
  expect(portraitAsset('master')).toBe('portrait-master');expect(portraitAsset('clerk')).toBe('portrait-clerk');
  expect(SAY('The broken crystal','The light is still burning.').portrait).toBeUndefined();
});

it('every playable character has four distinct native directional actors',()=>{
  expect(PLAYABLE_ACTORS).toHaveLength(20);
  for(const hero of COMPANION_IDS){
    const hashes=ACTOR_DIRECTIONS.map(direction=>{
      const bytes=readFileSync(new URL(`../public/art/${actorAsset(hero,direction)}.png`,import.meta.url));
      expect([bytes.readUInt32BE(16),bytes.readUInt32BE(20)]).toEqual([80,80]);
      return createHash('sha256').update(bytes).digest('hex');
    });
    expect(new Set(hashes).size).toBe(4);
    expect([facingAsset(hero,0,1),facingAsset(hero,-1,0),facingAsset(hero,1,0),facingAsset(hero,0,-1)]).toEqual(ACTOR_DIRECTIONS.map(direction=>actorAsset(hero,direction)));
  }
});
