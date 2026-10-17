import { describe, expect, it } from 'vitest';
import departure from './fixtures/disk-c-v3.json';
import { decodeSave, enterDiskD, remember, type GameState } from '../src/rules/state';
import { interactDiskD } from '../src/content/disk-d/interactions';
import { objectiveD } from '../src/content/disk-d/story';
import { MAPS, visibleObjects, walkable, worldPath } from '../src/content/maps';
import { createBattle, damage, defend, move } from '../src/rules/combat';
import { offset } from '../src/rules/hex';
import type { Dialogue } from '../src/content/disk-a/story';
import type { StoryHost } from '../src/content/disk-a/interactions';

const start=()=>enterDiskD(decodeSave(JSON.stringify(departure)));
function story(state=start()){
  let dialogue:Dialogue|undefined,battle='',landing:GameState['location']|undefined;const noop=()=>{};
  const host:StoryHost={state,talk:d=>{dialogue=d;},commit:(flag,entry)=>{state.flags[flag]=true;if(entry)remember(state,entry);},refresh:noop,save:noop,update:noop,travel:(map,x,y)=>{landing={map,x,y};},battle:id=>{battle=id;},shop:noop,boundary:noop,toast:noop,endingMusic:noop};
  return {state,visit:(id:string)=>{dialogue=undefined;interactDiskD(host,id);return dialogue!;},battle:()=>battle,landing:()=>landing};
}

