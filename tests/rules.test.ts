import { describe, expect, it } from 'vitest';
import { MAPS, visibleObjects, walkable, worldPath } from '../src/content/disk-a/maps';
import { ABILITIES, active, cast, createBattle, defend, enemyTurn, legalAim, move, movement, targets, wait } from '../src/rules/combat';
import { blast, cells, distance, fromPixel, key, offset, ray, toPixel, visible } from '../src/rules/hex';
import { decodeSave, newGame, recruitOrrin } from '../src/rules/state';
import diskAV1 from './fixtures/disk-a-v1.json';
import { interactDiskA, type StoryHost } from '../src/content/disk-a/interactions';
import type { Dialogue } from '../src/content/disk-a/story';

function party() { const s = newGame(); recruitOrrin(s); return s; }
describe('hex geometry and cover', () => {
  it('round-trips all 77 cells and keeps the six neighboring centers equidistant', () => {
    expect(cells()).toHaveLength(77);
    for (const h of cells()) { const p = toPixel(h); expect(fromPixel(p.x,p.y)).toEqual(h); }
    const center = offset(5,3), p = toPixel(center);
    for (const h of blast(center).slice(1)) { const n = toPixel(h); expect(Math.hypot(n.x-p.x,n.y-p.y)).toBeCloseTo(Math.sqrt(3)*35); expect(distance(h,center)).toBe(1); }
  });
  it('clips blasts at the board edge and stops steam and sight at a rock', () => {
    expect(blast(offset(0,0))).toHaveLength(3);
    const rock = new Set([key(offset(4,3))]);
    expect(ray(offset(1,3),offset(8,3),6,rock)).toEqual([offset(2,3),offset(3,3)]);
    expect(visible(offset(1,3),offset(8,3),rock)).toBe(false);
  });
});
describe('position-sensitive combat', () => {
  it('the blast preview and committed damage include a neighboring ally', () => {
    const b=createBattle('yard',party()),nell=b.units[0],orrin=b.units[1],hound=b.units[2];
    b.obstacles.clear();nell.hex=offset(4,3);orrin.hex=offset(6,3);hound.hex=offset(5,3);
    const before=orrin.hp;
    expect(targets(b,nell,'burst',hound.hex).map(u=>u.id)).toContain(orrin.id);
    expect(cast(b,nell,'burst',hound.hex)).toBe(true);
    expect(orrin.hp).toBe(before-ABILITIES.burst.power);
  });
  it('movement cannot cross occupied cells or rocks and does not consume the attack', () => {
    const b=createBattle('yard',party()),nell=b.units[0],orrin=b.units[1];
    orrin.hex=offset(2,2);b.obstacles.add(key(offset(1,3)));
    expect(movement(b,nell).has(key(orrin.hex))).toBe(false);
    expect(movement(b,nell).has(key(offset(1,3)))).toBe(false);
    expect(move(b,nell,offset(2,1))).not.toBeNull();expect(active(b)?.id).toBe('nell');
    expect(move(b,nell,offset(3,1))).toBeNull();expect(wait(b)).toBe(false);
  });
  it('wait delays an action without granting extra focus, and can only happen once', () => {
    const b=createBattle('yard',party()),nell=b.units[0];nell.focus=3;
    expect(wait(b)).toBe(true);
    while(active(b)?.id!=='nell')defend(b);
    expect(nell.focus).toBe(3);expect(wait(b)).toBe(false);
  });
  it('retaliation is limited to once per defender per round', () => {
    const b=createBattle('yard',party()),nell=b.units[0],orrin=b.units[1],hound=b.units[2];
    b.obstacles.clear();nell.hex=offset(4,3);orrin.hex=offset(5,2);hound.hex=offset(5,3);hound.hp=100;hound.maxHp=100;
    cast(b,nell,'strike',hound.hex);expect(hound.retaliated).toBe(true);expect(nell.hp).toBeLessThan(nell.maxHp);
    b.queue=['orrin',...b.queue.filter(id=>id!=='orrin')];const before=orrin.hp;
    cast(b,orrin,'strike',hound.hex);expect(orrin.hp).toBe(before);
  });
  it('enemies can reach a legal action without occupying another unit or an obstacle', () => {
    const b=createBattle('inspector',party());
    for(let turn=0;turn<35&&!b.result;turn++){
      const u=active(b)!;if(u.side==='party')defend(b);else enemyTurn(b);
      const living=b.units.filter(u=>u.hp>0);
      expect(new Set(living.map(u=>key(u.hex))).size).toBe(living.length);
      for(const v of living)expect(b.obstacles.has(key(v.hex))).toBe(false);
      if(active(b)?.side==='party')for(const h of cells())if(legalAim(b,active(b)!,'burst',h))expect(distance(active(b)!.hex,h)).toBeLessThanOrEqual(5);
    }
    expect(b.log.some(s=>s.includes('Signal flare'))).toBe(true);
  });
});
describe('chapter continuity', () => {
  it('loads the original version-1 arrival from a complete browser playthrough', () => {
    const restored=decodeSave(JSON.stringify(diskAV1));
    expect(restored.boundary).toBe('disk-b:rillbridge-arrival');
    expect(restored.party.map(h=>h.id)).toEqual(['nell','orrin']);
    expect(restored.flags.scrapCleared).toBe(true);
    expect(restored.journal).toContain('boundary');
  });
  it('round-trips the Disk B boundary and decisions, and rejects malformed saves', () => {
    const s=party();s.flags.diskAComplete=true;s.flags.promisedHome=true;s.boundary='disk-b:rillbridge-arrival';s.gear=['brass-lantern'];
    expect(decodeSave(JSON.stringify(s))).toEqual(s);
    for(const bad of [{...s,version:99},{...s,coins:-1},{...s,party:[{id:'nell',hp:1e9,focus:6}]},{...s,location:{map:'nowhere',x:2,y:3}},{...s,flags:{orrinJoined:false}}])expect(()=>decodeSave(JSON.stringify(bad))).toThrow();
  });
  it('all exploration objects have an accessible approach from the map entrance', () => {
    const s=party();const starts={station:{x:21,y:19},yard:{x:35,y:18},tunnel:{x:3,y:13}};
    for(const map of Object.values(MAPS))for(const object of visibleObjects(map,s)){
      const approaches=[{x:object.x,y:object.y},{x:object.x-1,y:object.y},{x:object.x+1,y:object.y},{x:object.x,y:object.y-1},{x:object.x,y:object.y+1}];
      expect(approaches.some(p=>walkable(map,p.x,p.y)&&worldPath(map,starts[map.id as keyof typeof starts],p).length>0),`${map.id}: ${object.id}`).toBe(true);
    }
  });
});

