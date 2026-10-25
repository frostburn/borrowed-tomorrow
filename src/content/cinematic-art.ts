import type { MapId } from '../rules/state';
export const NAMAR_CLOCK_FRAMES=Array.from({length:16},(_,i)=>`scene-six-namar-clock${i?'-'+i:''}`);
export const COURT_FOUNTAIN_FRAMES=Array.from({length:8},(_,i)=>`scene-six-palace-fountain${i?'-'+i:''}`);
export const EMPEROR_WALK=['emperor-left','emperor-left-step-0','emperor-left','emperor-left-step-1'] as const;
/** Later scene poses load with their region, including deep restores/retries. */
export const cinematicAssets=(map:MapId)=>map==='conduit'
  ? [...new Set([...EMPEROR_WALK,'emperor-reach'])].map(key=>({key,url:`art/vector/${key}.svg`}))
  : map==='sunpalace'?COURT_FOUNTAIN_FRAMES.map((key,i)=>({key,url:`art/vector/chapter-six/palace-fountain${i?'-'+i:''}.svg`}))
  : map==='namar'?NAMAR_CLOCK_FRAMES.map((key,i)=>({key,url:`art/vector/chapter-six/namar-clock${i?'-'+i:''}.svg`}))
  : (map==='outermooring'||map==='rainhouse')?(map==='outermooring'?['nell-ill','nell-bed']:[ 'nell-ill','nell-faint','kit-carry','petra-carry']).map(key=>({key,url:`art/vector/${key}.svg`})) : map==='airship'||map==='flagship'?['alban-command','nell-faint','nell-ill'].map(key=>({key,url:`art/vector/${key}.svg`})) : [];
