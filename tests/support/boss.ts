import {expect} from 'vitest';
import {active,enemyTurn,type Battle} from '../../src/rules/combat';
import {bossDirectAbility} from '../../src/rules/boss-direct';

/** Keep existing pattern tests checking the main cast after the added shot. */
export function fireBossDirect(b:Battle){
 const u=active(b)!,id=bossDirectAbility(u);
 if(!id||u.bonusUsed||!u.intent?.power||!u.intent.cells.length)return;
 expect(enemyTurn(b)).toBe(id);
 expect(active(b)?.id).toBe(u.id);expect(u.bonusUsed).toBe(true);
}