describe('stationmaster decision',()=>{
  function visit(state=party()){
    let dialogue:Dialogue|undefined;
    const noop=()=>{};
    const host:StoryHost={state,talk:d=>{dialogue=d;},commit:noop,refresh:noop,save:noop,update:noop,travel:noop,battle:noop,shop:noop,boundary:noop,toast:noop,endingMusic:noop};
    return {state,host,read:()=>dialogue!};
  }
  it('retains either first answer when the stationmaster is visited again',()=>{
    for(const chosen of [0,1]){
      const {state,host,read}=visit();interactDiskA(host,'master');read().choices![chosen].action();
      interactDiskA(host,'master');expect(read().choices).toBeUndefined();
      expect(Boolean(state.flags.promisedHome)).toBe(chosen===0);
      expect(Boolean(state.flags.askedForTruth)).toBe(chosen===1);
    }
  });
  it('lets an ambiguous version-1 save resolve the choice to one answer',()=>{
    const state=decodeSave(JSON.stringify({...party(),flags:{orrinJoined:true,promisedHome:true,askedForTruth:true}}));
    const {host,read}=visit(state);interactDiskA(host,'master');read().choices![1].action();
    expect(state.flags.askedForTruth).toBe(true);expect(state.flags.promisedHome).toBeUndefined();
    interactDiskA(host,'master');expect(read().choices).toBeUndefined();
  });
});
