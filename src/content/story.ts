import { pendingBossAftermath } from './boss-aftermath';
import { CHAPTERS } from './chapters';
import type { StoryHost } from './story-host';
import type { GameState } from '../rules/state';
export { CHAPTER } from './chapter-one/story';

export const JOURNAL=Object.assign({},...Object.values(CHAPTERS).map(chapter=>chapter.story.journal)) as Record<string,{title:string;text:string}>;
export const objective=(state:GameState)=>CHAPTERS[state.chapter].story.objective(state);
export const resumeChapter=(host:StoryHost)=>{
 const aftermath=pendingBossAftermath(host.state);
 if(aftermath)return interactChapter(host,aftermath.interaction);
 return CHAPTERS[host.state.chapter].story.resume(host);
};
export const interactChapter=(host:StoryHost,id:string)=>CHAPTERS[host.state.chapter].story.interact(host,id);
