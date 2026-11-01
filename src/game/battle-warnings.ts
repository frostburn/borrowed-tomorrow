import {ABILITIES,active,type AbilityId,type Battle,type Unit} from '../rules/combat';
import {occupiedHexes} from '../rules/footprint';
import {key,type Hex} from '../rules/hex';

/** Pattern attacks cannot hit their source or its allies. Presentation only. */
export function patternDisplayCells(b:Battle,source:Unit,hexes:readonly Hex[]){
 const safe=new Set(b.units.filter(u=>u.side===source.side&&(u.hp>0||u.id===source.id)).flatMap(u=>occupiedHexes(u).map(key)));
 return hexes.filter(h=>!safe.has(key(h)));
}

export function partyWarningStyle(acting:boolean){
 return acting?{color:0xc23842,alpha:.6,stroke:0xff7770,width:3,markerAlpha:1}
  :{color:0x9f6556,alpha:.28,stroke:0xc98a6c,width:2,markerAlpha:.55};
}

export function battleWarnings(b:Battle,attack?:{actorId:string;ability:AbilityId;cells:readonly Hex[]}){
 const pattern=!!attack&&ABILITIES[attack.ability].shape==='pattern';
 const occupied=new Set(b.units.filter(u=>u.hp>0&&u.footprint?.length).flatMap(u=>occupiedHexes(u).map(key)));
 const danger=new Set(b.units.filter(u=>u.hp>0&&u.intent&&!(pattern&&u.id===attack?.actorId)).flatMap(u=>patternDisplayCells(b,u,u.intent!.cells).map(key)));
 const threatenedParty=new Set(b.units.filter(u=>u.side==='party'&&u.hp>0).flatMap(u=>occupiedHexes(u).map(key)).filter(h=>danger.has(h)));
 const actor=active(b),actingDanger=new Set(actor?.side==='party'?occupiedHexes(actor).map(key).filter(h=>danger.has(h)):[]);
 const source=attack&&b.units.find(u=>u.id===attack.actorId);
 const attackCells=new Set((source&&pattern?patternDisplayCells(b,source,attack!.cells):attack?.cells??[]).map(key));
 return {occupied,danger,threatenedParty,actingDanger,attackCells};
}
