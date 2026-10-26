import {ABILITIES,teamSolo,type AbilityId} from './abilities';
import type {Battle,Unit} from './combat';
import {abilityFor} from './skills';
import {blast,cells,distance,equal,key,visible,type Hex} from './hex';
import {bodyDistance,occupiedHexes} from './footprint';

export interface BattleFixture {id:string;name:string;kind:'barricade'|'drum'|'valve';hex:Hex;hp:number;maxHp:number;active?:boolean;vents?:Hex[];power?:number}
export interface FixtureDefinition {id:string;name:string;kind:BattleFixture['kind'];col:number;row:number;hp?:number;active?:boolean;vents?:[number,number][];power?:number}
export const fixtureAt=(b:Battle,h:Hex)=>b.fixtures?.find(f=>f.hp>0&&equal(f.hex,h));
/** Support follows caster level, independent of attack edits and offensive gear. */
export function supportPower(u:Unit,id:AbilityId,partner?:Unit):number{
 if(partner&&ABILITIES[id].team)return supportPower(u,teamSolo(u.kind,id)!)+supportPower(partner,teamSolo(partner.kind,id)!);
 const a=abilityFor(u,id),growth=Math.max(0,(u.level??1)-1),power=a.power;
 if(id==='bandage'||a.effect==='focus')return a.power;
 return power+(a.heal?growth*2:a.effect==='guard'?Math.floor(growth*1.5):0);
}
/** Daybreak adds Petra's actual Taunt and its current self/party ward to Celia's Heal. */
export function daybreakProtection(u:Unit,partner?:Unit){
 const vanguard=[u,partner].find(v=>v?.kind==='petra');if(!vanguard)return;
 const ward=abilityFor(vanguard,'taunt').ward;
 return {vanguard,power:ward?ward.power+Math.floor(Math.max(0,(vanguard.level??1)-1)*1.5):0,party:!!ward?.party};
}
/** Fallen partners remain in the battle; missing or reserve partners do not clutter commands. */
export const battleAbilities=(b:Battle,u:Unit)=>u.abilities.filter(id=>{
 const team=ABILITIES[id].team;
 return !team||team.pair.includes(u.kind)&&b.units.some(v=>v.side===u.side&&v.kind!==u.kind&&team.pair.includes(v.kind)&&(!u.linkedTo||u.linkedTo===v.id));
});
export function teamStatus(b:Battle,u:Unit,id:AbilityId,future=false):{partner?:Unit;reason?:string}{
 const team=ABILITIES[id].team;if(!team)return {};
 const other=team.pair.find(kind=>kind!==u.kind);
 const partner=team.pair.includes(u.kind)?b.units.find(v=>v.side===u.side&&v.kind===other&&(!u.linkedTo||v.id===u.linkedTo)):undefined;
 if(!partner)return {reason:'Requires a teammate in this formation.'};
 for(const fighter of [partner,u]){
  if(fighter.hp<=0)return {reason:`${fighter.name} is down and cannot team up.`};
  const solo=teamSolo(fighter.kind,id)!;
  if(!fighter.abilities.includes(solo))return {reason:`${fighter.name} needs to learn ${ABILITIES[solo].name}.`};
  if(!future&&!b.queue.includes(fighter.id))return {reason:`${fighter.name} has already used their action this round.`};
  if(!future&&fighter.focus<team.cost)return {reason:`${fighter.name} needs ${team.cost} focus (has ${fighter.focus}).`};
 }
 return {partner};
}
export function ricochetHexes(b:Battle,u:Unit,aim:Hex,id:AbilityId='ricochet'):Hex[]{
 const reach=abilityFor(u,id,teamStatus(b,u,id).partner).bounceRange??3;
 const first=b.units.find(v=>v.hp>0&&v.side!==u.side&&occupiedHexes(v).some(h=>equal(h,aim)));
 if(!first)return [];
 const choices=b.units.filter(v=>v.hp>0&&v.side!==u.side&&v.id!==first.id).flatMap(v=>{
  const links=occupiedHexes(first).flatMap(a=>occupiedHexes(v).filter(z=>distance(a,z)<=reach&&visible(a,z,b.obstacles)).map(z=>({hex:z,d:distance(a,z)}))).sort((a,z)=>a.d-z.d||a.hex.q-z.hex.q||a.hex.r-z.hex.r);
  return links[0]?[{id:v.id,...links[0]}]:[];
 }).sort((a,z)=>a.d-z.d||a.id.localeCompare(z.id));
 return [aim,...choices[0]?[choices[0].hex]:[]];
}
export function axisHexes(axis:'q'|'r'|'s',aim:Hex){return cells().filter(h=>axis==='q'?h.q===aim.q:axis==='r'?h.r===aim.r:h.q+h.r===aim.q+aim.r);}
/** Charge one full round ahead; both operators display the same locked area. */
export function prepareRelay(b:Battle){
 for(const u of b.units.filter(u=>u.abilities.includes('relay'))){
  if(u.hp<=0)continue;
  const partner=b.units.find(v=>v.id===u.linkedTo),pair=partner?[u,partner]:[u],leader=[...pair].sort((a,z)=>z.speed-a.speed||a.id.localeCompare(z.id))[0],cycle=Math.floor((b.round-1)/2);
  if(u.intent?.round!==b.round){
   const previous=pair.find(v=>v.intent?.cycle===cycle)?.intent;
   const target=b.units.filter(v=>v.hp>0&&v.side!==u.side).sort((a,z)=>bodyDistance(leader,a)-bodyDistance(leader,z)||a.id.localeCompare(z.id))[0];
   u.intent={round:b.round,cycle,name:'Relay charging',cells:[],power:partner?abilityFor(u,'relay',partner).power:0,phase:'relay',destination:previous?.destination??(target?{...target.hex}:undefined)};
  }
  const charging=b.round%2===1,linked=u.teamSpentRound!==b.round&&teamStatus(b,u,'relay',charging).partner;
  const forced=b.units.find(v=>v.hp>0&&v.id===leader.tauntedBy&&v.side!==u.side),center=forced?.hex??u.intent.destination;
  u.intent.cells=linked&&center?blast(center):[];
  u.intent.name=linked?(charging?`Relay charging · fires in round ${b.round+1}`:'Linked relay · defeat either machine'):'Relay disconnected · ordinary attacks';
 }
}
function operateValve(b:Battle,aim:Hex):string{
 const f=fixtureAt(b,aim)!;f.active=!f.active;
 for(const h of f.vents??[])if(f.active)b.vents.add(key(h));else b.vents.delete(key(h));
 return `${f.name}: steam ${f.active?'on':'off'}.`;
}
/** Props use the same affected footprint; a drum may also break nearby props. */
export function damageFixtures(b:Battle,hexes:Hex[],power:number):string[]{
 if(power<=0)return [];
 const valves=(b.fixtures??[]).filter(f=>f.hp>0&&f.kind==='valve'&&hexes.some(h=>equal(h,f.hex)));
 const messages:string[]=valves.map(f=>operateValve(b,f.hex));
 const pending=(b.fixtures??[]).filter(f=>f.hp>0&&f.kind!=='valve'&&hexes.some(h=>equal(h,f.hex))).map(f=>({f,power}));
 while(pending.length){
  const {f,power}=pending.shift()!;if(f.hp<=0)continue;
  f.hp=Math.max(0,f.hp-power);messages.push(`${f.name}: ${power} damage${f.hp?` · ${f.hp} HP left`: ' · broken'}.`);
  if(f.hp>0)continue;b.obstacles.delete(key(f.hex));
  if(f.kind==='drum'){
   const area=blast(f.hex),force=f.power??14;messages.push(`${f.name} bursts across adjacent hexes.`);
   for(const u of b.units)if(u.hp>0&&!u.sealed&&occupiedHexes(u).some(h=>area.some(a=>equal(a,h)))){
    const hit=Math.max(0,Math.round((force-u.armor)*(u.defending?.6:1))),absorbed=Math.min(u.guard??0,hit);
    u.guard=(u.guard??0)-absorbed;u.hp=Math.max(0,u.hp-(hit-absorbed));messages.push(`${u.name}: ${hit-absorbed} HP lost to pressure.`);
   }
   for(const next of b.fixtures??[])if(next.hp>0&&next.kind!=='valve'&&area.some(h=>equal(h,next.hex)))pending.push({f:next,power:force});
  }
 }
 return messages;
}
