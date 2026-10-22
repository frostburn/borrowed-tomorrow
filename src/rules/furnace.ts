import { cast,move,movement,type AbilityId,type Battle,type Unit } from './combat';
import { cells,column,distance,equal,key,offset,type Hex } from './hex';
import { occupiedHexes } from './footprint';
import { FURNACE_ID,FURNACE_FOOTPRINT } from '../content/chapter-five/furnace';
type Intent=NonNullable<Unit['intent']>&{baseCells:Hex[];baseName:string};
export const furnaceUnit=(b:Battle)=>b.units.find(u=>u.id===FURNACE_ID);
export function configureFurnace(b:Battle){
 const boss=b.units.find(u=>u.side==='enemy')!;
 Object.assign(boss,{id:FURNACE_ID,kind:FURNACE_ID,role:'Mobile casting furnace',armor:4,speed:3,movement:4,footprint:FURNACE_FOOTPRINT.map(h=>({...h})),abilities:['judgment','strike']});
 const heroes=b.units.filter(u=>u.side==='party');
 heroes.forEach((u,i)=>{u.hex=offset(heroes.length===3?[3,5,7][i]:heroes.length===2?[4,6][i]:5,6);});
 b.furnaceHeat=[];
}
/** Once announced, a pour stays fixed until the next round. Taunt redirects it. */
export function prepareFurnace(b:Battle){
 const boss=furnaceUnit(b);if(!boss)return;
 b.furnaceHeat=b.furnaceHeat?.filter(h=>h.untilRound>=b.round)??[];
 b.vents=new Set(b.furnaceHeat.map(h=>key(h.hex)));
 if(boss.hp<=0||b.result)return;
 let intent=boss.intent as Intent|undefined;
 if(intent?.round!==b.round){
  const lane=[7,3,5][(b.round-1)%3],warning=cells().filter(h=>h.r>=4&&Math.abs(column(h)-lane)<=1);
  const name=`Pouring lane ${lane+1}`;
  intent={round:b.round,name,phase:'Casting cycle',cells:warning,baseCells:warning,baseName:name,power:18,destination:offset(lane,2)};boss.intent=intent;
 }
 const forced=b.units.find(u=>u.hp>0&&u.side!==boss.side&&u.id===boss.tauntedBy);
 intent.cells=forced?occupiedHexes(forced):intent.baseCells;
 intent.name=forced?`Pour on ${forced.name}`:intent.baseName;
}
/** Follow a legal whole-body path. Blocked tracks cannot teleport through a hero. */
export function furnaceTurn(b:Battle,onRetaliation?: (id:string)=>void,onAction?: (id:AbilityId,aim:Hex)=>void):AbilityId|undefined{
 const boss=furnaceUnit(b);if(!boss)return;
 prepareFurnace(b);const target=boss.intent!.destination!;
 const visits=[...movement(b,boss).values()].sort((a,z)=>distance(a.hex,target)-distance(z.hex,target)||a.cost-z.cost);
 const best=visits[0];
 if(best&&!equal(best.hex,boss.hex)){
  const trail=[boss.hex,...best.path].flatMap(h=>occupiedHexes(boss,h));
  if(move(b,boss,best.hex)){
   const body=new Set(occupiedHexes(boss).map(key)),heat=new Map((b.furnaceHeat??[]).map(h=>[key(h.hex),h]));
   for(const hex of trail)if(!body.has(key(hex)))heat.set(key(hex),{hex:{...hex},untilRound:b.round+1});
   b.furnaceHeat=[...heat.values()];b.vents=new Set(b.furnaceHeat.map(h=>key(h.hex)));
  }
 }
 const aim={...boss.hex};
 if(cast(b,boss,'judgment',aim,onRetaliation)){onAction?.('judgment',aim);return 'judgment';}
}
