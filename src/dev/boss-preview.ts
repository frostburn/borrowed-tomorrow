import {benefactorPresentation,BENEFACTOR_ASSETS,BENEFACTOR_PORTRAIT} from '../game/benefactor-presentation';
import {BOSS_ENCOUNTER,bossTurn,prepareBoss} from './boss-battle';
export {BENEFACTOR_ASSETS as BOSS_ASSETS,BENEFACTOR_PORTRAIT as BOSS_PORTRAIT};
/** The legacy off-story fixture retains its own numbers; the actual native art is shared. */
export const BOSS_PRESENTATION={...benefactorPresentation(BOSS_ENCOUNTER),prepare:prepareBoss,enemyTurn:bossTurn};
