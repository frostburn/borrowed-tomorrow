import type { Battle, Unit } from './combat';
import { blast, cells, column, key, offset, type Hex } from './hex';
import { occupiedHexes } from './footprint';
import { REGULATOR_ID, REGULATOR_FOOTPRINT } from '../content/chapter-three/regulator';

type Intent=NonNullable<Unit['intent']>&{baseCells:Hex[];baseName:string};
export const regulatorUnit=(b:Battle)=>b.units.find(u=>u.id===REGULATOR_ID)!;

export function configureConduit(b:Battle){
 const boss=b.units.find(u=>u.side==='enemy')!;
 Object.assign(boss,{id:REGULATOR_ID,kind:REGULATOR_ID,role:'Extraction keeper',armor:2,anchored:true,movement:0,footprint:REGULATOR_FOOTPRINT.map(h=>({...h})),abilities:['judgment','strike']});
 const heroes=b.units.filter(u=>u.side==='party');
 heroes.forEach((u,i)=>{u.hex=offset(heroes.length===3?[3,5,7][i]:heroes.length===2?[4,6][i]:5,6);});
}

/** The model owns warnings, including after round changes without a renderer. */
export function prepareConduit(b:Battle){
 const boss=regulatorUnit(b);if(!boss||boss.hp<=0||b.result)return;
 let intent=boss.intent as Intent|undefined;
 if(intent?.round!==b.round){
  const occupied=new Set(occupiedHexes(boss).map(key)),heroes=b.units.filter(u=>u.side==='party'&&u.hp>0);
  let warning:Hex[],name:string;
  if(b.round%3===1){warning=blast(heroes[Math.floor(b.round/3)%heroes.length].hex);name='Pressure lock';}
  else if(b.round%3===2){warning=cells().filter(h=>h.r>=4&&[3,5,7].includes(column(h)));name='Scouring jets';}
  else{warning=cells().filter(h=>h.r===4);name='Crossfeed purge';}
  warning=warning.filter(h=>!occupied.has(key(h)));
  intent={round:b.round,phase:'Pressure cycle',name,cells:warning,power:16,baseCells:warning,baseName:name};boss.intent=intent;
 }
 const forced=b.units.find(u=>u.hp>0&&u.side!==boss.side&&u.id===boss.tauntedBy);
 intent.cells=forced?occupiedHexes(forced):intent.baseCells;
 intent.name=forced?`Pressure lock on ${forced.name}`:intent.baseName;
}
