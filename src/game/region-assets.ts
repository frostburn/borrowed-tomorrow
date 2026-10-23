import {BENEFACTOR_ASSETS} from './benefactor-presentation';
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
import { vectorSurface } from './vector-image';
import { CONDUIT_ASSETS } from './conduit-presentation';
import { FURNACE_ASSETS } from './furnace-presentation';
import { WARD_ASSETS } from './ward-presentation';
import { FLAGSHIP_ASSETS } from './flagship-presentation';

/** Region scenery, tactical pages, cinematic poses and native vector preparation. */
export class RegionAssets {
  private pending?:Promise<void>;
  constructor(private scene:Phaser.Scene){}
  prepareVectors(keys:Iterable<string>){
    for(const key of keys){
      if(vectorAsset(key)||key.startsWith('scene-')||key.startsWith('scenery-')){
        const texture=this.scene.textures.get(key);
        for(const source of texture.source)if(source.image instanceof HTMLImageElement){
          const canvas=vectorSurface(source.image);
          source.source=source.image=canvas;source.isCanvas=true;source.update();
        }
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
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
        if(!this.pending)this.pending=new Promise<void>((resolve,reject)=>{
          this.scene.load.once('complete',()=>{
            if(missing.every(page=>this.scene.textures.exists(page.name))&&svg.every(a=>this.scene.textures.exists(a.key))){this.prepareVectors(svg.map(a=>a.key));resolve();}
            else reject(new Error(`${MAPS[map].name} scenery could not load. Your checkpoint is intact; try again.`));
          });
          for(const page of missing)this.scene.load.spritesheet(page.name,`${import.meta.env.BASE_URL}${page.url}`,{frameWidth:TILESET.tilewidth,frameHeight:TILESET.tileheight});
          for(const asset of svg)this.scene.load.image(asset.key,`${import.meta.env.BASE_URL}${asset.url}`);
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
