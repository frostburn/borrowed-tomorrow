import { CHARACTERS } from '../content/characters';
import { CIVILIANS } from '../content/civilians';
import { ACTOR_DIRECTIONS, actorAsset, type ActorDirection } from '../content/actors';
import { COMPANION_IDS, type CompanionId } from '../rules/party';
import { ENEMY_VARIANTS } from '../content/enemy-variants';

export const SPRITE_GROUPS = ['Party', 'NPCs', 'Enemies'] as const;
export type SpriteGroup = typeof SPRITE_GROUPS[number];
export interface SpriteEntry {
  id: string; name: string; sprite: string; portrait?: string;
  group: SpriteGroup; hero?: CompanionId; directions: readonly ActorDirection[];
  poses?: readonly { name: string; sprite: string; direction: ActorDirection }[];
}
const isHero = (id: string): id is CompanionId => (COMPANION_IDS as readonly string[]).includes(id);
export const SPRITE_CATALOG: SpriteEntry[] = [
  ...COMPANION_IDS.map(hero=>({id:hero,...CHARACTERS[hero],group:'Party' as const,hero,directions:ACTOR_DIRECTIONS})),
  ...Object.entries(CHARACTERS).filter(([id])=>!isHero(id)).map(([id,character])=>({id,...character,group:'NPCs' as const,
    directions:id==='emperor'?['front','left'] as const:['front'] as const,
    ...(id==='emperor'?{poses:[
      {name:'Side stance',sprite:'emperor-left',direction:'left' as const},
      {name:'Escape step 1',sprite:'emperor-left-step-0',direction:'left' as const},
      {name:'Escape step 2',sprite:'emperor-left-step-1',direction:'left' as const},
      {name:'Reach',sprite:'emperor-reach',direction:'left' as const},
    ]}:{}),
  })),
  ...Object.entries(CIVILIANS).map(([sprite,role])=>({id:sprite,sprite,...role,group:'NPCs' as const,directions:['front'] as const})),
  ...[
    {id:'herald',name:'Sun herald',portrait:'portrait-herald'}, {id:'glasswing',name:'Glass wing',portrait:'portrait-glasswing'},
    {id:'ward-reflector',name:'Ward projection'}, {id:'hound',name:'Hound'}, {id:'crow',name:'Crow'},
    {id:'inspector',name:'Inspector',portrait:'portrait-inspector'}, {id:'guardian',name:'Guardian'},
  ].map(entry=>({...entry,sprite:entry.id,group:'Enemies' as const,directions:['front'] as const})),
  ...Object.entries(ENEMY_VARIANTS).map(([id,variant])=>({id,name:variant.name,sprite:id,group:'Enemies' as const,directions:['front'] as const})),
];
export const spriteAsset = (entry: SpriteEntry, direction: ActorDirection) => entry.hero ? actorAsset(entry.hero,direction) : entry.poses?.find(pose=>pose.direction===direction)?.sprite??entry.sprite;
