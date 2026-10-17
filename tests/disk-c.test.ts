import { describe, expect, it } from 'vitest';
import departure from './fixtures/disk-b-v2.json';
import { decodeSave, enterDiskC, remember, type GameState } from '../src/rules/state';
import { createBattle, defend, move, wait } from '../src/rules/combat';
import { key, offset } from '../src/rules/hex';
import { MAPS, walkable, worldPath } from '../src/content/maps';
import { interactDiskC } from '../src/content/disk-c/interactions';
import { arrivalC } from '../src/content/disk-c/story';
import type { StoryHost } from '../src/content/disk-a/interactions';
import type { Dialogue } from '../src/content/disk-a/story';

const start=()=>enterDiskC(decodeSave(JSON.stringify(departure)));
function story(state=start()){
  let dialogue:Dialogue|undefined,battle='',destination='',landing:GameState['location']|undefined;const noop=()=>{};
  const host:StoryHost={state,talk:d=>{dialogue=d;},commit:(flag,entry)=>{state.flags[flag]=true;if(entry)remember(state,entry);},refresh:noop,save:noop,update:noop,travel:(map,x,y)=>{destination=map;landing={map,x,y};},battle:id=>{battle=id;},shop:noop,boundary:noop,toast:noop,endingMusic:noop};
  return {state,visit:(id:string)=>{dialogue=undefined;interactDiskC(host,id);return dialogue!;},read:()=>dialogue!,battle:()=>battle,destination:()=>destination,landing:()=>landing};
}

describe('Disk C continuation',()=>{
  it('imports the supplied version-2 save without changing any previous progress',()=>{
    const before=decodeSave(JSON.stringify(departure)),original=structuredClone(before),next=enterDiskC(before);
    expect(before).toEqual(original);expect(next.version).toBe(3);expect(next.chapter).toBe('disk-c');
    for(const property of ['party','coins','bandages','xp','gear','playSeconds'] as const)expect(next[property]).toEqual(departure[property]);
    for(const [flag,value] of Object.entries(departure.flags))expect(next.flags[flag]).toBe(value);
    expect(next.journal.slice(0,departure.journal.length)).toEqual(departure.journal);
    expect(next.journal).toContain('c-flour-credit');expect(next.boundary).toBeNull();
    expect(decodeSave(JSON.stringify(next))).toEqual(next);
    expect(()=>enterDiskC(next)).toThrow();
    expect(()=>enterDiskC({...before,flags:{...before.flags,bLarkspurReceived:false}})).toThrow();
  });
  it('keeps the orchard consequence and conditional maintenance knowledge honest',()=>{
    for(const orchard of [true,false])for(const worksheet of [true,false]){
      const state=start();state.flags.bOrchardChannel=orchard;state.flags.bMillraceChannel=!orchard;state.flags.bWorksheetRead=worksheet;
      const text=arrivalC(state).map(l=>l.text).join(' ');expect(text).toContain(orchard?'flour credit':'stored apples');
      state.flags.cManifestRefused=true;const s=story(state);
      const lines=s.visit('c-dispatch').lines.map(l=>l.text).join(' ');
      expect(lines.includes('Dad used')).toBe(worksheet);
      const credit=s.visit('c-tilda').lines[0].text;expect(credit).toContain(orchard?'Credit':'apple crates');
    }
  });
  it('arrives beside the Larkspur exit on first entry and return, without relocating older saves',()=>{
    const s=story(),exit=MAPS.cinderbank.objects.find(o=>o.id==='c-to-larkspur')!;
    expect(Math.abs(s.state.location.x-exit.x)+Math.abs(s.state.location.y-exit.y)).toBe(1);
    s.visit('c-return-service');expect(s.landing()).toEqual(s.state.location);
    s.state.location={map:'cinderbank',x:28,y:16};
    expect(decodeSave(JSON.stringify(s.state)).location).toEqual(s.state.location);
  });
  it('requires care, a receiving signature, and a repair before dispatch, then resolves both heat choices',()=>{
    for(const choice of [0,1]){
      const s=story(),f=s.state.flags;
      s.visit('c-carriage').done?.();expect(f.cManifestRefused).toBeUndefined();
      s.visit('c-return-service');expect(f.diskCComplete).toBeUndefined();
      s.visit('c-water').done?.();s.visit('c-carriage').done?.();s.visit('c-dispatch').done?.();
      s.visit('c-dispatch').done?.();expect(f.cCrewAccepted).toBeUndefined();
      s.visit('c-valve').done?.();expect(s.battle()).toBe('');
      s.visit('c-celia').done?.();s.visit('c-beds').done?.();
      s.visit('c-couplings').done?.();expect(s.battle()).toBe('c-coupling');f.cCouplingRecovered=true;
      s.visit('c-valve').choices![choice].action();expect(s.visit('c-valve').choices).toBeUndefined();
      const saved=decodeSave(JSON.stringify(s.state));expect(Boolean(saved.flags.cTrainHeat)).toBe(choice===0);
      s.visit('c-valve').done?.();expect(s.battle()).toBe('c-boiler');f.cBoilerStopped=true;
      s.visit('c-dispatch').done?.();expect(f.cCrewAccepted).toBe(true);
      s.visit('c-carriage').choices![0].action();s.read().done?.();
      expect(f.cTransferred).toBe(true);expect(s.destination()).toBe('infirmary');
      s.visit('c-ansel').done?.();expect(f.cLarkspurReported).toBeUndefined();
      s.visit('c-patients').done?.();s.visit('c-ansel').done?.();
      s.visit('c-return-service').done?.();
      const finished=decodeSave(JSON.stringify(s.state));expect(finished.boundary).toBe('disk-d:signal-works');
      expect(finished.flags.diskCComplete).toBe(true);expect(finished.party.map(h=>h.id)).toEqual(['nell','orrin']);
    }
  });
  it('rejects conflicting heating plans and unearned future boundaries',()=>{
    const state=start();
    for(const invalid of [
      {...state,flags:{...state.flags,cTrainHeat:true,cWardHeat:true}},
      {...state,boundary:'disk-d:signal-works'},
      {...state,chapter:'disk-b'},
    ])expect(()=>decodeSave(JSON.stringify(invalid))).toThrow();
  });
  it('every object and return entrance has a route that respects the buildings and fences',()=>{
    const state=start();
    for(const [id,entrances] of [['cinderbank',[start().location,{x:28,y:16},{x:47,y:26}]],['infirmary',[{x:16,y:27},{x:32,y:20}]]] as const){
      const map=MAPS[id];
      for(const entrance of entrances){
        expect(walkable(map,entrance.x,entrance.y,state)).toBe(true);
        for(const object of map.objects){
          const approaches=[object,{x:object.x-1,y:object.y},{x:object.x+1,y:object.y},{x:object.x,y:object.y-1},{x:object.x,y:object.y+1}];
          expect(approaches.some(p=>walkable(map,p.x,p.y,state)&&worldPath(map,entrance,p,state).length>0),`${id}: ${object.id}`).toBe(true);
        }
      }
    }
    for(const [id,x,y] of [['cinderbank',30,8],['cinderbank',58,12],['infirmary',20,8],['infirmary',51,25],['cinderbank',43,34],['cinderbank',47,35],['infirmary',26,15],['infirmary',38,15]] as const)expect(walkable(MAPS[id],x,y,state)).toBe(false);
  });
});

