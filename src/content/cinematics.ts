import type { CharacterId } from './characters';
import type { Effect } from '../game/synth';

export interface StagePoint { x:number;y:number }
export interface StageActor { id:CharacterId;at:StagePoint;face?:string;hidden?:boolean }
export interface DocumentInsert { heading:string;lines:string[];stamp?:string;signature?:boolean;compare?:boolean }
export interface Shot {
  focus?:StagePoint;cut?:boolean;cue?:Effect;silence?:boolean;document?:DocumentInsert;
  actors?:Partial<Record<CharacterId,{to?:StagePoint;at?:StagePoint;face?:string;visible?:boolean}>>;
}
export interface Cinematic { id:string;title:string;actors:StageActor[] }
