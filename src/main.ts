import Phaser from 'phaser';
import './style.css';
import { Adventure } from './game/adventure';
import { UI } from './game/ui';
import { WIDTH, HEIGHT } from './content/disk-a/maps';

const adventure=new Adventure();
const ui=new UI(document.getElementById('app')!,{
  journal:()=>adventure.journal(),saves:()=>{void adventure.saves();},sound:()=>{void adventure.toggleSound();},help:()=>adventure.help(),
});
adventure.attach(ui);
new Phaser.Game({
  type:Phaser.AUTO,parent:ui.canvas,backgroundColor:'#0a171a',pixelArt:true,antialias:false,
  width:WIDTH,height:HEIGHT,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  scene:[adventure],audio:{noAudio:true},banner:false,
});
