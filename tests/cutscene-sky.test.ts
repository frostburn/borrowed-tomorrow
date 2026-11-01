import {afterEach,expect,it,vi} from 'vitest';
import {Cutscene} from '../src/game/cutscene';
import {ImperialCinematic} from '../src/game/imperial-cinematic';
import {CAPITAL_SKY,CAPITAL_SKY_FOCUS} from '../src/content/capital-horizon';
vi.mock('phaser',()=>({default:{}}));
afterEach(()=>vi.unstubAllGlobals());

function stage(reduced:boolean,sky=true){
 vi.stubGlobal('window',{innerWidth:1280,matchMedia:()=>({matches:reduced})});
 let bounds={x:0,y:0,width:1536,height:1008};const original={...bounds};
 const camera={zoom:1,useBounds:true,roundPixels:false,panEffect:{reset:vi.fn()},getBounds:()=>({...bounds}),
  setBounds:vi.fn((x:number,y:number,width:number,height:number)=>{bounds={x,y,width,height};camera.useBounds=true;}),stopFollow:vi.fn(),centerOn:vi.fn(),pan:vi.fn()};
 const graphics={setDepth:vi.fn().mockReturnThis(),fillStyle:vi.fn().mockReturnThis(),fillRect:vi.fn().mockReturnThis(),destroy:vi.fn()};
 const layer={setDepth:vi.fn().mockReturnThis(),destroy:vi.fn()},scene={cameras:{main:camera},add:{graphics:()=>graphics,container:()=>layer}};
 const world={list:[],add:vi.fn(),sort:vi.fn()},audio={cinematicMix:vi.fn()};
 const film=new Cutscene(scene as never,world as never,{id:'camera-test',title:'Sky',actors:[],...(sky?{sky:CAPITAL_SKY}:{})},audio as never,{}as never,{}as never);
 return {film,camera,graphics,original,bounds:()=>bounds};
}

for(const reduced of [false,true])it(`extends and restores the sky bounds with ${reduced?'reduced':'normal'} motion, including resize and skip`,()=>{
 const s=stage(reduced);expect(s.bounds()).toEqual({x:0,y:-240,width:1536,height:1248});expect(s.camera.zoom).toBe(1);
 expect(s.graphics.fillRect).toHaveBeenCalledWith(0,-240,1536,240);
 s.film.shot({focus:CAPITAL_SKY_FOCUS,cut:true});expect(s.camera.centerOn).toHaveBeenLastCalledWith(780,67);
 s.camera.setBounds(0,0,1536,1008);s.film.reframe();expect(s.bounds().y).toBe(-240);expect(s.camera.zoom).toBe(1);
 s.film.close();expect(s.bounds()).toEqual(s.original);expect(s.camera.useBounds).toBe(true);expect(s.graphics.destroy).toHaveBeenCalledOnce();
 s.film.close();expect(s.graphics.destroy).toHaveBeenCalledOnce();
});

it('leaves ordinary scene bounds and scale untouched',()=>{
 const s=stage(false,false);expect(s.camera.setBounds).not.toHaveBeenCalled();expect(s.graphics.fillRect).not.toHaveBeenCalled();
 s.film.close();expect(s.camera.setBounds).not.toHaveBeenCalled();expect(s.bounds()).toEqual(s.original);expect(s.camera.zoom).toBe(1);
});

it('refits a steady reduced-motion sun on resize and releases the redraw on close',()=>{
 vi.stubGlobal('window',{matchMedia:()=>({matches:true})});
 const g={active:true,setDepth:vi.fn().mockReturnThis(),clear:vi.fn().mockReturnThis(),fillStyle:vi.fn().mockReturnThis(),fillEllipse:vi.fn().mockReturnThis(),beginPath:vi.fn().mockReturnThis(),moveTo:vi.fn().mockReturnThis(),lineTo:vi.fn().mockReturnThis(),closePath:vi.fn().mockReturnThis(),fillPath:vi.fn().mockReturnThis(),lineStyle:vi.fn().mockReturnThis(),strokePath:vi.fn().mockReturnThis(),destroy:vi.fn()};
 const camera={width:1008},scene={cameras:{main:camera},add:{graphics:()=>g}},world={add:vi.fn(),sort:vi.fn()};
 const film=new ImperialCinematic(scene as never,world as never);film.play('capital-horizon');
 const wide=g.fillEllipse.mock.calls.at(-1)!;camera.width=304;film.reframe();const narrow=g.fillEllipse.mock.calls.at(-1)!;
 expect(narrow[0]).toBe(wide[0]);expect(narrow[1]).toBe(wide[1]);expect(narrow[2]).toBeLessThan(wide[2]);
 const count=g.fillEllipse.mock.calls.length;film.close();film.reframe();expect(g.fillEllipse).toHaveBeenCalledTimes(count);expect(g.destroy).toHaveBeenCalledOnce();
});
