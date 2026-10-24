import type { GameState } from '../../rules/state';

/** Story gating shared by both the interaction and its map marker. */
export function trainApproachBlock(s:Pick<GameState,'flags'>,diversion:boolean):string|undefined{
 const f=s.flags;
 if(!f.kitJoined)return 'Meet Kit at the loading gate first.';
 if(!f.trainRaidWon&&f.raidPlanned&&f.raidDiversion!==diversion)return `Our approach is the ${f.raidDiversion?'signal walk':'loading gate'}.`;
}
