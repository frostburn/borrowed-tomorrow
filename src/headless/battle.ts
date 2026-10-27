import {active,cast,defend,endTurn,enemyTurn,move,type Battle} from '../rules/combat';
import {decideBattle,fighterSnapshot} from './tactics';
import {decideDefensively} from './defensive';
import {decideCooperatively} from './cooperative';
import type {AgentOptions} from './campaign';

/** Both campaign journeys and controlled probes commit through this resolver. */
export function playBattle(b:Battle,agent:AgentOptions){
 const turns=[];
 for(let n=0;!b.result&&n<600;n++){
  const u=active(b);if(!u)throw Error(`No active fighter in ${b.encounter}`);
  const before=fighterSnapshot(b.units),round=b.round,grounded=b.grounding?.open??false;
  const decision=u.side==='enemy'?{kind:'enemy' as const}:agent.tactics==='legacy'?decideBattle(b):agent.tactics==='cooperative'?decideCooperatively(b,agent.spending==='frugal'):decideDefensively(b,agent.spending==='frugal');
  let accepted=true,enemyAction:ReturnType<typeof enemyTurn>;
  if(decision.kind==='enemy')enemyAction=enemyTurn(b);
  else if(decision.kind==='move')accepted=!!move(b,u,decision.hex);
  else if(decision.kind==='cast')accepted=cast(b,u,decision.ability,decision.hex);
  else accepted=decision.kind==='end'?endTurn(b):defend(b);
  if(!accepted)throw Error(`Rejected ${decision.kind} by ${u.id} in ${b.encounter}`);
  turns.push({actor:u.id,round,decision:decision.kind==='enemy'?{...decision,ability:enemyAction}:decision,before,after:fighterSnapshot(b.units),bandages:b.bandages,supplies:{...b.supplies},groundingOpened:!grounded&&!!b.grounding?.open});
 }
 return turns;
}
