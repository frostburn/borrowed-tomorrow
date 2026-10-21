import { active, cast, createBattle, enemyTurn, tauntTarget, type Battle, type Encounter, type Unit } from '../rules/combat';
import { blast, cells, column, distance, key, offset, type Hex } from '../rules/hex';
import { occupiedHexes } from '../rules/footprint';
import { characterProfiles, defaultBuild, newCharacterSettings, COMPANION_IDS, type CharacterProfile, type CompanionId } from '../rules/characters';
import type { EquipmentBonuses } from '../rules/inventory';
import { newGame } from '../rules/state';

export const BOSS_ID='benefactor';
export const BOSS_ENCOUNTER:Encounter={id:'dev-benefactor',name:'The hollow sun · boss preview',music:'four-warden',flag:'devBenefactor',xp:0,coins:0,rocks:[],enemies:[{kind:'guardian',col:5,row:2,hp:420,bonus:6,name:'The Benefactor'}]};
export const BOSS_FOOTPRINT:Hex[]=Array.from({length:25},(_,i)=>({q:i%5-2,r:Math.floor(i/5)-2})).filter(h=>distance(h,{q:0,r:0})<=2);
type Intent=NonNullable<Unit['intent']>&{baseCells:Hex[];baseName:string};
export const bossUnit=(b:Battle)=>b.units.find(u=>u.id===BOSS_ID)!;

export function createBossBattle(profiles?:Record<CompanionId,CharacterProfile>,equipment?:Record<CompanionId,EquipmentBonuses>,party?:readonly CompanionId[],phaseTwo=false){
  if(!profiles){const settings=newCharacterSettings();for(const id of COMPANION_IDS)settings.characters[id]=defaultBuild(id,10);profiles=characterProfiles(settings);}
  const state=newGame();state.bandages=12;
  const battle=createBattle(BOSS_ENCOUNTER,state,equipment,profiles,party??['nell','petra','celia']);
  const boss=battle.units.find(u=>u.side==='enemy')!,oldId=boss.id;
  Object.assign(boss,{id:BOSS_ID,kind:'benefactor',role:'The hollow sun',armor:3,anchored:true,movement:0,footprint:BOSS_FOOTPRINT.map(h=>({...h})),abilities:['judgment','strike']});
  battle.queue=battle.queue.map(id=>id===oldId?BOSS_ID:id);
  const heroes=battle.units.filter(u=>u.side==='party');
  heroes.forEach((u,i)=>{u.hex=offset(heroes.length===3?[3,5,7][i]:heroes.length===2?[4,6][i]:5,6);});
  if(phaseTwo)boss.hp=boss.maxHp/2;
  prepareBoss(battle);return battle;
}

export function prepareBoss(b:Battle){
  const boss=bossUnit(b);if(!boss||boss.hp<=0||b.result)return;
  let intent=boss.intent as Intent|undefined;
  if(intent?.round!==b.round){
    const second=boss.hp<=boss.maxHp/2,phase=second?'The hollow heart':'Borrowed light';
    const heroes=b.units.filter(u=>u.side==='party'&&u.hp>0),occupied=new Set(occupiedHexes(boss).map(key));
    let warning:Hex[],name:string;
    if(b.round%3===1){
      const index=Math.floor(b.round/3)%heroes.length;
      warning=blast(heroes[index].hex);if(second&&heroes.length>1)warning.push(...blast(heroes[(index+1)%heroes.length].hex));
      name=second?'Falling heavens':'Heavenfall';
    }else if(b.round%3===2){
      warning=cells().filter(h=>h.r>=3&&(second?[3,5,7]:[3,7]).includes(column(h)));name='Sundering rays';
    }else{
      const safe=second?[4,5]:[4,5,6];warning=cells().filter(h=>h.r>=5&&!safe.includes(column(h)));name='The last horizon';
    }
    const seen=new Set<string>();warning=warning.filter(h=>{const id=key(h);if(occupied.has(id)||seen.has(id))return false;seen.add(id);return true;});
    if(intent&&intent.phase!==phase)b.log.push('The halo fractures. The hollow heart is exposed.');
    intent={round:b.round,phase,name,cells:warning,power:second?24:18,baseCells:warning,baseName:name};boss.intent=intent;
  }
  const forced=tauntTarget(b,boss);
  intent.cells=forced?occupiedHexes(forced):intent.baseCells;
  intent.name=forced?`Judgment on ${forced.name}`:intent.baseName;
}

export const bossTurn:typeof enemyTurn=(b,onRetaliation,onAction)=>{
  const unit=active(b);if(unit?.id!==BOSS_ID)return enemyTurn(b,onRetaliation,onAction);
  prepareBoss(b);const aim={...unit.hex};
  if(cast(b,unit,'judgment',aim,onRetaliation)){onAction?.('judgment',aim);return 'judgment';}
};
