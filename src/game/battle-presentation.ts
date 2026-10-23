import type Phaser from 'phaser';
import type { AbilityId, Battle, Encounter, Unit, enemyTurn } from '../rules/combat';
import type { Hex } from '../rules/hex';
import type { Effect } from './synth';

/** Optional encounter presentation shared by campaign and workshop battles. */
export interface BattlePresentation {
  encounter:Encounter;
  /** Passive motion must keep the visible framebuffer refreshing between inputs. */
  animating?:(battle:Battle)=>boolean;
  prepare?:(battle:Battle)=>void;
  background:(scene:Phaser.Scene,world:Phaser.GameObjects.Container,battle:Battle)=>void;
  actor?:(scene:Phaser.Scene,unit:Unit,hp:number,hex:Hex)=>Phaser.GameObjects.Image|undefined;
  position?:(unit:Unit,hex:Hex)=>{x:number;y:number}|undefined;
  attackTiming?:(unit:Unit)=>{contact:number;duration:number}|undefined;
  attack?:(scene:Phaser.Scene,image:Phaser.GameObjects.Image,unit:Unit,elapsed:number)=>void;
  attackSound?:(unit:Unit,ability:AbilityId)=>Effect|undefined;
  attackEffect?:(scene:Phaser.Scene,world:Phaser.GameObjects.Container,image:Phaser.GameObjects.Image,unit:Unit,ability:AbilityId,affected:Hex[])=>boolean;
  overlay?:(scene:Phaser.Scene,world:Phaser.GameObjects.Container,battle:Battle)=>void;
  pick?:(battle:Battle,action:AbilityId|'move',x:number,y:number)=>Hex|undefined;
  hint?:(battle:Battle)=>string;
  enemyTurn?:typeof enemyTurn;
  portrait?:(unit:Unit)=>string|undefined;
  facing?:(unit:Unit)=>string|undefined;
  focus?:Hex;
}
