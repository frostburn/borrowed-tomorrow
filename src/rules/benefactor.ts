import type {Battle,Unit} from './combat';
import {blast,cells,column,distance,key,offset,type Hex} from './hex';
import {occupiedHexes} from './footprint';
export const BENEFACTOR_ID='benefactor';
export const benefactorUnit=(b:Battle)=>b.units.find(u=>u.id===BENEFACTOR_ID);
type Intent=NonNullable<Unit['intent']>&{baseCells:Hex[];baseName:string};
export function configureBenefactor(b:Battle,form:0|1|2){
 const core=b.units.find(u=>u.side==='enemy')!;
 const radius=form===2?1:2;
 const footprint:Hex[]=cells().map(h=>({q:column(h)-radius,r:h.r-radius})).filter(h=>distance(h,{q:0,r:0})<=radius);
 Object.assign(core,{id:BENEFACTOR_ID,kind:BENEFACTOR_ID,anchored:true,flying:true,movement:0,speed:3,armor:form===0?3:form===1?1:0,footprint,abilities:['judgment']});
 b.benefactor={form};
 const heroes=b.units.filter(u=>u.side==='party');heroes.forEach((u,i)=>{u.hex=offset(heroes.length===3?[3,5,7][i]:heroes.length===2?[4,6][i]:5,6);});
}
/** Every warning is fixed at the round announcement. Taunt redirects actual cells. */
export function prepareBenefactor(b:Battle){
 const core=benefactorUnit(b);if(!b.benefactor||!core||core.hp<=0||b.result)return;
 let intent=core.intent as Intent|undefined;
 if(intent?.round!==b.round){
  const form=b.benefactor.form,pattern=(b.round-1)%4,occupied=new Set(occupiedHexes(core).map(key));
  let baseCells:Hex[],baseName:string,power:number;
  if(form===0){
   baseCells=pattern===0?cells().filter(h=>h.r>=3&&column(h)<=4):pattern===1?cells().filter(h=>h.r>=3&&column(h)>=6):pattern===2?cells().filter(h=>h.r>=3&&(column(h)===5||h.r===5)):[];
   baseName=['The western hand','The eastern hand','The claim closes','The empty channels'][pattern];power=pattern===3?0:24;
  }else if(form===1){
   baseCells=pattern===0?cells().filter(h=>h.r>=3&&[2,3,7,8].includes(column(h))):pattern===1?cells().filter(h=>h.r>=3&&[4,5,6].includes(column(h))):pattern===2?cells().filter(h=>h.r===4||h.r===6):[];
   baseName=['Unfolding rays','The black meridian','A broken horizon','The ring opens'][pattern];power=pattern===3?0:26;
  }else{
   const heroes=b.units.filter(u=>u.side==='party'&&u.hp>0);
   baseCells=pattern===0?heroes.flatMap(u=>blast(u.hex)):pattern===1?cells().filter(h=>h.r===3||h.r===5):pattern===2?cells().filter(h=>h.r>=3&&[2,5,8].includes(column(h))):[];
   baseName=['The last taking','A failing pulse','Three broken rays','The unborrowed hour'][pattern];power=pattern===3?0:23;
  }
  const seen=new Set<string>();baseCells=baseCells.filter(h=>{const id=key(h);if(occupied.has(id)||seen.has(id))return false;seen.add(id);return true;});
  intent={round:b.round,name:baseName,baseName,cells:baseCells,baseCells,power,phase:power===0?'No attack · the source cannot refill':form===0?'The three streams are severed':form===1?'The hollow sun · watch the marked lanes':'The exposed heart · the fragment is returned'};core.intent=intent;
 }
 const forced=b.units.find(u=>u.side==='party'&&u.hp>0&&u.id===core.tauntedBy);
 intent.cells=forced&&intent.power>0?occupiedHexes(forced):intent.baseCells;intent.name=forced&&intent.power>0?`${intent.baseName} on ${forced.name}`:intent.baseName;
 core.role=intent.phase;
}
