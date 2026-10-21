import type Phaser from 'phaser';
import type { AbilityId, Battle, Encounter, Unit, enemyTurn } from '../rules/combat';
import type { Hex } from '../rules/hex';

/** Development presentation hooks; campaign encounters need no adapter. */
export interface BattlePreview {
  encounter:Encounter;
  prepare?:(battle:Battle)=>void;
  background:(scene:Phaser.Scene,world:Phaser.GameObjects.Container,battle:Battle)=>void;
  actor?:(scene:Phaser.Scene,unit:Unit,hp:number)=>Phaser.GameObjects.Image|undefined;
  attackTiming?:(unit:Unit)=>{contact:number;duration:number}|undefined;
  attack?:(scene:Phaser.Scene,image:Phaser.GameObjects.Image,unit:Unit,elapsed:number)=>void;
  overlay?:(scene:Phaser.Scene,world:Phaser.GameObjects.Container,battle:Battle)=>void;
  pick?:(battle:Battle,action:AbilityId|'move',x:number,y:number)=>Hex|undefined;
  hint?:(battle:Battle)=>string;
  enemyTurn?:typeof enemyTurn;
  portrait?:(unit:Unit)=>string|undefined;
  facing?:(unit:Unit)=>string|undefined;
  focus?:Hex;
}
