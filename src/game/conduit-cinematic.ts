import Phaser from 'phaser';
import type { Shot } from '../content/cinematics';

type Effect=Extract<NonNullable<Shot['effect']>,'feeds-close'|'vessel-transfer'|'chamber-rupture'>;
const clamp=(n:number)=>Phaser.Math.Clamp(n,0,1);
const smooth=(n:number)=>{const p=clamp(n);return p*p*(3-2*p);};
let transferSerial=0;

/** Temporary, clock-driven staging; never writes campaign flags or map data. */
export class ConduitCinematic {
  private graphics:Phaser.GameObjects.Graphics;
  private vessel?:Phaser.GameObjects.Image;
  private controls?:Phaser.GameObjects.Image;
  private lights:Phaser.GameObjects.Image[]=[];
  private originals:{image:Phaser.GameObjects.Image;x:number;y:number;alpha:number}[]=[];
  private phase?:Effect;
  private started=0;
  private feeds=false;
  private transferred=false;
  private broken=false;
  private entry?:{x:number;y:number};
  private lightBody?:Phaser.GameObjects.Image;
  private lightTexture?:Phaser.Textures.CanvasTexture;
  private bodySource?:HTMLCanvasElement;
  private reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private closed=false;
  private durations:Record<Effect,number>={'feeds-close':1100,'vessel-transfer':2400,'chamber-rupture':1600};
  constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container,private overlay:Phaser.GameObjects.Container,private emperor?:Phaser.GameObjects.Image){
    for(const child of world.list)if(child instanceof Phaser.GameObjects.Image){
      const key=child.getData('scene-piece')?.key;
      if(key==='scenery-conduit-vessel')this.vessel=child;
      if(key==='scenery-conduit-controls')this.controls=child;
      if(key==='scene-conduit-17')this.lights.push(child);
    }
    for(const image of [this.vessel,...this.lights])if(image)this.originals.push({image,x:image.x,y:image.y,alpha:image.alpha});
    this.graphics=scene.add.graphics();overlay.add(this.graphics);
    scene.events.on(Phaser.Scenes.Events.UPDATE,this.update,this);
  }
  get animating(){return !this.closed&&!this.reduced&&!!this.phase&&(this.phase==='chamber-rupture'||this.scene.time.now-this.started<this.durations[this.phase]);}
  play(effect:Effect){
    if(this.closed)return;
    this.finish();this.phase=effect;this.started=this.scene.time.now;
    if(effect==='vessel-transfer'&&this.emperor){
      this.entry={x:this.emperor.x,y:this.emperor.y};this.emperor.setTexture('emperor-reach').setVisible(true);
      if(!this.reduced)this.prepareLightBody();
    }
    if(effect==='chamber-rupture'&&!this.reduced)this.scene.cameras.main.shake(1000,.003);
    this.update();
  }
  private finish(){
    if(this.phase==='feeds-close')this.feeds=true;
    if(this.phase==='vessel-transfer'){this.transferred=true;this.emperor?.setAlpha(0).setVisible(false);this.lightBody?.setVisible(false);}
    if(this.phase==='chamber-rupture')this.broken=true;
  }
  private polygon(points:{x:number;y:number}[]){
    const g=this.graphics;g.beginPath();g.moveTo(points[0].x,points[0].y);
    for(const p of points.slice(1))g.lineTo(p.x,p.y);
    g.closePath();g.fillPath();
  }
  private prepareLightBody(){
    if(!this.emperor||this.lightBody)return;
    // Use the actual reaching pose's alpha, including his fingers and coat.
    // This temporary emissive mask bypasses the actor's ambient shading.
    const actor=this.emperor,frame=actor.frame,source=document.createElement('canvas');
    source.width=frame.cutWidth;source.height=frame.cutHeight;
    const ctx=source.getContext('2d')!;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(frame.source.image as CanvasImageSource,frame.cutX,frame.cutY,frame.cutWidth,frame.cutHeight,0,0,source.width,source.height);
    ctx.globalCompositeOperation='source-in';ctx.fillStyle='#fff2cd';ctx.fillRect(0,0,source.width,source.height);
    this.bodySource=source;
    const texture=this.lightTexture=this.scene.textures.createCanvas(`conduit-transfer-${transferSerial++}`,source.width+32,source.height+64)!;
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.lightBody=this.scene.add.image(actor.x,actor.y,texture.key)
      .setOrigin((actor.displayOriginX+16)/texture.width,(actor.displayOriginY+64)/texture.height)
      .setScale(actor.scaleX,actor.scaleY).setVisible(false);
    this.overlay.addAt(this.lightBody,this.overlay.getIndex(this.graphics));
  }
  private transfer(p:number){
    if(!this.entry||!this.emperor)return;
    const origin=this.entry,light=smooth((p-.12)/.3);
    // The body becomes luminous in place, then its pieces rise without scaling.
    if(!this.transferred)this.emperor.setPosition(origin.x,origin.y).setAlpha(1-smooth((p-.2)/.32)).setVisible(p<.54);
    if(!this.reduced&&p<1&&this.lightBody&&this.lightTexture&&this.bodySource){
      const source=this.bodySource,ctx=this.lightTexture.context;
      ctx.clearRect(0,0,this.lightTexture.width,this.lightTexture.height);ctx.imageSmoothingEnabled=false;
      for(let y=0;y<source.height;y+=6)for(let x=0;x<source.width;x+=6){
        const seed=(x*7+y*11)%19/19,departure=.48+y/source.height*.12+seed*.08;
        const rise=smooth((p-departure)/.26),fade=1-smooth((rise-.55)/.45);
        ctx.globalAlpha=light*fade;
        const dx=Math.round((seed-.5)*24*rise/2)*2,dy=Math.round((38+seed*20)*rise/2)*2;
        ctx.drawImage(source,x,y,Math.min(6,source.width-x),Math.min(6,source.height-y),x+16+dx,y+64-dy,Math.min(6,source.width-x),Math.min(6,source.height-y));
      }
      ctx.globalAlpha=1;this.lightTexture.refresh();this.lightBody.setVisible(true);
    }
    const spill=light*(1-smooth((p-.62)/.3));
    this.graphics.fillStyle(0xf1dca0,spill*.18).fillEllipse(origin.x,origin.y-1,62,18);
    this.graphics.fillStyle(0xffefd0,spill*.18).fillEllipse(origin.x,origin.y-1,34,8);
  }
  private update(){
    if(this.closed||!this.phase||!this.vessel||!this.controls)return;
    const elapsed=this.scene.time.now-this.started,p=this.reduced?1:clamp(elapsed/this.durations[this.phase]);
    const feeds=this.phase==='feeds-close'?p:this.feeds?1:0;
    const entry=this.phase==='vessel-transfer'?p:this.transferred?1:0;
    const rupture=this.phase==='chamber-rupture'?p:this.broken?1:0;
    const v=this.originals.find(o=>o.image===this.vessel)!,c=this.controls,g=this.graphics;
    g.clear();
    for(const light of this.lights)light.setAlpha(1-feeds);
    if(feeds){
      // Overwrite only the small gauge faces; every needle sinks to zero.
      for(const [i,x] of [30,62,94,126,158].entries()){
        const cx=c.x+x-1,cy=c.y+15,angle=(-1.25+i*.15)+(2.4-i*.15)*smooth(feeds);
        g.fillStyle(0xe6d7ae).fillCircle(cx,cy,8);g.lineStyle(2,0x253f49).lineBetween(cx,cy,cx+Math.cos(angle)*6,cy+Math.sin(angle)*6);
      }
      if(feeds<1){
        g.lineStyle(2,0xa4c9bd,1-feeds).lineBetween(v.x+208,v.y+300,c.x+48,c.y+60);
        for(let i=0;i<4;i++){const t=(i/4+elapsed/1400)%1;g.fillStyle(0xd7e1c6,1-feeds).fillRect(v.x+208+(c.x+48-v.x-208)*t,v.y+298,4,4);}
      }
    }
    if(this.phase==='vessel-transfer')this.transfer(entry);

    if(rupture){
      const t=this.reduced?0:this.scene.time.now/1000,shake=this.reduced?0:Math.sin(t*23)*1.5*rupture;
      this.vessel.setPosition(v.x+shake,v.y);
      // The overloaded pipe cage vibrates while the shut-down works stay grounded.
      for(const side of [-1,1]){
        g.lineStyle(3,0xb99d65,.85).lineBetween(v.x+108+side*46,v.y+57,v.x+108+side*(67+shake),v.y+247);
      }
      const crack=[[-196,8],[-132,32],[-93,9],[-53,31],[0,4],[31,-22],[72,-9],[118,-36],[164,-22]];
      g.lineStyle(4,0x0a1926,.95);
      for(let i=1;i<crack.length;i++)if(rupture>=i/(crack.length-1))g.lineBetween(v.x+108+crack[i-1][0],v.y+crack[i-1][1],v.x+108+crack[i][0],v.y+crack[i][1]);
      if(!this.reduced)for(let i=0;i<26;i++){
        const cycle=(t*.24+i*.137)%1,x=v.x-115+(i*73)%430+Math.sin(t+i)*5,y=v.y+cycle*330;
        g.fillStyle(i%3?0xa9b5a8:0xd2c6a1,.3+Math.sin(cycle*Math.PI)*.4);
        this.polygon([{x,y},{x:x+4+(i%3)*2,y:y-3},{x:x+8,y:y+2},{x:x+2,y:y+5}]);
      }
    }
    if(p===1)this.finish();
  }
  close(){
    if(this.closed)return;this.closed=true;this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.update,this);
    this.scene.cameras.main.shakeEffect.reset();
    for(const {image,x,y,alpha} of this.originals)if(image.active)image.setPosition(x,y).setAlpha(alpha);
    this.lightBody?.destroy();
    if(this.lightTexture)this.scene.textures.remove(this.lightTexture.key);
    this.bodySource=undefined;
    this.graphics.destroy();
  }
}
