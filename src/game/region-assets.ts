import {BENEFACTOR_ASSETS} from './benefactor-presentation';
import { actorArtUrl, RASTER_ACTORS, type ActorArtSkin } from '../content/actor-art-skin';
import { MOTION_PAGES } from '../content/actor-motion';
import { IMPERIAL_ASSETS } from './imperial-presentation';
import { DRAGON_ASSETS } from './winter-dragon-presentation';
import { SERPENT_ASSETS } from './sun-serpent-presentation';
import Phaser from 'phaser';
import type { MapId } from '../rules/state';
import { MAPS,mapSize } from '../content/maps';
import { ENCOUNTERS } from '../content/encounters';
import { BATTLE_MAPS } from '../content/battle-maps';
import { TILESET,tilePages } from '../content/tilemaps';
import { sceneAssets } from '../content/scene-art';
import { cinematicAssets } from '../content/cinematic-art';
import { vectorAsset } from '../content/art-assets';
import { prepareArtTexture } from './vector-image';
import { CONDUIT_ASSETS } from './conduit-presentation';
import { FURNACE_ASSETS } from './furnace-presentation';
import { WARD_ASSETS } from './ward-presentation';
import { FLAGSHIP_ASSETS } from './flagship-presentation';

/** Region scenery, tactical pages, cinematic poses and native vector preparation. */
export class RegionAssets {
  private pending?:Promise<void>;
  private actors=new Map<string,string>();
  constructor(private scene:Phaser.Scene){}
  registerActors(assets:Iterable<{key:string;url:string}>){
    for(const {key,url} of assets){
      const at=url.indexOf('art/vector/'),path=at<0?url:url.slice(at);
      if(Object.hasOwn(RASTER_ACTORS,path))this.actors.set(key,path);
    }
  }
  /** Load the entire replacement before touching any visible texture. */
  async stageActorSkin(skin:ActorArtSkin){
    const assets=[...this.actors].filter(([key])=>this.scene.textures.exists(key));
    const queued=assets.map(([key,url],i)=>({key,url,temp:`actor-skin-pending-${i}`}));
    await new Promise<void>((resolve,reject)=>{
      this.scene.load.once('complete',()=>{
        if(queued.every(a=>this.scene.textures.exists(a.temp)))resolve();
        else{
          for(const a of queued)if(this.scene.textures.exists(a.temp))this.scene.textures.remove(a.temp);
          reject(new Error('Actor skin could not load'));
        }
      });
      for(const a of queued)this.scene.load.image(a.temp,`${import.meta.env.BASE_URL}${actorArtUrl(a.url,skin)}`);
      this.scene.load.start();
    });
    return ()=>{
      for(const a of queued){this.scene.textures.remove(a.key);this.scene.textures.renameTexture(a.temp,a.key);}
      this.prepareVectors(queued.map(a=>a.key));
    };
  }
  prepareVectors(keys:Iterable<string>){
    for(const key of keys){
      if(vectorAsset(key)||key.startsWith('scene-')||key.startsWith('scenery-')){
        const texture=this.scene.textures.get(key);
        const path=this.actors.get(key);
        // Paged boss atlases assemble from their small source pages inside
        // nativeTexture, before creating any of the original frame crops.
        const asset=path?RASTER_ACTORS[path]:undefined;
        if(!asset?.pages)prepareArtTexture(texture,asset);
        const page=MOTION_PAGES.find(page=>page.key===key);
        if(page&&!texture.has('0'))for(let i=0;i<page.frames;i++)texture.add(String(i),0,i%2*80,Math.floor(i/2)*80,80,80);
      }
    }
  }
  async ensure(map: MapId) {
    if(MAPS[map].tiles){
      // Later chapters load their scenery and local battle pages together.
      // Chapter one already has its complete SVG kit at the title screen.
      const maps=[MAPS[map].tiles,...Object.entries(ENCOUNTERS).flatMap(([id,e])=>e.backdrop?.map===map&&id in BATTLE_MAPS?[BATTLE_MAPS[id as keyof typeof BATTLE_MAPS]]:[])];
      const pages=maps.flatMap(m=>tilePages(m)),svg=[...new Map([...maps.flatMap(m=>sceneAssets(m)),...cinematicAssets(map),...Object.values(ENCOUNTERS).filter(e=>e.backdrop?.map===map).flatMap(e=>e.boss==='benefactor'?BENEFACTOR_ASSETS:e.boss==='emperor'||e.boss==='lightbearer'?IMPERIAL_ASSETS:e.boss==='dragon'?DRAGON_ASSETS:e.boss==='serpent'?SERPENT_ASSETS:e.boss==='conduit'?CONDUIT_ASSETS:e.boss==='furnace'?FURNACE_ASSETS:e.boss==='ward'?WARD_ASSETS:e.boss==='flagship'?FLAGSHIP_ASSETS:[])].map(a=>[a.key,a])).values()].filter(a=>!this.scene.textures.exists(a.key));
      const missing=[...new Map(pages.map(p=>[p.name,p])).values()].filter(page=>!this.scene.textures.exists(page.name));
      if(missing.length||svg.length){
        this.registerActors(svg);
        if(!this.pending)this.pending=new Promise<void>((resolve,reject)=>{
          this.scene.load.once('complete',()=>{
            if(missing.every(page=>this.scene.textures.exists(page.name))&&svg.every(a=>this.scene.textures.exists(a.key))){this.prepareVectors(svg.map(a=>a.key));resolve();}
            else reject(new Error(`${MAPS[map].name} scenery could not load. Your checkpoint is intact; try again.`));
          });
          for(const page of missing)this.scene.load.spritesheet(page.name,`${import.meta.env.BASE_URL}${page.url}`,{frameWidth:TILESET.tilewidth,frameHeight:TILESET.tileheight});
          for(const asset of svg)this.scene.load.image(asset.key,`${import.meta.env.BASE_URL}${actorArtUrl(asset.url)}`);
          this.scene.load.start();
        }).finally(()=>{this.pending=undefined;});
        await this.pending;
      }
      return;
    }
    const texture = `map-${map}`;
    if (this.scene.textures.exists(texture)) return;
    if (!this.pending) {
      this.pending = new Promise<void>((resolve, reject) => {
        this.scene.load.once('complete', () => {
          if (this.scene.textures.exists(texture)) {
            const source = this.scene.textures.get(texture).getSourceImage(), size = mapSize(MAPS[map]);
            if (source.width === size.width && source.height === size.height) { resolve(); return; }
            this.scene.textures.remove(texture);
          }
          reject(new Error(`${MAPS[map].name} could not load. Your checkpoint is intact; try again.`));
        });
        this.scene.load.image(texture, `${import.meta.env.BASE_URL}art/${MAPS[map].art??map}.webp`);
        this.scene.load.start();
      }).finally(() => { this.pending = undefined; });
    }
    await this.pending;
  }
}
