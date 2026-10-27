import {active,cast,damage,defend,enemyTurn,legalAim,move,movement,movementOnly,targets,type Battle,type AbilityId} from '../rules/combat';
import {rallyValue} from './rally-value';
import {abilityFor} from '../rules/skills';
import {teamStatus} from '../rules/combat-tactics';
import {cells,distance,equal,type Hex} from '../rules/hex';
import {CONSUMABLES} from '../rules/consumables';
import {decideBattle,type Decision} from './tactics';

export type Plan={pos:Hex;ability?:AbilityId;aim?:Hex;merit:number};
/** Conservative exposure estimate: pending enemies act without intervening
 * allied attacks. Uses real enemy choices, including reach, cover and Taunt.
 * This is a bounded planning copy, never a campaign turn or reward. */
export function enemyForecast(source:Battle):Battle{
 const b=structuredClone(source);if(b.result)return b;
 const pending=b.queue.filter(id=>b.units.some(u=>u.id===id&&u.side==='enemy'&&u.hp>0));
 const sentinel=b.units.find(u=>u.side==='party'&&u.hp>0&& !b.units.some(v=>v.tauntedBy===u.id))??b.units.find(u=>u.side==='party'&&u.hp>0);
 if(!sentinel)return b;
 const first=active(b)?.id;b.queue=[...pending,sentinel.id];
 if(pending[0]&&pending[0]!==first){const u=active(b)!;u.moved=false;u.defending=false;u.bonusUsed=false;u.focus=Math.min(6,u.focus+1);}
 for(let n=0;n<20&&!b.result&&active(b)?.side==='enemy';n++)enemyTurn(b);
 return b;
}
export function healthValue(b:Battle){
 return b.units.filter(u=>u.side==='party').reduce((sum,u)=>sum+u.hp-Math.max(0,u.maxHp*.4-u.hp)*2-(u.hp<=0?150:0),0);
}
/** Shortlist distinct affected groups per skill and movement choice. */
export function candidatePlans(source:Battle,alternatives=1):Plan[]{
 const original=active(source)!;
 const b=structuredClone(source),u=active(b)!,plans=new Map<string,(Plan&{signature?:string})[]>();
 for(const visit of movement(b,u).values()){
  u.hex=visit.hex;
  for(const ability of u.abilities)for(const aim of cells()){
   if(!legalAim(b,u,ability,aim))continue;
   const partner=teamStatus(b,u,ability).partner,a=abilityFor(u,ability,partner);
   let merit=a.effect==='rally'?rallyValue(b,u)*2:0;
   for(const v of targets(b,u,ability,aim)){
    const amount=damage(u,v,ability,partner);
    if(a.effect==='rally')continue;
    if(a.heal||a.effect==='guard'||a.effect==='focus')merit+=amount;
    else if(a.effect==='taunt'||a.effect==='shove')merit+=1;
    else if(a.effect==='weaken')merit+=v.dazzledAttacks?0:10;
    else merit+=(v.side===u.side?-4:1)*(Math.min(v.hp,amount)+(v.hp<=amount?15:0));
   }
   // Keep one stationary and one moving option per ability. Cheap ranged
   // attacks prefer distance on ties, giving the forecast a retreat candidate.
   const enemies=b.units.filter(v=>v.side==='enemy'&&v.hp>0);
   merit-=visit.cost*.1;merit+=Math.min(4,...enemies.map(v=>distance(v.hex,u.hex)))*.15;
   const group=ability+(equal(visit.hex,original.hex)?':stay':':move');
   const choices=plans.get(group)??[];
   // Preserve distinct affected fighters, not several equivalent empty aims.
   const signature=targets(b,u,ability,aim).map(v=>v.id).sort().join(',');
   const old=choices.findIndex(p=>p.signature===signature);
   if(old<0||merit>choices[old].merit){
    if(old>=0)choices.splice(old,1);
    choices.push({pos:{...visit.hex},ability,aim,merit,signature});
    choices.sort((a,z)=>z.merit-a.merit);plans.set(group,choices.slice(0,alternatives));
   }
  }
  plans.set('defend:'+visit.hex.q+','+visit.hex.r,[{pos:{...visit.hex},merit:0}]);
 }
 return [...plans.values()].flat();
}

/** Shortlist attacks/support by immediate utility, then compare their real
 * retaliation and next enemy-phase exposure. Movement remains its own action. */
export function decideDefensively(source:Battle,frugal=false):Decision{
 const fallback=decideBattle(source),original=active(source)!;
 // Earth-plate assignments remain authoritative until the puzzle opens.
 if(source.grounding&&!source.grounding.open)return fallback;
 const baseHealth=healthValue(source),baseExposure=healthValue(enemyForecast(source));
 if(movementOnly(source,original)){
  let best:Hex|undefined,value=baseExposure;
  for(const visit of movement(source,original).values()){
   if(equal(visit.hex,original.hex))continue;
   const b=structuredClone(source);move(b,active(b)!,visit.hex);
   const score=healthValue(enemyForecast(b))-.1*visit.cost;
   if(score>value){value=score;best=visit.hex;}
  }
  return best?{kind:'move',hex:best}:{kind:'end'};
 }
 let best:Plan|undefined,bestScore=-Infinity;
 for(const plan of candidatePlans(source)){
  const trial=structuredClone(source),actor=active(trial)!;
  if(!equal(plan.pos,actor.hex)&&!move(trial,actor,plan.pos))continue;
  const partner=plan.ability?teamStatus(trial,actor,plan.ability).partner:undefined;
  const preparation=plan.ability==='rally'?rallyValue(trial,actor):0;
  if(plan.ability?!cast(trial,actor,plan.ability,plan.aim!):!defend(trial))continue;
  const future=enemyForecast(trial);
  let offense=0;
  for(const v of source.units.filter(v=>v.side==='enemy')){const after=trial.units.find(w=>w.id===v.id)!;offense+=v.hp-after.hp+(v.hp>0&&after.hp<=0?15:0);}
  const a=plan.ability&&abilityFor(original,plan.ability,partner);
  const itemCost=a&&a.item?CONSUMABLES[a.item].cost*(frugal?.7:.25):0;
  const focusSpent=source.units.filter(v=>v.side==='party').reduce((sum,v)=>sum+Math.max(0,v.focus-trial.units.find(w=>w.id===v.id)!.focus),0);
  const protection=healthValue(future)-baseExposure;
  const healing=healthValue(trial)-baseHealth;
  // A team move costs a second main action. A bonus bash leaves the main
  // action available; avoid free shoves that achieve no tactical improvement.
  const focusGain=trial.units.filter(v=>v.side==='party').reduce((sum,v)=>sum+Math.max(0,v.focus-source.units.find(w=>w.id===v.id)!.focus),0);
  let score=offense*(partner?.65:1)+protection*.8+healing*.2-focusSpent*.8-itemCost+focusGain*1.5+preparation*2-distance(original.hex,plan.pos)*.15;
  if(a&&a.bonus&&protection<=0)score-=10;
  if(trial.result==='victory')score+=1000;
  if(score>bestScore){bestScore=score;best=plan;}
 }
 if(!best)return fallback;
 // Do not idle out of reach merely because Defend restores focus.
 if(!best.ability&&bestScore<=2&&fallback.kind==='move')return fallback;
 return !equal(best.pos,original.hex)?{kind:'move',hex:best.pos}:best.ability?{kind:'cast',ability:best.ability,hex:best.aim!}:{kind:'defend'};
}
