import Phaser from 'phaser';
import {MAPS,worldPath} from '../content/maps';
import {steppingPerson} from '../content/people-motion';
import type {WorldLighting} from './world-lighting';
const pixel=(p:{x:number;y:number})=>({x:(p.x+.5)*24,y:(p.y+.5)*24+7});
/** First-screen continuity. State still commits only on scene completion/skip. */
export class StationRaid {
 private originals:{image:Phaser.GameObjects.Image;x:number;y:number;alpha:number;key:string;frame:string|number}[]=[];
 private hound:Phaser.GameObjects.Image;
 private jobs:{image:Phaser.GameObjects.Image;points:{x:number;y:number}[];hide:boolean;key:string}[]=[];
 private tweens:Phaser.Tweens.Tween[]=[];
 private cleared=false;
 private arrived=false;
 private closed=false;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container,lighting:WorldLighting){
  for(const child of world.list)if(child instanceof Phaser.GameObjects.Image&&String(child.getData('person')??'').startsWith('festival-'))this.originals.push({image:child,x:child.x,y:child.y,alpha:child.alpha,key:child.texture.key,frame:child.frame.name});
  const p=pixel({x:30,y:11});this.hound=lighting.actor(world,p.x,p.y,'hound').setOrigin(.5,.85).setVisible(false).setData('person','raid-hound').setData('world-actor',true).setDepth(p.y);
 }
 get animating(){return !this.closed&&this.tweens.some(t=>t.isPlaying());}
 play(kind:'raid-clear'|'raid-hound'){
  if(this.closed)return;
  if(kind==='raid-clear'){
   if(this.cleared)return;this.cleared=true;
   for(const p of this.originals){
    const from={x:Math.floor(p.x/24),y:Math.floor((p.y-7)/24)},sprite=String(p.image.getData('person'))==='festival-family'?'civilian-family-plum':'civilian-traveler';
    this.move(p.image,from,[{x:30,y:20}],true,sprite);
   }
  }else{
   if(this.arrived)return;this.arrived=true;this.hound.setVisible(true);
   const target=MAPS.station.objects.find(o=>o.id==='pursuit')!;
   this.move(this.hound,{x:30,y:11},[{x:28,y:13},target],false,'hound');
  }
 }
 private move(image:Phaser.GameObjects.Image,from:{x:number;y:number},ends:{x:number;y:number}[],hide:boolean,key:string){
  const points:{x:number;y:number}[]=[];
  for(const end of ends){points.push(...worldPath(MAPS.station,from,end).map(pixel));from=end;}
  const job={image,points,hide,key};this.jobs.push(job);
  if(this.reduced){this.finish(job);return;}
  let distance=0;
  const next=(index:number)=>{
   if(this.closed||!image.active)return;
   if(index===points.length){this.finish(job);return;}
   const start={x:image.x,y:image.y};
   this.tweens.push(this.scene.tweens.add({targets:image,...points[index],duration:key==='hound'?130:110,ease:'Linear',onUpdate:()=>{
    image.setPosition(Math.round(image.x/2)*2,Math.round((image.y-1)/2)*2+1);
    const d=distance+Math.hypot(image.x-start.x,image.y-start.y);
    if(key==='hound')image.setTexture('hound-arrival',Math.floor(d/7)%2);
    else if(steppingPerson(key))image.setTexture(`${key}-ambient`,Math.floor(d/4)%6);
   },onComplete:()=>{distance+=Math.hypot(image.x-start.x,image.y-start.y);next(index+1);}}));
  };next(0);
 }
 private finish(job:typeof this.jobs[number]){
  const end=job.points.at(-1);if(end)job.image.setPosition(end.x,end.y);
  job.image.setTexture(job.key);if(job.hide)job.image.setAlpha(0);
 }
 /** Advancing dialogue settles the previous cue, just like staged actors. */
 settle(){for(const t of this.tweens)t.remove();this.tweens=[];for(const job of this.jobs)if(job.image.active)this.finish(job);this.jobs=[];}
 close(){this.closed=true;this.settle();this.hound.destroy();for(const p of this.originals)if(p.image.active)p.image.setPosition(p.x,p.y).setAlpha(p.alpha).setTexture(p.key,p.frame);}
}
