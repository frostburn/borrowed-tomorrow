import {ABILITIES,type AbilityId} from './abilities';
import {active,cast,tauntTarget,type Battle,type Encounter,type Unit} from './combat';
import type {Hex} from './hex';

const attacks:Partial<Record<NonNullable<Encounter['boss']>,AbilityId>>={
 furnace:'slagshot',ward:'lensshot',flagship:'coveringshot',serpent:'sunshard',dragon:'iceshard',emperor:'crownbolt',lightbearer:'lanternshard',benefactor:'claim',conduit:'pressurebolt',
};
const ids=new Set(Object.values(attacks));
export const isBossDirectAbility=(id:AbilityId)=>ids.has(id);
export const bossDirectAbility=(u:Unit)=>u.abilities.find(id=>ids.has(id));

/** Only Chapter Five onward. A multi-part ship gets one shot, not three. */
export function configureBossDirect(b:Battle,e:Encounter){
 if(!e.boss||e.boss==='conduit'&&e.id!=='domain-collector')return;
 const id=attacks[e.boss];if(!id)return;
 const core=b.units.find(u=>u.side==='enemy'&&!u.passive&&(e.boss!=='flagship'||u.id==='flagship-bridge'));
 if(core)core.abilities.push(id);
}

/** Rotate through living fighters; never hunt the weakest HP pool. Taunt wins.
 * This target is selected at firing time, independently of fixed area warnings. */
export function bossDirectTarget(b:Battle,u:Unit){
 const heroes=b.units.filter(v=>v.side!==u.side&&v.hp>0);
 return tauntTarget(b,u)??heroes[(b.round-1)%heroes.length];
}
function ready(b:Battle,u:Unit){
 return !b.result&&u.hp>0&&!u.passive&&!u.bonusUsed&&u.intent?.round===b.round&&u.intent.power>0&&u.intent.cells.length>0;
}
export function bossDirectHint(b:Battle){
 const core=b.units.find(u=>bossDirectAbility(u)&&ready(b,u)),target=core&&bossDirectTarget(b,core);
 return core&&target?`${ABILITIES[bossDirectAbility(core)!].name} targets ${target.name} directly before the marked attack.`:'';
}

/** One ordinary, animated bonus cast. The marked main action stays queued. */
export function bossDirectTurn(b:Battle,u:Unit,onAction?:(id:AbilityId,aim:Hex)=>void):AbilityId|undefined{
 const id=bossDirectAbility(u);if(!id||active(b)?.id!==u.id||!ready(b,u))return;
 const target=bossDirectTarget(b,u);if(!target)return;
 const aim={...target.hex};
 if(cast(b,u,id,aim)){onAction?.(id,aim);return id;}
}
