import type Phaser from 'phaser';
import type {MapData,MapPerson} from '../content/maps';
import {walkable} from '../content/maps';
import {animatedPerson,personPose,personStill,stepClear} from '../content/people-motion';

/** Cosmetic only: no tweens, pathfinding, collision, dialogue or save writes. */
export class PeopleMotion {
 private actors:{image:Phaser.GameObjects.Image;person:MapPerson;x:number;y:number;slot:number;step:boolean}[]=[];
 private time=0;
 private dirty=false;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 add(image:Phaser.GameObjects.Image,person:MapPerson,map:MapData,state:{flags:Record<string,boolean>}){
  if(!animatedPerson(person.sprite)||personStill(map.id,person,state.flags))return;
  this.actors.push({image,person,x:image.x,y:image.y,slot:this.actors.length,step:stepClear(person,(x,y)=>walkable(map,x,y,state))});
 }
 clear(){this.actors=[];this.time=0;this.dirty=false;}
 takeFrame(){const dirty=this.dirty;this.dirty=false;return dirty;}
 update(delta:number,paused:boolean){
  if(!this.reduced.matches&&paused)return;
  if(!this.reduced.matches)this.time+=Math.min(120,Math.max(0,delta));
  for(const a of this.actors){
   if(!a.image.active)continue;
   const pose=this.reduced.matches?{dy:0,motion:'idle',frame:undefined}:personPose(a.person,this.time,a.slot,this.actors.length,a.step);
   const key=pose.frame===undefined?a.person.sprite:`${a.person.sprite}-ambient`,frame=pose.frame??'__BASE';
   if(a.image.x===a.x&&a.image.y===a.y+pose.dy&&a.image.texture.key===key&&String(a.image.frame.name)===String(frame))continue;
   a.image.setPosition(a.x,a.y+pose.dy).setTexture(key,frame).setData('person-motion',pose.motion);this.dirty=true;
  }
 }
}
