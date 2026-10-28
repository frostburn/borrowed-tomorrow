import type {Battle,Unit} from '../rules/combat';
import {occupiedHexes} from '../rules/footprint';
import {distance} from '../rules/hex';
import {EMPEROR_ID,imperialCore,imperialSupports} from '../rules/imperial-vessel';

/** Value the rebuilding HP prevented by holding broken crown mountings. Match
 * distinct living heroes to contacts; proximity also gives a multi-turn route
 * toward them. Ordinary damage, survival and a winning blow still compete. */
export function imperialMountingValue(b:Battle):number {
 const core=imperialCore(b);if(core?.id!==EMPEROR_ID||core.hp<=0)return 0;
 const broken=imperialSupports(b).filter(u=>u.hp<=0),heroes=b.units.filter(u=>u.side==='party'&&u.hp>0);
 function assign(index:number,available:Unit[]):number {
  if(index===broken.length||!available.length)return 0;
  const part=broken[index];
  return Math.max(assign(index+1,available),...available.map(u=>{
   const d=Math.min(...occupiedHexes(part).flatMap(h=>occupiedHexes(u).map(at=>distance(h,at))));
   const value=Math.ceil(part.maxHp/2)*(d===0?1:Math.max(0,.5-d*.1));
   return value+assign(index+1,available.filter(v=>v!==u));
  }));
 }
 return assign(0,heroes);
}
