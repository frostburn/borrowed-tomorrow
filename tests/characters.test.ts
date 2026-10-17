import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { CHARACTERS, portraitAsset } from '../src/content/characters';
import { SAY } from '../src/content/disk-a/story';
import { MAPS, walkable, worldPath } from '../src/content/maps';
import { createBattle } from '../src/rules/combat';
import { decodeSave } from '../src/rules/state';
import departure from './fixtures/disk-b-v2.json';

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
  expect(SAY('A small voice','A line.','mira').portrait).toBe('portrait-mira');
  expect(portraitAsset('master')).toBe('portrait-master');expect(portraitAsset('clerk')).toBe('portrait-clerk');
  expect(SAY('The receiving list','Fourteen names.').portrait).toBeUndefined();
});

it('the named residents use their own actors in every location',()=>{
  const actor=(map:keyof typeof MAPS,id:string)=>MAPS[map].objects.find(o=>o.id===id)!.sprite;
  expect(actor('rillbridge','b-bram')).toBe('bram');expect(actor('rillbridge','b-baker')).toBe('tilda');
  expect(actor('rillbridge','b-schoolhouse')).toBe('elspeth');expect(actor('station','c-tilda')).toBe('tilda');
  expect(actor('station','b-elspeth-larkspur')).toBe('elspeth');
  expect(actor('cinderbank','c-dena')).toBe('dena');expect(actor('infirmary','c-celia')).toBe('celia');expect(actor('infirmary','c-patients')).toBe('ivo');
  const state=decodeSave(JSON.stringify(departure)),object=MAPS.station.objects.find(o=>o.id==='b-elspeth-larkspur')!;
  expect(walkable(MAPS.station,object.x,object.y,state)).toBe(true);
  expect(worldPath(MAPS.station,state.location,object,state).length).toBeGreaterThan(0);
});

it('keepers have separate artwork while retaining their guardian combat rules',()=>{
  const state=decodeSave(JSON.stringify(departure));
  for(const [encounter,appearance] of [['b-keeper','sluice-keeper'],['c-boiler','boiler-keeper']]){
    const keeper=createBattle(encounter,state).units.find(u=>u.appearance===appearance)!;
    expect(keeper.kind).toBe('guardian');expect(keeper.abilities).toEqual(['steam','strike']);
  }
});
