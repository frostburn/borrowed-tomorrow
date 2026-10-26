import Phaser from 'phaser';
import type { BattlePresentation } from './battle-presentation';
import {BossMaskCache, nativeTexture, bossLabel, bossPlacement, pickBossBody } from './boss-display';
import { bossMotionEnabled, BOSS_ATTACK_CONTACT, BOSS_ATTACK_DURATION } from './boss-motion';
import { actorAsset } from '../content/actors';
import type { CompanionId } from '../rules/party';
import { offset, toPixel } from '../rules/hex';
import type { Encounter } from '../rules/combat';
import { FLAGSHIP_PARTS,flagshipPart,isFlagshipPart,prepareFlagship } from '../rules/flagship';
export const FLAGSHIP_PORTRAIT=`${import.meta.env.BASE_URL}art/vector/bosses/flagship-portrait.svg`;
export const FLAGSHIP_ASSETS=['deck','hull','port','port-fire','starboard','starboard-fire','bridge','bridge-fire'].map(part=>({key:`flagship-${part}`,url:`art/vector/bosses/flagship-${part}.svg`}));
const masks=new BossMaskCache<Uint8Array>();
let shipOffset={x:0,y:0};
const sway=(scene:Phaser.Scene)=>shipOffset=bossMotionEnabled()?{x:2*Math.sin(scene.time.now*2*Math.PI/11000),y:3*Math.sin(scene.time.now*2*Math.PI/8000)}:{x:0,y:0};
/** The same clock displacement holds every rigid ship part together across redraws. */
function aboard(scene:Phaser.Scene,object:Phaser.GameObjects.Image|Phaser.GameObjects.Graphics,x:number,y:number){
  const paint=()=>{if(object.active){const d=sway(scene);object.setPosition(x+d.x,y+d.y);}};
  scene.events.on(Phaser.Scenes.Events.UPDATE,paint);object.once('destroy',()=>scene.events.off(Phaser.Scenes.Events.UPDATE,paint));paint();
}
const dimensions=(id:string)=>id==='flagship-bridge'?{width:224,height:232}:{width:192,height:184};

/** Propellers turn on scene time; the ship's hull and gun bases remain rigid. */
function propeller(scene:Phaser.Scene,world:Phaser.GameObjects.Container,x:number,y:number){
  const rim=scene.add.graphics().setPosition(x,y);world.add(rim);
  rim.fillStyle(0x142731).fillCircle(0,0,23);rim.lineStyle(3,0xb6a473).strokeCircle(0,0,23);
  const rotor=scene.add.graphics().setPosition(x,y);world.add(rotor);
  aboard(scene,rim,x,y);aboard(scene,rotor,x,y);
  rotor.fillStyle(0x8a9e94);
  for(const sign of [-1,1])rotor.fillPoints([[-3,0],[-7,sign*16],[2,sign*20],[4,sign*4]].map(([x,y])=>new Phaser.Math.Vector2(x,y)),true);
  rotor.fillStyle(0xc3b078).fillCircle(0,0,5);
  const paint=()=>{if(rotor.active)rotor.setRotation(bossMotionEnabled()?Math.floor(scene.time.now/110)%8*Math.PI/8:0);};
  scene.events.on(Phaser.Scenes.Events.UPDATE,paint);rotor.once('destroy',()=>scene.events.off(Phaser.Scenes.Events.UPDATE,paint));paint();
}

