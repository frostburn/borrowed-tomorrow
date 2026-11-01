import {it,expect} from 'vitest';
import {layoutForViewport} from '../src/game/resolution';

it('preserves the desktop console and native camera size',()=>{
 expect(layoutForViewport(1280,800)).toMatchObject({compact:false,portrait:false,width:1024,height:768,view:{width:1008,height:480}});
});
it.each([[844,390],[667,375],[932,430],[568,320]])('uses the available landscape viewport at %i × %i', (width,height)=>{
 const layout=layoutForViewport(width,height);
 expect(layout).toMatchObject({compact:true,portrait:false,width:Math.floor(width/2)*2,height:Math.floor(height/2)*2});
 expect(layout.sidebar).toBeGreaterThanOrEqual(214);
 expect(layout.view.width+layout.sidebar).toBe(layout.width);
 expect(layout.view.height+40+24+16).toBe(layout.height);
 expect(layout.view.width).toBeGreaterThanOrEqual(352);
});
it('keeps the notch and home indicator out of the game and input area',()=>{
 const layout=layoutForViewport(844,390,{left:44,right:44,top:0,bottom:21});
 expect(layout).toMatchObject({width:756,height:368,sidebar:286,view:{width:470,height:288}});
});
it.each([[390,844],[375,667],[320,568],[430,932]])('gives portrait a half-scale stage and full-width controls at %i × %i',(width,height)=>{
 const l=layoutForViewport(width,height);
 expect(l).toMatchObject({compact:true,portrait:true,worldScale:.5,sidebar:0,header:72});
 expect(l.view.width).toBe(l.width*2);expect(l.view.height).toBe(l.stageHeight*2);
 expect(l.stageHeight).toBeLessThanOrEqual(240);
 expect(l.height-l.header-24-l.stageHeight-16).toBeGreaterThanOrEqual(318);
});
it('measures portrait safe areas before allocating the stage and commands',()=>{
 const l=layoutForViewport(390,844,{left:0,right:0,top:47,bottom:34});
 expect(l).toMatchObject({width:390,height:762,view:{width:780,height:480},worldScale:.5});
});
