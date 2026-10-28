import {active,cast,defend,endTurn,enemyTurn,move,movementOnly,type Battle} from '../rules/combat';
import {CONSUMABLES} from '../rules/consumables';
import {distance,equal} from '../rules/hex';
import {candidatePlans,decideDefensively,enemyForecast,healthValue,type Plan} from './defensive';
import {decideBattle,type Decision} from './tactics';
import {imperialMountingValue} from './imperial-objectives';

function apply(b:Battle,p:Plan){
 const u=active(b)!;
 if(!equal(p.pos,u.hex)&&!move(b,u,p.pos))return false;
 return p.ability?cast(b,u,p.ability,p.aim!):defend(b);
}
function value(before:Battle,after:Battle,frugal:boolean){
 let score=(healthValue(after)-healthValue(before))*.9+imperialMountingValue(after)-imperialMountingValue(before);
 for(const u of before.units){
  const v=after.units.find(v=>v.id===u.id)!;
  if(u.side==='enemy')score+=u.hp-v.hp+(u.hp>0&&v.hp<=0?15:0);
  else score+=(v.focus-u.focus)*.8;
 }
 const counts=(b:Battle)=>({...b.supplies,bandage:b.bandages});
 const initial=counts(before),final=counts(after);
 for(const id of Object.keys(initial)as (keyof typeof initial)[])score-=(initial[id]-final[id])*CONSUMABLES[id].cost*(frugal?.7:.25);
 if(after.result)score+=after.result==='victory'?1000:-1000;
 return score;
}
/** Resolve the actual initiative through this and the following round. Allies
 * use the fixed greedy policy, enemies the campaign AI. No invented turns,
 * focus ticks or partner discounts: a spent helper really loses its attack.
 * Bonus Bash keeps the actor active and receives its real main-action followup.
 */
export function cooperativeForecast(source:Battle,until=source.round+2):Battle{
 const b=structuredClone(source);
 for(let n=0;n<80&&!b.result&&b.round<until;n++){
  const u=active(b)!;
  if(u.side==='enemy'){enemyTurn(b);continue;}
  const d=decideBattle(b);
  const ok=d.kind==='move'?!!move(b,u,d.hex):d.kind==='cast'?cast(b,u,d.ability,d.hex):d.kind==='end'?endTurn(b):defend(b);
  if(!ok)throw Error('Illegal cooperative forecast action');
 }
 if(!b.result&&b.round<until)throw Error('Cooperative forecast exceeded its turn budget');
 return b;
}
/** Bounded two-round lookahead. Every available skill gets a finalist so cheap
 * immediate damage cannot prune away a useful control/focus/team setup. */
export function decideCooperatively(source:Battle,frugal=false):Decision{
 const u=active(source);
 if(!u||u.side!=='party'||source.result)throw Error('Expected a live player turn');
 if(source.grounding&&!source.grounding.open||movementOnly(source,u))return decideDefensively(source,frugal);
 const bySkill=new Map<string,{plan:Plan;trial:Battle;score:number}>();
 for(const plan of candidatePlans(source,2)){
  const trial=structuredClone(source);if(!apply(trial,plan))continue;
  const score=value(source,enemyForecast(trial),frugal)-distance(u.hex,plan.pos)*.15;
  const id=plan.ability??'defend',old=bySkill.get(id);
  if(!old||score>old.score)bySkill.set(id,{plan,trial,score});
 }
 let best:Plan|undefined,bestScore=-Infinity;
 for(const {plan,trial}of bySkill.values()){
  // Use a common round boundary even when casting itself finishes a round.
  const future=trial.result?trial:cooperativeForecast(trial,source.round+2);
  // Prefer earlier progress when projected endpoints are otherwise similar.
  // In particular, never wait for a later ally to win merely to bank focus.
  const score=value(source,future,frugal)+value(source,trial,frugal)*.05-distance(u.hex,plan.pos)*.15;
  if(score>bestScore){bestScore=score;best=plan;}
 }
 if(!best)return decideDefensively(source,frugal);
 if(!best.ability&&bestScore<=2){const fallback=decideBattle(source);if(fallback.kind==='move')return fallback;}
 return !equal(best.pos,u.hex)?{kind:'move',hex:best.pos}:best.ability?{kind:'cast',ability:best.ability,hex:best.aim!}:{kind:'defend'};
}