export function flagshipPresentation(encounter:Encounter):BattlePresentation{return {
  encounter,prepare:prepareFlagship,focus:offset(5,3),
  lighting:{scene:'flagship-battle',ground:'M110 292H842L958 480H10Z'},
  animating:b=>!b.result&&bossMotionEnabled(),
  portrait:u=>isFlagshipPart(u)?FLAGSHIP_PORTRAIT:undefined,
  facing:u=>u.side==='party'?actorAsset(u.kind as CompanionId,'back'):undefined,
  hint:b=>flagshipPart(b,'flagship-bridge').sealed?'Destroy both batteries to expose the bridge. Red X hexes mark incoming fire.':'Bridge exposed. Destroy it to end the boarding.',
  background(scene,world){
    for(const key of ['flagship-deck','flagship-hull','flagship-marine'])nativeTexture(scene,key);
    world.add(scene.add.image(0,0,'flagship-deck').setOrigin(0));
    const hull=scene.add.image(28,20,'flagship-hull').setOrigin(0);world.add(hull);aboard(scene,hull,28,20);
    propeller(scene,world,132,142);propeller(scene,world,888,142);
  },
  actor(scene,u,hp){
    if(!isFlagshipPart(u))return;
    const idle=u.id,fire=`${idle}-fire`,size=dimensions(idle),texture=nativeTexture(scene,idle);nativeTexture(scene,fire);
    if(!masks.has(idle)){
      const surface=texture.getSourceImage() as HTMLCanvasElement,pixels=surface.getContext('2d')!.getImageData(0,0,size.width,size.height).data;
      masks.set(idle,Uint8Array.from({length:size.width*size.height},(_,i)=>pixels[i*4+3]));
    }
    const at=bossPlacement(u),image=scene.add.image(at.x,at.y,idle).setOrigin(.5,1);
    let started:number|undefined;
    const paint=()=>{
      if(!image.active)return;
      const d=sway(scene);image.setPosition(at.x+d.x,at.y+d.y);
      const elapsed=started===undefined?Infinity:scene.time.now-started,attacking=hp>0&&bossMotionEnabled()&&elapsed<BOSS_ATTACK_DURATION;
      const key=attacking&&elapsed>=220&&elapsed<660?fire:idle;
      if(image.texture.key!==key)image.setTexture(key);
      image.setData('actor-motion',attacking?'attack':'idle');
    };
    image.setData('flagship-attack',(elapsed:number)=>{started=scene.time.now-elapsed;paint();});
    scene.events.on(Phaser.Scenes.Events.UPDATE,paint);image.once('destroy',()=>scene.events.off(Phaser.Scenes.Events.UPDATE,paint));paint();
    if(hp<=0)image.setTint(0x52626a).setAlpha(.65);
    return image;
  },
  attackTiming:u=>isFlagshipPart(u)?{contact:BOSS_ATTACK_CONTACT,duration:BOSS_ATTACK_DURATION}:undefined,
  attack:(_scene,image,u,elapsed)=>{if(isFlagshipPart(u))(image.getData('flagship-attack') as (elapsed:number)=>void)(elapsed);},
  attackSound:(u,id)=>isFlagshipPart(u)&&id==='judgment'?'steam':undefined,
  attackEffect(scene,world,image,u,id,affected){
    if(!isFlagshipPart(u)||id!=='judgment')return false;
    const g=scene.add.graphics();world.add(g);
    const duration=bossMotionEnabled()?320:110,source={x:image.x,y:image.y-(u.id==='flagship-bridge'?82:38)};
    scene.tweens.addCounter({from:0,to:1,duration,onUpdate:t=>{
      if(!g.active)return;const p=t.getValue()??0;g.clear().setAlpha(1-p);
      for(const h of affected){
        const at=toPixel(h);
        g.lineStyle(7,0xc99b65,.35).lineBetween(source.x,source.y,at.x,at.y-8);
        g.lineStyle(2,0xf2d3a0,.9).lineBetween(source.x,source.y,at.x,at.y-8);
        g.fillStyle(0xefc48b,.75).fillCircle(at.x,at.y-10,3+8*p);
        g.lineStyle(2,0xede0b3,.85).strokeEllipse(at.x,at.y,24+30*p,10+12*p);
      }
    },onComplete:()=>g.active&&g.destroy()});return true;
  },
  overlay(scene,world,b){
    bossLabel(scene,world,500,12,'Alban’s flagship',2);
    const g=scene.add.graphics();world.add(g);
    for(const id of FLAGSHIP_PARTS){
      const u=flagshipPart(b,id),at=bossPlacement(u),x=at.x;
      g.fillStyle(0x142731,.94).fillRect(x-74,28,148,48);
      bossLabel(scene,world,x,38,u.name,1,u.hp<=0?'#8a9a96':'#ecd2a0');
      bossLabel(scene,world,x,53,u.hp<=0?'Disabled':u.sealed?'Shielded':`${u.hp}/${u.maxHp}`,1,'#a9c3bb');
      g.fillStyle(0x0f202b).fillRect(x-60,65,120,4);
      g.fillStyle(u.sealed?0x82b3b4:0xb79d68).fillRect(x-60,65,Math.round(120*u.hp/u.maxHp),4);
    }
    const bridge=flagshipPart(b,'flagship-bridge');
    if(bridge.hp>0&&bridge.sealed){const p=bossPlacement(bridge),shield=scene.add.graphics();world.add(shield);shield.lineStyle(2,0x9bc5c0,.5).strokeEllipse(p.x,p.y-82,120,132);aboard(scene,shield,0,0);}
  },
  pick(b,action,x,y){
    for(const id of FLAGSHIP_PARTS){const size=dimensions(id),h=pickBossBody(b,action,x,y,flagshipPart(b,id),size.width,size.height,masks.get(id),shipOffset);if(h)return h;}
  },
};}
