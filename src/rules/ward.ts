import type { Battle,Unit } from './combat';
import { cells,column,offset,type Hex } from './hex';
import { occupiedHexes } from './footprint';
export const WARD_ID='wind-ward-engine';
export const wardUnit=(b:Battle)=>b.units.find(u=>u.id===WARD_ID);
export const wardMirrors=(b:Battle)=>b.units.filter(u=>u.kind==='ward-projection');
type Intent=NonNullable<Unit['intent']>&{baseCells:Hex[];baseName:string};
export function configureWard(b:Battle){
 const core=b.units.find(u=>u.appearance==='ward-engine')!;
 Object.assign(core,{id:WARD_ID,kind:WARD_ID,role:'Break the lit projection to open the core',anchored:true,movement:0,armor:3,speed:2,abilities:['refraction'],footprint:[{q:0,r:0},{q:-1,r:1},{q:0,r:1}]});
 for(const mirror of b.units.filter(u=>u.appearance==='ward-reflector'))Object.assign(mirror,{kind:'ward-projection',role:'Fixed projection · no turns or retaliation',anchored:true,passive:true,movement:0,armor:1,abilities:[]});
 const heroes=b.units.filter(u=>u.side==='party');heroes.forEach((u,i)=>{u.hex=offset(heroes.length===3?[3,5,7][i]:heroes.length===2?[4,6][i]:5,6);});
}
/** Fixed-round optical circuit. A broken live source cannot be revived by Taunt.
 * All projections stop with the core, including when an area hits several contacts. */
export function prepareWard(b:Battle){
 const core=wardUnit(b);if(!core||b.result)return;
 const mirrors=wardMirrors(b);
 if(core.hp<=0){for(const u of mirrors)u.hp=0;return;}
 let intent=core.intent as Intent|undefined;
 if(intent?.round!==b.round){
  const living=mirrors.filter(u=>u.hp>0),source=living.length?living[(b.round-1)%living.length]:undefined;
  const left=source&&column(source.hex)<5;
  const warning=source?cells().filter(h=>h.r>=4&&Math.abs(column(h)-(left?2:8))<=h.r-3):cells().filter(h=>h.r===4);
  const name=source?`${left?'West':'East'} mirror · reflected fan`:'Unshielded lens · crossbeam';
  intent={round:b.round,name,baseName:name,phase:source?'Reflected light':'Exposed core',via:source?.id,cells:warning,baseCells:warning,power:source?21:14};core.intent=intent;
 }
 const source=mirrors.find(u=>u.id===intent.via),broken=!!source&&source.hp<=0;
 core.sealed=!!source&&!broken;
 const forced=b.units.find(u=>u.hp>0&&u.side==='party'&&u.id===core.tauntedBy);
 intent.cells=broken?[]:forced?occupiedHexes(forced):intent.baseCells;
 intent.name=broken?'Projection broken · beam interrupted':forced?`Reflected light on ${forced.name}`:intent.baseName;
 for(const u of mirrors)u.role=u.id===intent.via&&u.hp>0?'Lit projection · break to cancel this beam and open the core':'Unlit projection · no turns or retaliation';
}
