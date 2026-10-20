import { CHARACTERS } from '../content/characters';
import { CIVILIANS } from '../content/civilians';
import { ACTOR_DIRECTIONS, actorAsset, type ActorDirection } from '../content/actors';
import { COMPANION_IDS, type CompanionId } from '../rules/party';

export const SPRITE_GROUPS = ['Party', 'NPCs', 'Enemies'] as const;
export type SpriteGroup = typeof SPRITE_GROUPS[number];
export interface SpriteEntry {
  id: string; name: string; sprite: string; portrait?: string;
  group: SpriteGroup; hero?: CompanionId; directions: readonly ActorDirection[];
}
const isHero = (id: string): id is CompanionId => (COMPANION_IDS as readonly string[]).includes(id);
export const SPRITE_CATALOG: SpriteEntry[] = [
  ...COMPANION_IDS.map(hero=>({id:hero,...CHARACTERS[hero],group:'Party' as const,hero,directions:ACTOR_DIRECTIONS})),
  ...Object.entries(CHARACTERS).filter(([id])=>!isHero(id)).map(([id,character])=>({id,...character,group:'NPCs' as const,directions:['front'] as const})),
  ...Object.entries(CIVILIANS).map(([sprite,role])=>({id:sprite,sprite,...role,group:'NPCs' as const,directions:['front'] as const})),
  ...[
    {id:'hound',name:'Hound'}, {id:'crow',name:'Crow'},
    {id:'inspector',name:'Inspector',portrait:'portrait-inspector'}, {id:'guardian',name:'Guardian'},
  ].map(entry=>({...entry,sprite:entry.id,group:'Enemies' as const,directions:['front'] as const})),
];
export const spriteAsset = (entry: SpriteEntry, direction: ActorDirection) => entry.hero ? actorAsset(entry.hero,direction) : entry.sprite;
