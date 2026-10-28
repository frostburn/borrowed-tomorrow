import type Phaser from 'phaser';
import type {Battle,Encounter,Unit} from '../rules/combat';
import type {WorldLight,WorldLamp,LightFlare} from './world-light';
import {hexVertices,type Hex} from '../rules/hex';
import {encounterChapter} from '../content/encounters';

type Color=readonly number[];
interface Mood {ambient:Color;key:Color;rim:Color;environmentShade?:number;lantern?:boolean}
const moods:Partial<Record<NonNullable<Encounter['boss']>,Mood>>={
 furnace:{ambient:[.68,.60,.55],key:[1.25,.65,.28],rim:[.48,.83,1.2]},
 ward:{ambient:[.56,.67,.66],key:[.62,1.2,1.12],rim:[1.1,.85,.5]},
 flagship:{ambient:[.63,.67,.76],key:[1.18,.86,.46],rim:[.55,.83,1.2]},
 dragon:{ambient:[.49,.64,.77],key:[.6,1.1,1.25],rim:[.7,.82,1.2]},
 serpent:{ambient:[.70,.59,.44],key:[1.25,1.03,.47],rim:[.6,.84,1.2]},
 emperor:{ambient:[.64,.64,.70],key:[1.2,1.06,.68],rim:[.58,.86,1.18]},
 lightbearer:{ambient:[.36,.41,.51],key:[1.18,1.05,.72],rim:[.62,.85,1.18],environmentShade:.28,lantern:true},
};
const divine:readonly Mood[]=[
 {ambient:[.48,.59,.70],key:[.58,1.05,1.25],rim:[1.1,.84,.52]},
 {ambient:[.59,.48,.54],key:[1.3,.78,.35],rim:[.72,.68,1.2]},
 {ambient:[.46,.59,.61],key:[.7,1.25,1.1],rim:[1.15,.9,.64]},
];
/** Quantized, scene-clock light shared by real encounters and their previews.
 * It carries no combat writes and dies with the battle drawing that owns it. */
export class BossLighting {
 private sources=new Map<string,{image:Phaser.GameObjects.Image;alive:boolean}>();
 private attacks=new Map<string,{at:number;contact:number;duration:number;polygons:{x:number;y:number}[][]}>();
 private cached?:WorldLight;
 private stamp='';
 private get reduced(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
 private constructor(private scene:Phaser.Scene,private battle:Battle,private mood:Mood,private attackDarkness:number){}
 static create(scene:Phaser.Scene,battle:Battle,encounter:Encounter){
  const mood=encounter.boss==='benefactor'?divine[encounter.benefactorForm??0]:moods[encounter.boss!];
  const chapter=encounterChapter(encounter)??7;
  return mood?new BossLighting(scene,battle,mood,Math.max(0,Math.min(4,chapter-3))*.18):undefined;
 }
 bind(unit:Unit,image:Phaser.GameObjects.Image,hp:number){this.sources.set(unit.id,{image,alive:hp>0});}
 attack(id:string,cells:readonly Hex[],contact:number,duration:number,elapsed=0){if(!this.reduced&&this.sources.get(id)?.alive)this.attacks.set(id,{at:this.scene.time.now-elapsed,contact,duration,polygons:cells.map(h=>hexVertices(h))});}
 get animating(){return !this.reduced&&!this.battle.result&&[...this.sources.values()].some(s=>s.alive);}
 sample=():WorldLight=>{
  const phase=this.animating?Math.round((.5+.5*Math.sin(this.scene.time.now*Math.PI/4000))*12)/12:.5;
  const lamps:WorldLamp[]=[],flares:LightFlare[]=[],positions:string[]=[];
  let focus:WorldLight['focus'];
  for(const [id,{image,alive}]of this.sources){
   if(!alive||!image.active)continue;
   const shut=this.mood.lantern&&image.texture?.key==='lightbearer-resist';
   const x=Math.round((image.x-(this.mood.lantern?27:0))/2)*2,y=Math.round(image.y/2)*2,height=this.mood.lantern?(shut?118:97):Math.min(170,image.displayHeight*.52);
   const attack=this.attacks.get(id),elapsed=attack?this.scene.time.now-attack.at:Infinity;
   const charge=attack&&!this.reduced?Math.max(0,elapsed<attack.contact?elapsed/attack.contact:1-(elapsed-attack.contact)/Math.max(1,attack.duration-attack.contact)):0;
   const power=Math.round((.68+phase*.1+Math.round(Math.min(1,charge)*8)/8*.8)*(shut?.16:1)*32)/32;
   positions.push(`${id}:${x}:${y}:${height}:${power}`);
   lamps.push({x,y,height,radius:730,strength:power,fill:.62,shadowStrength:.65,color:this.mood.key});
   if(this.mood.lantern&&!shut)flares.push({x,y:Math.round((y-height)/2)*2,strength:power});
   if(attack?.polygons.length&&charge>0){
    // Ease down over the wind-up, hold through contact, then restore the stage.
    const envelope=elapsed<attack.contact?Math.min(1,elapsed/Math.min(240,attack.contact)):Math.min(1,charge*2);
    const strength=Math.round(envelope*12)/12*this.attackDarkness;
    if(strength>0){focus={polygons:attack.polygons,strength};positions.push(`focus:${id}:${attack.at}:${strength}`);}
   }
  }
  const stamp=positions.join('|');if(this.cached&&this.stamp===stamp)return this.cached;
  this.stamp=stamp;
  const alive=lamps.length>0;
  // Broad front softboxes cover the entire fighting area and the bosses' faces.
  // Neutral bounce retains the painted materials beneath each stage's hue.
  lamps.push(...[300,720].map(x=>({x,y:460,height:160,radius:1050,strength:.5,fill:.9,spill:.1,shadowStrength:.12,color:[1,.98,.94]})));
  // Opposed soft rim lights retain silhouettes and keep the party readable.
  lamps.push(...[80,920].map(x=>({x,y:260,height:180,radius:650,strength:.42,fill:.55,shadowStrength:.35,color:this.mood.rim})));
  return this.cached={ambient:alive?this.mood.ambient.map(n=>n+.08):[.8,.82,.84],groundAmbient:alive?this.mood.ambient.map(n=>n*.85):undefined,environmentShade:alive?this.mood.environmentShade:undefined,maxGain:1.04,lamps,shadowOpacity:.20,focus,flares};
 };
}
