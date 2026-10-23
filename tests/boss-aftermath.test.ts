import {expect,it} from 'vitest';
import {BOSS_AFTERMATHS} from '../src/content/boss-aftermath';
import {CHAPTERS} from '../src/content/chapters';
import {resumeChapter} from '../src/content/story';
import {MAPS} from '../src/content/maps';
import {interactionMarker} from '../src/content/interaction-markers';
import {newGame,type GameState} from '../src/rules/state';
import type {StoryHost} from '../src/content/story-host';
import type {Dialogue} from '../src/content/dialogue';

for(const scene of BOSS_AFTERMATHS)it(`resumes ${scene.map}'s blocked scene after victory, without a second arena marker`,()=>{
 const state=newGame();
 state.chapter=(Object.keys(CHAPTERS) as GameState['chapter'][]).find(id=>CHAPTERS[id].maps.includes(scene.map))!;
 state.location={map:scene.map,x:20,y:20};
 const object=MAPS[scene.map].objects.find(o=>o.id===scene.interaction)!;
 expect(object).toBeDefined();expect(interactionMarker(object,state)).toBeUndefined();
 let dialogue:Dialogue|undefined;
 const host:StoryHost={state,talk:d=>{dialogue=d;},commit:flag=>{state.flags[flag]=true;},refresh(){},save(){},async checkpoint(){return true;},travel:(map,x,y)=>{state.location={map,x,y};},battle(){throw new Error('The defeated boss must not restart');},shop(){},boundary(){},toast(){},endingMusic(){}};
 state.flags[scene.won]=true;
 const gear=structuredClone(state.inventory),formation=[...state.activeParty],money=state.coins;
 // The same entry point runs after the victory panel and on save restoration.
 resumeChapter(host);expect(dialogue?.done).toBeTypeOf('function');
 expect(state.flags[scene.done]).toBeUndefined();
 expect(interactionMarker(object,state)).toBeUndefined();
 // Interrupting before completion replays the scene without committing it.
 dialogue=undefined;resumeChapter(host);expect(dialogue?.done).toBeTypeOf('function');
 const completed=dialogue;dialogue!.done!();expect(state.flags[scene.done]).toBe(true);
 expect(state.inventory).toEqual(gear);expect(state.activeParty).toEqual(formation);expect(state.coins).toBe(money);
 dialogue=undefined;resumeChapter(host);
 // Other arrival scenes may still run in this deliberately minimal fixture,
 // but the completed aftermath must never run again.
 expect(state.flags[scene.done]).toBe(true);expect(dialogue?.scene).not.toBe(completed!.scene);
});
