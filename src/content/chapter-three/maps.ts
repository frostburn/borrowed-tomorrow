import northglass from './maps/northglass.json' with { type: 'json' };
import relayhall from './maps/relayhall.json' with { type: 'json' };
import conduit from './maps/conduit.json' with { type: 'json' };
import arrest from './maps/battle-capital-arrest.json' with { type: 'json' };
import warden from './maps/battle-works-warden.json' with { type: 'json' };
import stores from './maps/battle-palace-stores.json' with { type: 'json' };
import feeds from './maps/battle-heart-feeds.json' with { type: 'json' };
import pressure from './maps/battle-heart-pressure.json' with { type: 'json' };
import { tiledWorld } from '../tiled-world';
import type { TileMap } from '../tilemaps';

export const CHAPTER_THREE_MAPS={northglass:tiledWorld('northglass',northglass),relayhall:tiledWorld('relayhall',relayhall),conduit:tiledWorld('conduit',conduit)};
export const CHAPTER_THREE_BATTLES:Record<string,TileMap>={'capital-arrest':arrest,'works-warden':warden,'palace-stores':stores,'heart-feeds':feeds,'heart-pressure':pressure};
