import type { GameState } from '../../rules/state';
export const REGIONAL_FLAGS=['hammerplainComplete','dawnwatchComplete','windmereComplete'] as const;
export const completedAnchors=(s:Pick<GameState,'flags'>)=>REGIONAL_FLAGS.filter(f=>s.flags[f]).length;
