import { active,alive,cast,tauntTarget,movement,type Battle,type Encounter,type Unit } from './combat';
import { blast,cells,column,distance,equal,offset } from './hex';
import { occupiedHexes } from './footprint';
export const COMMANDER_ID='dawn-commander',SPOTTER_ID='dawn-spotter';
type Intent=NonNullable<Unit['intent']>&{baseCells:Unit['hex'][];baseName:string};
export function configureDawnwatch(b:Battle,e:Encounter){
 if(e.gunSupport){
  const spotter=b.units.find(u=>u.appearance==='dawn-gunner')!;
  Object.assign(spotter,{id:SPOTTER_ID,kind:`${e.gunSupport}-spotter`,role:`${e.gunSupport==='mortar'?'Mortar blast':'Repeater lane'} support · defeat the spotter to stop it`,abilities:['judgment'],movement:0,armor:1});
 }
 if(e.boss==='dawnwatch'){
  const commander=b.units.find(u=>u.appearance==='aurel')!;
  Object.assign(commander,{id:COMMANDER_ID,kind:COMMANDER_ID,role:'Orders shields forward each turn · Taunt interrupts orders',armor:4,speed:5,movement:3,abilities:['strike','sweep','crush']});
 }
 for(const guard of b.units.filter(u=>u.appearance==='dawn-soldier'))Object.assign(guard,{kind:'dawn-shield',name:'Dawnwatch shield soldier',armor:3,speed:4,movement:3,abilities:['strike']});
}
/** Support fire is fixed for the round, defeatable, and follows ordinary Taunt/Dazzle rules. */
export function prepareDawnwatch(b:Battle){
 const spotter=b.units.find(u=>u.id===SPOTTER_ID&&u.hp>0);if(!spotter||b.result)return;
 let intent=spotter.intent as Intent|undefined;
 if(intent?.round!==b.round){
  const mortar=spotter.kind==='mortar-spotter',col=[2,5,8][(b.round-1)%3];
  const warning=mortar?blast(offset(col,3)):cells().filter(h=>column(h)===col);
  const name=mortar?'Western mortar · blast':'Eastern repeater · firing lane';
  intent={round:b.round,name,baseName:name,cells:warning,baseCells:warning,power:mortar?17:14,phase:'Cross-terrace support'};spotter.intent=intent;
 }
 const forced=tauntTarget(b,spotter);intent.cells=forced?occupiedHexes(forced):intent.baseCells;intent.name=forced?`Support fire on ${forced.name}`:intent.baseName;
}
export function spotterTurn(b:Battle,onRetaliation?:(id:string)=>void,onAction?:(id:'judgment',aim:Unit['hex'])=>void){
 const u=active(b);if(u?.id!==SPOTTER_ID)return;
 prepareDawnwatch(b);const aim={...u.hex};if(cast(b,u,'judgment',aim,onRetaliation)){onAction?.('judgment',aim);return 'judgment' as const;}
}
/** A legal one-hex shield advance. Each order happens before the commander's main attack.
 * Taunting him consumes his attention instead; dead or blocked troops never teleport. */
export function orderShields(b:Battle,u:Unit){
 if(u.id!==COMMANDER_ID||u.moved||tauntTarget(b,u))return;
 const heroes=alive(b).filter(v=>v.side==='party');
 for(const guard of alive(b).filter(v=>v.kind==='dawn-shield')){
  const score=(h:Unit['hex'])=>Math.min(...heroes.map(v=>distance(h,v.hex)));
  const best=[...movement(b,{...guard,moved:false,movement:1}).values()].sort((a,z)=>score(a.hex)-score(z.hex)||a.cost-z.cost)[0];
  if(best&&!equal(best.hex,guard.hex)&&score(best.hex)<score(guard.hex))guard.hex={...best.hex};
  guard.guard=Math.max(guard.guard??0,6);
 }
 b.log.push('Aurel orders the shields forward one hex. The soldiers brace for 6 guard. Taunt him to interrupt the next order.');
}
