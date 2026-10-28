import { BOSS_AFTERMATHS } from './boss-aftermath';
import { trainApproachBlock } from './chapter-two/access';
import { completedAnchors } from './chapter-five/progress';
import type { MapObject } from './maps';
import type { GameState } from '../rules/state';

export type InteractionKind = 'rest' | 'story' | 'optional' | 'talk' | 'exit';
export const INTERACTION_MARKERS = {
 story:{glyph:'!',color:'#f4c77a',label:'Story'},
 rest:{glyph:'⌂',color:'#9bc9d5',label:'Rest & supplies'},
 optional:{glyph:'◇',color:'#8cc68e',label:'Optional reward / encounter'},
 talk:{glyph:'…',color:'#a9bdc4',label:'Conversation'},
 exit:{glyph:'→',color:'#76c6df',label:'Exit'},
} as const;
export const BLOCKED_MARKER_COLOR='#7c8990';
/** Canvas-only icon, authored in both pixel masks; never an emoji/font fallback. */
export const GYM_GLYPH='\uE000';
export function offersTraining(object:MapObject,state:Pick<GameState,'flags'>):boolean {
 const f=state.flags;if(!f.airshipOwned)return false;
 if(['ship-supply','six-supplies','sill-rest','refuge-seven-rest','capital-crew','capital-departure'].includes(object.id))return true;
 if(['hammer-hester','hammer-hester-after'].includes(object.id))return !!f.hammerplainComplete;
 if(['dawn-gate','dawn-soldier','dawn-soldier-after'].includes(object.id))return !!f.dawnwatchComplete;
 if(['wind-sera','wind-lift-sera'].includes(object.id))return !!f.windmereComplete;
 if(['river-tavi','river-stores','rainhouse-rest'].includes(object.id))return !!f.riverRestSeen;
 return ['palace-rest','crown-rest'].includes(object.id)&&!!f.nellRecovered;
}

export function interactionKind(object:MapObject,state:Pick<GameState,'flags'>):InteractionKind {
 if(object.rest)return 'rest';
 return object.kind==='story'&&((object.storyUntil&&state.flags[object.storyUntil])||(object.doneFlag&&state.flags[object.doneFlag]))?'talk':object.kind;
}
export function interactionMarker(object:MapObject,state:Pick<GameState,'flags'>){
 if(object.marker===false)return;
 if(object.doneFlag&&state.flags[object.doneFlag])return;
 // The boss owns this arena's story cue; its follow-up starts automatically.
 if(BOSS_AFTERMATHS.some(scene=>scene.interaction===object.id&&!state.flags[scene.done]))return;
 const marker=INTERACTION_MARKERS[interactionKind(object,state)];
 // Marker-only prerequisites keep useful blocked-route dialogue available.
 const blockWhile=object.markerBlockFlags?.split(',').every(term=>{const flag=term.trim();return flag.startsWith('!')?!state.flags[flag.slice(1)]:!!state.flags[flag];});
 const blocked=blockWhile||(object.accessFlag&&!state.flags[object.accessFlag])||object.markerFlags?.split(',').some(flag=>!state.flags[flag.trim()])||(object.id==='ship-cabin'&&completedAnchors(state)<2)||((object.id==='loading-gate'||object.id==='signal-walk')&&trainApproachBlock(state,object.id==='signal-walk'));
 const gym=offersTraining(object,state);
 return {...marker,...(gym?{glyph:interactionKind(object,state)==='talk'?GYM_GLYPH:marker.glyph+GYM_GLYPH,label:interactionKind(object,state)==='talk'?'Training & improvements':`${marker.label} & training`}:{}),color:blocked?BLOCKED_MARKER_COLOR:marker.color};
}
