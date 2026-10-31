import {afterEach,expect,it,vi} from 'vitest';
import type Phaser from 'phaser';
import type {ScenePiece} from '../src/content/scene-art';
import {MAPS} from '../src/content/maps';

const {Image}=vi.hoisted(()=>({Image:class {
 active=true;x=0;y=0;rotation=0;originX=0;originY=0;piece?:ScenePiece;
 getData(){return this.piece;}
 setOrigin(x:number,y:number){this.originX=x;this.originY=y;return this;}
 setPosition(x:number,y:number){this.x=x;this.y=y;return this;}
 setRotation(rotation:number){this.rotation=rotation;return this;}
 setDepth(){return this;}
 destroy(){this.active=false;}
}}));
vi.mock('phaser',()=>({default:{GameObjects:{Image}}}));
import {MapLife} from '../src/game/map-life';

afterEach(()=>vi.unstubAllGlobals());
it('pauses scenery with menus, bounds resumed time and returns to authored poses for reduced motion',()=>{
 const reduced={matches:false};vi.stubGlobal('window',{matchMedia:()=>reduced});
 const image=new Image();image.piece={key:'test-boat',url:'boat.svg',x:80,y:90,width:74,height:134,depth:-999.2,layerId:1,motion:{kind:'sail',distance:48}};
 const world={list:[image],sort(){}};
 const flags={festivalSeen:true};const saved=structuredClone(flags);
 const life=new MapLife({}as Phaser.Scene,world as unknown as Phaser.GameObjects.Container,{...MAPS.station,tiles:undefined},{flags});
 expect(life.inspect().boats).toBe(1);expect(life.takeFrame()).toBe(true);
 const first=image.x;
 for(let i=0;i<1000;i++)life.update(16);
 expect(image.x).not.toBe(first);expect(image.y).toBe(90);
 life.takeFrame();const parked=image.x,frame=life.inspect().frame;
 for(let i=0;i<200;i++)life.update(120,true);
 expect(image.x).toBe(parked);expect(life.inspect().frame).toBe(frame);expect(life.takeFrame()).toBe(false);
 life.update(30000);expect(life.inspect().frame-frame).toBe(120);
 reduced.matches=true;life.update(120,true);
 expect([image.x,image.y,image.rotation]).toEqual([80,90,0]);expect(life.inspect().frame).toBe(-1);
 life.takeFrame();life.update(120);expect(life.takeFrame()).toBe(false);
 reduced.matches=false;life.update(120);expect(life.takeFrame()).toBe(true);
 life.close();const closed=image.x;life.update(120);expect(image.x).toBe(closed);expect(life.takeFrame()).toBe(false);
 expect(flags).toEqual(saved);
});

it('does not start ambient updates on an arrested map',()=>{
 vi.stubGlobal('window',{matchMedia:()=>({matches:false})});
 const image=new Image();image.piece={key:'test-ferry',url:'ferry.svg',x:80,y:90,width:192,height:192,depth:420,layerId:1,motion:{kind:'moored'}};
 const world={list:[image],sort(){}};
 const life=new MapLife({}as Phaser.Scene,world as unknown as Phaser.GameObjects.Container,{...MAPS.breakwater,tiles:undefined},{flags:{harborOpened:true}});
 for(let i=0;i<200;i++)life.update(120);
 expect(life.inspect().enabled).toBe(false);expect(life.takeFrame()).toBe(false);expect([image.x,image.y]).toEqual([80,90]);
 life.close();
});

it('destroys the old map exhaust surfaces and stops requesting passive redraws',()=>{
 vi.stubGlobal('window',{matchMedia:()=>({matches:false})});
 const images:InstanceType<typeof Image>[]=[];
 const scene={add:{existing:(image:InstanceType<typeof Image>)=>{images.push(image);return image;}}};
 const world={list:[],add(){},sort(){}};
 const life=new MapLife(scene as unknown as Phaser.Scene,world as unknown as Phaser.GameObjects.Container,MAPS.tunnel,{flags:{}});
 expect(images).toHaveLength(1);expect(life.inspect().steam).toBe(1);expect(life.takeFrame()).toBe(true);
 life.close();expect(images.every(image=>!image.active)).toBe(true);life.update(120);expect(life.takeFrame()).toBe(false);
});
