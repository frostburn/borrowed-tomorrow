import {expect,it} from 'vitest';
import {chapterSevenDeparture,chapterSevenStart,chapterSevenRefugeStart} from '../src/dev/canonical-saves';
import {beginChapterSeven,level,remember} from '../src/rules/state';
import {decodeSave} from '../src/rules/save';
import {resumeChapter,interactChapter} from '../src/content/story';
import {createBattle,awardVictory} from '../src/rules/combat';
import {arrival,MAPS,walkable,worldPath,visibleObjects,visiblePeople} from '../src/content/maps';
import {visibleSceneArt} from '../src/content/scene-art';
import {SEVEN_PREREQUISITES,SEVEN_MAP_IDS} from '../src/content/chapter-seven/progress';
import type {StoryHost} from '../src/content/story-host';
import type {Dialogue} from '../src/content/dialogue';
import * as scenes from '../src/content/chapter-seven/scenes';
function journey(state=chapterSevenStart()){
 let d:Dialogue|undefined,encounter='',end=false;
 const valid=()=>expect(decodeSave(JSON.stringify(state))).toEqual(state);
 const h:StoryHost={state,talk:next=>{d=next;},commit:(flag,entry)=>{state.flags[flag]=true;if(entry)remember(state,entry);valid();},refresh(){},save:valid,async checkpoint(){return true;},travel:(map,x,y)=>{state.location={map,x,y};valid();resumeChapter(h);},battle:id=>{encounter=id;},shop(){},boundary(){end=true;},toast(){},endingMusic(){}};
 const finish=()=>{for(let i=0;d?.done&&i<12;i++){const read=d;d=undefined;read.done!();}};
 const act=(id:string)=>{d=undefined;interactChapter(h,id);finish();};
 const choose=(index=0)=>{const read=d;d=undefined;read!.choices![index].action();finish();};
 const win=()=>{const b=createBattle(encounter,state);b.result='victory';awardVictory(b,state);const earned=structuredClone(state);awardVictory(b,state);expect(state).toEqual(earned);valid();resumeChapter(h);finish();};
 return {s:state,h,valid,finish,act,choose,win,read:()=>d,ended:()=>end,encounter:()=>encounter};
}
it('withdraws the opening god on scene completion and keeps the cleared crossing on restore',()=>{
 const j=journey(),tiles=MAPS.hollowsill.tiles!,god='scene-seven-hollowsill-distant-god';
 resumeChapter(j.h);const d=j.read()!;
 expect(d.lines[3].shot).toMatchObject({focus:{x:32,y:22},duration:2200});
 expect(d.lines.some(l=>l.who==='The Benefactor')).toBe(true);expect(d.lines.some(l=>l.shot?.effect==='domain-withdraw')).toBe(true);
 expect(visibleSceneArt(tiles,j.s)!.some(p=>p.key===god)).toBe(true);expect(j.s.flags.domainEntered).toBeUndefined();
 j.finish();const restored=journey(decodeSave(JSON.stringify(j.s)));resumeChapter(restored.h);
 expect(restored.read()).toBeUndefined();expect(visibleSceneArt(tiles,restored.s)!.some(p=>p.key===god)).toBe(false);
 restored.act('sill-cross');expect(restored.s.location.map).toBe('takenwater');
});
it('places the hospice patient in front of her bed and removes defeated courier-stair hunters',()=>{
 const s=chapterSevenStart(),patient=visiblePeople(MAPS.quietward,s).find(p=>p.id==='old-patient')!;
 const bed=visibleSceneArt(MAPS.quietward.tiles!,s)!.find(p=>p.key.endsWith('western-bed'))!;
 expect((patient.y+.5)*24+7).toBeGreaterThan(bed.depth);
 const j=journey(chapterSevenRefugeStart());j.s.location=arrival('seasonstreet','start');
 expect(visibleObjects(MAPS.seasonstreet,j.s).some(o=>o.id==='season-patrol')).toBe(true);
 const supplies=MAPS.seasonstreet.objects.find(o=>o.id==='season-rest')!;expect(supplies.accessFlag).toBe('domainPatrolWon');
 j.s.party[0].hp=1;j.act('season-rest');expect(j.read()?.choices).toBeUndefined();expect(j.s.party[0].hp).toBe(1);
 j.act('season-patrol');j.choose();j.win();
 j.act('season-rest');expect(j.read()?.choices?.[0].label).toContain('Rest');j.choose();expect(j.s.party[0].hp).toBeGreaterThan(1);
 expect(j.s.flags.domainPatrolWon).toBe(true);expect(visibleObjects(MAPS.seasonstreet,decodeSave(JSON.stringify(j.s))).some(o=>o.id==='season-patrol')).toBe(false);
});
it('opens only the recovered departure after loading, preserving actual formation and resources',()=>{
 const s=chapterSevenDeparture();s.activeParty=['orrin'];s.party[0].hp=23;s.bandages=3;s.playSeconds=322;const before=structuredClone(s);
 expect(beginChapterSeven(s)).toBe(true);expect(s.chapter).toBe('chapter-seven');expect(s.boundary).toBeNull();
 for(const key of ['party','activeParty','coins','bandages','xp','inventory','flags','journal','playSeconds']as const)expect(s[key]).toEqual(before[key]);
 expect(decodeSave(JSON.stringify(s))).toEqual(s);expect(beginChapterSeven(s)).toBe(false);
 const bad=chapterSevenDeparture();bad.flags.nellRecovered=false;expect(beginChapterSeven(bad)).toBe(false);
});
it('plays the guardian sequence, all three forms and the real holiday without resetting history or rewards',()=>{
 const j=journey(),s=j.s,formation=[...s.activeParty],loadout=structuredClone(s.inventory.characters);resumeChapter(j.h);j.finish();
 j.act('sill-cross');j.act('water-hounds');j.choose();j.win();j.act('water-collector');j.choose();j.win();expect(s.flags.takenPeopleFreed).toBe(true);
 j.act('water-field');j.act('field-furnace');j.choose();j.win();j.act('field-reflector');j.act('field-ward');j.act('ward-engine-seven');j.choose();j.win();
 j.act('ward-seasons');j.act('season-patrol');j.choose();j.win();j.act('season-dragon');j.choose();j.win();j.act('season-refuge');
 j.act('refuge-seven-rest');j.choose();j.act('refuge-preparations');j.choose();
 for(const flag of ['benefactorBodyWon','benefactorSunWon','benefactorHeartWon']){j.act('throne-fight');j.choose();j.win();expect(s.flags[flag]).toBe(true);}
 expect(s.location.map).toBe('homecoming');expect(s.flags.daysReturned).toBe(true);j.act('home-train');expect(s.location.map).toBe('seaholiday');j.act('sea-ending');
 expect(j.ended()).toBe(true);expect(s.flags.chapterSevenComplete).toBe(true);expect(s.boundary).toBeNull();expect(s.flags.lightbearerWon).toBeUndefined();
 expect(s.flags).toMatchObject({tomasRescued:true,albanDestroyed:true,emperorWon:true,nellRecovered:true,chapterSixComplete:true,fragmentReturned:true});
 expect(s.activeParty).toEqual(formation);expect(s.inventory.characters).toEqual(loadout);expect(s.inventory.bag).toMatchObject({'morning-reflector':1,'first-valve':1,'first-focus':1,'open-guard':1,'farroad-sight':1});j.valid();
 expect(level(s)).toBeGreaterThanOrEqual(14);
});
it('replays interrupted source releases and final transformations, with retreat between forms',()=>{
 const j=journey(chapterSevenRefugeStart());resumeChapter(j.h);j.finish();j.act('refuge-preparations');j.choose();j.act('throne-fight');j.choose();
 const b=createBattle(j.encounter(),j.s);b.result='victory';awardVictory(b,j.s);resumeChapter(j.h);expect(j.read()?.scene?.id).toBe('seven-sun');expect(j.s.flags.hollowSunSeen).toBeUndefined();
 const restored=journey(decodeSave(JSON.stringify(j.s)));resumeChapter(restored.h);expect(restored.read()?.scene?.id).toBe('seven-sun');restored.finish();
 restored.act('throne-retreat');expect(restored.s.location.map).toBe('lastrefuge');restored.act('refuge-preparations');restored.choose();restored.act('throne-fight');restored.choose();expect(restored.encounter()).toBe('benefactor-sun');
});
it('rejects missing prerequisites, route skips, old-chapter final flags and impossible endings',()=>{
 const start=chapterSevenStart(),final=chapterSevenRefugeStart();
 for(const [flag,parent]of Object.entries(SEVEN_PREREQUISITES)){
  const s=structuredClone(final);s.flags[flag]=true;s.flags[parent]=false;expect(()=>decodeSave(JSON.stringify(s)),flag).toThrow();
 }
 for(const map of ['firstfield','quietward','seasonstreet','lastrefuge','sunthrone','homecoming','seaholiday']as const){const s=structuredClone(start);s.location=arrival(map,'start');expect(()=>decodeSave(JSON.stringify(s)),map).toThrow();}
 const older=chapterSevenDeparture();older.flags.domainEntered=true;expect(()=>decodeSave(JSON.stringify(older))).toThrow();
 const ill=chapterSevenStart();ill.flags.nellRecovered=false;expect(()=>decodeSave(JSON.stringify(ill))).toThrow();
});
it('keeps all authored scene casts and destinations on connected real floor, with no revived antagonists',()=>{
 for(const map of SEVEN_MAP_IDS){const m=MAPS[map],s=chapterSevenRefugeStart();s.location=arrival(map,'start');
  expect(walkable(m,s.location.x,s.location.y,s),map).toBe(true);
  for(const o of m.objects){expect(walkable(m,o.x,o.y,s),map+':'+o.id).toBe(true);if(o.x!==s.location.x||o.y!==s.location.y)expect(worldPath(m,s.location,o,s).length,map+':'+o.id).toBeGreaterThan(0);}
 }
 for(const fn of Object.values(scenes)){const d=fn();expect(d.scene).toBeTruthy();const map=Object.values(MAPS).find(m=>m.tiles?.layers.some(l=>l.name==='Scene:'+d.scene!.id))!;
  for(const a of d.scene!.actors){expect(['alban','emperor','ansel']).not.toContain(a.id);expect(walkable(map,a.at.x,a.at.y),d.scene!.id+':'+a.id).toBe(true);}
 }
});

it('keeps the temporary god and each revealed form individually live through ground caching',()=>{
 for(const [map,names]of [['hollowsill',['distant-god']],['sunthrone',['monument','revealed-sun','revealed-heart']]]as const){
  for(const name of names){
   const layers=MAPS[map].tiles!.layers;
   const body=layers.find(l=>l.name===name)!,glow=layers.find(l=>l.name===name+'-spill')!;
   expect(body,`${map}:${name}`).toBeDefined();expect(glow).toBeDefined();
   const props=(l:typeof body)=>Object.fromEntries((l.properties??[]).map(p=>[p.name,p.value]));
   expect(props(body).live).toBe(true);expect(props(glow)).toEqual(props(body));
  }
 }
});
