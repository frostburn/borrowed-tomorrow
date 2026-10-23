import type { Battle,Unit } from './combat';
import { cells,column,equal,offset,type Hex } from './hex';
import { occupiedHexes } from './footprint';
export const EMPEROR_ID='imperial-vessel',LIGHTBEARER_ID='lightbearer';
export const imperialCore=(b:Battle)=>b.units.find(u=>u.id===EMPEROR_ID||u.id===LIGHTBEARER_ID);
export const imperialSupports=(b:Battle)=>b.units.filter(u=>u.id==='imperial-west'||u.id==='imperial-east');
const body=[{q:-1,r:0},{q:0,r:0},{q:1,r:0},{q:-1,r:1},{q:0,r:1},{q:1,r:1},{q:0,r:2}];
type Intent=NonNullable<Unit['intent']>&{baseCells:Hex[];baseName:string;pattern:number};
export function configureImperial(b:Battle,lightbearer=false){
 const core=b.units.find(u=>u.appearance===(lightbearer?LIGHTBEARER_ID:EMPEROR_ID))!;
 Object.assign(core,{id:lightbearer?LIGHTBEARER_ID:EMPEROR_ID,kind:lightbearer?LIGHTBEARER_ID:EMPEROR_ID,anchored:true,flying:lightbearer,movement:0,speed:3,armor:lightbearer?3:4,abilities:['judgment'],footprint:body});
 if(!lightbearer)for(const [i,part]of b.units.filter(u=>u.appearance==='imperial-support').entries())Object.assign(part,{id:i?'imperial-east':'imperial-west',kind:'imperial-support',anchored:true,passive:true,movement:0,armor:3,abilities:[],footprint:[{q:0,r:0},{q:-1,r:1},{q:0,r:1}]});
 const heroes=b.units.filter(u=>u.side==='party');heroes.forEach((u,i)=>{u.hex=offset(heroes.length===3?[3,5,7][i]:heroes.length===2?[4,6][i]:5,6);});
 b.imperial={};
}
/** Announcements stay fixed within the round; Taunt alone redirects their actual cells. */
export function prepareImperial(b:Battle){
 const core=imperialCore(b);if(!core||b.result)return;
 const light=core.id===LIGHTBEARER_ID,parts=imperialSupports(b),state=b.imperial!;
 if(core.hp<=0){for(const p of parts)p.hp=0;return;}
 if(!light){
  if(parts.every(p=>p.hp<=0)&&state.openedRound===undefined)state.openedRound=b.round;
  const coronation=(b.round-1)%4===0;
  if(coronation&&state.openedRound!==undefined&&b.round>=state.openedRound+2){
   for(const p of parts)if(p.hp<=0&&!b.units.some(u=>u.side==='party'&&u.hp>0&&occupiedHexes(u).some(h=>occupiedHexes(p).some(t=>equal(h,t)))))p.hp=Math.ceil(p.maxHp/2);
   if(parts.some(p=>p.hp>0)){delete state.openedRound;b.log.push('The vacant crown supports rebuild at half strength.');}
  }
  core.sealed=parts.some(p=>p.hp>0);core.armor=core.sealed?4:1;
  for(const p of parts)p.role=p.hp>0?'Crown support · shields the vessel':'Broken support · vacant contacts may rebuild';
 }
 let intent=core.intent as Intent|undefined;
 if(intent?.round!==b.round){
  const pattern=(b.round-1)%4;
  let baseCells:Hex[],baseName:string,power:number,phase:string;
  if(light){
   baseCells=pattern===0?cells().filter(h=>h.r>=3&&Math.abs(column(h)-5)<=Math.floor((h.r-1)/2)):pattern===1?cells().filter(h=>h.r>=3&&(column(h)===2||column(h)===8)):pattern===2?cells().filter(h=>h.r>=3&&(column(h)===5||h.r===5)):[];
   baseName=['Lantern fan','Parting light','The empty crossing','The lantern closes'][pattern];power=pattern===3?0:pattern===2?23:19;
   phase=pattern===3?'Nell holds the lantern shut · no attack · mantle exposed':'Watch the exact marked light; the next shape is fixed for this round';
  }else{
   baseCells=pattern===0?cells().filter(h=>h.r>=3&&column(h)>=2&&column(h)<=4):pattern===1?cells().filter(h=>h.r>=3&&column(h)>=6&&column(h)<=8):pattern===2?cells().filter(h=>h.r===4):[];
   baseName=['Western coronation','Eastern coronation','The procession returns','An unwritten hour'][pattern];power=pattern===3?0:pattern===2?18:21;
   phase=pattern===3?'No attack · the next coronation may rebuild vacant supports':core.sealed?'Break both supports to expose the vessel':'The vessel is exposed · rebuilding waits for a later coronation';
  }
  intent={round:b.round,name:baseName,baseName,cells:baseCells,baseCells,pattern,power,phase};core.intent=intent;
 }
 const forced=b.units.find(u=>u.side==='party'&&u.hp>0&&u.id===core.tauntedBy);
 intent.cells=forced&&intent.power>0?occupiedHexes(forced):intent.baseCells;intent.name=forced&&intent.power>0?`${intent.baseName} on ${forced.name}`:intent.baseName;
 if(light)core.armor=intent.pattern===3?0:3;
 core.role=light?intent.pattern===3?'The lantern is closed · exposed':'Seven contacts · one bound companion':core.sealed?'Shielded by the crown supports':'Exposed imperial vessel';
}
