import { tauntTarget,type Battle,type Unit } from './combat';
import { blast,cells,offset,type Hex } from './hex';
import { bodyDistance,occupiedHexes } from './footprint';

export const FLAGSHIP_PARTS=['flagship-port','flagship-starboard','flagship-bridge'] as const;
export type FlagshipPart=typeof FLAGSHIP_PARTS[number];
export const isFlagshipPart=(u:Unit)=>FLAGSHIP_PARTS.some(id=>id===u.id);
export const FLAGSHIP_FOOTPRINT:Hex[]=[{q:0,r:0},{q:-1,r:1},{q:0,r:1}];
type Intent=NonNullable<Unit['intent']>&{baseCells:Hex[];baseName:string};
export const flagshipPart=(b:Battle,id:FlagshipPart)=>b.units.find(u=>u.id===id)!;

export function configureFlagship(b:Battle){
  const enemies=b.units.filter(u=>u.side==='enemy');
  for(const [i,u]of enemies.entries()){
    if(i<3)Object.assign(u,{id:FLAGSHIP_PARTS[i],kind:'flagship-part',role:i===2?'Armored command bridge':'Independent gun emplacement',armor:i===2?3:2,anchored:true,movement:0,footprint:FLAGSHIP_FOOTPRINT.map(h=>({...h})),abilities:['judgment','strike']});
    else Object.assign(u,{id:`flagship-marine-${i-2}`,kind:'knight',appearance:'flagship-marine',role:'Boarding party',armor:2,speed:5,abilities:['strike','bash']});
  }
  const heroes=b.units.filter(u=>u.side==='party');
  heroes.forEach((u,i)=>{u.hex=offset(heroes.length===3?[3,5,7][i]:heroes.length===2?[4,6][i]:5,6);});
}

/** Independent components: dead guns stay down; the bridge's fall ends the boarding. */
export function prepareFlagship(b:Battle){
  const bridge=b.units.find(u=>u.id==='flagship-bridge');
  if(!bridge||b.result)return;
  if(bridge.hp<=0){
    if(!b.units.some(u=>u.side==='party'&&u.hp>0)){b.result='defeat';return;}
    for(const u of b.units)if(u.side==='enemy')u.hp=0;
    b.queue=b.queue.filter(id=>b.units.some(u=>u.id===id&&u.hp>0));
    b.result='victory';b.log.push('The bridge falls silent. The boarding marines lay down their weapons.');return;
  }
  const sealed=FLAGSHIP_PARTS.slice(0,2).some(id=>flagshipPart(b,id).hp>0);
  if(bridge.sealed&&!sealed)b.log.push('Both batteries are down. The command bridge is exposed.');
  bridge.sealed=sealed;
  for(const id of FLAGSHIP_PARTS){
    const u=flagshipPart(b,id);if(u.hp<=0){delete u.intent;continue;}
    let intent=u.intent as Intent|undefined;
    if(intent?.round!==b.round){
      let warning:Hex[],name:string,power:number;
      const heroes=b.units.filter(v=>v.side==='party'&&v.hp>0);
      const target=id==='flagship-bridge'?heroes[(b.round-1)%heroes.length]:[...heroes].sort((a,z)=>bodyDistance(u,a)-bodyDistance(u,z)||a.id.localeCompare(z.id))[0];
      const aim=target?.hex??offset(5,5);
      if(id==='flagship-bridge'){
        warning=sealed?blast(aim):cells().filter(h=>h.r===aim.r||(b.round%2?h.q===aim.q:h.q+h.r===aim.q+aim.r));
        name=sealed?'Command mortar':'Emergency broadside';power=sealed?14:23;
      }else{
        warning=b.round%2===1?cells().filter(h=>id==='flagship-port'?h.q===aim.q:h.q+h.r===aim.q+aim.r):blast(aim);
        name=b.round%2===1?'Raking cannon':'Deck bombardment';power=19;
      }
      intent={round:b.round,name,cells:warning,power,phase:sealed?'Batteries active':'Bridge exposed',baseCells:warning,baseName:name};u.intent=intent;
    }
    const forced=tauntTarget(b,u);
    intent.cells=forced?occupiedHexes(forced):intent.baseCells;
    intent.name=forced?`Cannon on ${forced.name}`:intent.baseName;
  }
}