describe('Disk D continuation',()=>{
  it('continues the actual version-3 completion save without rewriting any prior progress',()=>{
    const before=decodeSave(JSON.stringify(departure)),copy=structuredClone(before),next=enterDiskD(before);
    expect(before).toEqual(copy);expect(next.version).toBe(4);expect(next.chapter).toBe('disk-d');expect(next.boundary).toBeNull();
    for(const property of ['party','coins','bandages','xp','gear','playSeconds'] as const)expect(next[property]).toEqual(departure[property]);
    for(const [flag,value] of Object.entries(departure.flags))expect(next.flags[flag]).toBe(value);
    expect(next.journal.slice(0,departure.journal.length)).toEqual(departure.journal);
    expect(decodeSave(JSON.stringify(next))).toEqual(next);expect(()=>enterDiskD(next)).toThrow();
    expect(()=>enterDiskD({...before,flags:{...before.flags,cReceiptSigned:false}})).toThrow();
  });
  it('hands over the promised letter before the local jobs and keeps recognition conditional',()=>{
    for(const worksheet of [false,true])for(const envelope of [false,true]){
      const state=start();state.flags.bWorksheetRead=worksheet;state.flags.scrapCleared=envelope;
      const s=story(state),d=s.visit('d-petra'),text=d.lines.map(l=>l.text).join(' ');
      expect(text.includes('Rillbridge sheet')).toBe(worksheet);
      expect(text.includes('wage envelope')).toBe(!worksheet&&envelope);
      expect(text).not.toContain('Ada Fenwick');expect(text).toContain('Dad.');
      d.done?.();expect(state.flags.dLetterRead).toBe(true);expect(state.flags.dLineHeld).toBeUndefined();
      expect(objectiveD(state)).toContain('red lamp');expect(state.party).toEqual(departure.party);
    }
  });
  it('protects the road and crew before the relay, then resolves either operating plan',()=>{
    for(const choice of [0,1]){
      const s=story(),f=s.state.flags;
      s.visit('d-tram').done?.();expect(s.battle()).toBe('');
      s.visit('d-circuit').done?.();expect(f.dCircuitRead).toBeUndefined();
      s.visit('d-relay').done?.();expect(s.battle()).toBe('');
      s.visit('d-recorder').done?.();expect(f.dRecordRead).toBeUndefined();
      s.visit('d-petra').done?.();s.visit('d-tram').done?.();expect(s.battle()).toBe('');
      s.visit('d-lamp').done?.();s.visit('d-tram').done?.();expect(s.battle()).toBe('d-tram');
      f.dCrewReturned=true;s.visit('d-circuit').done?.();
      s.visit('d-plan').choices![choice].action();expect(s.visit('d-plan').choices).toBeUndefined();
      const saved=decodeSave(JSON.stringify(s.state));expect(Boolean(saved.flags.dHoldRed)).toBe(choice===0);
      s.visit('d-relay').done?.();expect(s.battle()).toBe('d-relay');f.dRelayStopped=true;
      s.visit('d-recorder').done?.();expect(f.dReplySent).toBe(true);expect(s.state.journal).toContain('d-reply');s.visit('d-petra').done?.();
      const final=decodeSave(JSON.stringify(s.state));expect(final.boundary).toBe('disk-e:brinewick-parcel');
      expect(final.flags.diskDComplete).toBe(true);expect(final.flags.cWardHeat).toBe(true);expect(final.flags.bOrchardChannel).toBe(true);
      expect(visibleObjects(MAPS.northglass,final).some(o=>o.id==='d-esme')).toBe(false);
      expect(visibleObjects(MAPS.relayhall,final).some(o=>o.id==='d-esme-hall')).toBe(choice===1);
      s.visit('d-return-service');expect(s.landing()).toBeUndefined();
    }
  });
  it('rejects conflicting plans, incomplete future departures, and older chapters in Northglass',()=>{
    const state=start();
    for(const invalid of [
      {...state,flags:{...state.flags,dHoldRed:true,dHandBell:true}},
      {...state,boundary:'disk-e:brinewick-parcel'},
      {...state,chapter:'disk-c'},
    ])expect(()=>decodeSave(JSON.stringify(invalid))).toThrow();
  });
  it('aligns both return entrances and keeps doors and workstations reachable without crossing walls',()=>{
    const state=start(),s=story(state),exit=MAPS.northglass.objects.find(o=>o.id==='d-to-larkspur')!;
    expect(Math.abs(state.location.x-exit.x)+Math.abs(state.location.y-exit.y)).toBe(1);
    s.visit('d-return-service');expect(s.landing()).toEqual(state.location);
    const stores=MAPS.station.objects.find(o=>o.id==='c-stores-service')!;
    expect(worldPath(MAPS.station,{x:31,y:10},stores,state).length).toBeGreaterThan(0);
    for(const [id,entrances] of [['northglass',[state.location,{x:48,y:15}]],['relayhall',[{x:31,y:34}]]] as const){
      for(const entrance of entrances)for(const object of MAPS[id].objects){
        const candidates=[object,{x:object.x-1,y:object.y},{x:object.x+1,y:object.y},{x:object.x,y:object.y-1},{x:object.x,y:object.y+1}];
        expect(candidates.some(p=>walkable(MAPS[id],p.x,p.y,state)&&worldPath(MAPS[id],entrance,p,state).length>0),`${id}: ${object.id}`).toBe(true);
      }
    }
    for(const [id,x,y] of [['northglass',14,8],['northglass',58,20],['northglass',15,38],['relayhall',30,18],['relayhall',17,25],['relayhall',46,26]] as const)expect(walkable(MAPS[id],x,y,state)).toBe(false);
  });
});

describe('paired earth contacts',()=>{
  it('requires two living party members together, releases on a move, and stays released after leaving',()=>{
    const b=createBattle('d-relay',start()),[nell,orrin]=b.units,keeper=b.units.find(u=>u.sealed)!,crow=b.units.find(u=>u.kind==='crow')!;
    expect(damage(nell,keeper,'burst')).toBe(0);
    crow.hex=offset(3,5);expect(move(b,nell,offset(3,1))).not.toBeNull();expect(b.grounding!.open).toBe(false);
    orrin.hex=offset(3,5);orrin.hp=0;defend(b);expect(b.grounding!.open).toBe(false);
    // A fresh legal move closes the second contact while Nell is already on hers.
    const live=createBattle('d-relay',start()),[n,o]=live.units,k=live.units.find(u=>u.sealed)!;
    o.hex=offset(3,5);expect(move(live,n,offset(3,1))).not.toBeNull();
    expect(live.grounding!.open).toBe(true);expect(damage(n,k,'burst')).toBeGreaterThan(0);
    n.moved=false;expect(move(live,n,offset(2,1))).not.toBeNull();expect(live.grounding!.open).toBe(true);
    expect(live.log.filter(l=>l.includes('shield drops'))).toHaveLength(1);
  });
});
