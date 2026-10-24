import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { artPath } from '../src/content/art-assets';
import { CHARACTERS, portraitAsset } from '../src/content/characters';
import { SAY } from '../src/content/dialogue';
import { ACTOR_DIRECTIONS, actorAsset, facingAsset, PLAYABLE_ACTORS } from '../src/content/actors';
import { COMPANION_IDS } from '../src/rules/party';
import { ATTACK_CONTACT_FRAME, ATTACK_WINDUP_FRAME, motionFrame, MOTION_PAGES, WALK_CYCLE_MS, WALK_FRAME_MS, WALK_FRAMES, walkingHero } from '../src/content/actor-motion';

const imageBytes=(name:string)=>readFileSync(new URL(`../public/${artPath(name)}`,import.meta.url));
const dimensions=(bytes:Buffer)=>bytes.toString('utf8',0,4)==='<svg'?[Number(bytes.toString().match(/width="(\d+)"/)![1]),Number(bytes.toString().match(/height="(\d+)"/)![1])]:[bytes.readUInt32BE(16),bytes.readUInt32BE(20)];

it('every named character has a distinct native sprite and portrait',()=>{
  const sprites:string[]=[],portraits:string[]=[];
  for(const character of Object.values(CHARACTERS))for(const [kind,size] of [['sprite',80],['portrait',128]] as const){
    const bytes=imageBytes(character[kind]);
    expect(dimensions(bytes),`${character.name} ${kind}`).toEqual([size,size]);
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
      const bytes=imageBytes(actorAsset(hero,direction));
      expect(dimensions(bytes)).toEqual([80,80]);
      return createHash('sha256').update(bytes).digest('hex');
    });
    expect(new Set(hashes).size).toBe(4);
    expect([facingAsset(hero,0,1),facingAsset(hero,-1,0),facingAsset(hero,1,0),facingAsset(hero,0,-1)]).toEqual(ACTOR_DIRECTIONS.map(direction=>actorAsset(hero,direction)));
  }
});

it('motion pages match each character frame layout within the image budget',()=>{
  expect(MOTION_PAGES).toHaveLength(20);
  for(const page of MOTION_PAGES){
    const bytes=imageBytes(page.asset);
    expect(dimensions(bytes)).toEqual([160,Math.ceil(page.frames/2)*80]);
    expect(bytes.length).toBeLessThanOrEqual(131072);
  }
});

it('the complete six-step walk wraps without entering attack poses',()=>{
  expect(Array.from({length:WALK_FRAMES},(_,i)=>motionFrame('walk',i*WALK_FRAME_MS+1))).toEqual([0,1,2,3,4,5]);
  expect(motionFrame('walk',WALK_CYCLE_MS-1)).toBe(5);
  expect(motionFrame('walk',WALK_CYCLE_MS)).toBe(0);
  expect(motionFrame('attack',139)).toBe(ATTACK_WINDUP_FRAME);
  expect(motionFrame('attack',140)).toBe(ATTACK_CONTACT_FRAME);
  expect(motionFrame('attack',280)).toBeUndefined();
  expect(walkingHero('celia')).toBe(true);
  expect([0,139,140,279,280].map(t=>motionFrame('attack',t,'celia'))).toEqual([6,6,7,7,undefined]);
});


it('Nell walks through six poses and plays three separate attack frames before restoring idle',()=>{
  expect(walkingHero('nell')).toBe(true);expect(walkingHero('orrin')).toBe(true);
  expect([0,80,160,480].map(t=>motionFrame('walk',t,'nell'))).toEqual([0,1,2,0]);
  expect([0,139,140,219,220,299,300,380].map(t=>motionFrame('attack',t,'nell'))).toEqual([6,6,7,7,8,8,undefined,undefined]);
});
