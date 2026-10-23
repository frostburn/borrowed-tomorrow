import type { Battle,Unit } from './combat';
import { cells,column,distance,equal,inside,key,neighbors,offset,type Hex } from './hex';
import { occupiedHexes } from './footprint';
export const WINTER_DRAGON_ID='winter-dragon';
export const winterDragon=(b:Battle)=>b.units.find(u=>u.id===WINTER_DRAGON_ID);
type Pattern='inhale'|'west'|'breath'|'east';
type Intent=NonNullable<Unit['intent']>&{pattern:Pattern;baseCells:Hex[];baseName:string};
const unique=(hexes:Hex[])=>[...new Map(hexes.map(h=>[key(h),h])).values()];
export const brokenIce=(b:Battle,h:Hex)=>b.winterIce?.some(p=>equal(p,h))??false;
export function configureWinterDragon(b:Battle){
 const dragon=b.units.find(u=>u.appearance===WINTER_DRAGON_ID)!;
 Object.assign(dragon,{id:WINTER_DRAGON_ID,kind:WINTER_DRAGON_ID,anchored:true,flying:true,movement:0,speed:3,armor:3,abilities:['judgment'],
  footprint:[...Array.from({length:7},(_,i)=>({q:i-3,r:0})),{q:-1,r:1},{q:0,r:1},{q:-1,r:2},{q:0,r:2}]});
 const heroes=b.units.filter(u=>u.side==='party');heroes.forEach((u,i)=>{u.hex=offset(heroes.length===3?[3,5,7][i]:heroes.length===2?[4,6][i]:5,6);});
 b.winterIce=[];
}
export function prepareWinterDragon(b:Battle){
 const dragon=winterDragon(b);if(!dragon||b.result)return;
 if(dragon.hp<=0){b.winterIce=[];return;}
 dragon.role='Eleven contacts · one creature · anchored';
 let intent=dragon.intent as Intent|undefined;
 if(intent?.round!==b.round){
  const pattern:Pattern=(['inhale','west','breath','east']as const)[(b.round-1)%4];
  const baseCells=pattern==='inhale'?cells().filter(h=>h.r>=3&&Math.abs(column(h)-5)<=1+Math.floor((h.r-3)/2)):
   pattern==='breath'?cells().filter(h=>h.r>=3&&column(h)>=4&&column(h)<=6):
   [3,4].flatMap(row=>(pattern==='west'?[2,3]:[7,8]).map(col=>offset(col,row)));
  const baseName=pattern==='inhale'?'Drawn breath':pattern==='breath'?'Winter breath':pattern==='west'?'Shatter the west shelf':'Shatter the east shelf';
  intent={round:b.round,name:baseName,baseName,pattern,baseCells,cells:baseCells,power:pattern==='inhale'?8:pattern==='breath'?23:17,
   phase:pattern==='inhale'?'Inhale · pull one clear hex':pattern==='breath'?'Frost down the central walk':'Ice breaks under the marked shelf'};
  dragon.intent=intent;
 }
 const forced=b.units.find(u=>u.hp>0&&u.side==='party'&&u.id===dragon.tauntedBy);
 intent.cells=forced?occupiedHexes(forced):intent.baseCells;
 intent.name=forced?`${intent.baseName} on ${forced.name}`:intent.baseName;
}
/** Resolve the cells actually fired, before finishing the turn can roll the round. */
export function winterDragonAfterAttack(b:Battle,affected:Hex[]):string[]{
 const dragon=winterDragon(b),intent=dragon?.intent as Intent|undefined,messages:string[]=[];
 if(!dragon||!intent)return messages;
 if(intent.pattern==='west'||intent.pattern==='east'){
  b.winterIce=unique([...(b.winterIce??[]),...affected.filter(inside)]);
  messages.push('The shattered shelf becomes loose ice: two movement per hex, six cold damage at round end.');
 }else if(intent.pattern==='inhale'){
  const marked=new Set(affected.map(key)),mouth=offset(5,2);
  for(const u of b.units.filter(u=>u.side==='party'&&u.hp>0&&!u.anchored&&occupiedHexes(u).some(h=>marked.has(key(h))))){
   const blocked=new Set([...b.obstacles,...b.units.filter(v=>v.hp>0&&v.id!==u.id).flatMap(v=>occupiedHexes(v).map(key))]);
   const destination=neighbors(u.hex).filter(h=>distance(h,mouth)<distance(u.hex,mouth)&&occupiedHexes(u,h).every(p=>inside(p)&&!blocked.has(key(p))))
    .sort((a,z)=>distance(a,mouth)-distance(z,mouth)||a.r-z.r||a.q-z.q)[0];
   if(destination){u.hex=destination;messages.push(`${u.name} is drawn one hex toward the dragon.`);}
   else messages.push(`${u.name} holds position against the wind.`);
  }
 }
 return messages;
}
