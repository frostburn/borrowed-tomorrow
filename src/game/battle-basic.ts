import type {Battle,Unit} from '../rules/combat';
import {legalAim,move,movement,movementOnly} from '../rules/combat';
import {occupiedHexes} from '../rules/footprint';
import {distance,equal,key,type Hex} from '../rules/hex';

/** Choose the contextual command, retaining movement-only team continuations. */
export function basicAction(battle:Battle,actor:Unit,hex:Hex):'move'|'strike'{
  if(movementOnly(battle,actor))return 'move';
  const enemy=battle.units.some(u=>u.hp>0&&u.side!==actor.side&&occupiedHexes(u).some(h=>equal(h,hex)));
  const fixture=battle.fixtures?.some(f=>f.hp>0&&equal(f.hex,hex));
  return enemy||fixture?'strike':'move';
}

/** Read-only strike forecast, optionally from a reachable adjacent destination. */
export function basicStrike(battle:Battle,actor:Unit,aim:Hex,destination?:Hex){
  if(!destination&&legalAim(battle,actor,'strike',aim))return {battle,actor,aim};
  if(movementOnly(battle,actor)||actor.moved||actor.hp<=0||battle.result)return;
  const enemy=battle.units.find(u=>u.hp>0&&u.side!==actor.side&&occupiedHexes(u).some(h=>equal(h,aim)));
  if(!enemy)return;
  const contacts=occupiedHexes(enemy);
  const visits=[...movement(battle,actor).values()].filter(v=>v.path.length&&(!destination||equal(v.hex,destination))&&contacts.some(h=>distance(v.hex,h)===1))
    .sort((a,b)=>a.cost-b.cost||a.path.length-b.path.length||a.hex.r-b.hex.r||a.hex.q-b.hex.q);
  for(const visit of visits){
    const projected={...actor,hex:{...visit.hex},moved:true};
    const forecast={...battle,units:battle.units.map(u=>u.id===actor.id?projected:u)};
    const target=[...contacts].sort((a,b)=>distance(a,aim)-distance(b,aim)||key(a).localeCompare(key(b))).find(h=>legalAim(forecast,projected,'strike',h));
    if(target){
      // Use the real movement rules on a copy, including opening earth plates.
      const result=structuredClone(battle),mover=result.units.find(u=>u.id===actor.id)!;
      if(move(result,mover,visit.hex)&&legalAim(result,mover,'strike',target))return {battle:result,actor:mover,aim:target,visit};
    }
  }
}