describe('steam vent positioning',()=>{
  it('persists the chosen bypass and marks distinct, unobstructed danger lanes',()=>{
    const train=start();train.flags.cTrainHeat=true;const ward=start();ward.flags.cWardHeat=true;
    const a=createBattle('c-boiler',decodeSave(JSON.stringify(train))),b=createBattle('c-boiler',decodeSave(JSON.stringify(ward)));
    expect(a.vents.size).toBe(10);expect(b.vents.size).toBe(5);
    expect([...a.vents].some(h=>b.vents.has(h))).toBe(false);
    for(const battle of [a,b])for(const vent of battle.vents)expect(battle.obstacles.has(vent)).toBe(false);
  });
  it('discharges once after the last action, allows waiting or moving out, and spares flying units',()=>{
    const b=createBattle('c-boiler',start()),nell=b.units[0],orrin=b.units[1],crow=b.units.find(u=>u.kind==='crow')!;
    b.obstacles.clear();b.vents=new Set([key(offset(2,2)),key(offset(3,3)),key(offset(7,1))]);
    nell.hex=offset(2,2);orrin.hex=offset(3,3);crow.hex=offset(7,1);
    const hp=nell.hp,crowHp=crow.hp,orrinHp=orrin.hp;
    expect(wait(b)).toBe(true);expect(nell.hp).toBe(hp);
    while(b.queue.length>1)defend(b);
    expect(nell.hp).toBe(hp);expect(orrin.hp).toBe(orrinHp);
    expect(move(b,nell,offset(2,1))).not.toBeNull();defend(b);
    expect(b.round).toBe(2);expect(nell.hp).toBe(hp);expect(orrin.hp).toBe(orrinHp-6);expect(crow.hp).toBe(crowHp);
    expect(b.log.filter(l=>l.includes('Steam vent hits'))).toHaveLength(1);
  });
  it('does not grant victory when a round-end discharge downs both sides',()=>{
    const b=createBattle('c-boiler',start());
    b.units=b.units.filter(u=>u.id==='nell'||u.kind==='guardian');
    for(const u of b.units)u.hp=6;
    b.vents=new Set(b.units.map(u=>key(u.hex)));b.queue=b.units.map(u=>u.id);
    defend(b);defend(b);expect(b.result).toBe('defeat');
  });
});
