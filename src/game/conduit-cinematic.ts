import Phaser from 'phaser';
import type { Shot } from '../content/cinematics';

type Effect=Extract<NonNullable<Shot['effect']>,'feeds-close'|'vessel-transfer'|'chamber-rupture'>;
const clamp=(n:number)=>Phaser.Math.Clamp(n,0,1);
const smooth=(n:number)=>{const p=clamp(n);return p*p*(3-2*p);};

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
  private reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private closed=false;
  private durations:Record<Effect,number>={'feeds-close':1100,'vessel-transfer':2400,'chamber-rupture':1600};
  constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container,overlay:Phaser.GameObjects.Container,private emperor?:Phaser.GameObjects.Image){
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
  get animating(){return !this.closed&&!this.reduced&&!!this.phase&&(this.phase!=='feeds-close'||this.scene.time.now-this.started<this.durations[this.phase]);}
  play(effect:Effect){
    if(this.closed)return;
    this.finish();this.phase=effect;this.started=this.scene.time.now;
    if(effect==='vessel-transfer'&&this.emperor){
      this.entry={x:this.emperor.x,y:this.emperor.y};this.emperor.setTexture('emperor-reach').setVisible(true);
    }
    if(effect==='chamber-rupture'&&!this.reduced)this.scene.cameras.main.shake(1000,.003);
    this.update();
  }
  private finish(){
    if(this.phase==='feeds-close')this.feeds=true;
    if(this.phase==='vessel-transfer'){this.transferred=true;this.emperor?.setAlpha(0).setVisible(false);}
    if(this.phase==='chamber-rupture')this.broken=true;
  }
  private polygon(points:{x:number;y:number}[]){
    const g=this.graphics;g.beginPath();g.moveTo(points[0].x,points[0].y);
    for(const p of points.slice(1))g.lineTo(p.x,p.y);
    g.closePath();g.fillPath();
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
    if(entry&&this.entry&&this.emperor){
      const origin=this.entry,closed=smooth(entry/.35)*(1-smooth((entry-.7)/.3));
      // The Emperor stays on the transfer deck; no pull into the vessel's body.
      if(!this.transferred)this.emperor.setPosition(origin.x,origin.y).setAlpha(1).setVisible(entry<.4);
      const left=origin.x-39,top=origin.y-84;
      g.lineStyle(4,0xb99d65,.95).strokeRect(left,top,78,91);
      // Two rigid brass shutters meet, then reopen on the empty transfer frame.
      const width=39*closed;
      g.fillStyle(0x637c73,1).fillRect(left,top,width,91).fillRect(left+78-width,top,width,91);
      g.lineStyle(2,0xd2b47e,1).lineBetween(left+width,top,left+width,top+91).lineBetween(left+78-width,top,left+78-width,top+91);
      const flash=entry>.35&&entry<.8?Math.sin((entry-.35)/.45*Math.PI):0;
      g.fillStyle(0xdce9d4,flash*.8).fillRect(left+4,top+4,70,83);
      g.lineStyle(3,0xdce9d4,flash*.65).lineBetween(v.x+108,v.y+162,origin.x,origin.y-40);
    }

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
    this.graphics.destroy();
  }
}
