import { FLAGSHIP_ENCOUNTER } from './flagship-battle';
import { FLAGSHIP_ASSETS as SHARED_ASSETS,flagshipPresentation } from '../game/flagship-presentation';
export { FLAGSHIP_PORTRAIT } from '../game/flagship-presentation';
export const FLAGSHIP_ASSETS=SHARED_ASSETS.map(asset=>({...asset,url:`${import.meta.env.BASE_URL}${asset.url}`}));
export const FLAGSHIP_PRESENTATION=flagshipPresentation(FLAGSHIP_ENCOUNTER);
