import {active,damage,legalAim,movement,movementOnly,targets,type AbilityId,type Battle,type Unit} from '../rules/combat';
import {teamStatus} from '../rules/combat-tactics';
import {abilityFor} from '../rules/skills';
import {occupiedHexes} from '../rules/footprint';
import {cells,distance,equal,key,type Hex} from '../rules/hex';

export type Decision={kind:'move';hex:Hex}|{kind:'cast';ability:AbilityId;hex:Hex}|{kind:'defend'|'end'};

/** A small deterministic player policy, not a second combat resolver. Planning
 * uses a private copy; only the session may commit a move or attack. */
export function decideBattle(source:Battle):Decision{
 const b=structuredClone(source),u=active(b);
 if(!u||u.side!=='party'||b.result)throw Error('Expected a live player turn');
 const original={...u.hex},visits=[...movement(b,u).values()];
 const enemies=b.units.filter(v=>v.side!==u.side&&v.hp>0);
 const risk=(hex:Hex)=>{
  let result=b.vents.has(key(hex))&&!u.flying?6:0;
  for(const v of enemies)if(b.queue.includes(v.id)&&v.intent?.cells.some(h=>equal(h,hex)))result+=Math.max(0,v.intent.power+v.bonus-u.armor);
  return result;
 };
 const safer=()=>visits.filter(v=>risk(v.hex)<risk(original)).sort((a,z)=>risk(a.hex)-risk(z.hex)||a.cost-z.cost)[0];
 if(movementOnly(b,u)){const safe=safer();return safe?{kind:'move',hex:safe.hex}:{kind:'end'};}
 // Match distinct living heroes to the two visible earth plates. A hero already
 // holding a contact stays there until the shared rules release the shield.
 let hold=false;
 if(b.grounding&&!b.grounding.open){
  const heroes=b.units.filter(v=>v.side===u.side&&v.hp>0),plates=b.grounding.plates;
  if(plates.length!==2||heroes.length<2)throw Error('Not enough fighters for the earth plates');
  const assignments=heroes.flatMap(a=>heroes.filter(z=>z!==a).map(z=>({pair:[a,z],cost:distance(a.hex,plates[0])+distance(z.hex,plates[1])}))).sort((a,z)=>a.cost-z.cost);
  const slot=assignments[0].pair.findIndex(v=>v.id===u.id);
  if(slot>=0){
   const target=plates[slot],step=visits.sort((a,z)=>distance(a.hex,target)-distance(z.hex,target)||a.cost-z.cost)[0];
   if(step&&distance(step.hex,target)<distance(original,target))return {kind:'move',hex:step.hex};
   hold=equal(original,target);
  }
 }
 let best:{decision:Decision;score:number}|undefined;
 for(const visit of visits){
  if(hold&&!equal(visit.hex,original))continue;
  u.hex=visit.hex;
  for(const ability of u.abilities)for(const aim of cells()){
   if(!legalAim(b,u,ability,aim))continue;
   const partner=teamStatus(b,u,ability).partner,a=abilityFor(u,ability,partner);
   let benefit=0;
   for(const v of targets(b,u,ability,aim)){
    const amount=damage(u,v,ability,partner);
    if(a.heal)benefit+=amount*(v.hp<v.maxHp*.4?1.3:.85);
    else if(a.effect==='guard')benefit+=amount*.25;
    else if(a.effect==='focus')benefit+=amount*(v.focus<=1?3:1);
    else if(a.effect==='weaken')benefit+=v.dazzledAttacks?0:Math.min(10,v.hp*.15);
    else if(a.effect==='taunt'||a.effect==='shove')continue;
    else benefit+=(v.side===u.side?-4:1)*(Math.min(v.hp,amount)+(v.hp<=amount?10:0));
   }
   if(benefit<=0)continue;
   if(partner)benefit*=.65; // Two main actions, not a free second contribution.
   const score=benefit-visit.path.length*.1-risk(visit.hex)*.65;
   if(!best||score>best.score)best={decision:equal(visit.hex,original)?{kind:'cast',ability,hex:aim}:{kind:'move',hex:visit.hex},score};
  }
 }
 u.hex=original;
 if(best&&best.score>0)return best.decision;
 const safe=!hold&&safer();if(safe)return {kind:'move',hex:safe.hex};
 const nearest=(h:Hex)=>Math.min(...enemies.flatMap(v=>occupiedHexes(v).map(at=>distance(h,at))));
 const step=!hold&&visits.sort((a,z)=>nearest(a.hex)-nearest(z.hex)||risk(a.hex)-risk(z.hex)||a.cost-z.cost)[0];
 if(step&&nearest(step.hex)<nearest(original)&&risk(step.hex)<=risk(original))return {kind:'move',hex:step.hex};
 return {kind:'defend'};
}
export const fighterSnapshot=(units:Unit[])=>units.map(u=>({id:u.id,hp:u.hp,focus:u.focus,hex:{...u.hex},guard:u.guard??0,defending:u.defending}));
