import type { MapId } from '../rules/state';
export const EMPEROR_WALK=['emperor-left','emperor-left-step-0','emperor-left','emperor-left-step-1'] as const;
/** Later scene poses load with their region, including deep restores/retries. */
export const cinematicAssets=(map:MapId)=>map==='conduit'
  ? [...new Set([...EMPEROR_WALK,'emperor-reach'])].map(key=>({key,url:`art/vector/${key}.svg`}))
  : map==='outermooring'?['nell-ill'].map(key=>({key,url:`art/vector/${key}.svg`})) : map==='airship'||map==='flagship'?['alban-command','nell-faint','nell-ill'].map(key=>({key,url:`art/vector/${key}.svg`})) : [];
