import {objectPortrait} from './ui-art';
import { portraitAsset, speakerPortrait } from './characters';
import type { Cinematic, Shot } from './cinematics';
import type {PortraitExpression} from './portrait-expressions';

export interface Line { who: string; text: string; portrait?: string; expression?:PortraitExpression; shot?: Shot }
export interface Choice { label: string; disabled?:boolean; action: () => void }
export interface Dialogue { lines: Line[]; choices?: Choice[]; done?: () => void; scene?: Cinematic }
export type PortraitCue={portrait?:string;expression?:PortraitExpression};
export type StageCue=Shot&PortraitCue;
export const SAY = (who:string,text:string,cue?:string|PortraitCue):Line => {
 const {portrait,expression}=typeof cue==='string'?{portrait:cue}:cue??{};
 return {who,text,portrait:portrait?portraitAsset(portrait):speakerPortrait(who)??objectPortrait(who),...(expression?{expression}:{})};
};
/** Expression and camera direction share one authoring cue, but stay separate at runtime. */
export const STAGED=(who:string,text:string,cue?:StageCue):Line=>{
 if(!cue)return SAY(who,text);
 const {portrait,expression,...shot}=cue;
 return {...SAY(who,text,{portrait,expression}),shot};
};
