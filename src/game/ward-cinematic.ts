import Phaser from 'phaser';
import { arrival,MAPS } from '../content/maps';
const pixel=(p:{x:number;y:number})=>({x:(p.x+.5)*24,y:(p.y+.5)*24+7});
/** Staff and equipment move on scene time; story writes remain atomic on completion. */
export class WardCinematic {
 private originals:{image:Phaser.GameObjects.Image;x:number;y:number}[]=[];
 private moving=false;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 constructor(private scene:Phaser.Scene,private world:Phaser.GameObjects.Container){}
 get animating(){return this.moving&&!this.reduced;}
 play(effect:'water-lift'|'ward-transfer'){
  if(this.originals.length)return;
  const images=this.world.list.filter((o):o is Phaser.GameObjects.Image=>o instanceof Phaser.GameObjects.Image);
  const targets=effect==='water-lift'?images.filter(i=>i.texture.key==='scene-five-water-platform'||i.getData('person')==='lift-attendant-low'):images.filter(i=>['waiting-patient','waiting-family'].includes(i.getData('person')));
  this.moving=targets.length>0&&!this.reduced;
  for(const [index,image]of targets.entries()){
   this.originals.push({image,x:image.x,y:image.y});
   const id=image.getData('person'),goal=effect==='water-lift'?id?pixel(arrival('dispensary','volunteer-high')):{x:image.x,y:image.y-96}:pixel(MAPS.windmere.people!.find(p=>p.id===(id==='waiting-patient'?'ward-patient':'ward-family'))!);
   if(this.reduced)image.setPosition(goal.x,goal.y);
   else this.scene.tweens.add({targets:image,...goal,duration:1400,delay:index*150,ease:'Sine.easeInOut',onComplete:()=>{if(index===targets.length-1)this.moving=false;}});
  }
 }
 close(){
  this.moving=false;
  for(const {image,x,y}of this.originals)if(image.active){this.scene.tweens.killTweensOf(image);image.setPosition(x,y);}
 }
}
