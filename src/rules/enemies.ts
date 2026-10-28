import type {Encounter,Unit} from './combat';
import type {AbilityId} from './abilities';
import {offset} from './hex';
import {ENEMY_VARIANTS} from '../content/enemy-variants';

const ENEMY_STATS = {
  herald:{name:'Sun herald',hp:138,speed:4,movement:3,armor:2,abilities:['sunbeam','strike']as AbilityId[],bonus:7},
  glasswing:{name:'Glass wing',hp:66,speed:8,movement:4,armor:1,flying:true,abilities:['splinter','strike']as AbilityId[],bonus:5},
  hound: { name: 'Track hound', hp: 26, speed: 4, movement: 3, armor: 0, abilities: ['strike'] as AbilityId[], bonus: -3 },
  crow: { name: 'Ash crow', hp: 19, speed: 6, movement: 3, armor: 0, abilities: ['peck', 'strike'] as AbilityId[], bonus: -1 },
  guardian: { name: 'Rail guardian', hp: 68, speed: 2, movement: 2, armor: 2, abilities: ['steam', 'strike'] as AbilityId[], bonus: -6 },
  inspector: { name: 'Imperial officer', hp: 74, speed: 3, movement: 2, armor: 1, abilities: ['flare', 'strike'] as AbilityId[], bonus: 0 },
  knight: { name: 'Imperial knight', hp: 142, speed: 5, movement: 3, armor: 3, abilities: ['strike','bash','taunt','sweep'] as AbilityId[], bonus: 2 },
};

/** Encounters and summoned reinforcements share fixed profiles and artwork. */
export function createEnemyUnit(enemy:Encounter['enemies'][number],id:string):Unit {
 const variant=enemy.variant?ENEMY_VARIANTS[enemy.variant]:undefined;
 if(variant&&variant.kind!==enemy.kind)throw new Error('Enemy variant must match its combat role.');
 const stats={...ENEMY_STATS[enemy.kind],...(variant?{name:variant.name,hp:variant.hp,bonus:variant.bonus,armor:variant.armor,speed:variant.speed,movement:variant.movement}:{})};
 return {...stats,abilities:[...stats.abilities],id,kind:enemy.kind,side:'enemy',hex:offset(enemy.col,enemy.row),
  appearance:enemy.appearance??enemy.variant,sealed:enemy.sealed,name:enemy.name??stats.name,bonus:enemy.bonus??stats.bonus,maxHp:enemy.hp??stats.hp,hp:enemy.hp??stats.hp,focus:6,moved:false,defending:false,retaliated:false,waited:false};
}
