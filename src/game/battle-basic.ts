import type {Battle,Unit} from '../rules/combat';
import {damagingAbility,legalAim,move,movement,movementOnly,targets,type AbilityId} from '../rules/combat';
import {abilityFor} from '../rules/skills';
import {occupiedHexes} from '../rules/footprint';
import {distance,equal,type Hex} from '../rules/hex';

/** Choose the contextual command, retaining movement-only team continuations. */
export function basicAction(battle:Battle,actor:Unit,hex:Hex):'move'|'strike'{
  if(movementOnly(battle,actor))return 'move';
  const enemy=battle.units.some(u=>u.hp>0&&u.side!==actor.side&&occupiedHexes(u).some(h=>equal(h,hex)));
  const fixture=battle.fixtures?.some(f=>f.hp>0&&equal(f.hex,hex));
  return enemy||fixture?'strike':'move';
}

/** Adjacent attacks can approach a clicked enemy; ranged and support skills stay put. */
export function approachAbility(actor:Unit,id:AbilityId){
  const a=abilityFor(actor,id);
  return !a.team&&(damagingAbility(id)||a.effect==='shove')&&(a.range===1&&a.shape==='single'||a.range===0&&a.shape==='blast');
}

/** Read-only forecast for the clicked contact, optionally retaining its chosen adjacent destination. */
export function approachAttack(battle:Battle,actor:Unit,id:AbilityId,aim:Hex,destination?:Hex){
  if(!approachAbility(actor,id))return;
  const a=abilityFor(actor,id),self=a.range===0;
  const enemy=battle.units.find(u=>u.hp>0&&u.side!==actor.side&&occupiedHexes(u).some(h=>equal(h,aim)));
  const direct=self?actor.hex:aim;
  const hitsEnemy=(b:Battle,u:Unit,at:Hex)=>!self||!!enemy&&occupiedHexes(u).some(h=>distance(h,aim)===1)&&targets(b,u,id,at).some(v=>v.id===enemy.id);
  if(!destination&&legalAim(battle,actor,id,direct)&&(!self||equal(aim,actor.hex)||hitsEnemy(battle,actor,direct)))return {battle,actor,aim:direct};
  if(movementOnly(battle,actor)&&!a.bonus||actor.moved||actor.hp<=0||battle.result)return;
  if(!enemy)return;
  const visits=[...movement(battle,actor).values()].filter(v=>v.path.length&&(!destination||equal(v.hex,destination))&&distance(v.hex,aim)===1)
    .sort((a,b)=>a.cost-b.cost||a.path.length-b.path.length||a.hex.r-b.hex.r||a.hex.q-b.hex.q);
  for(const visit of visits){
    const projected={...actor,hex:{...visit.hex},moved:true};
    const forecast={...battle,units:battle.units.map(u=>u.id===actor.id?projected:u)};
    const target=(self?[projected.hex]:[aim]).find(h=>legalAim(forecast,projected,id,h)&&hitsEnemy(forecast,projected,h));
    if(target){
      // Use the real movement rules on a copy, including opening earth plates.
      const result=structuredClone(battle),mover=result.units.find(u=>u.id===actor.id)!;
      if(move(result,mover,visit.hex)&&legalAim(result,mover,id,target)&&hitsEnemy(result,mover,target))return {battle:result,actor:mover,aim:target,visit};
    }
  }
}

export const basicStrike=(battle:Battle,actor:Unit,aim:Hex,destination?:Hex)=>approachAttack(battle,actor,'strike',aim,destination);
