import { active, cast, createBattle, enemyTurn, tauntTarget, type Battle, type Encounter, type Unit } from '../rules/combat';
import { blast, cells, column, offset, type Hex } from '../rules/hex';
import { occupiedHexes } from '../rules/footprint';
import { characterProfiles, defaultBuild, newCharacterSettings, COMPANION_IDS, type CharacterProfile, type CompanionId } from '../rules/characters';
import type { EquipmentBonuses } from '../rules/inventory';
import { newGame } from '../rules/state';

export const FLAGSHIP_PARTS=['flagship-port','flagship-starboard','flagship-bridge'] as const;
export type FlagshipPart=typeof FLAGSHIP_PARTS[number];
export const isFlagshipPart=(u:Unit)=>FLAGSHIP_PARTS.some(id=>id===u.id);
export const FLAGSHIP_FOOTPRINT:Hex[]=[{q:0,r:0},{q:-1,r:1},{q:0,r:1}];
export const FLAGSHIP_ENCOUNTER:Encounter={
  id:'dev-flagship',name:'Alban’s flagship · boss preview',music:'flagship',flag:'devFlagship',xp:0,coins:0,rocks:[],
  enemies:[
    {kind:'guardian',col:2,row:2,hp:100,bonus:0,name:'Port battery'},
    {kind:'guardian',col:8,row:2,hp:100,bonus:0,name:'Starboard battery'},
    {kind:'guardian',col:5,row:1,hp:240,bonus:0,name:'Command bridge',sealed:true},
    {kind:'knight',col:2,row:4,hp:58,bonus:5,name:'Boarding marine'},
    {kind:'knight',col:8,row:4,hp:58,bonus:5,name:'Boarding marine'},
  ],
};
type Intent=NonNullable<Unit['intent']>&{baseCells:Hex[];baseName:string};
export const flagshipPart=(b:Battle,id:FlagshipPart)=>b.units.find(u=>u.id===id)!;

export function createFlagshipBattle(profiles?:Record<CompanionId,CharacterProfile>,equipment?:Record<CompanionId,EquipmentBonuses>,party?:readonly CompanionId[],exposed=false){
  if(!profiles){const settings=newCharacterSettings();for(const id of COMPANION_IDS)settings.characters[id]=defaultBuild(id,10);profiles=characterProfiles(settings);}
  const state=newGame();state.bandages=12;
  const b=createBattle(FLAGSHIP_ENCOUNTER,state,equipment,profiles,party??['nell','orrin','petra']);
  const enemies=b.units.filter(u=>u.side==='enemy');
  for(const [i,u]of enemies.entries()){
    const oldId=u.id;
    if(i<3)Object.assign(u,{id:FLAGSHIP_PARTS[i],kind:'flagship-part',role:i===2?'Armored command bridge':'Independent gun emplacement',armor:i===2?3:2,anchored:true,movement:0,footprint:FLAGSHIP_FOOTPRINT.map(h=>({...h})),abilities:['judgment','strike']});
    else Object.assign(u,{id:`flagship-marine-${i-2}`,kind:'knight',appearance:'flagship-marine',role:'Boarding party',armor:2,speed:5,abilities:['strike','bash']});
    b.queue=b.queue.map(id=>id===oldId?u.id:id);
  }
  const heroes=b.units.filter(u=>u.side==='party');
  heroes.forEach((u,i)=>{u.hex=offset(heroes.length===3?[3,5,7][i]:heroes.length===2?[4,6][i]:5,6);});
  if(exposed){for(const id of FLAGSHIP_PARTS.slice(0,2))flagshipPart(b,id).hp=0;b.queue=b.queue.filter(id=>b.units.find(u=>u.id===id)!.hp>0);}
  prepareFlagship(b);return b;
}

/** Preview-only components: dead guns stay down; the bridge's fall ends the boarding. */
export function prepareFlagship(b:Battle){
  if(b.result)return;
  const bridge=flagshipPart(b,'flagship-bridge');
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
      if(id==='flagship-bridge'){
        warning=sealed?blast(offset(5,5)):cells().filter(h=>h.r===5);
        name=sealed?'Command mortar':'Emergency broadside';power=sealed?14:23;
      }else{
        const col=id==='flagship-port'?3:7;
        warning=b.round%2===1?cells().filter(h=>h.r>=4&&column(h)===col):blast(offset(col,5));
        name=b.round%2===1?'Raking cannon':'Deck bombardment';power=19;
      }
      intent={round:b.round,name,cells:warning,power,phase:sealed?'Batteries active':'Bridge exposed',baseCells:warning,baseName:name};u.intent=intent;
    }
    const forced=tauntTarget(b,u);
    intent.cells=forced?occupiedHexes(forced):intent.baseCells;
    intent.name=forced?`Cannon on ${forced.name}`:intent.baseName;
  }
}

export const flagshipTurn:typeof enemyTurn=(b,onRetaliation,onAction)=>{
  prepareFlagship(b);if(b.result)return;
  const u=active(b);if(!u||!isFlagshipPart(u))return enemyTurn(b,onRetaliation,onAction);
  const aim={...u.hex};
  if(cast(b,u,'judgment',aim,onRetaliation)){onAction?.('judgment',aim);return 'judgment';}
};
