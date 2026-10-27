import {afterEach,expect,it,vi} from 'vitest';
import {readFileSync,statSync} from 'node:fs';
import type Phaser from 'phaser';
import {MAPS,visiblePeople,walkable,type MapPerson} from '../src/content/maps';
import {animatedPerson,PERSON_MOTION_PAGES,personPose,personStill,stepClear} from '../src/content/people-motion';
import {PeopleMotion} from '../src/game/people-motion';
import {newGame} from '../src/rules/state';

const traveler:MapPerson={id:'test-traveler',x:1,y:1,sprite:'civilian-traveler'};
it('keeps collected towns, bound people and projections still without freezing a working ward',()=>{
 for(const [map,flag]of [['rillbridge','villageFreed'],['cinderbank','coastCollectorWon']]){
  expect(personStill(map,traveler,{})).toBe(true);expect(personStill(map,traveler,{[flag]:true})).toBe(false);
 }
 expect(personStill('refuge',traveler,{})).toBe(false);
 expect(personStill('coast',{...traveler,projection:true},{})).toBe(true);
 const family=MAPS.hammerplain.people!.find(p=>p.id==='stopped-family')!;
 expect(personStill('hammerplain',family,{})).toBe(true);
 const state=newGame();state.flags.hammerplainFreed=true;
 expect(visiblePeople(MAPS.hammerplain,state).map(p=>p.id)).not.toContain(family.id);
 expect(personStill('hammerplain',MAPS.hammerplain.people!.find(p=>p.id==='home-family')!,state.flags)).toBe(false);
 for(const person of MAPS.takenwater.people!)expect(personStill('takenwater',person,{})).toBe(true);
});
it('stages at most two brief actions with long rests, native-pixel steps and exact returns',()=>{
 const people=[traveler,{...traveler,sprite:'civilian-family' as const},{...traveler,sprite:'civilian-patient' as const},traveler];
 let steps=0,gestures=0,idles=0;
 for(let t=0;t<60000;t+=40){
  const poses=people.map((p,i)=>personPose(p,t,i,people.length));
  expect(poses.filter(p=>p.motion!=='idle').length).toBeLessThanOrEqual(2);
  for(const [i,pose]of poses.entries()){
   expect(pose.dy%2).toBe(0);expect(pose.dy).toBeGreaterThanOrEqual(0);expect(pose.dy).toBeLessThanOrEqual(8);
   if(i===1||i===2)expect(pose.dy).toBe(0);
   if(pose.motion==='step')steps++;else if(pose.motion==='gesture')gestures++;else idles++;
  }
 }
 expect(steps).toBeGreaterThan(0);expect(gestures).toBeGreaterThan(0);expect(idles).toBeGreaterThan(steps+gestures);
 expect(personPose(traveler,0,0,1)).toEqual({dy:0,motion:'idle'});
 expect(personPose(traveler,5400,0,1)).toEqual({dy:0,motion:'idle'});
});
it('substitutes a stationary gesture when the feet would cross a blocked edge',()=>{
 const visited:number[]=[];
 expect(stepClear(traveler,(_x,y)=>{visited.push(y);return y===1;})).toBe(false);expect(visited).toContain(2);
 const pose=personPose(traveler,2200,0,1,false);expect(pose.dy).toBe(0);expect(pose.motion).toBe('gesture');expect(pose.frame).toBe(7);
 expect(animatedPerson('flagship-crew')).toBe(false);
});
it('keeps first-chapter extras on walkable footing and clears the festival after the raid',()=>{
 const s=newGame();
 for(const map of [MAPS.station,MAPS.rillbridge])for(const person of map.people!){
  expect(walkable(map,person.x,person.y,s)).toBe(true);
  expect(map.objects.every(o=>Math.hypot(person.x-o.x,person.y-o.y)>=2)).toBe(true);
 }
 expect(visiblePeople(MAPS.station,s)).toHaveLength(2);s.flags.raidSeen=true;expect(visiblePeople(MAPS.station,s)).toEqual([]);
});
it('ships bounded native vector motion pages for all nine roles and recolors',()=>{
 for(const page of PERSON_MOTION_PAGES){
  const path=`public/art/vector/${page.asset}.svg`,svg=readFileSync(path,'utf8');
  expect(svg).toContain(`width="160" height="${page.frames/2*80}"`);expect((svg.match(/<svg x=/g)??[]).length).toBe(page.frames);
  expect(statSync(path).size).toBeLessThan(131072);expect(svg).not.toMatch(/<image|<script|data:/);
 }
});

afterEach(()=>vi.unstubAllGlobals());
it('pauses its clock for dialogue and settles reduced motion to the authored stance',()=>{
 const preference={matches:false};vi.stubGlobal('window',{matchMedia:()=>preference});
 const map=MAPS.coast,person=map.people!.find(p=>p.id==='quay-parcels')!;
 const image={active:true,x:100,y:100,texture:{key:person.sprite as string},frame:{name:'__BASE' as string|number},setPosition(x:number,y:number){this.x=x;this.y=y;return this;},setTexture(key:string,frame:string|number){this.texture.key=key;this.frame.name=frame;return this;},setData(){return this;}};
 const motion=new PeopleMotion();motion.add(image as unknown as Phaser.GameObjects.Image,person,map,{flags:{}});
 for(let i=0;i<20;i++)motion.update(120,false);
 expect(image.y).toBeGreaterThan(100);expect(motion.takeFrame()).toBe(true);
 const before=structuredClone({x:image.x,y:image.y,key:image.texture.key,frame:image.frame.name});
 for(let i=0;i<30;i++)motion.update(120,true);
 expect({x:image.x,y:image.y,key:image.texture.key,frame:image.frame.name}).toEqual(before);expect(motion.takeFrame()).toBe(false);
 preference.matches=true;motion.update(120,true);expect(image.y).toBe(100);expect(image.texture.key).toBe(person.sprite);
 expect(motion.takeFrame()).toBe(true);motion.update(120,true);expect(motion.takeFrame()).toBe(false);
 motion.clear();preference.matches=false;motion.update(120,false);expect(motion.takeFrame()).toBe(false);
});
