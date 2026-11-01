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
it('requires rotation for the narrow portrait screen',()=>{
 expect(layoutForViewport(390,844).portrait).toBe(true);
 expect(layoutForViewport(844,390).portrait).toBe(false);
});
