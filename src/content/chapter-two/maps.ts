import coast from './maps/coast.json' with { type: 'json' };
import infirmary from './maps/infirmary.json' with { type: 'json' };
import cinderbank from './maps/cinderbank.json' with { type: 'json' };
import signals from './maps/battle-coast-signals.json' with { type: 'json' };
import loading from './maps/battle-coast-loading.json' with { type: 'json' };
import collector from './maps/battle-coast-collector.json' with { type: 'json' };
import recapture from './maps/battle-coast-recapture.json' with { type: 'json' };
import { tiledWorld } from '../tiled-world';
import type { TileMap } from '../tilemaps';

export const CHAPTER_TWO_MAPS={coast:tiledWorld('coast',coast),infirmary:tiledWorld('infirmary',infirmary),cinderbank:tiledWorld('cinderbank',cinderbank)};
export const CHAPTER_TWO_BATTLES:Record<string,TileMap>={'coast-signals':signals,'coast-loading':loading,'coast-collector':collector,'coast-recapture':recapture};
