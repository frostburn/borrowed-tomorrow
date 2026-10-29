import type { MusicMode } from '../game/score';
import type { CharacterId } from './characters';
import type { Effect } from '../game/synth';

export interface StagePoint { x:number;y:number }
export interface StageActor { id:CharacterId;at:StagePoint;face?:string;hidden?:boolean;projection?:boolean }
export interface DocumentInsert { heading:string;lines:string[];stamp?:string;signature?:boolean;compare?:boolean }
export interface Shot {
  duration?:number;music?:MusicMode;
  track?:CharacterId;
  effect?:'raid-clear'|'raid-hound'|'raid-escort'|'raid-board'|'domain-withdraw'|'domain-break'|'domain-fragment'|'domain-release'|'capital-street'|'capital-fall'|'capital-thread'|'capital-horizon'|'lightbearer-rise'|'lightbearer-fall'|'river-launch'|'river-treatment'|'pact-seal'|'pact-break'|'pact-open'|'claim-omen'|'claim-strike'|'flagship-approach'|'capital-blockade'|'water-lift'|'ward-transfer'|'shelter-open'|'survey-board'|'fleet-sighting'|'survey-launch'|'feeds-close'|'vessel-transfer'|'chamber-rupture';
  focus?:StagePoint;cut?:boolean;cue?:Effect;silence?:boolean;document?:DocumentInsert;
  omen?:'shard'|'sun'|'none';
  actors?:Partial<Record<CharacterId,{to?:StagePoint;at?:StagePoint;face?:string;visible?:boolean;fallen?:boolean}>>;
}
export interface Cinematic { id:string;title:string;actors:StageActor[];hideCompanions?:boolean }
