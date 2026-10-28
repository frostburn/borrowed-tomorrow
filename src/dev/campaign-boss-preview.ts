import type Phaser from 'phaser';
import {CAMPAIGN_BOSSES,campaignBoss,type CampaignBossId} from './boss-catalog';
import {ENCOUNTERS} from '../content/encounters';
import type {Encounter} from '../rules/combat';
import {BATTLE_MAPS} from '../content/battle-maps';
import {sceneAssets} from '../content/scene-art';
import {CHARACTERS} from '../content/characters';
import {artPath} from '../content/art-assets';
import {drawTileMap} from '../game/tilemap';
import {newGame} from '../rules/state';
import {RegionAssets} from '../game/region-assets';
import {furnacePresentation,FURNACE_ASSETS} from '../game/furnace-presentation';
import {wardPresentation,WARD_ASSETS} from '../game/ward-presentation';
import {conduitPresentation,CONDUIT_ASSETS,CONDUIT_PORTRAIT} from '../game/conduit-presentation';
import {winterDragonPresentation,DRAGON_ASSETS,DRAGON_PORTRAIT} from '../game/winter-dragon-presentation';
import type {BattlePresentation} from '../game/battle-presentation';
import {facingAsset} from '../content/actors';
import type {CompanionId} from '../rules/party';
const customAssets={furnace:FURNACE_ASSETS,ward:WARD_ASSETS,conduit:CONDUIT_ASSETS,dragon:DRAGON_ASSETS};
export function campaignBossPortrait(id:CampaignBossId){
 const source=ENCOUNTERS[campaignBoss(id)!.encounter];
 if(source.boss==='conduit')return CONDUIT_PORTRAIT;if(source.boss==='dragon')return DRAGON_PORTRAIT;
 const sprite=source.enemies[0].appearance??source.enemies[0].kind,character=Object.values(CHARACTERS).find(c=>c.sprite===sprite);
 return `${import.meta.env.BASE_URL}${artPath(character?.portrait??(sprite==='herald'?'portrait-herald':sprite))}`;
}
export function campaignBossPresentation(encounter:Encounter):BattlePresentation{
 if(encounter.boss==='furnace')return furnacePresentation(encounter);
 if(encounter.boss==='ward')return wardPresentation(encounter);
 if(encounter.boss==='conduit')return conduitPresentation(encounter);
 if(encounter.boss==='dragon')return winterDragonPresentation(encounter);
 return {encounter,tactical:true,background:(scene,world)=>drawTileMap(scene,world,BATTLE_MAPS[encounter.id],newGame()),facing:u=>u.side==='party'?facingAsset(u.kind as CompanionId,1,0):undefined};
}
/** Fetch only the selected arena; browsing the catalogue does not preload every map. */
export async function loadCampaignBoss(scene:Phaser.Scene,id:CampaignBossId){
 const source=ENCOUNTERS[CAMPAIGN_BOSSES.find(e=>e.id===id)!.encounter];
 const assets=[...sceneAssets(BATTLE_MAPS[source.id]),...(customAssets[source.boss as keyof typeof customAssets]??[])];
 const missing=[...new Map(assets.map(a=>[a.key,a])).values()].filter(a=>!scene.textures.exists(a.key));
 if(missing.length)await new Promise<void>((resolve,reject)=>{
  scene.load.once('complete',()=>missing.every(a=>scene.textures.exists(a.key))?resolve():reject(new Error('The boss arena could not load. Try starting the preview again.')));
  for(const asset of missing)scene.load.image(asset.key,`${import.meta.env.BASE_URL}${asset.url}`);
  scene.load.start();
 });
 new RegionAssets(scene).prepareVectors(assets.map(a=>a.key));
}
