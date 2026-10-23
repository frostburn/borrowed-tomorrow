import type { GameState,HeroId } from './state';

/** Illness is a story condition; ordinary HP/focus recovery cannot remove it. */
export const heroAvailable=(s:Pick<GameState,'flags'>,id:HeroId)=>id!=='nell'||!s.flags.nellIll||!!s.flags.nellRecovered;

/** Keep the chosen formation's size and companions, replacing Nell from reserve. */
export function sickenNell(s:GameState){
 if(s.flags.nellIll)return;
 const size=s.activeParty.length,others=s.activeParty.filter(id=>id!=='nell');
 if(!others.includes('kit'))others.unshift('kit');
 for(const h of s.party)if(others.length<size&&h.id!=='nell'&&!others.includes(h.id))others.push(h.id);
 s.activeParty=others.slice(0,size);
 s.flags.nellIll=true;
 const nell=s.party.find(h=>h.id==='nell')!;nell.hp=1;nell.focus=0;
}
