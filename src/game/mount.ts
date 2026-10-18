import Phaser from 'phaser';
import { Adventure } from './adventure';
import { UI } from './ui';
import { worldView } from './resolution';
import { PixelDisplay } from './pixel-display';

export function mountGame(root:HTMLElement, adventure:Adventure, overrides:Partial<ConstructorParameters<typeof UI>[1]> = {}) {
  const ui=new UI(root,{
    inventory:()=>adventure.inventory(),journal:()=>adventure.journal(),saves:()=>{void adventure.saves();},sound:()=>{void adventure.toggleSound();},help:()=>adventure.help(),pan:direction=>adventure.panBattle(direction),...overrides,
  });
  adventure.attach(ui);
  root.addEventListener('click',event=>{const button=(event.target as HTMLElement).closest('button');if(button&&button.id!=='sound-button')adventure.audio.effect('click');});
  const display=new PixelDisplay(root,(x,y,click)=>adventure.point(x,y,click));
  // Canvas rendering keeps the compositor on one raster pipeline, avoiding GPU readback.
  const sceneCanvas=document.createElement('canvas');sceneCanvas.getContext('2d',{willReadFrequently:true});
  const viewport=worldView();
  const game=new Phaser.Game({
    type:Phaser.CANVAS,canvas:sceneCanvas,parent:display.host,backgroundColor:'#0a171a',pixelArt:true,antialias:false,
    width:viewport.width,height:viewport.height,scale:{mode:Phaser.Scale.NONE},
    scene:[adventure],audio:{noAudio:true},banner:false,
  });
  // Finish all Phaser resize handlers, then sync before the next input event.
  game.scale.on('resize',()=>queueMicrotask(()=>{if(game.canvas){display.attach(game.canvas);display.fitWorld();}}));
  game.events.on('postrender',()=>{display.attach(game.canvas);display.paint(adventure.animating);});

  window.addEventListener('resize',()=>adventure.resizeView());

  return {ui,game,display};
}
