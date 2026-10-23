import type { Battle,Unit } from './combat';
import { cells,column,key,line,offset,type Hex } from './hex';
import { occupiedHexes } from './footprint';
export const SUN_SERPENT_ID='sun-serpent';
export const serpentHead=(b:Battle)=>b.units.find(u=>u.id===SUN_SERPENT_ID);
export const serpentCoils=(b:Battle)=>b.units.filter(u=>u.kind==='serpent-coil');
type Intent=NonNullable<Unit['intent']>&{primary:Hex[];glass:Hex[];baseName:string};
const unique=(hexes:Hex[])=>[...new Map(hexes.map(h=>[key(h),h])).values()];
export function configureSerpent(b:Battle){
 const head=b.units.find(u=>u.appearance==='sun-serpent')!;
 Object.assign(head,{id:SUN_SERPENT_ID,kind:SUN_SERPENT_ID,anchored:true,movement:0,speed:3,abilities:['judgment'],footprint:[{q:0,r:0},{q:-1,r:1},{q:0,r:1}]});
 for(const coil of b.units.filter(u=>u.appearance?.startsWith('serpent-')))Object.assign(coil,{id:coil.appearance,kind:'serpent-coil',anchored:true,passive:true,movement:0,abilities:[]});
 const heroes=b.units.filter(u=>u.side==='party');
 heroes.forEach((u,i)=>{u.hex=offset(heroes.length===3?[3,5,7][i]:heroes.length===2?[4,6][i]:5,6);});
}
/** Glass is made by the actual fired pattern, including a redirected breath.
 * Only its next announcement reflects it. It never deals unannounced floor damage. */
export function leaveSunGlass(b:Battle,affected:Hex[]){
 b.sunGlass={round:b.round,cells:unique(affected.filter(h=>h.r===4||h.r===6&&affected.length===1))};
}
export function prepareSerpent(b:Battle){
 const head=serpentHead(b);if(!head||b.result)return;
 const coils=serpentCoils(b);
 if(head.hp<=0){for(const coil of coils)coil.hp=0;return;}
 const living=coils.filter(u=>u.hp>0),loose=living[(b.round-1)%living.length];
 head.armor=1+living.length*3;
 head.role=`Three contacts · ${head.armor} armor · always damageable`;
 for(const coil of coils){coil.sealed=coil.hp>0&&coil!==loose;coil.armor=1;coil.role=coil===loose?'Loose coil · vulnerable · break to stop its reflections':'Tight coil · protected until it loosens';}
 let intent=head.intent as Intent|undefined;
 if(intent?.round!==b.round){
  const phase=(b.round-1)%3,center=phase===0?3:phase===1?7:5;
  const primary=cells().filter(h=>h.r>=3&&Math.abs(column(h)-center)<=(phase===2?1:1+Math.floor((h.r-3)/2)));
  const name=phase===0?'Westward breath':phase===1?'Eastward breath':'Central sun breath';
  intent={round:b.round,name,baseName:name,phase:loose?.appearance==='serpent-west'?'Western coil loose':loose?'Eastern coil loose':'Both coils broken',cells:primary,primary,glass:b.sunGlass?.round===b.round-1?b.sunGlass.cells.map(h=>({...h})):[],power:living.length?24:19};
  head.intent=intent;
 }
 intent.phase=loose?.appearance==='serpent-west'?'Western coil loose':loose?'Eastern coil loose':'Both coils broken';
 const reflections:Hex[]=[];
 for(const side of ['serpent-west','serpent-east']){
  if(!coils.some(u=>u.id===side&&u.hp>0))continue;
  const west=side==='serpent-west',source=intent.glass.find(h=>west?column(h)<5:column(h)>5);
  if(source)reflections.push(...line(source,offset(west?1:9,6)));
 }
 const forced=b.units.find(u=>u.hp>0&&u.side==='party'&&u.id===head.tauntedBy);
 intent.cells=forced?occupiedHexes(forced):unique([...intent.primary,...reflections]);
 intent.name=forced?`Sun breath on ${forced.name}`:`${intent.baseName}${reflections.length?' + glass reflections':''}`;
}
