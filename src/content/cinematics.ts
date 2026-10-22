import type { CharacterId } from './characters';
import type { Effect } from '../game/synth';

export interface StagePoint { x:number;y:number }
export interface StageActor { id:CharacterId;at:StagePoint;face?:string;hidden?:boolean }
export interface DocumentInsert { heading:string;lines:string[];stamp?:string;signature?:boolean;compare?:boolean }
export interface Shot {
  duration?:number;
  track?:CharacterId;
  effect?:'fleet-sighting'|'survey-launch'|'feeds-close'|'vessel-entry'|'chamber-rupture';
  focus?:StagePoint;cut?:boolean;cue?:Effect;silence?:boolean;document?:DocumentInsert;
  omen?:'shard'|'sun'|'none';
  actors?:Partial<Record<CharacterId,{to?:StagePoint;at?:StagePoint;face?:string;visible?:boolean;fallen?:boolean}>>;
}
export interface Cinematic { id:string;title:string;actors:StageActor[] }
