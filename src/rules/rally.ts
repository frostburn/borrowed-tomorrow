import type {Battle,Unit} from './combat';
import {abilityFor} from './skills';
import {blast,equal,key,neighbors,type Hex} from './hex';
import {occupiedHexes} from './footprint';

type RallyContext=Pick<Battle,'units'|'round'|'result'>;
export interface RallyAura {rank:number;expiresRound:number}
export const RALLY_ROUNDS=3;
export const rallyRemaining=(b:RallyContext,u:Unit)=>Math.max(0,(u.rally?.expiresRound??b.round)-b.round);
export const rallySources=(b:RallyContext)=>b.result?[]:b.units.filter(u=>u.hp>0&&rallyRemaining(b,u)>0);
/** The field follows its living source. Cover does not obstruct a nearby cry. */
export function rallyArea(b:RallyContext,u:Unit,rank:number):Hex[]{
 if(rank>=3)return b.units.filter(v=>v.side===u.side&&v.hp>0).flatMap(v=>occupiedHexes(v));
 return rank>=2?blast(u.hex):neighbors(u.hex);
}
export function rallyRecipients(b:RallyContext,u:Unit,rank:number){
 const area=new Set(rallyArea(b,u,rank).map(key));
 return b.units.filter(v=>v.side===u.side&&v.hp>0&&occupiedHexes(v).some(h=>area.has(key(h))));
}
export const rallyBonus=(b:RallyContext,u:Unit)=>rallySources(b).some(source=>rallyRecipients(b,source,source.rally!.rank).includes(u))?1:0;
export function rallyReason(b:RallyContext,u:Unit){
 const rank=abilityFor(u,'rally').rank??1;
 if(!b.units.some(v=>v.hp>0&&v.side===u.side&&(rank>=2||v.id!==u.id)))return 'Rallying cry I needs another living fighter in this battle.';
 if(u.rally?.rank===rank&&rallyRemaining(b,u)===RALLY_ROUNDS)return 'Rallying cry already has 3 rounds remaining.';
}
export function canRally(b:RallyContext,u:Unit,aim:Hex){
 return equal(aim,u.hex)&&!rallyReason(b,u);
}
export function startRally(b:RallyContext,u:Unit){u.rally={rank:abilityFor(u,'rally').rank??1,expiresRound:b.round+RALLY_ROUNDS};}
/** A fallen source loses the field permanently, even if revived later. */
export function cleanRallies(b:RallyContext){for(const u of b.units)if(u.rally&&(u.hp<=0||rallyRemaining(b,u)===0||b.result))delete u.rally;}
