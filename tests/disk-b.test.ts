import { describe, expect, it } from 'vitest';
import arrival from './fixtures/disk-a-v1.json';
import { decodeSave, enterDiskB, newGame, remember } from '../src/rules/state';
import { createBattle, movement, move } from '../src/rules/combat';
import { cells, key, offset, reachable } from '../src/rules/hex';
import { MAPS, walkable, worldPath } from '../src/content/maps';
import { interactDiskB } from '../src/content/disk-b/interactions';
import type { StoryHost } from '../src/content/disk-a/interactions';
import type { Dialogue } from '../src/content/disk-a/story';

const start=()=>enterDiskB(decodeSave(JSON.stringify(arrival)));
function story(){
  const state=start();let dialogue:Dialogue|undefined,battle='',travel='';
  const noop=()=>{};
  const host:StoryHost={state,talk:d=>{dialogue=d;},commit:(flag,entry)=>{state.flags[flag]=true;if(entry)remember(state,entry);},refresh:noop,save:noop,update:noop,travel:map=>{travel=map;},battle:id=>{battle=id;},shop:noop,boundary:noop,toast:noop,endingMusic:noop};
  return {state,visit:(id:string)=>{dialogue=undefined;interactDiskB(host,id);return dialogue!;},battle:()=>battle,travel:()=>travel};
}
describe('Disk B continuity and consequences',()=>{
  it('migrates the real version-1 checkpoint and enters without resetting progress',()=>{
    const old=decodeSave(JSON.stringify(arrival)),before=structuredClone(old),next=enterDiskB(old);
    expect(old).toEqual(before);expect(next.version).toBe(4);
    for(const prop of ['party','gear','coins','bandages','xp','playSeconds'] as const)expect(next[prop]).toEqual(before[prop]);
    for(const [flag,value] of Object.entries(before.flags))expect(next.flags[flag]).toBe(value);
    expect(next.journal).toEqual([...before.journal,'b-arrival']);expect(next.boundary).toBeNull();
    expect(decodeSave(JSON.stringify(next))).toEqual(next);
    expect(()=>enterDiskB(newGame())).toThrow();expect(()=>enterDiskB(next)).toThrow();
  });
  it('keeps either outfall choice through save/reload and changes the keeper arena',()=>{
    for(const choice of [0,1]){
      const s=story();s.state.flags.bNeighborsReady=true;
      s.visit('b-wheel').choices![choice].action();
      expect(s.visit('b-wheel').choices).toBeUndefined();
      const restored=decodeSave(JSON.stringify(s.state));
      expect(createBattle('b-keeper',restored).water.size>0).toBe(choice===1);
      s.state.flags.bEvacuated=true;s.state.flags.promisedHome=true;
      const coda=s.visit('b-ansel');expect(coda.lines.some(l=>l.text.includes(choice===0?'lost the orchard':'orchard bank held'))).toBe(true);
      expect(coda.lines[0].text).toContain('promised');coda.done?.();
      s.visit('b-dispatch').done?.();
      const finished=decodeSave(JSON.stringify(s.state));expect(finished.boundary).toBe('disk-c:ambulance-siding');
      expect(finished.flags.diskBComplete).toBe(true);
    }
    const invalid=start();invalid.flags.bOrchardChannel=true;invalid.flags.bMillraceChannel=true;
    expect(()=>decodeSave(JSON.stringify(invalid))).toThrow('conflict');
  });
  it('requires rescue preparations before the keeper, crossing, and new departure',()=>{
    const s=story();
    expect(s.visit('b-wheel').choices).toBeUndefined();
    s.visit('b-keeper').done?.();expect(s.battle()).toBe('');
    s.visit('b-crossing').done?.();expect(s.travel()).toBe('');expect(s.state.flags.bEvacuated).toBeUndefined();
    s.visit('b-dispatch').done?.();expect(s.state.boundary).toBeNull();expect(s.state.flags.diskBComplete).toBeUndefined();
    s.state.flags.bNeighborsReady=true;s.state.flags.bKeeperStopped=true;
    s.visit('b-crossing').done?.();expect(s.travel()).toBe('station');expect(s.state.flags.bEvacuated).toBe(true);
  });
  it('blocks the schoolhouse walls and closed gate, then preserves the opened entrance',()=>{
    const s=story(),map=MAPS.rillbridge,door={x:56,y:35};s.state.flags.bTrolleyFreed=true;
    for(const from of [{x:42,y:35},{x:56,y:39},{x:64,y:23}])expect(worldPath(map,from,door,s.state)).toEqual([]);
    expect(walkable(map,43,35,s.state)).toBe(false);expect(walkable(map,56,38,s.state)).toBe(false);
    s.visit('b-schoolhouse');expect(s.state.flags.bNeighborsReady).toBeUndefined();
    s.visit('b-school-gate').done?.();
    const restored=decodeSave(JSON.stringify(s.state));
    const route=worldPath(map,{x:42,y:35},door,restored);expect(route.length).toBeGreaterThan(0);
    expect(route.some(p=>p.y===38&&(p.x===55||p.x===56))).toBe(true);
    expect(walkable(map,43,35,restored)).toBe(false);
    s.visit('b-schoolhouse').done?.();expect(s.state.flags.bNeighborsReady).toBe(true);
  });
  it('every new object has a walkable approach, including after it replaces an encounter',()=>{
    for(const [id,entrance] of [['rillbridge',{x:12,y:18}],['sluice',{x:33,y:35}]] as const){
      const state=start();state.flags.bSchoolGateOpen=true;
      const map=MAPS[id];expect(walkable(map,entrance.x,entrance.y)).toBe(true);
      for(const o of map.objects){
        const approaches=[{x:o.x,y:o.y},{x:o.x-1,y:o.y},{x:o.x+1,y:o.y},{x:o.x,y:o.y-1},{x:o.x,y:o.y+1}];
        expect(approaches.some(p=>walkable(map,p.x,p.y,state)&&worldPath(map,entrance,p,state).length>0),o.id).toBe(true);
      }
    }
  });
});
describe('shallow-water positioning',()=>{
  it('finds a cheaper dry detour instead of the shortest wet route',()=>{
    const water=new Set([key(offset(2,3)),key(offset(3,3))]);
    const visit=reachable(offset(1,3),4,new Set(),h=>water.has(key(h))?2:1).get(key(offset(4,3)))!;
    expect(visit.cost).toBe(4);expect(visit.path).toHaveLength(4);expect(visit.path.some(h=>water.has(key(h)))).toBe(false);
  });
  it('uses the preview cost when committing movement, while crows ignore water',()=>{
    const b=createBattle('b-overflow',start()),nell=b.units[0],crow=b.units.find(u=>u.kind==='crow')!;
    b.obstacles.clear();b.water=new Set(cells().map(key));
    const visit=movement(b,nell).get(key(offset(2,2)))!;expect(visit.cost).toBe(2);expect(visit.path).toHaveLength(1);
    expect(movement(b,nell).has(key(offset(3,2)))).toBe(false);
    expect(move(b,nell,offset(2,2))).toEqual(visit.path);expect(b.log.at(-1)).toContain('2 movement');
    expect(movement(b,crow).get(key(offset(8,3)))!.cost).toBe(1);
  });
});
