import catalog from './enemy-variants.json' with {type:'json'};

export type EnemyVariantId=keyof typeof catalog;
interface EnemyVariant {
 kind:'hound'|'crow'|'guardian';name:string;chapter:number;
 hp:number;bonus:number;armor:number;speed:number;movement:number;
 colors:Record<string,string>;
}
/** Fixed chapter variants: combat identity, profile and vector palette travel together. */
export const ENEMY_VARIANTS=catalog as Record<EnemyVariantId,EnemyVariant>;
export const ENEMY_VARIANT_ACTORS=Object.keys(ENEMY_VARIANTS) as EnemyVariantId[];
