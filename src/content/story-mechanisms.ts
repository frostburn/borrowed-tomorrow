import type {MapId} from '../rules/state';
export const MECHANISM_FRAMES=17;
export const MECHANISM_SHEETS={
 'coach-door':{map:'coast',target:'scene-two-prop-coast-prison-coach',width:264,height:168,flag:'prisonersFreed'},
 'harbor-gate':{map:'breakwater',target:'scene-four-harbor-gate-closed',width:312,height:192},
 'harbor-wheel':{map:'breakwater',target:'scene-four-harbor-wheel',width:80,height:96},
 'sanctuary-clamp':{map:'sanctuary',target:'scene-four-sanctuary-clamp-live',width:144,height:96},
 'cooling-wheel':{map:'coolingworks',target:'scene-five-cooling-wheel',width:90,height:100},
 'ward-wheel':{map:'dispensary',target:'scene-five-windmere-lift-wheel',width:90,height:100},
 'forge-anchor':{map:'anchorforge',target:'scene-five-forge-anchor',width:320,height:286,flag:'hammerplainFreed'},
 'watch-anchor':{map:'signalwall',target:'scene-five-watch-anchor',width:320,height:286,flag:'dawnwatchFreed'},
 'ward-shutters':{map:'mirrorward',target:'scene-five-windmere-engine',width:256,height:240,flag:'windmereFreed'},
 'north-windlass':{map:'frostwatch',target:'scene-six-watch-windlass',width:80,height:66},
 'season-gate':{map:'seasonstreet',target:'scene-mechanism-season-gate-closed',width:312,height:192},
} as const;
export type MechanismSheet=keyof typeof MECHANISM_SHEETS;
export const STORY_MECHANISMS={
 'coach-open':{sheets:['coach-door'],duration:1100},
 'harbor-open':{sheets:['harbor-wheel','harbor-gate'],duration:3200},
 'cable-release':{sheets:['sanctuary-clamp'],duration:1500},
 'cooling-open':{sheets:['cooling-wheel'],duration:1800},
 'water-wheel':{sheets:['ward-wheel'],duration:1400},
 'forge-release':{sheets:['forge-anchor'],duration:1600},
 'watch-release':{sheets:['watch-anchor'],duration:1600},
 'ward-release':{sheets:['ward-shutters'],duration:1400},
 'north-open':{sheets:['north-windlass'],duration:1700},
 'season-open':{sheets:['season-gate'],duration:1500},
} as const satisfies Record<string,{sheets:readonly MechanismSheet[];duration:number}>;
export type StoryMechanism=keyof typeof STORY_MECHANISMS;
export const mechanismTexture=(name:MechanismSheet)=>`scene-mechanism-${name}-poses`;
export const mechanismAssets=(map:MapId)=>Object.entries(MECHANISM_SHEETS).filter(([,d])=>d.map===map).map(([name])=>({key:mechanismTexture(name as MechanismSheet),url:`art/vector/story-mechanisms/${name}.svg`}));
/** These must retain individual images instead of entering a static ground cache. */
export const liveMechanismPiece=(key:string)=>['scene-five-gantry-signal','scene-five-watch-return-line','scene-five-gallery-light'].includes(key);
/** The ferry rounds the outside of the quay; its hull never cuts over paving. */
export function harborFerryPosition(progress:number,from:{x:number;y:number}){
 const t=Math.max(0,Math.min(1,progress));
 if(t<.3)return {x:from.x+(1632-from.x)*t/.3,y:from.y};
 if(t<.5)return {x:1632,y:from.y+(768-from.y)*(t-.3)/.2};
 return {x:1632+(36-1632)*(t-.5)/.5,y:768};
}

/** Static world and Maps review share the same native saved pose. */
export function mechanismPoseForPiece(key:string,flags:Record<string,boolean>){
 const match=Object.entries(MECHANISM_SHEETS).find(([,d])=>d.target===key);if(!match)return;
 const [name,d]=match;return {name:name as MechanismSheet,url:`art/vector/story-mechanisms/${name}.svg`,width:d.width,height:d.height,frame:'flag'in d&&flags[d.flag]?MECHANISM_FRAMES-1:0};
}
