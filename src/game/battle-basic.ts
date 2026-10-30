import type {Battle,Unit} from '../rules/combat';
import {movementOnly} from '../rules/combat';
import {occupiedHexes} from '../rules/footprint';
import {equal,type Hex} from '../rules/hex';

/** Pick one ordinary action; never path toward an enemy or spend both allowances. */
export function basicAction(battle:Battle,actor:Unit,hex:Hex):'move'|'strike'{
  if(movementOnly(battle,actor))return 'move';
  const enemy=battle.units.some(u=>u.hp>0&&u.side!==actor.side&&occupiedHexes(u).some(h=>equal(h,hex)));
  const fixture=battle.fixtures?.some(f=>f.hp>0&&equal(f.hex,hex));
  return enemy||fixture?'strike':'move';
}
