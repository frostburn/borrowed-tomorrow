import type { MapObject } from './maps';
import type { GameState } from '../rules/state';

export type InteractionKind = 'story' | 'optional' | 'talk' | 'exit';
export const INTERACTION_MARKERS = {
 story:{glyph:'!',color:'#f4c77a',label:'Story'},
 optional:{glyph:'◇',color:'#8cc68e',label:'Optional'},
 talk:{glyph:'…',color:'#a9bdc4',label:'Conversation'},
 exit:{glyph:'→',color:'#76c6df',label:'Exit'},
} as const;
export function interactionKind(object:MapObject,state:Pick<GameState,'flags'>):InteractionKind {
 return object.kind==='story'&&((object.storyUntil&&state.flags[object.storyUntil])||(object.doneFlag&&state.flags[object.doneFlag]))?'talk':object.kind;
}
export function interactionMarker(object:MapObject,state:Pick<GameState,'flags'>){
 if(object.doneFlag&&state.flags[object.doneFlag])return;
 const marker=INTERACTION_MARKERS[interactionKind(object,state)];
 return {...marker,color:object.accessFlag&&!state.flags[object.accessFlag]?'#7c8990':marker.color};
}
