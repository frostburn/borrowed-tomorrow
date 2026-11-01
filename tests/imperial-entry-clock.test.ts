import {EventEmitter} from 'node:events';
import {afterEach,expect,it,vi} from 'vitest';
import {IMPERIAL_WALK_MS,IMPERIAL_CLOSE_MS,IMPERIAL_UNFOLD_MS} from '../src/content/imperial-entry';
import {ImperialEntry} from '../src/game/imperial-entry';

const {Image}=vi.hoisted(()=>({Image:class {
 active=true;visible=true;alpha=1;depth=0;x=0;y=0;data=new Map<string,unknown>();
 setOrigin(){return this;}setScale(){return this;}setRotation(){return this;}
 setDepth(n:number){this.depth=n;return this;}setPosition(x:number,y:number){this.x=x;this.y=y;return this;}
 setAlpha(n:number){this.alpha=n;return this;}setVisible(n:boolean){this.visible=n;return this;}
 getData(k:string){return this.data.get(k);}setData(k:string,v:unknown){this.data.set(k,v);return this;}
 destroy(){this.active=false;}
}}));
vi.mock('phaser',()=>({default:{GameObjects:{Image},Scenes:{Events:{UPDATE:'update'}}}}));
vi.mock('../src/game/boss-display',()=>({nativeTexture:()=>{}}));
afterEach(()=>vi.unstubAllGlobals());

function stage(reduced=false){
 vi.stubGlobal('window',{matchMedia:()=>({matches:reduced})});
 const events=new EventEmitter(),time={now:0},human=new Image().setData('world-actor',true),sound=vi.fn();
 const world={list:[]as InstanceType<typeof Image>[],add(image:InstanceType<typeof Image>){this.list.push(image);},sort(){}};
 const scene={time,events,add:{image:()=>new Image()}},entry=new ImperialEntry(scene as never,world as never,human as never,sound);
 return {entry,human,sound,events,world,advance:(now:number)=>{time.now=now;events.emit('update');}};
}

it('automatically closes after the climb without another dialogue advance, sounding only once',()=>{
 const s=stage();s.entry.play('imperial-enter');
 s.advance(IMPERIAL_WALK_MS-1);expect(s.human.visible).toBe(true);expect(s.human.alpha).toBe(1);expect(s.sound).not.toHaveBeenCalled();
 s.advance(IMPERIAL_WALK_MS);expect(s.sound).toHaveBeenCalledTimes(1);expect(s.entry.animating).toBe(true);
 s.advance(IMPERIAL_WALK_MS+IMPERIAL_CLOSE_MS);expect(s.human.visible).toBe(false);expect(s.entry.animating).toBe(false);
 s.entry.play('imperial-unfold');s.advance(IMPERIAL_WALK_MS+IMPERIAL_CLOSE_MS+IMPERIAL_UNFOLD_MS);
 expect(s.entry.animating).toBe(false);expect(s.sound).toHaveBeenCalledTimes(1);s.entry.close();expect(s.events.listenerCount('update')).toBe(0);
});

for(const reduced of [false,true])it(`settles the whole climb and closure with ${reduced?'reduced motion':'early advance'}`,()=>{
 const s=stage(reduced);s.entry.play('imperial-enter');s.entry.settle();s.entry.settle();
 expect(s.human.visible).toBe(false);expect(s.sound).toHaveBeenCalledTimes(1);expect(s.entry.animating).toBe(false);
 s.entry.play('imperial-unfold');s.entry.settle();expect(s.world.list.every(image=>!image.visible)).toBe(true);
 s.entry.close();s.advance(10000);expect(s.sound).toHaveBeenCalledTimes(1);expect(s.human.visible).toBe(true);expect(s.human.getData('world-actor')).toBe(true);
});

it('skipping the climb removes its automatic closure and delayed sound',()=>{
 const s=stage();s.entry.play('imperial-enter');s.advance(400);s.entry.close();s.advance(10000);
 expect(s.sound).not.toHaveBeenCalled();expect(s.events.listenerCount('update')).toBe(0);expect(s.human.visible).toBe(true);expect(s.world.list.every(image=>!image.active)).toBe(true);
});
