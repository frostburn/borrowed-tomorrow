import { expect,it } from 'vitest';
import { readFileSync,statSync } from 'node:fs';
import { chapterSixCapitalStart,chapterSixFinaleStart } from '../src/dev/canonical-saves';
import { interactChapterSix,resumeChapterSix } from '../src/content/chapter-six/interactions';
import { ENCOUNTERS } from '../src/content/chapter-six/capital/encounters';
import { arrival,MAPS,walkable,worldPath,visibleObjects } from '../src/content/maps';
import { sceneAssets } from '../src/content/scene-art';
import { decodeSave } from '../src/rules/save';
import { remember,SEVENTH_CHAPTER,type GameState } from '../src/rules/state';
import { awardVictory,createBattle,damage,enemyTurn,shape,targets } from '../src/rules/combat';
import { imperialCore,imperialSupports,prepareImperial } from '../src/rules/imperial-vessel';
import { occupiedHexes } from '../src/rules/footprint';
import { inside,key,offset } from '../src/rules/hex';
import type { StoryHost } from '../src/content/story-host';
import type { Dialogue } from '../src/content/dialogue';
import { completeRiverTreatment } from '../src/content/chapter-six/jungle/recovery';
import { ARRANGEMENTS,scoreBar,scoreLength,scorePosition,type MusicMode } from '../src/game/score';
import { performanceBar } from '../src/game/score-performance';
function story(s:GameState){
 let d:Dialogue|undefined,encounter='',returns:GameState|undefined,canSave=true,boundary=0;const read:Dialogue[]=[];
 const valid=()=>expect(decodeSave(JSON.stringify(s))).toEqual(s);
 const h:StoryHost={state:s,talk:v=>{d=v;read.push(v);},commit:(f,e)=>{s.flags[f]=true;if(e)remember(s,e);valid();},refresh(){},save:valid,async checkpoint(){if(canSave)returns=structuredClone(s);return canSave;},travel:(map,x,y)=>{s.location={map,x,y};valid();resumeChapterSix(h);},battle:id=>{encounter=id;},shop(){},boundary(){boundary++;},toast(){},endingMusic(){}};
 const finish=()=>{for(let i=0;d&&!d.choices&&i<20;i++){const v=d;d=undefined;v.done?.();}};
 const choose=async(label:string)=>{const c=d?.choices?.find(c=>c.label.includes(label));expect(c,label).toBeDefined();d=undefined;c!.action();await Promise.resolve();await Promise.resolve();};
 const touch=(id:string)=>{d=undefined;interactChapterSix(h,id);finish();};
 const win=()=>{const b=createBattle(encounter,s);b.result='victory';awardVictory(b,s);valid();resumeChapterSix(h);finish();};
 return {s,h,valid,finish,choose,touch,win,read,begin(){resumeChapterSix(h);finish();},get dialog(){return d;},get encounter(){return encounter;},get returns(){return returns;},get boundary(){return boundary;},failCheckpoint(){canSave=false;}};
}
async function approach(recovered:boolean,reserve=false){
 const p=story(chapterSixCapitalStart(recovered));if(reserve)p.s.activeParty=['kit','orrin','petra'];p.begin();p.touch('capital-inner');p.touch('city-procession');await p.choose('Clear the procession');p.win();p.touch('city-release');p.touch('city-palace');p.touch('palace-command');await p.choose('Break the palace');p.win();
 if(recovered){p.touch('palace-preparations');expect(p.s.location.map).toBe('lastmorning');p.finish();p.touch('morning-ansel');p.touch('morning-leave');expect(p.s.location.map).toBe('lastpalace');}
 return p;
}
for(const recovered of [false,true])it(`capital route with ${recovered?'recovered':'ill'} Nell commits only its earned outcome and preserves the return save`,async()=>{
 const p=await approach(recovered,true),formation=[...p.s.activeParty];p.touch('palace-preparations');await p.choose(recovered?'Climb the crown':'Proceed with Nell');p.finish();
 expect(p.returns).toBeDefined();expect(p.returns!.flags.capitalAssaultCommitted).toBeFalsy();expect(p.returns!.location.map).toBe('lastpalace');expect(p.s.activeParty).toEqual(formation);expect(p.s.flags.capitalRiskAccepted).toBe(!recovered);
 p.touch('capital-emperor');await p.choose('Face the Emperor');const afterVictory=p.read.length;p.win();expect(p.read.slice(afterVictory).flatMap(d=>d.lines).some(l=>l.who==='The Emperor')).toBe(false);
 if(recovered){expect(p.s.location.map).toBe('capitalquay');expect(p.s.flags.capitalReleased).toBe(true);expect(p.s.flags.lightbearerSeen).toBeFalsy();p.touch('capital-crew');await p.choose('Prepare the final');expect(p.s.boundary).toBe(SEVENTH_CHAPTER);expect(p.s.flags.chapterSixComplete).toBe(true);}
 else{expect(p.s.flags.lightbearerSeen).toBe(true);expect(p.s.flags.capitalAudienceSeen).toBeFalsy();p.touch('capital-lightbearer');await p.choose('Face the Lightbearer');p.win();expect(p.s.location.map).toBe('laststation');expect(p.s.flags.nellLost).toBe(true);expect(p.s.party.find(h=>h.id==='nell')!.hp).toBe(0);p.touch('last-ending');expect(p.s.flags.lightbearerEnding).toBe(true);expect(p.s.boundary).toBeNull();expect(p.s.flags.chapterSixComplete).toBeFalsy();expect(p.read.flatMap(d=>d.lines).some(l=>l.who==='Nell'||l.who==='Ansel')).toBe(false);}
 expect(p.boundary).toBe(1);p.valid();expect(decodeSave(JSON.stringify(p.returns)).flags.capitalAssaultCommitted).toBeFalsy();
});
it('an interrupted coast vision replays, then Nell wakes and refuses without changing the formation',()=>{
 const s=chapterSixFinaleStart(true);for(const f of ['capitalAudienceSeen','capitalMorningSeen','capitalMorningQuestion','capitalMorningLeft'])delete s.flags[f];s.activeParty=['kit','orrin','petra'];
 const p=story(s);p.begin();expect(p.s.location.map).toBe('lastmorning');interactChapterSix(p.h,'morning-leave');expect(p.s.location.map).toBe('lastshore');expect(p.s.flags.capitalMorningQuestion).toBeFalsy();
 const q=story(decodeSave(JSON.stringify(p.s)));q.begin();expect(q.s.location.map).toBe('lastpalace');expect(q.s.flags.capitalMorningQuestion&&q.s.flags.capitalMorningLeft).toBe(true);expect(q.s.activeParty).toEqual(['kit','orrin','petra']);expect(q.read.map(d=>d.scene?.id)).toEqual(['six-memory-sea','six-memory-wake']);
});
it('the pre-assault save must succeed before committing the irreversible route',async()=>{
 const p=story(chapterSixFinaleStart(false));p.failCheckpoint();p.touch('palace-preparations');expect(p.dialog?.lines.some(l=>l.text.includes('still be bound'))).toBe(true);await p.choose('Proceed with Nell');expect(p.s.flags.capitalAssaultCommitted).toBeFalsy();expect(p.s.location.map).toBe('lastpalace');expect(p.returns).toBeUndefined();
});
it('retrying a committed stair never overwrites the pre-assault return checkpoint',async()=>{
 const p=story(chapterSixFinaleStart(false));p.touch('palace-preparations');await p.choose('Proceed with Nell');p.finish();const before=structuredClone(p.returns);p.s.location=arrival('lastpalace','memory');p.touch('palace-preparations');expect(p.s.location.map).toBe('crown');expect(p.returns).toEqual(before);expect(p.returns!.flags.capitalAssaultCommitted).toBeFalsy();
});
it('choosing Iria at the warning preserves the capital and permits the recovered memory route',async()=>{
 const p=story(chapterSixFinaleStart(false)),before=structuredClone(p.s);p.touch('palace-preparations');await p.choose('Return to Iria');expect(p.s.location.map).toBe('riverhaven');expect(p.s.flags.capitalAssaultCommitted).toBeFalsy();
 // Finish the existing treatment checkpoint chain, with the normal mutation.
 for(const f of ['riverSeen','riverCrossingSeen','riverPatrolConfronted','riverPatrolWon','riverChainOpen','rainhouseSeen','rainhouseConfronted','rainhouseWon'])p.s.flags[f]=true;
 expect(completeRiverTreatment(p.s)).toBe(true);expect(p.s.inventory.characters).toEqual(before.inventory.characters);expect(p.s.activeParty).toEqual(before.activeParty);expect(p.s.flags.capitalHallOpened).toBe(true);
 p.s.location=arrival('lastpalace','memory');p.begin();expect(p.s.location.map).toBe('lastmorning');expect(p.read.flatMap(d=>d.lines).some(l=>l.who==='Nell')).toBe(true);p.valid();
});
it('forged outcomes, remote remembered mornings and post-commit cures are rejected',()=>{
 for(const recovered of [false,true]){
  const s=chapterSixFinaleStart(recovered);for(const mutate of [(v:GameState)=>{v.flags.capitalReleased=true;},(v:GameState)=>{v.flags.lightbearerEnding=true;},(v:GameState)=>{v.boundary=SEVENTH_CHAPTER;}]){const v=structuredClone(s);mutate(v);expect(()=>decodeSave(JSON.stringify(v))).toThrow();}
 }
 const s=chapterSixFinaleStart(false);s.flags.capitalAudienceSeen=true;expect(()=>decodeSave(JSON.stringify(s))).toThrow();s.flags.capitalAudienceSeen=false;s.flags.capitalAssaultCommitted=true;s.flags.capitalRiskAccepted=true;s.flags.rainhouseWon=true;expect(completeRiverTreatment(s)).toBe(false);
});
it('canonical starts own their flags, rewards and formations without reading storage',()=>{
 for(const recovered of [false,true])for(const make of [chapterSixCapitalStart,chapterSixFinaleStart]){const a=make(recovered),b=make(recovered);expect(a).toEqual(b);expect(a.flags.northSealBroken&&a.flags.desertSealBroken).toBe(true);expect(a.flags.nellRecovered??false).toBe(recovered);expect(a.flags.emperorWon).toBeFalsy();expect(a.flags.capitalAssaultCommitted).toBeFalsy();expect(decodeSave(JSON.stringify(a))).toEqual(a);}
});
function boss(light=false){const b=createBattle(ENCOUNTERS[light?'lightbearer':'imperial-vessel'],chapterSixFinaleStart(light?false:true));return {b,core:imperialCore(b)!};}
it('imperial bodies and passive supports have disjoint legal contacts and areas hit each unit once',()=>{
 const {b,core}=boss(),contacts=b.units.flatMap(u=>occupiedHexes(u));expect(contacts.every(inside)).toBe(true);expect(new Set(contacts.map(key)).size).toBe(contacts.length);expect(occupiedHexes(core)).toHaveLength(7);expect(imperialSupports(b).every(p=>p.passive&&!b.queue.includes(p.id))).toBe(true);
 const hero=b.units[0];hero.hex=offset(5,4);b.queue=[hero.id];hero.focus=6;expect(targets(b,hero,'burst',offset(5,2)).filter(u=>u.id===core.id)).toHaveLength(1);
 const shielded=damage(hero,core,'strike');for(const p of imperialSupports(b))p.hp=0;prepareImperial(b);expect(core.sealed).toBe(false);expect(damage(hero,core,'strike')).toBeGreaterThan(shielded);
});
it('a later coronation rebuilds half-strength vacant supports but never overlaps a hero',()=>{
 const {b,core}=boss(),[west,east]=imperialSupports(b);west.hp=east.hp=0;prepareImperial(b);expect(core.sealed).toBe(false);b.round=2;prepareImperial(b);expect(west.hp).toBe(0);
 b.units[0].hex={...west.hex};b.round=5;prepareImperial(b);expect(west.hp).toBe(0);expect(east.hp).toBe(Math.ceil(east.maxHp/2));expect(core.sealed).toBe(true);
 core.hp=0;prepareImperial(b);expect(imperialSupports(b).every(p=>p.hp===0)).toBe(true);
});
it('both bosses keep round-fixed shapes and Taunt redirects exactly the fired cells',()=>{
 for(const light of [false,true]){const {b,core}=boss(light),shapeBefore=structuredClone(core.intent!.cells);b.units[0].hex=offset(1,6);prepareImperial(b);expect(core.intent!.cells).toEqual(shapeBefore);core.tauntedBy=b.units[0].id;prepareImperial(b);expect(shape(b,core,'judgment',core.hex)).toEqual(occupiedHexes(b.units[0]));b.queue=[core.id];let fired=false;enemyTurn(b,undefined,()=>{fired=true;});expect(fired).toBe(true);}
});
it('Nell closes the lantern without spending Dazzle on a non-attack, and the mantle opens',()=>{
 const {b,core}=boss(true);b.round=4;prepareImperial(b);expect(core.armor).toBe(0);expect(core.intent!.cells).toEqual([]);core.tauntedBy=b.units[0].id;core.dazzledAttacks=3;prepareImperial(b);expect(core.intent!.cells).toEqual([]);b.queue=[core.id];let fired=false;enemyTurn(b,undefined,()=>{fired=true;});expect(fired).toBe(false);expect(core.dazzledAttacks).toBe(3);expect(b.round).toBe(5);
});
it('the final maps and art have real connected footing, named arrivals and bounded native SVG assets',()=>{
 const s=chapterSixFinaleStart(true);for(const f of ['capitalAudienceSeen','capitalMorningSeen','capitalMorningQuestion','capitalMorningLeft','capitalWarningSeen','capitalAssaultCommitted','emperorSeen','emperorConfronted','emperorWon','emperorFallen','capitalReleased'])s.flags[f]=true;s.flags.capitalRiskAccepted=false;
 for(const map of ['stillcity','lastpalace','lastmorning','lastshore','crown','laststation']as const){s.location=arrival(map,'start');const data=MAPS[map];expect(walkable(data,s.location.x,s.location.y,s)).toBe(true);for(const o of visibleObjects(data,s)){if(o.accessFlag)s.flags[o.accessFlag]=true;expect(walkable(data,o.x,o.y,s),`${map}:${o.id}`).toBe(true);expect(o.x===s.location.x&&o.y===s.location.y||worldPath(data,s.location,o,s).length>0,`${map}:${o.id}`).toBe(true);}for(const a of sceneAssets(data.tiles!)){expect(a.url.endsWith('.svg')).toBe(true);expect(statSync('public/'+a.url).size).toBeLessThan(131072);expect(readFileSync('public/'+a.url,'utf8')).not.toContain('data:image');}}
});
for(const mode of ['stillcity','lastpalace','capital-battle','emperor','lightbearer','laststation','capital-return']as MusicMode[])it(`${mode} has a complete expressive finite musical form and a clean score loop`,()=>{
 const a=ARRANGEMENTS[mode],count=scoreLength(mode),bars=[];for(let i=0;i<count;i++){const notes=scoreBar(mode,i);bars.push(JSON.stringify(notes));expect(notes.length).toBeGreaterThan(0);expect(performanceBar(mode,i).notes.every(n=>Number.isFinite(n.seconds+n.time)&&n.seconds>0)).toBe(true);for(const n of notes){expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(a.beats);expect(Number.isFinite(n.duration+n.velocity)).toBe(true);}}
 expect(new Set(bars).size).toBeGreaterThan(24);const intro=a.introBars??0;expect(scorePosition(mode,count)).toBe(intro);expect(scoreBar(mode,count)).toEqual(scoreBar(mode,intro));
});
